// Thiết bị đầu cuối · Trang Cài đặt: mọi công tắc và công cụ trước đây ẩn trong ngăn kéo Tiện ích mở rộng, được phân nhóm ngay trong thiết bị đầu cuối.
import { saveEnvironment } from './save-environment.js';
import { VERSION } from './contracts.js';
import { HOST_TESTED } from './compat.js';
import { esc } from './hub.js';
import { PALETTE_OPTIONS } from './palettes.js';
import { MOBILE_LAYOUTS } from './mobile.js';
import { MOTION_OPTIONS } from './perf.js';
import { errorLine } from './errors.js';
import { disablePlugin } from './plugin-switch.js';
import { closeFloats } from './lilith-float.js';

const sw = (k, label, desc = '') => ({ type: 'switch', k, label, desc });
const sel = (k, label, options, desc = '') => ({ type: 'select', k, label, options, desc });
const num = (k, label, min, max, desc = '') => ({ type: 'number', k, label, min, max, desc });
const act = (id, label, desc = '', cls = '') => ({ type: 'action', id, label, desc, cls });
/** 1.0: 进阶 — shown in the collapsed「进阶设置」group (and found by search). */
const adv = it => ({ ...it, tier: 'adv' });
/** 1.0: the three groups of the settings page. Sections default to 常用 unless they say otherwise. */
export const SETTING_GROUPS = Object.freeze([['common', 'Thường dùng'], ['adv', 'Cài đặt nâng cao'], ['diag', 'Chẩn đoán & Bảo trì']]);
/** Items of one group, section by section (pure, for tests): an item's own tier wins, then its section's, then 常用. */
export function groupSections(sections, tier) {
    return sections.map(sec => ({ ...sec, items: sec.items.filter(it => (it.tier || sec.tier || 'common') === tier) })).filter(sec => sec.items.length);
}
/** Does a settings row match the search words? Every word must appear in its label / description (pure). */
export function matchSetting(text, q) {
    const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    const t = String(text || '').toLowerCase();
    return words.every(w => t.includes(w));
}

export class HubSettings {
    constructor(app) { this.app = app; this.extra = []; }
    get s() { return this.app.settings; }
    /** Later modules (演出 / 主题 / 聊天群) add their own group. */
    addSection(section) { this.extra.push(section); }
    sections() {
        const app = this.app;
        return [
            { title: 'Làm quen', items: [
                act('guide', 'Hướng dẫn tân thủ…', 'Ba bước: Nhập hoặc cập nhật Sách Thế Giới → Cài đặt cổng AI → Bật trong cuộc trò chuyện hiện tại. Hoàn thành bước nào sẽ đánh dấu tích bước đó, có thể bỏ qua.'),
                act('switches', 'Công tắc tính năng…', '1.1.5: Toàn bộ tính năng nằm trong một bảng — từng mục có thể tắt riêng (vẫn giữ dữ liệu), cũng có thể ẩn các trang không dùng khỏi thanh điều hướng.'),
                act('persona', 'Thiết lập Trợ lý hệ thống…', `1.1.5: Mặc định là Lilith; có thể đổi sang 「Quả Cầu Ánh Sáng Hệ Thống (Số hiệu)」 hoặc tự viết tên, tính cách, cách ăn nói và ảnh đại diện. Hiện tại: ${this.app.persona?.name || 'Lilith'}`),
            ] },
            { title: 'Hiển thị', sub: 'Thiết bị đầu cuối chính là Hệ Thống Chư Thiên; tầng trò chuyện luôn giữ gọn gàng.', items: [
                sel('statusbar', 'Khối dữ liệu hệ thống trong tầng trò chuyện', [['terminal', 'Thiết bị đầu cuối ghi sổ, tầng chỉ để lại nhãn nhỏ (Khuyên dùng)'], ['off', 'Tắt (không xử lý khối dữ liệu)'], ...(this.s.get('statusbar') === 'native' ? [['native', 'Chế độ tương thích cũ (từ 0.7.0 không còn cung cấp, chuyển đi sẽ không hiển thị lại)']] : [])], 'Ở chế độ thiết bị đầu cuối, khối <ZhuTianPanel> do AI xuất ra sẽ do thiết bị đầu cuối ghi sổ, trong tầng trò chuyện không còn hiện thanh trạng thái nữa.'),
                sw('floorTag', 'Nhãn nhỏ ở tầng “Hệ thống đã ghi nhận”', 'Bấm vào nhãn để mở thẳng thiết bị đầu cuối.'),
                sw('voiceBox', 'Khung thoại chuyên biệt của Lilith (Làm đẹp khung thoại)'),
                sw('hud', 'Xem nhanh sổ cái phía trên ô nhập liệu'),
                adv(sw('hotkeys', 'Phím tắt Alt+Z / Alt+X đóng mở thiết bị đầu cuối · Alt+S Tổng quan')),
                adv(sel('hubOutsideClose', 'Đóng khi bấm bên ngoài thiết bị đầu cuối', [['auto', 'Chỉ điện thoại'], ['always', 'Luôn luôn'], ['never', 'Không bao giờ']])),
                sel('mobileLayout', 'Cửa sổ thiết bị đầu cuối và trò chuyện riêng trên điện thoại', MOBILE_LAYOUTS.map(o => [...o]), 'Khi toàn màn hình, cửa sổ sẽ tự thu thấp theo bàn phím ảo để ô nhập liệu không bị che; khi xoay ngang, thanh điều hướng chuyển sang bên trái; trò chuyện riêng cũng toàn màn hình. Chọn 「Cửa sổ nổi」 để khôi phục giao diện bản 0.8.5.'),
                adv(sw('hubBackClose', 'Cử chỉ quay lại trên điện thoại đóng thiết bị đầu cuối')),
            ] },
            { title: 'Lời nhắc & Sách Thế Giới', items: [
                adv(sw('promptStripPanels', 'Không gửi khối dữ liệu của các tầng cũ cho AI (tiết kiệm token)')),
                adv(num('promptPanelKeepDepth', 'Giữ lại khối dữ liệu của mấy tầng mới nhất', 0, 6, 'Mỗi lượt AI đều đọc được sổ cái mới nhất từ mục “Dữ liệu thời gian thực” trong Sách Thế Giới, nên có thể đặt là 0 (không gửi lại bất kỳ khối dữ liệu nào, tiết kiệm token nhất); giữ lại 1–2 tầng giúp AI bắt chước định dạng ổn định hơn.')),
                adv(sw('macroLike', 'Macro biến Sách Thế Giới {{get_chat_variable::…}}', 'Khi macro Tavern Helper đang bật sẽ tự động nhường quyền.')),
                adv(sw('worldbookAuto', 'Bản lưu Chư Thiên tự động cài đặt và gắn kết Sách Thế Giới', 'Không ghi đè các mục bạn đã tự chỉnh sửa.')),
                act('worldbook', 'Cài đặt / Gắn kết / Gỡ gắn kết Sách Thế Giới…'),
                act('wb-unbind', 'Một chạm gỡ gắn kết Sách Thế Giới', 'Tháo “Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” khỏi tất cả thẻ nhân vật, toàn cục và cuộc trò chuyện hiện tại (không xóa tệp), có thể khôi phục trong cửa sổ Sách Thế Giới.'),
                adv(sw('wbUnbindOnDisable', 'Tự động gỡ gắn kết Sách Thế Giới khi tắt tiện ích', 'Khi vô hiệu hóa tiện ích này trong danh sách tiện ích mở rộng sẽ tự động thực hiện thao tác gỡ gắn kết ở trên (SillyTavern 1.17+; bản 1.16 không có hook đóng nên vui lòng bấm nút gỡ gắn kết thủ công).')),
            ] },
            { title: 'Sổ cái & Bản lưu', items: [
                act('init', 'Khởi tạo cuộc trò chuyện mới', 'Tạo sổ cái theo quy tắc gốc; nếu đã tồn tại thì chỉ bổ sung các trường còn thiếu.'),
                act('migrate', 'Di chuyển bản lưu cũ / Hoàn tác sổ cái…', '5 bản sao lưu tự động gần nhất, có thể hoàn tác bằng một chạm.'),
                act('appraise', 'Giám định Phẩm giai…', 'Khi công pháp / vật phẩm nhận được trong cốt truyện, từ thẻ nhân vật hoặc bản lưu cũ bị ghi thành Phàm phẩm: để AI giám định lại theo tiêu chuẩn Chư Thiên, hoặc tự sửa thủ công (chỉ tăng không giảm, tối đa Thần phẩm).'),
                act('data-io', 'Xuất / Nhập bản lưu…', 'Đóng gói cài đặt, sổ cái, bản lưu ký ức thành một tệp duy nhất (không chứa API Key); trước khi nhập sẽ tự động sao lưu sổ cái hiện tại.'),
            ] },
            { title: 'Kết nối', items: [
                act('api', 'Cài đặt cổng AI (Trang Kết nối)', 'Chỉ cần điền một lần: các tính năng AI của thanh trạng thái và trò chuyện riêng với Lilith dùng chung; hoặc có thể dùng trực tiếp mô hình Quán Rượu đang sử dụng. Các cổng hay dùng có thể lưu thành thiết lập sẵn để chuyển đổi một chạm; rút thẻ, nhóm chat, Lilith… cũng có thể dùng cổng riêng trong mục 「API theo tính năng」.'),
                adv(sel('apiTimeout', 'Thời gian chờ API độc lập (Trò chuyện riêng / Ký ức / Bàn làm việc)', [['60', '60 giây (Bản gốc)'], ['120', '120 giây'], ['180', '180 giây (Mặc định)'], ['300', '300 giây'], ['600', '600 giây (Mô hình suy luận)']], 'Mọi yêu cầu đều truyền theo luồng (stream, không đứt quãng giữa chừng), không còn bị reverse proxy / Cloudflare ngắt ngang bằng lỗi 502; thời gian chờ chỉ có hiệu lực khi mô hình mãi không xuất xong.')),
            ] },
            { title: 'Trợ lý hệ thống', sub: this.app.persona && !this.app.persona.lilith ? `Thiết lập hiện tại 「${this.app.persona.name}」: Lilith nổi, chân dung phân lớp và tương tác chạm chỉ thuộc về Lilith, các thiết lập nhân vật khác dùng ảnh đại diện tròn.` : '', items: [
                sel('floatLilith', 'Cửa sổ nổi (chuyển đổi kiểu dáng)', [['auto', 'Tự động: Điện thoại / màn hình cảm ứng dùng Lilith nổi, máy tính dùng ảnh đại diện'], ['on', 'Lilith nổi'], ['off', 'Ảnh đại diện (nút đánh thức gốc)'], ['none', 'Đã đóng (không hiển thị cửa sổ nổi trên trang)']], 'Ở đây là 「Chuyển đổi」: Lilith ⇄ Ảnh đại diện. Bấm một cái để mở thiết bị đầu cuối; nhấn giữ để kéo, kéo sát mép trái/phải màn hình sẽ tự nấp đi (nhớ vị trí); kéo xuống đáy có hai mục tiêu — 「Đổi sang ảnh đại diện / Đổi sang Lilith」 là chuyển đổi, 「Đóng cửa sổ nổi」 là đóng hẳn (trên máy tính cũng có thể bấm chuột phải vào Lilith). Sau khi đóng, hãy vào Quán Rượu 「Tiện ích mở rộng」 → Thiết Bị Đầu Cuối Chư Thiên để vào bảng điều khiển hoặc khôi phục cửa sổ nổi.'),
                act('float-close', 'Đóng cửa sổ nổi…', 'Đóng = cả Lilith lẫn ảnh đại diện đều không hiển thị (không phải chuyển đổi). Bất cứ lúc nào cũng có thể chọn lại ở mục trên, hoặc vào Quán Rượu 「Tiện ích mở rộng」 → Thiết Bị Đầu Cuối Chư Thiên bấm 「Hiện Lilith nổi / Hiện ảnh đại diện」.'),
                sel('floatSize', 'Kích thước Lilith nổi', [['p20', '20% (Nhỏ nhất)'], ['p30', '30%'], ['p40', '40%'], ['xs', '55%'], ['s', '65%'], ['m', '75% (Mặc định)'], ['l', '90%'], ['xl', '100%']], 'Nhỏ nhất 20%; đổi xong có hiệu lực ngay, giữ nguyên vị trí.'),
                sel('avatarSize', 'Kích thước cửa sổ nổi ảnh đại diện', [['p20', '20% (Nhỏ nhất)'], ['p30', '30%'], ['p40', '40%'], ['xs', '55%'], ['s', '65%'], ['m', '75%'], ['l', '90%'], ['xl', '100% (Mặc định)']], 'Kích thước ảnh đại diện tròn (trên máy tính là nút đánh thức ở góc dưới bên trái); nhỏ nhất 20%.'),
                adv(sw('touchGestures', 'Tương tác chạm chân thực (xoa đầu / nhấn giữ / mắt nhìn theo)')),
                sw('haptics', 'Phản hồi rung khi chạm (điện thoại)'),
                sel('portrait.mode', 'Chế độ chân dung (Standing Art)', [['rig', 'Hoạt ảnh phân lớp gốc (Giả Live2D)'], ['variants', 'Bản gốc + Biến thể biểu cảm (đổi theo ngữ khí)'], ['live2d', 'Live2D thật (cần tự chuẩn bị mô hình Cubism)']]),
                adv(act('live2d', 'Cài đặt Chân dung / Live2D…')),
                adv(sw('lilith.react', 'Phản ứng nhân vật giao diện: phản ứng với nhiệm vụ / vật phẩm / công pháp đang chọn và kết quả quyết toán thành bại', 'Chỉ dùng biểu cảm và chuyển động phân lớp gốc; lời thoại lấy từ dữ liệu sổ cái.')),
                adv(sw('lilith.pageLines', 'Nói một câu khi vào trang hệ thống (mỗi trang một lần trong mỗi phiên)')),
                adv(sw('lilith.camera', 'Góc máy: Trang hệ thống bán thân · Bàn làm việc toàn thân · Trò chuyện riêng cận cảnh khuôn mặt')),
                adv(sw('lilith.story', 'Thông báo qua bong bóng thoại: mục 「Thông báo hệ thống」 trong khối dữ liệu được nói ra qua bong bóng thoại của chân dung; bấm vào khoảng trống chân dung để nói lời thoại cốt truyện', 'Dòng “Lilith: ……” trước đây nằm ở đáy thanh trạng thái nay đã chuyển về đây.')),
            ] },
            { title: 'Thế giới & Diễn xuất', sub: 'Chủ đề chỉ đổi màu sắc và trang trí, vị trí các nút không đổi.', items: [
                sel('world.theme', 'Chủ đề giao diện', [['auto', 'Theo thế giới hiện tại (tự động phán đoán)'], ['default', 'Chư Thiên (Mặc định)'], ['xianxia', 'Tiên hiệp · Ngọc giản / Tinh đồ / Trận văn'], ['cyber', 'Cyber · Thiết bị đầu cuối toàn tức'], ['eerie', 'Quỷ dị · Dị thường và xâm thực']], this.worldDesc()),
                sel('palette', 'Phương án phối màu', PALETTE_OPTIONS, 'Phối màu cố định sẽ ghi đè màu của chủ đề thế giới (họa tiết trang trí thế giới vẫn giữ nguyên); chủ đề Tiên hiệp từ bản 0.8.4 đổi sang tông Mặc Ngọc Kim.'),
                adv(sw('world.prompt', 'Nhắc AI ghi nhận xuyên không (Thế giới hiện tại / Loại thế giới)', 'Khi xuyên không AI sẽ viết một dòng trong mục 「Cập nhật biến」 của khối dữ liệu; trên Tinh đồ cũng có thể ghi thủ công.')),
                sel('fx.mode', 'Diễn xuất', [['full', 'Diễn xuất đầy đủ (≤2 giây, có thể bỏ qua)'], ['brief', 'Chỉ hiển thị thẻ kết quả'], ['off', 'Tắt']], 'Chỉ phát sau khi sổ cái đã ghi và đọc ngược lại xác nhận; nếu thất bại sẽ hiển thị thất bại. Khi hệ thống bật “Giảm chuyển động” sẽ tự động chỉ hiển thị thẻ.'),
                adv(sel('motion', 'Hiệu ứng chuyển động', MOTION_OPTIONS.map(o => [...o]), `Ở chế độ Tinh giản, Lilith nổi không còn nhịp thở đung đưa, họa tiết trang trí thế giới và hoạt ảnh thiết bị đầu cuối dừng lại, diễn xuất chỉ hiện thẻ kết quả, tính năng không đổi. Hiện tại: ${this.app.perf ? (this.app.perf.lite ? 'Tinh giản' : 'Đầy đủ') + ' (' + this.app.perf.reason + ')' : '—'}`)),
                adv(sw('fx.outside', 'Hiển thị thẻ gợi ý cốt truyện ở góc trò chuyện khi thiết bị đầu cuối đang đóng')),
                adv(act('fx-preview', 'Xem trước diễn xuất', 'Phát một đoạn mẫu (không ghi vào sổ cái, trên thẻ sẽ ghi rõ “Xem trước”).')),
            ] },
            { title: 'Công tắc tiện ích', items: [
                act('plugin-off', 'Một chạm tắt tiện ích', 'Giống hệt như gạt tắt công tắc trong mục 「Tiện ích mở rộng → Quản lý tiện ích mở rộng」 của Quán Rượu: tiện ích dừng hoạt động và làm mới trang. Sổ cái và cài đặt đều được giữ nguyên; khi muốn bật lại cũng vào 「Quản lý tiện ích mở rộng」.', 'danger'),
            ] },
            ...this.extra.map(x => (typeof x === 'function' ? x(app) : x)).map(x => ({ tier: 'adv', ...x })),
            { title: 'Nâng cao · Quản trị viên', sub: 'Sửa trực tiếp sổ cái, hãy thận trọng khi dùng.', tier: 'adv', items: [
                act('admin', 'Bảng điều khiển Quản trị viên…', 'Sửa trực tiếp Điểm Hệ Thống, Tài nguyên chuyên biệt, tiền tệ, bậc thực lực, công pháp chủ tu, bảo hiểm hộp mù, cùng độ hảo cảm của từng nhân vật Ràng buộc và thành viên nhóm chat. Chỉ ghi những mục đã sửa, khóa và ghi một lần rồi đọc ngược lại đối chiếu; trong trang cũng có thể mở bảng gốc (lối vào bấm 5 lần biểu tượng ◆ trước đây đã được gỡ khỏi thiết bị đầu cuối).'),
            ] },
            { title: 'Tương thích & Bảo trì', tier: 'diag', items: [
                act('diagnose', 'Chẩn đoán tương thích…'),
                act('unfreeze', 'Đối chiếu và mở băng sổ cái', '1.1.4: Dùng khi xuất hiện thông báo 「Trạng thái ghi chưa rõ / Đã đóng băng」. Lấy bản lưu trên máy chủ so sánh với trang hiện tại: nếu khớp hoàn toàn nghĩa là không có lệnh ghi nào còn treo, sẽ mở băng ngay; nếu không khớp sẽ báo rõ những mục nào khác biệt, vui lòng tải lại trang (lấy bản lưu trên máy chủ làm chuẩn). Chỉ đọc chứ không ghi.'),
                act('copy-diag', 'Sao chép thông tin chẩn đoán', 'Phiên bản, thiết bị, cài đặt và các lỗi gần nhất, khi phản hồi lỗi chỉ cần dán thẳng ra. Không chứa API Key và nội dung trò chuyện.'),
                act('selftest', 'Tự kiểm tra trên máy thật điện thoại…', 'Kiểm tra từng bước trên điện thoại: toàn màn hình, các trang, bàn phím, trò chuyện riêng, xoay ngang và phím quay lại, mất khoảng 2 phút; kết quả có thể sao chép bằng một chạm.'),
                act('takeover', 'Một chạm tiếp quản bản cũ', 'Tạm dừng (không xóa) các biểu thức chính quy cũ và kịch bản Tavern Helper cũ.'),
                act('restore', 'Khôi phục bản cũ', '', 'danger'),
            ] },
        ];
    }
    worldDesc() {
        const w = this.app.world?.current?.(); if (!w) return '';
        return `Hiện tại: ${w.name || 'Thế giới chưa ghi nhận'}${w.type ? ' (' + w.type + ')' : ''} → Tự động phán đoán là 「${({ default: 'Chư Thiên', xianxia: 'Tiên hiệp', cyber: 'Cyber', eerie: 'Quỷ dị' })[w.auto]}」`;
    }
    read(k) { return k.split('.').reduce((o, x) => o?.[x], this.s.all); }
    write(k, v) { const [head, tail] = k.split('.'); if (tail) this.s.patch(head, { [tail]: v }); else this.s.set(head, v); }
    render(el) {
        const control = it => {
            const v = it.k ? this.read(it.k) : undefined;
            if (it.type === 'switch') return `<label class="zt-switch"><input type="checkbox" data-k="${it.k}" ${v !== false && v ? 'checked' : ''} aria-label="${esc(it.label)}"><i></i></label>`;
            if (it.type === 'select') return `<select data-k="${it.k}" aria-label="${esc(it.label)}">${it.options.map(([val, t]) => `<option value="${val}" ${String(v) === val ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
            if (it.type === 'number') return `<input type="number" data-k="${it.k}" min="${it.min}" max="${it.max}" value="${esc(v)}" aria-label="${esc(it.label)}">`;
            return `<button type="button" class="zt-btn ${it.cls || ''}" data-act="${it.id}">${esc(it.label.replace(/…$/, ''))}${it.label.endsWith('…') ? ' ›' : ''}</button>`;
        };
        const row = it => `<div class="zt-row" data-search="${esc((it.label + ' ' + (it.desc || '')).toLowerCase())}"><span>${it.type === 'action' ? `<b style="font-weight:500">${esc(it.label.replace(/…$/, ''))}</b>` : esc(it.label)}${it.desc ? `<span class="zt-desc">${esc(it.desc)}</span>` : ''}</span>${control(it)}</div>`;
        const grid = secs => `<div class="zt-grid2">${secs.map(sec => `<section class="zt-card"><h3>${esc(sec.title)}${sec.sub ? ` <small>${esc(sec.sub)}</small>` : ''}</h3>${sec.items.map(row).join('')}</section>`).join('')}</div>`;
        const all = this.sections();
        const groups = SETTING_GROUPS.map(([tier, title]) => {
            const secs = groupSections(all, tier), n = secs.reduce((a, x) => a + x.items.length, 0);
            if (!n) return '';
            return tier === 'common' ? `<div class="zt-set-group" data-tier="common">${grid(secs)}</div>`
                : `<details class="zt-set-group" data-tier="${tier}"><summary>${esc(title)} <small>${n} mục</small></summary>${grid(secs)}</details>`;
        }).join('');
        el.innerHTML = `<div class="zt-eyebrow">TERMINAL SETTINGS</div><h2 class="zt-h">Cài đặt</h2><p class="zt-sub">Thiết Bị Đầu Cuối Chư Thiên ${VERSION} · Đã nghiệm thu SillyTavern ${HOST_TESTED.join(' / ')} · Không cần Tavern Helper<br><small>Các tính năng AI (Nhập hàng thương thành / Ước nguyện / Rút thẻ, Bàn làm việc, Ký ức tự động, Trò chuyện riêng, Nhóm chat) mang tính <b>thử nghiệm</b>: mới chỉ nghiệm thu bằng mô hình giả lập, trước khi dùng mô hình thật lần đầu vui lòng xuất bản lưu trước.</small></p>
<div class="zt-set-search"><input type="search" data-f="sset" placeholder="Tìm kiếm cài đặt, ví dụ: nổi, sách thế giới, thời gian chờ" aria-label="Tìm kiếm cài đặt" enterkeyhint="search"></div>
${saveEnvironment().reason ? `<p class="zt-note" role="alert" data-save-warning>${esc(saveEnvironment().reason)}</p>` : ''}
${groups}<p class="zt-set-none" hidden>Không tìm thấy cài đặt nào khớp.</p>`;
        const search = el.querySelector('[data-f=sset]');
        search.oninput = () => this.filter(el, search.value);
        el.onchange = e => {
            const input = e.target.closest('[data-k]'); if (!input) return;
            const v = input.type === 'checkbox' ? input.checked : input.type === 'number' ? Math.max(Number(input.min) || 0, Math.min(Number(input.max) || 6, Math.floor(Number(input.value)) || 0)) : input.value;
            try { this.write(input.dataset.k, v); this.app.hub?.toast('Đã gửi cài đặt cho Quán Rượu lưu; nếu báo lỗi vui lòng xem mục Chẩn đoán'); }
            catch (err) { this.app.hub?.toast(errorLine(err), 7000); this.render(el); }
        };
        el.onclick = e => { const b = e.target.closest('[data-act]'); if (b) this.run(b.dataset.act); };
    }
    /** 1.0: search — hide rows that do not match, open the collapsed groups that do. */
    filter(el, q) {
        const on = !!String(q || '').trim(); let hits = 0;
        for (const r of el.querySelectorAll('.zt-row[data-search]')) { const m = !on || matchSetting(r.dataset.search, q); r.hidden = !m; if (m) hits++; }
        for (const sec of el.querySelectorAll('.zt-set-group .zt-card')) sec.hidden = on && !sec.querySelector('.zt-row:not([hidden])');
        for (const g of el.querySelectorAll('.zt-set-group')) {
            const any = !!g.querySelector('.zt-row:not([hidden])');
            g.hidden = on && !any;
            if (g.tagName === 'DETAILS') { if (on && any) { if (!g.open) { g.dataset.auto = '1'; g.open = true; } } else if (!on && g.dataset.auto) { g.open = false; delete g.dataset.auto; } }
        }
        const none = el.querySelector('.zt-set-none'); if (none) none.hidden = !on || hits > 0;
        return hits;
    }
    run(id) {
        const app = this.app, t = globalThis.toastr;
        const map = {
            worldbook: () => app.features.openWorldbook(),
            'wb-unbind': async () => { if (!globalThis.confirm('Gỡ gắn kết Sách Thế Giới “Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” khỏi tất cả thẻ nhân vật, Sách Thế Giới toàn cục và cuộc trò chuyện hiện tại?\n(Không xóa Sách Thế Giới; đồng thời tắt tự động gắn kết; có thể khôi phục trong cửa sổ Sách Thế Giới)')) return; const r = await app.features.unbindWorldbook(); app.hub?.toast(r.count ? `Đã gỡ gắn kết ${r.count} nơi` : 'Không tìm thấy nơi nào cần gỡ gắn kết', 3600); if (r.count) t?.success(`Đã gỡ gắn kết: ${r.chars.length} thẻ nhân vật${r.extra.length ? `, ${r.extra.length} sách phụ` : ''}${r.global ? ', toàn cục' : ''}${r.chat ? ', cuộc trò chuyện hiện tại' : ''}`, 'Chư Thiên · Sách Thế Giới'); if (app.hub?.page === 'set') app.hub.go('set', { silent: true }); }, migrate: () => app.features.openMigration(), diagnose: () => app.features.openDiagnostics(),
            api: () => app.openApiCenter(), 'go-api': () => app.hub.go('api'), live2d: () => app.portrait?.openSettings(),
            takeover: () => app.runTakeover(), restore: () => app.restoreLegacy(),
            'fx-preview': () => app.fx?.preview(),
            'copy-diag': () => app.features.copyDiagnostics(),
            unfreeze: async () => {
                const r = await app.bridge.verifyFrozen();
                if (r.state === 'clear') return t?.info('Cuộc trò chuyện hiện tại không bị đóng băng, có thể thao tác bình thường.', 'Chư Thiên');
                if (r.state === 'unfrozen') { t?.success('Bản lưu trên máy chủ khớp với trang hiện tại, đã mở băng; có thể tiếp tục thao tác (nếu giao dịch trước đó chưa có hiệu lực, vui lòng gửi lại một lần).', 'Chư Thiên', { timeOut: 8000 }); app.hub?.reloadEngine?.(); return; }
                if (globalThis.confirm(`Bản lưu trên máy chủ không khớp với trang hiện tại (${r.keys.join(', ')}).\nĐể lấy bản lưu trên máy chủ làm chuẩn cần tải lại trang, sau khi tải lại trạng thái đóng băng sẽ tự động được gỡ bỏ. Tải lại ngay bây giờ?`)) globalThis.location?.reload();
            },
            selftest: () => app.deviceCheck?.run(),
            guide: () => app.guide?.open(),
            switches: () => app.hub.go('switches'),
            persona: () => app.hub.go('persona'),
            'data-io': () => app.dataIO?.open(),
            appraise: () => app.hub.go('appraise'),
            'plugin-off': () => disablePlugin(app),
            admin: () => app.hub.openAdmin(),
            'float-close': () => closeFloats(app),
            init: () => app.features.initChat().then(r => { t?.success(r.created ? `Đã khởi tạo sổ cái theo quy tắc gốc (Điểm Hệ Thống ${r.points})` : 'Sổ cái đã tồn tại; đã bổ sung các trường còn thiếu theo quy tắc gốc', 'Chư Thiên'); app.hub.reloadEngine(); }).catch(e => t?.error(errorLine(e), 'Chư Thiên')),
        };
        // 1.1.1: sections added by modules can bring their own buttons ({ actions: { id: fn } })
        const own = this.extra.map(x => (typeof x === 'function' ? null : x?.actions?.[id])).find(f => typeof f === 'function');
        try { const r = (map[id] || own)?.(); r?.catch?.(e => t?.error(errorLine(e), 'Chư Thiên')); } catch (e) { t?.error(errorLine(e), 'Chư Thiên'); }
    }
}
