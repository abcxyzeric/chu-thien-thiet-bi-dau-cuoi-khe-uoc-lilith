// Thế giới làm thay đổi giao diện (0.7.0).
// Thế giới mà Ký chủ đang ở được lấy từ sổ cái: `诸天系统.当前世界` / `诸天系统.世界类型`, do AI ghi thông qua
// dòng trong khối dữ liệu gốc 「变量更新: 当前世界=…；世界类型=…」 (ztVarOps gốc có thể đặt bất kỳ đường dẫn sổ cái nào), do
// trang Tinh đồ (Ghi nhận xuyên không), hoặc sửa thủ công trong bảng điều khiển quản trị viên gốc. Mô-đun này:
//   * phân loại thế giới thành chủ đề: xianxia Tiên hiệp (Ngọc giản · Tinh đồ · Trận văn) | cyber Cyber (Thiết bị đầu cuối toàn tức) | eerie Quỷ dị (Dị thường & xâm thực tiết chế)
//     | default Chư Thiên — chỉ dựa vào từ khóa, nếu có 世界类型 rõ ràng sẽ được ưu tiên, người dùng có thể ghim cố định chủ đề trong Cài đặt;
//   * đặt `data-zt-world` lên thiết bị đầu cuối (và iframe bộ máy) — CSS chỉ thay đổi bề mặt và họa tiết trang trí, không bao giờ làm thay đổi
//     vị trí của nút điều khiển;
//   * duy trì danh sách dấu chân `诸天系统.万界足迹` (tầng đầu tiên / gần nhất, số lần ghé thăm) cho Tinh đồ, được ghi thông qua cùng cơ chế
//     khóa commit + đọc ngược lại như mọi thao tác ghi khác trên thiết bị đầu cuối;
//   * nhắc mô hình (ghi chú hệ thống nhỏ, có thể bật/tắt) ghi 当前世界 / 世界类型 khi cốt truyện chuyển sang thế giới khác.
import { isPalette, shellCss, engineCss } from './palettes.js';
import * as L from './ledger-ops.js';

export const THEMES = Object.freeze({
    default: { label: 'Chư Thiên', badge: 'Thiết bị đầu cuối Chư Thiên', motif: 'Khế ước' },
    xianxia: { label: 'Tiên hiệp', badge: 'Ngọc giản', motif: 'Ngọc giản · Tinh đồ · Trận văn' },
    cyber: { label: 'Cyber', badge: 'Thiết bị đầu cuối toàn tức', motif: 'Toàn tức · Luồng dữ liệu' },
    eerie: { label: 'Quỷ dị', badge: 'Dị thường', motif: 'Dị thường · Xâm thực' },
});
const TYPE_WORDS = [
    ['xianxia', /(仙侠|修仙|修真|玄幻|仙域|洪荒|武侠|高武|东方玄幻|仙界|神话|封神|西游|tiên hiệp|tu tiên|tu chân|huyền huyễn|tiên vực|hồng hoang|võ hiệp|cao võ|tiên giới|thần thoại|phong thần|tây du)/i],
    ['cyber', /(赛博|科幻|星际|未来|机甲|末日废土|废土|赛博朋克|太空|银河|义体|AI纪元|虚拟现实|网游|cyber|khoa huyễn|tinh tế|tương lai|cơ giáp|phế thổ|cyberpunk|vũ trụ|ngân hà|nghĩa thể|thực tế ảo|võng du)/i],
    ['eerie', /(诡异|怪谈|规则怪谈|克苏鲁|恐怖|灵异|惊悚|鬼|邪神|深渊|无限流恐怖|诡|quỷ dị|quái đàm|cthulhu|kinh dị|linh dị|ma quỷ|tà thần|vực sâu)/i],
];
const NAME_WORDS = [
    ['xianxia', /(仙|宗|道|灵|天庭|太初|太虚|昆仑|蓬莱|九州|大荒|修|剑|神州|洞天|界域|玄|魔域|妖|斗气|斗罗|遮天|凡人|诛仙|完美世界|tiên|tông|đạo|linh|thiên đình|thái sơ|thái hư|côn lôn|bồng lai|cửu châu|đại hoang|kiếm|thần châu|động thiên|giới vực|huyền|ma vực|yêu|đấu khí|đấu la|già thiên|phàm nhân|tru tiên|hoàn mỹ thế giới)/i],
    ['cyber', /(赛博|夜之城|2077|新东京|霓虹|义体|联邦|星舰|殖民|基地|数据|矩阵|黑客|机械|赛区|星港|银翼|攻壳|量子|cyber|night city|dạ chi thành|tân tokyo|neon|nghĩa thể|liên bang|tinh hạm|thuộc địa|căn cứ|dữ liệu|ma trận|hacker|cơ giới|cảng sao|lượng tử)/i],
    ['eerie', /(诡|怪谈|雾|鬼|邪|阴|尸|冥|血月|寂静岭|禁区|规则|收容|SCP|回廊|旧日|深潜|克苏鲁|午夜|凶宅|无人|quỷ|quái đàm|sương mù|tà|âm|thi|minh|huyết nguyệt|silent hill|khu cấm|quy tắc|thu dung|hành lang|cựu nhật|cthulhu|nửa đêm|nhà hoang)/i],
];
const CURRENCY_WORDS = [
    ['xianxia', /(灵石|仙晶|元石|灵玉|贡献点|两|文|铜钱|linh thạch|tiên tinh|nguyên thạch|linh ngọc|điểm cống hiến|lượng bạc|đồng tiền)/i],
    ['cyber', /(信用点|欧元|电子|比特|算力|点数币|€\$|新元|tín dụng|điểm tín dụng|euro|bit|toán lực)/i],
    ['eerie', /(冥币|纸钱|寿命|理智|SAN|魂|tiền âm phủ|tiền giấy|tuổi thọ|lý trí|linh hồn)/i],
];

/** Pure: theme id for a world. Explicit 世界类型 first, then the world name, then the currency. */
export function classifyWorld({ type = '', name = '', currency = '' } = {}) {
    const t = String(type || ''), n = String(name || ''), c = String(currency || '');
    for (const [id, re] of TYPE_WORDS) if (re.test(t)) return id;
    if (/(都市|现代|西幻|魔幻|末世|历史|宫斗|校园|其他|đô thị|hiện đại|tây huyễn|ma ảo|mạt thế|lịch sử|cung đấu|học đường|khác)/i.test(t)) return 'default';
    for (const [id, re] of NAME_WORDS) if (re.test(n)) return id;
    for (const [id, re] of CURRENCY_WORDS) if (re.test(c)) return id;
    return 'default';
}
const clean = s => String(s ?? '').replace(/[\u0000-\u001f<>{}]/g, '').trim().slice(0, 40);

/** Pure: footprint list after arriving in `name` at floor `floor`. Returns a new array (max 40, newest last). */
export function recordFootprint(list, { name, type = '', theme = 'default', floor = null, t = Date.now() }) {
    const out = (Array.isArray(list) ? list : []).filter(x => x && x.名称).map(x => ({ ...x }));
    const n = clean(name); if (!n) return out;
    const hit = out.find(x => x.名称 === n);
    if (hit) { hit.次数 = (Number(hit.次数) || 1) + 1; hit.最近楼层 = floor ?? hit.最近楼层 ?? null; hit.最近 = t; if (type) hit.类型 = clean(type); hit.主题 = theme; out.splice(out.indexOf(hit), 1); out.push(hit); }
    else out.push({ 名称: n, 类型: clean(type), 主题: theme, 首次楼层: floor ?? null, 最近楼层: floor ?? null, 次数: 1, 首次: t, 最近: t });
    while (out.length > 40) out.shift();
    return out;
}

/** 0.9.3 Pure: footprint list after correcting a wrongly detected world `from` → `{ name, type, theme }`. No visit is
 *  counted. When the corrected name already has its own footprint the two records merge (visits add up, the earlier
 *  first visit and the later last visit are kept). Returns a new array; a world without a footprint leaves it as is. */
export function correctFootprint(list, from, { name, type = '', theme = 'default' }) {
    const out = (Array.isArray(list) ? list : []).filter(x => x && x.名称).map(x => ({ ...x }));
    const f = clean(from), n = clean(name) || f, ty = clean(type);
    const hit = out.find(x => clean(x.名称) === f); if (!hit) return out;
    const twin = n !== f ? out.find(x => x !== hit && clean(x.名称) === n) : null;
    if (twin) {
        const first = num(hit.首次, Infinity) <= num(twin.首次, Infinity) ? hit : twin, last = num(hit.最近, 0) >= num(twin.最近, 0) ? hit : twin;
        twin.次数 = (Number(hit.次数) || 1) + (Number(twin.次数) || 1);
        twin.首次 = first.首次; twin.首次楼层 = first.首次楼层 ?? null; twin.最近 = last.最近; twin.最近楼层 = last.最近楼层 ?? null;
        twin.类型 = ty; twin.主题 = theme;
        out.splice(out.indexOf(hit), 1);
        return out;
    }
    hit.名称 = n; hit.类型 = ty; hit.主题 = theme;
    return out;
}
/** 0.9.3 Pure: footprint list without `name`. */
export function forgetFootprint(list, name) {
    const n = clean(name);
    return (Array.isArray(list) ? list : []).filter(x => x && x.名称 && clean(x.名称) !== n).map(x => ({ ...x }));
}
const num = (v, d) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : d);
export const WORLD_TYPES = Object.freeze(['Tiên hiệp', 'Cyber', 'Quỷ dị', 'Đô thị', 'Tây huyễn', 'Mạt thế', 'Khác']);

export const WORLD_PROMPT_ID = 'world';
export function worldPrompt(z) {
    const w = clean(z?.当前世界) || 'Chưa ghi nhận', ty = clean(z?.世界类型) || 'Chưa ghi nhận';
    return `【Thiết Bị Đầu Cuối Chư Thiên · Ghi nhận thế giới】Thế giới hiện tại: ${w} (Loại: ${ty}). Khi Ký chủ xuyên không sang thế giới mới, hoặc cốt truyện hé lộ rõ ràng thế giới đang ở, hãy viết một dòng vào mục 「变量更新」 (hoặc 「Cập nhật biến」) trong khối dữ liệu lượt này: 当前世界=Tên_thế_giới；世界类型=Tiên hiệp/Cyber/Quỷ dị/Đô thị/Tây huyễn/Mạt thế/Khác (chọn một). Khi thế giới không thay đổi thì đừng viết hai mục này.`;
}

export class World {
    constructor(app) { this.app = app; this.theme = 'default'; this.disposers = []; this.last = null; }
    get settings() { return this.app.settings; }
    ledger() { try { const z = this.app.bridge.getVariables({ type: 'chat' })?.诸天系统; return z && typeof z === 'object' ? z : null; } catch { return null; } }
    start() {
        this.disposers.push(this.app.bridge.onChange(k => { if (k === 'chat') this.sync(); }));
        this.disposers.push(this.app.adapter.subscribe(() => this.sync()));
        this.disposers.push(this.settings.onChange(k => { if (k === 'world' || k === 'palette') this.sync(true); }));
        this.app.hub?.hook?.('onEngine', (frame, doc) => this.paintDoc(doc));
        this.sync(true);
        return this;
    }
    current(z = this.ledger()) {
        const pin = this.settings.get('world')?.theme || 'auto';
        const name = clean(z?.当前世界), type = clean(z?.世界类型), currency = clean(z?.当前货币);
        const auto = classifyWorld({ type, name, currency });
        return { name, type, currency, auto, theme: pin !== 'auto' && THEMES[pin] ? pin : auto, pinned: pin !== 'auto' };
    }
    sync(force = false) {
        const idn = this.app.adapter.currentIdentity(), z = idn ? this.ledger() : null, cur = this.current(z);
        const eff = this.settings.get('world')?.enabled === false ? 'default' : cur.theme;
        if (force || eff !== this.theme) { this.theme = eff; this.apply(); }
        this.prompt(z);
        // Footprints: only for a real change inside the same chat (not on chat switch / first read — the 星图 shows the
        // current world even when it has no footprint yet, so opening an old chat never writes).
        if (this.lastIdn === idn && cur.name && this.lastName !== cur.name && z && cur.name !== this.traveling) {
            // 世界类型 belongs to the world it was written with: a world change that kept the old type makes it stale.
            const stale = !!cur.type && cur.type === this.lastType;
            if (stale) { cur.type = ''; cur.auto = classifyWorld({ name: cur.name, currency: cur.currency }); if (!cur.pinned) { this.theme = cur.auto; this.apply(); } }
            this.footprint(cur, stale).catch(e => console.warn('[Thế Giới Chư Thiên] Chưa ghi nhận được dấu chân', e));
        }
        this.lastIdn = idn; this.lastName = cur.name; this.lastType = cur.type;
    }
    /** 0.8.4 配色方案: a fixed palette overrides the world colours (decorations stay with the world). */
    palette() { const p = this.settings.get('palette'); return isPalette(p) ? p : ''; }
    /** The attribute value: with a palette on the default world, 'plain' switches on the variable-driven surfaces of
     *  world.css (the default world otherwise keeps the original Lilith colours, which a palette must override). */
    attrWorld() { return this.palette() && this.theme === 'default' ? 'plain' : this.theme; }
    paletteCss(shadow) {
        if (!shadow || shadow.getElementById?.('zt-palette-css')) return;
        const st = document.createElement('style'); st.id = 'zt-palette-css'; st.textContent = shellCss(); shadow.append(st);
    }
    paintDoc(doc) {
        const el = doc?.documentElement; if (!el) return;
        if (!doc.getElementById('zt-palette-css')) { const st = doc.createElement('style'); st.id = 'zt-palette-css'; st.textContent = engineCss(); (doc.head || el).append(st); }
        el.dataset.ztWorld = this.attrWorld();
        const p = this.palette(); if (p) el.dataset.ztPalette = p; else delete el.dataset.ztPalette;
    }
    apply() {
        const t = this.attrWorld(), p = this.palette(), host = this.app.hub?.shadow?.host || this.app.assistant?.hostElement;
        this.paletteCss(this.app.hub?.shadow || this.app.assistant?.shadow);
        host?.setAttribute?.('data-zt-world', t);
        if (p) host?.setAttribute?.('data-zt-palette', p); else host?.removeAttribute?.('data-zt-palette');
        this.paintDoc(this.app.hub?.engineFrame?.contentDocument);
        const out = document.getElementById('zhutian-fx-host'); if (out) { out.dataset.ztWorld = t; if (p) out.dataset.ztPalette = p; else delete out.dataset.ztPalette; }
        this.app.hub?.refreshTop?.();
    }
    floor() { const c = this.app.adapter.context(); return Math.max(0, (c.chat?.length || 1) - 1); }
    async footprint(cur, clearType = false) {
        const floor = this.floor();
        await L.commit(this.app.bridge, (v, z) => {
            if (clean(z.当前世界) !== cur.name) return;          // the world moved on meanwhile: nothing to record
            const list = Array.isArray(z.万界足迹) ? z.万界足迹 : [];
            if (list.at(-1)?.名称 === cur.name && list.at(-1)?.最近楼层 === floor) return;
            if (clearType) z.世界类型 = '';
            z.万界足迹 = recordFootprint(list, { name: cur.name, type: cur.type, theme: cur.auto, floor });
        }, z => [z.当前世界, z.世界类型 || '', (z.万界足迹 || []).length, JSON.stringify((z.万界足迹 || []).at(-1) || null)]);
    }
    /** 星图 → 记录穿越: writes 当前世界 (+类型) and the footprint in one commit; the 穿越 performance follows the read-back. */
    async travel(name, type = '') {
        const n = clean(name); if (!n) throw Error('Vui lòng điền tên thế giới.');
        const floor = this.floor(), theme = classifyWorld({ type, name: n });
        this.traveling = n;
        let out;
        try { out = await L.commit(this.app.bridge, (v, z) => {
            const from = clean(z.当前世界);
            if (from === n) throw Error('Bạn đang ở thế giới này rồi.');
            z.当前世界 = n; z.世界类型 = clean(type);          // no type given → the old world's type does not carry over
            z.万界足迹 = recordFootprint(z.万界足迹, { name: n, type, theme, floor });
            return { from };
        }, z => [z.当前世界, z.世界类型 || '', (z.万界足迹 || []).length]); } finally { this.traveling = null; }
        this.lastName = n; this.lastType = clean(type);
        return { from: out.from, to: n, type };
    }
    /** 星图 → 更正 (0.9.3): the AI or the name guess got the world wrong. Rewrites 当前世界 / 世界类型 (when it is the
     *  current world) and its footprint in one locked commit + read-back. Not a 穿越: no visit, no performance. */
    async correct(from, { name = '', type = '' } = {}) {
        const f = clean(from); if (!f) throw Error('Chưa chọn thế giới nào.');
        const n = clean(name) || f, ty = clean(type);
        const theme = classifyWorld({ type: ty, name: n });
        this.traveling = n;
        let out;
        try { out = await L.commit(this.app.bridge, (v, z) => {
            const isCur = clean(z.当前世界) === f, list = Array.isArray(z.万界足迹) ? z.万界足迹 : [];
            if (!isCur && !list.some(x => clean(x?.名称) === f)) throw Error('Trong sổ cái đã không còn thế giới này nữa (có thể vừa mới bị sửa), vui lòng chọn lại.');
            if (isCur) { z.当前世界 = n; z.世界类型 = ty; }
            z.万界足迹 = correctFootprint(list, f, { name: n, type: ty, theme });
            return { current: isCur };
        }, z => [z.当前世界, z.世界类型 || '', JSON.stringify(z.万界足迹 || [])]); } finally { this.traveling = null; }
        if (out.current) { this.lastName = n; this.lastType = ty; try { this.app.fx?.drop?.('travel'); } catch { /* fx optional */ } }
        return { from: f, to: n, type: ty, theme, current: out.current };
    }
    /** 星图 → 从足迹删除 (0.9.3): a world that was never really visited. The current world cannot be deleted (correct it). */
    async forget(name) {
        const n = clean(name); if (!n) throw Error('Chưa chọn thế giới nào.');
        await L.commit(this.app.bridge, (v, z) => {
            if (clean(z.当前世界) === n) throw Error('Đây là thế giới hiện tại, không thể xóa; nếu nhận diện sai vui lòng dùng 「Lưu đính chính」 để đổi tên hoặc đổi loại.');
            const list = Array.isArray(z.万界足迹) ? z.万界足迹 : [];
            if (!list.some(x => clean(x?.名称) === n)) throw Error('Trong dấu chân đã không còn thế giới này nữa.');
            z.万界足迹 = forgetFootprint(list, n);
        }, z => [z.当前世界, JSON.stringify(z.万界足迹 || [])]);
        return { name: n };
    }
    prompt(z) {
        const b = this.app.bridge, on = this.settings.get('world')?.prompt !== false && !!z;
        try { if (on) b.injectPrompts([{ id: WORLD_PROMPT_ID, content: worldPrompt(z), position: 'in_chat', depth: 4, role: 'system' }]); else b.uninjectPrompts([WORLD_PROMPT_ID]); } catch { /* host without injection */ }
    }
    dispose() {
        this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } });
        try { this.app.bridge.uninjectPrompts([WORLD_PROMPT_ID]); } catch { /* ignore */ }
        const h = this.app.hub?.shadow?.host || this.app.assistant?.hostElement; h?.removeAttribute?.('data-zt-world'); h?.removeAttribute?.('data-zt-palette');
    }
}
