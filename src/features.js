// Native-only features around the migrated originals: worldbook install/bind, new-chat init, old-save migration &
// ledger rollback, compatibility diagnostics, ledger HUD, hotkeys, slash commands and macros.
import { ID, VERSION, STORAGE, inert } from './contracts.js';
import { HOST_TESTED } from './compat.js';
import { detectLegacy } from './takeover.js';
import { promptFilterStats } from './prompt-filter.js';
import { readConfigs } from './api-center.js';
import { isMainApi } from './th-bridge.js';
import { tavernHelperMacrosActive } from './macro-like.js';
import { latestRules, mergeWorldbook, WORLDBOOK_REV, moduleStates, applyModules, BALANCE_MODULES } from './worldbook.js';
import { findBindings, unbindAll, restoreBindings, describe as describeBindings } from './wb-unbind.js';
import { buildReport, copyText } from './diag-report.js';
import { stable } from './ledger-plan.js';
import { errorLine } from './errors.js';

export const WORLD_NAME = '诸天万界最强系统';
export const WORLD_DISPLAY_NAME = 'Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới';
const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

export function buildWorldbook(rules) {
    const entries = {};
    rules.forEach((rule, i) => { entries[i] = { ...structuredClone(rule), uid: i, displayIndex: rule.displayIndex ?? i }; });
    return { entries };
}
export function ledgerSummary(v) {
    const s = v?.诸天系统; if (!s || typeof s !== 'object') return null;
    const tasks = s.任务库 && typeof s.任务库 === 'object' ? Object.values(s.任务库).filter(t => t && t.状态 !== '已完成' && t.状态 !== '已失败' && t.状态 !== 'Đã hoàn thành' && t.状态 !== 'Đã thất bại') : [];
    const rawCur = String(s.当前货币 || '').trim();
    const cur = /^(|暂无|无|none|chưa có|không)$/i.test(rawCur) ? '' : rawCur;
    return { points: s.系统点 ?? 0, world: s.当前世界 || '', tasks: tasks.length, task: tasks[0]?.名称 || '', currency: cur, amount: s.持有金额 ?? '' };
}


export class Features {
    constructor(app) { this.app = app; this.disposers = []; this.hud = null; this.dead = false; }
    get ctx() { return this.app.adapter.context(); }
    popup(html, wide = false) {
        const c = this.ctx, el = document.createElement('div'); el.className = 'zt-popup'; el.innerHTML = html;
        c.callGenericPopup(el, c.POPUP_TYPE.TEXT, '', { wide, large: wide, allowVerticalScrolling: true, okButton: 'Đóng' });
        return el;
    }
    toast(kind, text) { globalThis.toastr?.[kind]?.(kind === 'error' ? errorLine(text) : text, 'Chư Thiên'); }

    // ---------- worldbook ----------
    async worldbookStatus() {
        const c = this.ctx; let book = null;
        try { book = await c.loadWorldInfo(WORLD_NAME); } catch { book = null; }
        const count = book?.entries ? Object.keys(book.entries).length : 0;
        const latest = this.latestRules();
        const current = count ? latest.every(r => Object.values(book.entries).some(e => e.comment === r.comment && e.content === r.content)) : false;
        return { exists: !!count, count, chatBound: c.chatMetadata?.world_info === WORLD_NAME, builtin: latest.length, current };
    }
    /** Once per session: an older copy of the book (e.g. imported from v1.1) is never overwritten automatically. */
    async staleNotice() {
        if (this.staleShown) return; this.staleShown = true;
        const st = await this.worldbookStatus().catch(() => null);
        if (st?.exists && !st.current) this.toast('info', `Sách Thế Giới “${WORLD_DISPLAY_NAME}” (${WORLD_NAME}) không phải bản mới nhất của plugin (thiếu các mục kết nối nhóm chat, v.v.). Bạn có thể vào Cài đặt → Cài đặt / Liên kết Sách Thế Giới → Cập nhật lên bản mới nhất (sẽ sao lưu trước).`);
    }
    latestRules() { return latestRules(this.app.original.ZhuTianBuiltinRules).rules; }
    /** Brings an existing book up to this version: backup first (a separate book), then built-in entries replaced,
     *  the user's own entries and on/off choices kept. */
    async updateWorldbook() {
        if (this.wbUpdating) throw Error('Sách Thế Giới đang được nâng cấp, vui lòng không gửi lặp lại.');
        this.wbUpdating = true;
        try { return await this.writeWorldbookUpgrade(); } finally { this.wbUpdating = false; }
    }
    async writeWorldbookUpgrade() {
        const c = this.ctx;
        // Host loadWorldInfo returns cached data even after failed saves. Verify the server, not its cache.
        const readDisk = async name => {
            const response = await fetch('/api/worldinfo/get', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: c.getRequestHeaders(), body: JSON.stringify({ name }), signal: AbortSignal.timeout(15000) });
            if (!response.ok) throw Error('Xác minh máy chủ Sách Thế Giới thất bại HTTP ' + response.status);
            return response.json();
        };
        const book = await readDisk(WORLD_NAME);
        if (!book?.entries || !Object.keys(book.entries).length) return { ...(await this.installWorldbook('none')), created: true };
        const stamp = new Date().toLocaleString('sv-SE').replace(/[-: ]/g, '').slice(0, 14), backup = `${WORLD_NAME}-SaoLuu-${stamp}-${crypto.randomUUID().slice(0, 8)}`;
        await c.saveWorldInfo(backup, structuredClone(book), true);
        const backupRead = await readDisk(backup);
        if (stable(backupRead?.entries) !== stable(book.entries)) throw Error('Đọc lại bản sao lưu Sách Thế Giới không khớp, chưa cập nhật sách gốc.');
        const legacy = latestRules(this.app.original.ZhuTianBuiltinRules, { legacy: true }).rules;
        // 1.1.1: what the previous version installed is not a user edit either (no false「自定义修改」question)
        const known = [latestRules(this.app.original.ZhuTianBuiltinRules, { previous: true }).rules, latestRules(this.app.original.ZhuTianBuiltinRules, { legacy: true, previous: true }).rules];
        const r = mergeWorldbook(book, this.latestRules());
        let preserved = 0; const seen = new Set();
        for (const old of Object.values(book.entries)) {
            if (seen.has(old.comment)) continue; // duplicate comment rows are kept verbatim, not replaced
            seen.add(old.comment);
            const base = legacy.find(x => x.comment === old.comment), next = Object.values(r.book.entries).find(x => x.comment === old.comment);
            if (base && next && old.content !== base.content && old.content !== next.content && !known.some(list => list.find(x => x.comment === old.comment)?.content === old.content)) {
                if (!globalThis.confirm(`Nội dung 「${old.comment}」 khác với bản cũ của plugin, có thể chứa chỉnh sửa tùy chỉnh của bạn. Đã sao lưu vào ${backup}. Xác nhận ghi đè bằng bản mới? Nhấn Hủy để giữ lại mục này.`)) { const uid = next.uid; r.book.entries[uid] = { ...structuredClone(old), uid }; preserved++; }
            }
        }
        if (stable(await readDisk(WORLD_NAME)) !== stable(book)) throw Error('Trong quá trình nâng cấp, Sách Thế Giới đã bị thao tác khác thay đổi, đã dừng ghi đè; bản sao lưu: ' + backup);
        await c.saveWorldInfo(WORLD_NAME, r.book, true);
        await c.updateWorldInfoList?.();
        const checked = await readDisk(WORLD_NAME);
        if (stable(checked?.entries) !== stable(r.book.entries)) throw Error('Kết quả cập nhật chưa được xác thực, vui lòng đối chiếu từ sách sao lưu: ' + backup);
        return { ...(await this.worldbookStatus()), backup, preserved, replaced: r.replaced, added: r.added, kept: r.kept };
    }
    /** 0.8.4 强力模块: current on/off of the switchable entries in the installed book (book-wide, all chats). */
    async moduleStates() {
        let book = null; try { book = await this.ctx.loadWorldInfo(WORLD_NAME); } catch { book = null; }
        return { exists: !!(book?.entries && Object.keys(book.entries).length), list: moduleStates(book) };
    }
    /** Switches entries of the installed book ({comment: on}). Only `disable` changes; nothing else is rewritten. */
    async setModules(want) {
        const c = this.ctx; let book = null;
        try { book = await c.loadWorldInfo(WORLD_NAME); } catch { book = null; }
        if (!book?.entries || !Object.keys(book.entries).length) throw Error(`Chưa cài đặt Sách Thế Giới “${WORLD_DISPLAY_NAME}” (${WORLD_NAME}): Cài đặt → Cài đặt / Liên kết Sách Thế Giới.`);
        const allowed = Object.fromEntries(Object.entries(want || {}).filter(([k]) => BALANCE_MODULES.some(m => m.comment === k)));
        const r = applyModules(book, allowed);
        if (r.changed) { await c.saveWorldInfo(WORLD_NAME, r.book, true); await c.updateWorldInfoList?.(); }
        return { changed: r.changed, list: moduleStates(r.book) };
    }
    /** The same book as a SillyTavern world-info JSON file (for manual import / sharing). */
    exportWorldbook() {
        const blob = new Blob([JSON.stringify(buildWorldbook(this.latestRules()), null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${WORLD_NAME}-plugin-${WORLDBOOK_REV}.json`;
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
    async installWorldbook(bind) {
        const c = this.ctx, st = await this.worldbookStatus();
        if (!st.exists) {
            await c.saveWorldInfo(WORLD_NAME, buildWorldbook(this.latestRules()), true);
            await c.updateWorldInfoList?.();
        }
        if (bind === 'chat') {
            if (!this.app.adapter.currentIdentity()) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước khi liên kết.');
            c.chatMetadata.world_info = WORLD_NAME; await c.saveMetadata();
        }
        return this.worldbookStatus();
    }
    /** Is this an 诸天 chat? (ledger variable or a status-bar block in any floor) */
    isZhutianChat() {
        const c = this.ctx;
        return !!c.chatMetadata?.variables?.诸天系统 || (c.chat || []).some(m => typeof m?.mes === 'string' && m.mes.includes('<ZhuTianPanel>'));
    }
    /** Replaces the manual "import the worldbook and select it" step of v1.1: on an 诸天 chat the book is installed
     *  (never overwritten) and bound to the chat — unless it is already active globally / on the character, or the
     *  chat already has another chat book. Returns what happened, for diagnostics. */
    async autoWorldbook() {
        if (this.dead || this.app.settings.get('worldbookAuto') === false) return this.wbAuto = 'off';
        const c = this.ctx;
        if (!this.app.adapter.currentIdentity() || !this.isZhutianChat()) return this.wbAuto = 'not-zhutian';
        if (c.chatMetadata?.world_info === WORLD_NAME) { this.staleNotice(); return this.wbAuto = 'chat'; }
        if (c.chatMetadata?.world_info) return this.wbAuto = 'other-chat-book';
        let wi = null; try { wi = await import('/scripts/world-info.js'); } catch { /* older layout: fall back to chat binding */ }
        const ch = c.characters?.[c.characterId];
        const charBooks = [ch?.data?.extensions?.world, ...(wi?.world_info?.charLore?.find?.(e => e.name === ch?.avatar)?.extraBooks || [])];
        if ((wi?.selected_world_info || []).includes(WORLD_NAME)) return this.wbAuto = 'global';
        if (charBooks.includes(WORLD_NAME)) return this.wbAuto = 'character';
        const st = await this.installWorldbook('chat');
        if (st.chatBound) this.toast('info', `Đã tự động cài đặt và liên kết Sách Thế Giới “${WORLD_DISPLAY_NAME}” (${st.count} mục) vào cuộc trò chuyện hiện tại. Có thể tắt tự động liên kết trong Cài đặt.`);
        const b = await this.worldbookBudget().catch(() => null);
        if (b && !b.ok) this.toast('warning', `Ngân sách Sách Thế Giới chỉ có ${b.budget} token, quy tắc thường trú Chư Thiên cần khoảng ${b.need}, quán rượu sẽ bỏ qua toàn bộ chúng. Mở “Chẩn đoán tương thích” để điều chỉnh bằng một chạm.`);
        return this.wbAuto = st.chatBound ? 'auto-bound' : 'failed';
    }
    /** The 11 constant 诸天 rules (~12k characters) must fit SillyTavern's world-info budget, otherwise ST silently
     *  drops them. Returns {need, budget, ok} in tokens, or null when the host does not expose the numbers. */
    async worldbookBudget() {
        const c = this.ctx; let wi = null; try { wi = await import('/scripts/world-info.js'); } catch { return null; }
        const max = c.mainApi === 'openai' && c.chatCompletionSettings?.openai_max_context ? Number(c.chatCompletionSettings.openai_max_context) : Number(c.maxContext), pct = Number(wi.world_info_budget), cap = Number(wi.world_info_budget_cap) || 0;
        if (!Number.isFinite(max) || !Number.isFinite(pct)) return null;
        let budget = Math.max(1, Math.round(max * pct / 100)); if (cap > 0) budget = Math.min(budget, cap);
        const text = this.latestRules().filter(r => r.constant && !r.disable).map(r => r.content).join('\n');
        let need = Math.ceil(text.length * 0.9);
        try { if (typeof c.getTokenCountAsync === 'function') need = await c.getTokenCountAsync(text); } catch { /* estimate */ }
        return this.wbBudget = { need, budget, max, pct, cap, ok: budget >= need };
    }
    /** Raises the world-info budget through SillyTavern's own controls (so ST saves it the normal way). */
    fixWorldbookBudget() {
        const b = this.wbBudget; if (!b || b.ok) return false;
        const pct = Math.min(100, Math.ceil((b.need * 1.25) / b.max * 100));
        const set = (id, v) => { const el = document.getElementById(id); if (!el) return false; el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; };
        const done = set('world_info_budget', pct);
        if (b.cap > 0 && b.cap < b.need) set('world_info_budget_cap', 0);
        if (pct >= 100 && b.max * 1.0 < b.need * 1.25) this.toast('warning', 'Độ dài ngữ cảnh quá nhỏ, ngay cả khi ngân sách 100% cũng không đủ chứa quy tắc thường trú Chư Thiên, vui lòng tăng ngữ cảnh trong cài đặt API.');
        return done;
    }
    // ---------- 0.8.2 解绑 ----------
    async bindings() { let wi = null; try { wi = await import('/scripts/world-info.js'); } catch { /* old layout */ } return findBindings(this.ctx, wi, WORLD_NAME); }
    /** 一键解绑: every card / extra book / global / open chat. Turns auto-binding off, otherwise the open 诸天 chat would be
     *  bound again on the next message. */
    async unbindWorldbook() {
        const rec = await unbindAll(this.ctx, WORLD_NAME, { chat: true });
        if (rec.count) this.app.settings.set('wbUnbound', { ...rec, auto: false, noticed: true });
        if (this.app.settings.get('worldbookAuto') !== false) this.app.settings.set('worldbookAuto', false);
        this.wbAuto = 'off';
        return rec;
    }
    async restoreWorldbook() {
        const rec = this.app.settings.get('wbUnbound'); if (!rec) throw Error('Không có bản ghi gỡ liên kết nào có thể khôi phục.');
        const r = await restoreBindings(this.ctx, rec);
        this.app.settings.set('wbUnbound', null);
        return r;
    }
    /** Once after re-enabling: say what the disable hook unbound. */
    unbindNotice() {
        const rec = this.app.settings.get('wbUnbound'); if (!rec?.auto || rec.noticed) return;
        this.app.settings.set('wbUnbound', { ...rec, noticed: true });
        this.toast('info', `Lần trước khi tắt plugin, đã gỡ liên kết Sách Thế Giới “${WORLD_DISPLAY_NAME}” khỏi ${describeBindings(rec)}. Để khôi phục: Thiết bị đầu cuối → Cài đặt → Sách Thế Giới → Khôi phục liên kết.`);
    }
    async openWorldbook() {
        const st = await this.worldbookStatus(), b = await this.bindings().catch(() => null), last = this.app.settings.get('wbUnbound');
        const bound = b ? [b.chars.length ? `${b.chars.length} thẻ nhân vật (${esc(b.chars.slice(0, 6).map(c => c.name).join(', '))}${b.chars.length > 6 ? '…' : ''})` : '', b.extra.length ? `Sách Thế Giới phụ trên ${b.extra.length} thẻ` : '', b.global ? 'Sách Thế Giới toàn cục' : '', b.chat ? 'cuộc trò chuyện hiện tại' : ''].filter(Boolean).join(', ') : '';
        const el = this.popup(`<h3>Sách Thế Giới Chư Thiên (ngoại vi, không phụ thuộc MVU thẻ nhân vật)</h3>
<p>Quy tắc tích hợp sẵn: ${st.builtin} mục (bản plugin ${WORLDBOOK_REV}). Quán rượu hiện tại: ${st.exists ? `Đã tồn tại “${esc(WORLD_NAME)}” (${st.count} mục, ${st.current ? '<b>đã là bản mới nhất</b>' : '<b>chưa phải bản mới nhất</b>, có thể bấm 「Cập nhật lên bản mới nhất」'})` : 'chưa cài đặt'}; cuộc trò chuyện hiện tại: ${st.chatBound ? '<b>đã liên kết</b>' : 'chưa liên kết'}.</p>
<div class="zt-popup-actions"><div class="menu_button" data-wb="install">Chỉ cài đặt Sách Thế Giới</div><div class="menu_button" data-wb="chat">Cài đặt và liên kết vào cuộc trò chuyện hiện tại</div><div class="menu_button" data-wb="update">Cập nhật lên bản mới nhất (sao lưu trước)</div><div class="menu_button" data-wb="export">Xuất JSON</div></div>
<p class="zt-note">Liên kết dưới dạng “Sách Thế Giới trò chuyện” (chat_metadata.world_info), chỉ ảnh hưởng đến cuộc trò chuyện hiện tại, tách biệt với các thẻ nhân vật khác. Khi đã tồn tại Sách Thế Giới cùng tên thì chỉ liên kết, không ghi đè các mục bạn đã sửa.</p>
<h4>Gỡ liên kết</h4>
<p class="zt-wb-bound">Hiện đang liên kết tại: ${bound || 'không có nơi nào'}.</p>
<div class="zt-popup-actions"><div class="menu_button" data-wb="unbind" ${b?.total ? '' : 'aria-disabled="true"'}>Gỡ toàn bộ liên kết bằng 1 chạm</div>${last ? `<div class="menu_button" data-wb="restore" title="${esc(describeBindings(last))}">Khôi phục lần gỡ trước (${esc(describeBindings(last))})</div>` : ''}</div>
<p class="zt-note">Gỡ liên kết chỉ hủy liên kết chứ không xóa Sách Thế Giới. Sẽ đồng thời tắt “Bản lưu Chư Thiên tự động liên kết Sách Thế Giới”, nếu không ở tin nhắn tiếp theo cuộc trò chuyện Chư Thiên hiện tại sẽ tự động liên kết lại. Sách Thế Giới trò chuyện trong các tệp trò chuyện khác không bị thay đổi (chỉ có hiệu lực trong những cuộc trò chuyện Chư Thiên đó). Khi tắt plugin sẽ tự động thực hiện gỡ liên kết tương tự (có thể tắt trong Cài đặt; yêu cầu SillyTavern 1.17 trở lên, 1.16 không có hook khi tắt).</p><p class="zt-out"></p>`);
        el.addEventListener('click', async e => {
            const act = e.target.closest('[data-wb]')?.dataset.wb; if (!act) return;
            const out = el.querySelector('.zt-out');
            if (act === 'export') { this.exportWorldbook(); return; }
            if (act === 'unbind') {
                try { const r = await this.unbindWorldbook(); out.textContent = r.count ? `Đã gỡ liên kết: ${describeBindings(r)}. ${r.errors.length ? 'Một phần thất bại: ' + r.errors.join('; ') : ''}Tự động liên kết đã tắt.` : 'Không tìm thấy nơi nào cần gỡ liên kết.'; el.querySelector('.zt-wb-bound').textContent = 'Hiện đang liên kết tại: không có nơi nào.'; if (r.count) this.toast('success', `Đã gỡ liên kết ${r.count} nơi`); }
                catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
                return;
            }
            if (act === 'restore') {
                try { const r = await this.restoreWorldbook(); out.textContent = `Đã khôi phục ${r.count} nơi${r.skipped ? `, bỏ qua ${r.skipped} nơi (thẻ nhân vật đã xóa hoặc đã đổi sang Sách Thế Giới khác)` : ''}.`; e.target.closest('[data-wb]').remove(); }
                catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
                return;
            }
            if (act === 'update') {
                if (!confirm('Ảnh hưởng nâng cấp: Thương thành đổi thành không ép buộc suy yếu, Cấm kỵ chỉ có ngưỡng khi nhận được; bổ sung quy tắc lưu trữ cốt truyện,羁绊 (liên kết) nhiều người và hộp mù. Sao lưu toàn bộ Sách Thế Giới trước; giữ nguyên công tắc, từ khóa và cài đặt chèn của bạn, các mục trùng tên đã tự sửa sẽ hỏi từng mục một. Tiếp tục?')) return;
                try { const r = await this.updateWorldbook(); out.textContent = r.created ? `Đã cài đặt bản mới nhất (${r.count} mục).` : `Đã cập nhật: đồng bộ ${r.replaced - r.preserved} mục, thêm mới ${r.added} mục, giữ lại ${r.preserved} mục tự sửa và ${r.kept} mục tùy chỉnh; bản cũ đã sao lưu thành “${r.backup}”.`; this.toast('success', r.preserved ? 'Đã xử lý Sách Thế Giới; các mục tự sửa được giữ lại vui lòng tự gộp quy tắc mới' : 'Đã cập nhật Sách Thế Giới lên bản mới nhất của plugin'); }
                catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
                return;
            }
            try { const r = await this.installWorldbook(act === 'chat' ? 'chat' : 'none'); out.textContent = `Hoàn tất: Sách Thế Giới ${r.count} mục; cuộc trò chuyện hiện tại ${r.chatBound ? 'đã liên kết' : 'chưa liên kết'}.`; this.toast('success', 'Sách Thế Giới đã sẵn sàng'); }
            catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
        });
    }

    // ---------- new chat init / migration / rollback ----------
    async initChat() {
        const a = this.app.adapter;
        if (!a.currentIdentity()) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước.');
        const before = a.ledger();
        const ledger = await this.app.statusbar.initializeChat();
        return { created: !before, points: ledger?.系统点 ?? null };
    }
    migrationReport() {
        const a = this.app.adapter, c = this.ctx, v = a.variables(), core = this.app.original.ZhuTianMemoryCore;
        const legacyData = this.app.bridge.findLegacyScriptData();
        return {
            ledger: !!v.诸天系统, memory: !!v[core.NS], companion: !!v['诸天记忆助手_v1_LILITH_CHAT'],
            legacyScript: legacyData ? Object.keys(legacyData) : [], imported: !!this.app.settings.get('legacyImported'),
            receipts: Object.keys(a.settings().ledgerReceipts || {}).length, backups: this.app.bridge.backups(),
            thActive: !!globalThis.TavernHelper, chat: c.getCurrentChatId?.() || '',
        };
    }
    openMigration() {
        const r = this.migrationReport();
        const rows = r.backups.map(b => `<tr><td>${new Date(b.at).toLocaleString()}${b.reason ? `<br><small>${esc(b.reason)}</small>` : ''}</td><td>Tầng ${b.floor}</td><td>${esc(b.balance)}</td><td><div class="menu_button" data-restore="${b.at}">Quay lui về đây</div></td></tr>`).reverse().join('') || '<tr><td colspan="4">Chưa có bản sao lưu tự động nào (tự động tạo khi sổ cái lần đầu bị thanh trạng thái nguyên bản thay đổi, tối đa 5 bản).</td></tr>';
        const el = this.popup(`<h3>Di chuyển bản lưu cũ & Quay lui sổ cái</h3>
<p>Biến trò chuyện (chat_metadata.variables) do Tavern Helper ghi ở bản lưu cũ và tiện ích mở rộng này sử dụng <b>cùng một vị trí</b>, sổ cái, ký ức và lịch sử trò chuyện riêng có thể đọc trực tiếp mà không cần chuyển đổi.</p>
<ul><li>Sổ cái Chư Thiên: ${r.ledger ? 'Đã phát hiện' : 'Không có (có thể dùng “Khởi tạo cuộc trò chuyện mới” để tạo)'}</li><li>Bản lưu ký ức gốc: ${r.memory ? 'Đã phát hiện' : 'Không có'}</li><li>Lịch sử trò chuyện riêng với Lilith: ${r.companion ? 'Đã phát hiện' : 'Không có'}</li>
<li>Cấu hình script trợ lý cũ (API/Giao diện/Khung trò chuyện riêng): ${r.legacyScript.length ? 'Tìm thấy ' + esc(r.legacyScript.join(', ')) : 'Không tìm thấy'}${r.imported ? ' (đã nhập)' : ''}</li><li>Chứng từ quyết toán nguyên bản: ${r.receipts} mục</li><li>Tavern Helper: ${r.thActive ? 'Đang chạy (khuyên dùng tắt regex thanh trạng thái cũ và script trợ lý cũ)' : 'Không chạy'}</li></ul>
<div class="zt-popup-actions"><div class="menu_button" data-mig="import">Nhập lại cấu hình trợ lý cũ</div></div>
<h4>Sao lưu tự động sổ cái</h4><table class="zt-table"><tr><th>Thời gian</th><th>Tầng</th><th>Điểm Hệ Thống</th><th></th></tr>${rows}</table><p class="zt-out"></p>`, true);
        el.addEventListener('click', async e => {
            const out = el.querySelector('.zt-out');
            try {
                if (e.target.closest('[data-mig="import"]')) { this.app.settings.set('legacyImported', false); const d = this.app.assistant?.importLegacyConfig(); out.textContent = d ? 'Đã nhập: ' + Object.keys(d).join(', ') + '; sau khi tải lại trang cửa sổ Lilith sẽ dùng cấu hình mới.' : 'Không tìm thấy cấu hình cũ.'; }
                const at = e.target.closest('[data-restore]')?.dataset.restore;
                if (at && confirm('Quay lui sổ cái Chư Thiên về bản sao lưu này? Sổ cái hiện tại sẽ bị thay thế (trạng thái trước khi quay lui cũng sẽ được tự động sao lưu trước).')) { await this.app.bridge.restoreBackup(Number(at)); out.textContent = 'Đã quay lui và lưu lại.'; this.app.statusbar?.rebuild(); }
            } catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
        });
    }
    /** 0.9.1: the two AI endpoint configs (for 复制诊断信息: only host + model are reported). */
    apiConfigs() { return readConfigs(this.app.bridge, this.app.original.ZhuTianMemoryCore?.NS); }
    /** 0.9.1: copy the diagnostic report; if the browser refuses, show it in a box to copy by hand. */
    async copyDiagnostics() {
        await this.worldbookBudget().catch(() => null);
        const text = buildReport(this.app);
        if (await copyText(text)) { this.toast('success', 'Đã sao chép thông tin chẩn đoán (không chứa API Key và nội dung trò chuyện), có thể dán và gửi trực tiếp'); return text; }
        const el = this.popup(`<h3>Thông tin chẩn đoán</h3><p>Trình duyệt không cho phép tự động sao chép: nhấn giữ khung văn bản bên dưới → Chọn tất cả → Sao chép.</p><textarea class="text_pole" readonly style="width:100%;height:50vh;font:12px/1.4 monospace">${esc(text)}</textarea>`, true);
        el.querySelector('textarea')?.select();
        return text;
    }
    async openDiagnostics() {
        await this.worldbookBudget().catch(() => null);
        const a = this.app.adapter, caps = a.capabilities || [], sb = this.app.statusbar?.state || {};
        this.popup(`<h3>Chẩn đoán tương thích · ${VERSION}</h3>
<p>SillyTavern <b>${esc(a.version)}</b>: ${esc(a.support?.reason)}</p><p>Phiên bản đã nghiệm thu: ${HOST_TESTED.join(' / ')} (mỗi phiên bản đều đã chạy nghiệm thu trình duyệt trên host thực tế cô lập).</p>
<table class="zt-table"><tr><th>Giao diện</th><th>Trạng thái</th></tr>${caps.map(x => `<tr><td>${esc(x.label)}</td><td>${x.ok ? '✅' : '❌ Tính năng liên quan tự động tắt'}</td></tr>`).join('')}</table>
<p>Thanh trạng thái nguyên bản: ${esc(sb.mode)} — ${esc(sb.reason)}</p>${(d => d ? `<p>Tầng mới nhất: ${d.ok === true ? '✅' : d.ok === false ? '⚠' : 'ℹ'} ${esc(d.text)}</p>` : '')(this.app.statusbar?.diagnoseLast?.())}<p>Trợ lý Lilith: ${(h => h ? (h.ok ? 'Đang chạy (mã nguồn gốc + cầu nối nguyên bản)' : '⚠ Cửa sổ đã tạo nhưng bản gốc chưa khởi động hoàn toàn: ' + esc(h.text)) : esc(this.app.assistantError || 'Chưa khởi động'))(this.app.assistant?.health?.())}</p>
<p>Hình nhân vật (Portrait): ${esc(this.app.portrait?.describe?.() || 'Hoạt ảnh tham số phân lớp nguyên bản')}</p>
<h4>Tình trạng thay thế bản gốc v1.1</h4><table class="zt-table"><tr><th>Thành phần gốc</th><th>Plugin tiếp quản</th></tr>${this.replacementRows().map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</table>
<div class="zt-popup-actions"><div class="menu_button" data-diag="copy">Sao chép thông tin chẩn đoán</div><div class="menu_button" data-diag="selftest">Tự kiểm tra trên điện thoại thật</div><div class="menu_button" data-diag="takeover">Tiếp quản bản cũ bằng 1 chạm</div><div class="menu_button" data-diag="api">Cài đặt cổng AI</div><div class="menu_button" data-diag="rerender">Kết xuất lại các tầng</div>${this.wbBudget && !this.wbBudget.ok ? '<div class="menu_button" data-diag="budget">Điều chỉnh ngân sách Sách Thế Giới</div>' : ''}</div>`, true)
            .addEventListener('click', e => { const act = e.target.closest('[data-diag]')?.dataset.diag; if (act === 'copy') this.copyDiagnostics(); if (act === 'selftest') { e.target.closest('.popup')?.querySelector('.popup-button-ok')?.click(); setTimeout(() => this.app.deviceCheck?.run(), 300); } if (act === 'takeover') this.app.runTakeover?.(); if (act === 'api') this.app.openApiCenter?.(); if (act === 'rerender') { this.app.statusbar?.rebuild(); this.toast('success', 'Đã kết xuất lại các tầng trò chuyện'); } if (act === 'budget' && this.fixWorldbookBudget()) { this.toast('success', 'Đã điều chỉnh ngân sách Sách Thế Giới.'); this.worldbookBudget(); } });
    }
    /** One row per piece of the original v1.1 install: what replaces it now and what is still left over. */
    replacementRows() {
        const app = this.app, st = app.settings, sb = app.statusbar, legacy = (() => { try { return detectLegacy(this.ctx); } catch { return []; } })();
        const left = kind => legacy.filter(i => i.kind === kind);
        const on = (k, yes, no = 'Đã tắt') => st.get(k) === false ? '⏸ ' + no : '✅ ' + yes;
        let api = { status: {}, assistant: {} }; try { api = readConfigs(app.bridge, app.original.ZhuTianMemoryCore?.NS); } catch { /* bridge gone */ }
        const apiText = c => c?.url ? (isMainApi(c.url) ? 'API chính của quán rượu' : esc(new URL(c.url).host) + (c.model ? ' · ' + esc(c.model) : '')) : '⚠ Chưa đặt (mở Cài đặt cổng AI)';
        const counts = sb?.counts || {};
        return [
            ['Sách Thế Giới 「诸天万界最强系统」', ({ chat: '✅ Đã liên kết vào cuộc trò chuyện hiện tại', 'auto-bound': '✅ Đã tự động cài đặt và liên kết vào cuộc trò chuyện hiện tại', global: '✅ Đã bật làm Sách Thế Giới toàn cục', character: '✅ Đã liên kết trên thẻ nhân vật', 'other-chat-book': '⚠ Cuộc trò chuyện hiện tại đang liên kết Sách Thế Giới khác, chưa tự động thay thế (có thể xử lý thủ công tại “Cài đặt/Liên kết Sách Thế Giới”)', 'not-zhutian': '… Cuộc trò chuyện hiện tại chưa phải bản lưu Chư Thiên (sẽ tự động liên kết sau khi có sổ cái hoặc thanh trạng thái)', off: '⏸ Tự động liên kết đã tắt' })[this.wbAuto] || esc(this.wbAuto || 'Đang kiểm tra') + ' (tích hợp sẵn 35 mục, khớp từng mục với bản gốc)'],
            ['Ngân sách Sách Thế Giới', !this.wbBudget ? '… Chưa kiểm tra' : this.wbBudget.ok ? `✅ ${this.wbBudget.budget} token ≥ quy tắc thường trú khoảng ${this.wbBudget.need}` : `⚠ Chỉ có ${this.wbBudget.budget} token, quy tắc thường trú cần khoảng ${this.wbBudget.need}: quán rượu sẽ bỏ qua quy tắc Chư Thiên — bấm “Điều chỉnh ngân sách Sách Thế Giới”`],
            ['Regex · Thanh trạng thái 3.1', sb ? (sb.state.mode === 'terminal' ? '✅ Kết xuất nguyên bản trong thiết bị đầu cuối (đầy đủ 8 trang tab), tầng chat chỉ giữ nhãn nhỏ' : sb.state.mode === 'native' ? '✅ Chế độ tương thích cũ: kết xuất nguyên bản trong tầng chat (từ 0.7.0 không còn cung cấp trong cài đặt)' : '⏸ ' + esc(sb.state.reason)) : '❌ ' + esc(app.statusbarError || 'Chưa khởi động')],
            ['Regex · Hiển thị rút gọn tầng cũ', sb?.state.mode === 'native' ? on('compactHistory', `Thẻ rút gọn nguyên bản (trang này đã hiển thị ${counts.compact || 0} thẻ), bấm để mở rộng thanh trạng thái đầy đủ`) : '✅ Ở chế độ thiết bị đầu cuối, các tầng không còn hiển thị thanh trạng thái mà thay bằng nhãn nhỏ “Hệ thống đã ghi nhận” (bấm để mở thiết bị đầu cuối)'],
            ['Regex · Tầng cũ không gửi cho AI', on('promptStripPanels', `Bộ chặn khi tạo (giữ lại ${esc(st.get('promptPanelKeepDepth'))} tầng mới nhất; đã xử lý ${promptFilterStats.runs} lần tạo / ${promptFilterStats.floors} tầng)`)],
            ['Regex · Khung giọng nói riêng của Lilith', on('voiceBox', `Khung giọng nói nguyên bản (đã kết xuất ${counts.voices || 0} mục), ảnh đại diện theo ngữ khí, không ghi từ chỉ cảm xúc`, 'Đã tắt (lời thoại hiển thị như văn bản thường)')],
            ['Tavern Helper · Macro biến số', st.get('macroLike') === false ? '⏸ Đã tắt' : tavernHelperMacrosActive(this.ctx) ? '↪ Tavern Helper đang chạy, do nó xử lý (plugin nhường quyền)' : !app.macros ? '⚠ Chưa khởi động (xem bảng điều khiển)' : /缺少|Thiếu/.test(app.macros.state || '') ? `⚠ ${esc(app.macros.state)}` : `✅ Xử lý nguyên bản {{get_chat_variable::…}} (${app.macros?.stats?.prompts || 0} lần tạo)`],
            ['Script Tavern Helper · Không Gian Khế Ước Lilith', app.assistant ? '✅ Mã nguồn gốc chạy qua cầu nối nguyên bản (ký ức, bàn làm việc, trò chuyện riêng, kết nối, hình nhân vật)' : '❌ ' + esc(app.assistantError || 'Chưa bật')],
            ['Tương tác chạm thực tế', app.touch?.stage ? on('touchGestures', `Chạm nhẹ + Vuốt ve + Nhấn giữ + Ánh mắt dõi theo (chạm nhẹ ${app.touch.stats.taps} / vuốt ve ${app.touch.stats.strokes} / nhấn giữ ${app.touch.stats.holds})`) : '… Gắn sau khi mở cửa sổ Lilith'],
            ['Bảo vệ định dạng khối dữ liệu (1.1.1)', app.panelGuard ? (st.get('panelGuard')?.repair === false ? '⏸ Tự động sửa đã tắt · ' : '✅ ') + esc(app.panelGuard.diag()) : '⚠ Chưa khởi động (xem bảng điều khiển)'],
            ['Quay lui ghi sổ khi roll lại (1.1.1)', app.rerollGuard ? `✅ Quay lui bản chụp tầng này trước khi swipe / tạo lại (phiên này đã quay lui ${app.rerollGuard.stats.rolled} lần / ghi sổ lại ${app.rerollGuard.stats.rebooked} lần)` : '⚠ Chưa khởi động (xem bảng điều khiển)'],
            ['API · Thanh trạng thái', apiText(api.status)],
            ['API · Trợ lý Lilith / Trò chuyện riêng', apiText(api.assistant)],
            ['Nội dung bản cũ vẫn đang bật', legacy.length ? '⚠ ' + legacy.map(i => esc(`${i.kind === 'regex' ? 'Regex' : 'Script'}: ${i.name}`)).join('; ') + ' — bấm “Tiếp quản bản cũ bằng 1 chạm” để tắt' + (left('script').length ? ' (chạy script trợ lý cũ cùng lúc với plugin sẽ xuất hiện hai Lilith)' : '') : '✅ Không có, đã được plugin tiếp quản hoàn toàn'],
        ];
    }

    // ---------- HUD ----------
    mountHud() {
        const form = document.getElementById('send_form'); if (!form || this.hud) return;
        const hud = document.createElement('div'); hud.id = ID + '-hud'; hud.className = 'zt-hud'; hud.setAttribute('role', 'button'); hud.tabIndex = 0;
        hud.title = 'Xem nhanh sổ cái Chư Thiên · Bấm để mở Thiết Bị Đầu Cuối Chư Thiên';
        form.parentElement.insertBefore(hud, form); this.hud = hud;
        const go = () => this.app.openTerminal('ov');
        hud.addEventListener('click', go); hud.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        this.refreshHud();
    }
    refreshHud() {
        if (!this.hud) return;
        const on = this.app.settings.get('hud'), s = ledgerSummary(this.app.adapter.variables());
        this.hud.hidden = !on || !s || !this.app.adapter.currentIdentity();
        if (s) this.hud.innerHTML = `<span class="zt-hud-mark">Chư Thiên</span><span>Điểm Hệ Thống <b>${esc(s.points)}</b></span>${s.world ? `<span>${esc(s.world)}</span>` : ''}${s.currency ? `<span>${esc(s.currency)} ${esc(s.amount)}</span>` : ''}<span>Nhiệm vụ ${s.tasks}${s.task ? ' · ' + esc(s.task) : ''}</span>`;
    }

    // ---------- hotkeys / slash / macros ----------
    mountHotkeys() {
        const fn = e => {
            if (!this.app.settings.get('hotkeys') || !e.altKey || e.ctrlKey || e.metaKey) return;
            const k = e.key.toLowerCase();
            if (k === 'z' || k === 'x') { e.preventDefault(); if (this.app.hub?.isOpen) this.app.hub.close(); else this.app.openTerminal(); }
            else if (k === 's') { e.preventDefault(); this.app.openTerminal('ov'); }
        };
        document.addEventListener('keydown', fn); this.disposers.push(() => document.removeEventListener('keydown', fn));
    }
    registerCommands() {
        const c = this.ctx;
        if (typeof c.registerSlashCommand === 'function' && !globalThis.__zhutianSlash) {
            globalThis.__zhutianSlash = true;   // the host has no unregister for legacy commands; callbacks resolve the live app
            c.registerSlashCommand('zt', (_args, value) => {
                const app = globalThis.__zhutianApp; if (!app) return 'Tiện ích mở rộng Chư Thiên chưa chạy';
                if (app.settings?.get('modules')?.slash === false) return 'Lệnh gạch chéo Chư Thiên đã bị tắt trong Cài đặt → Công tắc tính năng';
                const [cmd, ...rest] = String(value || 'open').trim().split(/\s+/);
                const f = app.features;
                switch (cmd) {
                    case 'open': case 'terminal': app.openTerminal(rest[0]); return '';
                    case 'status': app.openTerminal('ov'); return '';
                    case 'shop': app.openTerminal('shop'); return '';
                    case 'bag': app.openTerminal('bag'); return '';
                    case 'init': f.initChat().then(r => f.toast('success', r.created ? 'Đã khởi tạo sổ cái Chư Thiên' : 'Sổ cái đã tồn tại, đã bổ sung các trường còn thiếu')).catch(e => f.toast('error', e.message)); return '';
                    case 'world': f.openWorldbook(); return '';
                    case 'backup': f.openMigration(); return '';
                    case 'export': case 'import': app.dataIO?.open(); return '';
                    case 'diag': f.openDiagnostics(); return '';
                    case 'copydiag': f.copyDiagnostics(); return '';
                    case 'selftest': app.deviceCheck?.run(); return '';
                    case 'points': return String(ledgerSummary(app.adapter.variables())?.points ?? '');
                    case 'live2d': app.portrait?.setMode(rest[0] === 'off' ? 'rig' : 'live2d'); return '';
                    default: return 'Cách dùng: /zt open [trang]|status|shop|bag|init|world|backup|export|diag|copydiag|selftest|points|live2d [off]';
                }
            }, ['zhutian'], '<span class="monospace">/zt open [trang]|status|shop|bag|init|world|backup|export|diag|copydiag|selftest|points|live2d</span> – Thiết Bị Đầu Cuối Chư Thiên', true, true);
        }
        if (!globalThis.__zhutianMacros && (typeof c.macros?.register === 'function' || typeof c.registerMacro === 'function')) {
            globalThis.__zhutianMacros = true;
            const read = f => () => { try { const s = ledgerSummary(globalThis.__zhutianApp?.adapter.variables()); return s ? inert(String(f(s))) : ''; } catch { return ''; } };
            const defs = [['zt_points', s => s.points, 'Chư Thiên: Điểm Hệ Thống hiện tại'], ['zt_world', s => s.world, 'Chư Thiên: Thế giới hiện tại'], ['zt_task', s => s.task, 'Chư Thiên: Nhiệm vụ đang tiến hành đầu tiên']];
            // The new macro engine exists from 1.16 but is only ON by default from 1.17 (power_user.experimental_macro_engine).
            // Always register there; add the legacy MacrosParser entry only while the flag is off (1.16 default, or a user
            // who switched it off), re-checked on every settings save so toggling it at runtime keeps {{zt_*}} working.
            const legacyDone = new Set();
            const sync = () => {
                const ctx = globalThis.SillyTavern?.getContext?.() || c, engineOn = ctx.powerUserSettings?.experimental_macro_engine !== false && typeof ctx.macros?.register === 'function';
                for (const [name, f, description] of defs) {
                    if (!engineOn && !legacyDone.has(name) && typeof ctx.registerMacro === 'function') { ctx.registerMacro(name, read(f), description); legacyDone.add(name); }
                }
            };
            for (const [name, f, description] of defs) if (typeof c.macros?.register === 'function') c.macros.register(name, { handler: read(f), description });
            sync();
            const ev = c.eventTypes?.SETTINGS_UPDATED;
            if (ev) c.eventSource.on(ev, sync);          // registrations are process-wide (guarded by __zhutianMacros), so is this listener
        }
    }
    start() {
        this.mountHud(); this.mountHotkeys(); this.registerCommands();
        this.disposers.push(this.app.adapter.subscribe(() => this.refreshHud()));
        this.disposers.push(this.app.bridge.onChange(() => this.refreshHud()));
        this.disposers.push(this.app.settings.onChange(k => { if (k === 'hud') this.refreshHud(); if (k === 'worldbookAuto') this.scheduleWorldbook(); }));
        const c = this.ctx, ev = c.eventTypes, run = () => this.scheduleWorldbook();
        for (const key of ['CHAT_CHANGED', 'MESSAGE_RECEIVED']) if (ev[key]) { c.eventSource.on(ev[key], run); this.disposers.push(() => c.eventSource.removeListener(ev[key], run)); }
        this.scheduleWorldbook();
        setTimeout(() => { if (!this.dead) this.unbindNotice(); }, 2500);
    }
    scheduleWorldbook() { clearTimeout(this.wbTimer); this.wbTimer = setTimeout(() => this.autoWorldbook().catch(e => { this.wbAuto = 'error: ' + e.message; console.warn('[Chư Thiên] Tự động liên kết Sách Thế Giới thất bại', e); }), 800); }
    dispose() { this.dead = true; clearTimeout(this.wbTimer); this.disposers.splice(0).forEach(f => f()); this.hud?.remove(); this.hud = null; }
}
export { STORAGE };
