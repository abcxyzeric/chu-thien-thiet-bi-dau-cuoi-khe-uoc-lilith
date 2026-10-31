// 0.9.1 手机真机自检 — the 0.9.0 browser acceptance (tests/native_v090.py), runnable on the user's own phone.
// A small step card at the top of the screen walks through: environment → full screen → every terminal page measured
// → keyboard in the group chat → 私聊 full screen + keyboard → floating Lilith → landscape → back gesture. Steps that
// need the user (tap an input, rotate, press back) wait with a timeout and can be skipped; nothing is written to the
// ledger or the chat. The result is a short ✅ / ⚠ / ❌ list plus the raw numbers, stored in settings.deviceCheck
// (shown in 复制诊断信息) and copyable on the spot.
import { VERSION } from './contracts.js';
import { viewportBox } from './mobile.js';
import { environment, copyText, buildReport, redact } from './diag-report.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]):not([type=button]):not([type=submit]):not([type=file]):not([type=color]),select,textarea';

/** One page of the terminal: things sticking out sideways, sideways scrolling, small tap targets, fields < 16 px. */
export function measurePage(hub) {
    const d = hub.shell.dialog, sr = hub.shadow, vw = innerWidth, out = { off: [], tap: [], zoom: [], hscroll: 0 };
    const vis = el => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return null; const s = getComputedStyle(el); return s.visibility === 'hidden' || +s.opacity === 0 ? null : r; };
    const nm = el => (el.id ? '#' + el.id : el.tagName.toLowerCase()) + ':' + (el.getAttribute('aria-label') || el.title || el.textContent || '').trim().slice(0, 12);
    const scroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { if (p === d) return false; const s = getComputedStyle(p); if (/auto|scroll|hidden/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 1) return true; } return false; };
    for (const el of d.querySelectorAll('*')) {
        const r = vis(el); if (!r) continue;
        if ((r.right > vw + 2 || r.left < -2) && !scroller(el) && !el.closest('[aria-hidden=true],.zt-world-deco')) out.off.push(nm(el));
        if (el.matches('#drag-handle button,.zt-hub-nav .nav-button,.zt-g-tabs button,.zt-g-send button') && (r.height < 36 || r.width < 36)) out.tap.push(`${nm(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
        if (el.matches(TEXT) && parseFloat(getComputedStyle(el).fontSize) < 16) out.zoom.push(nm(el));
    }
    const ps = sr.querySelector('.page-scroll'); out.hscroll = ps ? ps.scrollWidth - ps.clientWidth : 0;
    const f = hub.engineFrame;
    if (f?.offsetParent) {
        try { const doc = f.contentDocument; for (const el of doc.querySelectorAll(TEXT)) if (el.offsetParent && parseFloat(getComputedStyle(el).fontSize) < 16) out.zoom.push('Engine ' + nm(el)); out.engine = doc.documentElement.scrollWidth - doc.documentElement.clientWidth; } catch { /* cross-origin never happens; ignore */ }
    }
    for (const k of ['off', 'tap', 'zoom']) out[k] = [...new Set(out[k])].slice(0, 5);
    out.bad = !!(out.off.length || out.tap.length || out.zoom.length || out.hscroll > 1 || (out.engine || 0) > 1);
    return out;
}
/** Is a box the visible area? (±2 px; pure, for tests) */
export function fillsView(r, box) {
    return !!r && Math.abs(r.left - box.left) <= 2 && Math.abs(r.top - box.top) <= 2 && Math.abs(r.width - box.w) <= 2 && Math.abs(r.height - box.h) <= 2;
}
/** Text summary of the results (pure, for tests). */
export function summarize(results, env) {
    const n = k => results.filter(r => r.state === k).length;
    const head = `Chư Thiên ${VERSION} Tự kiểm tra trên máy thật: ✅ ${n('ok')} · ⚠ ${n('warn')} · ❌ ${n('fail')} · Bỏ qua ${n('skip')}`;
    const dev = env ? `Thiết bị: ${env.ua}\nCửa sổ ${env.inner}, hiển thị ${env.visual}, tỷ lệ điểm ảnh ${env.dpr}, vùng an toàn ${env.safe ? Object.values(env.safe).join('/') : '?'}` : '';
    return redact([head, dev, ...results.map(r => `${({ ok: '✅', warn: '⚠', fail: '❌', skip: '⏭' })[r.state] || '·'} ${r.title}: ${r.text}${r.data ? '  ' + JSON.stringify(r.data) : ''}`)].filter(Boolean).join('\n'));
}

const CSS = `:host{all:initial}
.card{position:fixed;left:50%;top:calc(var(--t,0px) + 8px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(440px,calc(100vw - 16px));box-sizing:border-box;z-index:2147483647;
 background:#17111e;color:#f1e8f8;border:1px solid #b48ad866;border-radius:14px;box-shadow:0 12px 40px #000c;font:14px/1.5 system-ui,"Microsoft YaHei",sans-serif;padding:12px 14px}
.hd{display:flex;align-items:center;gap:8px;font-size:12px;color:#cdb6e6}.hd b{color:#f3d58a;font-weight:600}.hd span{margin-left:auto}
.bar{height:3px;background:#ffffff1a;border-radius:2px;margin:6px 0 8px;overflow:hidden}.bar i{display:block;height:100%;background:#c99be6;width:0;transition:width .3s}
.t{font-weight:600;font-size:15px;margin:0 0 4px}.p{margin:0;color:#e4d9ee;white-space:pre-wrap}.p.small{font-size:12px;color:#bfaed0;max-height:38vh;overflow:auto}
.btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}button{all:unset;box-sizing:border-box;min-height:44px;padding:0 14px;border-radius:10px;background:#2a1f36;border:1px solid #b48ad855;color:#f1e8f8;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font:inherit}
button.main{background:#8a5fb5;border-color:#c99be6}button:focus-visible{outline:2px solid #f3d58a}
.res{margin:6px 0 0;padding:0;list-style:none;max-height:42vh;overflow:auto;font-size:13px}.res li{padding:3px 0;border-bottom:1px solid #ffffff12}
textarea{width:100%;box-sizing:border-box;height:120px;margin-top:8px;font:12px/1.4 ui-monospace,monospace;background:#0f0b14;color:#e4d9ee;border:1px solid #ffffff22;border-radius:8px;padding:6px}`;

export class DeviceCheck {
    constructor(app) { this.app = app; this.host = null; this.results = []; this.running = false; this.skipNow = null; this.disposers = []; }
    get hub() { return this.app.hub; }
    mount() {
        const host = document.createElement('div'); host.id = 'zhutian-device-check'; host.setAttribute('data-zt-keep-hub', '');
        const sh = host.attachShadow({ mode: 'open' });
        sh.innerHTML = `<style>${CSS}</style><div class="card" role="dialog" aria-live="polite" aria-label="Tự kiểm tra trên điện thoại thật"><div class="hd"><b>Tự kiểm tra trên điện thoại thật</b><span class="n"></span></div><div class="bar"><i></i></div><p class="t"></p><p class="p"></p><div class="extra"></div><div class="btns"></div></div>`;
        document.body.append(host); this.host = host; this.sh = sh;
        // stay at the top of what is visible (the keyboard pushes the visual viewport around)
        const follow = () => { const vv = globalThis.visualViewport; host.style.setProperty('--t', Math.round(vv?.offsetTop || 0) + 'px'); };
        globalThis.visualViewport?.addEventListener('resize', follow); globalThis.visualViewport?.addEventListener('scroll', follow);
        this.disposers.push(() => { globalThis.visualViewport?.removeEventListener('resize', follow); globalThis.visualViewport?.removeEventListener('scroll', follow); });
        follow();
    }
    show(step, total, title, text, buttons = [], extra = '') {
        const $ = s => this.sh.querySelector(s);
        $('.n').textContent = total ? `${step} / ${total}` : ''; $('.bar i').style.width = total ? Math.round(step / total * 100) + '%' : '100%';
        $('.t').textContent = title; $('.p').textContent = text; $('.extra').innerHTML = extra;
        const box = $('.btns'); box.innerHTML = '';
        for (const b of buttons) { const el = document.createElement('button'); el.type = 'button'; el.textContent = b.label; if (b.main) el.className = 'main'; el.addEventListener('click', b.fn); box.append(el); }
    }
    add(title, state, text, data) { this.results.push({ title, state, text, data }); }
    /** Waits until cond() is true (polled), the user taps 跳过, or the timeout. → 'ok' | 'skip' | 'timeout' */
    async until(cond, ms) {
        const end = Date.now() + ms; let skipped = false; this.skipNow = () => { skipped = true; };
        while (Date.now() < end) { if (skipped || this.stopped) return 'skip'; try { if (await cond()) return 'ok'; } catch { /* keep waiting */ } await wait(250); }
        return skipped ? 'skip' : 'timeout';
    }
    box() { return viewportBox(globalThis.visualViewport, innerWidth, innerHeight); }
    blur() { try { let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; a?.blur?.(); } catch { /* ignore */ } }

    async run() {
        if (this.running) return; this.running = true; this.results = [];
        const app = this.app, hub = this.hub, skipBtn = { label: 'Bỏ qua bước này', fn: () => this.skipNow?.() };
        const stopBtn = { label: 'Kết thúc tự kiểm tra', fn: () => { this.stopped = true; this.skipNow?.(); } };
        this.stopped = false;
        if (!hub) { globalThis.toastr?.error('Thiết bị đầu cuối chưa khởi động, không thể tự kiểm tra', 'Chư Thiên'); this.running = false; return; }
        this.mount();
        const steps = ['Môi trường', 'Toàn màn hình', 'Các trang', 'Nhóm chat + Bàn phím', 'Trò chuyện riêng', 'Lilith nổi', 'Màn hình ngang', 'Nút quay lại']; const N = steps.length; let i = 0;
        const step = (t, text, btns = [skipBtn]) => { if (this.stopped) throw new Error('Đã kết thúc thủ công'); this.show(i, N, t, text, [...btns, stopBtn]); };
        try {
            // 1. environment
            i = 1; step('Môi trường', 'Đang đọc thông tin màn hình và trình duyệt…', []);
            this.env = environment(app);
            this.add('Môi trường', this.env.coarse ? 'ok' : 'warn', this.env.coarse ? `Màn hình cảm ứng, cửa sổ ${this.env.inner}, hiển thị ${this.env.visual}` : `Không phải màn hình cảm ứng (${this.env.inner}) — mục tự kiểm tra này dành cho điện thoại`);
            // 2. full screen
            i = 2; step('Toàn màn hình', 'Đang mở thiết bị đầu cuối và đo đạc…', []);
            if (hub.isOpen) hub.go('ov'); else if (app.openTerminal) app.openTerminal('ov'); else hub.open('ov');
            await wait(1400);
            { const d = hub.shell.dialog, r = d.getBoundingClientRect(), b = this.box(), ps = hub.shadow.querySelector('.page-scroll')?.getBoundingClientRect();
              const mode = app.mobile?.mode || '';
              if (!mode) this.add('Toàn màn hình', 'warn', 'Hiện không ở chế độ toàn màn hình (đang đặt là 「Cửa sổ nổi」, hoặc màn hình khá rộng)', { box: [r.left, r.top, r.width, r.height].map(Math.round) });
              else this.add('Toàn màn hình', fillsView(r, b) ? 'ok' : 'fail', fillsView(r, b) ? `Phủ kín vùng hiển thị (${mode === 'land' ? 'ngang' : 'dọc'}), vùng nội dung ${Math.round(ps?.height || 0)} px` : 'Thiết bị đầu cuối không phủ kín vùng hiển thị', { dialog: [r.left, r.top, r.width, r.height].map(Math.round), view: [b.left, b.top, b.w, b.h] }); }
            // 3. every page
            i = 3; const pages = [...new Set([...hub.shadow.querySelectorAll('.nav-button[data-page]')].map(b => b.dataset.page))], bad = {};
            let skipped = false;
            for (const [k, pg] of pages.entries()) {
                step('Các trang', `Đo từng trang ${k + 1} / ${pages.length}: ${pg}`); this.skipNow = () => { skipped = true; };
                hub.go(pg); await wait(900); if (skipped || this.stopped) break;
                const m = measurePage(hub); if (m.bad) bad[pg] = m;
            }
            this.add('Các trang', Object.keys(bad).length ? 'fail' : 'ok', Object.keys(bad).length ? `${Object.keys(bad).length} trang có vấn đề: ${Object.keys(bad).join(', ')}` : `Cả ${pages.length} trang đều không bị tràn màn hình, cuộn ngang, nút quá nhỏ hoặc ô nhập cỡ chữ nhỏ`, Object.keys(bad).length ? bad : undefined);
            // 4. keyboard in the group chat
            i = 4; hub.go('group'); await wait(900);
            { const ta = () => hub.shadow.querySelector('.zt-g-send textarea, .zt-g-send input');
              if (!ta()) this.add('Nhóm chat + Bàn phím', 'skip', 'Ô nhập nhóm chat không khả dụng trên thiết bị này');
              else {
                  step('Nhóm chat + Bàn phím', 'Vui lòng chạm vào ô nhập ở dưới cùng nhóm chat và đợi bàn phím bật lên hoàn toàn (tối đa 25 giây).\nKhông cần gõ chữ.');
                  const h0 = innerHeight; let seen = 0;
                  const res = await this.until(() => { const st = app.mobile?.kbMode; if (st) seen = seen || Date.now(); return st && Date.now() - seen > 900; }, 25000);
                  if (res === 'skip') this.add('Nhóm chat + Bàn phím', 'skip', 'Đã bỏ qua');
                  else {
                      const b = this.box(), r = ta().getBoundingClientRect(), d = hub.shell.dialog.getBoundingClientRect(), top = hub.shadow.querySelector('.zt-hub-top');
                      const visible = r.top >= b.top - 1 && r.bottom <= b.top + b.h + 1 && r.height > 0;
                      const data = { kb: app.mobile?.kbMode || 'Không', view: b.h, inner: `${h0}→${innerHeight}`, dialog: Math.round(d.height), input: [Math.round(r.top), Math.round(r.bottom)], topBar: top ? getComputedStyle(top).display : '' };
                      if (res === 'timeout') this.add('Nhóm chat + Bàn phím', visible ? 'warn' : 'fail', visible ? 'Không phát hiện bàn phím bật lên (ô nhập vẫn hiển thị)' : 'Không phát hiện bàn phím, và ô nhập không nằm trong vùng hiển thị', data);
                      else this.add('Nhóm chat + Bàn phím', visible && Math.abs(d.height - b.h) <= 2 ? 'ok' : 'fail', visible ? `Sau khi bàn phím bật lên, thiết bị đầu cuối cao ${Math.round(d.height)} px, ô nhập hiển thị rõ` : 'Bàn phím đã che khuất ô nhập', data);
                  }
                  this.blur(); await wait(700);
              } }
            // 5. private chat
            i = 5; step('Trò chuyện riêng', 'Đang mở trò chuyện riêng và đo đạc…', []);
            { const s = app.assistant?.shadow, av = s && [s.getElementById('header-avatar'), s.getElementById('entry')].find(e => e && e.getBoundingClientRect().width);
              if (!av) this.add('Trò chuyện riêng', 'skip', 'Không tìm thấy lối vào trò chuyện riêng');
              else {
                  av.click(); await wait(1300);
                  const p = s.getElementById('lc-panel'), r = p?.getBoundingClientRect(), b = this.box();
                  if (!p || p.hidden) this.add('Trò chuyện riêng', 'fail', 'Trò chuyện riêng không mở được');
                  else {
                      this.add('Trò chuyện riêng · Toàn màn hình', !app.mobile?.mode ? 'warn' : fillsView(r, b) ? 'ok' : 'fail', !app.mobile?.mode ? 'Không phải chế độ toàn màn hình' : fillsView(r, b) ? 'Trò chuyện riêng phủ kín vùng hiển thị' : 'Trò chuyện riêng không phủ kín', { panel: [r.left, r.top, r.width, r.height].map(Math.round) });
                      const inp = s.getElementById('lc-input');
                      if (inp) {
                          step('Trò chuyện riêng', 'Vui lòng chạm vào ô nhập ở dưới cùng trò chuyện riêng và đợi bàn phím bật lên (tối đa 25 giây).'); let seen = 0;
                          const res = await this.until(() => { const st = app.mobile?.kbMode; if (st) seen = seen || Date.now(); return st && Date.now() - seen > 900; }, 25000);
                          if (res === 'skip') this.add('Trò chuyện riêng · Bàn phím', 'skip', 'Đã bỏ qua');
                          else { const ir = inp.getBoundingClientRect(), b2 = this.box(), ok = ir.top >= b2.top - 1 && ir.bottom <= b2.top + b2.h + 1;
                                 this.add('Trò chuyện riêng · Bàn phím', res === 'timeout' ? (ok ? 'warn' : 'fail') : ok ? 'ok' : 'fail', res === 'timeout' ? 'Không phát hiện bàn phím' : ok ? 'Ô nhập nằm phía trên bàn phím' : 'Bàn phím đã che khuất ô nhập trò chuyện riêng', { input: [Math.round(ir.top), Math.round(ir.bottom)], view: b2.h }); }
                          this.blur(); await wait(600);
                      }
                      (s.getElementById('lc-back') || s.getElementById('lc-close'))?.click(); await wait(600);
                  }
              } }
            // 6. floating Lilith
            i = 6; step('Lilith nổi', 'Đang đo vị trí…', []);
            if (!app.float?.active) this.add('Lilith nổi', 'skip', 'Lilith nổi chưa được bật');
            else { if (!hub.isOpen) hub.open('ov'); await wait(700); const r = app.float.fig.getBoundingClientRect(), vh = innerHeight;
                   this.add('Lilith nổi', !app.mobile?.mode || r.top > vh - r.height - 140 ? 'ok' : 'warn', r.top > vh - r.height - 140 ? 'Khi mở thiết bị đầu cuối thì đậu ở góc dưới' : 'Khi mở thiết bị đầu cuối không nằm ở góc dưới', { top: Math.round(r.top), left: Math.round(r.left), h: Math.round(r.height) }); }
            // 7. landscape
            i = 7; hub.go('ov');
            step('Màn hình ngang', 'Vui lòng xoay ngang điện thoại (cần bật tự động xoay; nếu không muốn kiểm tra có thể bỏ qua, tối đa 30 giây).');
            { const res = await this.until(() => innerWidth > innerHeight && app.mobile?.mode === 'land', 30000);
              if (res !== 'ok') this.add('Màn hình ngang', 'skip', res === 'skip' ? 'Đã bỏ qua' : 'Không phát hiện màn hình ngang trong 30 giây');
              else { await wait(900); const nav = hub.shell.nav.getBoundingClientRect(), ps = hub.shadow.querySelector('.page-scroll').getBoundingClientRect(), d = hub.shell.dialog.getBoundingClientRect(), b = this.box();
                     this.add('Màn hình ngang', fillsView(d, b) && nav.width < 110 && ps.height >= 180 ? 'ok' : 'fail', `Điều hướng bên trái ${Math.round(nav.width)} px, vùng nội dung ${Math.round(ps.height)} px`, { dialog: [d.width, d.height].map(Math.round), view: [b.w, b.h] });
                     step('Màn hình ngang', 'Xong rồi, vui lòng xoay dọc lại.'); await this.until(() => innerHeight > innerWidth, 30000); await wait(700); } }
            // 8. back gesture
            i = 8;
            if (app.settings.get('hubBackClose') === false) this.add('Nút quay lại', 'skip', 'Trong Cài đặt đã tắt 「Cử chỉ quay lại trên điện thoại đóng thiết bị đầu cuối」');
            else {
                if (!hub.isOpen) { hub.open('ov'); await wait(900); }
                const href = location.href;
                step('Nút quay lại', 'Bước cuối: Vui lòng nhấn nút quay lại trên điện thoại (hoặc vuốt từ cạnh màn hình để quay lại). Thiết bị đầu cuối sẽ đóng lại và trang quán rượu giữ nguyên.');
                const res = await this.until(() => !hub.isOpen, 20000); await wait(500);
                if (res === 'skip') this.add('Nút quay lại', 'skip', 'Đã bỏ qua');
                else this.add('Nút quay lại', res === 'ok' && location.href.split('#')[0] === href.split('#')[0] ? 'ok' : 'fail', res === 'ok' ? 'Nút quay lại đã đóng thiết bị đầu cuối, trang quán rượu vẫn còn nguyên' : 'Thiết bị đầu cuối không đóng trong 20 giây');
            }
        } catch (e) {
            this.add('Tự kiểm tra bị gián đoạn', this.stopped ? 'skip' : 'fail', e.message);
        }
        this.finish();
    }
    finish() {
        const text = summarize(this.results, this.env);
        try { this.app.settings.set('deviceCheck', { at: new Date().toISOString(), version: VERSION, text: text.slice(0, 8000) }); } catch { /* ignore */ }
        const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
        const list = `<ul class="res">${this.results.map(r => `<li>${({ ok: '✅', warn: '⚠', fail: '❌', skip: '⏭' })[r.state]} <b>${esc(r.title)}</b>: ${esc(r.text)}</li>`).join('')}</ul><textarea readonly aria-label="Kết quả tự kiểm tra">${esc(text)}</textarea>`;
        const copy = async (t, what) => { const ok = await copyText(t); globalThis.toastr?.[ok ? 'success' : 'warning'](ok ? `Đã sao chép ${what}, có thể dán và gửi trực tiếp` : 'Trình duyệt không cho phép tự động sao chép: vui lòng nhấn giữ khung văn bản bên dưới để chọn tất cả và sao chép', 'Chư Thiên'); if (!ok) this.sh.querySelector('textarea')?.select(); };
        this.show(0, 0, 'Hoàn tất tự kiểm tra', text.split('\n')[0], [
            { label: 'Sao chép kết quả', main: true, fn: () => copy(text, 'kết quả tự kiểm tra') },
            { label: 'Sao chép đầy đủ thông tin chẩn đoán', fn: () => copy(buildReport(this.app), 'thông tin chẩn đoán') },
            { label: 'Đóng', fn: () => this.close() },
        ], list);
        this.running = false;
    }
    close() { this.skipNow?.(); this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); this.host?.remove(); this.host = null; this.running = false; }
    dispose() { this.close(); }
}
