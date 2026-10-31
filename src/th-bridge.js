import { assertSaveEnvironment, recordSaveFailure } from './save-environment.js';
import { preserveNative } from './native-owned.js';
import { stable } from './ledger-plan.js';
import { syncBonds } from './bonds-data.js';
import { completionText } from './model-response.js';
// Native replacement for the small Tavern Helper surface that the original 诸天 v1.1 sources call.
// Storage locations are the ones SillyTavern itself (and Tavern Helper) already use, so old saves need no conversion:
//   chat   -> chat_metadata.variables               (ST core /setvar, TH type:'chat')
//   global -> extension_settings.variables.global   (ST core /setglobalvar, TH type:'global')
//   script -> extension_settings[ID].scriptVariables (this extension; one-click import from the old TH helper script)
// Every chat write is serialized under the same Web Lock as the guarded ledger service and refuses to run
// while a previous ledger write is uncertain.
import { ID, STORAGE, LEGACY_SCRIPT_ID, LEDGER_SCHEMA, identity } from './contracts.js';
import { classifyStatus, readRoutes, resolveRoute, routeLabel } from './api-routes.js';
import { streamedCompletion, errorText } from './api-stream.js';

const clone = value => value === undefined ? undefined : structuredClone(value);
const plainObject = value => value && typeof value === 'object' && !Array.isArray(value);
const ROLE = { system: 0, user: 1, assistant: 2 };
const POSITION = { none: -1, before_prompt: 2, in_prompt: 0, in_chat: 1 };
export const NATIVE_SCRIPT_ID = 'zhutian-native-assistant';
const NOW_FROZEN = 'Trạng thái ghi kết toán trước đó không rõ, đã đóng băng mọi thao tác ghi sổ cái của cuộc trò chuyện này; vui lòng vào Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra và mở khóa sổ cái」, hoặc tải lại trang để kiểm tra.';
/** JSON round trip: what the server can store (undefined dropped, NaN → null, -0 → 0). */
const jsonNorm = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
/**
 * 1.1.4 · Đóng băng giả. Read-back after a chat-variable write: only the top-level keys THIS write changed are compared, each
 * after a JSON round trip (pure, for tests). Before 1.1.4 the whole chat_metadata.variables was compared byte for
 * byte, so a value the server cannot store as-is (undefined / NaN) or another script's variable changing in between
 * froze the chat although the 诸天 ledger was written correctly. Returns the keys that differ ([] = written).
 */
export function readbackDiff(before, next, disk) {
    const out = [];
    for (const k of new Set([...Object.keys(before || {}), ...Object.keys(next || {})])) {
        const want = stable(jsonNorm(next?.[k]));
        if (stable(jsonNorm(before?.[k])) === want) continue;
        if (stable(jsonNorm(disk?.[k])) !== want) out.push(k);
    }
    return out;
}
/** Keys whose values differ between two variable objects, after a JSON round trip (pure, for tests). */
export function variablesDiff(a, b) {
    return [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].filter(k => stable(jsonNorm(a?.[k])) !== stable(jsonNorm(b?.[k])));
}

export function parseRange(range, last) {
    if (typeof range === 'number') return [range, range];
    const text = String(range ?? `0-${last}`).replaceAll('{{lastMessageId}}', String(last)).trim();
    const m = /^(-?\d+)(?:\s*-\s*(-?\d+))?$/.exec(text);
    if (!m) throw Error('Không nhận diện được phạm vi tầng tin nhắn: ' + text);
    const norm = n => (n < 0 ? last + 1 + n : n);
    const a = norm(Number(m[1])), b = m[2] === undefined ? a : norm(Number(m[2]));
    return [Math.max(0, Math.min(a, b)), Math.min(last, Math.max(a, b))];
}
export function toThMessage(m, i) {
    return {
        message_id: i, name: m.name, role: m.is_user ? 'user' : m.is_system ? 'system' : 'assistant',
        is_hidden: !!m.is_system, message: m.mes || '', data: clone(m.variables?.[m.swipe_id ?? 0] || {}),
        extra: clone(m.extra || {}), swipe_id: m.swipe_id ?? 0, swipes: Array.isArray(m.swipes) ? [...m.swipes] : [m.mes || ''],
    };
}
/** Opt-in sentinel chosen in the API center: "use SillyTavern's currently connected main API". It is an https URL on
 *  the reserved .invalid TLD, so the original validators accept it and no real request can ever leave the browser;
 *  the bridge and the assistant fetch shim answer it through SillyTavern generateRaw. Never used unless selected. */
export const MAIN_API_HOST = 'st-main.zhutian.invalid';
export const MAIN_API_URL = `https://${MAIN_API_HOST}/v1`;
export const MAIN_API_MODEL = 'API chính hiện tại của SillyTavern';
export function isMainApi(url) { try { return new URL(String(url || '').trim()).hostname === MAIN_API_HOST; } catch { return false; } }
/** 0.9.3: SillyTavern world-info entries ({uid: entry} or an array) → the Tavern Helper style list that the original
 *  Quy tắc → Bối cảnh thế giới bổ sung page hands to normalizeBook (it reads name|comment, key|strategy.keys, content, enabled/disable,
 *  uid). Plain copies only — the ST cache object is never handed out, so nothing can write back into the book. */
export function toWorldbookEntries(entries) {
    const list = Array.isArray(entries) ? entries : plainObject(entries) ? Object.values(entries) : [];
    const str = v => (typeof v === 'string' ? v : '');
    return list.filter(plainObject)
        .map((e, i) => ({ e, i, at: Number.isFinite(Number(e.displayIndex)) ? Number(e.displayIndex) : Number.isFinite(Number(e.uid)) ? Number(e.uid) : i }))
        .sort((a, b) => a.at - b.at || a.i - b.i)
        .map(({ e, i }) => {
            const keys = (Array.isArray(e.key) ? e.key : Array.isArray(e.keys) ? e.keys : []).filter(k => typeof k === 'string');
            return { uid: e.uid ?? i, name: str(e.comment) || str(e.name), comment: str(e.comment) || str(e.name), key: [...keys], strategy: { keys: [...keys] },
                content: str(e.content), constant: !!e.constant, enabled: e.disable !== true && e.enabled !== false, disable: e.disable === true || e.enabled === false };
        });
}
/** Chat-completions endpoint normalisation shared by the status bar and the assistant. */
export function endpointOf(url) {
    const raw = String(url || '').trim().replace(/\/+$/, '');
    if (!raw) throw Error('Vui lòng điền địa chỉ API trước');
    const u = new URL(raw);
    if (u.username || u.password) throw Error('Địa chỉ API không được chứa tên người dùng hoặc mật khẩu');
    const href = u.href.replace(/\/+$/, '');   // a bare domain parses as "https://x/" — avoid "https://x//models"
    if (/\/chat\/completions$/.test(u.pathname)) return { chat: href, base: href.replace(/\/chat\/completions$/, '') };
    return { chat: href + '/chat/completions', base: href };
}

export class Bridge {
    constructor(adapter, settings) {
        this.adapter = adapter; this.settings = settings; this.listeners = new Set(); this.stops = new Set(); this.dead = false;
        this.scriptFilters = new Set();
    }
    /** fn(next, prev) → object: last look at a script-variable write before it is stored. Returns the remover. */
    addScriptFilter(fn) { this.scriptFilters.add(fn); return () => this.scriptFilters.delete(fn); }
    ctx() { return this.adapter.context(); }
    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    emit(kind) { for (const fn of this.listeners) try { fn(kind); } catch (e) { console.warn('[Chư Thiên Cầu Nối]', e); } }

    // ---------- variables ----------
    getVariables({ type = 'chat', message_id } = {}) {
        const c = this.ctx();
        if (type === 'chat') return clone(plainObject(c?.chatMetadata?.variables) ? c.chatMetadata.variables : {});
        if (type === 'global') return clone(plainObject(c?.extensionSettings?.variables?.global) ? c.extensionSettings.variables.global : {});
        if (type === 'script') return clone(this.settings.scriptVariables());
        if (type === 'message') { const m = c?.chat?.[message_id ?? c.chat.length - 1]; return clone(m?.variables?.[m.swipe_id ?? 0] || {}); }
        throw Error('Loại biến không được hỗ trợ: ' + type);
    }
    async replaceVariables(variables, options = {}) { return this.updateVariablesWith(() => clone(variables), options); }
    async insertOrAssignVariables(variables, options = {}) {
        const merge = (a, b) => { for (const [k, v] of Object.entries(b || {})) a[k] = plainObject(v) && plainObject(a[k]) ? merge(a[k], v) : clone(v); return a; };
        return this.updateVariablesWith(v => merge(v, variables), options);
    }
    async updateVariablesWith(updater, options = {}) {
        try { assertSaveEnvironment(); return await this.#updateVariablesWith(updater, options); }
        catch (error) { recordSaveFailure(error, 'Lưu biến'); throw error; }
    }
    async #updateVariablesWith(updater, { type = 'chat', verify = false, expectedIdentity, engine = false, replaceLedger = false, frameGuard } = {}) {
        if (this.dead) throw Error('Tiện ích đã tắt, chưa ghi dữ liệu.');
        frameGuard?.();
        if (type === 'chat') return this.#writeChat(updater, { verify, expectedIdentity, engine, replaceLedger, frameGuard });
        if (type === 'global') {
            const c = this.ctx(); c.extensionSettings.variables ??= {};
            const draft = clone(plainObject(c.extensionSettings.variables.global) ? c.extensionSettings.variables.global : {});
            const next = (await updater(draft)) ?? draft;
            frameGuard?.();
            if (!plainObject(next)) throw Error('Biến toàn cục phải là đối tượng, chưa ghi dữ liệu.');
            const prev = c.extensionSettings.variables.global;
            c.extensionSettings.variables.global = next;
            try { await c.saveSettingsDebounced(); } catch (e) { c.extensionSettings.variables.global = prev; throw e; }
            this.emit('global'); return clone(next);
        }
        if (type === 'script') {
            const prev = this.settings.scriptVariables(), draft = clone(prev);
            let next = (await updater(draft)) ?? draft;
            frameGuard?.();
            if (!plainObject(next)) throw Error('Biến kịch bản phải là đối tượng, chưa ghi dữ liệu.');
            // 0.9.0: e.g. the phone layout keeps the desktop window box out of a full-screen session's writes
            for (const f of this.scriptFilters) { try { const v = f(next, prev); if (plainObject(v)) next = v; } catch (e) { console.warn('[Chư Thiên] Lọc biến kịch bản', e); } }
            this.settings.setScriptVariables(next); this.emit('script'); return clone(next);
        }
        throw Error('Loại biến không hỗ trợ ghi: ' + type);
    }
    async #writeChat(updater, { verify = false, expectedIdentity, engine = false, replaceLedger = false, frameGuard } = {}) {
        const expected = identity(this.ctx());
        if (expectedIdentity && expected !== expectedIdentity) throw Error('Trò chuyện đã chuyển; chưa ghi dữ liệu.');
        if (!expected) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước; nhóm chat tạm không ghi.');
        if (this.adapter.transactions?.uncertain?.has(expected)) throw Error(NOW_FROZEN);
        assertSaveEnvironment({ requireLocks: true });
        return navigator.locks.request('zhutian-ledger:' + expected, { signal: AbortSignal.timeout(20000) }, async () => {
            frameGuard?.();
            const c = this.ctx();
            if (this.adapter.transactions?.uncertain?.has(expected)) throw Error(NOW_FROZEN);
            if (this.dead || identity(c) !== expected) throw Error('Trò chuyện đã chuyển, hủy ghi dữ liệu.');
            // 1.0: a ledger written by a newer plugin (higher structure version) is read-only here
            const schema = Number(c.chatMetadata?.[STORAGE]?.ledgerSchema) || 0;
            if (schema > LEDGER_SCHEMA) throw Error(`Sổ cái của cuộc trò chuyện này được ghi bởi phiên bản tiện ích mới hơn (phiên bản cấu trúc ${schema}, tiện ích hiện tại ${LEDGER_SCHEMA}), để tránh làm hỏng dữ liệu đã chuyển sang chỉ đọc. Vui lòng cập nhật tiện ích.`);
            const metadata = c.chatMetadata, chat = c.chat;
            const before = clone(plainObject(metadata.variables) ? metadata.variables : {});
            const stamp = stable(before);
            const guard = () => {
                frameGuard?.();
                const live = this.ctx();
                if (this.dead || identity(live) !== expected || live.chat !== chat || live.chatMetadata !== metadata) throw Error('Trò chuyện đã chuyển hoặc ngữ cảnh đã thay đổi, hủy ghi dữ liệu.');
                if (stable(plainObject(metadata.variables) ? metadata.variables : {}) !== stamp) throw Error('Sổ cái trên trang đã thay đổi trong lúc kiểm nghiệm, chưa ghi dữ liệu; vui lòng làm mới dữ liệu rồi xác nhận lại, không tự động trừ điểm lại.');
                if ((Number(metadata[STORAGE]?.ledgerSchema) || 0) > LEDGER_SCHEMA || this.adapter.transactions?.uncertain?.has(expected)) throw Error('Quyền kết toán đã thay đổi, chưa ghi dữ liệu.');
            };
            const serialized = JSON.stringify(before), draft = clone(before);
            const target = verify ? { avatar_url: c.characters?.[c.characterId]?.avatar, file_name: c.getCurrentChatId() } : null;
            const diskVariables = () => this.#diskVariables(c, target);
            if (verify) {
                if (this.adapter.isGenerating()) throw Error('Cuộc trò chuyện chính đang tạo phản hồi, vui lòng đợi kết thúc rồi mới thao tác.');
                const disk = await diskVariables();
                guard();
                if (stable(disk) !== stamp) throw Error('Sổ cái trên máy chủ khác với trang hiện tại, vui lòng tải lại trang rồi thử lại; chưa ghi dữ liệu.');
                if (identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển; chưa ghi dữ liệu.');
            }
            guard();
            const next = (await updater(draft)) ?? draft;
            guard();
            if (!plainObject(next)) throw Error('Biến trò chuyện phải là đối tượng, chưa ghi dữ liệu.');
            if (this.dead || identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển hoặc tiện ích đã tắt, hủy ghi dữ liệu.');
            if (verify && this.adapter.isGenerating()) throw Error('Cuộc trò chuyện chính bắt đầu tạo phản hồi, hủy ghi dữ liệu.');
            if (engine) preserveNative(next.诸天系统, before.诸天系统);
            if (!replaceLedger) syncBonds(next.诸天系统, before.诸天系统);
            if (JSON.stringify(next) === serialized) return clone(next);
            this.#backup(c, before, next);
            c.chatMetadata.variables = next;
            try {
                await c.saveMetadata();
                if (verify) {
                    let diff = readbackDiff(before, next, await diskVariables());
                    // 1.1.4: SillyTavern may still have had an older save of this chat in flight — save the page state
                    // (which already holds `next`) once more and read again before calling the write uncertain
                    if (diff.length) { await new Promise(r => setTimeout(r, 700)); await c.saveMetadata(); diff = readbackDiff(before, next, await diskVariables()); }
                    if (diff.length) throw Error(`Đọc lại từ máy chủ không khớp (${diff.join(', ')})`);
                }
                if (verify && identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển sau khi ghi');
            } catch (e) {
                if (verify) { this.adapter.transactions?.uncertain?.add(expected); throw Error('Trạng thái ghi chưa được xác nhận, đã đóng băng giao dịch; vui lòng tải lại trang để kiểm tra, không gửi lặp lại. ' + e.message); }
                throw e;
            }
            this.emit('chat'); this.adapter.notify();
            return clone(next);
        });
    }
    async #diskVariables(c, target) {
        const r = await fetch('/api/chats/get', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: c.getRequestHeaders(), body: JSON.stringify(target), signal: AbortSignal.timeout(15000) });
        if (!r.ok) throw Error('Không thể đối chiếu sổ cái máy chủ HTTP ' + r.status);
        const chat = await r.json();
        if (!Array.isArray(chat) || !chat[0]?.chat_metadata) throw Error('Máy chủ không trả về siêu dữ liệu trò chuyện');
        return chat[0].chat_metadata.variables || {};
    }
    /**
     * 1.1.4 · Kiểm tra và mở khóa. A frozen chat (a write whose result was unknown) is compared with the server copy: when the
     * server holds exactly what this page shows, nothing is pending and the freeze is lifted without a reload; otherwise
     * the page is stale and must be reloaded (the server copy is the truth). Never writes anything.
     * Returns { state: 'clear' | 'unfrozen' | 'differs', keys }.
     */
    async verifyFrozen() {
        const c = this.ctx(), expected = identity(c);
        if (!expected) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước.');
        const set = this.adapter.transactions?.uncertain;
        if (!set?.has(expected)) return { state: 'clear', keys: [] };
        if (this.adapter.isGenerating()) throw Error('Cuộc trò chuyện chính đang tạo phản hồi, vui lòng đợi kết thúc rồi mới kiểm tra.');
        assertSaveEnvironment({ requireLocks: true });
        return navigator.locks.request('zhutian-ledger:' + expected, { signal: AbortSignal.timeout(20000) }, async () => {
            const live = this.ctx(); if (identity(live) !== expected) throw Error('Trò chuyện đã chuyển, chưa kiểm tra.');
            const disk = await this.#diskVariables(live, { avatar_url: live.characters?.[live.characterId]?.avatar, file_name: live.getCurrentChatId() });
            if (identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển, chưa kiểm tra.');
            const keys = variablesDiff(plainObject(live.chatMetadata?.variables) ? live.chatMetadata.variables : {}, disk);
            if (keys.length) return { state: 'differs', keys };
            set.delete(expected); this.adapter.notify?.();
            return { state: 'unfrozen', keys: [] };
        });
    }
    /** Rolling pre-write snapshots of the 诸天系统 ledger so a bad AI settlement can be undone from the terminal. */
    #backup(c, before, next) {
        try {
            if (JSON.stringify(before?.诸天系统 ?? null) === JSON.stringify(next?.诸天系统 ?? null) || before?.诸天系统 === undefined) return;
            const meta = c.chatMetadata[STORAGE] = { schema: 1, ...(c.chatMetadata[STORAGE] || {}) };
            const list = Array.isArray(meta.ledgerBackups) ? meta.ledgerBackups : [];
            const last = list.at(-1);
            if (last && Date.now() - last.at < 90_000) return; // one snapshot per burst of status-bar writes
            list.push({ at: Date.now(), balance: before.诸天系统?.系统点 ?? null, floor: c.chat.length - 1, ledger: clone(before.诸天系统) });
            meta.ledgerBackups = list.slice(-5);
        } catch (e) { console.warn('[Chư Thiên Cầu Nối] Sao lưu thất bại (không ảnh hưởng việc ghi)', e); }
    }
    backups() { return clone(this.ctx()?.chatMetadata?.[STORAGE]?.ledgerBackups || []); }
    /** 1.0: a forced backup of the current ledger (import / rollback / structure upgrade), not merged into a recent one. */
    async snapshot(reason = '') {
        const c = this.ctx(), z = c?.chatMetadata?.variables?.诸天系统;
        if (!c?.chatMetadata || z === undefined) return null;
        const meta = c.chatMetadata[STORAGE] = { schema: 1, ...(c.chatMetadata[STORAGE] || {}) };
        const list = Array.isArray(meta.ledgerBackups) ? meta.ledgerBackups : [];
        const at = Math.max(Date.now(), (list.at(-1)?.at || 0) + 1);
        const item = { at, balance: z?.系统点 ?? null, floor: (c.chat?.length || 0) - 1, ledger: clone(z), ...(reason ? { reason } : {}) };
        list.push(item); meta.ledgerBackups = list.slice(-5);
        await c.saveMetadata?.();
        return item;
    }
    async restoreBackup(at) {
        const expected = identity(this.ctx()), before = JSON.stringify(this.getVariables({ type: 'chat' }));
        const item = this.backups().find(x => x.at === at);
        if (!item) throw Error('Bản sao lưu không tồn tại.');
        // 1.0: the state before the rollback is always backed up (it used to be skipped within 90 s of another write)
        const pre = await this.snapshot('Trước khi hoàn tác');
        if (!expected || identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển trong lúc hoàn tác, chưa ghi dữ liệu.');
        await this.updateVariablesWith(v => { if (JSON.stringify(v) !== before) throw Error('Sổ cái đã thay đổi sau khi sao lưu, vui lòng xem trước lại thao tác hoàn tác.'); v.诸天系统 = clone(item.ledger); return v; }, { verify: true, expectedIdentity: expected, replaceLedger: true });
        if (identity(this.ctx()) !== expected) throw Error('Trò chuyện đã chuyển sau khi hoàn tác, vui lòng quay lại cuộc trò chuyện gốc để kiểm tra.');
        const c = this.ctx(); const meta = c.chatMetadata[STORAGE];
        meta.ledgerBackups = (meta.ledgerBackups || []).filter(x => x.at < at || (pre && x.at === pre.at));
        await c.saveMetadata();
    }

    // ---------- messages ----------
    getLastMessageId() { return (this.ctx()?.chat?.length ?? 0) - 1; }
    getChatMessages(range, { include_swipes = false } = {}) {
        const chat = this.ctx()?.chat || [], last = chat.length - 1;
        if (last < 0) return [];
        const [a, b] = parseRange(range, last), out = [];
        for (let i = a; i <= b; i++) { const m = toThMessage(chat[i], i); if (!include_swipes) delete m.swipes; out.push(m); }
        return out;
    }

    // ---------- prompts ----------
    injectPrompts(list) {
        const c = this.ctx();
        for (const p of list || []) {
            c.setExtensionPrompt(`${ID}/${p.id}`, String(p.content ?? ''), POSITION[p.position] ?? 1, Number(p.depth) || 0, !!p.should_scan, ROLE[p.role] ?? 0, typeof p.filter === 'function' ? p.filter : null);
        }
    }
    /** 1.0: what SillyTavern really holds for one of our prompts (it empties them all when a chat is (re)loaded). */
    livePrompt(id) { try { return String(this.ctx()?.extensionPrompts?.[`${ID}/${id}`]?.value ?? ''); } catch { return ''; } }
    uninjectPrompts(ids) { const c = this.ctx(); for (const id of ids || []) c?.setExtensionPrompt?.(`${ID}/${id}`, '', 1, 0, false, 0); }

    // ---------- worldbooks (read-only; 0.9.3) ----------
    loadWorldInfoModule() { return import('/scripts/world-info.js'); }
    prefetchWorldbooks() {
        if (this.wbLoading) return this.wbLoading;
        this.wbLoading = (async () => {
            try { this.wiModule = await this.loadWorldInfoModule(); } catch { this.wiModule = null; }
            if (Array.isArray(this.wiModule?.world_names)) { this.wbNames = [...this.wiModule.world_names]; return; }
            try {
                const r = await fetch('/api/settings/get', { method: 'POST', headers: this.ctx().getRequestHeaders(), credentials: 'same-origin', cache: 'no-store', body: '{}' });
                const j = r.ok ? await r.json() : null;
                if (Array.isArray(j?.world_names)) this.wbNames = [...j.world_names];
            } catch (e) { console.warn('[Chư Thiên Cầu Nối] Đọc danh sách Sách Thế Giới thất bại', e); }
            if (!this.wbNames) this.wbFailed = true;
        })().finally(() => { this.wbLoading = null; });
        return this.wbLoading;
    }
    getWorldbookNames() {
        try { const viaCtx = this.ctx()?.getWorldInfoNames?.(); if (Array.isArray(viaCtx)) return viaCtx.filter(x => typeof x === 'string'); } catch { /* older context */ }
        const live = this.wiModule?.world_names;
        const list = Array.isArray(live) ? live : this.wbNames;
        if (!Array.isArray(live)) this.prefetchWorldbooks();     // keep the fallback copy fresh for the next click
        if (Array.isArray(list)) return list.filter(x => typeof x === 'string');
        if (this.wbFailed) { this.wbFailed = false; throw Error('Không đọc được danh sách Sách Thế Giới (máy chủ không cung cấp mô-đun Sách Thế Giới hoặc giao diện cài đặt); vẫn có thể dùng quy tắc tích hợp sẵn'); }
        throw Error('Đang đọc danh sách Sách Thế Giới, vui lòng bấm lại 「Đọc danh mục sách」 sau 1 giây');
    }
    async getWorldbook(name) {
        const n = String(name ?? '').trim(); if (!n) throw Error('Vui lòng chọn sách bối cảnh trước');
        const c = this.ctx(); let data = null;
        if (typeof c?.loadWorldInfo === 'function') data = await c.loadWorldInfo(n);
        else {
            if (!this.wiModule) await this.prefetchWorldbooks();
            if (typeof this.wiModule?.loadWorldInfo === 'function') data = await this.wiModule.loadWorldInfo(n);
            else {
                const r = await fetch('/api/worldinfo/get', { method: 'POST', headers: c.getRequestHeaders(), credentials: 'same-origin', cache: 'no-store', body: JSON.stringify({ name: n }) });
                data = r.ok ? await r.json() : null;
            }
        }
        const missing = Error(`Không đọc được Sách Thế Giới 「${n}」 (có thể đã bị xóa hoặc đổi tên)`);
        if (!data || typeof data.entries !== 'object' || data.entries === null) throw missing;
        // SillyTavern answers a missing file with an empty dummy book ({entries: {}}): tell that apart from a real empty book.
        if (!Object.keys(data.entries).length) { let names = null; try { names = this.getWorldbookNames(); } catch { /* list unknown */ } if (names && !names.includes(n)) throw missing; }
        return toWorldbookEntries(data.entries);
    }

    // ---------- events ----------
    get events() { return this.ctx()?.eventTypes || {}; }
    eventOn(type, fn) {
        const c = this.ctx(); if (!type) return { stop() {} };
        c.eventSource.on(type, fn);
        const handle = { stop: () => { c.eventSource.removeListener(type, fn); this.stops.delete(handle); } };
        this.stops.add(handle); return handle;
    }

    // ---------- generation ----------
    /** OpenAI-compatible request: direct first (identical to the original), then through the user's own ST server if CORS blocks. */
    async customChat(config, messages, { signal, maxTokens = 1800, temperature, plain = false } = {}) {
        const cap0 = Number(config.maxTokens); if (Number.isInteger(cap0) && cap0 >= 64 && cap0 <= 65536) maxTokens = cap0;
        if (isMainApi(config.url || config.apiurl)) return { text: await this.mainChat(messages, { maxTokens, signal }), via: 'st-main' };
        const { chat, base } = endpointOf(config.url || config.apiurl);
        const model = String(config.model || '').trim();
        if (!model) throw Error('Vui lòng thiết lập tên mô hình cho API độc lập trước');
        const cap = Number(config.maxTokens); if (Number.isInteger(cap) && cap >= 64 && cap <= 65536) maxTokens = cap;
        const body = { model, messages, stream: false, max_tokens: maxTokens, ...(temperature === undefined ? (plain ? {} : { temperature: 0 }) : { temperature }) };
        // 0.8.4: streamed on both paths (see api-stream.js) — the non-stream relay was where the 502s came from.
        const send = b => fetch(chat, { method: 'POST', redirect: 'error', credentials: 'omit', cache: 'no-store', signal, headers: { 'Content-Type': 'application/json', ...(config.key ? { Authorization: 'Bearer ' + config.key } : {}) }, body: JSON.stringify(b) });
        const relay = b => fetch('/api/backends/chat-completions/generate', { method: 'POST', signal, headers: this.ctx().getRequestHeaders(), body: JSON.stringify({
            chat_completion_source: 'custom', custom_url: base, model, messages, stream: !!b.stream, max_tokens: maxTokens, temperature: body.temperature ?? 1,
            custom_include_headers: config.key ? JSON.stringify({ Authorization: 'Bearer ' + config.key }) : '',
        }) });
        let response, direct = true;
        try { response = await streamedCompletion(send, body); }
        catch (error) {
            if (signal?.aborted) throw Error('Yêu cầu đã bị hủy hoặc quá thời gian chờ');
            direct = false;
            try { response = await streamedCompletion(relay, body); }
            catch (e2) { if (signal?.aborted) throw Error('Yêu cầu đã bị hủy hoặc quá thời gian chờ'); throw Error('Kết nối mạng thất bại: kết nối trực tiếp từ trình duyệt bị chặn, chuyển tiếp qua máy chủ SillyTavern cũng thất bại (' + (e2?.message || e2) + ')'); }
        }
        const data = await response.json().catch(() => null);
        if (!response.ok) throw Error(`${direct ? 'API độc lập' : 'Chuyển tiếp SillyTavern'} trả về HTTP ${response.status}${data?.error?.message ? ' · ' + data.error.message : ''}`);
        if (data?.error) throw Error('Lỗi cổng kết nối: ' + (data.error.message || JSON.stringify(data.error)).slice(0, 200));
        // 1.1.1: why the answer ended (Tạo hàng hóa tells a cut-off JSON from a wrong one and shrinks its batch)
        this.lastFinish = { reason: String(data?.choices?.[0]?.finish_reason || ''), maxTokens, at: Date.now() };
        let text;
        try { text = completionText(data, maxTokens); }
        catch (e) {
            // One bounded retry, only for an empty truncated response. An explicit configured cap is never exceeded.
            if (e.code !== 'EMPTY_LENGTH' || config.maxTokens || maxTokens >= 8192) throw e;
            const next = Math.min(8192, Math.max(2048, maxTokens * 2));
            globalThis.toastr?.info?.(`Chưa trả về chính văn; chỉ thử lại 1 lần với hạn mức ${next} tokens (nhà cung cấp có thể tính phí)`, 'Chư Thiên · Mô hình');
            return this.customChat({ ...config, maxTokens: next }, messages, { signal, maxTokens: next, temperature, plain });
        }
        return { text, via: direct ? 'direct' : 'st-proxy' };
    }
    /** Model ids for an OpenAI-compatible base URL. Direct first (skipped when the caller already saw the browser block
     *  it), then the user's own SillyTavern server (not subject to CORS). Errors carry a readable reason and .status. */
    async listModels(url, key, { direct = true, signal } = {}) {
        if (isMainApi(url)) return [MAIN_API_MODEL];
        const { base } = endpointOf(url); let error = null;
        const pick = d => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.models) ? d.models : Array.isArray(d?.data?.models) ? d.data.models : [])
            .map(x => typeof x === 'string' ? x : x?.id || x?.name).filter(Boolean);
        const fail = (msg, status) => Object.assign(Error(msg), { status });
        const bare = !/\/v\d+[a-z]*$/i.test(base);
        if (direct) for (const u of [base + '/models', ...(bare ? [base + '/v1/models'] : [])]) {
            try {
                const r = await fetch(u, { headers: key ? { Authorization: 'Bearer ' + key } : {}, credentials: 'omit', cache: 'no-store', signal: signal || AbortSignal.timeout(8000) });
                if (!r.ok) { error = fail(`HTTP ${r.status} · ${errorText(await r.text().catch(() => ''), r.status)}`, r.status); continue; }
                const list = pick(await r.json().catch(() => null)); if (list.length) return list;
            } catch (e) { if (signal?.aborted) throw e; error = e; }
        }
        // ST appends /models to custom_url itself: try the base as written and, for a bare domain, base + /v1.
        let lastStatus = 0;
        for (const custom of [base, ...(bare ? [base + '/v1'] : [])]) {
            let r = null;
            try { r = await fetch('/api/backends/chat-completions/status', { method: 'POST', signal, headers: this.ctx().getRequestHeaders(), body: JSON.stringify({ chat_completion_source: 'custom', custom_url: custom, custom_include_headers: key ? JSON.stringify({ Authorization: 'Bearer ' + key }) : '' }) }); }
            catch (e) { if (signal?.aborted) throw e; error = fail('Không kết nối được máy chủ SillyTavern (' + (e?.message || e) + ')', 502); continue; }
            const t = await r.text().catch(() => ''); let d = null; try { d = JSON.parse(t); } catch { /* not json */ }
            if (!r.ok) {
                lastStatus = r.status;
                error = r.status === 403 ? fail('Máy chủ SillyTavern từ chối yêu cầu chuyển tiếp (HTTP 403, thường do phiên đăng nhập/CSRF hết hạn: vui lòng làm mới trang SillyTavern rồi thử lại)', 403)
                    : fail(`Chuyển tiếp qua máy chủ SillyTavern: nhà cung cấp trả về HTTP ${r.status}${r.status === 401 ? ' · Key không hợp lệ hoặc bị thiếu' : r.status === 404 ? ' · Sai địa chỉ (kiểm tra xem có thiếu hoặc thừa /v1 không)' : ''}`, r.status);
                continue;
            }
            const list = pick(d); if (list.length) return list;
            if (d?.error) error = fail('Chuyển tiếp qua máy chủ SillyTavern vẫn không lấy được danh sách mô hình: ' + (typeof d.error === 'string' ? d.error : d.error?.message || 'vui lòng kiểm tra địa chỉ và Key'), 502);
            else error = fail('Nhà cung cấp trả về danh sách mô hình trống: bạn có thể tự điền tên mô hình thủ công', 404);
        }
        throw error || fail('Không lấy được danh sách mô hình', lastStatus || 502);
    }
    /** SillyTavern's currently connected main API (generateRaw), for the API center's explicit "API chính của SillyTavern" choice and
     *  for status-bar calls without an independent API. Messages keep their roles (system prompts stay separate). */
    async mainChat(messages, { maxTokens, signal } = {}) {
        const raw = this.adapter.host?.generateRaw;
        if (typeof raw !== 'function') throw Error('SillyTavern hiện tại không có generateRaw, không thể sử dụng API chính');
        if (signal?.aborted) throw Error('Yêu cầu đã bị hủy hoặc quá thời gian chờ');
        const list = (messages || []).filter(m => m && typeof m.content === 'string' && m.content);
        const system = list.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
        const rest = list.filter(m => m.role !== 'system');
        const options = { prompt: rest.length === 1 && rest[0].role === 'user' ? rest[0].content : rest, systemPrompt: system };
        if (Number.isInteger(Number(maxTokens)) && Number(maxTokens) > 0) options.responseLength = Number(maxTokens);
        const text = await raw(options);
        if (typeof text !== 'string' || !text.trim()) throw Error('API chính của SillyTavern không trả về nội dung văn bản');
        return text;
    }
    /** Subset of Tavern Helper generateRaw used by the 3.1 status bar (AI nhập hàng / rút thẻ / ước nguyện / thiên nhãn …).
     *  The status bar passes its limits inside custom_api (max_tokens, temperature 0.7) — both are honoured. */
    async generateRaw({ user_input = '', ordered_prompts, custom_api, max_tokens, route = '', own_limit = false } = {}) {
        const prompts = Array.isArray(ordered_prompts) ? ordered_prompts : [{ role: 'system', content: '' }, 'user_input'];
        const messages = prompts.map(p => p === 'user_input' ? { role: 'user', content: String(user_input) } : (p && typeof p === 'object' && typeof p.content === 'string' ? { role: p.role || 'system', content: p.content } : null)).filter(m => m && m.content);
        let limit = Number(custom_api?.max_tokens) || Number(max_tokens) || 4096;
        // 1.0 API theo tính năng: the status bar still builds custom_api from the default connection; a feature with its own
        // route (preset / own config / API chính của SillyTavern) is pointed there on the way out. No route → unchanged.
        const id = route || classifyStatus(messages.find(m => m.role === 'system')?.content);
        const over = id ? resolveRoute(readRoutes(this), id) : null;
        const defaultCap = Number(this.getVariables({ type: 'global' })?.诸天系统_API?.maxTokens);
        // 1.1.4: `own_limit` — the feature's own explicit limit (Nhóm chat → Việc nhóm → Giới hạn đầu ra) beats the default connection's cap;
        // a per-feature route that sets its own maxTokens still wins over both
        const configuredCap = Number(over?.maxTokens) || (!own_limit && Number.isInteger(defaultCap) && defaultCap >= 64 && defaultCap <= 65536 ? defaultCap : 0);
        if (configuredCap) limit = configuredCap;
        if (over) {
            this.lastRoute = { id, via: over.via, at: Date.now() };
            const tag = e => Object.assign(Error(`${e?.message || e} (${routeLabel(id)} đang dùng ${over.via})`), { status: e?.status });
            try {
                if (over.maxTokens) limit = over.maxTokens;
                if (over.main) return await this.mainChat(messages, { maxTokens: limit });
                custom_api = { ...(custom_api || {}), apiurl: over.url, key: over.key, model: over.model };
            } catch (e) { throw tag(e); }
            if (custom_api.apiurl && !isMainApi(custom_api.apiurl)) {
                const control = new AbortController(), timer = setTimeout(() => control.abort(), 90000);
                const temperature = Number.isFinite(Number(custom_api.temperature)) ? Number(custom_api.temperature) : undefined;
                try { return (await this.customChat({ url: custom_api.apiurl, key: custom_api.key, model: custom_api.model, ...(configuredCap ? { maxTokens: configuredCap } : {}) }, messages, { signal: control.signal, maxTokens: limit, temperature, plain: temperature === undefined })).text; }
                catch (e) { throw tag(e); } finally { clearTimeout(timer); }
            }
        }
        if (custom_api?.apiurl && !isMainApi(custom_api.apiurl)) {
            const control = new AbortController(), timer = setTimeout(() => control.abort(), 90000);
            const temperature = Number.isFinite(Number(custom_api.temperature)) ? Number(custom_api.temperature) : undefined;
            try { return (await this.customChat({ url: custom_api.apiurl, key: custom_api.key, model: custom_api.model, ...(configuredCap ? { maxTokens: configuredCap } : {}) }, messages, { signal: control.signal, maxTokens: limit, temperature, plain: temperature === undefined })).text; }
            finally { clearTimeout(timer); }
        }
        return this.mainChat(messages, { maxTokens: limit });
    }

    // ---------- Tavern Helper script storage import (old saves) ----------
    /** Finds the old v1.1 helper script's stored data inside Tavern Helper settings, read-only. */
    findLegacyScriptData() {
        const seen = new Set(), stack = [this.ctx()?.extensionSettings];
        let steps = 0;
        while (stack.length && steps++ < 20000) {
            const x = stack.pop();
            if (!x || typeof x !== 'object' || seen.has(x)) continue; seen.add(x);
            if (x.id === LEGACY_SCRIPT_ID && plainObject(x.data)) return clone(x.data);
            for (const v of Object.values(x)) if (v && typeof v === 'object') stack.push(v);
        }
        for (const ch of this.ctx()?.characters || []) {
            const stack2 = [ch?.data?.extensions]; const seen2 = new Set();
            while (stack2.length) { const x = stack2.pop(); if (!x || typeof x !== 'object' || seen2.has(x)) continue; seen2.add(x); if (x.id === LEGACY_SCRIPT_ID && plainObject(x.data)) return clone(x.data); for (const v of Object.values(x)) if (v && typeof v === 'object') stack2.push(v); }
        }
        return null;
    }

    /** Frame capabilities belong to the creating chat/context and are permanently revoked on release or switch. */
    frameApi(messageId, lastId) {
        const self = this, c = this.ctx(), expected = identity(c), chat = c?.chat, metadata = c?.chatMetadata;
        let active = true, released = false, stop;
        const dispose = () => { active = false; stop?.(); stop = null; };
        const guard = () => {
            const live = self.ctx();
            if (!active || self.dead || identity(live) !== expected || live?.chat !== chat || live?.chatMetadata !== metadata) {
                dispose(); throw Error('Trang thiết bị đầu cuối đã hết hiệu lực: cuộc trò chuyện đã chuyển, tải lại hoặc trang đã đóng, vui lòng mở lại thiết bị đầu cuối trong cuộc trò chuyện hiện tại.');
            }
        };
        const read = fn => { guard(); return fn(); };
        // 1.1.1 audit: a request that *starts* after the host released the frame (it already left the DOM) does nothing
        // and never settles, so the original code's uncaught background writes cannot surface as page errors. Requests
        // from a still-mounted but stale frame, or interrupted mid-flight, keep rejecting.
        const request = fn => released ? new Promise(() => {}) : (async () => { guard(); const result = await fn(); guard(); return result; })();
        // The guard also runs inside the writer after lock acquisition and after an async updater.
        const options = o => ({ ...o, engine: true, expectedIdentity: expected, frameGuard: guard });
        const api = {
            getVariables: o => read(() => self.getVariables(o)),
            replaceVariables: (v, o) => request(() => self.replaceVariables(v, options(o))),
            updateVariablesWith: (fn, o) => request(() => self.updateVariablesWith(fn, options(o))),
            insertOrAssignVariables: (v, o) => request(() => self.insertOrAssignVariables(v, options(o))),
            getCurrentMessageId: () => read(() => messageId()),
            getLastMessageId: () => read(() => (typeof lastId === 'function' ? lastId() : self.getLastMessageId())),
            generateRaw: o => request(() => self.generateRaw(o)),
            listModels: (u, k) => request(() => self.listModels(u, k)),
        };
        Object.defineProperties(api, { dispose: { value: () => { released = true; dispose(); } }, isCurrent: { value: () => { try { guard(); return true; } catch { return false; } } } });
        stop = this.adapter.subscribe?.(() => { api.isCurrent(); });
        return api;
    }
    dispose() { this.dead = true; for (const s of [...this.stops]) s.stop(); this.listeners.clear(); }
}
