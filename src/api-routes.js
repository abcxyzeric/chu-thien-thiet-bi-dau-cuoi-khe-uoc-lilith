// 1.0 · API theo tính năng và Thiết lập sẵn cổng kết nối.
// Phản hồi từ người chơi: "Cứ phải đổi cổng trạm miễn phí liên tục phiền quá" — chỉ có một kết nối cho mọi thứ khiến mỗi lần
// trạm trung chuyển chết lại phải gõ lại URL / key / model, đồng thời các tác vụ nặng (rút thẻ, nhóm chat) và tác vụ nhẹ (trò chuyện riêng với Lilith) không thể dùng các mô hình khác nhau.
//
//   * Thiết lập sẵn (Preset) — bản sao có đặt tên của { url, key, model }. Chỉ lưu được khi có tên (nút lưu sẽ khóa cho đến khi nhập tên).
//   * Theo tính năng — mọi nơi gọi mô hình đều có thể đi theo kết nối mặc định (hành vi giữ nguyên), dùng mô hình
//     SillyTavern đang kết nối, dùng một thiết lập sẵn, hoặc giữ cấu hình riêng của mình.
//
// Lưu trữ: biến toàn cục 诸天系统_API路由 (extension_settings.variables.global, nằm cạnh 诸天系统_API mặc định vốn đã
// giữ khóa API). Biến toàn cục không bao giờ bị xuất ra (data-io), không bao giờ nằm trong báo cáo chẩn đoán hay tệp trò chuyện.
// Việc định tuyến diễn ra ngay lúc yêu cầu được gửi đi: th-bridge.generateRaw (thanh trạng thái, nhóm chat, giám định phẩm giai) và
// fetch của trợ lý (assistant-host: trò chuyện riêng / ký ức / bàn làm việc). Mã gốc không bị thay đổi — nó vẫn tạo yêu cầu từ
// kết nối mặc định, và yêu cầu sẽ được trỏ sang cấu hình định tuyến ngay trước khi gửi đi.

export const ROUTES_KEY = '诸天系统_API路由';
export const MAX_PRESETS = 30;
export const MAIN = '@main';
/** [id, label, who uses the default today, desc]. `base` = which default connection a feature follows. */
export const ROUTES = Object.freeze([
    { id: 'shop', label: 'Nhập hàng Thương thành', base: 'status', group: 'Thanh trạng thái', desc: 'Thương Thành Vạn Giới 「AI Nhập hàng」' },
    { id: 'gacha', label: 'Rút thẻ / Hộp mù', base: 'status', group: 'Thanh trạng thái', desc: 'Tạo phần thưởng khi rút hộp mù' },
    { id: 'wish', label: 'Ước nguyện', base: 'status', group: 'Thanh trạng thái', desc: 'Định giá và phán định Hồ Ước Nguyện' },
    { id: 'recruit', label: 'Chiêu mộ Tay đấm', base: 'status', group: 'Thanh trạng thái', desc: 'Thẻ chiêu mộ Tay Đấm Chư Thiên' },
    { id: 'bag', label: 'Sắp xếp Túi đồ / Lò Vạn Vật', base: 'status', group: 'Thanh trạng thái', desc: 'Phân loại túi đồ, bổ sung mô tả và dung luyện' },
    { id: 'assess', label: 'Đánh giá Chiến lực', base: 'status', group: 'Thanh trạng thái', desc: 'Đánh giá bậc năng lực' },
    { id: 'appraise', label: 'Giám định Phẩm giai', base: 'status', group: 'Thiết bị đầu cuối', desc: 'Phán định lại phẩm giai công pháp / vật phẩm nhận được trong cốt truyện' },
    { id: 'group', label: 'Nhóm Chat Chư Thiên', base: 'status', group: 'Thiết bị đầu cuối', desc: 'Trò chuyện nhóm, nhắn riêng thành viên, lệnh chiêu mộ, giáng lâm, treo đơn' },
    { id: 'panel', label: 'Ghi bù Khối dữ liệu', base: 'status', group: 'Thiết bị đầu cuối', desc: 'Khi phản hồi thiếu khối dữ liệu, dựa theo chính văn lượt này viết bù một lần (1.1.1)' },
    { id: 'chat', label: 'Trò chuyện riêng Lilith', base: 'assistant', group: 'Lilith', desc: 'Trò chuyện riêng với Lilith' },
    { id: 'memory', label: 'Ký ức tự động Lilith', base: 'assistant', group: 'Lilith', desc: 'Mỗi lượt tổng hợp Ký ức Chư Thiên' },
    { id: 'workbench', label: 'Bàn làm việc Lilith', base: 'assistant', group: 'Lilith', desc: 'Phân tích, quy hoạch, rà soát đề xuất' },
]);
const IDS = new Set(ROUTES.map(r => r.id));
export const routeLabel = id => ROUTES.find(r => r.id === id)?.label || id;

/** The status bar's model calls, told apart by the system prompt each of them sends (statusbar 3.1, sysFetchAPI). */
const STATUS_PROMPTS = Object.freeze({
    '只输出规定的格式列表，不要任何废话。': 'shop',
    'Chỉ xuất danh sách theo định dạng quy định, không nói lời thừa.': 'shop',
    'Chỉ xuất ra danh sách đúng định dạng quy định, không nói lời thừa.': 'shop',
    '你是诸天系统的奖励生成器，严格遵守格式。': 'gacha',
    'Bạn là trình tạo phần thưởng của Hệ Thống Chư Thiên, tuân thủ nghiêm ngặt định dạng.': 'gacha',
    '严格执行格式要求': 'wish',
    'Thực hiện nghiêm ngặt yêu cầu định dạng': 'wish',
    '你是诸天万界的招募官。': 'recruit',
    'Bạn là quan chiêu mộ của Chư Thiên Vạn Giới.': 'recruit',
    '你是背包整理助手，严格遵守格式。': 'bag',
    'Bạn là trợ lý sắp xếp túi đồ, tuân thủ nghiêm ngặt định dạng.': 'bag',
    '严格只输出一行': 'bag',
    'Chỉ xuất đúng một dòng': 'bag',
    'Chỉ xuất ra đúng 1 dòng bằng tiếng Việt': 'bag',
    '严格执行格式要求，只输出一行': 'assess',
    'Thực hiện nghiêm ngặt yêu cầu định dạng, chỉ xuất một dòng': 'assess',
    'Thực hiện nghiêm ngặt yêu cầu định dạng, chỉ xuất ra 1 dòng bằng tiếng Việt': 'assess',
});
/** Which feature a status-bar request belongs to ('' = unknown / the connection test → default). Pure. */
export function classifyStatus(system) { return STATUS_PROMPTS[String(system || '').trim()] || ''; }
/** Which Lilith job an assistant request is (v1.1 assistant: memory recorder / workbench / private chat). Pure. */
export function classifyAssistant(messages) {
    const list = Array.isArray(messages) ? messages : [];
    // the original 连接 → 测试连接 sends one user line「只回复：成功」: it tests the DEFAULT connection, never a route
    if (list.length === 1 && list[0]?.role === 'user' && (/^(只回复|回复两个字)：成功$/.test(String(list[0].content || '').trim()) || /^(Chỉ trả lời|Trả lời hai chữ)[:：]\s*Thành công$/i.test(String(list[0].content || '').trim()))) return '';
    const sys = list.find(m => m?.role === 'system')?.content;
    const s = typeof sys === 'string' ? sys : '';
    if (s.startsWith('你是诸天系统外挂世界书的事实记录员') || s.startsWith('Bạn là nhân viên ghi chép sự thật cho Sách Thế Giới ngoại vi của Hệ Thống Chư Thiên')) return 'memory';
    if (s.startsWith('你是诸天系统的独立助手莉莉丝') || s.startsWith('Bạn là trợ lý độc lập Lilith của Hệ Thống Chư Thiên')) return 'workbench';
    return 'chat';
}

const str = (v, n) => String(v ?? '').trim().slice(0, n);
/** A preset / own config, cleaned (pure). Returns null when it has no address. */
export function cleanConfig(c) {
    if (!c || typeof c !== 'object') return null;
    const out = { url: str(c.url, 300), key: str(c.key, 400), model: str(c.model, 150) };
    if (!out.url) return null;
    const n = Number(c.maxTokens); if (Number.isInteger(n) && n >= 64 && n <= 65536) out.maxTokens = n;
    return out;
}
export function cleanName(name) { return String(name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24); }
/** The stored object, normalised (pure). Unknown routes / broken presets are dropped, never thrown. */
export function normalizeStore(raw) {
    const s = raw && typeof raw === 'object' ? raw : {};
    const presets = [], seen = new Set();
    for (const p of Array.isArray(s.presets) ? s.presets : []) {
        const name = cleanName(p?.name), c = cleanConfig(p);
        if (!name || !c || seen.has(name)) continue; seen.add(name); presets.push({ name, ...c });
        if (presets.length >= MAX_PRESETS) break;
    }
    const routes = {};
    for (const [id, v] of Object.entries(s.routes && typeof s.routes === 'object' ? s.routes : {})) {
        if (!IDS.has(id)) continue;
        if (v === MAIN) routes[id] = MAIN;
        else if (typeof v === 'string' && v.startsWith('preset:') && cleanName(v.slice(7))) routes[id] = 'preset:' + cleanName(v.slice(7));
        else if (v && typeof v === 'object') { const c = cleanConfig(v); if (c) routes[id] = c; }
    }
    return { v: 1, presets, routes };
}
/** Save (or replace) a named preset (pure). A name is required. */
export function withPreset(store, name, cfg) {
    const s = normalizeStore(store), n = cleanName(name), c = cleanConfig(cfg);
    if (!n) throw Error('Vui lòng nhập tên thiết lập sẵn trước khi lưu.');
    if (!c) throw Error('Vui lòng điền địa chỉ cổng API trước.');
    const i = s.presets.findIndex(p => p.name === n);
    if (i < 0 && s.presets.length >= MAX_PRESETS) throw Error(`Tối đa ${MAX_PRESETS} thiết lập sẵn, vui lòng xóa bớt mục không dùng trước.`);
    if (i >= 0) s.presets[i] = { name: n, ...c }; else s.presets.push({ name: n, ...c });
    return s;
}
/** Delete a preset; features that used it go back to the default connection (pure). */
export function withoutPreset(store, name) {
    const s = normalizeStore(store), n = cleanName(name);
    s.presets = s.presets.filter(p => p.name !== n);
    for (const [id, v] of Object.entries(s.routes)) if (v === 'preset:' + n) delete s.routes[id];
    return s;
}
/** Point one feature somewhere: '' (default) | MAIN | 'preset:<name>' | { url, key, model } (pure). */
export function withRoute(store, id, value) {
    if (!IDS.has(id)) throw Error('Tính năng không xác định: ' + id);
    const s = normalizeStore(store);
    if (!value) delete s.routes[id];
    else if (value === MAIN) s.routes[id] = MAIN;
    else if (typeof value === 'string' && value.startsWith('preset:')) {
        const n = cleanName(value.slice(7)); if (!s.presets.some(p => p.name === n)) throw Error(`Không có thiết lập sẵn nào tên là 「${n}」.`);
        s.routes[id] = 'preset:' + n;
    } else { const c = cleanConfig(value); if (!c) throw Error('Vui lòng điền địa chỉ cổng API trước.'); s.routes[id] = c; }
    return s;
}
/**
 * What a feature actually uses (pure). null → follow the default connection (unchanged behaviour).
 * { main: true } → the model SillyTavern is connected to. Otherwise { url, key, model, maxTokens?, via }.
 * A route to a deleted preset falls back to the default (and says so in `missing`).
 */
export function resolveRoute(store, id) {
    const s = normalizeStore(store), v = s.routes[id];
    if (!v) return null;
    if (v === MAIN) return { main: true, via: 'API chính hiện tại của Quán Rượu' };
    if (typeof v === 'string') {
        const n = v.slice(7), p = s.presets.find(x => x.name === n);
        if (!p) return null;
        const { name, ...c } = p; return { ...c, via: `Thiết lập sẵn 「${name}」` };
    }
    return { ...v, via: 'Cấu hình riêng' };
}
/** Short, key-free description of where a feature goes (pure; for the table and the diagnostics). */
export function routeText(store, id) {
    const s = normalizeStore(store), v = s.routes[id];
    const host = c => { try { return new URL(c.url).host + (c.model ? ' · ' + c.model : ''); } catch { return 'Không thể phân giải địa chỉ'; } };
    if (!v) return 'Theo mặc định';
    if (v === MAIN) return 'API chính hiện tại của Quán Rượu';
    if (typeof v === 'string') { const p = s.presets.find(x => x.name === v.slice(7)); return p ? `Thiết lập sẵn 「${p.name}」 · ${host(p)}` : `Thiết lập sẵn 「${v.slice(7)}」 đã xóa → Theo mặc định`; }
    return 'Cấu hình riêng · ' + host(v);
}

// ---------- storage (through the native Bridge, global variables) ----------
export function readRoutes(bridge) {
    try { return normalizeStore(bridge.getVariables({ type: 'global' })?.[ROUTES_KEY]); } catch { return normalizeStore(null); }
}
export async function writeRoutes(bridge, store) {
    const s = normalizeStore(store);
    await bridge.updateVariablesWith(v => { v[ROUTES_KEY] = s; return v; }, { type: 'global' });
    return s;
}
