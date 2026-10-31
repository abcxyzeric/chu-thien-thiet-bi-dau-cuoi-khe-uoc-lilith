// 0.9.3 新手引导 — the first-run wizard proposed in docs/ROADMAP-1.0.md §6.
// Three steps, each can be done here or skipped, each shows a tick when the real state says it is done (the ticks are
// re-read from SillyTavern / the ledger every time, never remembered):
//   1. 世界书     — the 诸天 worldbook exists and is this plugin's latest version (install + bind / update, backup first)
//   2. AI 接口    — a model is configured for 莉莉丝 / the status bar AI buttons (one tap: SillyTavern's current main API,
//                   or the 0.8.5 three-step 连接 page)
//   3. 当前聊天   — the open single-character chat has an 诸天 ledger and 莉莉丝 memory is switched on for it
// The wizard is a terminal page (`guide`). It opens by itself once, the first time the terminal opens with something
// still missing; 跳过 / 完成 are remembered in settings.guide. 设置 → 新手引导 reopens it any time. Nothing here
// re-implements a step: it calls the same code as the existing buttons (features.installWorldbook / updateWorldbook /
// initChat, api-center saveConfigs, the original 「保存当前聊天设置」 of the memory page).
import { VERSION } from './contracts.js';
import { esc } from './hub.js';
import { readConfigs, saveConfigs } from './api-center.js';
import { MAIN_API_URL, isMainApi } from './th-bridge.js';
import { errorLine } from './errors.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

/** Pure: the three steps from a status snapshot (for the page and the tests).
 *  st = { wb: {exists, current, count, chatBound} | null, api: {model, main} | null, chat: {open, ledger, memory, assistant} } */
export function guideSteps(st = {}) {
    const wb = st.wb || null, api = st.api || null, chat = st.chat || {};
    const wbDone = !!(wb?.exists && wb?.current);
    const apiDone = !!api?.model;
    const chatDone = !!(chat.open && chat.ledger && (chat.memory || chat.assistant === false));
    return [
        { id: 'wb', title: 'Nhập hoặc cập nhật Sách Thế Giới', done: wbDone,
            text: !wb ? 'Không đọc được trạng thái Sách Thế Giới (host không có giao diện Sách Thế Giới). Có thể xử lý thủ công tại Cài đặt → Cài đặt / Liên kết Sách Thế Giới.'
                : wbDone ? `“Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” đã là bản mới nhất (${wb.count} mục)${wb.chatBound ? ', đã liên kết vào cuộc trò chuyện hiện tại' : ''}.`
                    : wb.exists ? `Đã có “Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” (${wb.count} mục), nhưng chưa phải bản mới nhất của plugin. Khi cập nhật sẽ lưu một bản sao lưu trước, các mục và công tắc bạn tự thêm sẽ được giữ lại.`
                        : 'Chưa cài đặt Sách Thế Giới Chư Thiên. Sau khi cài đặt AI mới biết quy tắc hệ thống; nếu đã có Sách Thế Giới cùng tên sẽ không bị ghi đè.' },
        { id: 'api', title: 'Cài đặt cổng AI', done: apiDone,
            text: apiDone ? `Đã đặt: ${api.main ? 'Sử dụng mô hình chính hiện tại của quán rượu' : api.model}.`
                : 'Trò chuyện riêng với Lilith, tổng hợp ký ức và các nút AI trong thanh trạng thái cần dùng một mô hình. Tiện nhất là dùng trực tiếp mô hình chính mà quán rượu đang dùng; cũng có thể điền API độc lập. Không cài đặt vẫn chơi được, chỉ là các tính năng này sẽ không dùng được.' },
        { id: 'chat', title: 'Bật trong cuộc trò chuyện hiện tại', done: chatDone,
            text: !chat.open ? 'Hãy mở một cuộc trò chuyện đơn nhân vật trước (không hỗ trợ trò chuyện nhóm), sau đó quay lại bấm bước này.'
                : chatDone ? `Cuộc trò chuyện hiện tại đã có sổ cái Chư Thiên${chat.assistant === false ? '' : ', ký ức Lilith đã được bật'}.`
                    : `${chat.ledger ? 'Sổ cái đã tồn tại' : 'Cuộc trò chuyện này chưa có sổ cái Chư Thiên (sẽ tạo theo quy tắc gốc)'}; ${chat.assistant === false ? 'cửa sổ Lilith chưa khởi động, chỉ xử lý sổ cái' : chat.memory ? 'ký ức Lilith đã được bật' : 'ký ức Lilith chưa được bật'}.` },
    ];
}
/** Pure: should the wizard open by itself? Only once (no answer stored yet) and only when something is missing. */
export function shouldAutoOpen(saved, steps) { return !saved && steps.some(s => !s.done); }

export class Onboarding {
    constructor(app) { this.app = app; this.disposers = []; this.el = null; this.busy = ''; this.note = ''; this.autoTried = false; }
    get hub() { return this.app.hub; }
    get settings() { return this.app.settings; }
    start() {
        const hub = this.hub; if (!hub) return this;
        hub.register('guide', { title: 'Hướng dẫn tân thủ', render: el => { this.el = el; this.paint(); } });
        const box = hub.groupBox?.('Thiết bị đầu cuối');
        if (box && !box.querySelector('[data-page="guide"]')) { const b = hub.navButton('guide', 'Hướng dẫn', 'flag'); b.title = 'Hướng dẫn tân thủ: Sách Thế Giới → Cổng AI → Bật trong cuộc trò chuyện hiện tại'; b.hidden = !!this.settings.get('guide'); box.prepend(b); this.nav = b; }
        hub.hook('onOpen', () => { this.maybeAuto(); });
        hub.hook('onClose', () => { hub.openedWith = null; });   // the original entry button opens without hub.open()
        hub.hook('onPage', p => this.backStrip(p));
        const repaint = () => { if (hub.isOpen && hub.page === 'guide') this.paint(); };
        this.disposers.push(this.app.bridge.onChange(() => repaint()));
        this.disposers.push(this.app.adapter.subscribe(() => repaint()));
        return this;
    }
    /** Real state of the three steps. Every part may fail on its own (old host, no chat): it then reads as not done. */
    async status() {
        const a = this.app.adapter, f = this.app.features;
        let wb = null; try { wb = await f?.worldbookStatus(); } catch { wb = null; }
        let api = null; try { const { status, assistant } = readConfigs(this.app.bridge, this.ns()); const c = assistant?.model ? assistant : status; api = { model: String(c?.model || ''), main: isMainApi(c?.url) }; } catch { api = null; }
        const open = !!a.currentIdentity?.();
        let ledger = false; try { ledger = !!a.ledger?.(); } catch { ledger = false; }
        const host = this.app.assistant;
        return { wb, api, chat: { open, ledger, memory: open && this.memoryOn(), assistant: host?.hostElement?.isConnected ? true : false } };
    }
    ns() { return this.app.original?.ZhuTianMemoryCore?.NS; }
    memoryOn() { try { const ns = this.ns(); return !!(ns && this.app.bridge.getVariables({ type: 'chat' })?.[ns]?.enabled); } catch { return false; } }
    async maybeAuto() {
        // Only on a plain open (entry button / float / hotkey): a floor tag or a 查看星图 link asked for its own page.
        if (this.autoTried || this.settings.get('guide') || this.hub.openedWith || this.settings.get('modules')?.guide === false) return;
        this.autoTried = true;
        const steps = guideSteps(await this.status());
        if (!shouldAutoOpen(this.settings.get('guide'), steps)) { if (steps.every(s => s.done)) this.finish('done', true); return; }
        if (this.hub.isOpen) this.hub.go('guide');
    }
    open() { this.hub?.open('guide'); }
    finish(state, silent = false) {
        this.settings.set('guide', { state, at: Date.now(), version: VERSION });
        if (this.nav) this.nav.hidden = true;
        if (!silent) { this.hub?.toast(state === 'done' ? 'Hoàn tất hướng dẫn tân thủ, chúc bạn xuyên không vui vẻ' : 'Đã bỏ qua hướng dẫn tân thủ; có thể mở lại bất cứ lúc nào tại Cài đặt → Hướng dẫn tân thủ', 3500); this.hub?.go('ov'); }
    }
    async paint() {
        const el = this.el; if (!el) return;
        const st = await this.status(), steps = guideSteps(st), n = steps.filter(s => s.done).length;
        if (el !== this.el) return;
        const btn = (act, label, primary = false, dis = false) => `<button type="button" class="zt-btn small${primary ? ' primary' : ''}" data-guide="${act}"${dis || this.busy ? ' disabled' : ''}>${esc(this.busy === act ? 'Đang xử lý…' : label)}</button>`;
        const acts = {
            wb: s => s.done ? '' : !st.wb ? btn('wb-open', 'Mở cài đặt Sách Thế Giới') : st.wb.exists ? btn('wb-update', 'Cập nhật lên bản mới nhất (sao lưu trước)', true) : btn('wb-install', st.chat.open ? 'Cài đặt và liên kết vào cuộc trò chuyện hiện tại' : 'Cài đặt Sách Thế Giới', true),
            api: s => s.done ? btn('api-open', 'Sửa') : btn('api-main', 'Dùng mô hình chính hiện tại của quán rượu', true) + btn('api-open', 'Điền API độc lập ›'),
            chat: s => s.done ? '' : btn('chat-enable', 'Bật trong cuộc trò chuyện hiện tại', true, !st.chat.open),
        };
        el.classList.add('zt-guide-page');
        el.innerHTML = `<div class="zt-eyebrow">FIRST RUN</div><h2 class="zt-h">Hướng dẫn tân thủ</h2>
<p class="zt-sub">Chỉ cần 3 bước để bắt đầu: Sách Thế Giới → Cổng AI → Bật trong cuộc trò chuyện hiện tại. Mỗi bước đều có thể bỏ qua, sau này vẫn có thể mở lại tại 「Cài đặt → Hướng dẫn tân thủ」. Đã hoàn thành ${n} / 3.</p>
<ol class="zt-guide-steps">${steps.map((s, i) => `<li class="zt-card zt-guide-step" data-step="${s.id}" data-done="${s.done ? 1 : 0}"><h3><span class="zt-guide-mark" aria-hidden="true">${s.done ? '✓' : i + 1}</span>${esc(s.title)}<small>${s.done ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</small></h3><p class="zt-sub">${esc(s.text)}</p><div class="zt-actions">${acts[s.id](s)}</div></li>`).join('')}</ol>
${this.note ? `<p class="zt-guide-note" role="status">${esc(this.note)}</p>` : ''}
<div class="zt-actions zt-guide-foot">${n === 3 ? btn('done', 'Hoàn tất', true) : btn('skip', 'Bỏ qua hướng dẫn') + btn('later', 'Để sau tính tiếp')}</div>`;
        if (!el.__ztGuide) { el.__ztGuide = true; el.addEventListener('click', e => { const b = e.target.closest('[data-guide]'); if (b && !b.disabled) this.run(b.dataset.guide); }); }
    }
    async run(act) {
        const app = this.app, f = app.features;
        if (act === 'skip') return this.finish('skipped');
        if (act === 'later' || act === 'done') return this.finish(act === 'done' ? 'done' : 'skipped');
        if (act === 'api-open') { this.returning = true; return this.hub.go('api'); }
        if (act === 'wb-open') return f?.openWorldbook();
        this.busy = act; this.note = ''; await this.paint();
        try {
            if (act === 'wb-install') { const r = await f.installWorldbook(app.adapter.currentIdentity() ? 'chat' : 'none'); this.note = `Đã cài đặt Sách Thế Giới (${r.count} mục)${r.chatBound ? ', đã liên kết vào cuộc trò chuyện hiện tại' : ''}.`; }
            else if (act === 'wb-update') { const r = await f.updateWorldbook(); this.note = r.created ? `Đã cài đặt bản mới nhất (${r.count} mục).` : `Đã cập nhật: thay thế ${r.replaced} mục, thêm mới ${r.added} mục, giữ lại ${r.kept} mục của bạn; bản cũ sao lưu thành “${r.backup}”.`; }
            else if (act === 'api-main') { await saveConfigs(app.bridge, this.ns(), { url: MAIN_API_URL }); app.adapter.notify?.(); this.note = 'Đã đặt sử dụng mô hình chính hiện tại của quán rượu (không gửi yêu cầu đi nơi khác).'; }
            else if (act === 'chat-enable') this.note = await this.enableChat();
        } catch (e) { this.note = 'Chưa hoàn tất: ' + errorLine(e); }
        finally { this.busy = ''; }
        await this.paint();
    }
    /** Step 3: ledger (original init rules) + 莉莉丝 memory through the original 「保存当前聊天设置」 button. */
    async enableChat() {
        const app = this.app, a = app.adapter;
        if (!a.currentIdentity()) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước.');
        const out = [];
        if (!a.ledger()) { const r = await app.features.initChat(); out.push(r.created ? `Đã tạo sổ cái (Điểm Hệ Thống ${r.points})` : 'Đã bổ sung sổ cái'); try { app.hub?.reloadEngine?.(); } catch { /* ignore */ } }
        const sh = app.assistant?.shadow;
        if (sh && !this.memoryOn()) {
            const box = sh.getElementById('enabled'), save = sh.getElementById('save-chat'), auto = sh.getElementById('auto');
            if (!box || !save) throw Error('Không tìm thấy công tắc bật ở trang 「Ký ức」 của Lilith; vui lòng vào Lilith → Ký ức tích chọn và lưu thủ công.');
            box.checked = true;
            // 自动整理 needs a model; without one the original save refuses — keep it off rather than fail.
            if (auto?.checked) { let model = ''; try { model = readConfigs(app.bridge, this.ns()).assistant?.model || ''; } catch { /* none */ } if (!model) auto.checked = false; }
            save.click();
            for (let i = 0; i < 30 && !this.memoryOn(); i++) await wait(100);
            if (!this.memoryOn()) throw Error(((sh.getElementById('status')?.textContent || '').trim() || 'Lilith chưa xác nhận bật') + ' (có thể vào Lilith → Ký ức tích chọn và lưu thủ công)');
            out.push('Đã bật ký ức Lilith');
        }
        return (out.join(', ') || 'Cuộc trò chuyện hiện tại đã được bật') + '.';
    }
    /** On the 连接 page during the wizard: a strip to come back after saving. */
    backStrip(page) {
        const sec = this.hub?.shadow?.getElementById('page-api');
        sec?.querySelector(':scope > .zt-guide-back')?.remove();
        if (page !== 'api' || !this.returning) { if (page !== 'api') this.returning = false; return; }
        const d = document.createElement('div'); d.className = 'zt-guide-back';
        d.innerHTML = '<span>Hướng dẫn tân thủ · Bước 2: Sau khi lưu xong cổng AI</span><button type="button" class="zt-btn small primary">‹ Quay lại hướng dẫn tân thủ</button>';
        d.querySelector('button').addEventListener('click', () => { this.returning = false; this.hub.go('guide'); });
        sec?.prepend(d);
    }
    dispose() { this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); this.nav?.remove(); }
}
