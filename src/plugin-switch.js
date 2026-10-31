// 1.0 · Tắt tiện ích một chạm + a shared confirm box (SillyTavern's own popup, falling back to the browser confirm).
//
// Tắt = exactly what SillyTavern 「Tiện ích mở rộng → Quản lý tiện ích mở rộng」 does: the extension's folder name goes into disabledExtensions, the
// settings are saved and the page reloads. On 1.17+ SillyTavern calls our `disable` hook first (tự động gỡ gắn kết Sách Thế Giới).
// Re-enable: Thanh trên của SillyTavern 「Tiện ích mở rộng」 → 「Quản lý tiện ích mở rộng」 → Thiết Bị Đầu Cuối Khế Ước Lilith bật công tắc (có hiệu lực sau khi làm mới trang).
const REOPEN = 'Cách bật lại: Thanh trên của SillyTavern 「Tiện ích mở rộng」 (biểu tượng khối lắp ghép) → 「Quản lý tiện ích mở rộng」 → tìm 「Chư Thiên · Thiết Bị Đầu Cuối Khế Ước Lilith」 bật công tắc lên, có hiệu lực sau khi làm mới trang.';
export const REENABLE_HINT = REOPEN;

/** The name SillyTavern files this extension under: the path after /scripts/extensions/ (pure). */
export function pluginName(moduleUrl) {
    let path = '';
    try { path = new URL(moduleUrl).pathname; } catch { path = String(moduleUrl || ''); }
    path = decodeURIComponent(path);
    const m = path.match(/\/scripts\/extensions\/(.+?)\/(?:src\/[^/]+|index)\.js$/);
    return m ? m[1] : '';
}
/** Confirm with SillyTavern's popup (keeps the page styled; works inside the terminal dialog). Resolves true / false. */
export async function confirmBox(text, { ok = 'Xác nhận', cancel = 'Hủy', title = '' } = {}) {
    const c = globalThis.SillyTavern?.getContext?.();
    if (typeof c?.callGenericPopup === 'function' && c.POPUP_TYPE?.CONFIRM !== undefined) {
        try {
            const el = document.createElement('div'); el.style.textAlign = 'left';
            el.innerHTML = (title ? `<h3 style="margin:0 0 8px">${esc(title)}</h3>` : '') + String(text).split('\n').map(l => `<div>${esc(l) || '&nbsp;'}</div>`).join('');
            const r = await c.callGenericPopup(el, c.POPUP_TYPE.CONFIRM, '', { okButton: ok, cancelButton: cancel });
            return r === (c.POPUP_RESULT?.AFFIRMATIVE ?? 1) || r === true;
        } catch (e) { console.warn('[Chư Thiên] Hộp thoại SillyTavern không khả dụng, chuyển sang hộp xác nhận trình duyệt', e); }
    }
    return !!globalThis.confirm?.((title ? title + '\n\n' : '') + text);
}
/** SillyTavern's public/scripts/extensions.js, found from where this file is served (pure). */
export function hostModule(moduleUrl) { const u = String(moduleUrl), i = u.indexOf('/scripts/extensions/'); return i < 0 ? '' : u.slice(0, i) + '/scripts/extensions.js'; }
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

/**
 * Cài đặt → Công tắc tiện ích → Tắt tiện ích một chạm. Asks first. Uses SillyTavern's own disableExtension (1.16+); when that is not
 * reachable, says exactly where the switch is. `opts.load` / `opts.reload` are for tests.
 */
export async function disablePlugin(app, { moduleUrl = import.meta.url, load, reload = true, ask = confirmBox } = {}) {
    const t = globalThis.toastr, name = pluginName(moduleUrl);
    const yes = await ask(`Sau khi tắt, thiết bị đầu cuối, Lilith nổi, thanh trạng thái và nhóm chat đều sẽ ngừng hoạt động, trang sẽ làm mới một lần.\nSổ cái, bản lưu và cài đặt đều được giữ nguyên, không bị xóa.${app?.settings?.get?.('wbUnbindOnDisable') === false ? '' : '\nSách Thế Giới Chư Thiên sẽ tự động gỡ gắn kết khỏi thẻ nhân vật (SillyTavern 1.17+; có thể khôi phục gắn kết trong cửa sổ Sách Thế Giới).'}\n\n${REOPEN}`, { ok: 'Tắt tiện ích', cancel: 'Hủy', title: 'Tắt tiện ích Chư Thiên một chạm?' });
    if (!yes) return { done: false, cancelled: true };
    let mod = null;
    try { mod = load ? await load() : await import(hostModule(moduleUrl)); } catch (e) { console.warn('[Chư Thiên] Không thể tải mô-đun tiện ích mở rộng của SillyTavern', e); }
    if (!name || typeof mod?.disableExtension !== 'function') {
        const why = 'Phiên bản SillyTavern này không mở giao diện tắt tự động, vui lòng tắt thủ công: Thanh trên của SillyTavern 「Tiện ích mở rộng」 → 「Quản lý tiện ích mở rộng」 → tắt công tắc của 「Chư Thiên · Thiết Bị Đầu Cuối Khế Ước Lilith」, sau đó làm mới trang.';
        t?.warning(why, 'Chư Thiên · Tắt tiện ích', { timeOut: 15000 });
        return { done: false, manual: true, reason: why };
    }
    try { app?.hub?.close?.(); } catch { /* closing the window is cosmetic */ }
    t?.info('Đang tắt tiện ích Chư Thiên, trang sắp làm mới…', 'Chư Thiên', { timeOut: 4000 });
    await mod.disableExtension(name, reload);
    return { done: true, name };
}
