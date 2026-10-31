// Quản lý phụ trợ + Phụ trợ tự tạo (0.5.0).
//  * 6 phụ trợ gốc có thể bật/tắt theo từng cuộc trò chuyện: ẩn đi + không thể dùng trong trang bộ máy, đồng thời báo cho mô hình không được sử dụng chúng.
//  * Phụ trợ do người dùng tự viết nằm trong kho cục bộ (localStorage, dùng chung cho mọi cuộc trò chuyện, xuất/nhập .json); mỗi cuộc trò chuyện bật
//    tập hợp con của riêng mình. Các phụ trợ đang bật được tiêm dưới dạng “Phụ trợ tự tạo Ký chủ đã trang bị”; phụ trợ chủ động có nút Phát động sẽ trừ cái giá phải trả
//    thông qua sổ cái (ghi → đọc ngược lại) trước khi hành động được ghi vào ô nhập liệu.
import { STORAGE, inert } from './contracts.js';
import { esc, fmtNum } from './hub.js';
import { DEFAULT_OFF } from './worldbook.js';
import { scrollWithin, resetPageScroll } from './page-scroll.js';
import { gradeLabel, normGradeKey } from './ledger-ops.js';

export const BUILTIN = ['无限口袋', '诸天打手', '洞察之眼', '分身派遣', '随身洞天', '万物熔炉'];
export const BUILTIN_LABELS = Object.freeze({ 无限口袋: 'Túi Không Gian Vô Hạn', 诸天打手: 'Tay Đấm Chư Thiên', 洞察之眼: 'Mắt Động Sát', 分身派遣: 'Phái Phân Thân', 随身洞天: 'Động Thiên Tùy Thân', 万物熔炉: 'Lò Vạn Vật' });
export const GRADES = ['凡品', '灵品', '仙品', '神品', '禁忌'];
export const RES = ['天命印记', '血脉结晶', '因果筹码', '名望', '岁月沉淀'];
export const RES_LABELS = Object.freeze({ 天命印记: 'Ấn Ký Thiên Mệnh', 血脉结晶: 'Kết Tinh Huyết Mạch', 因果筹码: 'Phỉnh Nhân Quả', 名望: 'Danh vọng', 岁月沉淀: 'Lắng Đọng Năm Tháng' });
const builtinLabel = k => BUILTIN_LABELS[k] || k;
const resLabel = k => RES_LABELS[k] || k;
const normResKey = v => {
    const s = String(v ?? '').trim();
    if (RES.includes(s)) return s;
    const low = s.toLowerCase();
    for (const [k, lbl] of Object.entries(RES_LABELS)) if (lbl.toLowerCase() === low) return k;
    return RES[0];
};
const LIB_KEY = 'zhutian.customPlugins.v1';
const TYPES = { passive: 'Bị động', active: 'Chủ động', daily: 'Số lần mỗi ngày' };
const clampText = (s, n) => inert(String(s ?? '')).trim().slice(0, n);
const today = () => new Date().toLocaleDateString('sv-SE');

/** Normalises one library entry (also used for imports). Returns null when unusable. */
export function normalizePlugin(p) {
    if (!p || typeof p !== 'object') return null;
    const name = clampText(p.name, 24); if (!name) return null;
    const type = TYPES[p.type] ? p.type : 'passive';
    const cost = p.cost && typeof p.cost === 'object' ? p.cost : {};
    const kind = ['none', 'points', 'resource'].includes(cost.kind) ? cost.kind : 'none';
    const gKey = normGradeKey(p.grade);
    return {
        id: /^[a-z0-9-]{4,40}$/.test(String(p.id || '')) ? p.id : 'p-' + Math.random().toString(36).slice(2, 10),
        name, grade: GRADES.includes(gKey) ? gKey : '凡品', type,
        daily: Math.max(1, Math.min(99, Math.floor(Number(p.daily) || 1))),
        rule: clampText(p.rule, 600),
        cost: { kind, res: normResKey(cost.res), amount: Math.max(0, Math.min(1e12, Math.floor(Number(cost.amount) || 0))), cooldown: Math.max(0, Math.min(999, Math.floor(Number(cost.cooldown) || 0))) },
        inject: p.inject !== false,
    };
}
/** Prompt text for the enabled set (pure, unit-tested). */
export function pluginPrompt(enabled, off) {
    const lines = [];
    if (enabled.length) {
        lines.push('【Hệ Thống Chư Thiên · Phụ trợ tự tạo Ký chủ đã trang bị】Các phụ trợ dưới đây là năng lực thực sự mà Ký chủ sở hữu, trong cốt truyện có thể phát huy hiệu lực theo quy tắc; phụ trợ chủ động chỉ phát huy hiệu lực sau khi Ký chủ rõ ràng “Phát động”, cái giá phải trả đã được hệ thống khấu trừ, đừng trừ phí lặp lại.');
        for (const p of enabled) {
            const cost = p.cost.kind === 'points' ? `mỗi lần ${p.cost.amount} Điểm Hệ Thống` : p.cost.kind === 'resource' ? `mỗi lần ${p.cost.amount} ${resLabel(p.cost.res)}` : 'không có cái giá bổ sung';
            const limit = p.type === 'daily' ? `, mỗi ngày ${p.daily} lần` : p.cost.cooldown ? `, hồi chiêu ${p.cost.cooldown} lượt` : '';
            lines.push(`- ${p.name} (${gradeLabel(p.grade)}·${TYPES[p.type]}${limit}; ${cost}): ${p.rule || '(Chưa viết quy tắc)'}`);
        }
    }
    if (off.length) lines.push(`【Hệ Thống Chư Thiên · Phụ trợ chưa trang bị】Ký chủ hiện đã tắt: ${off.map(builtinLabel).join(', ')}. Trong cốt truyện không được xuất hiện hoặc sử dụng các phụ trợ này.`);
    return lines.join('\n');
}

export class HubPlugins {
    constructor(app) { this.app = app; this.disposers = []; this.editing = null; this.mods = null; this.modOff = new Set(); }
    get hub() { return this.app.hub; }
    get ctx() { return this.app.adapter.context(); }
    start() {
        const hub = this.hub; if (!hub) return this;
        hub.register('plugmgr', { title: 'Quản lý phụ trợ', render: el => this.render(el) });
        const prevTab = hub.onEngineTab, prevEngine = hub.onEngine;
        hub.onEngineTab = (n, tools) => { prevTab?.(n, tools); this.strip(n, tools); };
        hub.onEngine = (frame, doc) => { prevEngine?.(frame, doc); this.applyEngine(doc); };
        this.disposers.push(this.app.adapter.subscribe(() => this.syncPrompt()));
        if (this.app.settings?.onChange) this.disposers.push(this.app.settings.onChange(k => { if (k === 'modules') { this.lastPrompt = null; this.syncPrompt(); } }));
        this.syncPrompt();
        this.refreshModules().catch(() => {});
        return this;
    }
    /** 0.8.4 强力模块 (worldbook entries, book-wide). Off modules are hidden in the engine and listed as 未装载. */
    async refreshModules() {
        const r = await this.app.features?.moduleStates?.(); if (!r) return null;
        this.mods = r; this.modOff = new Set(r.list.filter(m => m.on === false).map(m => m.name));
        this.lastPrompt = null; this.syncPrompt(); this.applyEngine(this.hub?.engineFrame?.contentDocument);
        return r;
    }
    modulesHtml() {
        const r = this.mods;
        if (!r) return '<div class="zt-note">Đang đọc Sách Thế Giới…</div>';
        if (!r.exists) return '<div class="zt-note">Chưa cài đặt Sách Thế Giới “Hệ Thống Mạnh Nhất Chư Thiên Vạn Giới” (Cài đặt → Cài đặt / Gắn kết Sách Thế Giới). Khi cài đặt mới, Thần Hào Tiêu Xài và Tay Đấm Chư Thiên mặc định sẽ tắt.</div>';
        const risky = r.list.filter(m => !m.def && m.on);
        return `${risky.length ? `<div class="zt-card zt-note" style="margin:0 0 8px">${risky.map(m => esc(m.name)).join(', ')} hiện đang bật (bản v1.1 cũ mặc định tiêm thường trực), sẽ phá vỡ nghiêm trọng cân bằng chỉ số. Khuyên bạn nên tắt.<div class="zt-actions" style="margin-top:6px"><button type="button" class="zt-btn primary small" data-mods-balance>Một chạm cân bằng: Tắt ${risky.map(m => esc(m.name)).join(', ')}</button></div></div>` : ''}
${r.list.map(m => `<div class="zt-row"><span>${esc(m.name)}${m.strong ? ' <span class="zt-chip">Mạnh</span>' : ''}<span class="zt-desc">${esc(m.desc)}${m.exists ? '' : ' · Trong Sách Thế Giới không có mục này'}</span></span><label class="zt-switch"><input type="checkbox" data-module="${esc(m.comment)}" ${m.on ? 'checked' : ''} ${m.exists ? '' : 'disabled'} aria-label="${esc(m.name)}"><i></i></label></div>`).join('')}`;
    }
    // ---------- storage ----------
    library() { try { const v = JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); return Array.isArray(v) ? v.map(normalizePlugin).filter(Boolean) : []; } catch { return []; } }
    saveLibrary(list) { localStorage.setItem(LIB_KEY, JSON.stringify(list.map(normalizePlugin).filter(Boolean))); }
    chatState() { const m = this.ctx?.chatMetadata?.[STORAGE]?.plugins; return { off: Array.isArray(m?.off) ? m.off.filter(x => BUILTIN.includes(x)) : [], on: Array.isArray(m?.on) ? m.on : [], uses: m?.uses && typeof m.uses === 'object' ? m.uses : {} }; }
    async saveChatState(next) {
        const c = this.ctx; if (!this.app.adapter.currentIdentity()) throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước.');
        c.chatMetadata[STORAGE] = { schema: 1, ...(c.chatMetadata[STORAGE] || {}), plugins: next };
        await c.saveMetadata();
        this.syncPrompt(); this.applyEngine(this.hub?.engineFrame?.contentDocument);
    }
    enabled() { const st = this.chatState(), lib = this.library(); return lib.filter(p => st.on.includes(p.id)); }
    // ---------- effects ----------
    syncPrompt() {
        try {
            // 1.1.5 功能开关 → 自拟外挂 off: no prompt
            const zt = this.app.settings?.get('modules')?.plugins !== false && !!this.app.adapter.ledger?.() && !!this.app.adapter.currentIdentity();
            const st = zt ? this.chatState() : { off: [] };
            const text = zt ? pluginPrompt(this.enabled().filter(p => p.inject), [...new Set([...st.off, ...this.modOff])]) : '';
            // 1.0: SillyTavern empties its extension prompts when a chat is (re)loaded — compare with what is really there
            if (text === this.lastPrompt && (this.app.bridge.livePrompt?.('plugins') ?? text) === text) return; this.lastPrompt = text;
            this.app.bridge.injectPrompts([{ id: 'plugins', content: text, position: 'in_chat', depth: 4, role: 'system' }]);
        } catch (e) { console.warn('[Phụ Trợ Chư Thiên] Tiêm lời nhắc thất bại', e); }
    }
    applyEngine(doc) {
        if (!doc) return; const off = [...this.chatState().off, ...this.modOff];
        doc.querySelectorAll('.shenhao-card').forEach(el => el.setAttribute('data-zt-off', (this.modOff.has('神豪挥霍') || this.modOff.has('Thần Hào Tiêu Xài')) ? '1' : '0'));
        BUILTIN.forEach((name, i) => {
            const hide = (off.includes(name) || off.includes(builtinLabel(name))) ? '1' : '0';
            doc.querySelectorAll(`[data-ui-anchor="zt-ui-section-7-${i}"],[data-ui-jump="zt-ui-section-7-${i}"]`).forEach(el => el.setAttribute('data-zt-off', hide));
        });
    }
    strip(n, tools) {
        if (n !== 7) { if (tools.dataset.owner === 'plugins') { tools.innerHTML = ''; delete tools.dataset.owner; } return; }
        tools.dataset.owner = 'plugins';
        const list = this.enabled(), st = this.chatState();
        tools.innerHTML = `<div class="zt-plug-strip"><span class="zt-plug-title">Phụ trợ tự tạo</span>${list.map(p => `<span class="zt-plug-card"><span>${esc(p.name)}<span class="zt-grade" data-g="${p.grade}">${gradeLabel(p.grade)}</span></span>${p.type === 'passive' ? '<small>Bị động · Đang có hiệu lực</small>' : `<button type="button" class="zt-btn small primary" data-plug-use="${p.id}">Phát động${this.costLabel(p)}</button>`}</span>`).join('') || '<span class="zt-note">Chưa bật phụ trợ tự tạo nào</span>'}${st.off.length ? `<span class="zt-chip">Đã tắt ${st.off.length} phụ trợ gốc</span>` : ''}<button type="button" class="zt-btn small" data-plug-new style="margin-left:auto">＋ Phụ trợ tự tạo</button><button type="button" class="zt-btn small" data-plug-manage>Quản lý phụ trợ ›</button></div>`;
        tools.onclick = e => {
            if (e.target.closest('[data-plug-manage]')) return this.hub.go('plugmgr');
            if (e.target.closest('[data-plug-new]')) return this.openEditor();
            const u = e.target.closest('[data-plug-use]'); if (u) this.activate(u.dataset.plugUse, u);
        };
    }
    /** 0.8.0: “＋ 自拟外挂” — opens 外挂管理 with an empty editor focused (the page is also in the 能力 navigation). */
    openEditor() {
        this.editing = null; this.hub.go('plugmgr');
        const el = this.hub.pages.get('plugmgr')?.el, ed = el?.querySelector('#zt-plug-editor');
        if (ed) scrollWithin(ed, { block: 'start' }); resetPageScroll(); ed?.querySelector('[data-f="name"]')?.focus({ preventScroll: true });
    }
    costLabel(p) { return p.cost.kind === 'points' ? ` · ${fmtNum(p.cost.amount)} điểm` : p.cost.kind === 'resource' ? ` · ${p.cost.amount} ${resLabel(p.cost.res)}` : ''; }
    /** Charges the cost through the ledger, reads it back, then writes the action into the input box. */
    async activate(id, btn) {
        const p = this.enabled().find(x => x.id === id), t = globalThis.toastr;
        try {
            if (!p) throw Error('Phụ trợ chưa được bật.');
            if (p.type === 'passive') throw Error('Phụ trợ bị động không cần phát động.');
            if (this.app.adapter.isGenerating()) throw Error('Cuộc trò chuyện chính đang tạo phản hồi, vui lòng phát động sau.');
            const st = this.chatState(), use = st.uses[p.id] || {};
            const turn = Number(this.app.adapter.ledger()?.回合数) || 0;
            if (p.type === 'daily' && use.day === today() && (use.n || 0) >= p.daily) throw Error(`Số lần dùng hôm nay đã hết (${p.daily}/${p.daily}).`);
            if (p.type === 'active' && p.cost.cooldown && use.turn !== undefined && turn - use.turn < p.cost.cooldown) throw Error(`Đang hồi chiêu: còn cần ${p.cost.cooldown - (turn - use.turn)} lượt.`);
            if (btn) btn.disabled = true;
            let expect = null;
            if (p.cost.kind !== 'none' && p.cost.amount > 0) {
                await this.app.bridge.updateVariablesWith(v => {
                    const s = v.诸天系统; if (!s || typeof s !== 'object') throw Error('Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên.');
                    if (p.cost.kind === 'points') { const have = Number(s.系统点) || 0; if (have < p.cost.amount) throw Error(`Điểm Hệ Thống không đủ: cần ${fmtNum(p.cost.amount)}, hiện có ${fmtNum(have)}.`); s.系统点 = have - p.cost.amount; s.累计消费 = (Number(s.累计消费) || 0) + p.cost.amount; s.界面记账时间 = Date.now(); expect = ['系统点', s.系统点]; }
                    else { s.专属资源 = s.专属资源 && typeof s.专属资源 === 'object' ? s.专属资源 : {}; const have = Number(s.专属资源[p.cost.res]) || 0; if (have < p.cost.amount) throw Error(`${resLabel(p.cost.res)} không đủ: cần ${p.cost.amount}, hiện có ${have}.`); s.专属资源[p.cost.res] = have - p.cost.amount; s.界面记账时间 = Date.now(); expect = [p.cost.res, s.专属资源[p.cost.res]]; }
                    return v;
                });
                const back = this.app.bridge.getVariables({ type: 'chat' }).诸天系统 || {};
                const got = expect[0] === '系统点' ? Number(back.系统点) : Number(back.专属资源?.[expect[0]]);
                if (got !== expect[1]) throw Error('Đọc ngược sổ cái không khớp, đã dừng phát động; vui lòng kiểm tra tại mục “Hoàn tác sổ cái”.');
            }
            st.uses[p.id] = { day: today(), n: use.day === today() ? (use.n || 0) + 1 : 1, turn };
            const log = Array.isArray(this.ctx.chatMetadata?.[STORAGE]?.plugins?.log) ? this.ctx.chatMetadata[STORAGE].plugins.log : [];
            log.push({ at: Date.now(), id: p.id, name: p.name, cost: this.costLabel(p).replace(/^ · /, '') || 'Không', turn });
            await this.saveChatState({ ...st, log: log.slice(-30) });
            const text = `【Phát động phụ trợ: ${p.name}】${p.rule ? p.rule.slice(0, 160) : ''}${p.cost.kind !== 'none' && p.cost.amount ? ` (Cái giá ${this.costLabel(p).replace(/^ · /, '')} đã được hệ thống khấu trừ)` : ''}`;
            const ta = document.getElementById('send_textarea');
            if (ta) { ta.value = (ta.value && !/\n$/.test(ta.value) ? ta.value + '\n' : ta.value) + text; ta.dispatchEvent(new Event('input', { bubbles: true })); }
            this.hub.toast(`Đã phát động 「${p.name}」${this.costLabel(p) ? ', cái giá phải trả đã ghi sổ' : ''}; hành động đã ghi vào ô nhập liệu, gửi đi để AI diễn dịch.`, 4200);
            this.app.fx?.play?.({ kind: 'plugin', title: p.name, detail: this.costLabel(p).replace(/^ · /, '') ? 'Đã khấu trừ cái giá · ' + this.costLabel(p).replace(/^ · /, '') : 'Đã phát động' });
        } catch (e) { this.hub.toast(e.message, 4200); t?.warning?.(e.message, 'Chư Thiên · Phụ trợ'); }
        finally { if (btn) btn.disabled = false; this.hub.setEngineTab(7); }
    }
    // ---------- 外挂管理 page ----------
    render(el) {
        const st = this.chatState(), lib = this.library(), e = this.editing;
        const has = !!this.app.adapter.currentIdentity();
        el.innerHTML = `<div class="zt-actions" style="justify-content:space-between;margin-bottom:8px"><div><div class="zt-eyebrow">EXTRA MODULES · MANAGER</div><h2 class="zt-h">Quản lý phụ trợ</h2></div><button class="zt-btn" data-back type="button">‹ Quay lại Xưởng phụ trợ</button></div>
<p class="zt-sub">Công tắc được lưu theo từng cuộc trò chuyện; phụ trợ đã tắt sẽ ẩn đi và không thể dùng trong thiết bị đầu cuối, đồng thời báo cho AI không được sử dụng. Phụ trợ tự tạo được lưu trên máy này và dùng chung cho mọi cuộc trò chuyện.</p>
${has ? '' : '<div class="zt-card zt-note">Vui lòng mở một cuộc trò chuyện đơn nhân vật trước khi điều chỉnh công tắc.</div>'}
<section class="zt-card" data-mods><h3>Mô-đun mạnh <small>Mục Sách Thế Giới · Có hiệu lực với mọi cuộc trò chuyện</small></h3><p class="zt-sub" style="margin:0 0 6px">Sau khi tắt, quy tắc này sẽ không còn gửi cho AI nữa, lối vào tương ứng trong thiết bị đầu cuối (thẻ chế độ Thần Hào, Tay đấm) cũng được ẩn đi.</p><div data-mods-body>${this.modulesHtml()}</div></section>
<section class="zt-card"><h3>Phụ trợ gốc <small>Cuộc trò chuyện này</small></h3>${BUILTIN.map(n => `<div class="zt-row"><span>${builtinLabel(n)}${(this.modOff.has(n) || this.modOff.has(builtinLabel(n))) ? ' <span class="zt-desc">Đã tắt trong Sách Thế Giới (Mô-đun mạnh)</span>' : ''}</span><label class="zt-switch"><input type="checkbox" data-builtin="${n}" ${st.off.includes(n) ? '' : 'checked'} ${has ? '' : 'disabled'} aria-label="${builtinLabel(n)}"><i></i></label></div>`).join('')}</section>
<section class="zt-card"><h3>Phụ trợ tự tạo <small>Kho phụ trợ trên máy có ${lib.length} mục · Công tắc chỉ ảnh hưởng cuộc trò chuyện này</small></h3>
<div class="zt-plug-list">${lib.map(p => `<div class="zt-plug-item"><label class="zt-switch"><input type="checkbox" data-custom="${p.id}" ${st.on.includes(p.id) ? 'checked' : ''} ${has ? '' : 'disabled'} aria-label="${esc(p.name)}"><i></i></label><div><b>${esc(p.name)}</b><span class="zt-grade" data-g="${p.grade}">${gradeLabel(p.grade)}</span> <span class="zt-chip">${TYPES[p.type]}${p.type === 'daily' ? ' ' + p.daily + ' lần' : ''}${p.cost.cooldown && p.type === 'active' ? ' · Hồi chiêu ' + p.cost.cooldown + ' lượt' : ''}</span> <span class="zt-chip">${this.costLabel(p).replace(/^ · /, '') || 'Không tốn giá'}</span>${p.inject ? '' : ' <span class="zt-chip">Không tiêm lời nhắc</span>'}<p>${esc(p.rule || '(Chưa viết quy tắc)')}</p></div><div class="zt-actions"><button class="zt-btn small" data-edit="${p.id}" type="button">Sửa</button><button class="zt-btn small danger" data-del="${p.id}" type="button">Xóa</button></div></div>`).join('') || '<div class="zt-note">Kho phụ trợ vẫn đang trống. Hãy tự viết một cái ở bên dưới nhé.</div>'}</div>
<div class="zt-actions" style="margin-top:10px"><button class="zt-btn" data-export type="button">Xuất .json</button><label class="zt-btn">Nhập .json<input type="file" accept=".json,application/json" data-import hidden></label></div></section>
<section class="zt-card" id="zt-plug-editor"><h3>${e ? 'Chỉnh sửa phụ trợ' : 'Tạo phụ trợ tự tạo mới'}</h3>
<div class="zt-grid2"><label class="zt-field">Tên gọi<input data-f="name" maxlength="24" value="${esc(e?.name || '')}" placeholder="Ví dụ: Đồng Hồ Ngưng Đọng Thời Gian"></label>
<label class="zt-field">Phẩm giai<select data-f="grade">${GRADES.map(g => `<option value="${g}" ${e?.grade === g ? 'selected' : ''}>${gradeLabel(g)}</option>`).join('')}</select></label>
<label class="zt-field">Loại hình<select data-f="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${e?.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
<label class="zt-field">Số lần mỗi ngày (loại giới hạn theo ngày)<input data-f="daily" type="number" min="1" max="99" value="${e?.daily || 1}"></label>
<label class="zt-field">Cái giá phải trả<select data-f="cost.kind"><option value="none" ${e?.cost.kind === 'none' ? 'selected' : ''}>Không</option><option value="points" ${e?.cost.kind === 'points' ? 'selected' : ''}>Điểm Hệ Thống</option><option value="resource" ${e?.cost.kind === 'resource' ? 'selected' : ''}>Tài nguyên chuyên biệt</option></select></label>
<label class="zt-field">Loại tài nguyên (khi cái giá là Tài nguyên chuyên biệt)<select data-f="cost.res">${RES.map(r => `<option value="${r}" ${e?.cost.res === r ? 'selected' : ''}>${resLabel(r)}</option>`).join('')}</select></label>
<label class="zt-field">Số lượng tiêu hao mỗi lần<input data-f="cost.amount" type="number" min="0" value="${e?.cost.amount || 0}"></label>
<label class="zt-field">Số lượt hồi chiêu (loại chủ động)<input data-f="cost.cooldown" type="number" min="0" max="999" value="${e?.cost.cooldown || 0}"></label></div>
<label class="zt-field">Mô tả quy tắc (viết cho AI: hiệu quả, giới hạn, tác dụng phụ)<textarea data-f="rule" maxlength="600" placeholder="Ví dụ: Sau khi phát động thời gian ngưng đọng 3 giây, trong thời gian đó Ký chủ có thể tự do hành động; vô hiệu với tồn tại từ Thần phẩm trở lên.">${esc(e?.rule || '')}</textarea></label>
<div class="zt-row"><span>Tiêm vào lời nhắc (để AI biết Ký chủ sở hữu phụ trợ này)</span><label class="zt-switch"><input type="checkbox" data-f="inject" ${e ? (e.inject ? 'checked' : '') : 'checked'}><i></i></label></div>
<div class="zt-actions" style="margin-top:8px"><button class="zt-btn primary" data-save type="button">${e ? 'Lưu thay đổi' : 'Thêm vào kho phụ trợ'}</button>${e ? '<button class="zt-btn" data-cancel type="button">Hủy chỉnh sửa</button>' : ''}</div></section>
<section class="zt-card"><h3>Lịch sử phát động <small>30 lần gần nhất trong cuộc trò chuyện này</small></h3>${(this.ctx?.chatMetadata?.[STORAGE]?.plugins?.log || []).slice().reverse().map(r => `<div class="zt-row"><span>${esc(r.name)} <span class="zt-desc">Lượt thứ ${r.turn} · ${new Date(r.at).toLocaleString('zh-CN')}</span></span><span class="zt-chip">${esc(r.cost)}</span></div>`).join('') || '<div class="zt-note">Chưa phát động lần nào.</div>'}</section>`;
        el.onclick = ev => this.onClick(ev, el);
        el.onchange = ev => this.onChange(ev, el);
        this.refreshModules().then(() => { const b = el.querySelector('[data-mods-body]'); if (b) b.innerHTML = this.modulesHtml(); }).catch(e => { const b = el.querySelector('[data-mods-body]'); if (b) b.innerHTML = `<div class="zt-note">Đọc Sách Thế Giới thất bại: ${esc(e.message)}</div>`; });
    }
    formValue(el) {
        const get = f => el.querySelector(`[data-f="${f}"]`);
        return normalizePlugin({ id: this.editing?.id, name: get('name').value, grade: get('grade').value, type: get('type').value, daily: get('daily').value, rule: get('rule').value, inject: get('inject').checked,
            cost: { kind: get('cost.kind').value, res: get('cost.res').value, amount: get('cost.amount').value, cooldown: get('cost.cooldown').value } });
    }
    async onChange(ev, el) {
        const t = ev.target;
        try {
            if (t.dataset.module) {
                const r = await this.app.features.setModules({ [t.dataset.module]: t.checked });
                await this.refreshModules(); this.render(el);
                this.hub.toast(r.changed ? `Đã ${t.checked ? 'bật' : 'tắt'} (Sách Thế Giới đã lưu, có hiệu lực với mọi cuộc trò chuyện)` : 'Không có thay đổi');
                return;
            }
            if (t.dataset.builtin) { const st = this.chatState(); const off = new Set(st.off); t.checked ? off.delete(t.dataset.builtin) : off.add(t.dataset.builtin); await this.saveChatState({ ...st, off: [...off] }); this.hub.toast(`${builtinLabel(t.dataset.builtin)} đã ${t.checked ? 'bật' : 'tắt'}`); }
            else if (t.dataset.custom) { const st = this.chatState(); const on = new Set(st.on); t.checked ? on.add(t.dataset.custom) : on.delete(t.dataset.custom); await this.saveChatState({ ...st, on: [...on] }); this.hub.toast(t.checked ? 'Đã bật trong cuộc trò chuyện này' : 'Đã tắt trong cuộc trò chuyện này'); }
            else if (t.matches('[data-import]') && t.files?.[0]) {
                const data = JSON.parse(await t.files[0].text()); const incoming = (Array.isArray(data) ? data : data?.plugins || []).map(normalizePlugin).filter(Boolean);
                if (!incoming.length) throw Error('Trong tệp không có phụ trợ nào khả dụng.');
                const lib = this.library(), ids = new Set(lib.map(p => p.id));
                for (const p of incoming) { if (ids.has(p.id)) p.id = 'p-' + Math.random().toString(36).slice(2, 10); lib.push(p); }
                this.saveLibrary(lib); this.hub.toast(`Đã nhập ${incoming.length} phụ trợ`); this.render(el);
            }
        } catch (e) { this.hub.toast(e.message, 4000); this.render(el); }
    }
    onClick(ev, el) {
        const b = ev.target.closest('button'); if (!b) return;
        if (b.dataset.back !== undefined) return this.hub.go('plug');
        if (b.dataset.modsBalance !== undefined) {
            b.disabled = true;
            this.app.features.setModules(Object.fromEntries(DEFAULT_OFF.map(c => [c, false])))
                .then(async r => { await this.refreshModules(); this.render(el); this.hub.toast(`Đã tắt ${r.changed} mô-đun mạnh (Sách Thế Giới đã lưu)`); })
                .catch(e => { b.disabled = false; this.hub.toast(e.message, 4000); });
            return;
        }
        if (b.dataset.edit) { this.editing = this.library().find(p => p.id === b.dataset.edit) || null; this.render(el); const ed = el.querySelector('#zt-plug-editor'); if (ed) scrollWithin(ed, { block: 'start' }); resetPageScroll(); return; }
        if (b.dataset.cancel !== undefined) { this.editing = null; return this.render(el); }
        if (b.dataset.del) { const p = this.library().find(x => x.id === b.dataset.del); if (p && globalThis.confirm(`Xóa 「${p.name}」 khỏi kho phụ trợ trên máy? (Mọi cuộc trò chuyện đều sẽ mất nó)`)) { this.saveLibrary(this.library().filter(x => x.id !== p.id)); this.syncPrompt(); this.render(el); } return; }
        if (b.dataset.export !== undefined) { const blob = new Blob([JSON.stringify({ format: 'zhutian-plugins', version: 1, plugins: this.library() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ChuThien-PhuTroTuTao.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); return; }
        if (b.dataset.save !== undefined) {
            const p = this.formValue(el); if (!p) return this.hub.toast('Vui lòng điền tên phụ trợ');
            const lib = this.library(), i = lib.findIndex(x => x.id === p.id);
            if (i >= 0) lib[i] = p; else lib.push(p);
            this.saveLibrary(lib); this.editing = null;
            const st = this.chatState();
            const done = () => { this.hub.toast(i >= 0 ? 'Đã lưu' : `Đã thêm 「${p.name}」 vào kho phụ trợ${this.app.adapter.currentIdentity() ? ' và bật trong cuộc trò chuyện này' : ''}`); this.syncPrompt(); this.render(el); };
            if (i < 0 && this.app.adapter.currentIdentity()) this.saveChatState({ ...st, on: [...new Set([...st.on, p.id])] }).then(done, e => this.hub.toast(e.message)); else done();
        }
    }
    dispose() { this.disposers.splice(0).forEach(f => f()); try { this.app.bridge.uninjectPrompts(['plugins']); } catch { /* ignore */ } }
}
