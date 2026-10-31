// 0.9.1 复制诊断信息 — one block of plain text a user can paste into a bug report.
// What goes in: plugin / SillyTavern / browser versions, screen and phone-layout numbers, plugin settings (allow-list
// below), which host interfaces work, the status-bar / latest-floor state, the AI endpoint HOST + model name, the last
// 真机自检 result and the last plugin errors. What never goes in: API keys, script variables, chat text, ledger values,
// character names. Everything passes redact() once more before it leaves (belt and braces for error messages).
import { saveEnvironment } from './save-environment.js';
import { VERSION, PATCH_REV } from './contracts.js';
import { phoneLayout, viewportBox } from './mobile.js';
import { ROUTES, readRoutes, routeText, routeLabel } from './api-routes.js';

/** Masks anything that looks like a secret (pure, for tests). */
export function redact(text) {
    return String(text ?? '')
        .replace(/\b(sk|rk|pk|ak)-[A-Za-z0-9_\-]{8,}/g, '$1-***')
        .replace(/\bAIza[0-9A-Za-z_\-]{20,}/g, 'AIza***')
        .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=\-]{8,}/gi, '$1 ***')
        .replace(/((?:api[_-]?key|key|token|secret|password|authorization)["']?\s*[:=]\s*["']?)[^\s"',;&}]{4,}/gi, '$1***')
        .replace(/(https?:\/\/)[^/\s:@]+:[^/\s@]+@/gi, '$1***@')
        .replace(/(https?:\/\/[^\s?#"']+)\?[^\s#"']*/gi, '$1?***')
        .replace(/\b[A-Za-z0-9_\-]{40,}\b/g, m => (/^[a-f0-9]{40,64}$/i.test(m) ? m : m.slice(0, 4) + '***'));
}

const SKIP = new Set(['scriptVariables', 'takeoverLog', 'wbUnbound', 'floatPos', 'live2d', 'deviceCheck', 'hubPage']);
/** Plugin settings safe to share (pure, for tests): no script variables (API keys live there), lists become counts. */
export function settingsSnapshot(all = {}) {
    const out = {};
    for (const [k, v] of Object.entries(all || {})) {
        if (SKIP.has(k)) continue;
        if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) out[k] = v;
        else if (Array.isArray(v)) out[k] = `[${v.length} mục]`;
        else if (typeof v === 'object') out[k] = Object.fromEntries(Object.entries(v).filter(([, x]) => x === null || ['string', 'number', 'boolean'].includes(typeof x)));
    }
    out.takeoverLog = `[${(all?.takeoverLog || []).length} mục]`;
    out.live2d = all?.live2d ? { accepted: !!all.live2d.accepted, model: all.live2d.model ? 'Đã đặt' : '' } : null;
    out.wbUnbound = !!all?.wbUnbound;
    return out;
}
/** "host · model" for an endpoint config — never the key or the path (pure, for tests). */
export function endpointText(c) {
    if (!c?.url) return 'Chưa đặt';
    if (c.key === 'st-main' || /^st-main|酒馆主|API chính của quán rượu/i.test(String(c.url))) return 'API chính của quán rượu';
    try { return new URL(c.url).host + (c.model ? ' · ' + c.model : ''); } catch { return 'Không thể phân giải địa chỉ'; }
}

/** Last plugin errors: console.error / console.warn lines tagged [诸天…] and page errors from the plugin's files. */
export class ErrorLog {
    constructor(base = '', max = 30) { this.base = base; this.max = max; this.items = []; this.disposers = []; }
    push(kind, args) {
        const text = args.map(a => (a instanceof Error ? `${a.message}${a.stack ? ' @ ' + String(a.stack).split('\n').slice(1, 3).map(s => s.trim()).join(' | ') : ''}` : typeof a === 'string' ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })())).join(' ');
        this.items.push({ t: new Date().toISOString().slice(11, 19), kind, text: redact(text).slice(0, 400) });
        if (this.items.length > this.max) this.items.splice(0, this.items.length - this.max);
    }
    start() {
        for (const kind of ['error', 'warn']) {
            const orig = console[kind], self = this;
            const wrapped = function (...args) { try { if (typeof args[0] === 'string' && /^\[(诸天|Chư Thiên)/i.test(args[0])) self.push(kind, args); else if (typeof args[0] === 'string' && /^(?:Error saving settings:|Failed to save settings:)/.test(args[0])) self.push('save', ['[Lưu cài đặt host] Lưu thất bại, vui lòng kiểm tra kết nối máy chủ và tải lại để đối chiếu; lưu trễ của host thất bại, không ghi lại nội dung yêu cầu hoặc khóa bảo mật.']); } catch { /* never break logging */ } return orig.apply(this, args); };
            console[kind] = wrapped;
            this.disposers.push(() => { if (console[kind] === wrapped) console[kind] = orig; });
        }
        const ours = s => !!s && (String(s).includes(this.base || '\u0000') || /zhutian/i.test(String(s)));
        const onErr = e => { if (ours(e.filename) || ours(e.error?.stack)) this.push('page', [e.error || e.message]); };
        const onRej = e => { if (ours(e.reason?.stack)) this.push('promise', [e.reason]); };
        addEventListener('error', onErr); addEventListener('unhandledrejection', onRej);
        this.disposers.push(() => { removeEventListener('error', onErr); removeEventListener('unhandledrejection', onRej); });
        return this;
    }
    dispose() { this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); }
}

/** Safe-area insets as the browser applies them (a probe element with env() padding). */
export function safeArea() {
    try {
        const p = document.createElement('div');
        p.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
        document.body.append(p); const s = getComputedStyle(p);
        const r = [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(v => Math.round(parseFloat(v) || 0)); p.remove();
        return { top: r[0], right: r[1], bottom: r[2], left: r[3] };
    } catch { return null; }
}
/** Screen / browser numbers that matter for the phone layout. */
export function environment(app) {
    let coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch { /* ignore */ }
    const vv = globalThis.visualViewport, box = viewportBox(vv, innerWidth, innerHeight);
    let standalone = false; try { standalone = matchMedia('(display-mode: standalone)').matches; } catch { /* ignore */ }
    return {
        ua: navigator.userAgent, lang: navigator.language, ...saveEnvironment(), standalone,
        inner: `${innerWidth}×${innerHeight}`, screen: `${screen?.width}×${screen?.height}`, dpr: devicePixelRatio, coarse,
        visual: vv ? `${box.w}×${box.h} @${box.top},${box.left} (bàn phím ${box.kb}px)` : 'Không hỗ trợ visualViewport',
        safe: safeArea(), layout: phoneLayout(app?.settings?.get('mobileLayout') || 'auto', { w: innerWidth, h: innerHeight, coarse }) || 'Cửa sổ nổi',
        current: app?.mobile?.mode || '', kbMode: app?.mobile?.kbMode || '',
    };
}

const line = (k, v) => `${k}：${v}`;
/** The whole report as text. Every source is optional; a broken part is reported, never thrown. */
export function buildReport(app, { errors = app?.errorLog?.items || [] } = {}) {
    const out = [`【Thông tin chẩn đoán Thiết Bị Đầu Cuối Chư Thiên】${new Date().toISOString()}`];
    const safe = (title, fn) => { try { const r = fn(); if (r !== undefined && r !== null && r !== '') out.push(...(Array.isArray(r) ? r : [r])); } catch (e) { out.push(`${title}：Đọc thất bại (${e.message})`); } };
    safe('Phiên bản', () => [line('Plugin', VERSION), line('Bản sửa đổi', PATCH_REV), line('SillyTavern', `${app.adapter?.version || '?'} — ${app.adapter?.support?.reason || ''}`)]);
    safe('Thiết bị', () => { const e = environment(app); return ['', '— Thiết bị —', line('Trình duyệt', e.ua), line('Ngôn ngữ', e.lang), line('Cửa sổ', `${e.inner} (Màn hình ${e.screen}, tỷ lệ điểm ảnh ${e.dpr})`), line('Vùng hiển thị', e.visual),
        line('Màn hình cảm ứng', e.coarse ? 'Có' : 'Không'), line('Vùng an toàn', e.safe ? `Trên ${e.safe.top} Phải ${e.safe.right} Dưới ${e.safe.bottom} Trái ${e.safe.left}` : 'Không rõ'), line('Ngữ cảnh an toàn', e.secure ? 'Có' : 'Không'), line('Giao thức kết nối', e.protocol), line('Web Locks', e.locks ? 'Khả dụng' : 'Không khả dụng'), line('Khả năng lưu', e.canSave ? 'Kiểm tra môi trường đạt (không đại diện máy chủ đã lưu)' : e.reason || 'Chưa kiểm tra'),
        line('Chạy từ màn hình chính', e.standalone ? 'Có' : 'Không'), line('Bố cục điện thoại', `${e.layout}${e.current ? ' (hiện tại ' + e.current + ')' : ''}${e.kbMode ? ', chế độ bàn phím ' + e.kbMode : ''}`)]; });
    safe('Giao diện', () => ['', '— Giao diện Host —', ...(app.adapter?.capabilities || []).map(c => `${c.ok ? '✅' : '❌'} ${c.label}`)]);
    safe('Thanh trạng thái', () => { const sb = app.statusbar?.state || {}, d = app.statusbar?.diagnoseLast?.(); return ['', '— Trạng thái hoạt động —', line('Thanh trạng thái', `${sb.mode || '?'} — ${sb.reason || ''}`), d ? line('Tầng mới nhất', `${d.ok === true ? '✅' : d.ok === false ? '⚠' : 'ℹ'} ${d.text}`) : line('Tầng mới nhất', 'Không có'),
        line('Thiết bị đầu cuối', app.hub ? (app.hub.isOpen ? `Đang mở (${app.hub.page || ''})` : 'Đã khởi động') : `Chưa khởi động ${app.hubError || ''}`), line('Trợ lý Lilith', app.assistant ? 'Đang chạy' : `Chưa bật ${app.assistantError || ''}`), line('Lilith nổi', app.float?.active ? 'Đang bật' : 'Đã tắt')]; });
    safe('Khối dữ liệu', () => line('Bảo vệ định dạng khối dữ liệu', app.panelGuard ? app.panelGuard.diag() : 'Chưa khởi động'));
    safe('Hiệu ứng động', () => line('Hiệu ứng động', app.perf ? `${app.perf.lite ? 'Rút gọn' : 'Đầy đủ'} (${app.perf.reason})` : 'Chưa khởi động'));
    safe('API', () => { const c = app.features?.apiConfigs?.() || {}; return [line('Cổng AI · Thanh trạng thái', endpointText(c.status)), line('Cổng AI · Lilith', endpointText(c.assistant))]; });
    safe('API theo tính năng', () => { if (!app.bridge) return ''; const r = readRoutes(app.bridge), on = ROUTES.filter(x => r.routes[x.id]); const last = app.bridge.lastRoute; return [line('Preset cổng', `${r.presets.length}`), line('API theo tính năng', on.length ? on.map(x => `${x.label} → ${routeText(r, x.id)}`).join('; ') : 'Tất cả theo mặc định'), ...(last ? [line('Yêu cầu theo tính năng gần nhất', `${routeLabel(last.id)} · ${last.via}`)] : [])]; });
    safe('Cài đặt', () => ['', '— Cài đặt Plugin —', JSON.stringify(settingsSnapshot(app.settings?.all))]);
    safe('Tự kiểm tra', () => { const d = app.settings?.get('deviceCheck'); return d?.text ? ['', `— Lần tự kiểm tra trên máy thật trước (${d.at || ''}) —`, d.text] : ['', '— Tự kiểm tra trên máy thật —', 'Chưa từng chạy (Cài đặt → Tương thích & Bảo trì → Tự kiểm tra trên điện thoại thật)']; });
    out.push('', `— Báo lỗi plugin gần đây (${errors.length} mục) —`, ...(errors.length ? errors.map(e => `[${e.t}] ${e.kind}: ${e.text}`) : ['Không có']));
    return redact(out.join('\n'));
}

/** Clipboard with the fallbacks phones need (ST on a LAN address is not a secure context → no navigator.clipboard). */
export async function copyText(text) {
    try { if (globalThis.isSecureContext && navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch { /* fall back */ }
    try {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
        document.body.append(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy'); ta.remove(); return !!ok;
    } catch { return false; }
}
