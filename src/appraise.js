import { capture, assertCapture } from './action-support.js';
// 1.0 · Giám định phẩm giai — allows re-grading story/card items and skills that were not created by the system.
import * as L from './ledger-ops.js';
import { esc } from './hub.js';
import { GRADE_CAP, normGrade, normName, fixSkill, panelField } from './skill-sync.js';
import { errorLine } from './errors.js';
import { readConfigs } from './api-center.js';

export const APPRAISE_GRADES = Object.freeze(['凡品', '灵品', '仙品', '神品']);
/** Where the system itself made / graded the thing (original 来源 values + the terminal's own modules). */
export const SYSTEM_SOURCE = /^(商城|万界商城|盲盒|万物熔炉|随身洞天|分身探宝|无限口袋|图鉴复刻|修炼|任务奖励|聊天群|自拟外挂|管理员|系统|Thương Thành|Vạn Giới Thương Thành|Hộp mù|Vạn Vật Dung Lô|Động Thiên Tùy Thân|Phân thân tầm bảo|Túi Vô Hạn|Sao Chép Đồ Giám|Tu luyện|Phần thưởng nhiệm vụ|Nhóm chat|Phụ trợ tự tạo|Quản trị viên|Hệ thống)/i;
export const appraiseItemKey = it => JSON.stringify(['lot', ...['名称', '品级', '来源', '来源世界', '原世界品阶', '收纳凭据', '价格', '分类', '效果'].map(k => it?.[k] ?? null)]);
export const isOutside = e => !SYSTEM_SOURCE.test(String(e?.来源 ?? '').trim());
const gi = g => APPRAISE_GRADES.indexOf(L.normGradeKey(g));
const num = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };

/** Entries that may be appraised (pure). Skills by name; items by immutable source-lot fields (not only name + grade). */
export function candidates(z) {
    const skills = (Array.isArray(z?.功法库) ? z.功法库 : []).filter(isOutside).map(s => { const f = fixSkill(s); return { kind: 'skill', key: normName(f.名称), name: f.名称, grade: f.品阶, src: String(s.来源 || ''), desc: String(s.描述 || s.效果 || ''), world: String(s.来源世界 || ''), originalGrade: String(s.原世界品阶 || ''), stamp: s.鉴定 || null, extra: `${f.熟练度}/${f.上限}` }; });
    const items = (Array.isArray(z?.背包) ? z.背包 : []).filter(isOutside).map(it => { const g = L.normGradeKey(it.品级); return { kind: 'item', key: appraiseItemKey(it), name: String(it.名称 || 'Vật phẩm chưa rõ'), grade: APPRAISE_GRADES.includes(g) ? g : (g === '禁忌' ? '禁忌' : '凡品'), src: String(it.来源 || ''), desc: String(it.效果 || ''), cat: String(it.分类 || '其他'), world: String(it.来源世界 || ''), originalGrade: String(it.原世界品阶 || ''), stamp: it.鉴定 || null, extra: `×${num(it.数量, 1)}` }; });
    return { skills, items };
}
/** Messages for one appraisal (pure). The scale is the system's own (Thần thông Bậc thực lực → Phẩm giai). */
export function appraisePrompt(entry, z) {
    const kind = entry.kind === 'skill' ? 'Công pháp' : 'Vật phẩm', world = entry.world || z?.当前世界 || '';
    const system = 'Bạn là Quan Giám Định Phẩm Giai của Hệ Thống Chư Thiên (品阶鉴定官). Chỉ dựa theo uy lực bản thân, quy cách và độ hiếm của đối tượng để phán đoán phẩm giai, không chiều lòng Ký chủ, không vì nguồn gốc từ cốt truyện mà ép thấp hay nâng khống. Tuyệt đối chỉ xuất một dòng duy nhất (只输出一行): Phẩm giai|Một câu lý do (dưới 30 từ). Phẩm giai chỉ được là một trong 凡品 / 灵品 / 仙品 / 神品 (hoặc Phàm phẩm / Linh phẩm / Tiên phẩm / Thần phẩm); nếu thiếu bằng chứng hãy xuất 待鉴定|Lý do.';
    const user = [
        'Tiêu chuẩn phẩm giai (Tiêu chuẩn thống nhất của Hệ Thống Chư Thiên):',
        '凡品 (Phàm phẩm): Vật phẩm thế giới phàm nhân, võ học phàm tục (tương ứng thực lực: Đỉnh cao phàm nhân)',
        '灵品 (Linh phẩm): Siêu phàm nhập môn — bảo vật / công pháp cấp Võ đạo Tông sư, Siêu phàm giả',
        '仙品 (Tiên phẩm): Sức mạnh cấp Thành phố đến cấp Quốc gia / Đại lục',
        '神品 (Thần phẩm): Sức mạnh cấp Hành tinh, cấp Thiên hà trở lên',
        '',
        `Đối tượng giám định (${kind}): ${entry.name}`,
        entry.cat ? `Phân loại: ${entry.cat}` : '',
        entry.desc ? `Hiệu quả / Mô tả: ${String(entry.desc).slice(0, 200)}` : 'Hiệu quả / Mô tả: Chưa có bản ghi (khi thiếu bằng chứng bắt buộc trả về 待鉴定|Thiếu bằng chứng hiệu quả, không được đoán mò Phàm phẩm theo tên)',
        `Nguồn gốc: ${entry.src || 'Cốt truyện / Chưa ghi nhận'}`,
        z?.当前世界 ? `Thế giới Ký chủ đang ở hiện tại: ${String(z.当前世界).slice(0, 30)}` : '',
        `Sổ cái hiện đang ghi là: ${L.gradeLabel(entry.grade)}`,
        `Thế giới nguồn của vật phẩm: ${entry.world || 'Chưa ghi nhận, không được coi thế giới hiện tại là nguồn gốc đã xác thực'}`,
        `Phẩm giai thế giới gốc: ${entry.originalGrade || 'Chưa ghi nhận'}`,
        `Ánh xạ thế giới tham khảo do người dùng xác nhận (${world}): ${JSON.stringify(z?.世界品阶映射?.[world] || {})}`,
        'Giữ nguyên phẩm giai thế giới gốc, không suy đoán theo tên, chưa rõ thì trả về 待鉴定.',
    ].filter(x => x !== '').join('\n');
    return { system, user };
}
/** The model's answer → { grade, reason } (pure). Throws a readable error for anything else. */
export function parseAppraisal(text) {
    if (/待鉴定|chờ giám định|chưa giám định/i.test(String(text))) throw Error('Phẩm giai chờ giám định: thiếu bằng chứng thiết lập/hiệu quả đáng tin cậy. Sổ cái chưa thay đổi, vui lòng bổ sung ánh xạ thế giới gốc hoặc xác nhận thủ công.');
    const line = String(text || '').replace(/```[\s\S]*?```/g, ' ').split(/\r?\n/).map(s => s.trim()).find(s => /凡品|灵品|仙品|神品|禁忌|phàm phẩm|linh phẩm|tiên phẩm|thần phẩm|cấm kỵ/i.test(s));
    if (!line) throw Error('Mô hình không đưa ra phẩm giai (phải có dạng: Phẩm giai|Lý do). Sổ cái: Không thay đổi.');
    const [head, ...rest] = line.replace(/^[*#>\-\s]+/, '').split(/[|｜]/);
    let grade = normGrade(head) || normGrade(line);
    if (grade === '禁忌') grade = '神品';
    if (!APPRAISE_GRADES.includes(grade)) throw Error('Không thể nhận diện phẩm giai do mô hình đưa ra. Sổ cái: Không thay đổi.');
    return { grade, reason: rest.join('|').trim().replace(/\s+/g, ' ').slice(0, 60) };
}
/**
 * Raise one entry inside a ledger object (pure, mutates `z`). Returns { changed, from, to, name }.
 */
export function regrade(z, entry, gradeIn, { how = 'AI', reason = '', at = Date.now() } = {}) {
    const grade = L.normGradeKey(gradeIn);
    if (!APPRAISE_GRADES.includes(grade)) throw Error('Phẩm giai chỉ có thể là Phàm phẩm / Linh phẩm / Tiên phẩm / Thần phẩm.');
    if (entry.kind === 'skill') {
        const lib = Array.isArray(z.功法库) ? z.功法库 : [];
        const s = lib.find(x => normName(x?.名称) === entry.key); if (!s) throw Error(`Trong kho công pháp không còn 「${entry.name}」 nữa.`);
        if (!isOutside(s)) throw Error(`「${entry.name}」 là do hệ thống cấp, phẩm giai do hệ thống quyết định, không thể giám định.`);
        const f = fixSkill(s), from = f.品阶;
        if (gi(grade) <= gi(from) || from === '禁忌') return { changed: false, from, to: grade, name: f.名称 };
        s.品阶 = grade; s.上限 = Math.max(num(s.上限, f.上限), GRADE_CAP[grade]);
        if (s.圆满 && num(s.熟练度) < s.上限) delete s.圆满;
        s.鉴定 = { 品阶: grade, 原品阶: from, 方式: how, 时间: at, ...(reason ? { 理由: reason } : {}) };
        return { changed: true, from, to: grade, name: f.名称 };
    }
    const bag = Array.isArray(z.背包) ? z.背包 : [];
    const matches = bag.map((x, i) => ({ x, i })).filter(({ x }) => appraiseItemKey(x) === entry.key || `${x?.名称 || ''}|${x?.品级 || ''}` === entry.key);
    if (matches.length > 1) throw Error('Vật phẩm trùng tên có nguồn gốc không duy nhất, vui lòng chọn lại lô cụ thể; chưa ghi dữ liệu.');
    const i = matches[0]?.i ?? -1; if (i < 0) throw Error(`Trong túi đồ không còn 「${entry.name}」 nữa.`);
    const it = bag[i]; if (!isOutside(it)) throw Error(`「${entry.name}」 là do hệ thống cấp, phẩm giai do hệ thống quyết định, không thể giám định.`);
    const curG = L.normGradeKey(it.品级);
    const from = APPRAISE_GRADES.includes(curG) ? curG : (curG === '禁忌' ? '禁忌' : '凡品');
    if (from === '禁忌' || gi(grade) <= gi(from)) return { changed: false, from, to: grade, name: it.名称 };
    if (!num(it.价格)) it.价格 = L.TIER_PRICE[from] || 100;            // recycle value stays what it was
    const stamp = { 品阶: grade, 原品阶: from, 方式: how, 时间: at, ...(reason ? { 理由: reason } : {}) };
    it.品级 = grade; it.鉴定 = stamp;
    return { changed: true, from, to: grade, name: it.名称 };
}
/** 「收录:功法名[品阶]」 lines that name an existing outside skill with a HIGHER grade (pure). */
export function gradeRaises(z, practiceLine) {
    const lib = (Array.isArray(z?.功法库) ? z.功法库 : []), out = [];
    for (const part of String(practiceLine || '').split(/[；;\n|｜]+/).map(s => s.trim()).filter(Boolean)) {
        const m = part.match(/^(?:收录|习得|学会|Thu lục|Học được)\s*[:：]\s*(.+)$/i); if (!m) continue;
        const b = m[1].match(/[[【（(〔]([^\]】）)〕]*)[\]】）)〕]/), g = b ? normGrade(b[1]) : '';
        if (!APPRAISE_GRADES.includes(g)) continue;
        const key = normName(m[1]), s = lib.find(x => normName(x?.名称) === key);
        if (!s || !isOutside(s)) continue;
        const from = fixSkill(s).品阶; if (gi(g) > gi(from) && from !== '禁忌' && !out.some(o => o.key === key)) out.push({ kind: 'skill', key, name: s.名称, from, to: g });
    }
    return out;
}
export const GRADE_RULE = '【Hệ Thống Chư Thiên · Phẩm Giai】Khi thu lục công pháp mới hãy ghi 「收录:Tên công pháp[Phẩm giai]」, vật phẩm ghi rõ phẩm cấp; phẩm giai được phán đoán dựa theo uy lực bản thân của nó (Phàm phẩm = vật của phàm nhân / võ học phàm tục, Linh phẩm = Võ đạo Tông sư / Siêu phàm, Tiên phẩm = cấp thành phố đến đại lục, Thần phẩm = cấp hành tinh trở lên), nếu không ghi rõ sẽ vào sổ theo Phàm phẩm. Công pháp cốt truyện đã vào sổ nếu bị ghi thấp phẩm giai có thể ghi lại một lần 「收录:Tên công pháp[Phẩm giai đúng]」 để đính chính (chỉ tăng không giảm).';

export class Appraise {
    constructor(app) { this.app = app; this.disposers = []; this.busy = false; this.lastPrompt = null; }
    get hub() { return this.app.hub; }
    get settings() { return this.app.settings; }
    get cfg() { return { prompt: true, raise: true, ...(this.settings.get('appraise') || {}) }; }
    ledger() { try { const z = this.app.bridge.getVariables({ type: 'chat' })?.诸天系统; return z && typeof z === 'object' ? z : null; } catch { return null; } }
    start() {
        const hub = this.hub;
        if (hub) {
            hub.register('appraise', { title: 'Giám định phẩm giai', render: el => { this.el = el; this.render(); } });
            hub.hook('onEngineTab', (n, tools) => this.link(n, tools));
            hub.hook('onEngineView', () => this.scheduleRaise());
            hub.hook('onPage', p => { if (p !== 'appraise') { this.from = p; this.note = ''; } });
        }
        this.app.hubSettings?.addSection({ title: 'Giám định phẩm giai', sub: 'Công pháp / vật phẩm nhận được trong cốt truyện', items: [
            { type: 'switch', k: 'appraise.prompt', label: 'Nhắc AI ghi rõ phẩm giai khi thu lục', desc: 'Mỗi lượt một dòng nhắc: phán đoán theo uy lực bản thân của nó, nếu không ghi sẽ vào sổ theo Phàm phẩm.' },
            { type: 'switch', k: 'appraise.raise', label: 'Cho phép đính chính phẩm giai công pháp cốt truyện qua dòng 「收录:Tên công pháp[Phẩm giai cao hơn]」', desc: 'Chỉ có hiệu lực với công pháp không phải do hệ thống cấp, chỉ tăng không giảm. Bản gốc khi gặp công pháp trùng tên sẽ bỏ qua dòng này.' },
        ] });
        this.disposers.push(this.app.bridge.onChange(k => { if (k === 'chat') { this.syncPrompt(); this.scheduleRaise(); if (this.hub?.page === 'appraise') this.render(); } }));
        this.disposers.push(this.app.adapter.subscribe(() => this.syncPrompt()));
        this.disposers.push(this.settings.onChange(k => { if (k === 'appraise') { this.lastPrompt = null; this.syncPrompt(); } }));
        this.syncPrompt();
        return this;
    }
    syncPrompt() {
        try {
            const on = !!(this.app.adapter.currentIdentity() && this.cfg.prompt && this.ledger());
            const text = on ? GRADE_RULE : '';
            const live = this.app.bridge.livePrompt?.('grade') ?? text;
            if (text === this.lastPrompt && live === text) return; this.lastPrompt = text;
            if (text) this.app.bridge.injectPrompts([{ id: 'grade', content: text, position: 'in_chat', depth: 4, role: 'system' }]);
            else this.app.bridge.uninjectPrompts(['grade']);
        } catch (e) { console.warn('[Chư Thiên Giám Định] Tiêm gợi ý thất bại', e); }
    }
    /** 背包 tab of the engine: a link to this page (Tu hành has its own button in the Tu hành strip). */
    link(n, tools) {
        tools.querySelector('.zt-appraise-link')?.remove();
        if (n !== 6) return;
        const b = document.createElement('button'); b.type = 'button'; b.className = 'zt-btn small zt-appraise-link'; b.textContent = 'Giám định phẩm giai ›';
        b.title = 'Vật phẩm nhận được trong cốt truyện bị ghi nhầm thành Phàm phẩm có thể phán định lại tại đây';
        b.addEventListener('click', () => this.hub.go('appraise'));
        tools.append(b);
    }
    // ---------- 收录 line raises ----------
    scheduleRaise() { clearTimeout(this.timer); this.timer = setTimeout(() => this.raiseFromPanel().catch(e => console.warn('[Chư Thiên Giám Định] Chưa ghi nhận đính chính thu lục', e)), 700); }
    async raiseFromPanel() {
        if (!this.cfg.raise || this.busy) return null;
        const a = this.app.adapter, sb = this.app.statusbar;
        if (!a.currentIdentity() || a.isGenerating() || (sb?.state?.mode || 'terminal') !== 'terminal') return null;
        const lp = sb?.latestPanel?.(), chat = a.context()?.chat || [];
        if (!lp || lp.id !== chat.length - 1) return null;
        const z = this.ledger(), rec = z?.面板账本?.[String(lp.id)]; if (!z || !rec?.h) return null;
        const mark = `收录更正:${lp.id}:${rec.h}`;
        if (this.lastMark === mark || (z.功法记录 || []).some(r => r?.凭据 === mark)) return null;
        const ups = gradeRaises(z, panelField(lp.panel, '功法修炼'));
        if (!ups.length) { this.lastMark = mark; return null; }
        const done = await this.write(ups.map(u => ({ entry: u, grade: u.to })), { how: '收录更正', mark, floor: lp.id });
        this.lastMark = mark;
        if (done.length) this.hub?.toast?.(`Đã đính chính phẩm giai: ${done.map(d => `${d.name} ${L.gradeLabel(d.from)}→${L.gradeLabel(d.to)}`).join(', ')}`, 3600);
        return done;
    }
    // ---------- writes ----------
    async write(list, { how = 'AI', reason = '', mark = '', floor = null, token = capture(this.app) } = {}) {
        this.busy = true;
        try {
            const derive = (() => { try { const f = this.hub?.engineFrame?.contentWindow?.ztDerive; return typeof f === 'function' ? f : null; } catch { return null; } })();
            assertCapture(this.app, token);
            return await L.commit(this.app.bridge, (v, z) => {
                assertCapture(this.app, token);
                if (mark && (z.功法记录 || []).some(r => r?.凭据 === mark)) return [];
                const at = Date.now(), done = [];
                for (const { entry, grade, why } of list) {
                    const r = regrade(z, entry, grade, { how, reason: why || reason, at }); if (!r.changed) continue;
                    done.push(r);
                    if (!mark) for (const p of Object.values(z.面板账本 || {})) if (p?.snap) try { regrade(p.snap, entry, grade, { how, reason: why || reason, at }); } catch { /* not in that snapshot */ }
                    if (entry.kind === 'skill') {
                        const log = Array.isArray(z.功法记录) ? z.功法记录 : (z.功法记录 = []);
                        log.push({ 名称: r.name, 变化: `Phẩm giai ${L.gradeLabel(r.from)}→${L.gradeLabel(r.to)} (${how})`, 时间: at, ...(floor != null ? { 楼层: floor } : {}), ...(mark ? { 凭据: mark } : {}) });
                        while (log.length > 30) log.shift();
                    }
                }
                if (done.length) { z.界面记账时间 = at; if (derive) try { derive(v); } catch { /* next engine write derives */ } }
                return done;
            }, z => [JSON.stringify((z.功法库 || []).map(s => [s?.名称, s?.品阶])), JSON.stringify((z.背包 || []).map(x => [x?.名称, x?.品级, x?.数量]))]);
        } finally { this.busy = false; }
    }
    /** Ask the model (API theo tính năng Giám định phẩm giai → default connection → API chính của SillyTavern). */
    async appraise(entry) {
        const token = capture(this.app);
        const z = this.ledger(); if (!z) throw Error('Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên, vui lòng tạo trước tại 「Cài đặt → Khởi tạo trò chuyện mới」.');
        if (this.app.adapter.isGenerating()) throw Error('Cuộc trò chuyện chính đang tạo phản hồi, vui lòng đợi kết thúc rồi mới giám định.');
        const { system, user } = appraisePrompt(entry, z);
        let cfg = {}; try { cfg = readConfigs(this.app.bridge).status || {}; } catch { cfg = {}; }
        const custom = cfg.url ? { apiurl: cfg.url, key: cfg.key, model: cfg.model, max_tokens: 2048, temperature: 0.3 } : undefined;
        const text = await this.app.bridge.generateRaw({ user_input: user, ordered_prompts: [{ role: 'system', content: system }, 'user_input'], custom_api: custom, max_tokens: 2048, route: 'appraise' });
        assertCapture(this.app, token);
        const res = parseAppraisal(text);
        const done = await this.write([{ entry, grade: res.grade, why: res.reason }], { how: 'AI 鉴定', token });
        return { ...res, from: entry.grade, changed: done.length > 0 };
    }
    // ---------- page ----------
    render() {
        const el = this.el; if (!el) return;
        const z = this.ledger();
        if (!z) { el.innerHTML = '<div class="zt-empty">Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên.<br>Hãy tạo trước tại 「Cài đặt → Khởi tạo trò chuyện mới」 rồi quay lại.</div>'; return; }
        const { skills, items } = candidates(z);
        const howLabel = h => ({ 'AI 鉴定': 'AI giám định', '手动修正': 'Sửa thủ công', '收录更正': 'Đính chính thu lục' }[h] || h);
        const row = e => {
            const opts = APPRAISE_GRADES.filter(g => gi(g) > gi(e.grade)).map(g => `<option value="${g}">${L.gradeLabel(g)}</option>`).join('');
            const top = e.grade === '神品' || e.grade === '禁忌';
            const st = e.stamp ? `<span class="zt-desc">Lần trước: ${esc(howLabel(e.stamp.方式 || ''))} ${esc(L.gradeLabel(e.stamp.原品阶 || ''))}→${esc(L.gradeLabel(e.stamp.品阶 || ''))}${e.stamp.理由 ? ' · ' + esc(e.stamp.理由) : ''}</span>` : '';
            return `<div class="zt-row" data-ap-row="${esc(e.kind)}:${esc(e.key)}"><span><b style="font-weight:500">${esc(e.name)}</b> <span class="zt-grade" data-g="${esc(e.grade)}">${esc(L.gradeLabel(e.grade))}</span> <small class="zt-desc" style="display:inline">${esc(e.extra)} · Nguồn ${esc(e.src || 'Chưa ghi nhận')}</small>${e.desc ? `<span class="zt-desc">${esc(e.desc.slice(0, 80))}</span>` : ''}${st}</span>
<span class="zt-actions" style="flex-wrap:wrap;justify-content:flex-end">${top ? '<span class="zt-chip">Đã cao nhất</span>' : `<button type="button" class="zt-btn small" data-ap-ai>AI giám định</button><select data-ap-pick aria-label="Sửa phẩm giai thủ công"><option value="">Sửa thủ công…</option>${opts}</select>`}</span></div>`;
        };
        el.innerHTML = `<div class="zt-eyebrow">APPRAISAL</div><h2 class="zt-h">Giám định phẩm giai</h2>
<p class="zt-sub">Công pháp và vật phẩm nhận được trong cốt truyện, hoặc đến từ thẻ nhân vật / bản lưu cũ chưa qua hệ thống giám định nên thường bị ghi thành Phàm phẩm. Tại đây bạn có thể để AI giám định lại theo tiêu chuẩn thống nhất của Chư Thiên, hoặc tự sửa thủ công.<br><small>Chỉ tăng không giảm, tối đa Thần phẩm; những thứ do chính hệ thống cấp (Thương Thành, Hộp mù, Dung Lô, Động Thiên, Phần thưởng nhiệm vụ, Nhóm chat…) không nằm ở đây. Vật phẩm sau khi đổi phẩm giai vẫn giữ nguyên giá thu hồi cũ.</small></p>
<div class="zt-actions" style="margin-bottom:10px"><button class="zt-btn" type="button" data-ap-back>‹ Quay lại</button></div>
<section class="zt-card"><h3>Công pháp <small>${skills.length} bộ có thể giám định</small></h3>${skills.map(row).join('') || '<div class="zt-note">Không có công pháp nào cần giám định (công pháp do hệ thống cấp đã được hệ thống phán định).</div>'}</section>
<section class="zt-card"><h3>Vật phẩm <small>${items.length} món có thể giám định</small></h3>${items.map(row).join('') || '<div class="zt-note">Trong túi đồ không có vật phẩm nào cần giám định.</div>'}</section>
<output class="zt-note" data-ap-out aria-live="polite">${esc(this.note || '')}</output>`;
        const out = el.querySelector('[data-ap-out]');
        const find = rowEl => { const [kind, ...k] = rowEl.dataset.apRow.split(':'), key = k.join(':'); const c = candidates(this.ledger() || {}); return (kind === 'skill' ? c.skills : c.items).find(e => e.key === key); };
        el.onclick = async e => {
            if (e.target.closest('[data-ap-back]')) return this.hub.go(this.from || 'cult');
            const b = e.target.closest('[data-ap-ai]'); if (!b || this.busy) return;
            const entry = find(b.closest('[data-ap-row]')); if (!entry) return this.render();
            b.disabled = true; b.textContent = 'Đang giám định…'; out.textContent = '';
            try {
                const r = await this.appraise(entry);
                const msg = r.changed ? `「${entry.name}」 được giám định là 〔${L.gradeLabel(r.grade)}〕 (cũ: ${L.gradeLabel(r.from)}). ${r.reason ? 'Lý do: ' + r.reason : ''}` : `Kết quả giám định 「${entry.name}」 là 〔${L.gradeLabel(r.grade)}〕, không cao hơn mức 〔${L.gradeLabel(r.from)}〕 hiện tại nên giữ nguyên. ${r.reason ? 'Lý do: ' + r.reason : ''}`;
                this.note = msg; this.render(); this.hub.toast(msg, 4200);
                if (r.changed) this.hub.scheduleEngineView?.(150);
            } catch (err) { out.textContent = errorLine(err); b.disabled = false; b.textContent = 'AI giám định'; }
        };
        el.onchange = async e => {
            const s = e.target.closest('[data-ap-pick]'); if (!s || !s.value || this.busy) return;
            const entry = find(s.closest('[data-ap-row]')), g = s.value; if (!entry) return this.render();
            if (!globalThis.confirm(`Đổi thủ công 「${entry.name}」 từ 〔${L.gradeLabel(entry.grade)}〕 sang 〔${L.gradeLabel(g)}〕?\nChỉ tăng không giảm, sau khi đổi sẽ không thể hạ xuống lại. ${entry.kind === 'item' ? 'Giá thu hồi vẫn giữ nguyên như cũ.' : 'Giới hạn độ thuần thục công pháp sẽ tăng theo phẩm giai.'}`)) { s.value = ''; return; }
            try {
                const done = await this.write([{ entry, grade: g }], { how: '手动修正' });
                const msg = done.length ? `Đã đổi 「${entry.name}」 thành 〔${L.gradeLabel(g)}〕.` : 'Không có thay đổi (phẩm giai hiện tại đã không thấp hơn mức chọn).';
                this.note = msg; this.render(); this.hub.toast(msg, 3000); this.hub.scheduleEngineView?.(150);
            } catch (err) { out.textContent = errorLine(err); s.value = ''; }
        };
    }
    dispose() { clearTimeout(this.timer); this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); try { this.app.bridge.uninjectPrompts(['grade']); } catch { /* ignore */ } }
}
