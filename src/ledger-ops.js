// Ledger operations for terminal modules (Nhóm chat, Phụ trợ tự tạo, …).
// Same semantics as the original 3.1 helpers (adjustSysPoints / bagAdd): points never go negative, spending raises
// 累计消费, identical rows (名称+品级+价格+来源+分类+效果) stack, anything else is its own row (1.1.1). Every commit is ONE locked write through the native Bridge followed by a read-back
// check; callers show success only after `commit` resolves (the rule is: never show Đã vào kho before it is booked).
export const GRADES = ['凡品', '灵品', '仙品', '神品', '禁忌'];
export const GRADE_LABELS = Object.freeze({ 凡品: 'Phàm phẩm', 灵品: 'Linh phẩm', 仙品: 'Tiên phẩm', 神品: 'Thần phẩm', 禁忌: 'Cấm kỵ', 待鉴定: 'Chờ giám định' });
export const GRADE_ALIASES = Object.freeze({
    '凡品': '凡品', 'phàm phẩm': '凡品', 'pham pham': '凡品', 'phàm giai': '凡品',
    '灵品': '灵品', 'linh phẩm': '灵品', 'linh pham': '灵品', 'linh giai': '灵品',
    '仙品': '仙品', 'tiên phẩm': '仙品', 'tien pham': '仙品', 'tiên giai': '仙品',
    '神品': '神品', 'thần phẩm': '神品', 'than pham': '神品', 'thần giai': '神品',
    '禁忌': '禁忌', 'cấm kỵ': '禁忌', 'cam ky': '禁忌',
    '待鉴定': '待鉴定', 'chờ giám định': '待鉴定', 'chưa giám định': '待鉴定',
});
export const normGradeKey = g => GRADE_ALIASES[String(g ?? '').trim()] || GRADE_ALIASES[String(g ?? '').trim().toLowerCase()] || String(g ?? '').trim();
export const gradeLabel = g => GRADE_LABELS[normGradeKey(g)] || String(g ?? '');
export const TIER_PRICE = { 凡品: 100, 灵品: 1e4, 仙品: 1e7, 神品: 1e8, 禁忌: 1e10 };
// Original ZT_TIERS (Thần thông Bậc thực lực): name, examples, price, highest grade that tier can carry.
export const TIERS = [null,
    { n: 'Đỉnh cao phàm nhân', p: 1e3, g: '凡品' }, { n: 'Võ đạo Tông sư', p: 1e4, g: '灵品' }, { n: 'Siêu phàm', p: 1e5, g: '灵品' },
    { n: 'Cấp thành phố', p: 1e6, g: '仙品' }, { n: 'Cấp quốc gia/đại lục', p: 1e7, g: '仙品' }, { n: 'Cấp hành tinh', p: 1e8, g: '神品' },
    { n: 'Cấp thiên hà trở lên', p: 1e9, g: '神品' }, { n: 'Cấp khái niệm/toàn năng', p: 1e11, g: '禁忌' }];
const num = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };

/** Original ztShopLevel (商城等级 1–5) from a ledger object. */
export function shopLevel(z) {
    if (!z || typeof z !== 'object') return 1;
    const r = z.专属资源 && typeof z.专属资源 === 'object' ? z.专属资源 : {};
    const pts = num(z.系统点), spent = Math.max(num(z.累计消费), pts), fame = num(r.名望), fate = num(r.天命印记);
    let s = 1;
    if (spent >= 1e5 || fame >= 1e3) s = 2;
    if (spent >= 1e7 || fame >= 1e4) s = 3;
    if (fate >= 3 && spent >= 1e8) s = 4;
    if (pts >= 1e10) s = 5;
    s = Math.max(s, Math.floor(num(z.商城等级下限)), Math.floor(num(z.商城等级)));
    return Math.max(1, Math.min(5, s));
}
export const gradeIndex = g => GRADES.indexOf(normGradeKey(g));
/** Highest grade allowed for something a group member hands over: ≤ shop level, ≤ member tier, never 禁忌. */
export function giftCap(z, tier) {
    const byShop = Math.min(shopLevel(z), 5) - 1;
    const byTier = gradeIndex((TIERS[Math.max(1, Math.min(8, tier | 0))] || TIERS[1]).g);
    return GRADES[Math.max(0, Math.min(byShop, byTier, 3))];
}
/** Clamp a grade down to the cap (auto-downgrade instead of refusing). Returns [grade, downgraded]. */
export function clampGrade(g, cap) {
    const k = normGradeKey(g), i = gradeIndex(k), c = gradeIndex(cap);
    if (i < 0) return ['凡品', false];
    return i > c ? [normGradeKey(cap), true] : [k, false];
}

export function ensureLedger(v) {
    const z = v.诸天系统; if (!z || typeof z !== 'object') throw Error('Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên, vui lòng tạo trước tại 「Cài đặt → Khởi tạo trò chuyện mới」.');
    return z;
}
export function spend(z, amount) {
    const a = Math.floor(num(amount)); if (a <= 0) return;
    const have = num(z.系统点);
    if (have < a) throw Error(`Điểm Hệ Thống không đủ: cần ${a.toLocaleString('en-US')}, hiện có ${have.toLocaleString('en-US')}. Chưa trừ phí.`);
    z.系统点 = Math.floor(have - a); z.累计消费 = num(z.累计消费) + a; z.界面记账时间 = Date.now();
}
export function earn(z, amount) {
    const a = Math.floor(num(amount)); if (a <= 0) return;
    z.系统点 = Math.floor(num(z.系统点) + a); z.界面记账时间 = Date.now();
}
/** 1.1.1 audit: what makes two bag rows the same thing. Name + grade alone merged a price-1 story 仙品 with a
 *  10,000,000-point blind-box 仙品 (the merged row kept one price, so 回收 paid the wrong amount). Rows now stack only
 *  when name, grade, price, source, category and effect are all equal; appraised / collected rows never stack. */
export function stackKey(item) {
    const s = v => String(v ?? '').trim();
    const g = normGradeKey(item?.品级) || '凡品';
    return JSON.stringify([s(item?.名称), g, Math.floor(num(item?.价格) || TIER_PRICE[g] || 100), s(item?.来源), s(item?.分类) || '其他', s(item?.效果)]);
}
export function bagAdd(z, item, n = 1) {
    const q = Math.max(1, Math.floor(num(n, 1)));
    const bag = Array.isArray(z.背包) ? z.背包 : (z.背包 = []);
    const g = normGradeKey(item?.品级) || '凡品';
    const normalizedItem = { ...item, 品级: g };
    const key = stackKey(normalizedItem);
    const hit = !item.收纳凭据 && !item.鉴定 && bag.find(x => !x.收纳凭据 && !x.鉴定 && stackKey(x) === key);
    if (hit) hit.数量 = num(hit.数量, 1) + q;
    else bag.push({ ...structuredClone(item), 名称: item.名称, 品级: g, 来源: item.来源 || '', 价格: item.价格 || 0, 分类: item.分类 || '其他', 效果: item.效果 || '', 数量: q });
}
/** Removes n of bag[index]; returns the removed item snapshot. */
export function bagTake(z, index, n = 1) {
    const bag = Array.isArray(z.背包) ? z.背包 : [];
    const it = bag[index]; if (!it) throw Error('Trong túi đồ không còn vật phẩm này nữa.');
    const q = Math.max(1, Math.floor(num(n, 1))), have = Math.max(1, num(it.数量, 1));
    if (have < q) throw Error(`「${it.名称}」 chỉ có ${have} cái.`);
    if (have === q) bag.splice(index, 1); else it.数量 = have - q;
    return { ...it, 数量: q };
}

/**
 * One locked write + read-back. `mutate(v, z)` changes the chat variables (throw to abort, nothing is written);
 * its return value is kept as `result`. `probe(z)` must return the same JSON before (inside the write) and after
 * (read back) — e.g. the new point balance and a receipt id — otherwise the commit is reported as not booked.
 */
export async function commit(bridge, mutate, probe = z => [z.系统点, z.界面记账时间], { expectedIdentity } = {}) {
    let result, want;
    await bridge.updateVariablesWith(v => {
        const z = ensureLedger(v);
        result = mutate(v, z);
        z.商城等级 = shopLevel(z);           // keep the derived field in step, like the original ztDerive does
        want = JSON.stringify(probe(z));
        return v;
    }, { type: 'chat', verify: true, expectedIdentity });
    const back = bridge.getVariables({ type: 'chat' })?.诸天系统;
    if (!back || JSON.stringify(probe(back)) !== want) throw Error('Đọc lại sổ cái không khớp: thao tác này chưa được xác nhận vào sổ. Vui lòng vào 「Cài đặt → Hoàn tác sổ cái」 để kiểm tra.');
    return result;
}
