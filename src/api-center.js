// Trung tâm API (0.8.4: đồng thời là trang Kết nối của thiết bị đầu cuối) — một nơi duy nhất cho hai kết nối API mà bản v1.1 trước đây cấu hình riêng rẽ:
//   * thanh trạng thái (mọi nút AI: Nhập hàng thương thành / Hộp mù / Ước nguyện / Chiêu mộ / Sắp xếp túi đồ / Thiên Nhãn …)
//       lưu trữ gốc: biến toàn cục 诸天系统_API {url,key,model} + localStorage sys_api_config
//   * trợ lý Lilith (ghi chép ký ức, trò chuyện riêng, bàn làm việc)
//       lưu trữ gốc: biến kịch bản 诸天记忆助手_v1_API {url,key,model,maxTokens}
// Cùng một nơi lưu trữ được ghi vào, nên hộp thoại bánh răng thanh trạng thái gốc và trang kết nối Lilith vẫn hiển thị
// các giá trị được chọn tại đây và ngược lại. "API chính hiện tại của Quán Rượu" ghi URL đánh dấu dành riêng (th-bridge MAIN_API_URL),
// được cầu nối nguyên bản trả lời thông qua SillyTavern generateRaw; không có dữ liệu nào bị gửi tới máy chủ đó.
import { saveEnvironment } from './save-environment.js';
import { MAIN_API_URL, MAIN_API_MODEL, isMainApi } from './th-bridge.js';
import { ROUTES, MAIN, readRoutes, writeRoutes, withPreset, withoutPreset, withRoute, routeText, cleanName, normalizeStore } from './api-routes.js';

export const STATUS_KEY = '诸天系统_API';
export const STATUS_LOCAL = 'sys_api_config';
export const assistantKey = ns => (ns || '诸天记忆助手_v1') + '_API';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Validation shared with the original assistant: https (http only for loopback), no credentials/query/hash. */
export function validateUrl(url) {
    let u; try { u = new URL(String(url || '').trim()); } catch { return 'Định dạng địa chỉ không hợp lệ'; }
    const loop = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && loop)) return 'Chỉ cho phép https (địa chỉ máy cục bộ có thể dùng http)';
    if (u.username || u.password || u.search || u.hash) return 'Địa chỉ không được chứa tài khoản, tham số truy vấn hoặc dấu #';
    return '';
}
export function readConfigs(bridge, ns) {
    const g = bridge.getVariables({ type: 'global' })?.[STATUS_KEY] || {};
    let local = {}; try { local = JSON.parse(localStorage.getItem(STATUS_LOCAL) || '{}') || {}; } catch { /* ignore */ }
    const status = (g.url || g.key || g.model) ? g : local;
    const assistant = bridge.getVariables({ type: 'script' })?.[assistantKey(ns)] || {};
    return { status, assistant };
}
export async function saveConfigs(bridge, ns, { url, key, model, maxTokens }, { status = true, assistant = true } = {}) {
    const main = isMainApi(url);
    const cfg = main ? { url: MAIN_API_URL, key: 'st-main', model: MAIN_API_MODEL } : { url: String(url).trim(), key: String(key).trim(), model: String(model || '').trim() };
    const cap = Number(maxTokens); if (Number.isInteger(cap) && cap >= 64 && cap <= 65536) cfg.maxTokens = cap;
    if (status) {
        await bridge.updateVariablesWith(v => { v[STATUS_KEY] = { ...cfg }; return v; }, { type: 'global' });
        try { localStorage.setItem(STATUS_LOCAL, JSON.stringify(cfg)); } catch { /* private mode */ }
    }
    if (assistant) {
        const a = { ...cfg }; const n = Number(maxTokens); if (Number.isInteger(n) && n >= 64 && n <= 65536) a.maxTokens = n;
        await bridge.updateVariablesWith(v => { v[assistantKey(ns)] = a; return v; }, { type: 'script' });
    }
    return cfg;
}

/** The API form (shared by the popup and the terminal's 连接 page). `inline` = inside the terminal's shadow root, where
 *  SillyTavern's .menu_button styles do not reach, so buttons carry their own look and colours follow the theme vars.
 *  0.8.5: written for someone who has never seen it — one status line at the top in plain words, then 3 numbered steps.
 *  The old "状态栏 / 莉莉丝助手" table and the "应用到…" boxes (read as some kind of 绑定) moved into 高级. Radios and
 *  checkboxes carry width:auto because the original connection page styles every input as width:100%. */
const looks = inline => ({
    field: 'width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid color-mix(in srgb,var(--accent,#c59bee) 30%,transparent);background:var(--zt-input,#0f0c14);color:inherit;font:inherit',
    btn: inline ? 'class="zt-btn small" style="margin:0;white-space:nowrap"' : 'class="menu_button" style="margin:0;white-space:nowrap"',
});
function formHtml({ status, assistant, inline, routes }) {
    const seed = assistant.url ? assistant : status;
    const main = isMainApi(seed.url);
    const desc = cfg => cfg?.url ? (isMainApi(cfg.url) ? 'Dùng mô hình Quán Rượu đang sử dụng' : esc(cfg.url) + (cfg.model ? ' · Mô hình ' + esc(cfg.model) : ' · Chưa điền mô hình')) : 'Chưa thiết lập';
    const { field, btn } = looks(inline);
    const tick = 'style="width:auto;min-width:0;flex:none;margin:3px 0 0;accent-color:var(--accent,#c59bee)"';
    const same = sameConfig(status, assistant), anySet = !!(status?.url || assistant?.url);
    const both = status?.url && assistant?.url;
    const saveWarning = saveEnvironment().reason;
    const state = !anySet
        ? `<b style="color:#ffcf8a">⚠ Chưa thiết lập API</b><span>Các tính năng AI trên thanh trạng thái (nhập hàng, hộp mù, ước nguyện, chiêu mộ, thiên nhãn…) và trò chuyện riêng với Lilith đều cần dùng nó. Làm theo 3 bước bên dưới là xong.</span>`
        : same
            ? `<b style="color:#bfe8c8">✓ Đã thiết lập</b><span>${desc(status)}</span><span style="opacity:.75">Các tính năng AI của thanh trạng thái và Lilith (trò chuyện riêng / ký ức) đều dùng chung kết nối này. Muốn kiểm tra xem dùng được không, hãy bấm 「Kiểm tra kết nối」 bên dưới.</span>`
            : `<b style="color:#ffcf8a">⚠ API ở hai nơi không khớp nhau</b><span>Tính năng AI thanh trạng thái: ${desc(status)}</span><span>Lilith trò chuyện riêng / ký ức: ${desc(assistant)}</span><span style="opacity:.75">${both ? '' : 'Có một nơi chưa được thiết lập. '}Điền xong ở bên dưới rồi bấm 「Lưu」, cả hai nơi sẽ được đồng nhất.</span>`;
    const opt = (value, on, title, sub) => `<label style="display:flex;gap:10px;align-items:flex-start;margin:0;min-height:0;height:auto;padding:10px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--accent,#c59bee) ${on ? 55 : 18}%,transparent);cursor:pointer"><input type="radio" name="mode" value="${value}" ${on ? 'checked' : ''} ${tick}><span style="display:grid;gap:2px;min-width:0"><b>${title}</b><small style="opacity:.72">${sub}</small></span></label>`;
    const step = (n, t) => `<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><span style="display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:color-mix(in srgb,var(--accent,#c59bee) 30%,transparent);font-size:12px;flex:none">${n}</span><b>${t}</b></div>`;
    const lbl = 'display:grid;gap:4px';
    return `${saveWarning ? `<p role="alert" data-save-warning>${esc(saveWarning)}</p>` : ''}<form ${inline ? '' : 'method="dialog"'} style="padding:${inline ? '4px 2px' : '18px 20px'};display:grid;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:16px;letter-spacing:1px">${inline ? 'Kết nối · Cài đặt cổng AI' : 'Chư Thiên · Cài đặt cổng AI'}</b>${inline ? '' : `<button value="close" ${btn}>Đóng</button>`}</div>
      <div data-state style="display:grid;gap:3px;padding:10px 12px;border-radius:10px;background:#ffffff0a;font-size:13px;overflow-wrap:anywhere">${state}</div>
      <div data-presets style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><b style="font-weight:500;white-space:nowrap">Thiết lập sẵn cổng</b><select data-f="preset" aria-label="Chọn thiết lập sẵn cổng" style="${field};flex:1 1 140px;min-width:0;width:140px;text-overflow:ellipsis">${presetOptions(routes)}</select><button type="button" data-act="preset-del" ${btn}>Xóa</button></div>
      ${step(1, 'Chọn dùng AI nào')}
      <div style="display:grid;gap:8px">
        ${opt('custom', !main, 'API riêng biệt (Khuyên dùng)', 'Điền một cổng tương thích OpenAI (trạm trung chuyển / chính thức đều được), không chiếm dụng mô hình bạn đang dùng để trò chuyện')}
        ${opt('main', main, 'Dùng trực tiếp mô hình Quán Rượu đang dùng', 'Không cần điền thêm địa chỉ và khóa; nhưng mỗi yêu cầu sẽ chiếm luồng trò chuyện chính, khi trò chuyện chính đang tạo phản hồi thì phải đợi')}
      </div>
      <div data-custom style="display:grid;gap:10px">
        ${step(2, 'Điền thông tin cổng kết nối')}
        <label style="${lbl}">Địa chỉ cổng API<input name="url" style="${field}" placeholder="Ví dụ: https://api.example.com/v1" value="${main ? '' : esc(seed.url)}" autocomplete="off"><small style="opacity:.65">Thường kết thúc bằng /v1, sao chép từ nhà cung cấp dịch vụ API của bạn.</small></label>
        <label style="${lbl}">Khóa API (API Key)<input name="key" type="password" style="${field}" placeholder="sk-…" value="${main ? '' : esc(seed.key)}" autocomplete="off"></label>
        <div style="${lbl}"><span>Mô hình</span><div style="display:flex;gap:6px"><input name="model" list="zt-api-models" style="${field}" placeholder="Bấm 「Lấy danh sách mô hình」 bên phải trước, hoặc tự nhập tay" value="${main ? '' : esc(seed.model)}" autocomplete="off" aria-label="Mô hình"><button type="button" data-act="models" ${btn}>Lấy danh sách mô hình</button></div><datalist id="zt-api-models"></datalist>
        <select data-models hidden style="${field}" aria-label="Chọn mô hình từ danh sách"></select></div>
      </div>
      ${step(main ? 2 : 3, 'Kiểm tra và lưu')}
      <output data-out style="min-height:1.6em;font-size:12px;opacity:.95;white-space:pre-wrap"></output>
      <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button type="button" data-act="test" ${btn}>Kiểm tra kết nối</button><button type="button" data-act="save" ${btn}>Lưu</button></div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input data-f="preset-name" maxlength="24" placeholder="Tên thiết lập sẵn (bắt buộc, ví dụ: Trạm miễn phí A)" aria-label="Tên thiết lập sẵn" autocomplete="off" style="${field};flex:1 1 160px;min-width:0;width:auto"><button type="button" data-act="preset-save" disabled ${btn}>Lưu làm thiết lập sẵn</button></div>
      <small style="opacity:.65;margin-top:-4px">Lưu cổng đã điền ở trên thành thiết lập sẵn: khi đổi cổng chỉ cần chọn ở mục 「Thiết lập sẵn cổng」 phía trên là nạp ngay, không cần điền lại. Chỉ khi nhập tên mới lưu được.</small>
      ${routesHtml(routes, { field, btn })}
      <details style="font-size:12px;opacity:.9"><summary style="cursor:pointer">Cài đặt nâng cao (thường không cần sửa)</summary>
        <div style="display:grid;gap:8px;margin-top:8px">
          <label style="${lbl}">Đầu ra tối đa mặc định / thiết lập sẵn (tokens, gồm cả suy luận; để trống sẽ do từng tính năng quyết định, có thể ghi đè theo từng tính năng)<input name="max" type="number" min="64" max="65536" style="${field}" value="${esc(status.maxTokens ?? assistant.maxTokens ?? '')}"></label>
          <div>Lưu vào (mặc định lưu cả hai nơi để giữ đồng nhất):</div>
          <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" name="toStatus" checked ${tick}> Tính năng AI của thanh trạng thái (nhập hàng / hộp mù / ước nguyện / chiêu mộ…)</label>
          <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" name="toAssistant" checked ${tick}> Lilith (trò chuyện riêng / ký ức / bàn làm việc)</label>
          <div style="opacity:.75">Thời gian chờ yêu cầu: Trang 「Cài đặt」 của thiết bị đầu cuối → 「Thời gian chờ API độc lập」. Mọi yêu cầu đều truyền theo luồng (stream).</div>
        </div>
      </details>
      <small style="opacity:.6">Khóa API chỉ lưu trong Quán Rượu và trình duyệt của riêng bạn, không ghi vào lịch sử trò chuyện và cũng không tải lên theo tiện ích.</small>
    </form>`;
}
/** 1.0: options of the preset picker (pure). */
function presetOptions(routes) {
    const list = normalizeStore(routes).presets;
    return `<option value="">${list.length ? `— Chọn thiết lập sẵn (${list.length} mục), nạp xuống bên dưới —` : 'Chưa có thiết lập sẵn: điền cổng ở dưới rồi nhập tên để lưu'}</option>` + list.map(p => `<option value="${esc(p.name)}">${esc(p.name)} · ${esc((() => { try { return new URL(p.url).host; } catch { return '?'; } })())}${p.model ? ' · ' + esc(p.model) : ''}</option>`).join('');
}
/** 1.0 分功能 API: one row per feature that calls a model (pure). */
function routesHtml(routes, { field, btn }) {
    const s = normalizeStore(routes), own = Object.keys(s.routes).length;
    const opts = id => {
        const v = s.routes[id], cur = !v ? '' : v === MAIN ? MAIN : typeof v === 'string' ? v : 'own';
        const list = [['', 'Theo mặc định'], [MAIN, 'API chính hiện tại của Quán Rượu'], ...s.presets.map(p => ['preset:' + p.name, `Thiết lập sẵn 「${p.name}」`])];
        if (cur === 'own') list.push(['own', 'Cấu hình riêng (' + routeText(s, id).replace(/^Cấu hình riêng · /, '') + ')']);
        if (typeof v === 'string' && v.startsWith('preset:') && !s.presets.some(p => 'preset:' + p.name === v)) list.push([v, routeText(s, id)]);
        return list.map(([val, t]) => `<option value="${esc(val)}" ${val === cur ? 'selected' : ''}>${esc(t)}</option>`).join('');
    };
    let group = '';
    const rows = ROUTES.map(r => {
        const head = r.group !== group ? `<div style="margin-top:6px;font-size:11px;letter-spacing:2px;opacity:.6">${esc((group = r.group))}</div>` : '';
        return `${head}<div data-route="${r.id}" style="display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:6px 0;border-top:1px solid #ffffff10">
<span style="flex:1 1 180px;min-width:0;overflow-wrap:anywhere"><b style="font-weight:500">${esc(r.label)}</b> <small style="opacity:.6">${esc(r.desc)}</small><br><small data-route-now style="opacity:.8">Hiện tại: ${esc(routeText(s, r.id))}</small></span>
<span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-left:auto;min-width:0;max-width:100%"><select data-route-sel="${r.id}" aria-label="${esc(r.label)} dùng cổng nào" style="${field};flex:1 1 150px;width:150px;min-width:0;max-width:220px;padding:5px 8px;text-overflow:ellipsis">${opts(r.id)}</select><button type="button" data-route-own="${r.id}" title="Đem cổng đang điền trên biểu mẫu cấp riêng cho tính năng này dùng" ${btn}>Dùng cổng điền ở trên</button></span></div>`;
    }).join('');
    return `<details data-routes ${own ? 'open' : ''} style="min-width:0;font-size:13px;border:1px solid color-mix(in srgb,var(--accent,#c59bee) 25%,transparent);border-radius:10px;padding:8px 10px">
<summary style="cursor:pointer"><b>API theo tính năng</b> <small data-routes-count style="opacity:.75">${own ? `Đã thiết lập riêng ${own} mục` : 'Tùy chọn: rút thẻ, nhóm chat, Lilith… có thể dùng cổng riêng cho từng mục'}</small></summary>
<div style="opacity:.75;font-size:12px;margin:6px 0 2px">Các tính năng chưa thiết lập riêng đều dùng cổng mặc định đã lưu ở trên. Mỗi tính năng có thể chọn: API chính hiện tại của Quán Rượu, một thiết lập sẵn, hoặc bấm 「Dùng cổng điền ở trên」 để gán riêng cổng trong biểu mẫu cho nó. Các tính năng AI trên thanh trạng thái sẽ kiểm tra cổng mặc định trước, nên cổng mặc định cần được lưu ít nhất một lần.</div>
<div data-routes-body>${rows}</div></details>`;
}
export function sameConfig(a, b) { return ['url', 'key', 'model'].every(k => String(a?.[k] || '').trim() === String(b?.[k] || '').trim()); }

/** Wires a rendered form. `root` is the element that contains it (dialog or inline box). */
function bindForm(root, { bridge, ns, notify, rerender }) {
    const f = root.querySelector('form'), out = root.querySelector('[data-out]');
    const mode = () => f.querySelector('input[name=mode]:checked')?.value || 'custom';
    const sync = () => {
        root.querySelector('[data-custom]').style.display = mode() === 'main' ? 'none' : 'grid';
        for (const r of f.querySelectorAll('input[name=mode]')) r.closest('label').style.borderColor = `color-mix(in srgb,var(--accent,#c59bee) ${r.checked ? 55 : 18}%,transparent)`;
        const nums = [...f.querySelectorAll(':scope > div > span[style*="border-radius:50%"]')]; if (nums[1]) nums[1].textContent = mode() === 'main' ? '2' : '3';
    };
    f.addEventListener('change', sync); sync();
    f.addEventListener('submit', e => { if (!f.getAttribute('method')) e.preventDefault(); });
    const current = () => mode() === 'main' ? { url: MAIN_API_URL, key: 'st-main', model: MAIN_API_MODEL, maxTokens: f.max.value } : { url: f.url.value.trim(), key: f.key.value.trim(), model: f.model.value.trim(), maxTokens: f.max.value };
    const check = c => { if (isMainApi(c.url)) return ''; const bad = validateUrl(c.url); if (bad) return bad; if (!c.key) return 'Vui lòng điền khóa API (các tính năng AI của thanh trạng thái yêu cầu cả địa chỉ lẫn khóa đều không được để trống)'; return ''; };
    const say = (t, bad) => { out.textContent = t; out.style.color = bad ? '#ff9aa8' : '#bfe8c8'; };
    const pickSel = root.querySelector('[data-models]');
    pickSel.addEventListener('change', () => { if (pickSel.value) f.model.value = pickSel.value; });
    root.querySelector('[data-act=models]').addEventListener('click', async () => {
        const c = current(); const bad = validateUrl(c.url); if (bad) return say(bad, true);
        say('Đang lấy danh sách mô hình… (khi trình duyệt bị chặn sẽ tự động chuyển tiếp qua máy chủ Quán Rượu)');
        try {
            const list = await bridge.listModels(c.url, c.key);
            root.querySelector('#zt-api-models').innerHTML = list.map(m => `<option value="${esc(m)}">`).join('');
            // datalist pickers are unreliable on phones: a plain select as well
            pickSel.innerHTML = `<option value="">— Chọn từ ${list.length} mô hình —</option>` + list.map(m => `<option value="${esc(m)}" ${m === f.model.value ? 'selected' : ''}>${esc(m)}</option>`).join('');
            pickSel.hidden = false;
            say(`Tổng cộng ${list.length} mô hình.`); if (!f.model.value && list[0]) f.model.value = list[0];
        } catch (e) { say('Lấy danh sách thất bại: ' + (e?.message || e) + '\n(Khi không lấy được danh sách, bạn cũng có thể tự nhập tay tên mô hình.)', true); }
    });
    root.querySelector('[data-act=test]').addEventListener('click', async () => {
        const c = current(); const bad = check(c); if (bad) return say(bad, true);
        say('Đang kiểm tra…'); const t0 = performance.now(), control = new AbortController(), timer = setTimeout(() => control.abort(), 45000);
        try { const r = await bridge.customChat(c, [{ role: 'user', content: 'Chỉ trả lời: Thành công' }], { maxTokens: 4096, signal: control.signal }); say(`Kết nối bình thường (${Math.round(performance.now() - t0)} ms · ${r.via === 'st-proxy' ? 'chuyển tiếp qua máy chủ Quán Rượu' : r.via === 'st-main' ? 'API chính của Quán Rượu' : 'kết nối trực tiếp từ trình duyệt'}): ${String(r.text).trim().slice(0, 40)}`); }
        catch (e) { say('Kiểm tra thất bại: ' + (e?.message || e), true); } finally { clearTimeout(timer); }
    });
    // ---------- 1.0: presets ----------
    const presetSel = root.querySelector('[data-f=preset]'), nameIn = root.querySelector('[data-f=preset-name]'), saveP = root.querySelector('[data-act=preset-save]');
    const store = () => readRoutes(bridge);
    const syncName = () => { const n = cleanName(nameIn.value); saveP.disabled = !n; saveP.textContent = n && store().presets.some(p => p.name === n) ? 'Ghi đè thiết lập sẵn' : 'Lưu làm thiết lập sẵn'; };
    const repaint = () => {
        const s = store(), keep = presetSel.value;
        presetSel.innerHTML = presetOptions(s); if (s.presets.some(p => p.name === keep)) presetSel.value = keep;
        const d = root.querySelector('[data-routes]'), open = d?.open;
        if (d) {
            const tmp = root.ownerDocument.createElement('div'); tmp.innerHTML = routesHtml(s, looks(!f.getAttribute('method'))); const nd = tmp.firstElementChild;
            d.querySelector('[data-routes-body]').innerHTML = nd.querySelector('[data-routes-body]').innerHTML;
            d.querySelector('[data-routes-count]').textContent = nd.querySelector('[data-routes-count]').textContent; d.open = open || nd.open;
        }
        syncName();
    };
    nameIn.addEventListener('input', syncName);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!saveP.disabled) saveP.click(); } });
    presetSel.addEventListener('change', () => {
        const p = store().presets.find(x => x.name === presetSel.value); if (!p) return;
        const r = f.querySelector('input[name=mode][value=custom]'); if (r) r.checked = true; sync();
        f.url.value = p.url; f.key.value = p.key; f.model.value = p.model || ''; nameIn.value = p.name; syncName();
        say(`Đã nạp thiết lập sẵn 「${p.name}」. Bấm 「Lưu」 để đặt làm cổng mặc định, hoặc chỉ gán cho một tính năng trong mục 「API theo tính năng」 bên dưới.`);
    });
    saveP.addEventListener('click', async () => {
        const name = cleanName(nameIn.value); if (!name) return say('Vui lòng nhập tên thiết lập sẵn trước khi lưu.', true);
        const c = current(); if (mode() === 'main') return say('「API chính hiện tại của Quán Rượu」 không cần lưu thành thiết lập sẵn: chỉ cần chọn trực tiếp nó trong 「API theo tính năng」.', true);
        const bad = check(c); if (bad) return say(bad, true);
        try { const had = store().presets.some(p => p.name === name); await writeRoutes(bridge, withPreset(store(), name, c)); repaint(); presetSel.value = name; say(had ? `Đã ghi đè thiết lập sẵn 「${name}」. Các tính năng đang dùng nó sẽ áp dụng cổng mới ngay ở yêu cầu tiếp theo.` : `Đã lưu thiết lập sẵn 「${name}」.`); }
        catch (e) { say('Lưu thiết lập sẵn thất bại: ' + (e?.message || e), true); }
    });
    root.querySelector('[data-act=preset-del]').addEventListener('click', async () => {
        const name = presetSel.value; if (!name) return say('Hãy chọn thiết lập sẵn muốn xóa ở mục 「Thiết lập sẵn cổng」 trước.', true);
        const users = Object.entries(store().routes).filter(([, v]) => v === 'preset:' + name).length;
        if (!globalThis.confirm(`Xóa thiết lập sẵn 「${name}」? ${users ? `Có ${users} tính năng đang dùng nó, sau khi xóa sẽ quay về theo mặc định.` : ''}`)) return;
        try { await writeRoutes(bridge, withoutPreset(store(), name)); repaint(); presetSel.value = ''; say(`Đã xóa thiết lập sẵn 「${name}」.`); }
        catch (e) { say('Xóa thất bại: ' + (e?.message || e), true); }
    });
    // ---------- 1.0: 分功能 API ----------
    const label = id => ROUTES.find(r => r.id === id)?.label || id;
    f.addEventListener('change', async e => {
        const sl = e.target.closest?.('[data-route-sel]'); if (!sl) return;
        const id = sl.dataset.routeSel; if (sl.value === 'own') return;
        try { const s = await writeRoutes(bridge, withRoute(store(), id, sl.value)); repaint(); say(`Đã gửi lưu: ${label(id)} → ${routeText(s, id)}. Có hiệu lực từ yêu cầu tiếp theo.`); }
        catch (err) { say('Lưu thất bại: ' + (err?.message || err), true); repaint(); }
    });
    f.addEventListener('click', async e => {
        const b = e.target.closest?.('[data-route-own]'); if (!b) return;
        const id = b.dataset.routeOwn, c = current();
        if (mode() !== 'main') { const bad = check(c); if (bad) return say(`${label(id)}: ${bad}`, true); }
        try { const s = await writeRoutes(bridge, withRoute(store(), id, mode() === 'main' ? MAIN : c)); repaint(); say(`Đã gửi lưu: ${label(id)} → ${routeText(s, id)}. Chỉ ảnh hưởng tới tính năng này, cổng mặc định không đổi.`); }
        catch (err) { say('Lưu thất bại: ' + (err?.message || err), true); }
    });
    syncName();
    root.querySelector('[data-act=save]').addEventListener('click', async () => {
        const c = current(); const bad = check(c); if (bad) return say(bad, true);
        if (!f.toStatus.checked && !f.toAssistant.checked) return say('Vui lòng tích chọn ít nhất một mục tiêu áp dụng.', true);
        try { await saveConfigs(bridge, ns, c, { status: f.toStatus.checked, assistant: f.toAssistant.checked }); notify(); rerender?.('Đã gửi cho Quán Rượu lưu; nếu lưu thất bại vui lòng xem mục Chẩn đoán, tải lại trang để đối chiếu. Thanh trạng thái và trợ lý Lilith sẽ dùng cấu hình mới ngay ở yêu cầu tiếp theo (các tính năng đã thiết lập riêng không bị ảnh hưởng).'); if (!rerender) say('Đã gửi cho Quán Rượu lưu; nếu lưu thất bại vui lòng xem mục Chẩn đoán, tải lại trang để đối chiếu. Thanh trạng thái và trợ lý Lilith sẽ dùng cấu hình mới ngay ở yêu cầu tiếp theo (các tính năng đã thiết lập riêng không bị ảnh hưởng).'); }
        catch (e) { say('Lưu thất bại: ' + (e?.message || e), true); }
    });
    return { say };
}

/** 0.8.4: the terminal's 连接 page shows this form instead of the original v1.1 connection form (which wrote only the
 *  Lilith copy, so the two places drifted apart). The original section stays in the DOM, hidden, untouched. */
export function mountApiInline(section, { bridge, ns, notify = () => {} }) {
    if (!section) return null;
    section.classList.add('zt-api-unified');
    let box = section.querySelector(':scope > .zt-api-inline');
    if (!box) { box = section.ownerDocument.createElement('div'); box.className = 'zt-api-inline zt-card'; section.prepend(box); }
    const render = msg => {
        const { status, assistant } = readConfigs(bridge, ns);
        box.innerHTML = formHtml({ status, assistant, inline: true, routes: readRoutes(bridge) });
        const api = bindForm(box, { bridge, ns, notify, rerender: render });
        if (msg) api.say(msg);
    };
    render();
    return { box, render };
}

export function openApiCenter({ bridge, ns, notify = () => {} }) {
    document.getElementById('zt-api-center')?.remove();
    const dlg = document.createElement('dialog'); dlg.id = 'zt-api-center';
    dlg.setAttribute('style', 'max-width:min(560px,94vw);width:560px;padding:0;border:1px solid #c4a0d655;border-radius:14px;background:#1b1622;color:#eee5f5;box-shadow:0 20px 60px #000a;font:14px/1.6 system-ui,"Microsoft YaHei",sans-serif');
    const render = msg => {
        const { status, assistant } = readConfigs(bridge, ns);
        dlg.innerHTML = formHtml({ status, assistant, inline: false, routes: readRoutes(bridge) });
        const api = bindForm(dlg, { bridge, ns, notify, rerender: render });
        if (msg) api.say(msg);
    };
    render();
    document.body.append(dlg);
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
    return dlg;
}
