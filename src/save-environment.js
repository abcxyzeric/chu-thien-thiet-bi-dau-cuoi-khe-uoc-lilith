// Saving needs a secure context and Web Locks. HTTP loopback may be secure; HTTPS alone is not a capability check.
// Never include host settings, credentials, chat text or full URLs in these diagnostic events.
export function saveEnvironment() {
    const secure = typeof globalThis.isSecureContext === 'boolean' ? globalThis.isSecureContext : null;
    const protocol = String(globalThis.location?.protocol || '').replace(/:$/, '') || 'chưa rõ';
    const locks = typeof globalThis.navigator?.locks?.request === 'function';
    const canSave = secure === null ? null : secure && locks;
    const port = /^\d{1,5}$/.test(globalThis.location?.port || '') ? ':' + globalThis.location.port : '';
    let reason = '';
    if (secure === false) reason = `Môi trường hiện tại không thể lưu: trang không ở ngữ cảnh bảo mật nên không thể dùng Web Locks an toàn. Khi chạy SillyTavern trên máy này, vui lòng mở http://localhost${port} hoặc http://127.0.0.1${port} ngay trên cùng máy tính; khi dùng điện thoại truy cập máy tính, localhost chỉ chính chiếc điện thoại đó, vui lòng cấu hình địa chỉ HTTPS được trình duyệt tin cậy cho SillyTavern rồi truy cập. Hãy sao lưu trước khi đổi địa chỉ truy cập, đừng xóa dữ liệu trình duyệt.`;
    else if (secure === true && !locks) reason = 'Môi trường hiện tại không thể lưu: trang đang ở ngữ cảnh bảo mật nhưng Web Locks không khả dụng. Vui lòng mở trực tiếp SillyTavern bằng trình duyệt Chrome / Edge / Firefox / Safari đời mới có hỗ trợ Web Locks, thoát khỏi WebView nhúng bị giới hạn; HTTPS không thể thay thế năng lực của trình duyệt.';
    return { secure, protocol, locks, canSave, reason };
}
const recorded = new WeakSet();
export function recordSaveFailure(error, scope = 'Lưu') {
    if (error && typeof error === 'object') { if (recorded.has(error)) return; recorded.add(error); }
    const detail = error?.code === 'ZT_SAVE_UNAVAILABLE' ? error.message : 'Lưu thất bại; vui lòng xem thông báo trên trang và tải lại để kiểm tra. Chẩn đoán không ghi lại nội dung cài đặt hay khóa bảo mật.';
    console.warn('[Chư Thiên Lưu Trữ]', scope + ': ' + detail);
}
export function assertSaveEnvironment({ requireLocks = false } = {}) {
    const state = saveEnvironment();
    if (state.canSave === false || (requireLocks && !state.locks)) {
        const error = Error(state.reason || 'Môi trường hiện tại không thể lưu: Web Locks không khả dụng, vui lòng dùng ngữ cảnh bảo mật và trình duyệt hỗ trợ Web Locks.');
        error.code = 'ZT_SAVE_UNAVAILABLE'; recordSaveFailure(error, 'Kiểm tra môi trường'); throw error;
    }
    return state;
}
