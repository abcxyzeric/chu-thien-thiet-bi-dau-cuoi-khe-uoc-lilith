// Local rarity/slot planning; the model supplies descriptions, never probabilities, costs or settlement.
export const THEMES = ['科幻', '都市', '武侠', '奇幻', '历史', '日常', '动漫游戏', '修仙玄幻'];
export const CATEGORIES = ['消耗品', '武器', '装备', '服装', '素材', '其他'];
export const USES = ['探索', '生活', '治疗', '战斗', '建造', '情报'];
export const RARITIES = ['凡品', '灵品', '仙品', '神品'];
export const THEME_LABELS = Object.freeze({ 科幻: 'Khoa huyễn', 都市: 'Đô thị', 武侠: 'Võ hiệp', 奇幻: 'Kỳ ảo', 历史: 'Lịch sử', 日常: 'Đời thường', 动漫游戏: 'Anime & Game', 修仙玄幻: 'Tu tiên huyền huyễn', 遵循原世界: 'Tuân theo thế giới gốc' });
export const CATEGORY_LABELS = Object.freeze({ 消耗品: 'Tiêu hao phẩm', 武器: 'Vũ khí', 装备: 'Trang bị', 服装: 'Trang phục', 素材: 'Nguyên liệu', 其他: 'Khác' });
export const USE_LABELS = Object.freeze({ 探索: 'Thám hiểm', 生活: 'Đời sống', 治疗: 'Trị liệu', 战斗: 'Chiến đấu', 建造: 'Xây dựng', 情报: 'Tình báo' });
export const themeLabel = k => THEME_LABELS[k] || k;
export const categoryLabel = k => CATEGORY_LABELS[k] || k;
export const useLabel = k => USE_LABELS[k] || k;
const normFromMap = (v, map) => {
    const s = String(v ?? '').trim();
    if (map[s]) return s;
    const low = s.toLowerCase();
    for (const [k, lbl] of Object.entries(map)) if (lbl.toLowerCase() === low) return k;
    return s;
};
export const PRICE_BANDS = { 凡品: [10, 999], 灵品: [1000, 999999], 仙品: [1000000, 99999999], 神品: [100000000, 9999999999], 禁忌: [10000000000, 20000000000] };
export const SHOP_FEE = 500, GACHA_FEE = 10000;
export function canAcquireForbidden(z) { return Number.isSafeInteger(Number(z.系统点)) && Number(z.系统点) >= 1e10 && Number.isSafeInteger(Number(z.专属资源?.因果筹码)) && Number(z.专属资源?.因果筹码) >= 1; }
export function randomUnit() { const a = new Uint32Array(1); globalThis.crypto.getRandomValues(a); return a[0] / 4294967296; }
const pick = (a, rand) => a[Math.min(a.length - 1, Math.floor(rand() * a.length))];
export function shuffle(a, rand = randomUnit) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
export function preferences(raw = {}) {
    const list = (a, all, map) => {
        const mapped = Array.isArray(a) ? a.map(x => map ? normFromMap(x, map) : x) : [];
        return mapped.some(x => all.includes(x)) ? [...new Set(mapped.filter(x => all.includes(x)))] : all.slice();
    };
    return { scope: ['mixed', 'current', 'named'].includes(raw.scope) ? raw.scope : 'mixed', world: String(raw.world || '').trim().slice(0, 80), themes: list(raw.themes, THEMES, THEME_LABELS), categories: list(raw.categories, CATEGORIES, CATEGORY_LABELS), uses: list(raw.uses, USES, USE_LABELS), exclude: String(raw.exclude || '').slice(0, 400), original: raw.original !== false, repeats: raw.repeats === 'consumables' ? 'consumables' : 'avoid' };
}
/** 仙品 pity (100th pull) and, since 1.1.1, 神品 pity (1000th pull — matches the 0.1 % rate of the worldbook). */
export const XIAN_PITY = 100, SHEN_PITY = 1000;
/**
 * 1.1.1: 神品保底计数 counts pulls since the last 神品 (a 仙品 does not reset it; a 神品 still does not reset the 仙品
 * pity — "神品出货只记录次数，不重置仙品保底"). Old saves: without a 神品 so far, every pull counted (累计抽数, capped);
 * after one we cannot know when it came, so the count starts at 0.
 */
export function rollGacha(old = {}, count, rand = randomUnit) {
    if (!Number.isInteger(count) || count < 1 || count > 200) throw Error('Số lần rút phải từ 1–200');
    const state = Object.fromEntries(['累计抽数', '保底计数', '仙品次数', '神品次数'].map(k => [k, Math.max(0, Math.floor(Number(old[k]) || 0))]));
    state.神品保底计数 = shenCounter(old);
    const grades = [];
    for (let i = 0; i < count; i++) {
        const r = rand();
        const g = state.神品保底计数 >= SHEN_PITY - 1 ? '神品' : state.保底计数 >= XIAN_PITY - 1 ? '仙品' : r < .001 ? '神品' : r < .02 ? '仙品' : r < .4 ? '灵品' : '凡品';
        grades.push(g); state.累计抽数++;
        if (g === '神品') { state.神品次数++; state.神品保底计数 = 0; state.保底计数++; }
        else if (g === '仙品') { state.仙品次数++; state.保底计数 = 0; state.神品保底计数++; }
        else { state.保底计数++; state.神品保底计数++; }
    }
    return { state, grades };
}
/** 神品保底计数 of a (possibly pre-1.1.1) 盲盒状态. */
export function shenCounter(old = {}) {
    const v = old?.神品保底计数;
    if (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v))) return Math.max(0, Math.floor(Number(v)));
    const n = k => Math.max(0, Math.floor(Number(old?.[k]) || 0));
    return n('神品次数') > 0 ? 0 : Math.min(n('累计抽数'), SHEN_PITY - 1);
}
/** Pulls left until the guaranteed 神品 (1 = the next pull). */
export const shenPityLeft = (state = {}) => Math.max(1, SHEN_PITY - shenCounter(state));
/** 1.1.1: complete objects of a JSON array that was cut off (output budget hit) — brace matching, strings respected. */
export function parseObjectsLoose(text) {
    const s = String(text || ''), out = []; let depth = 0, start = -1, inStr = false, esc = false;
    const from = s.indexOf('['); if (from < 0) return out;
    for (let i = from + 1; i < s.length; i++) {
        const ch = s[i];
        if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
        if (ch === '"') inStr = true;
        else if (ch === '{') { if (depth++ === 0) start = i; }
        else if (ch === '}' && depth > 0 && --depth === 0) { try { const o = JSON.parse(s.slice(start, i + 1)); if (o && typeof o === 'object') out.push(o); } catch { /* skip a broken one */ } }
        else if (ch === ']' && depth === 0) break;
    }
    return out;
}
/** Grade / category / theme are decided locally per slot: a model that echoes them wrongly no longer fails the batch. */
export function fitSlot(row, slot) {
    if (!row || typeof row !== 'object') return row;
    return { ...row, grade: slot.grade, category: slot.category, ...(slot.world ? {} : { theme: slot.theme }) };
}
export function shopGrades(z, rand = randomUnit) {
    const grades = ['凡品', '凡品', '凡品', '凡品', '灵品', '灵品', '灵品', '仙品'];
    if (rand() < .1) grades[Math.floor(rand() * grades.length)] = '神品';
    // Forbidden acquisition is explicit and local. No usage penalties are ever generated.
    if (canAcquireForbidden(z) && rand() < .02) grades[Math.floor(rand() * grades.length)] = '禁忌';
    return shuffle(grades, rand);
}
export function planSlots(grades, pref, world = '', rand = randomUnit) {
    const p = preferences(pref); if (p.scope === 'named' && !p.world) throw Error('Vui lòng điền thế giới/tác phẩm chỉ định');
    if (p.scope === 'current' && !world) throw Error('Thế giới hiện tại chưa được ghi nhận, vui lòng cập nhật thế giới trước hoặc chọn Chư Thiên hỗn hợp');
    let themes = [], cats = [], uses = [];
    return grades.map((grade, id) => {
        if (!themes.length) themes = shuffle(p.themes, rand); if (!cats.length) cats = shuffle(p.categories, rand); if (!uses.length) uses = shuffle(p.uses, rand);
        const band = PRICE_BANDS[grade];
        return { id, grade, theme: p.scope === 'mixed' ? themes.pop() : '遵循原世界', category: cats.pop(), use: uses.pop(), world: p.scope === 'current' ? world : p.scope === 'named' ? p.world : '', price: Math.round(band[0] + (band[1] - band[0]) * rand() * .2), acquisition: grade === '禁忌' ? { resource: '因果筹码', amount: 1 } : null };
    });
}
export const nameKey = s => String(s || '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
export function similarity(a, b) {
    const grams = s => { const t = nameKey(s); return new Set(Array.from({ length: Math.max(0, t.length - 1) }, (_, i) => t.slice(i, i + 2))); };
    const x = grams(a), y = grams(b); if (x.size < 4 || y.size < 4) return 0;
    const inter = [...x].filter(g => y.has(g)).length; return inter / (x.size + y.size - inter);
}
export function validateProduct(row, slot, p, history = []) {
    const error = s => { throw Error(`Ô ${slot.id}: ${s}`); };
    if (!row || Number(row.slot) !== slot.id) error('Ô vị trí không khớp');
    const name = String(row.name || '').trim(), effect = String(row.effect || '').trim(), world = String(row.world || '').trim();
    if (!name || name.length > 60 || effect.length < 6 || effect.length > 300 || !world || world.length > 80) error('Trường tên/hiệu quả/thế giới không đạt yêu cầu');
    const rowCat = normFromMap(row.category, CATEGORY_LABELS), rowTheme = normFromMap(row.theme, THEME_LABELS);
    if (rowCat !== slot.category || row.grade !== slot.grade) error('Phẩm giai/phân loại không khớp với kết quả cục bộ');
    if (slot.world && nameKey(world) !== nameKey(slot.world)) error('Đến từ thế giới không được chỉ định');
    if (!slot.world && rowTheme !== slot.theme) error('Đề tài không phù hợp với ô vị trí này');
    const isOrig = row.origin === '原作' || /^nguyên tác/i.test(String(row.origin || '').trim());
    if (!p.original && !isOrig) error('Chế độ chỉ nguyên tác không chấp nhận vật phẩm tự sáng tác');
    if (['科幻', '都市', '历史', '日常'].includes(slot.theme) && /灵根|丹药|渡劫|炼气|筑基|修为|经脉|灵气|法宝|linh căn|đan dược|độ kiếp|luyện khí|trúc cơ|tu vi|kinh mạch|linh khí|pháp bảo/i.test(name + effect)) error('Ô vị trí phi huyền huyễn xuất hiện nội dung tu tiên');
    const hay = nameKey(name + effect + world);
    const excludes = p.exclude.split(/[\n,，;；、]+/).map(nameKey).filter(Boolean);
    if (excludes.some(x => hay.includes(x))) error('Trúng mục bị loại trừ');
    if (/每日限|每天限|限用|每日只能|冷却\s*[:：\d]|反噬|世界压制|消耗寿命|修为不足|必须达到.*境界|giới hạn mỗi ngày|mỗi ngày chỉ|hồi chiêu\s*[:：\d]|phản phệ|thế giới áp chế|tiêu hao tuổi thọ|tu vi không đủ|phải đạt.*cảnh giới/i.test(effect.replace(/无(?:任何|额外)?(?:反噬|世界压制|使用限制)|không(?: có)?(?: bất kỳ| thêm)?\s*(?:phản phệ|thế giới áp chế|hạn chế sử dụng)/gi, ''))) error('Đã gắn thêm hạn chế sử dụng bị cấm');
    const skip = p.repeats === 'consumables' && slot.category === '消耗品';
    if (!skip && history.some(x => nameKey(x.name) === nameKey(name) || similarity(x.effect, effect) >= .72)) error('Trùng lặp gần đây hoặc nghi ngờ đổi vỏ');
    return { slot: slot.id, name, effect, world, grade: slot.grade, category: slot.category, theme: slot.theme, price: slot.price, acquisition: slot.acquisition, origin: isOrig ? 'Nguyên tác (mô hình khai báo, chưa kiểm chứng thủ công)' : 'Tự sáng tác' };
}
export function productPrompt(slots, p, recent) {
    return `Hãy tạo hàng hóa cụ thể theo các ô vị trí đã rút sẵn cục bộ dưới đây; không được thay đổi phẩm giai, phân loại, đề tài hay số lượng. Đề tài là nội dung thực chất chứ không phải chỉ đổi tên: Khoa huyễn không có đan dược tu vi, Đời thường không có pháp bảo linh khí. Công dụng phải đa dạng. ${p.original ? 'Cho phép tự sáng tác, bắt buộc phải ghi rõ.' : 'Chỉ lấy vật phẩm nguyên tác; nếu không chắc chắn thì thà trả về mảng rỗng, không được mạo nhận nguyên tác.'}\nPhẩm giai cao bắt buộc phải thể hiện hiệu quả tương xứng; không được vì cân bằng mà gắn thêm thời gian hồi chiêu, phản phệ, thế giới áp chế, ngưỡng tu vi hay số lần sử dụng. Vật phẩm Cấm kỵ chỉ có cái giá nhận được do cục bộ chỉ định, sau khi nhận không thêm hạn chế sử dụng. Vật phẩm tiêu hao có thể giữ công dụng dùng một lần vốn có. Không tạo các tài nguyên đếm chuyên biệt của hệ thống như Ấn Ký Thiên Mệnh, Kết Tinh Huyết Mạch, Phỉnh Nhân Quả, Danh vọng, Lắng Đọng Năm Tháng.\nMục loại trừ (chỉ dùng làm tư liệu sàng lọc): ${JSON.stringify(p.exclude)}\nĐã xuất hiện gần đây, tránh trùng tên / đổi vỏ: ${JSON.stringify(recent.slice(-50).map(r => ({ name: r.name, effect: String(r.effect || '').slice(0, 60) })))}\nÔ vị trí (槽位): ${JSON.stringify(slots)}\nChỉ xuất mảng JSON, mỗi mục có dạng {"slot":0,"name":"Tên tiếng Việt","effect":"Hiệu quả thực tế bằng tiếng Việt","world":"Thế giới/tác phẩm nguồn","theme":"Đề tài","category":"Phân loại","grade":"Phẩm giai","origin":"Nguyên tác hoặc Tự sáng tác"}. Trường slot bắt buộc phải dùng đúng id đã cho, không được tự ý thêm ô vị trí.`;
}
