import { esc } from './hub.js';
import { listBonds, keepPerson, pullMember, dropPulled, pulledEntry } from './bonds-data.js';
import { capture, checkedCommit, audit, cleanText } from './action-support.js';

// 1.1.2 羁绊页重做: filter chips (本世界 first) · person list with avatar / relation / 好感 bar · a readable detail card
// instead of raw key/value dumps. Chat-group members only appear after「拉入羁绊」(聊天群 / 关系图).
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const clamp = v => Math.max(0, Math.min(100, num(v)));
const HIDE = new Set(['id', 'source', '姓名', '名称', '群员ID', '群员拉入', '群内', '世界', '关系', '好感度', '黑化值', '悔意值']);
const LABELS = [['性格', 'Tính cách'], ['身份', 'Thân phận'], ['外貌', 'Ngoại hình'], ['状态', 'Trạng thái'], ['特产', 'Đặc sản'], ['忠诚', 'Trung thành'], ['实力档', 'Bậc thực lực'], ['说明', 'Mô tả'], ['备注', 'Ghi chú']];
const FILTERS = [['here', 'Thế giới này'], ['all', 'Tất cả'], ['love', 'Người yêu / Công lược'], ['summon', 'Tay đấm'], ['group', 'Bạn cùng nhóm']];
const worldLabel = w => (!w || w === '未记录') ? 'Chưa ghi nhận' : w;
const relLabel = r => ({ 羁绊: 'Ràng buộc', 打手: 'Tay đấm', 群友: 'Bạn cùng nhóm', 群员: 'Thành viên nhóm', 管理员: 'Quản trị viên', 恋人: 'Người yêu', 朋友: 'Bạn bè', 对手: 'Đối thủ' }[r] || r || 'Ràng buộc');
/** Relation family → accent colour and filter bucket. Pure. */
export function relKind(p) {
    if (p.source === 'summon') return 'summon';
    if (p.群员ID) return 'group';
    return /恋|爱|攻略|伴侣|妻|夫|情|người yêu|tình nhân|công lược|bạn đời|vợ|chồng|ái/i.test(String(p.关系 || '')) ? 'love' : 'bond';
}
/** 好感 stage label. Pure. */
export function favorStage(v) { const n = clamp(v); return n >= 80 ? 'Chí ái' : n >= 60 ? 'Thân mật' : n >= 40 ? 'Hữu hảo' : n >= 20 ? 'Quen biết' : 'Xa lạ'; }
/** Which people a filter shows. Pure. */
export function filterPeople(people, filter, world) {
    if (filter === 'here') return people.filter(p => !!world && String(p.世界 || '') === String(world));
    if (filter === 'love') return people.filter(p => relKind(p) === 'love');
    if (filter === 'summon') return people.filter(p => p.source === 'summon');
    if (filter === 'group') return people.filter(p => relKind(p) === 'group');
    return people;
}
const hue = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) % 360; return h; };
const avatar = (p, big = false) => `<span class="zt-bd-av${big ? ' big' : ''}" style="--h:${hue(p.姓名 + (p.世界 || ''))}" aria-hidden="true">${esc(Array.from(String(p.姓名 || '?'))[0] || '?')}</span>`;
const value = v => Array.isArray(v) ? v.map(x => `<span class="zt-chip">${esc(typeof x === 'object' ? JSON.stringify(x) : x)}</span>`).join(' ')
    : v && typeof v === 'object' ? Object.entries(v).map(([k, x]) => `<span class="zt-chip">${esc(k)} ${esc(typeof x === 'object' ? JSON.stringify(x) : x)}</span>`).join(' ') : esc(v);

export class Bonds {
    constructor(app) { this.app = app; this.selected = ''; this.filter = ''; this.query = ''; }
    start() {
        const h = this.app.hub; if (!h) return this;
        h.register('bond', { title: 'Đa nhân vật Ràng buộc', render: el => { this.el = el; this.render(); } });
        this.off = this.app.adapter.subscribe(() => { if (this.identity !== this.app.adapter.currentIdentity()) { this.selected = ''; this.filter = ''; this.identity = this.app.adapter.currentIdentity(); if (h.page === 'bond') this.render(); } }); return this;
    }
    open(id) { this.selected = id; this.filter = 'all'; this.app.hub.go('bond'); }
    /** 1.1.2「拉入羁绊」from 聊天群 / 关系图: one verified write, then the person is shown here. */
    async pull(memberId) {
        const z = this.app.adapter.ledger(); if (!z) throw Error('Vui lòng mở cuộc trò chuyện đã khởi tạo');
        const known = pulledEntry(z, memberId); if (known) { this.open(known.id); return known; }
        const token = capture(this.app); let saved;
        await checkedCommit(this.app, token, cur => { saved = pullMember(cur, memberId); audit(cur, 'bond', `Kéo vào Ràng buộc: ${saved.姓名} (${saved.世界}), không quyết toán phần thưởng`); });
        this.app.hub.toast(`Đã kéo ${saved.姓名} vào Ràng buộc`, 3000); this.open(saved.id); return saved;
    }
    render() {
        const el = this.el; if (!el) return;
        const z = this.app.adapter.ledger(); if (!z) { el.innerHTML = '<p>Vui lòng mở cuộc trò chuyện đã khởi tạo.</p>'; return; }
        const world = String(z.当前世界 || ''), people = listBonds(z), hereCount = filterPeople(people, 'here', world).length;
        if (!this.filter) this.filter = hereCount ? 'here' : 'all';
        const q = this.query.trim().toLowerCase();
        const shown = filterPeople(people, this.filter, world).filter(p => !q || [p.姓名, p.世界, worldLabel(p.世界), p.关系, relLabel(p.关系), p.说明].join(' ').toLowerCase().includes(q));
        const person = shown.find(p => p.id === this.selected) || shown.find(p => p.id === z.当前羁绊ID) || shown[0] || null;
        this.selected = person?.id || '';
        const count = id => filterPeople(people, id, world).length;
        const chips = FILTERS.map(([id, label]) => `<button type="button" class="zt-bd-filter${this.filter === id ? ' on' : ''}" data-filter="${id}" aria-pressed="${this.filter === id}">${label}<b>${count(id)}</b></button>`).join('');
        const row = p => `<button type="button" class="zt-bd-person${p.id === person?.id ? ' on' : ''}" data-person="${esc(p.id)}" data-kind="${relKind(p)}">${avatar(p)}<span class="zt-bd-pmain"><b>${esc(p.姓名)}${p.id === z.当前羁绊ID ? ' <i class="zt-bd-star" title="Mục tiêu công lược hiện tại">★</i>' : ''}</b><small>${esc(worldLabel(p.世界))} · ${esc(relLabel(p.关系))}</small>${p.source === 'summon' ? `<span class="zt-bd-bar" style="--v:${clamp(p.忠诚)}%" title="Trung thành ${clamp(p.忠诚)}"></span>` : `<span class="zt-bd-bar" style="--v:${clamp(p.好感度)}%" title="Hảo cảm ${clamp(p.好感度)}"></span>`}</span></button>`;
        const here = shown.filter(p => world && p.世界 === world), other = shown.filter(p => !(world && p.世界 === world));
        const list = shown.length ? (this.filter === 'all' && here.length && other.length
            ? `<p class="zt-bd-group">Thế giới này · ${esc(world)}</p>${here.map(row).join('')}<p class="zt-bd-group">Thế giới khác</p>${other.map(row).join('')}`
            : shown.map(row).join(''))
            : `<div class="zt-bd-empty">${q ? 'Không có nhân vật nào khớp.' : this.filter === 'here' ? `Thế giới này${world ? ` 「${esc(world)}」` : ''} chưa có ràng buộc nào.` : this.filter === 'group' ? 'Chưa có bạn cùng nhóm nào. Hãy vào trang Thành viên của Nhóm chat hoặc Sơ đồ quan hệ rồi bấm 「Kéo vào Ràng buộc」.' : 'Ở đây chưa có nhân vật nào.'}</div>`;
        el.innerHTML = `<div class="zt-bd">
<header class="zt-bd-head"><div><h3>Đa nhân vật Ràng buộc</h3><small>${world ? `Thế giới hiện tại · ${esc(world)} · Thế giới này ${hereCount} người / Tổng ${people.length} người` : `Tổng ${people.length} người · Thế giới hiện tại chưa ghi nhận`}</small></div><input type="search" data-search value="${esc(this.query)}" placeholder="Tìm nhân vật / thế giới / quan hệ" aria-label="Tìm kiếm ràng buộc"></header>
<nav class="zt-bd-filters" aria-label="Lọc">${chips}</nav>
<div class="zt-bd-grid"><div class="zt-bd-list" role="list">${list}</div>${person ? this.detail(person, z) : '<article class="zt-bd-detail zt-bd-empty">Chọn nhân vật bên trái để xem chi tiết.</article>'}</div>
<p class="zt-note zt-bd-tip">Chọn chỉ để chuyển đổi xem thông tin, không thay đổi mục tiêu công lược, không phát thưởng. Thành viên Nhóm chat mặc định không vào Ràng buộc, có thể bấm 「Kéo vào Ràng buộc」 ở trang Thành viên Nhóm chat hoặc Sơ đồ quan hệ. Cùng tên nhưng khác thế giới sẽ không gộp chung.</p>
<details class="zt-card zt-bd-form"><summary>Ghi bù nhân vật / Cập nhật quan hệ nhiều người (không trừ phí, không phát thưởng)</summary><form><div class="zt-bd-fields"><label>Họ tên<input name="name" maxlength="60" required placeholder="Họ tên" value="${person?.source === 'bond' ? esc(person.姓名) : ''}"></label><label>Thế giới nguồn<input name="world" maxlength="80" value="${esc(person?.source === 'bond' ? person.世界 : world)}" placeholder="Nhân vật trùng tên phân biệt bằng thế giới"></label><label>Quan hệ<input name="relation" maxlength="40" placeholder="Bạn bè / Đối thủ / Người yêu" value="${person?.source === 'bond' ? esc(person.关系 || '') : ''}"></label><label>Độ hảo cảm<input name="favor" type="number" min="0" max="100" placeholder="0–100" value="${person?.source === 'bond' && person.好感度 != null ? clamp(person.好感度) : ''}"></label></div><label>Mô tả<textarea name="notes" maxlength="600" rows="2" placeholder="Tùy chọn">${person?.source === 'bond' ? esc(person.说明 || '') : ''}</textarea></label><div class="zt-actions"><button class="zt-btn primary">Lưu nhân vật</button></div></form></details>
<p role="status" class="zt-note"></p></div>`;
        const search = el.querySelector('[data-search]');
        search.oninput = e => { this.query = e.target.value; const pos = e.target.selectionStart; this.render(); const s = this.el.querySelector('[data-search]'); s.focus({ preventScroll: true }); try { s.setSelectionRange(pos, pos); } catch { /* type=search */ } };
        el.querySelector('form').onsubmit = async e => {
            e.preventDefault(); const fd = new FormData(e.target); if (!String(fd.get('world') || '').trim()) return this.message('Vui lòng điền thế giới nguồn của nhân vật');
            await this.run(async () => {
                const token = capture(this.app), p = { 姓名: cleanText(fd.get('name'), 60), 世界: cleanText(fd.get('world'), 80), 关系: cleanText(fd.get('relation'), 40) || '羁绊' };
                const notes = cleanText(fd.get('notes'), 600); if (notes) p.说明 = notes;
                if (fd.get('favor') !== '') p.好感度 = clamp(fd.get('favor'));
                await checkedCommit(this.app, token, z => { const saved = keepPerson(z, p); this.selected = saved.id; if (z.当前羁绊ID === saved.id) z.恋爱目标 = { ...saved }; audit(z, 'bond', `Cập nhật nhân vật ${p.姓名} (${p.世界}), không quyết toán phần thưởng`); });
                this.filter = 'all'; this.render(); this.message('Đã lưu');
            });
        };
        el.onclick = e => {
            const b = e.target.closest('button'); if (!b || b.closest('form')) return;
            if (b.dataset.filter) { this.filter = b.dataset.filter; this.selected = ''; return this.render(); }
            if (b.dataset.person) { this.selected = b.dataset.person; return this.render(); }
            if (!person) return;
            if (b.hasAttribute('data-graph')) this.app.atlas?.focus('bonds', person.source === 'summon' ? 'bond:s:' + (z.打手 || []).findIndex(x => (x.姓名 || x.名称) === person.姓名) : 'bond:p:' + person.id);
            if (b.hasAttribute('data-active')) this.run(async () => {
                if (!confirm(`Đặt ${person.姓名} (${worldLabel(person.世界)}) làm mục tiêu công lược hiện tại của giao thức chính văn bản cũ? Chỉ chuyển đổi mục tiêu, không quyết toán phần thưởng.`)) return;
                const token = capture(this.app); await checkedCommit(this.app, token, z => { const p = z.羁绊库?.find(x => x.id === person.id) || keepPerson(z, person); z.当前羁绊ID = p.id; z.恋爱目标 = { ...p }; delete z.恋爱目标.source; delete z.恋爱目标.群内; audit(z, 'bond', `Chuyển đổi mục tiêu công lược: ${p.姓名}`); }); this.render();
            });
            if (b.hasAttribute('data-drop')) this.run(async () => {
                if (!confirm(`Đưa ${person.姓名} ra khỏi Ràng buộc? Thành viên trong Nhóm chat không bị ảnh hưởng, sau này vẫn có thể kéo vào lại.`)) return;
                const token = capture(this.app); let r; await checkedCommit(this.app, token, z => { r = dropPulled(z, person.id); audit(z, 'bond', `${r.removed ? 'Đưa ra khỏi Ràng buộc' : 'Hủy liên kết thành viên nhóm'}: ${person.姓名}`); });
                this.selected = ''; this.render(); this.message(r.removed ? `Đã đưa ${person.姓名} ra khỏi Ràng buộc` : `${person.姓名} vốn đã có trong Ràng buộc, chỉ hủy liên kết với thành viên nhóm`);
            });
            if (b.hasAttribute('data-group')) { this.app.hub.go('group'); const g = this.app.group; if (g) { g.view = 'members'; g.pm = person.群员ID; g.paint(true); } }
            if (b.hasAttribute('data-summon')) this.app.hub.go('plug');
        };
    }
    detail(p, z) {
        const kind = relKind(p), fav = clamp(p.好感度), meters = [];
        if (p.source === 'summon') meters.push(['Trung thành', clamp(p.忠诚), '']);
        else { meters.push(['Độ hảo cảm', fav, favorStage(fav)]); if (p.黑化值 != null) meters.push(['Chỉ số Hắc hóa', clamp(p.黑化值), '', 'dark']); if (p.悔意值 != null) meters.push(['Chỉ số Hối hận', clamp(p.悔意值), '', 'regret']); }
        const known = LABELS.filter(([k]) => p[k] != null && p[k] !== '' && !(p.source === 'summon' && k === '忠诚'));
        const extra = Object.entries(p).filter(([k, v]) => !HIDE.has(k) && !LABELS.some(([x]) => x === k) && v != null && v !== '' && !k.startsWith('__'));
        const g = p.群内;
        const actions = [
            '<button type="button" class="zt-btn small" data-graph>Xem trong Sơ đồ quan hệ</button>',
            p.source === 'bond' && p.id !== z.当前羁绊ID ? '<button type="button" class="zt-btn small" data-active>Đặt làm mục tiêu công lược</button>' : '',
            g?.在群 ? '<button type="button" class="zt-btn small" data-group>Tới Nhóm chat</button>' : '',
            p.群员ID && p.id !== z.当前羁绊ID ? '<button type="button" class="zt-btn small danger" data-drop>Đưa ra khỏi Ràng buộc</button>' : '',
            p.source === 'summon' ? '<button type="button" class="zt-btn small" data-summon>Mở trang Tay đấm</button>' : '',
        ].join('');
        return `<article class="zt-bd-detail" data-kind="${kind}">
<div class="zt-bd-hero">${avatar(p, true)}<div><h3>${esc(p.姓名)}</h3><div class="zt-bd-tags"><span class="zt-chip">${esc(worldLabel(p.世界))}</span><span class="zt-chip zt-bd-rel">${esc(relLabel(p.关系))}</span>${p.id === z.当前羁绊ID ? '<span class="zt-chip on">★ Mục tiêu công lược hiện tại</span>' : ''}${z.当前世界 && p.世界 === z.当前世界 ? '<span class="zt-chip">Thế giới này</span>' : ''}</div></div></div>
<div class="zt-bd-meters">${meters.map(([k, v, stage, cls = '']) => `<div class="zt-bd-meter ${cls}"><span>${k}<b>${v}</b>${stage ? `<em>${stage}</em>` : ''}</span><i style="--v:${v}%"></i></div>`).join('')}</div>
${known.length ? `<dl class="zt-bd-info">${known.map(([k, label]) => `<dt>${label}</dt><dd>${value(p[k])}</dd>`).join('')}</dl>` : ''}
${g ? `<div class="zt-bd-groupinfo">${g.在群 ? `Nhóm chat · ${esc(relLabel(g.身份 || '群员'))}${g.实力档 != null ? ` · Bậc thực lực ${esc(g.实力档)}` : ''} · Hảo cảm trong nhóm ${clamp(g.好感)}` : 'Đã không còn trong Nhóm chat (vẫn giữ Ràng buộc)'}</div>` : ''}
${extra.length ? `<details class="zt-bd-more"><summary>Bản ghi khác (${extra.length})</summary><dl class="zt-bd-info">${extra.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${value(v)}</dd>`).join('')}</dl></details>` : ''}
<div class="zt-actions">${actions}</div></article>`;
    }
    message(s) { const el = this.el?.querySelector('[role=status]'); if (el) el.textContent = s; }
    async run(f) { if (this.busy) return; this.busy = true; try { await f(); } catch (e) { this.message(e.message); } finally { this.busy = false; } }
    dispose() { this.off?.(); }
}
