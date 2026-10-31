import { capture, assertCapture, checkedCommit } from './action-support.js';
// Nhóm Chat Chư Thiên Vạn Giới (0.6.0) — một nhóm chat xuyên thế giới kiểu QQ nằm bên trong thiết bị đầu cuối.
// Dữ liệu nằm trong biến trò chuyện tại 诸天系统.聊天群 (đi theo bản lưu và các nhánh cốt truyện). Một tin nhắn của người dùng = một lần gọi mô hình,
// được trả lời bởi 1–6 thành viên. Quy tắc thoải mái nhưng có giới hạn sàn: bất cứ thứ gì thành viên đưa ra đều bị kẹp theo cấp Thương thành,
// bậc thực lực của chính thành viên đó và không bao giờ là Cấm kỵ (tự động hạ phẩm giai chứ không từ chối); mọi vật phẩm/điểm số tới tay Ký chủ đều được ghi
// vào sổ cái và đọc ngược lại kiểm chứng TRƯỚC KHI giao diện báo Đã nhập kho, với nguồn gốc “Tên@Thế giới”.
import { inert } from './contracts.js';
import { esc, fmtNum } from './hub.js';
import { readConfigs } from './api-center.js';
import * as L from './ledger-ops.js';
import { errorLine } from './errors.js';
import { stripPanels } from './panel-guard.js';
import { GroupWorld, summonPrompt, searchEntries, entryTitle, entryKeys, worldMemoryPrompt } from './group-world.js';

const KEY = '聊天群';
const MAX_MSG = 150, MAX_PM = 30, MAX_MEMBERS = 30;
const today = () => new Date().toLocaleDateString('sv-SE');
const rid = p => p + Math.random().toString(36).slice(2, 9);
const clip = (s, n) => inert(String(s ?? '')).replace(/\s+/g, ' ').trim().slice(0, n);
const num = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };
export const DEFAULT_RULES = [
    'Phẩm giai vật phẩm trong lì xì và quà tặng không được cao hơn cấp Thương thành của Ký chủ, cũng không được cao hơn thực lực của bản thân người tặng',
    'Vật phẩm Cấm kỵ nghiêm cấm lưu thông trong nhóm',
    'Thành viên nhóm không được tiết lộ thân phận hệ thống của Ký chủ',
];
export const POINTS_CAP_BY_SHOP = [0, 2000, 20000, 200000, 2e6, 2e7];
export const QTY_CAP = { 凡品: 5, 灵品: 5, 仙品: 2, 神品: 1, 禁忌: 0 };
export const RECRUIT_FEE = 100;
// Phí vào nhóm (0.8.1): đường cong giá riêng. Bản 0.6–0.8 dùng chung giá Sao chép Thần thông (1e3…1e11) nên thành viên cấp Tinh hệ tốn hàng tỷ điểm.
export const JOIN_PRICE = [0, 300, 1500, 6000, 30000, 200000, 2e6, 3e7, 5e8];
/** Highest 实力档 whose 入群费 fits the budget (at least 1). */
export function affordableTier(points) { let t = 1; for (let i = 1; i < JOIN_PRICE.length; i++) if (JOIN_PRICE[i] <= num(points)) t = i; return t; }
// Inspiration for random recruits, picked locally so two recruits never send the model the same prompt.
export const RECRUIT_SEEDS = [
    'Huyền huyễn phương Đông', 'Tiên hiệp tu chân', 'Võ hiệp giang hồ', 'Đô thị dị năng', 'Cyberpunk', 'Steampunk',
    'Ma pháp phương Tây', 'Kinh dị Cthulhu', 'Tận thế phế thổ', 'Khoa huyễn tinh tế', 'Anime Nhật Bản', 'Lịch sử giả tưởng',
    'Thần thoại truyền thuyết', 'Cung đình quyền mưu', 'Chiến tranh cơ giáp', 'Đời thường học đường', 'Hải tặc phiêu lưu', 'Thế giới Nhẫn giả',
    'Thiếu nữ ma pháp', 'Ma cà rồng đêm tối', 'Vô hạn lưu', 'Dị giới trò chơi', 'Linh dị dân gian', 'Yêu quái bách quỷ',
];
/** 红包/赠礼 rhythm: members may hand things over only every 3–4 group rounds, unless the host asks for it. */
export const PACKET_ASK = /红包|发包|赠礼|送礼|礼物|送点|给点|打赏|lì xì|phát bao|tặng quà|quà tặng|gửi quà|cho ít|thưởng/i;
export function packetAllowed(g, userText) {
    if (userText && PACKET_ASK.test(userText)) return 'asked';
    return num(g.节奏?.距上次, 99) + 1 >= num(g.节奏?.间隔, 3) ? 'due' : '';
}
export const DAILY_IN = 6, DAILY_OUT = 10;
/** 0.8.2 economy: a member's points packet (the TOTAL, the host grabs one share of it) is capped by that member's own
 *  入群费 as well — a packet worth more than the member cost to recruit made the group a money printer. */
export function packetCap(tier, shop) {
    const t = Math.max(1, Math.min(8, Math.round(num(tier, 1))));
    return Math.min((L.TIERS[t] || L.TIERS[1]).p, POINTS_CAP_BY_SHOP[Math.max(1, Math.min(5, shop))], Math.max(100, JOIN_PRICE[t]));
}
/** 扩建 +5 seats (0.8.2: 1,000 per current seat — was 2,000, out of line with the 300-point 入群费 curve). */
export const expandCost = cap => num(cap, 5) * 1000;
/** 自动闲聊 every N story replies (0.8.2; before: after EVERY reply = one extra model call per message). */
export const CHAT_EVERY = [1, 2, 3, 4, 5, 6, 8, 10];
// 1.1.4 群聊生成设置 (群务 → 群聊生成): how many members answer one message, how long a line may be, how much of the
// log the model sees and the output limit (0 = 自动, sized from the other three).
export const GROUP_SPEAKERS = [1, 2, 3, 4, 5, 6, 8, 10];
export const GROUP_CHARS = [120, 200, 300, 400, 600, 800];
export const GROUP_CONTEXT = [8, 16, 30, 50];
export const GROUP_TOKENS = [0, 1200, 2000, 3000, 4000, 6000, 8000];
export const MAX_ROUNDS = 5;
const pick = (list, v, d) => (list.includes(num(v, NaN)) ? num(v) : d);
/** The group's generation settings, normalized (pure). lo ≤ hi always. */
export function groupGen(set = {}) {
    let lo = pick(GROUP_SPEAKERS, set.发言下限, 1), hi = pick(GROUP_SPEAKERS, set.发言上限, 6);
    if (lo > hi) [lo, hi] = [hi, lo];
    return { lo, hi, chars: pick(GROUP_CHARS, set.单条字数, 300), ctx: pick(GROUP_CONTEXT, set.上下文, 16), tokens: pick(GROUP_TOKENS, set.输出上限, 0) };
}
/** 输出上限「自动」: room for `hi` lines of `chars` characters plus the format, 1200–6000 (pure). */
export function autoTokens(hi, chars) { return Math.max(1200, Math.min(6000, 600 + num(hi, 6) * Math.round(num(chars, 300) + 20))); }
/** A reply cut off by the output limit: the last line is probably half a message — drop it (pure). */
export function dropLastLine(text) {
    const lines = String(text ?? '').replace(/\s+$/, '').split('\n');
    lines.pop(); return lines.join('\n');
}
/** Why the newest round can NOT be re-rolled ('' = it can). Something that already reached the ledger blocks it (pure). */
export function roundBlocked(g, r) {
    if (!r) return 'Không có lượt nào có thể tạo lại (chỉ có thể roll lại lượt gần nhất được tạo từ bản 1.1.4 trở đi).';
    for (const id of r.packets || []) if (g.红包[id]?.grabs?.some(x => x.who === 'me')) return 'Lì xì của lượt này bạn đã giật rồi (đã ghi sổ), không thể tạo lại.';
    for (const id of r.gifts || []) if (!g.待领取.some(x => x.id === id)) return 'Quà tặng của lượt này bạn đã nhận rồi (đã nhập kho), không thể tạo lại.';
    return '';
}
/** Takes one round back out of the group: its messages, its unclaimed packets / gifts, today's packet count, the
 *  packet rhythm and the mute turns it used up (only where nothing changed them since). Pure — mutates `g`. */
export function undoRound(g, r) {
    const drop = new Set(r.msgs || []);
    g.消息 = g.消息.filter(m => !drop.has(m.id));
    for (const id of r.packets || []) delete g.红包[id];
    const gifts = new Set(r.gifts || []); g.待领取 = g.待领取.filter(x => !gifts.has(x.id));
    if (g.日计.day === r.prev?.day) g.日计.收 = Math.max(0, num(g.日计.收) - (r.packets || []).length);
    if (r.prev) { g.节奏.距上次 = num(r.prev.距上次, 99); g.节奏.间隔 = Math.max(3, Math.min(4, num(r.prev.间隔, 3))); }
    for (const m of g.成员) { const was = r.prev?.禁言?.[m.id]; if (was !== undefined && num(m.禁言轮) === Math.max(0, num(was) - 1)) m.禁言轮 = num(was); }
    g.轮次 = g.轮次.filter(x => x.id !== r.id);
    return g;
}
/** 1.1.4 删除单条消息 (pure — mutates `g`, returns the removed message). A packet you already grabbed, a packet you sent
 *  (already paid) and a gift you already claimed are ledger records and stay; an unclaimed packet / gift goes with it. */
export function deleteMessage(g, id) {
    const i = g.消息.findIndex(m => m.id === id); if (i < 0) throw Error('Tin nhắn này đã không còn nữa.');
    const msg = g.消息[i];
    if (msg.kind === 'packet') {
        const p = g.红包[msg.ref];
        if (p && msg.from === 'me') throw Error('Lì xì bạn phát ra đã trừ sổ và được thành viên nhóm nhận, bản ghi này không thể xóa.');
        if (p?.grabs?.some(x => x.who === 'me')) throw Error('Lì xì này bạn đã giật rồi (đã ghi sổ), bản ghi này không thể xóa.');
        if (p) { delete g.红包[msg.ref]; if (new Date(num(p.t, Date.now())).toLocaleDateString('sv-SE') === g.日计.day) g.日计.收 = Math.max(0, num(g.日计.收) - 1); }
    } else if (msg.kind === 'gift') {
        const k = g.待领取.findIndex(x => x.id === msg.gift);
        if (k < 0) throw Error('Món quà tặng này đã được nhận nhập kho, bản ghi này không thể xóa.');
        g.待领取.splice(k, 1);
    }
    g.消息.splice(i, 1);
    for (const r of g.轮次) {
        r.msgs = r.msgs.filter(x => x !== id);
        if (msg.ref) r.packets = (r.packets || []).filter(x => x !== msg.ref);
        if (msg.gift) r.gifts = (r.gifts || []).filter(x => x !== msg.gift);
    }
    g.轮次 = g.轮次.filter(r => r.msgs.length || r.user);
    return msg;
}
const normRound = r => ({
    id: String(r.id), t: num(r.t), user: clip(r.user, 300), story: clip(r.story, 400), cut: !!r.cut,
    msgs: r.msgs.filter(x => typeof x === 'string'), packets: Array.isArray(r.packets) ? r.packets.filter(x => typeof x === 'string') : [],
    gifts: Array.isArray(r.gifts) ? r.gifts.filter(x => typeof x === 'string') : [],
    prev: { 距上次: num(r.prev?.距上次, 99), 间隔: num(r.prev?.间隔, 3), day: String(r.prev?.day || ''), 禁言: r.prev?.禁言 && typeof r.prev.禁言 === 'object' ? r.prev.禁言 : {} },
});
/** Bag items that came through the group (0.8.2: the item itself carries the source, so it never scrolls away). */
export const GROUP_SRC = /^(?:聊天群|Nhóm chat)[·・]/i;
export function groupItems(z, g) {
    const known = new Set([...(g?.入库记录 || []).map(r => r.src), ...(g?.成员 || []).map(m => `${m.名称}@${m.世界}`)]);
    return (Array.isArray(z?.背包) ? z.背包 : []).filter(it => it && it.名称 && num(it.数量, 1) > 0 && (GROUP_SRC.test(String(it.来源 || '')) || known.has(String(it.来源 || ''))));
}
/** “Nhóm chat·Tên@Thế giới·Phương thức” — what the bag shows and what the story prompt quotes. */
export const groupSource = (src, how) => `Nhóm chat·${src}·${how}`;

/** Recruit prompt (0.8.1). Random mode draws the genre and the target 实力档 locally — the model only fills in a person
 *  — so consecutive recruits really differ, and the target never exceeds what the host can pay for. */
/** 0.9.4 Pure: what a 发布 click really asks for. A name typed while「随机世界」is selected used to be ignored (the
 *  recruit was random anyway) — it now means 指定世界; 指定世界 / 指定角色 without a name is refused before any fee. */
export function recruitMode(mode, hint) {
    const h = String(hint ?? '').trim().slice(0, 30);
    const m = mode === 'world' || mode === 'char' ? mode : 'rand';
    if (m === 'rand') return h ? { mode: 'world', hint: h } : { mode: 'rand', hint: '' };
    if (!h) throw Error(m === 'char' ? 'Khi chọn Chỉ định nhân vật vui lòng điền tên nhân vật.' : 'Khi chọn Chỉ định thế giới vui lòng điền tên thế giới.');
    return { mode: m, hint: h };
}
export const RECRUIT_PLACEHOLDER = Object.freeze({ rand: 'Ngẫu nhiên không cần điền; nếu nhập tên sẽ tự động chuyển sang 「Chỉ định thế giới」', world: 'Tên thế giới, ví dụ: Đấu La Đại Lục', char: 'Tên nhân vật, ví dụ: Tôn Ngộ Không' });
export function recruitPrompt(g, { mode = 'rand', hint = '', budget = 0, maxTier = 1, rand = Math.random } = {}) {
    const tiers = L.TIERS.slice(1).map((t, i) => `${i + 1}=${t.n}`).join(', ');
    const seen = [...g.成员.map(m => m.名称), ...(g.候选历史 || [])];
    let want, target = 0, seed = '';
    if (mode === 'char') want = `đích thân nhân vật 「${clip(hint, 30)}」`;
    else {
        const lo = Math.max(1, maxTier - 2); target = lo + Math.floor(rand() * (maxTier - lo + 1));
        seed = RECRUIT_SEEDS[Math.floor(rand() * RECRUIT_SEEDS.length)];
        want = mode === 'world' ? `một nhân vật đến từ thế giới 「${clip(hint, 30)}」` : `một nhân vật đến từ thế giới thể loại 「${seed}」 (tác phẩm nổi tiếng hay tự sáng tác đều được, đừng lúc nào cũng chỉ chọn vài cái tên quen thuộc nhất)`;
    }
    const text = `Hãy chiêu mộ cho nhóm chat của Ký chủ ${want}.
【Không được chọn】${seen.join(', ') || 'Không có'} (đã ở trong nhóm hoặc vừa mới xuất hiện, bắt buộc phải đổi người khác)
${target ? `【Bậc thực lực】Bắt buộc phải là ${target} (${(L.TIERS[target] || L.TIERS[1]).n}). Ký chủ chỉ có ${fmtNum(num(budget))} Điểm Hệ Thống, phí vào nhóm là ${fmtNum(JOIN_PRICE[target])} điểm; đừng chiêu mộ người mạnh hơn.` : 'Đánh giá trung thực bậc thực lực theo thiết lập nguyên tác.'}
Tham khảo bậc thực lực: ${tiers}. Chỉ xuất đúng một dòng, phân cách bằng dấu gạch đứng: Tên|Thế giới xuất xứ|Con số bậc thực lực|Tính cách (trong 20 chữ)|Đặc sản (một loại vật phẩm của thế giới đó có thể dùng làm quà tặng, trong 20 chữ)`;
    return { text, target, seed };
}
/** Story-side prompt: who is in the group, what reached the host through it, and how the story should treat that. */
export function groupStoryPrompt(g, tierName = t => String(t), z = null) {
    const lines = [];
    if (g.成员.length) lines.push(`【Nhóm Chat Chư Thiên】Ký chủ sở hữu nhóm chat xuyên thế giới 「${g.群名}」 (${g.成员.length} người): ${g.成员.map(m => `${m.名称} (${m.世界}·${tierName(m.档)})`).join(', ')}. Thành viên nhóm đang ở thế giới riêng của họ, chỉ có thể giao lưu, phát lì xì và tặng quà thông qua nhóm chat (giao diện hệ thống trong ý thức của Ký chủ).`);
    // 0.8.2: items are read from the BAG (still owned, with their own source) — the old 8-entry log scrolled away and
    // kept listing things already used up. The log still covers points (they are not bag items).
    const items = z ? groupItems(z, g).slice(-12) : [];
    const pts = g.入库记录.filter(r => /系统点|Điểm Hệ Thống/i.test(r.what)).slice(-4);
    const fallback = z ? [] : g.入库记录.slice(-8);
    const listed = [...items.map(it => `${it.名称} (${L.gradeLabel(it.品级 || '凡品')})×${num(it.数量, 1)} (${String(it.来源).replace(GROUP_SRC, '')})`), ...pts.map(r => `${r.what} (${r.src}, ${r.how})`), ...fallback.map(r => `${r.what} (${r.src}, ${r.how})`)];
    if (listed.length) lines.push(`【Nhóm chat · Bản ghi nhập kho thực tế】Những thứ dưới đây là do Ký chủ nhận được thông qua nhóm chat và hệ thống đã nhập kho (vật phẩm là đồ hiện có trong túi đồ): ${listed.join('; ')}. Trong chính văn khi Ký chủ lấy ra, sử dụng hoặc nhắc tới những thứ này, lai lịch chính là Nhóm Chat Chư Thiên (được chuyển phát qua không gian hệ thống), không được sửa thành nhặt được, mua được, tặng trực tiếp trước mặt hay nguồn gốc nào khác.`);
    const recent = g.消息.filter(m => m.kind !== 'sys').slice(-4).map(m => `${m.from === 'me' ? 'Ký chủ' : (g.成员.find(x => x.id === m.from)?.名称 || 'Thành viên nhóm')}: ${String(m.text).slice(0, 60)}`);
    if (recent.length) lines.push('Trò chuyện nhóm gần đây: ' + recent.join(' / '));
    if (lines.length) lines.push('Những việc xảy ra trong nhóm chat là có thật, cốt truyện có thể nối tiếp tự nhiên (ví dụ Ký chủ liếc nhìn tin nhắn nhóm, nhắc tới một người bạn trong nhóm); nhưng không được tự bịa ra cuộc trò chuyện nhóm, lì xì hay quà tặng không có trong bản ghi thay cho thành viên nhóm.');
    return lines.join('\n');
}
export function normGroup(g) {
    const x = g && typeof g === 'object' && !Array.isArray(g) ? g : {};
    return {
        v: 1, rev: num(x.rev), 群名: clip(x.群名 || 'Nhóm Chat Chư Thiên Vạn Giới', 20), 容量: Math.max(5, Math.min(MAX_MEMBERS, num(x.容量, 5))),
        公告: clip(x.公告, 200), 群规: Array.isArray(x.群规) ? x.群规.map(r => clip(r, 80)).filter(Boolean).slice(0, 12) : DEFAULT_RULES.slice(),
        成员: Array.isArray(x.成员) ? x.成员.filter(m => m && m.id && m.名称) : [],
        消息: Array.isArray(x.消息) ? x.消息.slice(-MAX_MSG) : [],
        红包: x.红包 && typeof x.红包 === 'object' ? x.红包 : {},
        待领取: Array.isArray(x.待领取) ? x.待领取 : [],
        签到: { day: x.签到?.day || '', streak: num(x.签到?.streak), total: num(x.签到?.total) },
        挂单: Array.isArray(x.挂单) ? x.挂单 : [], 集市: x.集市 && typeof x.集市 === 'object' ? x.集市 : { day: '', list: [] },
        降临: x.降临 && x.降临.id ? x.降临 : null,
        日计: x.日计?.day === today() ? { day: x.日计.day, 收: num(x.日计.收), 发: num(x.日计.发) } : { day: today(), 收: 0, 发: 0 },
        设置: (() => { const gen = groupGen(x.设置 || {}); return { 自动闲聊: !!x.设置?.自动闲聊, 摘要注入: x.设置?.摘要注入 !== false, 闲聊间隔: CHAT_EVERY.includes(num(x.设置?.闲聊间隔)) ? num(x.设置?.闲聊间隔) : 3, 发言下限: gen.lo, 发言上限: gen.hi, 单条字数: gen.chars, 上下文: gen.ctx, 输出上限: gen.tokens }; })(),
        轮次: Array.isArray(x.轮次) ? x.轮次.filter(r => r && r.id && Array.isArray(r.msgs)).map(normRound).slice(-MAX_ROUNDS) : [],
        私聊: x.私聊 && typeof x.私聊 === 'object' ? x.私聊 : {},
        候选: x.候选 && x.候选.名称 ? x.候选 : null,
        候选历史: Array.isArray(x.候选历史) ? x.候选历史.map(n => clip(n, 20)).filter(Boolean).slice(-12) : [],
        节奏: { 距上次: num(x.节奏?.距上次, 99), 间隔: Math.max(3, Math.min(4, num(x.节奏?.间隔, 3))), 闲聊: Math.max(0, num(x.节奏?.闲聊)) },
        入库记录: Array.isArray(x.入库记录) ? x.入库记录.filter(r => r && r.what).slice(-20) : [],
    };
}
/** 招募: 名称|世界|实力档|性格|特产 */
export function parseRecruit(text) {
    const line = String(text || '').split('\n').map(s => s.trim()).find(s => s.split('|').length >= 4);
    if (!line) return null;
    const [名称, 世界, 档, 性格, 特产] = line.replace(/^[-*\d.、\s]+/, '').split('|').map(s => s.trim());
    const tier = Math.max(1, Math.min(8, Math.round(num(String(档).replace(/[^\d.]/g, ''), 1)) || 1));
    if (!clip(名称, 20)) return null;
    return { 名称: clip(名称, 20), 世界: clip(世界 || 'Thế giới chưa rõ', 20), 档: tier, 性格: clip(性格, 30), 特产: clip(特产 || 'Đặc sản bản giới', 24) };
}
/** “名称/品级/分类/效果” → item (unknown grade → 凡品). */
export function parseItem(spec) {
    const [名称, 品级, 分类, ...rest] = String(spec || '').split(/[/／]/).map(s => s.trim());
    if (!clip(名称, 24)) return null;
    const gKey = L.normGradeKey(品级);
    return { 名称: clip(名称, 24), 品级: L.GRADES.includes(gKey) ? gKey : '凡品', 分类: clip(分类 || '其他', 8), 效果: clip(rest.join('/'), 80) };
}
// 1.1.1: models wrote packets the strict 1.0 pattern never matched —「【红包】」, 「[红包] 浸血古铜钱/凡品/… 5枚」(no
// 物品 word), 「5000系统点 3个」, 「1.5万」, 「**@名称**:」, 「@名称（世界）:」. Such lines used to arrive as plain text
// with nothing to grab. Now the tag, the kind and the numbers are read leniently, and a packet that still cannot be
// read says so in the chat instead of silently becoming text.
const PACKET_TAG = /^[[【［]\s*(?:红包|Lì xì|Bao lì xì)\s*[\]】］]\s*/i, GIFT_TAG = /^[[【［]\s*(?:赠礼|Quà tặng|Tặng quà)\s*[\]】］]\s*/i;
export const PACKET_BROKEN = ' (Định dạng lì xì không đầy đủ, chưa ghi sổ)';
/** "5000" / "1.5万" / "2亿" / "10,000" → number (NaN when there is none). */
export function parseAmount(text) {
    const m = /(\d+(?:\.\d+)?)\s*(万|亿|vạn|tỷ)?/i.exec(String(text ?? '').replace(/[,，](?=\d{3})/g, ''));
    if (!m) return NaN;
    const u = (m[2] || '').toLowerCase();
    return Math.floor(Number(m[1]) * (u === '亿' || u === 'tỷ' ? 1e8 : u === '万' || u === 'vạn' ? 1e4 : 1));
}
const QTY_TAIL = /(?:^|\s+|[×xX*])\s*[×xX*]?\s*(\d{1,3})\s*(?:[枚个件份颗张瓶块把株粒支本套只条]|viên|cái|món|phần|tờ|bình|khối|thanh|cây|hạt|nhánh|quyển|bộ|con|sợi)?\s*$|(\d{1,3})\s*(?:[枚个件份颗张瓶块把株粒支本套只条]|viên|cái|món|phần|tờ|bình|khối|thanh|cây|hạt|nhánh|quyển|bộ|con|sợi)\s*$/i;
/** The part after「[红包]」→ { kind:'points', amount, count } | { kind:'item', spec, qty } | null (unreadable). Pure. */
export function parsePacketBody(text) {
    let t = String(text ?? '').trim();
    const lead = /^(系统点|点数|积分|物品|Điểm Hệ Thống|Điểm số|Điểm|Vật phẩm)\s*[:：]?\s*/i.exec(t); if (lead) t = t.slice(lead[0].length).trim();
    const isItemLead = lead && /^(物品|Vật phẩm)$/i.test(lead[1]);
    const kind = lead ? (isItemLead ? 'item' : 'points') : t.includes('/') || t.includes('／') ? 'item'
        : /^\d[\d.,，]*\s*(?:万|亿|vạn|tỷ)?\s*(系统点|点|积分|Điểm Hệ Thống|điểm)/i.test(t) || /^\d[\d.,，]*\s*(?:万|亿|vạn|tỷ)?(\s+\d+\s*(?:个|cái|bao|phần)?)?\s*$/i.test(t) ? 'points' : 'item';
    if (kind === 'points') {
        const nums = [...t.replace(/[,，](?=\d{3})/g, '').matchAll(/(\d+(?:\.\d+)?)\s*(万|亿|vạn|tỷ)?/gi)].map(m => parseAmount(m[0]));
        if (!nums.length || !(nums[0] >= 1)) return null;
        return { kind, amount: nums[0], count: nums[1] >= 1 ? Math.floor(nums[1]) : 3 };
    }
    let qty = 1; const q = QTY_TAIL.exec(t);
    if (q) { qty = Number(q[1] || q[2]) || 1; t = t.slice(0, q.index).trim(); }
    if (!t) return null;
    return { kind, spec: t, qty };
}
/** Member reply lines → structured messages, with the hard floor applied. */
export function parseGroupReply(text, members, { cap = '凡品', shop = 1, max = 6, chars = 300 } = {}) {
    const out = [], byName = new Map(members.map(m => [m.名称, m]));
    for (const raw of String(text || '').split('\n')) {
        const line = raw.replace(/\*\*|__/g, '').trim();
        const m = line.match(/^@?\s*([^:：\s][^:：]{0,31})\s*[:：]\s*(.+)$/);
        if (!m) continue;
        const name = m[1].trim(), who = byName.get(name) || byName.get(name.replace(/\s*[（(][^）)]*[）)]\s*$/, '').replace(/^@\s*/, ''));
        if (!who || num(who.禁言轮) > 0) continue;
        const body = m[2].trim(); const msg = { who, text: '' };
        const memberCap = L.giftCap({ 商城等级: shop }, who.档), eff = L.GRADES[Math.min(L.gradeIndex(cap), L.gradeIndex(memberCap))];
        if (PACKET_TAG.test(body)) {
            const rest = body.replace(PACKET_TAG, ''), cut = rest.search(/[|｜]/);
            const spec = (cut >= 0 ? rest.slice(0, cut) : rest).trim(), note = clip((cut >= 0 ? rest.slice(cut + 1) : '').trim() || 'Chúc mừng phát tài', 40);
            const pb = parsePacketBody(spec);
            if (pb?.kind === 'points') {
                const limit = packetCap(who.档, shop), amount = Math.max(1, Math.min(pb.amount, limit));
                msg.packet = { kind: 'points', amount, count: Math.max(1, Math.min(10, pb.count)), note, downgraded: amount < pb.amount };
            } else if (pb?.kind === 'item') {
                const item = parseItem(pb.spec);
                if (item) {
                    const [g, down] = L.clampGrade(item.品级, eff); item.品级 = g;
                    const qty = Math.max(1, Math.min(QTY_CAP[g] || 1, pb.qty));
                    msg.packet = { kind: 'item', item, qty, count: qty, note, downgraded: down };
                }
            }
            msg.text = msg.packet ? note : clip([spec, cut >= 0 ? rest.slice(cut + 1).trim() : ''].filter(Boolean).join(' · ') || 'Lì xì', 260) + PACKET_BROKEN;
        } else if (GIFT_TAG.test(body)) {
            const rest = body.replace(GIFT_TAG, ''), cut = rest.search(/[|｜]/);
            const item = parseItem((cut >= 0 ? rest.slice(0, cut) : rest).trim().replace(/^(?:物品|Vật phẩm)\s*[:：]?\s*/i, '').replace(QTY_TAIL, ''));
            if (!item) { msg.text = clip(rest, 260) + ' (Định dạng quà tặng không đầy đủ, chưa ghi sổ)'; }
            else {
                const [g, down] = L.clampGrade(item.品级, eff); item.品级 = g;
                msg.gift = { item, note: clip(cut >= 0 ? rest.slice(cut + 1).trim() : '', 60), downgraded: down }; msg.text = msg.gift.note || 'Tặng bạn một món đồ nhỏ.';
            }
        } else msg.text = clip(body, Math.max(60, num(chars, 300)));
        if (msg.text || msg.packet || msg.gift) out.push(msg);
        if (out.length >= max) break;
    }
    return out;
}
/** 1.1.1 补登: an old plain-text message that still carries a「[红包]」line (sent before 1.1.1 could read it). Pure. */
export function rebookable(msg) {
    if (!msg || msg.kind || msg.from === 'me' || msg.from === 'sys' || msg.rebooked) return false;
    const t = String(msg.text || ''); return /[[【［]\s*(?:红包|Lì xì|Bao lì xì)\s*[\]】］]/i.test(t) && !t.includes(PACKET_BROKEN) && !t.includes('（红包格式不完整，未入账）');
}
/** 拼手气: `count` positive integer shares summing to `total` (double-mean random, like WeChat). */
export function splitShares(total, count, rand = Math.random) {
    total = Math.floor(total); count = Math.max(1, Math.min(Math.floor(count), total));
    const out = []; let left = total;
    for (let i = count; i > 1; i--) { const maxShare = Math.max(1, Math.floor((left / i) * 2) - 1); const v = Math.max(1, Math.min(left - (i - 1), Math.floor(rand() * maxShare) + 1)); out.push(v); left -= v; }
    out.push(left); return out;
}
export const signReward = (streak, members) => 100 * Math.min(7, Math.max(1, streak)) + 10 * members;

/** 1.1.5 Pure: removes the plugin's group rule from a WORLDINFO_ENTRIES_LOADED payload (in place on the copies). */
export const GROUP_RULE_COMMENT = '36｜Liên kết｜Nhóm Chat Chư Thiên (Tiện ích)';
export const GROUP_RULE_COMMENT_CN = '36｜联动｜诸天聊天群（插件）';
export function dropGroupRule(lists) {
    let n = 0;
    for (const list of Object.values(lists || {})) {
        if (!Array.isArray(list)) continue;
        for (let i = list.length - 1; i >= 0; i--) {
            const c = String(list[i]?.comment || '');
            if (c === GROUP_RULE_COMMENT || c === GROUP_RULE_COMMENT_CN || /^36｜/.test(c)) { list.splice(i, 1); n++; }
        }
    }
    return n;
}

export class HubGroup {
    constructor(app) { this.app = app; this.disposers = []; this.view = 'chat'; this.busy = ''; this.pm = null; this.sheet = null; this.world = new GroupWorld(app); this.wb = { book: '', q: '', hits: null, err: '' }; }
    /** 1.1.5 功能开关: the whole group (page, story prompt, auto chat) can be switched off. */
    on() { return this.app.settings?.get('modules')?.group !== false; }
    autoOn() { return this.on() && this.app.settings?.get('modules')?.groupAuto !== false; }
    get hub() { return this.app.hub; }
    get bridge() { return this.app.bridge; }
    get ctx() { return SillyTavern.getContext(); }
    start() {
        const hub = this.hub; if (!hub) return this;
        hub.addNav('Vạn giới', 'group', 'Nhóm chat', 'chat', { title: 'Nhóm chat', render: el => this.render(el) });
        this.el = hub.pages.get('group')?.el; this.el?.classList.add('zt-fill-page');
        this.disposers.push(this.app.adapter.subscribe(() => { this.syncPrompt(); if (this.visible()) this.paint(); }));
        const ev = this.bridge.events, r = this.bridge.eventOn(ev.MESSAGE_RECEIVED || 'message_received', id => this.onStoryReply(id));
        this.disposers.push(() => r.stop());
        // 1.1.5 群员记忆注入: the recap depends on who appears in the newest story text — refresh right before a generation
        const gs = this.bridge.eventOn(ev.GENERATION_STARTED || 'generation_started', (_type, _o, dry) => { if (!dry) this.syncPrompt(); });
        this.disposers.push(() => gs.stop());
        // SillyTavern adds the user's new message AFTER GENERATION_STARTED (MESSAGE_SENT comes before the prompt is built):
        // without this the member the user just named would only be remembered one turn later
        const ms = this.bridge.eventOn(ev.MESSAGE_SENT || 'message_sent', () => this.syncPrompt());
        this.disposers.push(() => ms.stop());
        // 功能开关 → 聊天群 off: the plugin's own worldbook rule (36｜联动｜诸天聊天群) leaves this pass too, so the story
        // model is not told about a group that is switched off (only the per-pass copies; the worldbook file is untouched)
        if (ev.WORLDINFO_ENTRIES_LOADED) {
            const wi = this.bridge.eventOn(ev.WORLDINFO_ENTRIES_LOADED, lists => { try { if (!this.on()) dropGroupRule(lists); } catch (e) { console.warn('[Nhóm Chat Chư Thiên] Lọc Sách Thế Giới thất bại', e); } });
            this.disposers.push(() => wi.stop());
        }
        if (this.app.settings?.onChange) this.disposers.push(this.app.settings.onChange(k => { if (k === 'modules' || k === 'groupWorld') { this.lastPrompt = null; this.syncPrompt(); } }));
        this.world.warm(this.group()).then(() => { this.lastPrompt = null; this.syncPrompt(); }).catch(() => {});
        this.syncPrompt();
        return this;
    }
    visible() { return this.hub?.isOpen && this.hub.page === 'group'; }
    ledger() { try { return this.bridge.getVariables({ type: 'chat' })?.诸天系统 || null; } catch { return null; } }
    group() { return normGroup(this.ledger()?.[KEY]); }
    member(id) { return this.group().成员.find(m => m.id === id); }
    /** One locked write of the group (and anything else in the ledger), then read back. */
    async write(fn, token) {
        if (token) assertCapture(this.app, token);
        return L.commit(this.bridge, (v, z) => {
            if (token) assertCapture(this.app, token);
            const g = normGroup(z[KEY]); const r = fn(g, z); g.rev = num(g.rev) + 1;
            const keep = new Set(g.消息.map(m => m.ref).filter(Boolean)); for (const id of Object.keys(g.红包)) if (!keep.has(id)) delete g.红包[id];
            z[KEY] = g; return r;
        }, z => [z[KEY]?.rev, z.系统点, (z.背包 || []).length, Object.keys(z.任务库 || {}).length], { expectedIdentity: token?.id });
    }
    say(g, from, text, extra = {}) { const id = rid('g'); g.消息.push({ id, t: Date.now(), from, text: clip(text, Math.max(400, num(g.设置?.单条字数, 300))), ...extra }); if (g.消息.length > MAX_MSG) g.消息.splice(0, g.消息.length - MAX_MSG); return id; }
    /** What reached the host through the group — injected into the story prompt so the AI keeps the real source. */
    booked(g, what, src, how) { g.入库记录.push({ t: Date.now(), what: clip(what, 40), src: clip(src, 40), how }); if (g.入库记录.length > 20) g.入库记录.splice(0, g.入库记录.length - 20); }
    toast(t, ms = 3200, a) { this.hub?.toast(t, ms, a); }
    fail(e) { const line = errorLine(e); this.toast(line, 5500); globalThis.toastr?.warning?.(line, 'Chư Thiên · Nhóm chat'); }
    async ask(system, user, maxTokens = 1200, own = false) {
        const cfg = readConfigs(this.bridge).status || {};
        const custom = cfg.url ? { apiurl: cfg.url, key: cfg.key, model: cfg.model, max_tokens: maxTokens, temperature: 0.85 } : undefined;
        const text = await this.bridge.generateRaw({ user_input: user, ordered_prompts: [{ role: 'system', content: system }, 'user_input'], custom_api: custom, max_tokens: maxTokens, route: 'group', own_limit: !!own });
        if (!String(text || '').trim()) throw Error('Mô hình không trả về nội dung.');
        return String(text);
    }
    hostName() { return clip(this.ctx.name1 || 'Ký chủ', 20); }
    tierName(t) { return (L.TIERS[t] || L.TIERS[1]).n; }
    memberLine(m) { return `- ${m.名称} (${m.世界}·${this.tierName(m.档)}·${m.性格 || 'Chưa rõ tính cách'}·Đặc sản ${m.特产}·Hảo cảm ${num(m.好感, 20)}${m.身份 === '管理员' ? '·Quản trị viên' : ''}${num(m.禁言轮) > 0 ? '·Đang bị cấm chat' : ''})`; }

    // ---------- prompt injection ----------
    syncPrompt() {
        try {
            const z = this.on() ? this.ledger() : null, g = z ? normGroup(z[KEY]) : null, parts = [];
            if (g && g.设置.摘要注入 && (g.成员.length || g.入库记录.length || groupItems(z, g).length)) {
                parts.push(groupStoryPrompt(g, t => this.tierName(t), z));
            }
            if (g?.降临) parts.push(`【Nhóm Chat Chư Thiên · Thành viên nhóm giáng lâm】${g.降临.名称} (${g.降临.世界}·${this.tierName(g.降临.档)}·${g.降临.性格 || ''}) đã thông qua nhóm chat giáng lâm tới bên cạnh Ký chủ, trong ${g.降临.轮} lượt cốt truyện tiếp theo sẽ xuất hiện với tư cách đồng hành, hành động theo tính cách và năng lực ở thế giới gốc của mình.`);
            // 1.1.5 群员记忆注入: summoned worldbook characters that appear in the latest story remember the group
            if (g && g.设置.摘要注入 && this.world.cfg.memory && g.成员.some(m => m.来源)) {
                const story = (this.ctx.chat || []).slice(-4).map(m => stripPanels(String(m?.mes || ''))).join('\n');
                const mem = worldMemoryPrompt(g, story, m => this.world.entryOfSync(m)); if (mem) parts.push(mem);
            }
            const text = parts.join('\n');
            // 1.0: SillyTavern empties its extension prompts when a chat is (re)loaded — compare with what is really there
            if (text === this.lastPrompt && (this.bridge.livePrompt?.('group') ?? text) === text) return; this.lastPrompt = text;
            this.bridge.injectPrompts([{ id: 'group', content: text, position: 'in_chat', depth: 2, role: 'system' }]);
        } catch (e) { console.warn('[Nhóm Chat Chư Thiên] Tiêm lời nhắc thất bại', e); }
    }
    async onStoryReply(id) {
        if (!this.on()) return;
        const c = this.ctx, m = c.chat?.[Number(id)]; if (!m || m.is_user || m.is_system) return;
        let token; try { token = capture(this.app); } catch { return; }
        const g = this.group();
        if (g.降临) {
            try { await this.write(gg => { if (!gg.降临) return; gg.降临.轮 = num(gg.降临.轮) - 1; if (gg.降临.轮 <= 0) { this.say(gg, 'sys', `Thời gian giáng lâm của ${gg.降临.名称} đã kết thúc, quay trở về ${gg.降临.世界}.`, { kind: 'sys' }); gg.降临 = null; } }, token); this.syncPrompt(); } catch (e) { console.warn(e); }
        }
        if (!g.设置.自动闲聊 || !g.成员.length || this.busy || !this.autoOn()) return;
        // 0.8.2: every N-th story reply only (setting 闲聊间隔, default 3) — not one extra model call per message.
        const every = g.设置.闲聊间隔 || 3, due = num(g.节奏.闲聊) + 1 >= every;
        try { await this.write(gg => { gg.节奏.闲聊 = due ? 0 : num(gg.节奏.闲聊) + 1; }, token); } catch (e) { console.warn(e); return; }
        if (due) this.round(null, stripPanels(m.mes).trim().slice(-400), token).catch(e => console.warn('[Nhóm Chat Chư Thiên] Tự động tán gẫu thất bại', e));
    }

    // ---------- chat round: one request, 发言下限–发言上限 members (default 1–6) ----------
    /** `opts.replace` (1.1.4 重roll): the id of the newest round — it is taken back out in the SAME write that books the
     *  new answer, so a failed request leaves the old round untouched. */
    async round(userText, story = '', token = capture(this.app), opts = {}) {
        assertCapture(this.app, token);
        const z0 = this.ledger(); if (!z0) throw Error('Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên.');
        const g0 = normGroup(structuredClone(z0[KEY] ?? {}));
        if (opts.replace) {
            const r0 = g0.轮次.at(-1);
            if (!r0 || r0.id !== opts.replace) throw Error('Chỉ có thể tạo lại lượt trò chuyện nhóm gần nhất; trong nhóm đã có lượt mới hơn.');
            const why = roundBlocked(g0, r0); if (why) throw Error(why);
            undoRound(g0, r0);            // the prompt must not see the answer being replaced
        }
        const speakers = g0.成员.filter(m => num(m.禁言轮) <= 0);
        if (!speakers.length) throw Error(g0.成员.length ? 'Tất cả thành viên nhóm đều đang bị cấm chat.' : 'Trong nhóm chưa có thành viên nào, hãy sang trang 「Thành viên」 để chiêu mộ trước.');
        const gen = groupGen(g0.设置), idleHi = Math.min(gen.hi, Math.max(gen.lo, 3)), idleLo = Math.min(gen.lo, idleHi);
        const shop = L.shopLevel(z0), cap = L.GRADES[Math.min(shop, 4) - 1], allow = packetAllowed(g0, userText);
        const packetRule = allow === 'asked' ? '2. Lần này Ký chủ chủ động xin, có thể phát lì xì hoặc tặng quà theo yêu cầu của Ký chủ (tối đa 3 cái), định dạng:'
            : allow ? '2. Lượt này có thể (không bắt buộc) để 1 thành viên phát lì xì hoặc tặng quà, tối đa 1 cái, định dạng:'
            : '2. Lượt này 【CẤM】 phát lì xì và tặng quà (trong nhóm vừa mới phát xong, nhịp độ là 3–4 lượt một lần), chỉ trò chuyện. Định dạng dưới đây lượt này không được dùng:';
        // 1.1.5: busy is set BEFORE the (possibly slow) worldbook read, so a second click / auto chat cannot start a parallel round
        this.busy = opts.replace ? 'Thành viên nhóm đang nhập lại…' : 'Thành viên nhóm đang nhập…'; this.paint();
        try {
        const wbBlock = !g0.成员.some(m => m.来源) ? '' : await this.world.block(g0, [userText, story, ...g0.消息.slice(-6).map(m => m.text)].join('\n')).catch(() => '');
        const recent = g0.消息.slice(-gen.ctx).map(m => `${m.from === 'me' ? this.hostName() + ' (Ký chủ)' : m.from === 'sys' ? 'Hệ thống' : (g0.成员.find(x => x.id === m.from)?.名称 || 'Thành viên nhóm')}: ${String(m.text).slice(0, 120)}`).join('\n');
        const sys = `Bạn là Nhóm Chat Chư Thiên Vạn Giới. Mỗi thành viên trong nhóm đến từ một thế giới khác nhau, tính cách, cách ăn nói và kiến thức đều phù hợp với thế giới gốc. Ký chủ là chủ nhóm, sở hữu Hệ Thống Chư Thiên.
Quy tắc phản hồi:
1. Chọn ${gen.lo === gen.hi ? gen.lo : `${gen.lo}–${gen.hi}`} thành viên liên quan nhất tới chủ đề để phát biểu (người bị cấm chat không được phát biểu), mỗi tin một dòng, không quá ${gen.chars} chữ, định dạng bắt buộc là: @Tên: Nội dung
${packetRule}
@Tên: [红包] 系统点 Số_tiền Số_phần | Lời chúc
@Tên: [红包] 物品 Tên_vật_phẩm/Phẩm_giai/Phân_loại/Hiệu_quả Số_lượng | Lời chúc
(Ví dụ: @鹧鸪哨: [红包] 物品 摸金符/灵品/护身法器/辟邪镇煞 3 | Chúc chủ nhóm bách vô cấm kỵ; Ví dụ lì xì Điểm Hệ Thống: @鹧鸪哨: [红包] 系统点 5000 3 | Chúc mừng phát tài)
@Tên: [赠礼] Tên_vật_phẩm/Phẩm_giai/Phân_loại/Hiệu_quả | Lời nhắn kèm
3. Vật phẩm bắt buộc phải là đồ thuộc thế giới của thành viên đó; phẩm giai chỉ được là 凡品/灵品/仙品/神品 (hoặc Phàm phẩm/Linh phẩm/Tiên phẩm/Thần phẩm), không được cao hơn ${L.gradeLabel(cap)} (${cap}), cũng không được cao hơn thực lực của người tặng; nghiêm cấm vật phẩm Cấm kỵ.
4. Chỉ xuất các dòng tin nhắn nhóm chat bằng tiếng Việt, không viết lời dẫn旁白, không giải thích.`;
        const user = `【Nhóm】${g0.群名}${g0.公告 ? '｜Thông báo: ' + g0.公告 : ''}
【Nội quy nhóm】${g0.群规.join('; ')}
【Ký chủ】${this.hostName()}, thế giới hiện tại ${z0.当前世界 || 'Chưa rõ'}, cấp Thương thành Lv${shop}
【Thành viên nhóm】
${g0.成员.map(m => this.memberLine(m)).join('\n')}
${wbBlock ? wbBlock + '\n' : ''}【Tin nhắn gần đây】
${recent || '(Chưa có)'}
${userText ? `【Ký chủ vừa gửi】${userText}` : `【Ký chủ không phát biểu】Hãy dựa theo diễn biến cốt truyện mới nhất bên phía Ký chủ, để ${idleLo === idleHi ? idleLo : `${idleLo}–${idleHi}`} thành viên nhóm tự nhiên tán gẫu.${story ? '\nDiễn biến cốt truyện mới nhất: ' + story : ''}`}`;
            const t0 = Date.now();
            let text = await this.ask(sys, user, gen.tokens || autoTokens(gen.hi, gen.chars), !!gen.tokens);
            // 1.1.4 截断: the reply hit the output limit (reported by the independent-API path) → the last line is cut
            const fin = this.bridge.lastFinish, cut = !!fin && num(fin.at) >= t0 && /^(length|max_tokens|max_output_tokens)$/i.test(String(fin.reason || ''));
            if (cut) text = dropLastLine(text);
            let got = 0, dropped = 0;
            const res = await this.write((g, z) => {
                if (opts.replace) {
                    const r = g.轮次.at(-1);
                    if (!r || r.id !== opts.replace) throw Error('Chỉ có thể tạo lại lượt trò chuyện nhóm gần nhất; trong nhóm đã có lượt mới hơn.');
                    const why = roundBlocked(g, r); if (why) throw Error(why);
                    undoRound(g, r);
                }
                const rec = { id: rid('rd'), t: Date.now(), user: clip(userText || '', 300), story: userText ? '' : clip(story, 400), cut, msgs: [], packets: [], gifts: [],
                    prev: { 距上次: num(g.节奏.距上次, 99), 间隔: num(g.节奏.间隔, 3), day: g.日计.day, 禁言: Object.fromEntries(g.成员.filter(m => num(m.禁言轮) > 0).map(m => [m.id, num(m.禁言轮)])) } };
                const parsed = parseGroupReply(text, g.成员, { cap, shop, max: gen.hi, chars: gen.chars }); let handed = 0;
                for (const p of parsed) {
                    // Hard floor for the rhythm: the model may ignore the rule, the ledger does not.
                    if ((p.packet || p.gift) && (!allow || handed >= (allow === 'asked' ? 3 : 1))) { dropped++; continue; }
                    if (p.packet || p.gift) handed++;
                    if (p.packet) {
                        if (g.日计.收 >= DAILY_IN) { rec.msgs.push(this.say(g, p.who.id, p.text + ' (Lì xì hôm nay đã đạt giới hạn, bị nội quy nhóm chặn lại)')); dropped++; continue; }
                        const id = this.openPacket(g, p.who, p.packet); rec.packets.push(id);
                        rec.msgs.push(this.say(g, p.who.id, p.text, { kind: 'packet', ref: id })); got++;
                    } else if (p.gift) {
                        const gid = rid('gf'); rec.gifts.push(gid);
                        g.待领取.push({ id: gid, from: p.who.id, 名称: p.who.名称, 世界: p.who.世界, item: { ...p.gift.item, 价格: L.TIER_PRICE[p.gift.item.品级] }, note: p.gift.note, downgraded: p.gift.downgraded, t: Date.now() });
                        rec.msgs.push(this.say(g, p.who.id, p.text, { kind: 'gift', gift: gid, label: `${p.gift.item.名称} (${L.gradeLabel(p.gift.item.品级)})${p.gift.downgraded ? ' · Đã hạ cấp theo nội quy nhóm' : ''}` })); got++;
                    } else rec.msgs.push(this.say(g, p.who.id, p.text));
                }
                if (cut) rec.msgs.push(this.say(g, 'sys', `⚠ Phản hồi lượt này chạm giới hạn đầu ra nên bị cắt cụt, nửa dòng cuối đã bị hủy. Có thể bấm 「↻ Roll lại」 để tạo lại, hoặc vào Quản trị nhóm → Tạo trò chuyện nhóm để tăng giới hạn đầu ra / giảm số chữ mỗi tin.`, { kind: 'sys' }));
                for (const m of g.成员) if (num(m.禁言轮) > 0) m.禁言轮 = num(m.禁言轮) - 1;
                if (got) g.节奏 = { 距上次: 0, 间隔: Math.random() < 0.5 ? 3 : 4 }; else g.节奏.距上次 = Math.min(99, num(g.节奏.距上次) + 1);
                if (rec.msgs.length) { g.轮次.push(rec); if (g.轮次.length > MAX_ROUNDS) g.轮次.splice(0, g.轮次.length - MAX_ROUNDS); }
                return parsed.length;
            }, token);
            if (!res) this.toast(cut ? 'Phản hồi bị giới hạn đầu ra cắt cụt, không có nổi một tin nhắn nhóm hoàn chỉnh. Vui lòng vào Quản trị nhóm → Tạo trò chuyện nhóm để tăng giới hạn đầu ra rồi thử lại.' : 'Lần này thành viên nhóm không trả lời đúng định dạng (không thể phân tích đầu ra của mô hình), có thể gửi lại lần nữa.', 5200);
            else if (cut) this.toast('Phản hồi bị cắt cụt: nửa dòng cuối đã bị hủy, có thể bấm 「↻ Roll lại」.', 4200);
            else if (got) this.toast(dropped ? 'Có lì xì/quà tặng gửi tới, một phần vượt giới hạn hôm nay hoặc nhịp độ.' : 'Trong nhóm có lì xì hoặc quà tặng, hãy bấm vào để nhận.', 3200);
        } finally { this.busy = ''; this.syncPrompt(); this.paint(); }
    }
    /** 1.1.4 重roll上一轮: same input (your message / the story it reacted to), new answer. */
    async reroll() {
        const token = capture(this.app);
        const g = this.group(), r = g.轮次.at(-1), why = roundBlocked(g, r);
        if (why) throw Error(why);
        if (!globalThis.confirm?.(`Tạo lại lượt trò chuyện nhóm gần nhất?\n${r.msgs.length} tin nhắn của thành viên nhóm trong lượt này sẽ được thay thế bằng phản hồi mới${r.packets.length || r.gifts.length ? ' (lì xì / quà tặng chưa nhận trong đó cũng sẽ hủy theo)' : ''}; ${r.user ? 'tin nhắn của bạn vẫn được giữ nguyên.' : 'đây là một lượt tự động tán gẫu.'}`)) return;
        await this.round(r.user || null, r.story || '', token, { replace: r.id });
    }
    /** 1.1.4 删除单条消息 (群聊页「🗑 管理」). */
    async removeMessage(id) {
        const token = capture(this.app), g = this.group(), msg = g.消息.find(m => m.id === id);
        if (msg && (msg.kind === 'packet' || msg.kind === 'gift') && !globalThis.confirm?.(msg.kind === 'packet' ? 'Xóa tin nhắn lì xì này? Lì xì chưa giật sẽ bị hủy theo.' : 'Xóa tin nhắn quà tặng này? Quà tặng chưa nhận sẽ bị hủy theo.')) return;
        await this.write(gg => { deleteMessage(gg, id); }, token);
        this.paint();
    }
    async send(text) {
        text = clip(text, 300); if (!text) return;
        const token = capture(this.app);
        await this.write(g => { this.say(g, 'me', text); }, token);
        assertCapture(this.app, token); this.paint(); await this.round(text, '', token);
    }

    // ---------- red packets & gifts ----------
    /** A member's packet into the group's packet store (counts toward 今日红包). Returns its id. */
    openPacket(g, who, packet) {
        const id = rid('rp'), total = packet.kind === 'points' ? packet.amount : packet.qty;
        const count = Math.max(1, Math.min(packet.count, total, g.成员.length + 1));
        g.红包[id] = { id, from: who.id, kind: packet.kind, total, item: packet.item || null, shares: splitShares(total, count), grabs: [], note: packet.note, downgraded: packet.downgraded, t: Date.now() };
        g.日计.收++; return id;
    }
    /** 1.1.1 补登: a「[红包]」that arrived as plain text before 1.1.1 → a real packet (same caps and daily limit). */
    async rebook(msgId) {
        const token = capture(this.app);
        const out = await this.write((g, z) => {
            const msg = g.消息.find(m => m.id === msgId); if (!rebookable(msg)) throw Error('Tin nhắn này không thể ghi bù (đã ghi bù hoặc không phải lì xì).');
            const who = g.成员.find(m => m.id === msg.from); if (!who) throw Error('Thành viên phát lì xì đã rời nhóm, không thể ghi bù.');
            if (g.日计.收 >= DAILY_IN) throw Error(`Hôm nay đã nhận ${DAILY_IN} lì xì (giới hạn nội quy nhóm), hãy ghi bù vào ngày mai.`);
            const shop = L.shopLevel(z), cap = L.GRADES[Math.min(shop, 4) - 1], text = String(msg.text);
            const [p] = parseGroupReply(`${who.名称}: ${text.slice(text.search(/[[【［]\s*(?:红包|Lì xì|Bao lì xì)/i)).replace(PACKET_BROKEN, '').replace('（红包格式不完整，未入账）', '')}`, [{ ...who, 禁言轮: 0 }], { cap, shop });
            if (!p?.packet) throw Error('Lì xì này thiếu số tiền hoặc tên vật phẩm, vẫn không đọc được nên không thể ghi bù.');
            const id = this.openPacket(g, who, p.packet);
            Object.assign(msg, { kind: 'packet', ref: id, text: p.text, rebooked: true });
            return p.packet.kind === 'points' ? `${fmtNum(p.packet.amount)} Điểm Hệ Thống` : `${p.packet.item.名称} (${L.gradeLabel(p.packet.item.品级)})×${p.packet.qty}`;
        }, token);
        this.toast(`Đã ghi bù lì xì: ${out}, bấm 「Giật」 để nhận.`, 3600); this.paint();
    }
    async grab(packetId) {
        const out = await this.write((g, z) => {
            const p = g.红包[packetId]; if (!p) throw Error('Lì xì đã hết hạn.');
            if (p.grabs.some(x => x.who === 'me')) throw Error('Bạn đã giật lì xì này rồi.');
            const left = p.shares.slice(p.grabs.length); if (!left.length) throw Error('Chậm tay mất rồi, lì xì đã bị giật hết.');
            const from = g.成员.find(m => m.id === p.from) || { 名称: 'Thành viên đã rời nhóm', 世界: 'Chưa rõ' };
            const pick = Math.floor(Math.random() * left.length), mine = left.splice(pick, 1)[0];
            p.grabs.push({ who: 'me', v: mine });
            const others = g.成员.filter(m => m.id !== p.from).sort(() => Math.random() - 0.5);
            for (const v of left) { const o = others.shift(); if (!o) break; p.grabs.push({ who: o.id, v }); }
            const src = `${from.名称}@${from.世界}`;
            if (p.kind === 'points') { L.earn(z, mine); } else L.bagAdd(z, { ...p.item, 来源: groupSource(src, 'Lì xì'), 价格: L.TIER_PRICE[p.item.品级] }, mine);
            const what = p.kind === 'points' ? `${fmtNum(mine)} Điểm Hệ Thống` : `${p.item.名称} (${L.gradeLabel(p.item.品级)})×${mine}`;
            const best = Math.max(...p.grabs.map(x => x.v)) === mine;
            this.say(g, 'sys', `Bạn đã giật được lì xì của ${src}: ${what}${best ? ' · Vận may tốt nhất' : ''} · Đã nhập kho`, { kind: 'sys' }); this.booked(g, what, src, 'Lì xì');
            return { what, src };
        });
        this.toast(`Đã nhập kho: ${out.what} (Nguồn ${out.src})`, 3600); this.app.fx?.play?.({ kind: 'reward', title: 'Lì xì đã nhập kho', detail: `${out.what} · ${out.src}` });
        this.paint();
    }
    async claim(giftId) {
        const out = await this.write((g, z) => {
            const i = g.待领取.findIndex(x => x.id === giftId); if (i < 0) throw Error('Món quà này đã được nhận rồi.');
            const x = g.待领取.splice(i, 1)[0], src = `${x.名称}@${x.世界}`;
            L.bagAdd(z, { ...x.item, 来源: groupSource(src, 'Quà tặng') }, 1);
            const m = g.成员.find(mm => mm.id === x.from); if (m) m.好感 = Math.min(100, num(m.好感, 20) + 1);
            this.say(g, 'sys', `Bạn đã nhận quà tặng của ${src}: ${x.item.名称} (${L.gradeLabel(x.item.品级)}) · Đã nhập kho`, { kind: 'sys' }); this.booked(g, `${x.item.名称} (${L.gradeLabel(x.item.品级)})`, src, 'Quà tặng');
            return { what: `${x.item.名称} (${L.gradeLabel(x.item.品级)})`, src };
        });
        this.toast(`Đã nhập kho: ${out.what} (Nguồn ${out.src})`, 3600); this.app.fx?.play?.({ kind: 'reward', title: 'Quà tặng đã nhập kho', detail: `${out.what} · ${out.src}` });
        this.paint();
    }
    /** Host sends a packet: points or a bag item. Members grab it at once; each grabber likes the host more; some send a thank-you gift (待领取). */
    async sendPacket({ kind, amount, count, bagIndex, qty, note }) {
        const out = await this.write((g, z) => {
            if (!g.成员.length) throw Error('Trong nhóm chưa có thành viên nào.');
            if (g.日计.发 >= DAILY_OUT) throw Error(`Hôm nay đã phát ${DAILY_OUT} lì xì rồi, hãy để ngày mai phát tiếp nhé.`);
            let total, item = null;
            if (kind === 'points') { total = Math.floor(num(amount)); if (total < 1) throw Error('Số tiền lì xì ít nhất là 1 Điểm Hệ Thống.'); L.spend(z, total); }
            else { const taken = L.bagTake(z, Math.floor(num(bagIndex, -1)), Math.max(1, Math.floor(num(qty, 1)))); if (taken.品级 === '禁忌') throw Error('Vật phẩm Cấm kỵ nghiêm cấm lưu thông trong nhóm.'); item = { 名称: taken.名称, 品级: taken.品级, 分类: taken.分类, 效果: taken.效果 }; total = taken.数量; }
            const n = Math.max(1, Math.min(Math.floor(num(count, 3)), total, g.成员.length));
            const id = rid('rp'), shares = splitShares(total, n), grabbers = g.成员.slice().sort(() => Math.random() - 0.5).slice(0, n);
            g.红包[id] = { id, from: 'me', kind, total, item, shares, grabs: grabbers.map((m, i) => ({ who: m.id, v: shares[i] })), note: clip(note || 'Mọi người vất vả rồi', 40), t: Date.now() };
            g.日计.发++; this.say(g, 'me', clip(note || 'Mọi người vất vả rồi', 40), { kind: 'packet', ref: id });
            const thanks = [];
            grabbers.forEach((m, i) => {
                const gain = Math.min(8, 2 + Math.floor((kind === 'points' ? shares[i] : shares[i] * L.TIER_PRICE[item.品级]) / Math.max(100, (L.TIERS[m.档] || L.TIERS[1]).p / 20)));
                m.好感 = Math.min(100, num(m.好感, 20) + gain);
                if (Math.random() < 0.3 + num(m.好感, 20) / 400) {
                    const [grade] = L.clampGrade(L.GRADES[Math.max(0, L.gradeIndex(L.giftCap(z, m.档)) - (Math.random() < 0.6 ? 1 : 0))], L.giftCap(z, m.档));
                    const gid = rid('gf'), gi = { 名称: m.特产 || `Đặc sản ${m.世界}`, 品级: grade, 分类: '其他', 效果: `Quà đáp lễ đến từ ${m.世界}`, 价格: L.TIER_PRICE[grade] };
                    g.待领取.push({ id: gid, from: m.id, 名称: m.名称, 世界: m.世界, item: gi, note: 'Cảm ơn lì xì của chủ nhóm!', t: Date.now() });
                    this.say(g, m.id, 'Cảm ơn chủ nhóm! Chút tấm lòng nhỏ, xin hãy nhận lấy nhé.', { kind: 'gift', gift: gid, label: `${gi.名称} (${L.gradeLabel(gi.品级)})` }); thanks.push(m.名称);
                } else this.say(g, m.id, ['Cảm ơn sếp lớn!', 'Vận may khá đấy chứ～', 'Chủ nhóm hào phóng quá!', 'Đã nhận được, đa tạ nhé.'][i % 4]);
            });
            return { n, thanks };
        });
        this.toast(`Đã phát lì xì, ${out.n} thành viên giật được${out.thanks.length ? `; ${out.thanks.join(', ')} đã gửi quà đáp lễ (Chờ nhận)` : ''}.`, 4200);
        this.sheet = null; this.paint();
    }

    // ---------- members ----------
    async recruit(rawMode, rawHint) {
        if (this.busy) throw Error('Đang có thao tác nhóm chat khác diễn ra.');
        const token = capture(this.app), { mode, hint } = recruitMode(rawMode, rawHint);
        const z = this.ledger(), g = normGroup(z[KEY]);
        if (g.成员.length >= g.容量) throw Error(`Nhóm đã đầy (${g.容量} người).`);
        if (num(z.系统点) < RECRUIT_FEE) throw Error('Điểm Hệ Thống không đủ, chưa gửi lệnh chiêu mộ.');
        const history = [...g.候选历史, ...(g.候选 ? [g.候选.名称] : [])].slice(-12);
        const g1 = { ...g, 候选历史: history }, budget = num(z.系统点) - RECRUIT_FEE, maxTier = affordableTier(budget);
        const prompt = recruitPrompt(g1, { mode, hint, budget, maxTier });
        const avoid = new Set([...g.成员.map(m => m.名称), ...(mode === 'char' ? [] : history)]);
        this.busy = 'Đang tạo ứng viên chiêu mộ (chưa trừ Điểm Hệ Thống)…'; this.paint();
        let committing = false;
        try {
            let card = parseRecruit(await this.ask('Bạn là hệ thống chiêu mộ của Nhóm Chat Chư Thiên Vạn Giới.', prompt.text, 4096));
            if (!card || avoid.has(card.名称) || (prompt.target && card.档 > maxTier)) {
                card = parseRecruit(await this.ask('Bạn là hệ thống chiêu mộ của Nhóm Chat Chư Thiên Vạn Giới.', prompt.text + '\nCâu trả lời lần trước sai định dạng, trùng lặp nhân vật hoặc vượt quá bậc thực lực, vui lòng xuất lại một dòng đúng điều kiện.', 4096));
            }
            assertCapture(this.app, token);
            if (!card || avoid.has(card.名称) || (prompt.target && card.档 > maxTier)) throw Error('Không nhận được ứng viên chiêu mộ hợp lệ, không trùng lặp và đúng yêu cầu.');
            committing = true;
            await checkedCommit(this.app, token, zz => {
                const gg = normGroup(zz[KEY]);
                if (gg.rev !== g.rev || gg.成员.length >= gg.容量 || gg.成员.some(m => m.名称 === card.名称)) throw Error('Trạng thái nhóm chat đã thay đổi, chưa trừ phí, vui lòng chiêu mộ lại.');
                L.spend(zz, RECRUIT_FEE); gg.候选历史 = history; gg.候选 = { ...card, t: Date.now(), 超预算: card.档 > affordableTier(num(zz.系统点)) }; gg.rev = num(gg.rev) + 1; zz[KEY] = gg;
            });
        } catch (e) { throw Error(e.message + (committing ? '' : ' (Chưa trừ Điểm Hệ Thống chiêu mộ, lệnh gọi API có thể vẫn tính phí)')); }
        finally { this.busy = ''; this.paint(); }
    }
    // ---------- 1.1.5 从世界书召唤 ----------
    /** Lists entries of the chosen book that match the search words (read-only). */
    async wbFind(book, q) {
        this.wb = { ...this.wb, book: String(book || ''), q: String(q || '').trim().slice(0, 40), err: '', hits: null };
        if (!this.wb.book) throw Error('Vui lòng chọn một cuốn Sách Thế Giới trước.');
        this.busy = 'Đang đọc Sách Thế Giới…'; this.paint();
        try {
            const list = await this.world.entries(this.wb.book);
            this.wb.hits = searchEntries(list, this.wb.q, 30).map(e => ({ uid: e.uid, title: entryTitle(e), keys: entryKeys(e).slice(0, 6), text: String(e.content || '').replace(/\s+/g, ' ').slice(0, 90) }));
        } catch (e) { this.wb.err = errorLine(e); } finally { this.busy = ''; this.paint(); }
    }
    /** Turns one worldbook entry into the recruit candidate (same fee and invite flow as 招募令). */
    async summon(book, uid) {
        if (this.busy) throw Error('Đang có thao tác nhóm chat khác diễn ra.');
        const token = capture(this.app), z = this.ledger(), g = normGroup(z[KEY]);
        if (g.成员.length >= g.容量) throw Error(`Nhóm đã đầy (${g.容量} người).`);
        if (num(z.系统点) < RECRUIT_FEE) throw Error('Điểm Hệ Thống không đủ, chưa gửi lệnh triệu hồi.');
        if (g.成员.some(m => m.来源 && m.来源.book === book && String(m.来源.uid) === String(uid))) throw Error('Nhân vật của mục này đã ở trong nhóm rồi.');
        const entry = await this.world.entry({ book, uid }); if (!entry) throw Error('Không tìm thấy mục này trong Sách Thế Giới (có thể đã bị xóa).');
        const tiers = L.TIERS.slice(1).map((t, i) => `${i + 1}=${t.n}`).join(', ');
        this.busy = 'Đang triệu hồi (chưa trừ Điểm Hệ Thống)…'; this.paint();
        let committing = false;
        try {
            const prompt = summonPrompt(entry, book, { tiers, maxTier: affordableTier(num(z.系统点) - RECRUIT_FEE) });
            let card = parseRecruit(await this.ask('Bạn là hệ thống triệu hồi của Nhóm Chat Chư Thiên Vạn Giới, chỉ tổng hợp hồ sơ dựa theo mục Sách Thế Giới được cung cấp.', prompt, 4096));
            if (!card) card = parseRecruit(await this.ask('Bạn là hệ thống triệu hồi của Nhóm Chat Chư Thiên Vạn Giới, chỉ tổng hợp hồ sơ dựa theo mục Sách Thế Giới được cung cấp.', prompt + '\nCâu trả lời lần trước sai định dạng, vui lòng xuất đúng một dòng.', 4096));
            assertCapture(this.app, token);
            if (!card) throw Error('Không nhận được hồ sơ thành viên nhóm hợp lệ.');
            if (g.成员.some(m => m.名称 === card.名称)) throw Error(`${card.名称} đã ở trong nhóm rồi.`);
            const src = { book: String(book).slice(0, 80), uid: entry.uid, comment: entryTitle(entry) };
            committing = true;
            await checkedCommit(this.app, token, zz => {
                const gg = normGroup(zz[KEY]);
                if (gg.rev !== g.rev || gg.成员.length >= gg.容量 || gg.成员.some(m => m.名称 === card.名称)) throw Error('Trạng thái nhóm chat đã thay đổi, chưa trừ phí, vui lòng triệu hồi lại.');
                L.spend(zz, RECRUIT_FEE); gg.候选 = { ...card, 来源: src, t: Date.now(), 超预算: card.档 > affordableTier(num(zz.系统点)) }; gg.rev = num(gg.rev) + 1; zz[KEY] = gg;
            });
        } catch (e) { throw Error(e.message + (committing ? '' : ' (Chưa trừ Điểm Hệ Thống triệu hồi, lệnh gọi API có thể vẫn tính phí)')); }
        finally { this.busy = ''; this.paint(); }
    }
    wbView(g, z) {
        if (this.app.settings?.get('groupWorld')?.read === false) return '';
        let names = this.world.names(); const active = this.world.active().filter(n => names.includes(n));
        if (!names.length) { this.bridge.prefetchWorldbooks?.()?.then?.(() => { if (this.world.names().length && this.visible()) this.paint(); }); }
        names = [...active, ...names.filter(n => !active.includes(n))];
        const book = this.wb.book && names.includes(this.wb.book) ? this.wb.book : names[0] || '';
        const inGroup = new Set(g.成员.filter(m => m.来源?.book === book).map(m => String(m.来源.uid)));
        const hits = this.wb.hits && this.wb.book === book ? this.wb.hits : null;
        return `<section class="zt-card zt-g-wb"><h3>Triệu hồi từ Sách Thế Giới <small>Chỉ đọc Sách Thế Giới của bạn · Mỗi lần ${RECRUIT_FEE} điểm (thất bại hoàn lại) · Phí vào nhóm tính theo bậc thực lực · Thành viên được triệu hồi sẽ nhớ chuyện trong nhóm chat</small></h3>
<div class="zt-g-row"><select data-f="wbook" aria-label="Sách Thế Giới">${names.length ? names.map(n => `<option value="${esc(n)}" ${n === book ? 'selected' : ''}>${active.includes(n) ? '★ ' : ''}${esc(n)}</option>`).join('') : '<option value="">(Không đọc được danh sách Sách Thế Giới)</option>'}</select><input type="text" data-f="wq" maxlength="40" value="${esc(this.wb.q)}" placeholder="Tên nhân vật hoặc từ khóa, để trống để liệt kê tất cả" aria-label="Tìm kiếm mục Sách Thế Giới"><button type="button" class="zt-btn small" data-g="wb-find" ${this.busy || !names.length ? 'disabled' : ''}>Tìm kiếm</button></div>
<small class="zt-note">★ = Sách Thế Giới cuộc trò chuyện hiện tại đang dùng. Không làm thay đổi tệp Sách Thế Giới; thành viên nhóm chỉ ghi lại 「xuất thân từ mục nào của cuốn sách nào」, khi trò chuyện nhóm sẽ đọc nội dung mục đó, và khi chính văn nhắc tới họ sẽ mang ký ức trò chuyện nhóm vào cốt truyện (Cài đặt → Công tắc tính năng → Nhóm chat).</small>
${this.wb.err ? `<p class="zt-g-warn">${esc(this.wb.err)}</p>` : ''}
${hits ? (hits.length ? `<div class="zt-g-wblist">${hits.map(h => `<div class="zt-g-wbhit"><div><b>${esc(h.title)}</b>${h.keys.length ? ` <small>${esc(h.keys.join(', '))}</small>` : ''}<p>${esc(h.text)}</p></div>${inGroup.has(String(h.uid)) ? '<span class="zt-chip">Đã ở trong nhóm</span>' : `<button type="button" class="zt-btn small primary" data-wb-summon="${esc(String(h.uid))}" data-book="${esc(book)}" ${this.busy || g.成员.length >= g.容量 || g.候选 ? 'disabled' : ''} ${g.候选 ? 'title="Hãy xử lý ứng viên hiện tại trước (mời vào hoặc bỏ qua)"' : ''}>Triệu hồi</button>`}</div>`).join('')}</div>` : '<p class="zt-sub">Không có mục nào khớp.</p>') : ''}
</section>`;
    }
    joinPrice(c) { return JOIN_PRICE[Math.max(1, Math.min(8, c.档 | 0))] || JOIN_PRICE[1]; }
    async invite() {
        const out = await this.write((g, z) => {
            const c = g.候选; if (!c) throw Error('Không có ứng viên nào.');
            if (g.成员.length >= g.容量) throw Error(`Nhóm đã đầy (${g.容量} người).`);
            const price = this.joinPrice(c);
            if (num(z.系统点) < price) throw Error(`Phí vào nhóm là ${fmtNum(price)} điểm, hiện tại chỉ có ${fmtNum(num(z.系统点))} điểm. Có thể bấm 「Bỏ qua」 rồi chiêu mộ một người có bậc thực lực thấp hơn.`);
            L.spend(z, price);
            const m = { id: rid('m'), 名称: c.名称, 世界: c.世界, 档: c.档, 性格: c.性格, 特产: c.特产, 好感: 20, 身份: '群员', 禁言轮: 0, 加入: Date.now(), ...(c.来源 ? { 来源: c.来源 } : {}) };
            g.成员.push(m); g.候选 = null; this.say(g, 'sys', `${m.名称} (${m.世界}·${this.tierName(m.档)}) đã tham gia nhóm chat.`, { kind: 'sys' });
            return m;
        });
        this.toast(`${out.名称} đã vào nhóm.`, 3000); this.syncPrompt(); this.paint();
    }
    async expand() {
        const out = await this.write((g, z) => { if (g.容量 >= MAX_MEMBERS) throw Error('Đã đạt sức chứa tối đa.'); const cost = expandCost(g.容量); L.spend(z, cost); g.容量 += 5; this.say(g, 'sys', `Nhóm đã mở rộng lên ${g.容量} người.`, { kind: 'sys' }); return { cost, cap: g.容量 }; });
        this.toast(`Đã mở rộng lên ${out.cap} người (${fmtNum(out.cost)} điểm).`); this.paint();
    }
    async admin(id, act) {
        await this.write(g => {
            const i = g.成员.findIndex(m => m.id === id); if (i < 0) throw Error('Thành viên nhóm không tồn tại.'); const m = g.成员[i];
            if (act === 'kick') { g.成员.splice(i, 1); this.say(g, 'sys', `${m.名称} đã bị đưa ra khỏi nhóm chat.`, { kind: 'sys' }); if (g.降临?.id === id) g.降临 = null; }
            else if (act === 'mute') { m.禁言轮 = num(m.禁言轮) > 0 ? 0 : 3; this.say(g, 'sys', m.禁言轮 ? `${m.名称} bị cấm chat 3 lượt.` : `Đã gỡ cấm chat cho ${m.名称}.`, { kind: 'sys' }); }
            else if (act === 'op') { m.身份 = m.身份 === '管理员' ? '群员' : '管理员'; this.say(g, 'sys', `${m.名称} ${m.身份 === '管理员' ? 'đã trở thành Quản trị viên' : 'không còn là Quản trị viên'}.`, { kind: 'sys' }); }
        });
        this.syncPrompt(); this.paint();
    }
    descendCost(m) { return Math.max(100, Math.floor((L.TIERS[m.档] || L.TIERS[1]).p / 10)); }
    async descend(id, turns = 3) {
        const out = await this.write((g, z) => {
            const m = g.成员.find(x => x.id === id); if (!m) throw Error('Thành viên nhóm không tồn tại.');
            if (g.降临) throw Error(`${g.降临.名称} đang trong trạng thái giáng lâm.`);
            const cost = this.descendCost(m); L.spend(z, cost);
            g.降临 = { id: m.id, 名称: m.名称, 世界: m.世界, 档: m.档, 性格: m.性格, 轮: turns };
            this.say(g, 'sys', `${m.名称} thông qua nhóm chat giáng lâm tới bên cạnh Ký chủ (${turns} lượt).`, { kind: 'sys' }); return { m, cost };
        });
        this.syncPrompt(); this.toast(`${out.m.名称} đã giáng lâm (${fmtNum(out.cost)} điểm), sẽ xuất hiện trong 3 lượt cốt truyện tiếp theo.`, 4200); this.paint();
    }
    async privateSay(id, text) {
        const token = capture(this.app);
        text = clip(text, 300); if (!text) return; const m = this.member(id); if (!m) throw Error('Thành viên nhóm không tồn tại.');
        const log = (this.group().私聊[id] || []).slice(-10).map(x => `${x.me ? 'Ký chủ' : m.名称}: ${x.text}`).join('\n');
        this.busy = `${m.名称} đang nhập…`; this.paint();
        try {
            const wbBlock = m.来源 ? await this.world.block(this.group(), text + '\n' + log, [id]).catch(() => '') : '';
            const reply = await this.ask(`Bạn là trò chuyện riêng của thành viên Nhóm Chat Chư Thiên Vạn Giới: bạn nhập vai ${m.名称} (${m.世界}·${this.tierName(m.档)}·${m.性格}), đang trò chuyện riêng với chủ nhóm. Chỉ xuất một đoạn phản hồi của ${m.名称} bằng tiếng Việt, không viết lời dẫn旁白, không quá 120 chữ.${wbBlock ? '\n' + wbBlock : ''}`, `Độ hảo cảm với Ký chủ: ${num(m.好感, 20)}/100\n${log ? 'Trò chuyện riêng gần đây:\n' + log + '\n' : ''}Ký chủ: ${text}`, 400);
            await this.write(g => { const arr = g.私聊[id] = Array.isArray(g.私聊[id]) ? g.私聊[id] : []; arr.push({ me: true, text, t: Date.now() }, { me: false, text: clip(reply.replace(/^.{0,24}[:：]\s*/, ''), 300), t: Date.now() }); if (arr.length > MAX_PM) arr.splice(0, arr.length - MAX_PM); }, token);
        } finally { this.busy = ''; this.paint(); }
    }

    // ---------- daily / market / help / live ----------
    async signIn() {
        const out = await this.write((g, z) => {
            if (g.签到.day === today()) throw Error('Hôm nay đã điểm danh rồi.');
            const y = new Date(Date.now() - 864e5).toLocaleDateString('sv-SE');
            g.签到.streak = g.签到.day === y ? g.签到.streak + 1 : 1; g.签到.day = today(); g.签到.total++;
            const pts = signReward(g.签到.streak, g.成员.length); L.earn(z, pts);
            this.say(g, 'sys', `Điểm danh thành công: liên tiếp ${g.签到.streak} ngày, +${pts} Điểm Hệ Thống · Đã nhập kho`, { kind: 'sys' }); this.booked(g, `${pts} Điểm Hệ Thống`, 'Điểm danh nhóm', 'Điểm danh'); return { pts, streak: g.签到.streak };
        });
        this.toast(`Điểm danh +${out.pts} Điểm Hệ Thống (liên tiếp ${out.streak} ngày) · Đã nhập kho`); this.paint();
    }
    marketList(g, z) {
        if (g.集市.day === today() && Array.isArray(g.集市.list)) return g.集市.list;
        const list = g.成员.map(m => { const grade = L.giftCap(z, m.档); const price = Math.round(L.TIER_PRICE[grade] * (0.8 + Math.random() * 0.7)); return { id: rid('mk'), from: m.id, 名称: m.名称, 世界: m.世界, item: { 名称: m.特产 || `Đặc sản ${m.世界}`, 品级: grade, 分类: '其他', 效果: `Đặc sản của ${m.世界}` }, price }; });
        g.集市 = { day: today(), list }; return list;
    }
    async refreshMarket() { await this.write((g, z) => { g.集市 = { day: '', list: [] }; this.marketList(g, z); }); this.paint(); }
    async buy(id) {
        const out = await this.write((g, z) => {
            const list = this.marketList(g, z), i = list.findIndex(x => x.id === id); if (i < 0) throw Error('Món hàng này đã bán rồi.');
            const x = list[i]; L.spend(z, x.price); L.bagAdd(z, { ...x.item, 来源: groupSource(`${x.名称}@${x.世界}`, 'Mua ở chợ phiên'), 价格: x.price }, 1); list.splice(i, 1);
            this.say(g, 'sys', `Bạn đã mua ${x.item.名称} (${L.gradeLabel(x.item.品级)}) từ ${x.名称}@${x.世界} · ${fmtNum(x.price)} điểm · Đã nhập kho`, { kind: 'sys' }); this.booked(g, `${x.item.名称} (${L.gradeLabel(x.item.品级)})`, `${x.名称}@${x.世界}`, 'Mua ở chợ phiên'); return x;
        });
        this.toast(`Đã nhập kho: ${out.item.名称} (Nguồn ${out.名称}@${out.世界})`); this.paint();
    }
    valueOf(it) { return num(it.价格) || L.TIER_PRICE[it.品级] || 100; }
    async listForSale(bagIndex, price) {
        await this.write((g, z) => {
            const it = L.bagTake(z, Math.floor(num(bagIndex, -1)), 1); if (it.品级 === '禁忌') throw Error('Vật phẩm Cấm kỵ nghiêm cấm lưu thông trong nhóm.');
            const p = Math.max(1, Math.floor(num(price) || this.valueOf(it)));
            g.挂单.push({ id: rid('sl'), item: it, price: p, value: this.valueOf(it), t: Date.now() });
            this.say(g, 'me', `Treo đơn bán ${it.名称} (${L.gradeLabel(it.品级)}), giá ${fmtNum(p)} Điểm Hệ Thống, ai quan tâm nhắn riêng nhé.`, { kind: 'trade' });
        });
        this.paint();
    }
    async hawk(id) {
        const out = await this.write((g, z) => {
            const i = g.挂单.findIndex(x => x.id === id); if (i < 0) throw Error('Đơn treo không tồn tại.'); const s = g.挂单[i];
            if (!g.成员.length) throw Error('Trong nhóm chưa có ai có thể mua.');
            if (s.price > s.value * 1.3) { const m = g.成员[Math.floor(Math.random() * g.成员.length)]; this.say(g, m.id, `${s.item.名称} hả? Giá này hơi chát đấy, bớt chút đi rồi tính.`); return { sold: false, who: m.名称 }; }
            const m = g.成员[Math.floor(Math.random() * g.成员.length)]; g.挂单.splice(i, 1); L.earn(z, s.price);
            this.say(g, m.id, `${s.item.名称} để tôi lấy cho!`); this.booked(g, `Bán ${s.item.名称} thu được ${fmtNum(s.price)} Điểm Hệ Thống`, `${m.名称}@${m.世界}`, 'Bán ở chợ phiên'); this.say(g, 'sys', `${m.名称}@${m.世界} đã mua ${s.item.名称}, +${fmtNum(s.price)} Điểm Hệ Thống · Đã nhập kho`, { kind: 'sys' });
            return { sold: true, who: m.名称, price: s.price };
        });
        this.toast(out.sold ? `${out.who} đã mua, +${fmtNum(out.price)} Điểm Hệ Thống · Đã nhập kho` : `${out.who} chê đắt (vượt quá 30% định giá gốc).`); this.paint();
    }
    async unlist(id) {
        await this.write((g, z) => { const i = g.挂单.findIndex(x => x.id === id); if (i < 0) return; const s = g.挂单.splice(i, 1)[0]; L.bagAdd(z, s.item, s.item.数量 || 1); });
        this.paint();
    }
    async help(text, memberId) {
        const token = capture(this.app);
        text = clip(text, 200); if (!text) throw Error('Hãy viết việc cần cầu viện trước.');
        const g0 = this.group(), m = g0.成员.find(x => x.id === memberId) || g0.成员[Math.floor(Math.random() * g0.成员.length)];
        if (!m) throw Error('Trong nhóm chưa có thành viên nào.');
        this.busy = `${m.名称} đang nghĩ cách…`; this.paint();
        try {
            const reply = await this.ask('Bạn là hệ thống phát hành nhiệm vụ của Nhóm Chat Chư Thiên Vạn Giới.', `Ký chủ cầu viện trong nhóm: 「${text}」. Người phản hồi: ${m.名称} (${m.世界}·${this.tierName(m.档)}).
Hãy biến lời cầu viện lần này thành một nhiệm vụ mà Ký chủ có thể đi hoàn thành. Chỉ xuất đúng một dòng bằng tiếng Việt, phân cách bằng dấu gạch đứng: Tên nhiệm vụ (trong 12 chữ)|Nội dung nhiệm vụ (trong 60 chữ, viết rõ đi đâu, làm gì)|Phần thưởng (ví dụ 3000 Điểm Hệ Thống, hoặc một vật phẩm nào đó)`, 4096);
            const [名称, 内容, 奖励] = (String(reply).split('\n').find(s => s.includes('|')) || '').split('|').map(s => clip(s, 80));
            if (!名称) throw Error('Không tạo được nhiệm vụ hợp lệ (không thể phân tích đầu ra của mô hình).');
            const task = await this.write((g, z) => {
                z.任务库 = z.任务库 && typeof z.任务库 === 'object' && !Array.isArray(z.任务库) ? z.任务库 : {};
                const ID = rid('grp_').replace(/[^A-Za-z0-9_-]/g, '');
                z.任务库[ID] = { ID, 名称: 名称.slice(0, 24), 内容: 内容 || text, 奖励: 奖励 || 'Chưa ghi nhận phần thưởng', 完成度: 0, 类型: '短期', 状态: '待接取', 来源: `Cầu viện nhóm chat · ${m.名称}@${m.世界}` };
                this.say(g, 'me', `Cầu viện: ${text}`); this.say(g, m.id, `Chuyện này tôi có cách. Đã gửi nhiệm vụ 「${名称}」 cho bạn rồi đấy: ${内容}`, { kind: 'task', task: ID });
                return z.任务库[ID];
            }, token);
            this.toast(`Nhiệm vụ 「${task.名称}」 đã vào Kho nhiệm vụ (Chờ nhận).`, 3600, { label: 'Tới trang Nhiệm vụ', run: () => this.hub.go('task') });
        } finally { this.busy = ''; this.paint(); }
    }
    async live(memberId) {
        const token = capture(this.app);
        const g0 = this.group(), m = g0.成员.find(x => x.id === memberId) || g0.成员[Math.floor(Math.random() * g0.成员.length)];
        if (!m) throw Error('Trong nhóm chưa có thành viên nào.');
        this.busy = `${m.名称} đang mở phát sóng trực tiếp…`; this.paint();
        try {
            const reply = await this.ask('Bạn là tính năng phát sóng trực tiếp của Nhóm Chat Chư Thiên Vạn Giới.', `${m.名称} (${m.世界}·${this.tierName(m.档)}·${m.性格}) mở một buổi phát sóng trực tiếp trong nhóm để cho Ký chủ xem những gì đang diễn ra ngay lúc này tại thế giới của mình. Hãy dùng ngôi thứ ba viết 3–5 dòng khung cảnh phát sóng bằng tiếng Việt, mỗi dòng không quá 50 chữ, chỉ xuất phần mô tả khung cảnh.`, 500);
            const lines = String(reply).split('\n').map(s => clip(s, 80)).filter(Boolean).slice(0, 5);
            if (!lines.length) throw Error('Tín hiệu phát sóng trực tiếp bị gián đoạn (mô hình không trả về nội dung).');
            await this.write(g => { this.say(g, m.id, lines.join('\n'), { kind: 'live' }); }, token);
        } finally { this.busy = ''; this.paint(); }
    }
    async saveMeta(patch) {
        await this.write(g => {
            if ('群名' in patch) g.群名 = clip(patch.群名 || 'Nhóm Chat Chư Thiên Vạn Giới', 20);
            if ('公告' in patch) g.公告 = clip(patch.公告, 200);
            if ('群规' in patch) g.群规 = String(patch.群规).split('\n').map(s => clip(s, 80)).filter(Boolean).slice(0, 12);
            if ('自动闲聊' in patch) g.设置.自动闲聊 = !!patch.自动闲聊;
            if ('摘要注入' in patch) g.设置.摘要注入 = !!patch.摘要注入;
            if ('闲聊间隔' in patch && CHAT_EVERY.includes(num(patch.闲聊间隔))) { g.设置.闲聊间隔 = num(patch.闲聊间隔); g.节奏.闲聊 = 0; }
            // 1.1.4 群聊生成: only listed values; 下限 > 上限 pulls the other one along
            if ('发言下限' in patch && GROUP_SPEAKERS.includes(num(patch.发言下限))) { g.设置.发言下限 = num(patch.发言下限); if (g.设置.发言上限 < g.设置.发言下限) g.设置.发言上限 = g.设置.发言下限; }
            if ('发言上限' in patch && GROUP_SPEAKERS.includes(num(patch.发言上限))) { g.设置.发言上限 = num(patch.发言上限); if (g.设置.发言下限 > g.设置.发言上限) g.设置.发言下限 = g.设置.发言上限; }
            if ('单条字数' in patch && GROUP_CHARS.includes(num(patch.单条字数))) g.设置.单条字数 = num(patch.单条字数);
            if ('上下文' in patch && GROUP_CONTEXT.includes(num(patch.上下文))) g.设置.上下文 = num(patch.上下文);
            if ('输出上限' in patch && GROUP_TOKENS.includes(num(patch.输出上限))) g.设置.输出上限 = num(patch.输出上限);
        });
        this.syncPrompt(); this.paint();
    }

    // ---------- UI ----------
    render(el) { this.el = el; this.paint(true); }
    paint(force = false) {
        const el = this.el; if (!el || (!force && !this.visible())) return;
        const z = this.ledger();
        if (!z) { el.innerHTML = `<div class="zt-empty">Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên.<br>Sau khi tạo tại 「Cài đặt → Khởi tạo cuộc trò chuyện mới」, bạn sẽ có thể lập Nhóm Chat Chư Thiên Vạn Giới.</div>`; return; }
        const g = normGroup(z[KEY]), keepScroll = el.querySelector('.zt-g-log'), atBottom = !keepScroll || keepScroll.scrollHeight - keepScroll.scrollTop - keepScroll.clientHeight < 40;
        const draft = el.querySelector('#zt-g-input')?.value || '';
        const oldInput = el.querySelector('#zt-g-input'), hadFocus = !!oldInput && el.getRootNode?.().activeElement === oldInput, caret = hadFocus ? oldInput.selectionStart : null, oldTop = keepScroll?.scrollTop || 0;
        const tabs = [['chat', 'Trò chuyện'], ['members', `Thành viên ${g.成员.length}/${g.容量}`], ['market', 'Chợ phiên'], ['admin', 'Quản trị nhóm']];
        el.innerHTML = `<div class="zt-g">
<header class="zt-g-head"><div><b>${esc(g.群名)}</b><small>${g.成员.length} thành viên · Thương thành Lv${L.shopLevel(z)} · Giới hạn lì xì ${L.gradeLabel(L.GRADES[Math.min(L.shopLevel(z), 4) - 1])}</small></div>
<nav class="zt-g-tabs" role="tablist">${tabs.map(([k, t]) => `<button type="button" role="tab" data-gtab="${k}" aria-selected="${this.view === k}">${esc(t)}</button>`).join('')}</nav></header>
${g.待领取.length ? `<div class="zt-g-claims"><span>🎁 Chờ nhận ${g.待领取.length}</span>${g.待领取.slice(0, 6).map(x => `<button type="button" class="zt-btn small primary" data-claim="${x.id}">${esc(x.item.名称)} (${L.gradeLabel(x.item.品级)}) · ${esc(x.名称)}${x.downgraded ? ' · Đã hạ cấp theo nội quy nhóm' : ''}</button>`).join('')}</div>` : ''}
<div class="zt-g-body">${this.view === 'members' ? this.membersView(g, z) : this.view === 'market' ? this.marketView(g, z) : this.view === 'admin' ? this.adminView(g) : this.chatView(g, z)}</div></div>`;
        const input = el.querySelector('#zt-g-input'); if (input) { input.value = draft; if (hadFocus) { try { input.focus({ preventScroll: true }); input.setSelectionRange(caret, caret); } catch { } } }
        const log = el.querySelector('.zt-g-log'); if (log) log.scrollTop = atBottom ? log.scrollHeight : oldTop;
        if (!this.bound) { this.bound = true; el.addEventListener('click', e => this.onClick(e)); el.addEventListener('change', e => { const sel = e.target.closest?.('[data-g-sel=every]'); if (sel) this.saveMeta({ 闲聊间隔: Number(sel.value) }).catch(err => this.fail(err)); const gs = e.target.closest?.('[data-g-set]'); if (gs) this.saveMeta({ [gs.dataset.gSet]: Number(gs.value) }).catch(err => this.fail(err)); if (e.target.matches?.('[data-f=rmode]')) this.recruitModeChanged(); }); el.addEventListener('input', e => { if (e.target.matches?.('[data-f=rhint]')) this.recruitHintTyped(); }); el.addEventListener('keydown', e => { if (e.target.id === 'zt-g-input' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); el.querySelector('[data-g=send]')?.click(); } }); }
    }
    avatar(m) { const h = [...String(m?.名称 || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360; return `<span class="zt-g-av" style="background:hsl(${h} 45% 38%)">${esc(String(m?.名称 || '?').slice(0, 1))}</span>`; }
    chatView(g, z) {
        const name = id => g.成员.find(m => m.id === id);
        const rows = g.消息.map(msg => {
            const del = this.manage ? `<button type="button" class="zt-btn small zt-g-del" data-gdel="${esc(msg.id)}" title="Xóa tin nhắn này" aria-label="Xóa tin nhắn này">🗑</button>` : '';
            if (msg.kind === 'sys' || msg.from === 'sys') return `<div class="zt-g-sys">${esc(msg.text)}${del}</div>`;
            const me = msg.from === 'me', m = me ? null : name(msg.from) || { 名称: 'Đã rời nhóm', 世界: '' };
            let body = `<div class="zt-g-text">${esc(msg.text).replace(/\n/g, '<br>')}</div>`;
            if (rebookable(msg)) body += `<div class="zt-g-gift">🧧 Lì xì này lúc trước chưa nhận diện được <button type="button" class="zt-btn small" data-rebook="${esc(msg.id)}">Ghi bù</button></div>`;
            if (msg.kind === 'packet') {
                const p = g.红包[msg.ref];
                const mine = p?.grabs.find(x => x.who === 'me'), left = p ? p.shares.length - p.grabs.length : 0;
                const what = p?.kind === 'points' ? `${fmtNum(p.total)} Điểm Hệ Thống · ${p.shares.length} phần` : p ? `${esc(p.item?.名称)} (${L.gradeLabel(p.item?.品级)})×${p.total}` : '';
                const state = !p ? 'Đã hết hạn' : me ? `Đã được ${p.grabs.length} người giật` : mine ? `Đã giật được ${p.kind === 'points' ? fmtNum(mine.v) + ' điểm' : '×' + mine.v} · Đã nhập kho` : left ? '' : 'Đã bị giật hết';
                body = `<div class="zt-g-packet${state ? ' done' : ''}"><b>🧧 ${esc(msg.text)}</b><small>${what}${p?.downgraded ? ' · Đã hạ cấp theo nội quy nhóm' : ''}</small>${!me && p && !mine && left ? `<button type="button" class="zt-btn small" data-grab="${p.id}">Giật</button>` : `<em>${esc(state)}</em>`}</div>`;
            } else if (msg.kind === 'gift') {
                const pending = g.待领取.some(x => x.id === msg.gift);
                body += `<div class="zt-g-gift">🎁 ${esc(msg.label || 'Quà tặng')} ${pending ? `<button type="button" class="zt-btn small primary" data-claim="${msg.gift}">Nhận</button>` : '<em>Đã nhận</em>'}</div>`;
            } else if (msg.kind === 'live') body = `<div class="zt-g-live"><b>● Đang phát trực tiếp</b>${esc(msg.text).replace(/\n/g, '<br>')}</div>`;
            else if (msg.kind === 'task') body += `<div class="zt-g-gift">📜 Đã vào Kho nhiệm vụ <button type="button" class="zt-btn small" data-g="to-task">Xem</button></div>`;
            return `<div class="zt-g-msg${me ? ' me' : ''}">${me ? '' : this.avatar(m)}<div class="zt-g-bub">${me ? '' : `<div class="zt-g-who">${esc(m.名称)}<small>${esc(m.世界 || '')}${m.档 ? ' · ' + esc(this.tierName(m.档)) : ''}</small></div>`}${body}</div>${del}</div>`;
        }).join('');
        const sheet = this.sheet === 'packet' ? this.packetSheet(z) : this.sheet === 'help' ? this.helpSheet(g) : '';
        return `<div class="zt-g-log" aria-live="polite">${g.公告 ? `<div class="zt-g-notice">📌 ${esc(g.公告)}</div>` : ''}${rows || `<div class="zt-empty">${g.成员.length ? 'Hãy nói gì đó đi, các thành viên nhóm đều đang có mặt.' : 'Trong nhóm chưa có ai. Hãy sang trang 「Thành viên」 để phát lệnh chiêu mộ.'}</div>`}${this.busy ? `<div class="zt-g-sys typing">${esc(this.busy)}</div>` : ''}</div>
${sheet}
<div class="zt-g-tools"><button type="button" class="zt-btn small" data-g="sheet-packet">🧧 Phát lì xì</button><button type="button" class="zt-btn small" data-g="sign" ${g.签到.day === today() ? 'disabled' : ''}>${g.签到.day === today() ? `Đã điểm danh · ${g.签到.streak} ngày` : 'Điểm danh'}</button><button type="button" class="zt-btn small" data-g="sheet-help">Cầu viện</button><button type="button" class="zt-btn small" data-g="live">Phát trực tiếp</button><button type="button" class="zt-btn small" data-g="reroll" ${this.busy || !g.轮次.length ? 'disabled' : ''} title="${esc(roundBlocked(g, g.轮次.at(-1)) || 'Dùng cùng đầu vào để tạo lại lượt phát biểu gần nhất của thành viên nhóm')}">↻ Roll lại</button><button type="button" class="zt-btn small" data-g="manage" aria-pressed="${!!this.manage}">${this.manage ? '✓ Xong' : '🗑 Quản lý'}</button><label class="zt-g-auto" title="Sau mỗi lượt phản hồi cốt truyện, thành viên nhóm tự động tán gẫu vài câu trong nhóm"><input type="checkbox" data-g="auto" ${g.设置.自动闲聊 ? 'checked' : ''}> Tự động tán gẫu</label></div>
<div class="zt-g-send"><textarea id="zt-g-input" rows="1" maxlength="300" placeholder="${g.成员.length ? 'Gửi tin nhắn vào nhóm (Enter để gửi)' : 'Chiêu mộ thành viên nhóm trước'}" ${this.busy ? 'disabled' : ''}></textarea><button type="button" class="zt-btn primary" data-g="send" ${this.busy || !g.成员.length ? 'disabled' : ''}>Gửi</button></div>`;
    }
    packetSheet(z) {
        const bag = Array.isArray(z.背包) ? z.背包 : [];
        return `<div class="zt-g-sheet" data-sheet="packet"><b>Phát lì xì</b>
<div class="zt-g-row"><label><input type="radio" name="zt-g-pk" value="points" checked> Điểm Hệ Thống</label><input type="number" data-f="amount" min="1" value="1000" aria-label="Số tiền"><span>chia</span><input type="number" data-f="count" min="1" max="30" value="3" aria-label="Số phần"><span>phần</span></div>
<div class="zt-g-row"><label><input type="radio" name="zt-g-pk" value="item" ${bag.length ? '' : 'disabled'}> Vật phẩm</label><select data-f="bag" aria-label="Vật phẩm túi đồ">${bag.map((it, i) => `<option value="${i}" ${it.品级 === '禁忌' ? 'disabled' : ''}>${esc(it.名称)} (${esc(L.gradeLabel(it.品级))})×${num(it.数量, 1)}</option>`).join('') || '<option value="">Túi đồ đang trống</option>'}</select><input type="number" data-f="qty" min="1" value="1" aria-label="Số lượng"><span>món</span></div>
<div class="zt-g-row"><input type="text" data-f="note" maxlength="40" placeholder="Lời chúc (tùy chọn)"><button type="button" class="zt-btn primary small" data-g="packet-go">Nhét vào lì xì</button><button type="button" class="zt-btn small" data-g="sheet-close">Hủy</button></div>
<small>Điểm Hệ Thống/vật phẩm sẽ được trừ khỏi sổ cái và đọc ngược lại xác nhận trước khi phát ra; thành viên nhóm giật được sẽ tăng hảo cảm, có thể gửi quà đáp lễ (Chờ nhận). Mỗi ngày phát tối đa ${DAILY_OUT} cái.</small></div>`;
    }
    helpSheet(g) {
        return `<div class="zt-g-sheet" data-sheet="help"><b>Cầu viện trong nhóm</b><div class="zt-g-row"><input type="text" data-f="help" maxlength="200" placeholder="Ví dụ: Muốn tìm một bộ công pháp có thể tu bổ kinh mạch"><select data-f="helper"><option value="">Thành viên ngẫu nhiên</option>${g.成员.map(m => `<option value="${m.id}">${esc(m.名称)}</option>`).join('')}</select></div>
<div class="zt-g-row"><button type="button" class="zt-btn primary small" data-g="help-go">Gửi cầu viện</button><button type="button" class="zt-btn small" data-g="sheet-close">Hủy</button><small>Sẽ tạo ra một nhiệm vụ “Chờ nhận” và đưa vào Kho nhiệm vụ.</small></div></div>`;
    }
    membersView(g, z) {
        const c = g.候选, pm = this.pm && g.成员.find(m => m.id === this.pm), pulled = new Set((Array.isArray(z?.羁绊库) ? z.羁绊库 : []).map(p => p?.群员ID).filter(Boolean));
        const recruit = `<section class="zt-card"><h3>Phát lệnh chiêu mộ <small>Mỗi lần ${RECRUIT_FEE} điểm (thất bại hoàn lại) · Phí vào nhóm tính theo bậc thực lực · Chiêu mộ ngẫu nhiên sẽ chọn bậc thực lực vừa với Điểm Hệ Thống của bạn</small></h3>
<div class="zt-g-row"><select data-f="rmode"><option value="rand">Thế giới ngẫu nhiên</option><option value="world">Chỉ định thế giới</option><option value="char">Chỉ định nhân vật</option></select><input type="text" data-f="rhint" maxlength="30" placeholder="${RECRUIT_PLACEHOLDER.rand}" aria-label="Tên thế giới hoặc nhân vật"><button type="button" class="zt-btn primary small" data-g="recruit" ${this.busy || g.成员.length >= g.容量 ? 'disabled' : ''}>Phát lệnh</button></div>
${c ? `<div class="zt-g-cand">${this.avatar(c)}<div><b>${esc(c.名称)}</b> <small>${esc(c.世界)} · ${esc(this.tierName(c.档))}${c.来源 ? ` · 📖 ${esc(c.来源.book)} / ${esc(c.来源.comment || '')}` : ''}</small><p>${esc(c.性格)} · Đặc sản: ${esc(c.特产)}</p></div><button type="button" class="zt-btn primary small" data-g="invite" ${num(z.系统点) < this.joinPrice(c) ? 'title="Điểm Hệ Thống không đủ"' : ''}>Mời vào nhóm · ${fmtNum(this.joinPrice(c))} điểm</button>${num(z.系统点) < this.joinPrice(c) ? `<small class="zt-g-warn">Điểm Hệ Thống không đủ (hiện có ${fmtNum(num(z.系统点))}). Sau khi bỏ qua rồi chiêu mộ lại sẽ đổi sang người khác.</small>` : ''}<button type="button" class="zt-btn small" data-g="drop-cand">Bỏ qua</button></div>` : ''}
<div class="zt-g-row"><span>Sức chứa ${g.成员.length}/${g.容量}</span><button type="button" class="zt-btn small" data-g="expand" ${g.容量 >= MAX_MEMBERS ? 'disabled' : ''}>Mở rộng +5 · ${fmtNum(expandCost(g.容量))} điểm</button></div></section>`;
        const list = g.成员.map(m => `<div class="zt-g-member${pm?.id === m.id ? ' open' : ''}">${this.avatar(m)}<div class="zt-g-minfo"><b>${esc(m.名称)}${m.身份 === '管理员' ? ' <span class="zt-grade">Quản trị viên</span>' : ''}${num(m.禁言轮) > 0 ? ` <span class="zt-grade" data-g="禁忌">Cấm chat ${m.禁言轮} lượt</span>` : ''}${g.降临?.id === m.id ? ` <span class="zt-grade" data-g="仙品">Đang giáng lâm ${g.降临.轮} lượt</span>` : ''}${m.来源 ? ` <span class="zt-chip" title="Xuất thân từ Sách Thế Giới 「${esc(m.来源.book)}」 · ${esc(m.来源.comment || '')}">📖 Sách Thế Giới</span>` : ''}</b>
<small>${esc(m.世界)} · ${esc(this.tierName(m.档))} · ${esc(m.性格)} · Đặc sản ${esc(m.特产)}</small><i class="zt-g-fav" style="--v:${num(m.好感, 20)}%" title="Hảo cảm ${num(m.好感, 20)}"></i></div>
<div class="zt-actions"><button type="button" class="zt-btn small" data-pm="${m.id}">Nhắn riêng</button>${pulled.has(m.id) ? `<button type="button" class="zt-btn small" data-bond-open="${m.id}" title="Đã ở trong mục Ràng buộc">Đã trong Ràng buộc</button>` : `<button type="button" class="zt-btn small" data-bond-pull="${m.id}" title="Đưa người này vào trang Ràng buộc (thành viên nhóm mặc định không vào Ràng buộc)">Kéo vào Ràng buộc</button>`}<button type="button" class="zt-btn small" data-descend="${m.id}" ${g.降临 ? 'disabled' : ''}>Giáng lâm · ${fmtNum(this.descendCost(m))}</button><button type="button" class="zt-btn small" data-live="${m.id}">Trực tiếp</button><button type="button" class="zt-btn small" data-admin="op" data-id="${m.id}">${m.身份 === '管理员' ? 'Bỏ quản trị' : 'Đặt quản trị'}</button><button type="button" class="zt-btn small" data-admin="mute" data-id="${m.id}">${num(m.禁言轮) > 0 ? 'Gỡ cấm' : 'Cấm chat'}</button><button type="button" class="zt-btn small danger" data-admin="kick" data-id="${m.id}">Trục xuất</button></div>
${pm?.id === m.id ? `<div class="zt-g-pm">${(g.私聊[m.id] || []).map(x => `<p class="${x.me ? 'me' : ''}"><b>${x.me ? 'Tôi' : esc(m.名称)}</b>${esc(x.text)}</p>`).join('') || '<p class="zt-sub">Chưa có lịch sử trò chuyện riêng.</p>'}${this.busy ? `<p class="zt-sub">${esc(this.busy)}</p>` : ''}<div class="zt-g-row"><input type="text" data-f="pm" maxlength="300" placeholder="Nhắn riêng cho ${esc(m.名称)}"><button type="button" class="zt-btn primary small" data-g="pm-send" data-id="${m.id}" ${this.busy ? 'disabled' : ''}>Gửi</button></div></div>` : ''}</div>`).join('');
        return `<div class="zt-g-scroll">${recruit}${this.wbView(g, z)}${list || '<div class="zt-empty">Chưa có thành viên nhóm nào.</div>'}</div>`;
    }
    marketView(g, z) {
        const listNow = g.集市.day === today() ? g.集市.list : null, bag = Array.isArray(z.背包) ? z.背包 : [];
        return `<div class="zt-g-scroll"><section class="zt-card"><h3>Đơn treo của thành viên nhóm <small>Làm mới mỗi ngày; phẩm giai tuân theo nội quy nhóm (≤ cấp Thương thành, ≤ thực lực thành viên)</small></h3>
${listNow ? (listNow.map(x => `<div class="zt-row"><span>${esc(x.item.名称)} <span class="zt-grade" data-g="${x.item.品级}">${L.gradeLabel(x.item.品级)}</span><span class="zt-desc">${esc(x.名称)}@${esc(x.世界)}</span></span><button type="button" class="zt-btn small" data-buy="${x.id}">${fmtNum(x.price)} điểm Mua ngay</button></div>`).join('') || '<p class="zt-sub">Hàng hôm nay đã bán hết rồi.</p>') : `<p class="zt-sub">${g.成员.length ? 'Bấm 「Xem hàng hôm nay」 để các thành viên nhóm bày sạp.' : 'Chưa có thành viên nhóm, chợ phiên vắng vẻ đìu hiu.'}</p>`}
<div class="zt-actions"><button type="button" class="zt-btn small" data-g="market" ${g.成员.length ? '' : 'disabled'}>${listNow ? 'Bày sạp lại' : 'Xem hàng hôm nay'}</button></div></section>
<section class="zt-card"><h3>Đơn treo của tôi <small>Theo định giá gốc (giá vật phẩm hoặc giá chuẩn của phẩm giai); cao hơn định giá 30% thành viên nhóm sẽ chê đắt</small></h3>
<div class="zt-g-row"><select data-f="sell">${bag.map((it, i) => `<option value="${i}" data-v="${this.valueOf(it)}">${esc(it.名称)} (${esc(L.gradeLabel(it.品级))})×${num(it.数量, 1)} · Định giá ${fmtNum(this.valueOf(it))}</option>`).join('') || '<option value="">Túi đồ đang trống</option>'}</select><input type="number" data-f="price" min="1" placeholder="Giá bán (trống = định giá)"><button type="button" class="zt-btn small" data-g="sell" ${bag.length ? '' : 'disabled'}>Treo đơn</button></div>
${g.挂单.map(s => `<div class="zt-row"><span>${esc(s.item.名称)} (${L.gradeLabel(s.item.品级)})<span class="zt-desc">Giá bán ${fmtNum(s.price)} · Định giá ${fmtNum(s.value)}</span></span><span class="zt-actions"><button type="button" class="zt-btn small primary" data-hawk="${s.id}">Rao bán</button><button type="button" class="zt-btn small" data-unlist="${s.id}">Rút đơn</button></span></div>`).join('')}</section></div>`;
    }
    adminView(g) {
        return `<div class="zt-g-scroll"><section class="zt-card"><h3>Hồ sơ nhóm</h3>
<label class="zt-field">Tên nhóm<input type="text" data-f="name" maxlength="20" value="${esc(g.群名)}"></label>
<label class="zt-field">Thông báo (ghim đầu trang, đồng thời báo cho thành viên nhóm)<textarea data-f="notice" maxlength="200">${esc(g.公告)}</textarea></label>
<label class="zt-field">Nội quy nhóm (mỗi dòng một điều; được đưa vào mỗi yêu cầu trò chuyện nhóm)<textarea data-f="rules">${esc(g.群规.join('\n'))}</textarea></label>
<div class="zt-actions"><button type="button" class="zt-btn primary small" data-g="meta">Lưu</button></div></section>
<section class="zt-card"><h3>Giới hạn sàn quy tắc <small>Không thể tắt</small></h3><p class="zt-sub">Vật phẩm do thành viên nhóm gửi tặng: phẩm giai ≤ cấp Thương thành, ≤ bậc thực lực của người tặng, nghiêm cấm vật phẩm Cấm kỵ; nếu vượt chuẩn sẽ tự động hạ xuống phẩm giai cao nhất được phép chứ không từ chối. Lì xì Điểm Hệ Thống ≤ mức giá bậc thực lực của người tặng và giới hạn cấp Thương thành. Mỗi ngày nhận tối đa ${DAILY_IN} lì xì của thành viên nhóm, phát tối đa ${DAILY_OUT} cái. Đồ giật được / nhận được sẽ ghi vào sổ cái và đọc ngược lại xác nhận trước rồi mới hiển thị “Đã nhập kho”.</p></section>
<section class="zt-card"><h3>Liên kết với cốt truyện</h3>
<div class="zt-row"><span>Đưa tóm tắt nhóm vào lời nhắc<span class="zt-desc">Để AI chính văn biết tới sự tồn tại của nhóm, các thành viên và cuộc trò chuyện nhóm gần đây.</span></span><label class="zt-switch"><input type="checkbox" data-g="inject" ${g.设置.摘要注入 ? 'checked' : ''}><i></i></label></div>
<div class="zt-row"><span>Tự động tán gẫu sau cốt truyện<span class="zt-desc">Cứ mỗi N lần phản hồi chính văn, thành viên nhóm tự động trò chuyện một lần (tốn thêm một yêu cầu mô hình).</span></span><label class="zt-switch"><input type="checkbox" data-g="auto" ${g.设置.自动闲聊 ? 'checked' : ''}><i></i></label></div>
<div class="zt-row"><span>Khoảng cách tán gẫu<span class="zt-desc">Cứ mấy lần phản hồi chính văn thì tán gẫu một lần.</span></span><select data-g-sel="every" aria-label="Khoảng cách tán gẫu">${CHAT_EVERY.map(n => `<option value="${n}" ${g.设置.闲聊间隔 === n ? 'selected' : ''}>Mỗi ${n} lượt</option>`).join('')}</select></div></section>
${this.genView(g)}</div>`;
    }
    /** 1.1.4 群聊生成 settings card. */
    genView(g) {
        const s = g.设置, opt = (list, v, label) => list.map(n => `<option value="${n}" ${v === n ? 'selected' : ''}>${esc(label(n))}</option>`).join('');
        const row = (k, title, desc, list, label) => `<div class="zt-row"><span>${title}<span class="zt-desc">${desc}</span></span><select data-g-set="${k}" aria-label="${title}">${opt(list, s[k], label)}</select></div>`;
        return `<section class="zt-card"><h3>Tạo trò chuyện nhóm <small>1.1.4 · Mỗi yêu cầu trò chuyện nhóm</small></h3>
${row('发言下限', 'Số người phát biểu tối thiểu mỗi lần', 'Mô hình ít nhất để mấy thành viên lên tiếng. Tự động tán gẫu tối đa 3 người.', GROUP_SPEAKERS, n => `${n} người`)}
${row('发言上限', 'Số người phát biểu tối đa mỗi lần', 'Các dòng vượt quá sẽ bị bỏ qua. Khi chọn đông người vui lòng đồng thời tăng giới hạn đầu ra.', GROUP_SPEAKERS, n => `${n} người`)}
${row('单条字数', 'Giới hạn số chữ mỗi tin nhắn', 'Đưa vào lời nhắc, phần vượt quá sẽ bị cắt bớt.', GROUP_CHARS, n => `${n} chữ`)}
${row('上下文', 'Số tin nhắn gần đây gửi kèm cho mô hình', 'Càng nhiều càng mạch lạc, nhưng tốn nhiều token hơn.', GROUP_CONTEXT, n => `${n} tin gần nhất`)}
${row('输出上限', 'Giới hạn đầu ra (max tokens)', `Khi phản hồi thường xuyên bị cắt cụt hãy tăng lên. Tự động = ước tính theo số người và số chữ (hiện khoảng ${autoTokens(groupGen(s).hi, groupGen(s).chars)}); giới hạn thiết lập riêng cho Nhóm chat trong 「API theo tính năng」 sẽ được ưu tiên.`, GROUP_TOKENS, n => (n ? `${n}` : 'Tự động'))}
</section>`;
    }
    val(sel) { return this.el.querySelector(sel)?.value ?? ''; }
    /** 0.9.4 招募令: typing a name while「随机世界」is selected switches to「指定世界」(指定角色 stays selectable). */
    recruitHintTyped() {
        const m = this.el?.querySelector('[data-f=rmode]'), i = this.el?.querySelector('[data-f=rhint]');
        if (m && i && m.value === 'rand' && i.value.trim()) { m.value = 'world'; i.placeholder = RECRUIT_PLACEHOLDER.world; }
    }
    /** Back to「随机世界」clears the name (it would not be used); the placeholder says what the field is for. */
    recruitModeChanged() {
        const m = this.el?.querySelector('[data-f=rmode]'), i = this.el?.querySelector('[data-f=rhint]'); if (!m || !i) return;
        if (m.value === 'rand') i.value = '';
        i.placeholder = RECRUIT_PLACEHOLDER[m.value] || RECRUIT_PLACEHOLDER.rand;
    }
    async onClick(e) {
        const t = e.target.closest('button,input[type=checkbox]'); if (!t || t.disabled) return;
        const run = async fn => { try { await fn(); } catch (err) { this.fail(err); this.paint(); } };
        const d = t.dataset;
        if (d.gtab) { this.view = d.gtab; this.sheet = null; return this.paint(); }
        if (d.grab) return run(() => this.grab(d.grab));
        if (d.gdel) return run(() => this.removeMessage(d.gdel));
        if (d.rebook) return run(() => this.rebook(d.rebook));
        if (d.claim) return run(() => this.claim(d.claim));
        if (d.buy) return run(() => this.buy(d.buy));
        if (d.hawk) return run(() => this.hawk(d.hawk));
        if (d.unlist) return run(() => this.unlist(d.unlist));
        if (d.pm) { this.pm = this.pm === d.pm ? null : d.pm; return this.paint(); }
        // 1.1.2: group members are not 羁绊 by default — pull one in, or jump to the one already pulled
        if (d.bondPull) return run(async () => { if (!this.app.bonds) throw Error('Trang Ràng buộc chưa khởi động'); await this.app.bonds.pull(d.bondPull); });
        if (d.bondOpen) { const e = (this.app.adapter.ledger()?.羁绊库 || []).find(p => p?.群员ID === d.bondOpen); if (e) this.app.bonds?.open(e.id); return; }
        if (d.descend) return run(() => this.descend(d.descend));
        if (d.wbSummon != null) return run(() => this.summon(d.book, d.wbSummon));
        if (d.live) { this.view = 'chat'; return run(() => this.live(d.live)); }
        if (d.admin) { if (d.admin === 'kick' && !confirm('Đưa thành viên này ra khỏi nhóm chat?')) return; return run(() => this.admin(d.id, d.admin)); }
        switch (d.g) {
            case 'send': { const v = this.val('#zt-g-input'); if (!v.trim()) return; this.el.querySelector('#zt-g-input').value = ''; return run(() => this.send(v)); }
            case 'sheet-packet': this.sheet = this.sheet === 'packet' ? null : 'packet'; return this.paint();
            case 'sheet-help': this.sheet = this.sheet === 'help' ? null : 'help'; return this.paint();
            case 'sheet-close': this.sheet = null; return this.paint();
            case 'packet-go': { const kind = this.el.querySelector('input[name=zt-g-pk]:checked')?.value || 'points'; return run(() => this.sendPacket({ kind, amount: this.val('[data-f=amount]'), count: this.val('[data-f=count]'), bagIndex: this.val('[data-f=bag]'), qty: this.val('[data-f=qty]'), note: this.val('[data-f=note]') })); }
            case 'help-go': { const v = this.val('[data-f=help]'), h = this.val('[data-f=helper]'); this.sheet = null; return run(() => this.help(v, h)); }
            case 'sign': return run(() => this.signIn());
            case 'live': return run(() => this.live());
            case 'reroll': return run(() => this.reroll());
            case 'manage': this.manage = !this.manage; return this.paint();
            case 'auto': return run(() => this.saveMeta({ 自动闲聊: t.checked }));
            case 'inject': return run(() => this.saveMeta({ 摘要注入: t.checked }));
            case 'recruit': return run(() => this.recruit(this.val('[data-f=rmode]'), this.val('[data-f=rhint]')));
            case 'invite': return run(() => this.invite());
            case 'wb-find': return run(() => this.wbFind(this.val('[data-f=wbook]'), this.val('[data-f=wq]')));
            case 'drop-cand': return run(async () => { await this.write(g => { if (g.候选) g.候选历史 = [...g.候选历史, g.候选.名称].slice(-12); g.候选 = null; }); this.paint(); });
            case 'expand': return run(() => this.expand());
            case 'pm-send': { const v = this.val('[data-f=pm]'); return run(() => this.privateSay(d.id, v)); }
            case 'market': return run(() => this.refreshMarket());
            case 'sell': return run(() => this.listForSale(this.val('[data-f=sell]'), this.val('[data-f=price]')));
            case 'meta': return run(() => this.saveMeta({ 群名: this.val('[data-f=name]'), 公告: this.val('[data-f=notice]'), 群规: this.val('[data-f=rules]') }));
            case 'to-task': return this.hub.go('task');
        }
    }
    dispose() { this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); try { this.bridge.uninjectPrompts(['group']); } catch { /* ignore */ } }
}
