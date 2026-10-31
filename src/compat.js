// Host compatibility layer for SillyTavern 1.16.0 – 1.19.x.
// Every difference below was checked against the tagged sources (1.16.0, 1.17.0, 1.18.0, 1.19.0):
//  - manifest `hooks` (activate/disable/…) only exist from 1.17.0; 1.16.0 merely injects the module script.
//  - public/script.js exports sendMessageAsUser / is_send_press / generateRaw / addOneMessage in all four tags.
//  - getContext(): every member the extension uses exists in 1.16.0; later tags only add members.
//  - /api/chats/get and /api/chats/save keep the same body ({avatar_url,file_name,chat,force}); 1.19 adds path checks only.
//  - setExtensionPrompt(key,value,position,depth,scan,role,filter) has the same signature in all four tags.
export const HOST_MIN = '1.16.0';
export const HOST_TESTED = Object.freeze(['1.16.0', '1.17.0', '1.18.0', '1.19.0']);
export const HOOKS_SINCE = '1.17.0';

export function parseVersion(value) {
    const m = /^(\d+)\.(\d+)\.(\d+)/.exec(String(value ?? '').trim());
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
export function compareVersion(a, b) {
    const x = parseVersion(a), y = parseVersion(b);
    if (!x || !y) return NaN;
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
    return 0;
}
/** Support decision for a host version string. `tested` means verified on a real isolated host of that minor line. */
export function hostSupport(version) {
    const v = parseVersion(version);
    if (!v) return { ok: false, tested: false, level: 'unknown', reason: `Không thể nhận diện phiên bản SillyTavern (${version || 'trống'}), đã chặn ghi dữ liệu.` };
    if (compareVersion(version, HOST_MIN) < 0) return { ok: false, tested: false, level: 'too-old', reason: `SillyTavern ${version} hiện tại thấp hơn phiên bản hỗ trợ tối thiểu ${HOST_MIN}. Vui lòng nâng cấp SillyTavern.` };
    const line = `${v[0]}.${v[1]}.`;
    if (HOST_TESTED.some(t => t.startsWith(line))) return { ok: true, tested: HOST_TESTED.includes(version), level: 'supported', reason: HOST_TESTED.includes(version) ? `SillyTavern ${version}: Đã nghiệm thu trên máy chủ thực độc lập.` : `SillyTavern ${version}: Cùng nhánh phiên bản với ${line}0 đã nghiệm thu, chạy theo dò tìm năng lực.` };
    return { ok: true, tested: false, level: 'newer', reason: `SillyTavern ${version} mới hơn phạm vi đã nghiệm thu (${HOST_TESTED[0]}–${HOST_TESTED.at(-1)}); chạy theo dò tìm năng lực giao diện, tính năng thiếu giao diện sẽ tự động tắt.` };
}
export function hooksSupported(version) { return compareVersion(version, HOOKS_SINCE) >= 0; }

let hostModulePromise = null;
/**
 * Dynamic import instead of a static `import {…} from '/script.js'`: a missing named export in a static import
 * throws a SyntaxError at link time and silently kills the whole extension on hosts that renamed it.
 */
export function loadHostModule() {
    hostModulePromise ??= import('/script.js').then(ns => ns, error => { console.warn('[Chư Thiên] Nhập động /script.js thất bại, chuyển sang dùng năng lực getContext', error); return {}; });
    return hostModulePromise.then(ns => {
        const context = () => globalThis.SillyTavern?.getContext?.();
        return {
            namespace: ns,
            sendMessageAsUser: typeof ns.sendMessageAsUser === 'function' ? ns.sendMessageAsUser : null,
            // Live binding read on every call; fallback inspects the host's own send-button state.
            isSendPress: () => {
                if ('is_send_press' in ns) return !!ns.is_send_press;
                const button = document.getElementById('send_but');
                return !!button && getComputedStyle(button).display === 'none' && !!document.getElementById('mes_stop') && getComputedStyle(document.getElementById('mes_stop')).display !== 'none';
            },
            generateRaw: typeof ns.generateRaw === 'function' ? ns.generateRaw : (context()?.generateRaw || null),
            saveSettings: typeof ns.saveSettings === 'function' ? ns.saveSettings : null,   // immediate save (takeover before reload)
            context,
        };
    });
}

export async function fetchHostVersion() {
    const r = await fetch('/version', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw Error('Giao diện phiên bản trả về lỗi');
    const v = await r.json();
    return { pkgVersion: String(v.pkgVersion || ''), gitRevision: v.gitRevision || '', gitBranch: v.gitBranch || '', agent: v.agent || '' };
}

/** Capability probe: never assumes a member exists because the version number says so. */
export function probeCapabilities(c, host = {}) {
    const has = key => typeof c?.[key] === 'function';
    const rows = [
        ['eventSource', !!c?.eventSource?.on, 'Bus sự kiện'],
        ['eventTypes', !!c?.eventTypes?.APP_READY, 'Loại sự kiện'],
        ['saveChat', has('saveChat'), 'Lưu trò chuyện'],
        ['saveMetadata', has('saveMetadata'), 'Lưu siêu dữ liệu trò chuyện (biến)'],
        ['setExtensionPrompt', has('setExtensionPrompt'), 'Tiêm prompt'],
        ['addOneMessage', has('addOneMessage'), 'Kết xuất bản ghi hệ thống'],
        ['messageFormatting', has('messageFormatting'), 'Sắp xếp lại chính văn (thanh trạng thái gốc)'],
        ['saveSettingsDebounced', has('saveSettingsDebounced'), 'Lưu cài đặt tiện ích'],
        ['loadWorldInfo', has('loadWorldInfo') && has('saveWorldInfo'), 'Đọc/ghi Sách Thế Giới'],
        ['registerSlashCommand', has('registerSlashCommand'), 'Lệnh gạch chéo (Slash)'],
        ['registerMacro', has('registerMacro'), 'Macro'],
        ['sendMessageAsUser', typeof host.sendMessageAsUser === 'function', 'Gửi dưới tư cách người chơi'],
        ['generateRaw', typeof host.generateRaw === 'function', 'Tạo nguyên bản qua API chính'],
        ['webLocks', !!globalThis.navigator?.locks, 'Web Locks trình duyệt'],
    ];
    return rows.map(([key, ok, label]) => ({ key, ok: !!ok, label }));
}
