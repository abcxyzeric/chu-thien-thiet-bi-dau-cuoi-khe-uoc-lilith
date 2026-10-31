// 1.1.5 Nhóm chat × Sách Thế Giới: triệu hồi một nhân vật từ mục Sách Thế Giới vào nhóm, cho phép nhóm đọc sách, và
// mang những gì đã xảy ra trong nhóm quay lại cốt truyện khi nhân vật đó xuất hiện trong truyện.
//   * Triệu hồi — người dùng chọn một mục (book + uid); mô hình chuyển văn bản mục đó thành thẻ thành viên thông thường. Thành viên
//                 giữ trường `来源 {book, uid, comment}`; không ghi bất cứ thứ gì vào Sách Thế Giới (chỉ đọc ở mọi nơi).
//   * Nhóm chat — mỗi lượt trò chuyện nhóm / trò chuyện riêng đều nhận một đoạn trích mục riêng của từng thành viên được triệu hồi, cộng thêm các mục
//                 trong những cuốn sách đó có từ khóa xuất hiện trong cuộc hội thoại (giới hạn theo ngân sách ký tự).
//   * Ký ức     — Tiêm ký ức thành viên nhóm: khi tên hoặc từ khóa của một thành viên được triệu hồi xuất hiện trong các tin nhắn cốt truyện mới nhất,
//                 lời nhắc cốt truyện sẽ nhận được bản tóm tắt ngắn về cuộc trò chuyện nhóm / trò chuyện riêng của họ với Ký chủ, để cốt truyện ghi nhớ.
// Các hàm thuần túy được xuất ra cho kiểm thử; GroupWorld lưu đệm kết quả đọc sách trong một phút.
export const WB_MODE = 'wb';
export const ZT_BOOK = '诸天万界最强系统';
const clip = (v, n) => { const s = String(v ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const low = s => String(s ?? '').toLowerCase();

/** Entry title shown to the user (comment, else first keyword, else uid). */
export function entryTitle(e) { return clip(e?.comment || e?.name || (e?.key || [])[0] || `Mục ${e?.uid}`, 40); }
/** Keywords of an entry worth matching (≥ 2 chars, no regex-style keys). */
export function entryKeys(e) {
    const keys = Array.isArray(e?.key) ? e.key : Array.isArray(e?.strategy?.keys) ? e.strategy.keys : [];
    return [...new Set(keys.map(k => String(k || '').trim()).filter(k => k.length >= 2 && k.length <= 30 && !/^\/.*\/[a-z]*$/.test(k)))];
}
/** Search a book's entries: title / keyword hits first, then content hits. Disabled entries are skipped. Pure. */
export function searchEntries(entries, q, limit = 30) {
    const list = (Array.isArray(entries) ? entries : []).filter(e => e && !e.disable && e.enabled !== false && String(e.content || '').trim());
    const words = low(q).split(/\s+/).filter(Boolean);
    if (!words.length) return list.slice(0, limit);
    const scored = [];
    for (const e of list) {
        const head = low(entryTitle(e) + ' ' + entryKeys(e).join(' ')), body = low(e.content);
        if (!words.every(w => head.includes(w) || body.includes(w))) continue;
        scored.push({ e, s: words.filter(w => head.includes(w)).length * 10 + (head.includes(words[0]) ? 5 : 0) });
    }
    return scored.sort((a, b) => b.s - a.s).slice(0, limit).map(x => x.e);
}
/** Prompt that turns an entry into a member card line (same format as 招募). Pure. */
export function summonPrompt(entry, book, { maxTier = 8, tiers = '', name = '' } = {}) {
    return `Hãy triệu hồi mục này trong Sách Thế Giới 「${clip(book, 40)}」 vào nhóm chat của Ký chủ: dựa theo nội dung mục để tổng hợp thành hồ sơ thành viên nhóm.
【Mục】${entryTitle(entry)}${entryKeys(entry).length ? ` (Từ khóa: ${entryKeys(entry).slice(0, 8).join(', ')})` : ''}
${clip(entry?.content, 1800)}
${name ? `【Tên chỉ định】${clip(name, 20)}\n` : ''}Yêu cầu: Tên dùng đúng tên nhân vật trong mục (nếu mục viết về địa điểm / thế lực thì chọn một nhân vật tiêu biểu nhất trong đó); Thế giới xuất xứ ghi thế giới hoặc tác phẩm chứa mục đó; Bậc thực lực đánh giá trung thực theo mục (tham khảo: ${tiers}), ${maxTier < 8 ? `cao hơn bậc ${maxTier} cũng ghi trung thực (phí vào nhóm tính riêng); ` : ''}Tính cách trong vòng 20 chữ; Đặc sản ghi một loại vật phẩm trong thế giới của nhân vật đó có thể dùng làm quà tặng.
Chỉ xuất đúng một dòng, phân cách bằng dấu gạch đứng: Tên|Thế giới xuất xứ|Con số bậc thực lực|Tính cách (trong 20 chữ)|Đặc sản (trong 20 chữ)`;
}
/** Excerpt of a member's own entry for group prompts. Pure. */
export function memberSourceLine(m, entry, n = 360) {
    if (!m?.来源 || !entry) return '';
    return `- ${m.名称} (Sách Thế Giới 「${clip(m.来源.book, 30)}」·${entryTitle(entry)}): ${clip(entry.content, n)}`;
}
/** Entries whose keywords appear in the text (case-insensitive), excluding `skip` uids. Pure. */
export function matchKeys(entries, text, skip = new Set(), limit = 4) {
    const t = low(text); if (!t) return [];
    const out = [];
    for (const e of Array.isArray(entries) ? entries : []) {
        if (!e || e.disable || e.enabled === false || skip.has(String(e.uid))) continue;
        if (entryKeys(e).some(k => t.includes(low(k)))) out.push(e);
        if (out.length >= limit) break;
    }
    return out;
}
/** Group-prompt block: summoned members' entries + keyword-matched background, within `budget` characters. Pure. */
export function groupWorldBlock(sources, background, budget = 1600) {
    const lines = [], add = l => { if (!l) return; const used = lines.reduce((a, x) => a + x.length, 0); if (used + l.length <= budget) lines.push(l); };
    for (const s of sources) add(memberSourceLine(s.m, s.entry));
    const bg = background.map(x => `- ${entryTitle(x.entry)} (${clip(x.book, 30)}): ${clip(x.entry.content, 260)}`);
    for (const l of bg) add(l);
    if (!lines.length) return '';
    return `【Tư liệu Sách Thế Giới (chỉ đọc tham khảo)】Cách nói chuyện, trải nghiệm và quan hệ nhân mạch của thành viên nhóm lấy tư liệu tại đây làm chuẩn:\n${lines.join('\n')}`;
}
/** Does the text mention this member (name or one of the entry keywords)? Pure. */
export function mentions(text, m, entry) {
    const t = low(text); if (!t || !m) return false;
    const names = [m.名称, ...(entry ? entryKeys(entry) : [])].map(x => String(x || '').trim()).filter(x => x.length >= 2);
    return names.some(n => t.includes(low(n)));
}
/** 群员记忆注入: recap lines for summoned members mentioned in the latest story text. Pure. */
export function worldMemoryPrompt(g, storyText, entryOf = () => null, { maxMembers = 3, perMember = 5 } = {}) {
    if (!g || !Array.isArray(g.成员)) return '';
    const host = 'Ký chủ', out = [];
    for (const m of g.成员) {
        if (!m?.来源 || out.length >= maxMembers) continue;
        if (!mentions(storyText, m, entryOf(m))) continue;
        const said = (g.消息 || []).filter(x => x.from === m.id || (x.from === 'me' && String(x.text).includes(m.名称))).slice(-perMember)
            .map(x => `${x.from === 'me' ? host : m.名称}: ${clip(x.text, 60)}`);
        const pm = (g.私聊?.[m.id] || []).slice(-4).map(x => `${x.me ? host : m.名称} (Trò chuyện riêng): ${clip(x.text, 60)}`);
        const gifts = (g.入库记录 || []).filter(r => String(r.src || '').includes(m.名称)).slice(-3).map(r => `${r.what} (${r.how})`);
        if (!said.length && !pm.length && !gifts.length) continue;
        const role = m.身份 === '管理员' ? 'Quản trị viên' : (!m.身份 || m.身份 === '群员') ? 'Thành viên nhóm' : m.身份;
        out.push(`· ${m.名称} (Hảo cảm ${Number(m.好感) || 20}, ${role})${said.length ? '｜Trò chuyện nhóm: ' + said.join(' / ') : ''}${pm.length ? '｜' + pm.join(' / ') : ''}${gifts.length ? '｜Đồ đã đưa cho Ký chủ qua nhóm chat: ' + gifts.join(', ') : ''}`);
    }
    if (!out.length) return '';
    return `【Nhóm Chat Chư Thiên · Ký ức thành viên nhóm】Các nhân vật dưới đây đồng thời là thành viên trong nhóm chat của Ký chủ (được triệu hồi từ Sách Thế Giới), khi xuất hiện trong cốt truyện cần nhớ những trao đổi với Ký chủ ở trong nhóm, thái độ và độ hảo cảm phải nhất quán; không được tự bịa ra cuộc trò chuyện nhóm ngoài bản ghi:\n${out.join('\n')}`;
}
/** Books active for the current chat (chat → character → global), without the 诸天 book. */
export function activeBooks(ctx, wi) {
    const c = ctx || {}, names = [];
    const push = n => { if (typeof n === 'string' && n && n !== ZT_BOOK && !names.includes(n)) names.push(n); };
    push(c.chatMetadata?.world_info);
    try { const ch = c.characters?.[c.characterId]; push(ch?.data?.extensions?.world); } catch { /* no character */ }
    for (const n of wi?.selected_world_info || []) push(n);
    return names;
}

export class GroupWorld {
    constructor(app) { this.app = app; this.cache = new Map(); }
    get bridge() { return this.app.bridge; }
    get cfg() { return { read: true, memory: true, budget: 1600, ...(this.app.settings?.get('groupWorld') || {}) }; }
    names() { try { return this.bridge.getWorldbookNames().filter(n => n !== ZT_BOOK); } catch { return []; } }
    active() { try { return activeBooks(this.app.adapter.context(), this.bridge.wiModule); } catch { return []; } }
    async entries(book) {
        const hit = this.cache.get(book); if (hit && Date.now() - hit.t < 60_000) return hit.list;
        const list = await this.bridge.getWorldbook(book); this.cache.set(book, { t: Date.now(), list }); return list;
    }
    /** Cached entries only (prompts built synchronously). */
    cached(book) { return this.cache.get(book)?.list || null; }
    async entry(src) { if (!src?.book) return null; const list = await this.entries(src.book); return list.find(e => String(e.uid) === String(src.uid)) || null; }
    /** Loads every summoned member's book into the cache (best effort). */
    async warm(g) { const books = [...new Set((g?.成员 || []).map(m => m?.来源?.book).filter(Boolean))]; await Promise.all(books.map(b => this.entries(b).catch(() => null))); }
    entryOfSync(m) { const list = m?.来源 ? this.cached(m.来源.book) : null; return list?.find(e => String(e.uid) === String(m.来源.uid)) || null; }
    /** Block for a group round / private chat about `text`. */
    async block(g, text, only = null) {
        if (!this.cfg.read) return '';
        await this.warm(g);
        const members = (g?.成员 || []).filter(m => m?.来源 && (!only || only.includes(m.id)));
        const sources = members.map(m => ({ m, entry: this.entryOfSync(m) })).filter(s => s.entry);
        const skip = new Set(sources.map(s => String(s.entry.uid))), bg = [];
        for (const book of new Set(members.map(m => m.来源.book))) for (const e of matchKeys(this.cached(book) || [], text, skip, 3)) bg.push({ book, entry: e });
        return groupWorldBlock(sources, bg, Math.max(400, Math.min(6000, Number(this.cfg.budget) || 1600)));
    }
}
