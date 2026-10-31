// 1.1.5 Thiết bị đầu cuối · Công tắc tính năng: mọi tính năng nằm trong một bảng — tác dụng là gì, đang bật hay tắt, và thay đổi có cần
// làm mới trang hay không. Các dòng ghi vào cùng cài đặt mà phần còn lại của thiết bị đầu cuối đọc (không sinh thêm biến mới phải đồng bộ), toàn bộ
// mô-đun dùng `modules.*`, và các trang rời khỏi thanh điều hướng thông qua `navHidden`.
import { esc } from './hub.js';
import { ALWAYS_PAGES, hiddenPages } from './hub.js';
import { errorLine } from './errors.js';

const b = (k, label, desc = '', o = {}) => ({ kind: 'bool', k, label, desc, ...o });
const v = (k, on, off, label, desc = '', o = {}) => ({ kind: 'value', k, on, off, label, desc, ...o });
const m = (name, label, desc = '', o = {}) => ({ kind: 'bool', k: 'modules.' + name, label, desc, dflt: true, ...o });

/** Every switch, grouped (pure data; tests check each key exists in the settings defaults). */
export const SWITCH_GROUPS = Object.freeze([
    { id: 'assistant', title: 'Trợ lý hệ thống', items: [
        b('assistant', 'Cửa sổ Trợ lý hệ thống', 'Cửa sổ gốc: Bàn làm việc, Ký ức, Quy tắc, Trò chuyện riêng. Sau khi tắt, thiết bị đầu cuối vẫn dùng bình thường nhưng các trang này, trò chuyện riêng và ký ức tự động sẽ không còn.', { reload: true }),
        v('floatLilith', 'auto', 'none', 'Cửa sổ nổi (Lilith nổi / Ảnh đại diện)', 'Tắt = không hiển thị lối vào nổi trên trang; thiết bị đầu cuối vẫn mở được từ trình đơn tiện ích mở rộng, phím tắt hoặc nhãn tầng.'),
        b('voiceBox', 'Khung thoại Trợ lý hệ thống trong tầng trò chuyện', 'Vẽ 「【Lilith】: “……”」 thành thẻ thoại; khi tắt sẽ hiển thị văn bản như nguyên gốc.'),
        b('touchGestures', 'Tương tác chạm (xoa đầu / nhấn giữ / mắt nhìn theo)', 'Chỉ có hiệu lực với chân dung Lilith.'),
        b('haptics', 'Phản hồi rung khi chạm (điện thoại)'),
        b('lilith.react', 'Phản ứng nhân vật trên giao diện', 'Phản ứng với nhiệm vụ / vật phẩm / công pháp đang chọn và kết quả quyết toán thành bại.'),
        b('lilith.pageLines', 'Nói một câu khi vào trang hệ thống'),
        b('lilith.camera', 'Góc máy (Bán thân / Toàn thân / Cận cảnh khuôn mặt)'),
        b('lilith.story', 'Thông báo qua bong bóng thoại', 'Mục 「Thông báo hệ thống」 trong khối dữ liệu được nói ra qua bong bóng thoại của chân dung.'),
    ] },
    { id: 'floor', title: 'Tầng trò chuyện & Khối dữ liệu', items: [
        v('statusbar', 'terminal', 'off', 'Ghi sổ khối dữ liệu hệ thống', 'Tắt = tiện ích không còn xử lý khối dữ liệu trong cốt truyện nữa, sổ cái không tự động ghi nhận từ cốt truyện (các thao tác thủ công trên thiết bị đầu cuối vẫn dùng được).'),
        b('floorTag', 'Nhãn nhỏ ở tầng “Hệ thống đã ghi nhận”'),
        b('promptStripPanels', 'Không gửi khối dữ liệu của các tầng cũ cho AI (tiết kiệm token)'),
        b('panelGuard.repair', 'Bảo vệ định dạng khối dữ liệu: tự động sửa chữa phản hồi mới'),
        v('panelGuard.backfill', 'missing', 'off', 'Ghi bù khi thiếu khối dữ liệu', 'Khi trong phản hồi không có khối dữ liệu, dựa theo cốt truyện viết bù một bản (tốn thêm một yêu cầu).'),
        b('panelGuard.remind', 'Nhắc nhở định dạng mỗi lượt (gửi cho AI)'),
        b('panelGuard.skillHint', 'Gợi ý công pháp cốt truyện chưa ghi sổ'),
        b('macroLike', 'Macro biến Sách Thế Giới {{get_chat_variable::…}}', 'Khi Tavern Helper đang chạy sẽ tự động nhường quyền.'),
        b('worldbookAuto', 'Bản lưu Chư Thiên tự động cài đặt và gắn kết Sách Thế Giới'),
        b('wbUnbindOnDisable', 'Tự động gỡ gắn kết Sách Thế Giới khi tắt tiện ích'),
    ] },
    { id: 'prompt', title: 'Gợi ý cốt truyện (quy tắc bổ sung gửi cho AI chính văn)', items: [
        b('world.prompt', 'Ghi nhận xuyên không (Thế giới hiện tại / Loại thế giới)'),
        b('appraise.prompt', 'Gợi ý phẩm giai: khi thu lục ghi rõ phẩm giai'),
        b('appraise.raise', 'Đính chính phẩm giai: 「Thu lục:X[Phẩm giai cao hơn]」'),
        b('skills.prompt', 'Gợi ý hiệu quả độ thuần thục công pháp'),
        b('skills.practice', 'Tích lũy độ thuần thục qua thực chiến'),
        b('skills.cardAuto', 'Tự động đồng bộ công pháp từ thẻ nhân vật'),
        m('plugins', 'Phụ trợ tự tạo', 'Trang 「Tự tạo」 và lời nhắc của các phụ trợ đang bật. Sau khi tắt, trang sẽ ẩn đi và quy tắc phụ trợ không còn gửi cho AI nữa (bản thân phụ trợ vẫn được giữ lại).'),
    ] },
    { id: 'group', title: 'Nhóm chat', items: [
        m('group', 'Nhóm chat', 'Toàn bộ nhóm chat: trang giao diện, bản tóm tắt nhóm chat gửi cho chính văn, tự động tán gẫu, giáng lâm. Sau khi tắt dữ liệu vẫn được giữ lại, bật lại sẽ khôi phục ngay.'),
        m('groupAuto', 'Tự động tán gẫu sau cốt truyện (công tắc tổng)', 'Trong từng cuộc trò chuyện vẫn cần bật riêng tại Nhóm chat → Quản trị nhóm; tắt ở đây = mọi cuộc trò chuyện đều không tự động tán gẫu.'),
        b('groupWorld.read', 'Đọc Sách Thế Giới', '「Triệu hồi từ Sách Thế Giới」, khi trò chuyện nhóm / trò chuyện riêng sẽ mang theo tư liệu mục của thành viên được triệu hồi và các mục khớp từ khóa (chỉ đọc).'),
        b('groupWorld.memory', 'Tiêm ký ức thành viên nhóm', 'Khi nhân vật được triệu hồi từ Sách Thế Giới xuất hiện trong chính văn, mang bản tóm tắt trò chuyện nhóm / trò chuyện riêng giữa họ và bạn gửi cho AI chính văn. Yêu cầu mục 「Đưa tóm tắt nhóm vào lời nhắc」 của cuộc trò chuyện đó phải đang bật.'),
    ] },
    { id: 'ui', title: 'Giao diện & Thao tác', items: [
        b('hud', 'Xem nhanh sổ cái phía trên ô nhập liệu'),
        b('hotkeys', 'Phím tắt Alt+Z / Alt+X / Alt+S'),
        m('slash', 'Lệnh gạch chéo /zt'),
        m('guide', 'Tự động bật Hướng dẫn tân thủ', 'Sau khi tắt vẫn có thể mở thủ công tại Cài đặt → Hướng dẫn tân thủ.'),
        b('world.enabled', 'Chủ đề thế giới (đổi họa tiết trang trí theo thế giới hiện tại)', 'Tắt = cố định chủ đề mặc định Chư Thiên.'),
        v('fx.mode', 'full', 'off', 'Diễn xuất (hoạt ảnh quyết toán)'),
        b('fx.outside', 'Thẻ gợi ý cốt truyện khi thiết bị đầu cuối đang đóng'),
    ] },
]);
/** Rows in the 终端页面 group that come from the navigation itself. */
export const PER_CHAT_NOTES = Object.freeze([
    ['Tổng hợp ký ức / Ký ức tự động', 'Thiết lập riêng cho từng cuộc trò chuyện', 'memory'],
    ['Đưa tóm tắt nhóm vào lời nhắc · Khoảng cách tự động tán gẫu', 'Thiết lập riêng cho từng cuộc trò chuyện (Nhóm chat → Quản trị nhóm)', 'group'],
    ['Bật phụ trợ', 'Thiết lập riêng cho từng cuộc trò chuyện (Trang Tự tạo / Phụ trợ)', 'plugmgr'],
]);

const read = (all, k) => k.split('.').reduce((o, x) => o?.[x], all);
/** Is this row on? (pure) */
export function switchOn(row, all) {
    const cur = read(all || {}, row.k);
    if (row.kind === 'value') return cur !== row.off;
    if (cur === undefined) return row.dflt !== false;
    return cur !== false && !!cur;
}
/** Settings write for a row (pure): [topKey, newTopValue]. `prev` remembers the last non-off value of value rows. */
export function switchWrite(row, all, on, prev = {}) {
    const [head, tail] = row.k.split('.');
    const val = row.kind === 'value' ? (on ? (prev[row.k] && prev[row.k] !== row.off ? prev[row.k] : row.on) : row.off) : !!on;
    if (!tail) return [head, val];
    return [head, { ...(all?.[head] || {}), [tail]: val }];
}
/** Summary counts (pure). */
export function switchSummary(all, navHidden = []) {
    let on = 0, total = 0;
    for (const g of SWITCH_GROUPS) for (const r of g.items) { total++; if (switchOn(r, all)) on++; }
    return { on, total, pagesOff: (navHidden || []).length };
}

export class HubSwitches {
    constructor(app) { this.app = app; this.prev = {}; }
    get hub() { return this.app.hub; }
    get s() { return this.app.settings; }
    start() {
        const hub = this.hub; if (!hub) return this;
        hub.register('switches', { title: 'Công tắc tính năng', render: el => this.render(el) });
        return this;
    }
    dispose() { /* the hub removes its pages */ }
    pages() {
        const nav = this.hub?.shell?.nav; if (!nav) return [];
        const out = [];
        for (const g of nav.querySelectorAll('.zt-nav-group')) {
            const title = g.querySelector('.zt-nav-title')?.textContent?.trim() || '';
            for (const btn of g.querySelectorAll('.nav-button[data-page]')) {
                const id = btn.dataset.page; if (ALWAYS_PAGES.includes(id) || id === 'guide') continue;
                out.push({ id, label: (btn.textContent || id).trim(), group: title });
            }
        }
        return out;
    }
    render(el) {
        if (!el) return; this.el = el;
        const all = this.s.all, navHidden = Array.isArray(all.navHidden) ? all.navHidden : [], off = hiddenPages(navHidden, all.modules);
        const sum = switchSummary(all, navHidden), current = this.app.persona;
        const row = (r, gi, ri) => {
            const on = switchOn(r, all);
            return `<tr data-search="${esc((r.label + ' ' + r.desc).toLowerCase())}"><td>${esc(r.label)}${r.reload ? '<span class="zt-sw-tag">Có hiệu lực sau khi làm mới</span>' : ''}${r.desc ? `<small>${esc(r.desc)}</small>` : ''}</td><td class="c"><label class="zt-switch"><input type="checkbox" data-sw="${gi}:${ri}" ${on ? 'checked' : ''} aria-label="${esc(r.label)}"><i></i></label></td></tr>`;
        };
        const pages = this.pages();
        el.innerHTML = `<div class="zt-eyebrow">FEATURE SWITCHES</div><h2 class="zt-h">Công tắc tính năng</h2>
<p class="zt-sub">Tất cả tính năng đều được bật/tắt tại đây. Thay đổi có hiệu lực ngay lập tức (trừ các mục ghi 「Có hiệu lực sau khi làm mới」); dữ liệu của các tính năng đã tắt đều được giữ nguyên, bật lại sẽ khôi phục ngay.</p>
<div class="zt-sw-sum"><span class="zt-chip">Đã bật ${sum.on} / ${sum.total} tính năng</span><span class="zt-chip">Trang đang ẩn: ${off.size}</span><span class="zt-chip">Trợ lý hệ thống: ${esc(current?.name || 'Lilith')}</span><button type="button" class="zt-btn small" data-sw-act="persona">Thiết lập Trợ lý hệ thống ›</button><button type="button" class="zt-btn small" data-sw-act="all-on">Bật tất cả</button><button type="button" class="zt-btn small" data-sw-act="back">Quay lại Cài đặt</button></div>
<div class="zt-set-search"><input type="search" data-f="swq" placeholder="Tìm kiếm tính năng, ví dụ: nhóm chat, sách thế giới, thoại" aria-label="Tìm kiếm tính năng" enterkeyhint="search"></div>
<div class="zt-grid2">${SWITCH_GROUPS.map((g, gi) => `<section class="zt-card" data-sw-group="${g.id}"><h3>${esc(g.title)}</h3><table class="zt-sw-table"><tbody>${g.items.map((r, ri) => row(r, gi, ri)).join('')}</tbody></table></section>`).join('')}
<section class="zt-card" data-sw-group="pages"><h3>Trang trên thiết bị đầu cuối <small>Tắt = ẩn khỏi thanh điều hướng (Tổng quan, Cài đặt, Kết nối luôn được giữ lại)</small></h3><table class="zt-sw-table"><tbody>${pages.map(p => `<tr data-search="${esc((p.label + ' ' + p.group).toLowerCase())}"><td>${esc(p.label)}<small>${esc(p.group)}${p.id === 'group' && all.modules?.group === false ? ' · Đã tắt theo 「Nhóm chat」' : ''}${p.id === 'plugmgr' && all.modules?.plugins === false ? ' · Đã tắt theo 「Phụ trợ tự tạo」' : ''}</small></td><td class="c"><label class="zt-switch"><input type="checkbox" data-page-sw="${esc(p.id)}" ${off.has(p.id) ? '' : 'checked'} ${(p.id === 'group' && all.modules?.group === false) || (p.id === 'plugmgr' && all.modules?.plugins === false) ? 'disabled' : ''} aria-label="Hiển thị ${esc(p.label)}"><i></i></label></td></tr>`).join('')}</tbody></table></section>
<section class="zt-card"><h3>Công tắc theo từng cuộc trò chuyện <small>Các mục này đi theo từng cuộc trò chuyện, được thiết lập trong trang tương ứng</small></h3><table class="zt-sw-table"><tbody>${PER_CHAT_NOTES.map(([a, d, page]) => `<tr><td>${esc(a)}<small>${esc(d)}</small></td><td class="c"><button type="button" class="zt-btn small" data-sw-go="${page}">Tới cài đặt</button></td></tr>`).join('')}</tbody></table></section>
</div><p class="zt-set-none" hidden>Không tìm thấy tính năng nào khớp.</p>`;
        const q = el.querySelector('[data-f=swq]');
        q.oninput = () => {
            const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean); let hits = 0;
            for (const tr of el.querySelectorAll('tr[data-search]')) { const ok = words.every(w => tr.dataset.search.includes(w)); tr.hidden = !ok; if (ok) hits++; }
            for (const sec of el.querySelectorAll('section[data-sw-group]')) sec.hidden = !!words.length && !sec.querySelector('tr[data-search]:not([hidden])');
            el.querySelector('.zt-set-none').hidden = !words.length || hits > 0;
        };
        el.onchange = e => {
            const t = e.target;
            try {
                if (t.dataset.sw) { const [gi, ri] = t.dataset.sw.split(':').map(Number); this.toggle(SWITCH_GROUPS[gi].items[ri], t.checked); }
                else if (t.dataset.pageSw) this.togglePage(t.dataset.pageSw, t.checked);
                else return;
            } catch (err) { this.hub?.toast(errorLine(err), 7000); }
            this.render(el);
        };
        el.onclick = e => {
            const go = e.target.closest('[data-sw-go]'); if (go) return this.hub?.go(go.dataset.swGo);
            const a = e.target.closest('[data-sw-act]')?.dataset.swAct; if (!a) return;
            if (a === 'persona') return this.hub?.go('persona');
            if (a === 'back') return this.hub?.go('set');
            if (a === 'all-on') { try { this.allOn(); } catch (err) { this.hub?.toast(errorLine(err), 7000); } this.render(el); }
        };
    }
    toggle(row, on) {
        const all = this.s.all, cur = read(all, row.k);
        if (row.kind === 'value' && cur !== row.off) this.prev[row.k] = cur;
        const [k, val] = switchWrite(row, all, on, this.prev);
        this.s.set(k, val);
        this.hub?.toast(row.reload ? `「${row.label}」 đã ${on ? 'bật' : 'tắt'}, có hiệu lực sau khi làm mới trang` : `「${row.label}」 đã ${on ? 'bật' : 'tắt'}`, row.reload ? 6000 : 2600);
    }
    togglePage(id, show) {
        const cur = new Set(Array.isArray(this.s.get('navHidden')) ? this.s.get('navHidden') : []);
        if (show) cur.delete(id); else cur.add(id);
        this.s.set('navHidden', [...cur]);
    }
    allOn() {
        for (const g of SWITCH_GROUPS) for (const r of g.items) if (!switchOn(r, this.s.all)) { const [k, val] = switchWrite(r, this.s.all, true, this.prev); this.s.set(k, val); }
        this.s.set('navHidden', []);
        this.hub?.toast('Đã bật toàn bộ tính năng (「Cửa sổ Trợ lý hệ thống」 cần làm mới trang)', 4000);
    }
}
