// 1.1.1 audit · Vật phẩm chờ xử lý / Thu hồi as ONE ledger transaction.
// The original 3.1 handlers (Giữ lại / Phân giải / Phân giải theo phẩm cấp / Giữ lại tất cả / Thu hồi) save in several steps: first the pending list or the
// bag, then the points or the bag row. A failed second save left the item deleted without its reward; Giữ lại tất cả could
// stock the bag and then fail to clear 待处理, so a reload and a second click doubled the reward.
// Here every button is planned against the item the player actually clicked (a JSON stamp taken at click time) and
// applied in a single locked, server-verified write (action-support checkedCommit). Either everything is booked or
// nothing is; a write whose result is unknown freezes the chat's ledger (Bridge transactions.uncertain).
import * as L from './ledger-ops.js';

export const ITEM_BUTTONS = '.btn-keep-item,.btn-decomp-item,.btn-decomp-grade,.btn-recycle-item,.btn-keep-all';
const num = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };
const qty = it => Math.max(1, Math.floor(num(it?.数量, 1)));
const stamp = x => JSON.stringify(x ?? null);
const label = it => `[${L.gradeLabel(it.品级 || '凡品')}] ${it.名称 || 'Vật phẩm chưa rõ'}`;

/** Original recycleValue: a tenth of the price (tier price when missing), at least 1. */
export function recycleValue(it) {
    const g = L.normGradeKey(it?.品级) || '凡品';
    return Math.max(1, Math.floor((num(it?.价格) || L.TIER_PRICE[g] || 100) / 10));
}
/** Original Giữ lại row: the fields the 3.1 handler copied, with the same defaults. */
export function keptItem(r) {
    const g = L.normGradeKey(r.品级) || '凡品';
    return { 名称: r.名称, 品级: g, 来源: r.来源 || 'Hộp mù', 价格: num(r.价格) || L.TIER_PRICE[g] || 100, 分类: r.分类 || '其他', 效果: r.效果 || '' };
}

/** Button → plan, read from the ledger as the player sees it. Pure apart from reading `button` / `doc`. */
export function planFromButton(button, z, doc) {
    const pending = Array.isArray(z?.待处理物品) ? z.待处理物品 : [], bag = Array.isArray(z?.背包) ? z.背包 : [];
    const idx = parseInt(button.dataset?.idx, 10);
    if (button.matches('.btn-keep-item') || button.matches('.btn-decomp-item')) {
        const it = pending[idx]; if (!it) throw Error('Vật phẩm chờ xử lý này không còn nữa, vui lòng làm mới danh sách.');
        return { kind: button.matches('.btn-keep-item') ? 'keep' : 'decomp', idx, stamp: stamp(it) };
    }
    if (button.matches('.btn-decomp-grade')) {
        const grade = L.normGradeKey(button.dataset?.grade), list = pending.filter(x => L.normGradeKey(x?.品级) === grade);
        if (!list.length) throw Error(`Trong danh sách chờ xử lý không còn vật phẩm ${L.gradeLabel(grade)} nào.`);
        return { kind: 'decompGrade', grade, stamp: stamp(list) };
    }
    if (button.matches('.btn-keep-all')) {
        if (!pending.length) throw Error('Danh sách vật phẩm chờ xử lý đang trống.');
        return { kind: 'keepAll', stamp: stamp(pending) };
    }
    if (button.matches('.btn-recycle-item')) {
        const it = bag[idx]; if (!it) throw Error('Trong túi đồ không còn vật phẩm này nữa, vui lòng làm mới danh sách.');
        const input = doc?.querySelector?.(`.recycle-n[data-idx="${idx}"]`);
        const n = Math.max(1, Math.min(qty(it), parseInt(input?.value, 10) || 1));
        return { kind: 'recycle', idx, n, stamp: stamp(it) };
    }
    throw Error('Thao tác vật phẩm không xác định');
}

/** Same row as at click time: the clicked index if unchanged, else the one identical row (never a look-alike). */
function locate(list, idx, want) {
    if (stamp(list[idx]) === want) return idx;
    const hits = list.reduce((a, x, i) => (stamp(x) === want ? [...a, i] : a), []);
    return hits.length ? hits[0] : -1;
}

/** Applies a plan to the ledger object `z` (inside the write). Throws → nothing is written. Returns a receipt. */
export function applyItemPlan(z, plan) {
    const pending = Array.isArray(z.待处理物品) ? z.待处理物品 : (z.待处理物品 = []);
    switch (plan.kind) {
        case 'keep': case 'decomp': {
            const i = locate(pending, plan.idx, plan.stamp);
            if (i < 0) throw Error('Vật phẩm chờ xử lý đã thay đổi (có thể đã được xử lý), lần này chưa thực hiện.');
            const it = pending.splice(i, 1)[0], n = qty(it);
            if (plan.kind === 'keep') { L.bagAdd(z, keptItem(it), n); return { title: 'Giữ lại', detail: label(it) + (n > 1 ? ' ×' + n : ''), gain: 0, kept: n }; }
            const gain = recycleValue(it) * n; L.earn(z, gain);
            return { title: '🧪 Phân giải', detail: label(it) + (n > 1 ? ' ×' + n : ''), gain };
        }
        case 'decompGrade': {
            const g = L.normGradeKey(plan.grade);
            const list = pending.filter(x => L.normGradeKey(x?.品级) === g);
            if (!list.length || stamp(list) !== plan.stamp) throw Error(`Vật phẩm ${L.gradeLabel(g)} chờ xử lý đã thay đổi, lần này chưa phân giải, vui lòng bấm lại.`);
            const gain = list.reduce((a, x) => a + recycleValue(x) * qty(x), 0), count = list.reduce((a, x) => a + qty(x), 0);
            z.待处理物品 = pending.filter(x => L.normGradeKey(x?.品级) !== g); L.earn(z, gain);
            return { title: '🧪 Phân giải', detail: `${L.gradeLabel(g)} ×${count}`, gain };
        }
        case 'keepAll': {
            if (!pending.length || stamp(pending) !== plan.stamp) throw Error('Vật phẩm chờ xử lý đã thay đổi, lần này chưa giữ lại, vui lòng bấm lại.');
            let count = 0;
            for (const it of pending) { L.bagAdd(z, keptItem(it), qty(it)); count += qty(it); }
            z.待处理物品 = [];
            return { title: 'Giữ lại tất cả', detail: `Đã đưa ${count} món vào túi đồ`, gain: 0, kept: count };
        }
        case 'recycle': {
            const bag = Array.isArray(z.背包) ? z.背包 : [], i = locate(bag, plan.idx, plan.stamp);
            if (i < 0) throw Error('Vật phẩm trong túi đồ đã thay đổi, lần này chưa thu hồi.');
            const it = L.bagTake(z, i, plan.n), gain = recycleValue(it) * plan.n; L.earn(z, gain);
            return { title: '♻️ Thu hồi', detail: label(it) + (plan.n > 1 ? ' ×' + plan.n : ''), gain };
        }
        default: throw Error('Thao tác vật phẩm không xác định');
    }
}
