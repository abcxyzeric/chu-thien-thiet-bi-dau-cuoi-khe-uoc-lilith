import { migrateBonds } from './bonds-data.js';
// 1.0 Xuất / Nhập bản lưu + Phiên bản cấu trúc sổ cái.
//
// Xuất: một tệp JSON = cài đặt tiện ích + sổ cái Chư Thiên của cuộc trò chuyện hiện tại (gồm Nhóm chat, dấu chân Bản đồ sao…) + tùy chọn bản lưu ký ức / lịch sử trò chuyện riêng Lilith.
//       Tuyệt đối không chứa API Key: xóa các trường có tên giống key / token / secret / password, xóa các chuỗi có dạng khóa bảo mật, cắt bỏ tham số sau dấu ? trong URL.
//       Không xuất các bản ghi gắn với máy chủ (nhật ký tiếp quản một chạm, bản ghi gỡ gắn kết, chứng từ kết toán).
// Nhập: kiểm tra tệp trước, sau đó hiện bản xem trước "những gì sắp bị ghi đè"; sau khi xác nhận sẽ cưỡng chế sao lưu sổ cái hiện tại trước, ghi dữ liệu và đọc lại kiểm tra.
//       Nếu gặp phiên bản cấu trúc mới hơn tiện ích hiện tại: từ chối nhập.
import { VERSION, STORAGE, LEDGER_SCHEMA } from './contracts.js';
import { errorLine } from './errors.js';
import { copyText } from './diag-report.js';

export const BACKUP_FORMAT = 'zhutian-terminal-backup';
export const BACKUP_FORMAT_VERSION = 1;
/** Current ledger structure version (src/contracts.js). Raise it together with a new LEDGER_MIGRATIONS step. */
export { LEDGER_SCHEMA };
/** Ordered upgrade steps: `to` = the version after the step; `up(z)` mutates a clone of the 诸天系统 ledger. */
export const LEDGER_MIGRATIONS = Object.freeze([
    // 0 → 1 (1.0): the structure 0.1–0.9 already wrote; only repairs types the old engine relies on.
    { to: 1, note: 'Từ 1.0 ghi nhận phiên bản cấu trúc; chuẩn hóa kiểu dữ liệu (Túi đồ / Kho nhiệm vụ / Dấu chân vạn giới)', up(z) {
        if (z.背包 !== undefined && !Array.isArray(z.背包)) z.背包 = [];
        if (z.任务库 !== undefined && (typeof z.任务库 !== 'object' || Array.isArray(z.任务库) || z.任务库 === null)) z.任务库 = {};
        if (z.万界足迹 !== undefined && !Array.isArray(z.万界足迹)) z.万界足迹 = [];
        if (z.系统点 !== undefined && !Number.isFinite(Number(z.系统点))) z.系统点 = 0;
        return z;
    } },
    { to: 2, note: '1.1 Gắn kết nhiều người & bản ghi nguồn gốc (giữ nguyên mục tiêu cũ)', up: migrateBonds },
]);
const HOST_ONLY = new Set(['takeoverLog', 'wbUnbound', 'legacyImported', 'migrated070', 'ledgerReceipts']);
const SECRET_KEY = /^(api[_-]?key|key|apikey|token|access[_-]?token|secret|password|passwd|authorization|auth)$/i;
const SECRET_VALUE = /^(sk-|sk_|pk-|xai-|gsk_|AIza)[A-Za-z0-9_-]{8,}|^Bearer\s+\S{8,}/;
const plain = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

/** Deep copy without anything that could be a credential (pure). */
export function stripSecrets(v, depth = 0) {
    if (depth > 40) return undefined;
    if (Array.isArray(v)) return v.map(x => stripSecrets(x, depth + 1)).filter(x => x !== undefined);
    if (plain(v)) {
        const out = {};
        for (const [k, x] of Object.entries(v)) {
            const memoryKey = k === 'key' && ['事件','承诺','关系','线索','地点','规则','任务','其他','Sự kiện','Lời hứa','Quan hệ','Manh mối','Địa điểm','Quy tắc','Nhiệm vụ','Khác'].includes(v.kind) && ['active','resolved'].includes(v.status) && typeof v.text === 'string' && typeof v.evidence === 'string';
            if (SECRET_KEY.test(k) && !memoryKey) continue;
            const y = stripSecrets(x, depth + 1);
            if (y !== undefined) Object.defineProperty(out, k, { value: y, enumerable: true, configurable: true, writable: true });
        }
        return out;
    }
    if (typeof v === 'string') {
        if (SECRET_VALUE.test(v.trim())) return undefined;
        if (/^https?:\/\//i.test(v) && v.includes('?')) return v.slice(0, v.indexOf('?'));
        return v;
    }
    return v;
}

/** Runs the upgrade steps from `from` to LEDGER_SCHEMA on a copy (pure). */
export function migrateLedger(z, from = 0) {
    if (!plain(z)) return { ledger: z, from, to: from, steps: [] };
    if (from > LEDGER_SCHEMA) throw Error(`Phiên bản cấu trúc của sổ cái này là ${from}, mới hơn phiên bản ${LEDGER_SCHEMA} mà tiện ích hiện tại hỗ trợ. Vui lòng cập nhật tiện ích trước, trước đó sổ cái ở chế độ chỉ đọc.`);
    let out = clone(z); const steps = [];
    for (const m of LEDGER_MIGRATIONS) if (m.to > from && m.to <= LEDGER_SCHEMA) { out = m.up(out) ?? out; steps.push(m.to); }
    return { ledger: out, from, to: LEDGER_SCHEMA, steps };
}

/** The export object (pure — callers pass what they read). */
export function buildBackup({ settings = {}, variables = {}, meta = {}, chat = '', host = '', memoryNs = '', companionKey = '', include = {} } = {}) {
    const s = {};
    for (const [k, v] of Object.entries(settings || {})) if (!HOST_ONLY.has(k)) s[k] = v;
    const chatVars = {};
    if (variables?.诸天系统 !== undefined) chatVars.诸天系统 = variables.诸天系统;
    if (include.memory !== false && memoryNs && variables?.[memoryNs] !== undefined) chatVars[memoryNs] = variables[memoryNs];
    if (include.companion !== false && companionKey && variables?.[companionKey] !== undefined) chatVars[companionKey] = variables[companionKey];
    return stripSecrets({
        format: BACKUP_FORMAT, formatVersion: BACKUP_FORMAT_VERSION, plugin: VERSION, at: new Date().toISOString(), host,
        chat: { name: String(chat || ''), ledgerSchema: Number(meta?.ledgerSchema) || 0, variables: chatVars },
        settings: s,
    });
}

/** Validates a backup file's text; returns the parsed object or throws a readable error (pure). */
export function parseBackup(text) {
    let o;
    try { o = typeof text === 'string' ? JSON.parse(text) : text; } catch { throw Error('Không phải tệp JSON hợp lệ. Vui lòng chọn tệp .json lấy từ chức năng 「Xuất bản lưu」.'); }
    if (!plain(o) || o.format !== BACKUP_FORMAT) throw Error('Đây không phải tệp bản lưu của Thiết Bị Đầu Cuối Chư Thiên (thiếu dấu hiệu format).');
    if (!(Number(o.formatVersion) >= 1)) throw Error('Không nhận diện được phiên bản tệp bản lưu.');
    if (Number(o.formatVersion) > BACKUP_FORMAT_VERSION) throw Error(`Tệp bản lưu được tạo từ phiên bản tiện ích mới hơn (định dạng tệp ${o.formatVersion}), vui lòng cập nhật tiện ích trước khi nhập.`);
    const schema = Number(o.chat?.ledgerSchema) || 0;
    if (schema > LEDGER_SCHEMA) throw Error(`Phiên bản cấu trúc sổ cái trong bản lưu là ${schema}, mới hơn mức ${LEDGER_SCHEMA} mà tiện ích hiện tại hỗ trợ, vui lòng cập nhật tiện ích trước khi nhập.`);
    if (o.chat?.variables !== undefined && !plain(o.chat.variables)) throw Error('Định dạng dữ liệu trò chuyện trong bản lưu không đúng.');
    if (o.settings !== undefined && !plain(o.settings)) throw Error('Định dạng cài đặt trong bản lưu không đúng.');
    const z = o.chat?.variables?.诸天系统;
    if (z !== undefined && !plain(z)) throw Error('Định dạng sổ cái Chư Thiên trong bản lưu không đúng.');
    return o;
}

const n = v => (Number.isFinite(Number(v)) ? Number(v) : null);
const fmt = v => (v === null || v === undefined ? '—' : typeof v === 'number' ? v.toLocaleString('en-US') : String(v));
/** What an import would change, as readable rows [label, now, after] (pure). */
export function backupPreview(cur = {}, file) {
    const a = cur.variables?.诸天系统 || null, b = file.chat?.variables?.诸天系统 || null, rows = [];
    const take = (label, f) => { const x = a ? f(a) : null, y = b ? f(b) : null; rows.push([label, fmt(x), fmt(y)]); };
    take('Điểm Hệ Thống', z => n(z.系统点));
    take('Thế giới hiện tại', z => z.当前世界 || null);
    take('Vật phẩm túi đồ', z => (Array.isArray(z.背包) ? z.背包.length : null));
    take('Nhiệm vụ', z => (plain(z.任务库) ? Object.keys(z.任务库).length : null));
    take('Thành viên nhóm chat', z => (Array.isArray(z.聊天群?.成员) ? z.聊天群.成员.length : null));
    take('Dấu chân vạn giới', z => (Array.isArray(z.万界足迹) ? z.万界足迹.length : null));
    const extra = Object.keys(file.chat?.variables || {}).filter(k => k !== '诸天系统');
    const changed = Object.keys(file.settings || {}).filter(k => JSON.stringify(file.settings[k]) !== JSON.stringify(cur.settings?.[k]));
    return { rows, hasLedger: !!b, extra, settingsChanged: changed.length, from: { plugin: file.plugin, at: file.at, chat: file.chat?.name || '' } };
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export class DataIO {
    constructor(app) { this.app = app; this.disposers = []; this.schemaState = null; }
    start() {
        const c = this.ctx(), ev = c?.eventTypes, run = () => { clearTimeout(this.t); this.t = setTimeout(() => this.checkSchema().then(r => { this.schemaState = r; if (r.state === 'newer') globalThis.toastr?.warning(`Sổ cái của cuộc trò chuyện này được ghi bởi phiên bản tiện ích mới hơn (phiên bản cấu trúc ${r.from}), tiện ích hiện tại chỉ đọc và không ghi dữ liệu. Vui lòng cập nhật tiện ích.`, 'Chư Thiên'); }).catch(e => { this.schemaState = { state: 'error', error: e.message }; console.warn('[Chư Thiên] Kiểm tra cấu trúc sổ cái', e); }), 1200); };
        if (ev?.CHAT_CHANGED) { c.eventSource.on(ev.CHAT_CHANGED, run); this.disposers.push(() => c.eventSource.removeListener(ev.CHAT_CHANGED, run)); }
        run();
        return this;
    }
    dispose() { clearTimeout(this.t); this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); }
    get bridge() { return this.app.bridge; }
    ctx() { return this.app.adapter.context(); }
    memoryNs() { return this.app.original?.ZhuTianMemoryCore?.NS || ''; }
    companionKey() { const ns = this.memoryNs() || '诸天记忆助手_v1'; return ns + '_LILITH_CHAT'; }
    meta() { return this.ctx()?.chatMetadata?.[STORAGE] || {}; }
    current() {
        return { variables: this.bridge.getVariables({ type: 'chat' }) || {}, settings: clone(this.app.settings.all) };
    }
    /** The export object for the open chat. */
    snapshotFile(include = {}) {
        const c = this.ctx(), cur = this.current();
        const settings = clone(cur.settings); settings.scriptVariables = stripSecrets(settings.scriptVariables || {});
        return buildBackup({ settings, variables: cur.variables, meta: this.meta(), chat: c?.getCurrentChatId?.() || '', host: `SillyTavern ${c?.version?.pkgVersion || ''}`.trim(), memoryNs: this.memoryNs(), companionKey: this.companionKey(), include });
    }
    fileName() { const d = new Date().toLocaleString('sv-SE').replace(/[-: ]/g, '').slice(0, 12); return `BanLuu-ChuThien-${d}.json`; }
    /** Download (or, when the browser refuses, hand back the text to copy). */
    export(include = {}) {
        const file = this.snapshotFile(include), text = JSON.stringify(file, null, 1);
        try {
            const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
            const a = document.createElement('a'); a.href = url; a.download = this.fileName(); document.body.append(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
        } catch (e) { console.warn('[Chư Thiên] Tải tệp xuất thất bại, chuyển sang hiển thị văn bản', e); }
        return { file, text };
    }
    /** Import after preview: forced backup → write ledger (+ memory) → settings → read back. */
    async import(file, options = {}) {
        if (this.importing) throw Error('Đang nhập bản lưu, vui lòng không gửi lặp lại.');
        this.importing = true;
        try { return await this.importOnce(file, options); } finally { this.importing = false; }
    }
    async importOnce(file, { ledger = true, settings = true } = {}) {
        file = parseBackup(file);
        const expected = this.app.adapter.currentIdentity(), before = JSON.stringify(this.bridge.getVariables({ type: 'chat' }));
        const vars = file.chat?.variables || {}, out = { ledger: false, settings: 0, extra: [] };
        if (ledger && Object.keys(vars).length) {
            if (!this.ctx()?.chatMetadata) throw Error('Vui lòng mở cuộc trò chuyện cần nhập bản lưu vào trước.');
            await this.bridge.snapshot?.('Trước khi nhập');
            if (!expected || this.app.adapter.currentIdentity() !== expected) throw Error('Trò chuyện đã chuyển trong lúc nhập, chưa ghi dữ liệu.');
            const mig = vars.诸天系统 ? migrateLedger(vars.诸天系统, Number(file.chat?.ledgerSchema) || 0) : null;
            const want = { ...vars, ...(mig ? { 诸天系统: mig.ledger } : {}) };
            await this.bridge.updateVariablesWith(v => { if (JSON.stringify(v) !== before) throw Error('Sổ cái đã thay đổi sau khi sao lưu, vui lòng xem trước lại trước khi nhập.'); for (const [k, x] of Object.entries(want)) v[k] = clone(x); return v; }, { type: 'chat', verify: true, expectedIdentity: expected, replaceLedger: true });
            if (this.app.adapter.currentIdentity() !== expected) throw Error('Trò chuyện đã chuyển sau khi nhập, vui lòng kiểm tra cuộc trò chuyện gốc.');
            const back = this.bridge.getVariables({ type: 'chat' }) || {};
            for (const [k, x] of Object.entries(want)) if (JSON.stringify(back[k]) !== JSON.stringify(x)) throw Error(`Đọc lại sau khi nhập không khớp (${k}). Sổ cái hiện tại đã được sao lưu trước khi nhập, có thể khôi phục trong mục 「Hoàn tác sổ cái」.`);
            await this.setSchema(LEDGER_SCHEMA, expected);
            out.ledger = !!vars.诸天系统; out.extra = Object.keys(vars).filter(k => k !== '诸天系统');
        }
        if (settings && plain(file.settings)) {
            const keep = this.app.settings.all.scriptVariables || {};
            for (const [k, v] of Object.entries(file.settings)) {
                if (HOST_ONLY.has(k) || k === 'schema') continue;
                // never wipe stored API configs with the key-less copies from the file
                if (k === 'scriptVariables') { this.app.settings.set(k, mergeKeepingSecrets(keep, v)); out.settings++; continue; }
                if (JSON.stringify(this.app.settings.get(k)) !== JSON.stringify(v)) { this.app.settings.set(k, clone(v)); out.settings++; }
            }
        }
        this.app.adapter.notify?.();
        return out;
    }
    async setSchema(v, expected = this.app.adapter.currentIdentity()) {
        if (!expected || this.app.adapter.currentIdentity() !== expected) throw Error('Trò chuyện đã chuyển, chưa đánh dấu phiên bản cấu trúc.');
        const c = this.ctx(); if (!c?.chatMetadata) return;
        const meta = c.chatMetadata[STORAGE] = { schema: 1, ...(c.chatMetadata[STORAGE] || {}) };
        if (meta.ledgerSchema === v) return;
        const target = { avatar_url: c.characters?.[c.characterId]?.avatar, file_name: c.getCurrentChatId() };
        meta.ledgerSchema = v;
        try {
            await c.saveMetadata?.();
            const r = await fetch('/api/chats/get', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: c.getRequestHeaders(), body: JSON.stringify(target), signal: AbortSignal.timeout(15000) });
            if (!r.ok || Number((await r.json())?.[0]?.chat_metadata?.[STORAGE]?.ledgerSchema) !== v || this.app.adapter.currentIdentity() !== expected) throw Error('Đọc lại phiên bản cấu trúc không khớp hoặc trò chuyện đã chuyển');
        } catch (e) { this.app.adapter.transactions?.uncertain?.add(expected); throw Error('Lưu phiên bản cấu trúc chưa được xác nhận, đã đóng băng ghi dữ liệu, vui lòng tải lại trang để kiểm tra. ' + e.message); }
    }
    /** On chat open: upgrade an old ledger (backup first); a newer one makes the chat read-only (th-bridge checks). */
    async checkSchema() {
        const c = this.ctx(), expected = this.app.adapter.currentIdentity(), z = this.bridge.getVariables({ type: 'chat' })?.诸天系统;
        if (!c?.chatMetadata || !plain(z)) return { state: 'none' };
        const from = Number(this.meta().ledgerSchema) || 0;
        if (from > LEDGER_SCHEMA) return { state: 'newer', from };
        if (from === LEDGER_SCHEMA) return { state: 'current', from };
        const mig = migrateLedger(z, from);
        if (JSON.stringify(mig.ledger) !== JSON.stringify(z)) {
            await this.bridge.snapshot?.(`Trước khi nâng cấp cấu trúc ${from}→${LEDGER_SCHEMA}`);
            await this.bridge.updateVariablesWith(v => { v.诸天系统 = migrateLedger(v.诸天系统, from).ledger; return v; }, { type: 'chat', verify: true, expectedIdentity: expected, replaceLedger: true });
        }
        if (this.app.adapter.currentIdentity() !== expected) throw Error('Trò chuyện đã chuyển trong lúc di chuyển dữ liệu, chưa đánh dấu phiên bản cấu trúc.');
        await this.setSchema(LEDGER_SCHEMA, expected);
        return { state: 'upgraded', from, to: LEDGER_SCHEMA, steps: mig.steps };
    }
    popup(html) { return this.app.features.popup(html, true); }
    open() {
        const el = this.popup(`<h3>Xuất / Nhập bản lưu</h3>
<p>Bản lưu là một tệp .json chứa cài đặt tiện ích và sổ cái Chư Thiên của <b>cuộc trò chuyện hiện tại</b> (Nhóm chat, dấu chân Bản đồ sao đều nằm trong sổ cái). <b>Không chứa API Key</b>, khi đổi thiết bị cần điền lại cổng kết nối.</p>
<h4>Xuất</h4>
<label class="checkbox_label"><input type="checkbox" data-io="memory" checked> Bao gồm bản lưu ký ức (ký ức cốt truyện)</label>
<label class="checkbox_label"><input type="checkbox" data-io="companion" checked> Bao gồm lịch sử trò chuyện riêng với Lilith</label>
<div class="zt-popup-actions"><div class="menu_button" data-io="export">Xuất tệp bản lưu</div><div class="menu_button" data-io="copy">Sao chép văn bản bản lưu</div></div>
<h4>Nhập vào cuộc trò chuyện hiện tại</h4>
<p>Trước khi nhập hệ thống sẽ tự động sao lưu sổ cái hiện tại (có thể khôi phục trong mục 「Di chuyển bản lưu cũ / Hoàn tác sổ cái」).</p>
<input type="file" accept=".json,application/json" data-io="file" style="display:none">
<div class="zt-popup-actions"><div class="menu_button" data-io="pick">Chọn tệp bản lưu…</div><div class="menu_button" data-io="paste">Dán văn bản bản lưu…</div></div>
<textarea class="text_pole" data-io="text" placeholder="Dán văn bản bản lưu vào đây" style="display:none;width:100%;height:120px;font:12px/1.4 monospace"></textarea>
<div data-io="preview"></div><p class="zt-out"></p>`);
        const $ = s => el.querySelector(`[data-io="${s}"]`), out = el.querySelector('.zt-out');
        let pending = null, pendingIdentity = '';
        const include = () => ({ memory: $('memory').checked, companion: $('companion').checked });
        const show = text => {
            try {
                pending = parseBackup(text); pendingIdentity = this.app.adapter.currentIdentity();
                const p = backupPreview(this.current(), pending);
                $('preview').innerHTML = `<h4>Sắp nhập</h4><p>Từ tiện ích ${esc(p.from.plugin)} · ${esc(new Date(p.from.at).toLocaleString())}${p.from.chat ? ' · Trò chuyện 「' + esc(p.from.chat) + '」' : ''}</p>
<table class="zt-table"><tr><th></th><th>Hiện tại</th><th>Sau khi nhập</th></tr>${p.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table>
<p>${p.hasLedger ? '' : 'Trong bản lưu không có sổ cái Chư Thiên.'}${p.extra.length ? 'Ghi đồng thời: ' + esc(p.extra.join(', ')) + '.' : ''} Thay đổi cài đặt ${p.settingsChanged} mục (API Key sẽ không bị xóa).</p>
<label class="checkbox_label"><input type="checkbox" data-io="ledger" checked> Ghi sổ cái và ký ức</label><label class="checkbox_label"><input type="checkbox" data-io="settings" checked> Nhập cài đặt</label>
<div class="zt-popup-actions"><div class="menu_button" data-io="apply">Xác nhận nhập</div></div>`;
                out.textContent = '';
            } catch (e) { pending = null; $('preview').innerHTML = ''; out.textContent = 'Không thể nhập: ' + e.message; }
        };
        el.addEventListener('change', async e => {
            if (e.target === $('file') && e.target.files?.[0]) show(await e.target.files[0].text());
        });
        el.addEventListener('input', e => { if (e.target === $('text') && e.target.value.trim()) show(e.target.value); });
        el.addEventListener('click', async e => {
            const act = e.target.closest('[data-io]')?.dataset.io;
            try {
                if (act === 'export') { const r = this.export(include()); out.textContent = `Đã xuất: ${this.fileName()} (${Math.ceil(r.text.length / 1024)} KB, không chứa API Key). Trên điện thoại nếu không tự bật tải xuống, vui lòng dùng nút 「Sao chép văn bản bản lưu」.`; }
                else if (act === 'copy') { const t = JSON.stringify(this.snapshotFile(include()), null, 1); const ok = await copyText(t); out.textContent = ok ? 'Đã sao chép văn bản bản lưu (không chứa API Key).' : 'Trình duyệt không cho phép sao chép tự động.'; if (!ok) { $('text').style.display = ''; $('text').value = t; $('text').select(); } }
                else if (act === 'pick') $('file').click();
                else if (act === 'paste') { $('text').style.display = ''; $('text').value = ''; $('text').focus(); }
                else if (act === 'apply' && pending) {
                    if (this.app.adapter.currentIdentity() !== pendingIdentity) throw Error('Trò chuyện đã chuyển, vui lòng xem trước lại bản lưu rồi mới nhập.');
                    if (!globalThis.confirm('Dùng bản lưu này ghi đè sổ cái và cài đặt của cuộc trò chuyện hiện tại? Sổ cái hiện tại sẽ được tự động sao lưu trước.')) return;
                    const r = await this.import(pending, { ledger: $('ledger')?.checked !== false, settings: $('settings')?.checked !== false });
                    out.textContent = `Đã nhập: ${r.ledger ? 'sổ cái đã ghi và đọc lại khớp hoàn toàn' : 'không ghi sổ cái'}${r.extra.length ? ', ' + r.extra.join(', ') : ''}; cài đặt ${r.settings} mục.`;
                    $('preview').innerHTML = ''; pending = null; this.app.hub?.reloadEngine?.();
                }
            } catch (err) { out.textContent = 'Chưa hoàn tất: ' + errorLine(err); }
        });
        return el;
    }
}

/** Imported scriptVariables never remove a stored secret: keys absent from the file keep their local value (pure). */
export function mergeKeepingSecrets(local, incoming) {
    if (!plain(incoming)) return clone(local);
    const out = clone(incoming);
    const walk = (o, l) => { if (!plain(o) || !plain(l)) return; for (const [k, v] of Object.entries(l)) { if (!(k in o)) { if (SECRET_KEY.test(k) || (typeof v === 'string' && SECRET_VALUE.test(v.trim()))) o[k] = clone(v); } else walk(o[k], v); } };
    walk(out, local || {});
    return out;
}
