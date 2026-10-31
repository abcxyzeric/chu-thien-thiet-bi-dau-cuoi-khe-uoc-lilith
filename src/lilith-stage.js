// 莉莉丝是界面角色 (0.7.0).
// She reacts to what the user selects and to what the ledger confirms — using ONLY the original stage: the original
// `speak(zone)` picks the motion + expression sequence of that body zone (rig.react + face timers) and we replace the
// bubble text with a data-driven line. No new body animation, no fake Live2D.
//
// Camera (镜头): the same original art, different framing —
//   full  工作台 / 记忆 / 规则: the whole standing portrait (original);
//   mid   system pages: shorter portrait box, framed from the head down (no scaling of the rig itself, the box only clips);
//   near  私聊: a face close-up strip under the chat header, following the stage expression (the expression stills in
//         assets/lilith/variants have the original body/background and only a re-drawn face);
//   剧情提示 (outside the terminal): a bust crop on the result card (src/fx.js).
import { gradeLabel } from './ledger-ops.js';
import { stageLabel } from './skill-sync.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };
const fmt = x => num(x).toLocaleString('zh-CN');
const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const fill = (tpl, d) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(d[k] ?? ''));
const HIGH = new Set(['神品', '禁忌', '混沌', 'Thần phẩm', 'Cấm kỵ', 'Hỗn Độn']);
/** Original 3.1 idle lines (ZT_LILITH_IDLE) — the engine shows one of them when the panel has no 系统播报. */
export const IDLE = Object.freeze([
    'Ký chủ đại nhân, Lilith đã lên sóng~ Có việc gì cứ gọi ta bất cứ lúc nào nhé.',
    'Hôm nay cũng phải nỗ lực mạnh lên, rồi tiêu sạch sành sanh Điểm Hệ Thống nhé!',
    'Thương thành vừa lên hàng mới, ngài có muốn ghé xem thử không?',
    'Ngài đã điểm danh chưa? Phần thưởng điểm danh liên tiếp sẽ càng tích càng nhiều đó nha.',
    'Kho công pháp để trống thì phí lắm, đi học chút gì đó đi~',
    'Có thứ gì đang muốn sở hữu không? Cứ ước nguyện đi, Lilith giúp ngài định giá cho.',
]);
const IDLE_CN = Object.freeze(['宿主大人，莉莉丝已上线～有事随时叫我。', '今天也要努力变强，然后把系统点花光光！', '商城刚上了新货，要不要去看看？', '签到了吗？连续签到的奖励会越滚越多哦。', '功法库空着多浪费，去学点什么吧～', '有想要的东西？许个愿，莉莉丝帮你估价。']);
const STAGE_NEXT = { 未入门: ['入门', 100], 入门: ['熟练', 500], 熟练: ['精通', 2000], 精通: ['宗师', 10000] };
const STATE_LABELS = { '进行中': 'Đang tiến hành', '已完成': 'Đã hoàn thành', '已失败': 'Đã thất bại' };
const stageOf = s => s?.入道 ? '入道' : num(s?.熟练度) >= 1e4 ? '宗师' : num(s?.熟练度) >= 2e3 ? '精通' : num(s?.熟练度) >= 500 ? '熟练' : num(s?.熟练度) >= 100 ? '入门' : '未入门';
/** 点空白处 lines built from the ledger (pure): what is going on right now, said in character. */
export function storyLines(z) {
    const out = [];
    if (!z || typeof z !== 'object') return IDLE.map(text => ({ zone: 'chest', text }));
    const pend = Array.isArray(z.功法待播报) ? z.功法待播报 : [];
    if (pend.length) { const p = pend.at(-1); out.push({ zone: 'chest', text: `${clip(p.名称, 10)} đã đạt tới 「${stageLabel(p.阶段)}」——${clip(p.奖励, 26)}. Nhớ để hệ thống quyết toán nhé.` }); }
    const tasks = Object.entries(z.任务库 || {}).map(([id, t]) => ({ id, ...(t || {}) })).filter(t => t.状态 !== '已完成' && t.状态 !== '已失败' && t.状态 !== 'Đã hoàn thành' && t.状态 !== 'Đã thất bại');
    if (tasks.length) { const t = tasks[0], p = num(t.完成度); out.push({ zone: 'cheek', text: `「${clip(t.名称 || t.id, 12)}」 vẫn chưa xong đâu${p > 0 ? `, tiến độ ${p}%` : ''}. ${tasks.length > 1 ? `Phía sau còn xếp hàng ${tasks.length - 1} nhiệm vụ nữa.` : 'Lilith đang trông chừng giúp ngài đây.'}` }); }
    const lib = Array.isArray(z.功法库) ? z.功法库 : [], mainName = z.功法?.名称;
    const main = lib.find(s => s?.名称 === mainName) || lib[0];
    if (main?.名称) {
        const st = stageOf(main), nx = STAGE_NEXT[st], cap = num(main.上限, 100);
        out.push({ zone: 'arm', text: nx && nx[1] <= cap ? `${clip(main.名称, 10)} còn cách 「${stageLabel(nx[0])}」 ${fmt(nx[1] - num(main.熟练度))}. Chăm dùng, chăm ngộ, độ thuần thục sẽ tự tăng.` : st === '入道' ? `${clip(main.名称, 10)} đã Nhập Đạo rồi… Đó là pháp tắc đang đáp lại ngài.` : `${clip(main.名称, 10)} đã luyện tới đỉnh của phẩm cấp này rồi, nên tìm cách thăng phẩm thôi.` });
    }
    if (z.当前世界) out.push({ zone: 'horn', text: `Nơi này là ${clip(z.当前世界, 12)}. Quy tắc khác với thế giới trước, đừng chủ quan nhé.` });
    const lt = z.恋爱目标 || {};
    if (lt.姓名) out.push({ zone: 'cheek', text: `Hảo cảm của ${clip(lt.姓名, 8)} đang ở mức ${num(lt.好感度)}${num(lt.黑化值) >= 30 ? `, giá trị hắc hóa cũng lên tới ${num(lt.黑化值)} rồi… cẩn thận chút nhé` : ''}.` });
    out.push({ zone: 'wing', text: `Trong sổ vẫn còn ${fmt(z.系统点)} Điểm Hệ Thống. Định tiết kiệm hay tiêu vào chỗ đáng tiền đây?` });
    for (const text of IDLE.slice(1)) out.push({ zone: 'chest', text });
    return out;
}

/** Zone = which original reaction (motion + expression) plays. Lines are picked round-robin per key. */
export const REACT = Object.freeze({
    'fx:task': { zone: 'wing', lines: ['「{name}」 đã quyết toán xong! {pts}', 'Nhiệm vụ hoàn thành, sổ cái đã ghi nhận——{pts}', 'Làm đẹp lắm. 「{name}」, quyết toán hoàn tất.'] },
    'fx:fail': { zone: 'lower', lines: ['「{name}」… thất bại rồi. Không sao, vẫn còn Lilith ở đây.', 'Lần này không thành rồi. Sổ cái ghi thất bại, không trừ bừa điểm của ngài đâu.'] },
    'fx:travel': { zone: 'horn', lines: ['Đã khóa tọa độ: {to}. Quy tắc ở đây không giống trước, bám sát ta nhé.', 'Chào mừng đến với {to}. Khoan vội gây chuyện đó nha.'] },
    'fx:breakthrough': { zone: 'chest', lines: ['{name} đã đạt tới 「{stage}」 rồi——ngài cảm nhận được chứ?', 'Đột phá thành công. {name}, {stage}.'] },
    'fx:contract': { zone: 'cheek', lines: ['Khế ước thành lập: {name}. Ta đã nhớ kỹ cái tên này rồi.', '{name}… Được, từ hôm nay coi như người một nhà.'] },
    'fx:draw': { zone: 'wing', lines: ['Đã rút {n} lần, đồ tạm thời cất vào mục chờ xử lý, xem thử có lấy không?', 'Rút liên tiếp {n} lần, kết quả đều nằm trong mục chờ xử lý.'] },
    'fx:draw-high': { zone: 'chest', lines: ['{best}! Vận may hôm nay của ngài là đi mượn về đấy à?', 'Ra {best} rồi——đừng kể cho ai khác biết nhé.'] },
    'fx:reward': { zone: 'thigh', lines: ['Đã cất {items} vào túi đồ.', 'Nhập kho hoàn tất: {items}.'] },
    'item': { zone: 'wing', lines: ['「{name}」, {grade}. {effect}', '{name}——{effect}'] },
    'item-high': { zone: 'horn', lines: ['「{name}」 {grade}… cầm cho chắc vào. {effect}', 'Đây chính là {grade}: {name}.'] },
    'task': { zone: 'cheek', lines: ['「{name}」, {state}. {hint}', '{name}: {hint}'] },
    'task-done': { zone: 'wing', lines: ['「{name}」 đã hoàn thành rồi, {hint}', 'Cái này xong xuôi rồi: {name}.'] },
    'task-fail': { zone: 'lower', lines: ['「{name}」 thất bại rồi… Có muốn đổi cách làm khác không?'] },
    'skill': { zone: 'chest', lines: ['{name}, {stage}. {hint}', '「{name}」 hiện đang ở mức {stage}.'] },
    'world': { zone: 'horn', lines: ['{name}… {hint}', 'Muốn đi 「{name}」 sao?'] },
    'bond': { zone: 'cheek', lines: ['{name}. {hint}', 'Để tâm tới 「{name}」 ư? {hint}'] },
    'page:shop': { zone: 'wing', lines: ['Thương thành Lv.{lv}, số dư {pts} điểm. Ngài muốn mua gì nào?'] },
    'page:bag': { zone: 'thigh', lines: ['Trong túi đồ có {n} món, có muốn ta giúp ngài xem món nào đáng giá nhất không?'] },
    'page:task': { zone: 'cheek', lines: ['Có {n} nhiệm vụ đang tiến hành. Cứ làm từng cái một thôi.'] },
    'page:events': { zone: 'wing', lines: ['Đây là chặng đường ngài đã đi qua: mỗi nút đều có thể bấm vào xem bản ghi gốc.'] },
    'page:stars': { zone: 'horn', lines: ['Đã đi qua {n} thế giới rồi. Trạm tiếp theo ngài muốn đi đâu?'] },
    'page:bonds': { zone: 'cheek', lines: ['Những người này có dây mơ rễ má với ngài. Đường nối càng đậm thì quan hệ càng sâu.'] },
    'page:tree': { zone: 'chest', lines: ['Công pháp, thần thông, ngoại quải… tất cả đều mọc trên cái cây này.'] },
});

export class LilithStage {
    constructor(app) { this.app = app; this.seen = {}; this.last = 0; this.pageSaid = new Set(); this.disposers = []; this.hold = 0; this.storyIdx = 0; this.lastTap = 0; this.heard = ''; this.unheard = ''; }
    get settings() { return this.app.settings; }
    get cfg() { return { react: true, pageLines: true, camera: true, story: true, ...(this.settings.get('lilith') || {}) }; }
    stage() { return this.app.assistant?.stage?.() || null; }
    ledger() { try { const z = this.app.bridge.getVariables({ type: 'chat' })?.诸天系统; return z && typeof z === 'object' ? z : null; } catch { return null; } }
    start() {
        const hub = this.app.hub; if (!hub) return this;
        hub.hook('onEngine', (frame, doc) => this.bindEngine(doc));
        hub.hook('onPage', page => { this.camera(page); this.pageLine(page); });
        hub.hook('onOpen', () => { this.camera(hub.page); if (this.unheard) setTimeout(() => this.broadcast(this.unheard), 500); });
        // 0.8.0: the engine's 莉莉丝 row is hidden in the terminal; its line (the panel's 系统播报) is spoken from the portrait.
        hub.hook('onEngineView', (root, doc) => this.readBroadcast(doc));
        this.bindPortrait();
        this.disposers.push(this.settings.onChange(k => { if (k === 'lilith') { this.camera(hub.page); this.mountCloseUp(); } }));
        this.mountCloseUp();
        // The private chat panel may be created later by the original window: re-check after clicks inside it.
        const sh = this.app.assistant?.shadow;
        if (sh) { const f = () => setTimeout(() => this.mountCloseUp(), 60); sh.addEventListener('click', f, true); this.disposers.push(() => sh.removeEventListener('click', f, true)); }
        this.camera(hub.page);
        return this;
    }
    // ---------- reactions ----------
    pick(key, d) {
        const r = REACT[key]; if (!r) return '';
        const n = this.seen[key] = (this.seen[key] ?? -1) + 1;
        return clip(fill(r.lines[n % r.lines.length], d).replace(/[，。,.]\s*$/, m => m).replace(/。。|\.\./g, '.'), 64);
    }
    /** Plays the original zone reaction and replaces the bubble text. Rate limited so rapid clicking stays calm. */
    say(key, d, { force = false, passive = false } = {}) {
        if (!this.cfg.react) return '';
        const now = Date.now(); if (!force && now - this.last < 1800) return '';
        const text = this.pick(key, d); if (!text) return '';
        if (!passive) this.last = now; this.lastLine = text;
        this.speakText(text, REACT[key].zone);
        return text;
    }
    stageVisible(st = this.stage()) { return !!(st && typeof st.speak === 'function' && st.frame?.isConnected && st.frame.getClientRects().length); }
    /** Original speak(zone) for motion + expression, then our text in the original bubble (kept long enough to read). */
    speakText(text, zone = 'chest', { story = false } = {}) {
        const st = this.stage();
        // 0.8.2: portrait not visible (phone layout, small window, terminal closed) → the floating Lilith says it.
        if (!this.stageVisible(st)) return !!this.app.float?.say?.(text, { zone });
        try {
            st.speak(zone);
            if (st.bubble) st.bubble.textContent = text;
            const say = st.bubble?.closest?.('.zt-say'); clearTimeout(this.hold);
            if (say) say.dataset.ztStory = story ? 'true' : 'false';
            if (say && text.length > 22) this.hold = setTimeout(() => { if (st.bubble.textContent === text) { say.dataset.show = 'true'; this.hold = setTimeout(() => { if (st.bubble.textContent === text) say.dataset.show = 'false'; }, text.length * 150 - 3400); } }, 3300);
            return true;
        } catch { return false; }   /* stage gone */
    }
    // ---------- 0.8.0 气泡播报 + 剧情台词 ----------
    /** Called after each engine refresh: a NEW 系统播报 from the panel is spoken once (idle lines are not). */
    readBroadcast(doc) {
        let text = ''; try { text = String(doc?.querySelector('.mvu-msg-text')?.textContent || '').replace(/\s+/g, ' ').trim(); } catch { return; }
        if (!text || text === '……' || text === '...' || IDLE.includes(text) || IDLE_CN.includes(text)) { this.current = ''; return; }
        this.current = text;
        const key = (this.app.adapter.currentIdentity?.() || '') + '|' + text;
        if (key === this.heard) return;
        this.heard = key;
        if (!this.cfg.story) return;
        if (this.app.hub?.isOpen && this.broadcast(text)) return;
        if (this.app.float?.say?.(clip(text, 90), { zone: 'chest' })) return;   // 0.8.2: phones — she says it right away
        this.unheard = text;                       // terminal closed: say it the next time it opens
    }
    broadcast(text) {
        this.unheard = '';
        const said = this.speakText(clip(text, 90), 'chest', { story: true });
        if (!said && this.app.hub?.isOpen) this.app.hub.toast('Lilith: ' + clip(text, 80), 5200);   // phone layout / no portrait
        return true;
    }
    /** 点立绘空白处 (not a body zone, not a drag): the latest 系统播报 first, then ledger-based story lines in turn. */
    bindPortrait() {
        const sh = this.app.assistant?.shadow; if (!sh) return;
        let down = null;
        const inFrame = e => { const st = this.stage(); return st?.frame && e.composedPath().includes(st.frame) ? st : null; };
        const pd = e => { down = inFrame(e) ? { x: e.clientX, y: e.clientY, t: Date.now() } : null; };
        const click = e => {
            const st = inFrame(e); if (!st || !this.cfg.story) return;
            if (e.composedPath().some(n => n?.classList?.contains?.('zt-zone'))) return;          // a body zone: original reaction
            if (down && (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8 || Date.now() - down.t > 600)) return;   // stroke / long press
            const now = Date.now(); if (now - this.lastTap < 900) return; this.lastTap = now;
            const all = [...(this.current ? [{ zone: 'chest', text: this.current }] : []), ...storyLines(this.ledger())];
            const pickLine = all[this.storyIdx % all.length]; this.storyIdx++;
            this.speakText(clip(pickLine.text, 90), pickLine.zone, { story: true });
        };
        sh.addEventListener('pointerdown', pd, true); sh.addEventListener('click', click);
        this.disposers.push(() => { sh.removeEventListener('pointerdown', pd, true); sh.removeEventListener('click', click); });
    }
    fxData(ev) {
        return { name: ev.name || ev.to || '', to: ev.to || '', stage: stageLabel(ev.stage || ''), n: ev.n || 1, best: gradeLabel(ev.best || ''),
            pts: ev.points > 0 ? `+${fmt(ev.points)} Điểm Hệ Thống.` : '', items: (ev.items || []).slice(0, 2).map(i => i.名称 || i).join(', ') || ev.detail || '' };
    }
    fxKey(ev) { return ev.kind === 'draw' && HIGH.has(ev.best) ? 'fx:draw-high' : 'fx:' + ev.kind; }
    /** Called by fx after the ledger confirmed the event. */
    reactTo(ev) { if (REACT[this.fxKey(ev)]) this.say(this.fxKey(ev), this.fxData(ev), { force: true }); }
    /** Text only (for the outside-terminal story card). */
    lineFor(ev) { const k = this.fxKey(ev); return REACT[k] && this.cfg.react ? (this.lastLine && Date.now() - this.last < 200 ? this.lastLine : this.pick(k, this.fxData(ev))) : ''; }
    react(kind, data) {
        const z = this.ledger() || {};
        if (kind === 'item') {
            const g = String(data.品级 || data.grade || ''), eff = clip(data.效果 || data.描述 || '', 26);
            return this.say(HIGH.has(g) ? 'item-high' : 'item', { name: clip(data.名称, 14), grade: g ? gradeLabel(g) : 'Chưa định cấp', effect: eff ? eff + (/[。！？.!?]$/.test(eff) ? '' : '.') : '' });
        }
        if (kind === 'task') {
            const t = data || {}, p = num(t.完成度);
            const isDone = t.状态 === '已完成' || t.状态 === 'Đã hoàn thành';
            const isFail = t.状态 === '已失败' || t.状态 === 'Đã thất bại';
            const hint = isDone ? (z.任务结算凭据?.[t.id] ? `Đã quyết toán ${fmt(z.任务结算凭据[t.id].点数)} điểm.` : 'Phần thưởng chờ quyết toán.') : p > 0 ? `Tiến độ ${p}%.` : clip(t.内容 || 'Chưa bắt đầu.', 22);
            return this.say(isDone ? 'task-done' : isFail ? 'task-fail' : 'task', { name: clip(t.名称 || t.id, 14), state: STATE_LABELS[t.状态] || t.状态 || 'Đang tiến hành', hint });
        }
        if (kind === 'skill') { const s = data || {}; return this.say('skill', { name: clip(s.名称, 12), stage: stageLabel(s.阶段 || s.stage || '未入门'), hint: s.熟练度 != null ? `Thuần thục ${fmt(s.熟练度)}.` : '' }); }
        if (kind === 'world') return this.say('world', { name: clip(data.名称, 14), hint: data.current ? 'Hiện tại chúng ta đang ở đây.' : data.次数 ? `Đã đến ${data.次数} lần.` : 'Chưa từng đến.' });
        if (kind === 'bond') return this.say('bond', { name: clip(data.名称, 12), hint: clip(data.hint || '', 20) });
        return '';
    }
    pageLine(page) {
        if (!this.cfg.pageLines || !this.app.hub?.isOpen || this.pageSaid.has(page) || !REACT['page:' + page]) return;
        const z = this.ledger(); if (!z) return;
        const d = { lv: num(z.商城等级, 1), pts: fmt(z.系统点), n: 0 };
        if (page === 'bag') d.n = (z.背包 || []).length;
        if (page === 'task') d.n = Object.values(z.任务库 || {}).filter(t => t && t.状态 !== '已完成' && t.状态 !== '已失败' && t.状态 !== 'Đã hoàn thành' && t.状态 !== 'Đã thất bại').length;
        if (page === 'stars') d.n = Math.max((z.万界足迹 || []).length, z.当前世界 ? 1 : 0);
        this.pageSaid.add(page);
        setTimeout(() => this.say('page:' + page, d, { passive: true }), 450);
    }
    bindEngine(doc) {
        if (!doc || doc.__ztLilith) return; doc.__ztLilith = true;
        doc.addEventListener('click', e => {
            const t = e.target;
            const item = t.closest?.('.btn-item-detail[data-item]');
            if (item) { try { this.react('item', JSON.parse(item.dataset.item)); } catch { /* malformed */ } return; }
            const task = t.closest?.('[data-task-focus]');
            if (task) { const id = task.dataset.taskFocus, rec = this.ledger()?.任务库?.[id]; if (rec) this.react('task', { ...rec, id }); return; }
            const gf = t.closest?.('.zt-gf-row');
            if (gf) {
                const name = gf.querySelector('[data-name]')?.dataset.name || gf.querySelector('.mvu-gf-lib-name')?.textContent?.trim();
                const rec = (this.ledger()?.功法库 || []).find(s => s?.名称 === name);
                if (rec) this.react('skill', { ...rec, 阶段: gf.querySelector('.zt-gf-stage,.mvu-gf-stage')?.textContent?.trim() || '' });
            }
        }, true);
    }
    // ---------- camera ----------
    camera(page) {
        const host = this.app.hub?.shadow?.host; if (!host) return;
        if (!this.cfg.camera) { host.removeAttribute('data-zt-cam'); return; }
        host.setAttribute('data-zt-cam', ['work', 'memory', 'rules'].includes(page) ? 'full' : 'mid');
    }
    mountCloseUp() {
        const sh = this.app.assistant?.shadow, panel = sh?.getElementById('lc-panel'), head = sh?.getElementById('lc-head');
        const old = sh?.querySelector('.zt-lc-cam');
        if (!this.cfg.camera || !panel || !head) { old?.remove(); this.mo?.disconnect(); return; }
        if (old) return;
        const cam = document.createElement('div'); cam.className = 'zt-lc-cam'; cam.setAttribute('aria-hidden', 'true');
        cam.innerHTML = '<i class="a"></i><i class="b"></i>';
        head.after(cam);
        const base = this.app.base + 'assets/lilith/variants/';
        let cur = '', front = cam.querySelector('.a'), back = cam.querySelector('.b');
        const set = mood => {
            const m = ['neutral', 'smile', 'shy', 'pout', 'surprised', 'wink', 'smug', 'sad'].includes(mood) ? mood : 'neutral';
            if (m === cur) return; cur = m;
            back.style.backgroundImage = `url("${base}${m}.webp")`; back.classList.add('on'); front.classList.remove('on');
            [front, back] = [back, front];
        };
        const st = sh.querySelector('.zt-stage'); set(st?.dataset.expression || 'neutral');
        if (st) { this.mo = new MutationObserver(() => set(st.dataset.expression || 'neutral')); this.mo.observe(st, { attributes: true, attributeFilter: ['data-expression'] }); }
        this.disposers.push(() => { this.mo?.disconnect(); cam.remove(); });
    }
    dispose() { this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); clearTimeout(this.hold); this.app.hub?.shadow?.host?.removeAttribute('data-zt-cam'); }
}
export { esc };
