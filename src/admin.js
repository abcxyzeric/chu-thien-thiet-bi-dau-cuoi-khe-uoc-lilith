// 1.1.2 · Bảng điều khiển Quản trị viên (trang mới bên trong thiết bị đầu cuối).
// Lớp phủ 3.1 gốc (vẫn mở được qua nút 「Bảng gốc」) biết tới Điểm Hệ Thống / Tài nguyên chuyên biệt / Mục tiêu yêu đương / Công pháp chủ tu / Tiền tệ / Bậc thực lực.
// Trang này bổ sung những gì các phiên bản sau đưa thêm vào — Bảo hiểm hộp mù, mọi nhân vật Ràng buộc (không chỉ mục tiêu hiện tại),
// độ hảo cảm của thành viên nhóm chat — và chỉ ghi những trường người chơi thực sự sửa đổi trong MỘT lần ghi có kiểm chứng (checkedCommit). Trường nào
// đã thay đổi trong sổ cái kể từ lúc mở trang sẽ bị coi là xung đột: không ghi bất cứ thứ gì.
// Các chỉnh sửa về Tài nguyên chuyên biệt cũng được áp dụng dưới dạng độ lệch (delta) vào mọi bản chụp nhanh theo tầng (面板账本[*].snap), để sau đó khi quẹt (swipe) /
// tạo lại (hoàn tác ghi sổ khi roll lại) hoặc hoàn tác của chính bộ máy gốc vẫn giữ nguyên thay đổi của quản trị viên thay vì hoàn tác mất.
import { esc } from './hub.js';
import { capture, checkedCommit, audit, refreshEngine } from './action-support.js';
import { listBonds, migrateBonds } from './bonds-data.js';
import { XIAN_PITY, SHEN_PITY, shenCounter } from './commerce-plan.js';

export const RES_KEYS = Object.freeze(['天命印记', '血脉结晶', '因果筹码', '名望', '岁月沉淀']);
export const RES_LABELS = Object.freeze({ 天命印记: 'Ấn Ký Thiên Mệnh', 血脉结晶: 'Kết Tinh Huyết Mạch', 因果筹码: 'Phỉnh Nhân Quả', 名望: 'Danh vọng', 岁月沉淀: 'Lắng Đọng Năm Tháng' });
export const PERSON_KEY_LABELS = Object.freeze({ 好感度: 'Độ hảo cảm', 黑化值: 'Chỉ số Hắc hóa', 悔意值: 'Chỉ số Hối hận' });
const intOf = (v, d = 0) => { const n = Math.floor(Number(String(v ?? '').replace(/,/g, ''))); return Number.isFinite(n) ? n : d; };
const show = v => (v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const sameValue = (a, b) => show(a) === show(b);

/** Plain dotted-path field: [group, path, label, type, min, max, hint]. */
export const ADMIN_FIELDS = Object.freeze([
    ['Tài sản', '系统点', 'Điểm Hệ Thống', 'int', 0, Number.MAX_SAFE_INTEGER],
    ['Tài sản', '子系统数量', 'Số lượng Tử hệ thống', 'int', 0, 999],
    ['Tài sản', '子嗣数量', 'Số lượng Hậu duệ', 'int', 0, 9999],
    ['Tài sản', '当前货币', 'Tiền tệ hiện tại', 'text'],
    ['Tài sản', '持有金额', 'Số tiền nắm giữ', 'text'],
    ...RES_KEYS.map(k => ['Tài nguyên chuyên biệt', '专属资源.' + k, RES_LABELS[k] || k, 'int', 0, Number.MAX_SAFE_INTEGER]),
    ['Thực lực', '宿主实力档', 'Bậc thực lực Ký chủ', 'int', 1, 8, '1–8'],
    ['Thực lực', '世界上限档', 'Bậc giới hạn thế giới này', 'int', 1, 8, '1–8'],
    ['Thực lực', '商城等级下限', 'Giới hạn dưới cấp Thương thành', 'int', 1, 5, '1–5'],
    ['Công pháp', '功法.名称', 'Công pháp chủ tu', 'text'],
    ['Công pháp', '功法.熟练度', 'Độ thuần thục (giá trị hiện tại)', 'int', 0, Number.MAX_SAFE_INTEGER],
    ['Công pháp', '功法.上限', 'Giới hạn trên (giới hạn phẩm giai)', 'int', 1, Number.MAX_SAFE_INTEGER],
    ['Hộp mù', '盲盒状态.保底计数', 'Bộ đếm bảo hiểm Tiên phẩm', 'int', 0, XIAN_PITY - 1, `0–${XIAN_PITY - 1}`],
    ['Hộp mù', '盲盒状态.神品保底计数', 'Bộ đếm bảo hiểm Thần phẩm', 'int', 0, SHEN_PITY - 1, `0–${SHEN_PITY - 1}`],
    ['Hộp mù', '盲盒状态.累计抽数', 'Tổng số lượt rút tích lũy', 'int', 0, Number.MAX_SAFE_INTEGER],
    ['Hộp mù', '盲盒状态.仙品次数', 'Số lần ra Tiên phẩm', 'int', 0, Number.MAX_SAFE_INTEGER],
    ['Hộp mù', '盲盒状态.神品次数', 'Số lần ra Thần phẩm', 'int', 0, Number.MAX_SAFE_INTEGER],
]);
const getPath = (o, p) => p.split('.').reduce((x, k) => (x && typeof x === 'object' ? x[k] : undefined), o);
function setPath(o, p, v) { const ks = p.split('.'); let x = o; for (const k of ks.slice(0, -1)) { if (!x[k] || typeof x[k] !== 'object') x[k] = {}; x = x[k]; } x[ks.at(-1)] = v; }
/** What the page shows for a path (神品保底计数 of an old save is derived, like the gacha does). */
export function readField(z, path) { return path === '盲盒状态.神品保底计数' ? shenCounter(z?.盲盒状态 || {}) : getPath(z, path); }

/** Person / member targets: 好感度 · 黑化值 · 悔意值 of a 羁绊库 entry, 好感 of a chat-group member. */
export const PERSON_KEYS = Object.freeze(['好感度', '黑化值', '悔意值']);
const personOf = (z, id) => (Array.isArray(z?.羁绊库) ? z.羁绊库 : []).find(p => p?.id === id);
const memberOf = (z, id) => (Array.isArray(z?.聊天群?.成员) ? z.聊天群.成员 : []).find(m => m?.id === id);

/**
 * Form values → the list of changes. `loaded` is the ledger as the page showed it; `values` maps field keys to the
 * typed strings ('' = leave alone). Throws a readable error on an invalid value. Pure.
 *   keys: 'f:<path>' plain fields · 'p:<bondId>:<key>' persons · 'm:<memberId>' member 好感
 */
export function planAdmin(loaded, values) {
    const out = [];
    for (const [key, raw] of Object.entries(values || {})) {
        const text = String(raw ?? '').trim(); if (text === '') continue;
        let label, from, type = 'int', min = 0, max = 100, target;
        if (key.startsWith('f:')) {
            const f = ADMIN_FIELDS.find(x => x[1] === key.slice(2)); if (!f) continue;
            [, , label, type, min = 0, max = Number.MAX_SAFE_INTEGER] = f; target = { kind: 'field', path: f[1] }; from = readField(loaded, f[1]);
        } else if (key.startsWith('p:')) {
            const rest = key.slice(2), k = PERSON_KEYS.find(x => rest.endsWith(':' + x)); if (!k) continue;
            const id = rest.slice(0, -(k.length + 1)), p = personOf(loaded, id); if (!p) continue;
            label = `${p.姓名} (${p.世界}) ${PERSON_KEY_LABELS[k] || k}`; target = { kind: 'person', id, key: k }; from = p[k];
        } else if (key.startsWith('m:')) {
            const m = memberOf(loaded, key.slice(2)); if (!m) continue;
            label = `Hảo cảm thành viên nhóm ${m.名称}`; target = { kind: 'member', id: m.id }; from = m.好感;
        } else continue;
        if (sameValue(from, text)) continue;
        let to = text;
        if (type === 'int') {
            if (!/^-?[\d,]+$/.test(text)) throw Error(`${label} phải là số nguyên`);
            to = intOf(text);
            if (!Number.isSafeInteger(to) || to < min || to > max) throw Error(`${label} phải nằm trong khoảng ${min.toLocaleString()}–${max.toLocaleString()}`);
            if (sameValue(from, to)) continue;
        } else if (text.length > 60) throw Error(`${label} tối đa 60 ký tự`);
        out.push({ key, label, from, to, target });
    }
    return out;
}
const current = (z, t) => t.kind === 'field' ? readField(z, t.path) : t.kind === 'person' ? personOf(z, t.id)?.[t.key] : memberOf(z, t.id)?.好感;

/**
 * Apply planned changes to the live ledger `z` (inside checkedCommit). Every target must still hold the value the page
 * read — otherwise nothing is applied. `syncSkill` is the original ztAdminSyncSkill (engine frame), needed for 功法.
 * Returns the change list. Mutates `z`.
 */
export function applyAdmin(z, changes, { syncSkill } = {}) {
    if (changes.some(c => c.target.kind === 'person')) migrateBonds(z);
    for (const c of changes) {
        if (c.target.kind === 'person' && !personOf(z, c.target.id)) throw Error(`Trong sổ cái không còn ${c.label.split(' (')[0]}, chưa ghi bất kỳ thay đổi nào`);
        if (c.target.kind === 'member' && !memberOf(z, c.target.id)) throw Error(`${c.label.replace(/^Hảo cảm thành viên nhóm /, '')} không còn ở trong nhóm, chưa ghi bất kỳ thay đổi nào`);
        if (!sameValue(current(z, c.target), c.from)) throw Error(`Sổ cái đã thay đổi: ${c.label} hiện tại là ${show(current(z, c.target)) || 'trống'} (trang đọc được là ${show(c.from) || 'trống'}). Chưa ghi bất kỳ thay đổi nào, vui lòng bấm 「Đọc lại」 rồi sửa lại`);
    }
    const skill = changes.some(c => c.target.kind === 'field' && c.target.path.startsWith('功法.'));
    if (skill && typeof syncSkill !== 'function') throw Error('Sửa đổi công pháp chủ tu cần trang Hệ Thống Chư Thiên đã được tải: hãy mở trang 「Tổng quan」 trên thiết bị đầu cuối trước, rồi quay lại lưu. Chưa ghi bất kỳ thay đổi nào');
    const resDelta = {};
    for (const c of changes) {
        const t = c.target;
        if (t.kind === 'field') {
            if (t.path.startsWith('专属资源.')) { const k = t.path.slice(5); resDelta[k] = intOf(c.to) - intOf(c.from); if (!z.专属资源 || typeof z.专属资源 !== 'object') z.专属资源 = {}; }
            if (t.path.startsWith('盲盒状态.') && (!z.盲盒状态 || typeof z.盲盒状态 !== 'object')) z.盲盒状态 = {};
            if (t.path === '盲盒状态.神品保底计数' && z.盲盒状态.神品保底计数 === undefined) z.盲盒状态.神品保底计数 = shenCounter(z.盲盒状态);
            setPath(z, t.path, c.to);
        } else if (t.kind === 'person') {
            const p = personOf(z, t.id); p[t.key] = c.to;
            if (z.当前羁绊ID === t.id && z.恋爱目标 && typeof z.恋爱目标 === 'object') z.恋爱目标[t.key] = c.to;
        } else memberOf(z, t.id).好感 = c.to;
    }
    const snaps = Object.values(z.面板账本 && typeof z.面板账本 === 'object' ? z.面板账本 : {}).filter(r => r?.snap && typeof r.snap === 'object');
    if (skill) {
        // the original also copies today's 专属资源 into every snapshot — keep ours (a reroll must not stack gains again)
        const keep = snaps.map(r => [r, r.snap.专属资源 === undefined ? undefined : structuredClone(r.snap.专属资源)]);
        syncSkill(z);
        for (const [r, res] of keep) { if (res === undefined) delete r.snap.专属资源; else r.snap.专属资源 = res; }
    }
    for (const r of snaps) for (const [k, d] of Object.entries(resDelta)) {
        if (!d || !r.snap.专属资源 || typeof r.snap.专属资源 !== 'object') continue;
        r.snap.专属资源[k] = Math.max(0, intOf(r.snap.专属资源[k]) + d);
    }
    return changes;
}

export class AdminConsole {
    constructor(app) { this.app = app; this.person = ''; this.member = ''; }
    start() {
        const h = this.app.hub; if (!h) return this;
        h.register('admin', { title: 'Bảng điều khiển Quản trị viên', render: el => { this.el = el; this.render(); } });
        // chat switched while the page is visible → re-read it (unsaved edits belonged to the old chat)
        this.off = this.app.adapter.subscribe?.(() => { if (this.el && h.page === 'admin' && this.id !== this.app.adapter.currentIdentity()) this.render(); });
        return this;
    }
    open() { this.app.hub.go('admin'); }
    render() {
        const el = this.el; if (!el) return;
        const z = this.app.adapter.ledger();
        if (!z) { el.innerHTML = '<div class="zt-empty">Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên, hãy tạo trước tại 「Cài đặt → Khởi tạo cuộc trò chuyện mới」.</div>'; return; }
        this.loaded = structuredClone(z); this.id = this.app.adapter.currentIdentity();
        const people = listBonds(z).filter(p => p.source === 'bond'), members = (z.聊天群?.成员 || []).filter(m => m?.id);
        if (!people.some(p => p.id === this.person)) this.person = people.find(p => p.id === z.当前羁绊ID)?.id || people[0]?.id || '';
        if (!members.some(m => m.id === this.member)) this.member = members[0]?.id || '';
        const engine = typeof this.app.hub.engineFrame?.contentWindow?.ztAdminSyncSkill === 'function';
        const input = (key, label, val, { type = 'int', min, max, hint = '', disabled = false } = {}) => `<label class="zt-adm-field"><span>${esc(label)}</span><input data-key="${esc(key)}" data-initial="${esc(show(val))}" value="${esc(show(val))}" ${type === 'int' ? 'inputmode="numeric"' : ''} placeholder="${esc(show(val) || 'Chưa ghi nhận')}" ${min !== undefined ? `data-min="${min}"` : ''} ${disabled ? 'disabled' : ''} autocomplete="off">${hint ? `<small>${esc(hint)}</small>` : ''}</label>`;
        const group = (name, sub, extra = '') => {
            const fields = ADMIN_FIELDS.filter(f => f[0] === name);
            return `<section class="zt-card zt-adm-sec"><h3>${name} <small>${sub}</small></h3>${extra}<div class="zt-adm-grid">${fields.map(f => input('f:' + f[1], f[2], readField(z, f[1]), { type: f[3], min: f[4], max: f[5], hint: f[6], disabled: name === 'Công pháp' && !engine })).join('')}</div></section>`;
        };
        const g = z.盲盒状态 || {}, xianLeft = Math.max(1, XIAN_PITY - intOf(g.保底计数)), shenLeft = Math.max(1, SHEN_PITY - shenCounter(g));
        const person = people.find(p => p.id === this.person), member = members.find(m => m.id === this.member);
        el.innerHTML = `<div class="zt-adm">
<header class="zt-adm-head"><div><h3>Bảng điều khiển Quản trị viên</h3><small>Sửa trực tiếp sổ cái, hãy thận trọng khi dùng. Chỉ ghi những mục bạn đã sửa, khóa và ghi một lần rồi đọc ngược lại đối chiếu; nếu sau khi mở trang mà sổ cái có thay đổi thì sẽ từ chối ghi.</small></div><button type="button" class="zt-btn small" data-original>Mở bảng gốc</button></header>
${group('Tài sản', 'Số tiền nắm giữ / Tiền tệ hiện tại là văn bản tự do')}
${group('Tài nguyên chuyên biệt', 'Đồng thời hiệu chỉnh bản chụp nhanh của các tầng, sau đó quẹt (swipe) / tạo lại sẽ không hoàn tác mất phần đã sửa')}
${group('Thực lực', 'Ảnh hưởng tới cấp Thương thành và dữ liệu thời gian thực của Sách Thế Giới')}
${group('Công pháp', engine ? 'Đồng bộ Kho công pháp và công pháp chủ tu, giống hệt bảng gốc' : 'Cần mở trang 「Tổng quan」 của thiết bị đầu cuối trước để tải Hệ Thống Chư Thiên thì mới sửa được công pháp', '')}
${group('Hộp mù', `Còn ${xianLeft} lượt tới bảo hiểm Tiên phẩm · Còn ${shenLeft} lượt tới bảo hiểm Thần phẩm (khi đếm tới ${XIAN_PITY - 1} / ${SHEN_PITY - 1} thì lượt rút tiếp theo chắc chắn nổ)`)}
<section class="zt-card zt-adm-sec"><h3>Ràng buộc <small>Sửa Hảo cảm / Hắc hóa / Hối hận của bất kỳ ai; mục tiêu công lược hiện tại sẽ đồng bộ sang 「Mục tiêu yêu đương」</small></h3>
${people.length ? `<label class="zt-adm-pick">Nhân vật <select data-pick="person">${people.map(p => `<option value="${esc(p.id)}"${p.id === this.person ? ' selected' : ''}>${esc(p.姓名)} · ${esc(p.世界)}${p.id === z.当前羁绊ID ? ' ★' : ''}</option>`).join('')}</select></label>
<div class="zt-adm-grid">${person ? PERSON_KEYS.map(k => input(`p:${person.id}:${k}`, PERSON_KEY_LABELS[k] || k, person[k], { min: 0, max: 100, hint: '0–100' })).join('') : ''}</div>` : '<p class="zt-note">Chưa có nhân vật Ràng buộc nào.</p>'}</section>
<section class="zt-card zt-adm-sec"><h3>Nhóm chat <small>Hảo cảm thành viên nhóm (0–100)</small></h3>
${members.length ? `<label class="zt-adm-pick">Thành viên <select data-pick="member">${members.map(m => `<option value="${esc(m.id)}"${m.id === this.member ? ' selected' : ''}>${esc(m.名称)} · ${esc(m.世界 || '')}</option>`).join('')}</select></label>
<div class="zt-adm-grid">${member ? input('m:' + member.id, 'Hảo cảm', member.好感, { min: 0, max: 100, hint: '0–100' }) : ''}</div>` : '<p class="zt-note">Trong nhóm chưa có thành viên nào.</p>'}</section>
<div class="zt-adm-bar"><span data-count>Không có thay đổi</span><button type="button" class="zt-btn small" data-reset>Hoàn tác sửa đổi</button><button type="button" class="zt-btn small" data-reload>Đọc lại</button><button type="button" class="zt-btn primary" data-save disabled>Ghi vào sổ cái</button></div>
<p role="status" class="zt-note"></p></div>`;
        const count = () => { const n = [...el.querySelectorAll('input[data-key]')].filter(i => i.value.trim() !== '' && i.value.trim() !== i.dataset.initial).length; el.querySelector('[data-count]').textContent = n ? `${n} mục thay đổi chưa lưu` : 'Không có thay đổi'; el.querySelector('[data-save]').disabled = !n; return n; };
        el.oninput = e => { const i = e.target.closest('input[data-key]'); if (!i) return; i.classList.toggle('changed', i.value.trim() !== '' && i.value.trim() !== i.dataset.initial); count(); };
        el.onchange = e => {
            const s = e.target.closest('select[data-pick]'); if (!s) return;
            if (count() && !confirm('Chuyển đổi nhân vật sẽ làm mất các thay đổi chưa lưu, tiếp tục?')) { s.value = s.dataset.pick === 'person' ? this.person : this.member; return; }
            if (s.dataset.pick === 'person') this.person = s.value; else this.member = s.value; this.render();
        };
        el.onclick = e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.hasAttribute('data-original')) return this.app.hub.openOriginalAdmin().catch(err => this.message(err.message));
            if (b.hasAttribute('data-reset')) { el.querySelectorAll('input[data-key]').forEach(i => { i.value = i.dataset.initial; i.classList.remove('changed'); }); return count(); }
            if (b.hasAttribute('data-reload')) { if (count() && !confirm('Đọc lại sẽ làm mất các thay đổi chưa lưu, tiếp tục?')) return; return this.render(); }
            if (b.hasAttribute('data-save')) return this.save();
        };
    }
    async save() {
        if (this.busy) return; const el = this.el;
        const values = Object.fromEntries([...el.querySelectorAll('input[data-key]')].filter(i => !i.disabled).map(i => [i.dataset.key, i.value]));
        // the page belongs to the chat it was read from — never apply chat A's form to chat B
        if (this.app.adapter.currentIdentity() !== this.id) { this.render(); return this.message('Cuộc trò chuyện đã chuyển đổi, trang đã đọc lại theo cuộc trò chuyện hiện tại; chưa ghi bất kỳ thay đổi nào.'); }
        let changes; try { changes = planAdmin(this.loaded, values); } catch (e) { return this.message(e.message); }
        if (!changes.length) return this.message('Không có thay đổi nào cần ghi.');
        const list = changes.map(c => `${c.label}: ${show(c.from) || 'trống'} → ${show(c.to)}`);
        if (!confirm(`Ghi ${changes.length} thay đổi dưới đây vào sổ cái?\n\n${list.join('\n')}`)) return;
        this.busy = true; el.querySelector('[data-save]').disabled = true;
        try {
            const token = capture(this.app), syncSkill = this.app.hub.engineFrame?.contentWindow?.ztAdminSyncSkill;
            await checkedCommit(this.app, token, z => { applyAdmin(z, changes, { syncSkill }); audit(z, 'admin', `Quản trị viên sửa đổi: ${list.join('; ')}`); });
            refreshEngine(this.app); this.render(); this.message(`Đã ghi ${changes.length} mục và đối chiếu bản lưu máy chủ. Lần phản hồi tiếp theo của AI sẽ theo chỉ số mới.`);
            this.app.hub.toast('Đã lưu thay đổi của Quản trị viên', 3000);
        } catch (e) { this.message(e.message); el.querySelector('[data-save]').disabled = false; }
        finally { this.busy = false; }
    }
    message(s) { const m = this.el?.querySelector('[role=status]'); if (m) m.textContent = s; }
    dispose() { this.off?.(); this.off = null; this.el = null; }
}
