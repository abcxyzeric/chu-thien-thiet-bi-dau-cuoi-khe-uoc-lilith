// 1.1.5 Thiết bị đầu cuối · Trang Thiết lập Trợ lý hệ thống: thiết lập sẵn (Lilith / Quả Cầu Ánh Sáng Hệ Thống / Tùy chỉnh), tên, cách xưng hô, tính cách, cách
// ăn nói, ảnh đại diện, và (nâng cao) thay thế toàn bộ quy tắc cốt truyện / lời nhắc trò chuyện riêng, kèm bản xem trước trực tiếp.
// Khi lưu sẽ ghi vào cài đặt `persona`; PersonaHost áp dụng nó ở mọi nơi mà không cần tải lại trang.
import { esc } from './hub.js';
import { PRESETS, PERSONA_DEFAULTS, resolvePersona, storyRule, chatPersona, cleanAvatar, AVATAR_MAX } from './persona.js';
import { errorLine } from './errors.js';

/** Settings value from the form (pure; keeps only known keys, trims, drops oversized / unsafe avatars). */
export function personaFromForm(form, prev = {}) {
    const out = { ...PERSONA_DEFAULTS, ...(prev && typeof prev === 'object' ? prev : {}) };
    for (const k of Object.keys(PERSONA_DEFAULTS)) if (k in (form || {})) out[k] = String(form[k] ?? '');
    if (!PRESETS.some(p => p.id === out.preset)) out.preset = 'lilith';
    out.avatar = cleanAvatar(out.avatar);
    for (const k of ['name', 'code', 'call', 'en']) out[k] = out[k].trim().slice(0, 24);
    for (const k of ['personality', 'style']) out[k] = out[k].trim().slice(0, 600);
    for (const k of ['story', 'chat']) out[k] = out[k].trim().slice(0, 4000);
    if (out.preset !== 'lilith' && out.name && out.name.replace(/\s+/g, '').length < 2) throw Error('Tên phải có ít nhất 2 ký tự: quá ngắn sẽ khiến những câu như 「Ta nói: “…”」 trong chính văn bị nhận nhầm thành lời thoại hệ thống.');
    return out;
}

/** Shrinks a picked image to a 256 px square (cover) data URI that fits the settings file. Browser only. */
export function shrinkAvatar(file, size = 256) {
    return new Promise((resolve, reject) => {
        if (!file || !/^image\//.test(file.type)) { reject(new Error('Vui lòng chọn tệp hình ảnh (png / jpg / webp / gif).')); return; }
        if (file.size > 8 * 1024 * 1024) { reject(new Error('Hình ảnh vượt quá 8 MB, vui lòng chọn tấm khác nhỏ hơn.')); return; }
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
            try {
                const c = document.createElement('canvas'); c.width = c.height = size;
                const g = c.getContext('2d'), s = Math.min(img.naturalWidth, img.naturalHeight);
                g.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
                let data = c.toDataURL('image/webp', 0.86);
                if (!data.startsWith('data:image/webp')) data = c.toDataURL('image/jpeg', 0.86);
                if (data.length > AVATAR_MAX) data = c.toDataURL('image/jpeg', 0.6);
                if (data.length > AVATAR_MAX) throw new Error('Hình ảnh sau khi nén vẫn còn quá lớn.');
                resolve(data);
            } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Đọc hình ảnh thất bại.')); };
        img.src = url;
    });
}

export class HubPersona {
    constructor(app) { this.app = app; this.draft = null; }
    get hub() { return this.app.hub; }
    get s() { return this.app.settings; }
    start() {
        const hub = this.hub; if (!hub) return this;
        hub.register('persona', { title: 'Thiết lập Trợ lý hệ thống', render: el => this.render(el) });
        return this;
    }
    dispose() { /* the hub removes its pages */ }
    saved() { return { ...PERSONA_DEFAULTS, ...(this.s.get('persona') || {}) }; }
    render(el) {
        if (!el) return; this.el = el;
        const d = this.draft || (this.draft = this.saved());
        const p = resolvePersona(d), lilith = p.lilith, cur = resolvePersona(this.saved());
        const field = (k, label, ph = '', max = 24) => `<label class="zt-field"><span>${esc(label)}</span><input data-p="${k}" value="${esc(d[k])}" maxlength="${max}" placeholder="${esc(ph)}"></label>`;
        const area = (k, label, ph = '', max = 600, rows = 3) => `<label class="zt-field"><span>${esc(label)}</span><textarea data-p="${k}" maxlength="${max}" rows="${rows}" placeholder="${esc(ph)}">${esc(d[k])}</textarea></label>`;
        el.innerHTML = `<div class="zt-persona-page">
<div class="zt-eyebrow">SYSTEM PERSONA</div><h2 class="zt-h">Thiết lập Trợ lý hệ thống</h2>
<p class="zt-sub">Hiện tại: <b>${esc(cur.name)}</b>${cur.lilith ? ' (Mặc định, Lilith bản gốc)' : ''}. Đổi thiết lập nhân vật sẽ không làm thay đổi tệp Sách Thế Giới của bạn, cũng không sửa mã nguồn gốc: trong cốt truyện tiện ích sẽ tạm thời thay thế quy tắc 「Lilith」 ở mỗi lần tạo phản hồi, trong các yêu cầu Trò chuyện riêng / Ký ức / Bàn làm việc sẽ đổi thiết lập nhân vật của Lilith, đồng thời tên và ảnh đại diện trên giao diện cũng đổi theo. Bất cứ lúc nào cũng có thể đổi về Lilith.</p>
<section class="zt-card"><h3>Chọn thiết lập sẵn</h3>
<div class="zt-persona-presets" role="radiogroup" aria-label="Thiết lập sẵn nhân vật">${PRESETS.map(x => `<label class="zt-persona-preset${d.preset === x.id ? ' on' : ''}"><input type="radio" name="zt-persona-preset" value="${x.id}" ${d.preset === x.id ? 'checked' : ''}><b>${esc(x.label)}</b><small>${esc(x.desc)}</small></label>`).join('')}</div>
</section>
${lilith ? `<section class="zt-card"><h3>Lilith (Bản gốc)</h3><p class="zt-note">Thiết lập nhân vật gốc, chân dung phân lớp, biến thể biểu cảm, tương tác chạm và Lilith nổi đều được giữ nguyên. Chọn 「Quả Cầu Ánh Sáng Hệ Thống」 hoặc 「Tùy chỉnh」 để chỉnh sửa tên, tính cách và ảnh đại diện.</p></section>` : `
<section class="zt-card"><h3>Thân phận</h3>
<div class="zt-persona-id"><div class="zt-persona-av"><img data-p-av alt="Xem trước ảnh đại diện" src="${esc(p.avatar)}"><div class="zt-actions"><label class="zt-btn small">Tải ảnh đại diện lên<input type="file" accept="image/*" data-p-file hidden></label><button type="button" class="zt-btn small" data-p-act="av-clear" ${d.avatar ? '' : 'disabled'}>Dùng mặc định</button></div><small class="zt-note">Tự động cắt thành hình vuông và nén về 256 pixel, lưu trong cài đặt tiện ích mở rộng của Quán Rượu. Khi không có ảnh đại diện sẽ dùng ${d.preset === 'orb' ? 'quả cầu ánh sáng mang số hiệu' : 'quả cầu ánh sáng mang chữ cái đầu'}.</small></div>
<div class="zt-persona-fields">${field('name', 'Tên gọi', d.preset === 'orb' ? `Để trống = Hệ thống ${esc(p.code || '001')}` : 'Ví dụ: Tiểu Cửu, Thiên Đạo, Số Không')}
${d.preset === 'orb' ? field('code', 'Số hiệu (hiển thị trên quả cầu ánh sáng, tối đa 8 ký tự chữ và số)', '001', 8) : ''}
${field('call', 'Cách gọi bạn', 'Ký chủ', 8)}
${field('en', 'Tên tiếng Anh (phụ đề giao diện, có thể để trống)', d.preset === 'orb' ? `SYSTEM-${p.code}` : '', 16)}</div></div>
</section>
<section class="zt-card"><h3>Tính cách & Cách ăn nói</h3>
${area('personality', 'Tính cách & Thiết lập nhân vật', d.preset === 'orb' ? 'Để trống = Mặc định của quả cầu ánh sáng: bình tĩnh, lý tính, ngắn gọn, tuyệt đối trung thành' : 'Ví dụ: Lão quái vật miệng độc nhưng bao che khuyết điểm, ngoài miệng chê bai nhưng lúc then chốt đáng tin cậy hơn bất kỳ ai.', 600, 4)}
${area('style', 'Cách ăn nói', d.preset === 'orb' ? 'Để trống = Câu ngắn, thông báo kiểu gạch đầu dòng, thường dùng 「Phát hiện thấy」「Đã cấp phát」' : 'Ví dụ: Giọng nửa cổ phong trang trọng, tự xưng 「Bản tọa」.', 300, 2)}
<details class="zt-persona-adv"><summary>Nâng cao: Thay thế nguyên đoạn (Tùy chọn)</summary>
<p class="zt-note">Để trống = tự động tạo từ tên và tính cách ở trên. Nếu điền vào sẽ thay thế nguyên đoạn quy tắc cốt truyện / thiết lập trò chuyện riêng của bản gốc (vui lòng giữ lại định dạng lời thoại và các ràng buộc như 「trò chuyện không sửa sổ cái」, có thể xem trước bản tự động tạo ở mục 「Xem trước」 bên dưới).</p>
${area('story', 'Quy tắc thiết lập nhân vật trong cốt truyện (thay thế Sách Thế Giới 02｜Cốt lõi｜Trợ lý hệ thống Lilith)', '', 4000, 6)}
${area('chat', 'Thiết lập nhân vật trò chuyện riêng (thay thế lời nhắc hệ thống của trò chuyện riêng)', '', 4000, 5)}
</details>
</section>
<section class="zt-card"><h3>Xem trước</h3>
<p class="zt-note">Định dạng lời thoại trong cốt truyện: <b>【${esc(p.name)}】: “……”</b> (khung thoại sẽ đổi tên theo). Lilith nổi chỉ thuộc về Lilith; các thiết lập nhân vật khác dùng nút đánh thức ảnh đại diện tròn (Cài đặt → Trợ lý hệ thống → Cửa sổ nổi). Chân dung phân lớp, biến thể biểu cảm và tương tác chạm chỉ có hiệu lực với Lilith, các thiết lập khác hiển thị ảnh đại diện.</p>
<details><summary>Quy tắc cốt truyện (gửi cho mô hình chính văn)</summary><pre class="zt-persona-pre">${esc(storyRule(p))}</pre></details>
<details><summary>Thiết lập trò chuyện riêng (gửi cho mô hình trò chuyện riêng)</summary><pre class="zt-persona-pre">${esc(chatPersona(p))}</pre></details>
</section>`}
<div class="zt-actions zt-persona-bar"><button type="button" class="zt-btn primary" data-p-act="save">Lưu và áp dụng</button><button type="button" class="zt-btn" data-p-act="revert">Hủy thay đổi</button>${cur.lilith ? '' : '<button type="button" class="zt-btn danger" data-p-act="lilith">Đổi về Lilith</button>'}<button type="button" class="zt-btn" data-p-act="back">Quay lại Cài đặt</button></div>
</div>`;
        el.oninput = e => { const k = e.target.dataset?.p; if (k) { this.draft[k] = e.target.value; } };
        el.onchange = async e => {
            if (e.target.name === 'zt-persona-preset') { this.draft.preset = e.target.value; this.render(el); return; }
            if (e.target.matches('[data-p-file]')) {
                const f = e.target.files?.[0]; if (!f) return;
                try { this.draft.avatar = await shrinkAvatar(f); this.render(el); }
                catch (err) { this.hub?.toast(errorLine(err), 6000); }
            }
            if (['code', 'name'].includes(e.target.dataset?.p)) this.render(el);
        };
        el.onclick = e => { const b = e.target.closest('[data-p-act]'); if (b) this.act(b.dataset.pAct); };
    }
    act(id) {
        const el = this.el;
        if (id === 'av-clear') { this.draft.avatar = ''; return this.render(el); }
        if (id === 'revert') { this.draft = null; return this.render(el); }
        if (id === 'back') { this.draft = null; return this.hub?.go('set'); }
        if (id === 'lilith') { this.draft = { ...this.saved(), preset: 'lilith' }; }
        try {
            const v = personaFromForm(this.draft, this.saved());
            this.s.set('persona', v); this.draft = null;
            const p = resolvePersona(v);
            this.hub?.toast(p.lilith ? 'Đã đổi về Lilith (thiết lập nhân vật gốc)' : `Trợ lý hệ thống đã đổi thành 「${p.name}」: lần tạo phản hồi tiếp theo, trò chuyện riêng và giao diện có hiệu lực ngay`, 5000);
        } catch (err) { this.hub?.toast(errorLine(err), 7000); }
        this.render(el);
    }
}
