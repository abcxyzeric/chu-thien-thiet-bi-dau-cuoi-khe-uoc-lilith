import { frameScope, releaseFrames } from './action-support.js';
// Presentation records are NOT receipts. Never deletes chat floors, panel snapshots or transaction IDs.
import { esc } from './hub.js';
export function trimModuleHints(s) {
    return String(s).replace(/【(?:本次涉及模块关键词|模块关键词|Từ khóa mô-đun liên quan lần này|Từ khóa mô-đun)[^】]*】/g, '').replace(/\n{3,}/g, '\n\n');
}
export function recordKind(s) {
    return /商城刷新|刷新失败|Làm mới Thương Thành|Làm mới thất bại/i.test(s)
        ? 'refresh'
        : /分解|回收|Phân giải|Thu hồi/i.test(s)
            ? 'recycle'
            : /购买|保留|入库|抽取|盲盒|Mua|Giữ lại|Vào kho|Rút thưởng|Hộp mù/i.test(s)
                ? 'items'
                : 'story';
}
export function recordText(li) {
    const copy = li.cloneNode(true); copy.querySelectorAll('input,label[data-zt-select],.gacha-raw-result').forEach(n => n.remove());
    return copy.textContent.replace(/【(?:模块关键词|Từ khóa mô-đun)[^】]*】/g, '').replace(/\s+/g, ' ').trim();
}
export function summarizeRecords(rows) {
    const kept = rows.filter(r => r.selected && r.kind !== 'refresh');
    if (!kept.length) return '';
    const regular = kept.filter(r => r.kind !== 'recycle').map(r => r.text);
    const recycle = kept.filter(r => r.kind === 'recycle');
    if (recycle.length) regular.push(`Đã phân giải/thu hồi ${recycle.length} mục: ${recycle.map(r => r.text.replace(/^[^:：]*[:：]\s*/, '')).join('; ')}`);
    return `【Tóm Tắt Thao Tác Chư Thiên】Các thao tác dưới đây đã thực thi, vui lòng không trừ phí, phát thưởng hay nhập kho lặp lại.\n${regular.join('\n')}\nChỉ dựa vào các sự thật đã xác nhận này để nối tiếp cốt truyện.`;
}
/** Only recognized boilerplate is removed from a generation COPY; prose and original chat stay unchanged. */
export function compactLegacyOperation(text) {
    const s = String(text);
    if (!s.startsWith('[系统操作：本次消费/抽取记录如下。') && !s.startsWith('[Thao tác hệ thống: Bản ghi tiêu dùng/rút thưởng lần này như sau.')) return text;
    return s.replace(/^\[(?:系统操作：|Thao tác hệ thống:)[^\n]*\n\n/, '【Thao tác lịch sử Chư Thiên: Sổ cái đã thực thi, không kết toán lặp lại】\n')
        .replace(/^\d+\.\s*.*(?:商城刷新|Làm mới Thương Thành)[^\n]*\n?/gm, '')
        .replace(/【(?:本次涉及模块关键词|模块关键词|Từ khóa mô-đun liên quan lần này|Từ khóa mô-đun)[^】]*】/g, '')
        .replace(/\n(?:当前盲盒状态：|Trạng thái hộp mù hiện tại:)[^\n]*\n/g, '\n')
        .replace(/\n(?:注：以上分解\/回收|Ghi chú: Các mục phân giải\/thu hồi trên)[^\n]*\n/g, '\n')
        .replace(/\n(?:注意：以上数据已同步，无需再更新面板数据。|Lưu ý: Dữ liệu trên đã được đồng bộ, không cần cập nhật lại dữ liệu bảng\.)\]$/, '')
        .replace(/\n{3,}/g, '\n\n');
}
export class OperationRecords {
    constructor(app) { this.app = app; this.off = []; this.mounted = new WeakSet(); }
    start() {
        const sb = this.app.statusbar; if (sb) { const prev = sb.enhanceFrame, enhance = (f, d) => { prev?.(f, d); this.mount(f, d); }; sb.enhanceFrame = enhance; this.off.push(() => { if (sb.enhanceFrame === enhance) sb.enhanceFrame = prev; }); }
        this.app.hub?.hook('onEngine', (frame, doc) => this.mount(frame, doc));
        this.app.hub?.addNav('Giao dịch', 'records', 'Nhật ký', 'flag', { title: 'Nhật ký thao tác cục bộ', render: el => {
            const rows = this.app.adapter.ledger()?.操作日志 || [];
            el.innerHTML = `<h3>Nhật ký thao tác cục bộ</h3><p class="zt-note">100 mục gần nhất, chỉ dùng để đối chiếu, không tự động gửi cho mô hình. Đây không phải nơi hoàn tác giao dịch.</p>${rows.slice().reverse().map(r => `<article class="zt-card"><small>${esc(new Date(r.at).toLocaleString())} · ${esc(r.kind)}</small><p>${esc(r.text)}</p></article>`).join('') || '<p>Chưa có nhật ký.</p>'}`;
        } }); return this;
    }
    mount(frame, doc) {
        if (this.dead || this.mounted.has(doc)) return; this.mounted.add(doc);
        const off = frameScope(this, frame, doc);
        const w = frame.contentWindow, insert = w?.insertIntoChatInput;
        if (typeof insert === 'function') { const wrapped = (...args) => { args[0] = trimModuleHints(args[0]); return insert.apply(w, args); }; w.insertIntoChatInput = wrapped; off.push(() => { if (w.insertIntoChatInput === wrapped) w.insertIntoChatInput = insert; }); }
        const root = doc.querySelector('.mvu-sys'), card = root?.querySelector('.cart-card'), list = card?.querySelector('.cart-items-list'); if (!list) return;
        const bar = doc.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0';
        bar.innerHTML = '<button type="button" data-select="all">Chọn tất cả</button><button type="button" data-select="none">Bỏ chọn hết</button><button type="button" data-select="items">Vật phẩm</button><button type="button" data-select="recycle">Phân giải/Thu hồi</button><button type="button" data-select="story">Cốt truyện</button><button type="button" data-select="clear">Xóa hiển thị</button>';
        card.insertBefore(bar, list);
        const seen = new WeakSet();
        const paint = () => {
            for (const li of [...list.children]) {
                if (seen.has(li)) continue; seen.add(li);
                const kind = recordKind(li.textContent); if (kind === 'refresh') { li.remove(); continue; }
                li.dataset.ztKind = kind;
                const label = doc.createElement('label'); label.dataset.ztSelect = '1'; label.style.cssText = 'display:inline-flex;min-width:32px;min-height:32px;align-items:center';
                const cb = doc.createElement('input'); cb.type = 'checkbox'; cb.checked = kind !== 'recycle'; cb.setAttribute('aria-label', 'Chọn bản ghi này để gửi'); label.append(cb); li.prepend(label);
            }
            const checkout = card.querySelector('.btn-checkout'); if (checkout) checkout.textContent = 'Xem trước tóm tắt cốt truyện đã chọn';
        };
        const observer = new MutationObserver(paint); observer.observe(list, { childList: true, subtree: true }); paint();
        bar.onclick = e => { const mode = e.target.dataset.select; if (!mode) return;
            if (mode === 'clear') { if (confirm('Chỉ xóa danh sách đang hiển thị, không hoàn tiền, không xóa túi đồ, không hủy bất kỳ giao dịch nào. Tiếp tục?')) list.replaceChildren(); return; }
            for (const li of list.children) { const cb = li.querySelector('input[type=checkbox]'); if (cb) cb.checked = mode === 'all' || li.dataset.ztKind === mode; }
        };
        const click = e => {
            if (!e.target.closest?.('.btn-checkout')) return; e.preventDefault(); e.stopImmediatePropagation();
            const rows = [...list.children].map(li => ({ text: recordText(li), kind: li.dataset.ztKind, selected: !!li.querySelector('input[type=checkbox]')?.checked }));
            const text = summarizeRecords(rows); if (!text) return this.app.hub.toast('Chưa chọn bản ghi cốt truyện nào cần gửi.');
            this.preview(text);
        };
        doc.addEventListener('click', click, true);
        off.push(() => { observer.disconnect(); doc.removeEventListener('click', click, true); bar.remove(); });
    }
    preview(text) {
        const h = this.app.hub, token = this.app.adapter.currentIdentity();
        let el = h.pages.get('record-preview')?.el;
        if (!el) el = h.register('record-preview', { title: 'Xem trước khi gửi' });
        el.innerHTML = `<h3>Xem trước khi gửi</h3><p>Chỉ chèn vào ô nhập chính, bạn vẫn là người xác nhận gửi đi. Sẽ không ghi sổ cái lần nữa.</p><textarea rows="10" style="width:100%;box-sizing:border-box">${esc(text)}</textarea><button type="button" class="zt-btn primary">Chèn vào ô nhập chính</button>`;
        el.querySelector('button').onclick = () => {
            if (this.app.adapter.currentIdentity() !== token) return h.toast('Trò chuyện đã chuyển, vui lòng chọn lại bản ghi.');
            const input = document.querySelector('#send_textarea'); if (!input) return h.toast('Ô nhập chính không khả dụng');
            input.value = [input.value, el.querySelector('textarea').value].filter(Boolean).join('\n\n'); input.dispatchEvent(new Event('input', { bubbles: true })); h.inputWritten();
        }; h.go('record-preview');
    }
    dispose() { this.dead = true; releaseFrames(this); this.off.splice(0).forEach(f => f()); }
}
