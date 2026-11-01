// Tu hành · Độ thuần thục (0.8.0): makes the original 功法 mastery system matter in play, and reads 功法 from other character cards.
import { STORAGE, inert } from './contracts.js';
import * as L from './ledger-ops.js';
import { esc, fmtNum } from './hub.js';
import { stripPanels, fieldOf } from './panel-guard.js';

export const STAGES = ['未入门', '入门', '熟练', '精通', '宗师', '入道'];
export const STAGE_LABELS = Object.freeze({
    未入门: 'Chưa Nhập Môn',
    入门: 'Nhập Môn',
    熟练: 'Thuần Thục',
    精通: 'Tinh Thông',
    宗师: 'Tông Sư',
    入道: 'Nhập Đạo',
    圆满: 'Viên Mãn',
});
export const stageLabel = s => String(s || '').split('·').map(p => STAGE_LABELS[p] || p).join('·');
export const STAGE_AT = Object.freeze({ 入门: 100, 熟练: 500, 精通: 2000, 宗师: 10000 });
export const GRADE_CAP = Object.freeze({ 凡品: 100, 灵品: 500, 仙品: 2000, 神品: 10000, 禁忌: 10000 });
const GRADE_ORDER = ['凡品', '灵品', '仙品', '神品', '禁忌'];
/** Original ZT_STAGE_REWARD texts (statusbar 3.1), plus the 未入门 baseline. */
export const STAGE_EFFECT = Object.freeze({
    未入门: 'Chưa nhập môn: thi triển còn gượng gạo, uy lực không ổn định, có thể thất bại',
    入门: 'Nắm vững động tác và nguyên lý cơ bản',
    熟练: 'Tiêu hao thể lực/pháp lực của kỹ năng này giảm vĩnh viễn 30%',
    精通: 'Nhận được chút cảm ngộ pháp tắc, uy lực kỹ năng tăng 100%',
    宗师: 'Bản chất kỹ năng lột xác, có thể diễn sinh áo nghĩa độc quyền hoặc hiệu ứng đặc biệt',
    入道: 'Hóa thành bản năng pháp tắc, phát động tức thì không tiêu hao, đồng thời thưởng một lần lượng lớn Điểm Hệ Thống',
});
export const PRACTICE_GAIN = Object.freeze({ 凡品: 3, 灵品: 2, 仙品: 1, 神品: 1, 禁忌: 1 });
const PRACTICE_MAX = 2;
const num = (x, d = 0) => { const n = Number(String(x ?? '').replace(/[,，\s]/g, '')); return Number.isFinite(n) ? n : d; };

// ---------- pure helpers (same rules as the original engine) ----------
export const normName = t => String(t || '').replace(/[（(【\[〔][^）)】\]〕]*[）)】\]〕]/g, '').replace(/[「」《》“”"']/g, '').replace(/\s+/g, ' ').trim();
export const normGrade = t => {
    const s = String(t || '').trim();
    const low = s.toLowerCase();
    if (s.includes('禁') || low.includes('cấm kỵ') || low.includes('cam ky')) return '禁忌';
    if (s.includes('神') || low.includes('thần phẩm') || low.includes('than pham') || low.includes('thần giai')) return '神品';
    if (s.includes('仙') || low.includes('tiên phẩm') || low.includes('tien pham') || low.includes('tiên giai')) return '仙品';
    if (s.includes('灵') || low.includes('linh phẩm') || low.includes('linh pham') || low.includes('linh giai')) return '灵品';
    if (s.includes('凡') || low.includes('phàm phẩm') || low.includes('pham pham') || low.includes('phàm giai')) return '凡品';
    return '';
};
/** Lowest grade whose cap holds this mastery (card skills without a grade). */
export const gradeFor = m => m <= 100 ? '凡品' : m <= 500 ? '灵品' : m <= 2000 ? '仙品' : '神品';
export const gradeOfCap = c => c >= 1e4 ? '神品' : c >= 2e3 ? '仙品' : c >= 500 ? '灵品' : '凡品';
/** Normalised copy of a 功法库 entry (the original ztFixSkill, without mutating the input). */
export function fixSkill(s) {
    const o = { ...(s || {}) };
    o.名称 = String(o.名称 || 'Công pháp vô danh').trim();
    const cap = Math.floor(num(o.上限, 0)), g = normGrade(o.品阶) || (cap ? gradeOfCap(cap) : '凡品');
    o.品阶 = g; o.上限 = cap > 0 ? cap : GRADE_CAP[g]; o.熟练度 = Math.max(0, Math.floor(num(o.熟练度, 0)));
    return o;
}
export function stageOf(s) {
    if (!s) return '未入门'; if (s.入道) return '入道';
    const m = Math.min(num(s.熟练度), 1e4);
    return m >= 1e4 ? '宗师' : m >= 2e3 ? '精通' : m >= 500 ? '熟练' : m >= 100 ? '入门' : '未入门';
}
export function nextTarget(s) {
    const t = { 未入门: 100, 入门: 500, 熟练: 2000, 精通: 10000 }[stageOf(s)];
    return t && t <= num(s.上限, 100) ? t : null;
}
/** Effects that are in force for this skill now (cumulative up to its stage). */
export function effectsOf(s) {
    const st = stageOf(s), i = STAGES.indexOf(st);
    if (i <= 0) return [STAGE_EFFECT.未入门];
    return STAGES.slice(1, i + 1).map(k => STAGE_EFFECT[k].replace(/，并一次性奖励海量系统点$|, đồng thời thưởng một lần lượng lớn Điểm Hệ Thống$/, ''));
}
/** Hiệu quả thực tế của công pháp prompt (pure). Main skill first, at most 12. */
export function masteryPrompt(z) {
    const lib = (Array.isArray(z?.功法库) ? z.功法库 : []).map(fixSkill);
    if (!lib.length) return '';
    const main = normName(z?.功法?.名称);
    lib.sort((a, b) => (normName(b.名称) === main) - (normName(a.名称) === main));
    const lines = ['【Hệ Thống Chư Thiên · Hiệu Quả Thực Tế Của Công Pháp】Các hiệu quả dưới đây đã được hệ thống kết toán và có hiệu lực thực tế. Trong chính văn khi Ký chủ thi triển những công pháp này bắt buộc phải thể hiện đúng hiệu quả của giai đoạn tương ứng, không được vượt quá giai đoạn hiện tại; công pháp Chưa Nhập Môn thi triển không ổn định.'];
    for (const s of lib.slice(0, 12)) {
        const st = stageOf(s), nx = nextTarget(s), full = !s.入道 && s.熟练度 >= s.上限;
        lines.push(`- ${s.名称}〔${L.gradeLabel(s.品阶)}〕${s.熟练度}/${s.上限}【${stageLabel(st)}${full ? '·Viên Mãn' : ''}】: ${effectsOf(s).join('; ')}${nx ? ` (giai đoạn tiếp theo 「${stageLabel(STAGES[STAGES.indexOf(st) + 1])}」 cần ${nx})` : full ? ' (đã đạt giới hạn phẩm giai này, cần thăng phẩm hoặc xung kích Nhập Đạo)' : ''}`);
    }
    if (lib.length > 12) lines.push(`- ……Còn ${lib.length - 12} bộ công pháp khác, hiệu quả áp dụng theo quy tắc trên.`);
    lines.push('Khi Ký chủ thực sự thi triển, khổ luyện hoặc lĩnh ngộ một môn công pháp trong chính văn, hãy ghi ở dòng 「功法修炼」 trong khối dữ liệu theo mẫu 「Tên công pháp+N(lý do)」: thi triển thường ngày 1–5, khổ luyện 5–20, chiến đấu sinh tử hoặc độn ngộ 20–100; nếu không dùng tới thì không ghi. Những lần sử dụng thực chiến bị quên ghi sẽ được hệ thống tự động bù một lượng nhỏ độ thuần thục.');
    return lines.join('\n');
}
/** Panel field 功法修炼 (pure; same field syntax as the original ztParsePanel + Vietnamese aliases). */
export function panelField(panel, key) {
    let cur = null; const out = {};
    for (const line of String(panel || '').replace(/\r/g, '').split('\n')) {
        const f = fieldOf(line);
        if (f) { cur = f; out[cur] = line.slice(line.search(/[:：]/) + 1).trim(); }
        else {
            const m = line.match(/^\s*[-*•]?\s*([\u4e00-\u9fa5]{2,4})\s*[:：]\s*(.*)$/);
            if (m) { cur = m[1]; out[cur] = m[2].trim(); } else if (cur && line.trim()) out[cur] += '\n' + line.trim();
        }
    }
    return out[key] ?? '';
}
/** Story text of a floor without data blocks, tags and code. */
export function storyText(mes) {
    return stripPanels(mes).replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
}
/** Tích lũy thực chiến candidates (pure). Returns [{name, gain, before, after, from, to}] — nothing when the panel already handled it. */
export function practiceGains(z, story, practiceLine, max = PRACTICE_MAX) {
    const lib = (Array.isArray(z?.功法库) ? z.功法库 : []).map(fixSkill);
    const text = String(story || ''), handled = String(practiceLine || '');
    const main = normName(z?.功法?.名称), out = [];
    const order = lib.map((s, i) => ({ s, i })).sort((a, b) => (normName(b.s.名称) === main) - (normName(a.s.名称) === main));
    for (const { s } of order) {
        if (out.length >= max) break;
        const n = normName(s.名称); if (n.length < 2 || s.入道 || s.熟练度 >= s.上限) continue;
        if (!text.includes(n) || handled.includes(n)) continue;
        const gain = Math.min(PRACTICE_GAIN[s.品阶] || 1, s.上限 - s.熟练度); if (gain <= 0) continue;
        const after = { ...s, 熟练度: s.熟练度 + gain };
        out.push({ name: s.名称, gain, before: s.熟练度, after: after.熟练度, from: stageOf(s), to: stageOf(after), cap: s.上限 });
    }
    return out;
}

const practiced = (z, mark) => (Array.isArray(z?.功法记录) ? z.功法记录 : []).some(r => r?.凭据 === mark);
/** Tích lũy thực chiến entries of 功法记录 as {名称, 增加, 楼层, 时间}. */
export const practiceLog = z => (Array.isArray(z?.功法记录) ? z.功法记录 : []).filter(r => /实战积累|Tích lũy thực chiến/i.test(String(r?.变化 || ''))).map(r => ({ 名称: r.名称, 增加: num(String(r.变化).match(/\+(\d+)/)?.[1]), 楼层: r.楼层 ?? '?', 时间: r.时间 }));

// ---------- Công pháp thẻ nhân vật (pure) ----------
const SKILL_KEY = /功法|技能|武技|武学|法术|神通|秘籍|招式|心法|绝学|công pháp|kỹ năng|võ kỹ|võ học|pháp thuật|thần thông|bí tịch|chiêu thức|tâm pháp|tuyệt học|^skills?$|^abilities$|^spells?$/i;
const NAME_KEYS = ['名称', '名字', '功法名', '技能名', '名', 'tên', 'tên công pháp', 'tên kỹ năng', 'name', 'title'];
const MASTERY_KEYS = ['熟练度', '熟练', '进度', '经验', '修炼进度', 'độ thuần thục', 'thuần thục', 'tiến độ', 'kinh nghiệm', 'proficiency', 'mastery', 'exp'];
const STAGE_KEYS = ['境界', '阶段', '层次', '火候', '程度', 'cảnh giới', 'giai đoạn', 'tầng thứ', 'stage', 'level', '等级', 'cấp độ'];
const GRADE_KEYS = ['品阶', '品级', '品质', '等阶', '品', 'phẩm giai', 'phẩm cấp', 'phẩm chất', 'grade', 'rank', 'tier'];
const DESC_KEYS = ['描述', '效果', '说明', '简介', 'mô tả', 'hiệu quả', 'giới thiệu', 'desc', 'description', 'effect'];
const STAGE_WORDS = [[/入道|化境|返璞归真|nhập đạo|hóa cảnh/i, 10000], [/宗师|圆满|大圆满|登峰造极|出神入化|tông sư|viên mãn|đại viên mãn/i, 10000], [/精通|大成|炉火纯青|tinh thông|đại thành/i, 2000], [/熟练|小成|得心应手|thuần thục|tiểu thành/i, 500], [/入门|初学|初窥门径|略懂|nhập môn|sơ học/i, 100], [/未入门|未学|chưa nhập môn|chưa học/i, 0]];
const pick = (o, keys) => { for (const k of keys) for (const kk of Object.keys(o)) if (kk.toLowerCase() === k.toLowerCase() && o[kk] != null && o[kk] !== '') return unwrap(o[kk]); return undefined; };
/** MVU stores [value, description] pairs. */
const looksDesc = s => /[。：:，,；;！!？?\s]/.test(s) || s.length > 12;
const unwrap = v => Array.isArray(v) && v.length === 2 && typeof v[1] === 'string' && !Array.isArray(v[0]) && (typeof v[0] !== 'string' || looksDesc(v[1])) ? v[0] : v;
function masteryFrom(m, stage) {
    if (m != null && m !== '') {
        const s = String(m), frac = s.match(/^\s*(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*$/);
        if (frac) return num(frac[1]);
        if (/^\s*-?[\d,.]+\s*%?\s*$/.test(s)) return Math.max(0, Math.floor(num(s.replace('%', ''))));
        for (const [re, v] of STAGE_WORDS) if (re.test(s)) return v;
    }
    if (stage != null) { const s = String(stage); for (const [re, v] of STAGE_WORDS) if (re.test(s)) return v; }
    return null;
}
function skillFrom(o, name, path) {
    const nm = inert(String(name ?? pick(o, NAME_KEYS) ?? '')).trim().slice(0, 30); if (!normName(nm)) return null;
    const stage = pick(o, STAGE_KEYS), m = masteryFrom(pick(o, MASTERY_KEYS), stage);
    const g = normGrade(pick(o, GRADE_KEYS)) || '';
    return { 名称: nm, 熟练度: m, 品阶: g, 描述: inert(String(pick(o, DESC_KEYS) ?? '')).trim().slice(0, 80), path };
}
function parseContainer(v, path, out) {
    v = unwrap(v);
    if (typeof v === 'string') { v.split(/[、,，;；\n|｜]+/).map(x => x.trim()).filter(Boolean).slice(0, 40).forEach(x => { const m = x.match(/^(.+?)\s*[〔（(【\[]([^〕）)】\]]*)[〕）)】\]]\s*(.*)$/); const s = skillFrom(m ? { 品阶: m[2], 境界: m[2], 熟练度: m[3] || undefined } : {}, m ? m[1] : x, path); if (s) out.push(s); }); return; }
    if (Array.isArray(v)) { v.slice(0, 60).forEach((it, i) => { it = unwrap(it); if (typeof it === 'string') parseContainer(it, `${path}[${i}]`, out); else if (it && typeof it === 'object') { const s = skillFrom(it, undefined, `${path}[${i}]`); if (s) out.push(s); } }); return; }
    if (!v || typeof v !== 'object') return;
    if (pick(v, NAME_KEYS) !== undefined) { const s = skillFrom(v, undefined, path); if (s) out.push(s); return; }
    for (const [k, raw] of Object.entries(v).slice(0, 60)) {
        if (k.startsWith('$') || k.startsWith('_')) continue;
        const it = unwrap(raw), p = `${path}.${k}`;
        if (it && typeof it === 'object' && !Array.isArray(it)) { const s = skillFrom(it, k, p); if (s) out.push(s); }
        else if (typeof it === 'number' || typeof it === 'string') { const s = skillFrom(typeof it === 'number' ? { 熟练度: it } : /^\s*[\d,./%\s]+$/.test(it) ? { 熟练度: it } : { 境界: it, 品阶: it, 描述: it }, k, p); if (s) out.push(s); }
    }
}
/** Walks any variable tree (depth ≤ 6) and returns the skill entries found under 功法-like keys. */
export function scanSkills(tree, root = '') {
    const out = [], seen = new Set();
    const walk = (o, path, depth) => {
        if (!o || typeof o !== 'object' || depth > 6 || seen.has(o)) return; seen.add(o);
        for (const [k, raw] of Object.entries(o).slice(0, 200)) {
            const p = path ? `${path}.${k}` : k, v = unwrap(raw);
            if (SKILL_KEY.test(k) && !/记录|待播报|日志|log|冷却|cd$/i.test(k)) parseContainer(v, p, out);
            else if (v && typeof v === 'object') walk(v, p, depth + 1);
        }
    };
    walk(tree, root, 0);
    const by = new Map();
    for (const s of out) { const n = normName(s.名称); const had = by.get(n); if (!had) by.set(n, s); else { if (had.熟练度 == null && s.熟练度 != null) had.熟练度 = s.熟练度; if (!had.品阶 && s.品阶) had.品阶 = s.品阶; } }
    return [...by.values()];
}
/** Merge card skills into a 功法库 copy: add new, raise only. Returns { lib, changes:[{name, kind, from, to}] }. */
export function mergeSkills(libIn, items, source = '角色卡') {
    const lib = (Array.isArray(libIn) ? libIn : []).map(s => ({ ...s })), changes = [];
    for (const it of items) {
        const n = normName(it.名称); if (!n) continue;
        const m = it.熟练度 == null ? null : Math.max(0, Math.floor(num(it.熟练度)));
        const g = normGrade(it.品阶) || (m != null ? gradeFor(m) : '');
        const hit = lib.find(s => normName(s.名称) === n);
        if (!hit) {
            const grade = g || '凡品', cap = GRADE_CAP[grade];
            const s = { 名称: n, 品阶: grade, 上限: cap, 熟练度: Math.min(cap, m ?? 0), 来源: source };
            if (it.描述) s.描述 = it.描述;
            lib.push(s); changes.push({ name: n, kind: '收录', to: `${L.gradeLabel(grade)} ${s.熟练度}/${cap}` }); continue;
        }
        const cur = fixSkill(hit);
        if (g && GRADE_ORDER.indexOf(g) > GRADE_ORDER.indexOf(cur.品阶)) { const before = cur.品阶; hit.品阶 = g; hit.上限 = Math.max(cur.上限, GRADE_CAP[g]); changes.push({ name: cur.名称, kind: '升品', from: L.gradeLabel(before), to: L.gradeLabel(g) }); }
        const cap = Math.max(num(hit.上限, cur.上限), cur.上限);
        if (m != null && m > cur.熟练度) { const to = Math.min(cap, m); if (to > cur.熟练度) { hit.熟练度 = to; changes.push({ name: cur.名称, kind: '熟练度', from: cur.熟练度, to }); } }
    }
    return { lib, changes };
}

// ---------- runtime ----------
export class SkillSync {
    constructor(app) { this.app = app; this.disposers = []; this.timer = 0; this.cardTimer = 0; this.lastPrompt = null; }
    get settings() { return this.app.settings; }
    get cfg() { return { prompt: true, practice: true, cardAuto: false, ...(this.settings.get('skills') || {}) }; }
    get ctx() { return this.app.adapter.context(); }
    ledger() { try { const z = this.app.bridge.getVariables({ type: 'chat' })?.诸天系统; return z && typeof z === 'object' ? z : null; } catch { return null; } }
    start() {
        const hub = this.app.hub;
        if (hub) {
            hub.register('skills', { title: 'Tu hành · Độ thuần thục', render: el => this.render(el) });
            hub.hook('onEngineTab', (n, tools) => this.strip(n, tools));
            hub.hook('onEngineView', () => this.schedulePractice());
            hub.hook('onTop', () => { if (hub.engineTab === 4 && hub.page === 'cult') this.refreshStrip(); });
        }
        this.app.hubSettings?.addSection({ title: 'Tu hành · Độ thuần thục', sub: 'Để độ thuần thục thực sự ảnh hưởng đến cốt truyện.', items: [
            { type: 'switch', k: 'skills.prompt', label: 'Cho AI biết hiệu quả thực tế của từng môn công pháp ở giai đoạn hiện tại', desc: 'Thuần Thục: tiêu hao −30%; Tinh Thông: uy lực +100%; Tông Sư: áo nghĩa độc quyền; Nhập Đạo: phát động tức thì không tiêu hao. Chưa Nhập Môn thi triển không ổn định.' },
            { type: 'switch', k: 'skills.practice', label: 'Tích lũy thực chiến: tự động bù lượng nhỏ độ thuần thục khi chính văn có dùng công pháp nhưng khối dữ liệu quên ghi', desc: 'Phàm phẩm +3 · Linh phẩm +2 · Tiên phẩm / Thần phẩm +1, mỗi tầng tối đa 2 bộ; khi tạo lại (lật trang) sẽ tự hủy cùng phản hồi cũ.' },
            { type: 'switch', k: 'skills.cardAuto', label: 'Tự động đồng bộ công pháp từ thẻ nhân vật (chỉ tăng không giảm)', desc: 'Khi tắt vẫn có thể nhập thủ công tại trang 「Tu hành」. Không sửa đổi biến riêng của thẻ nhân vật.' },
        ] });
        this.disposers.push(this.app.bridge.onChange(() => { this.syncPrompt(); this.scheduleCard(); }));
        this.disposers.push(this.app.adapter.subscribe(() => { this.syncPrompt(); this.scheduleCard(); }));
        this.disposers.push(this.settings.onChange(k => { if (k === 'skills') { this.lastPrompt = null; this.syncPrompt(); this.scheduleCard(); } }));
        this.syncPrompt();
        return this;
    }
    // ---------- 1. Hiệu quả thực tế của công pháp ----------
    syncPrompt() {
        try {
            const z = this.app.adapter.currentIdentity() ? this.ledger() : null;
            const text = z && this.cfg.prompt ? masteryPrompt(z) : '';
            const live = this.app.bridge.livePrompt?.('mastery') ?? text;
            if (text === this.lastPrompt && live === text) return; this.lastPrompt = text;
            if (text) this.app.bridge.injectPrompts([{ id: 'mastery', content: text, position: 'in_chat', depth: 4, role: 'system' }]);
            else this.app.bridge.uninjectPrompts(['mastery']);
        } catch (e) { console.warn('[Chư Thiên Tu Hành] Tiêm gợi ý thất bại', e); }
    }
    // ---------- 2. Tích lũy thực chiến ----------
    schedulePractice() { clearTimeout(this.timer); this.timer = setTimeout(() => this.practice().catch(e => console.warn('[Chư Thiên Tu Hành] Chưa ghi nhận tích lũy thực chiến', e)), 400); }
    derive() { try { const f = this.app.hub?.engineFrame?.contentWindow?.ztDerive; return typeof f === 'function' ? f : null; } catch { return null; } }
    async practice() {
        if (!this.cfg.practice || this.busy) return;
        const a = this.app.adapter, sb = this.app.statusbar;
        if (!a.currentIdentity() || a.isGenerating() || (sb?.state?.mode || 'terminal') !== 'terminal') return;
        const lp = sb?.latestPanel?.(); const chat = this.ctx.chat || [];
        if (!lp || lp.id !== chat.length - 1) return;
        const z = this.ledger(); const rec = z?.面板账本?.[String(lp.id)];
        if (!z || !rec?.h) return;
        const mark = `${lp.id}:${rec.h}`; if (practiced(z, mark) || this.lastMark === `${a.currentIdentity()}|${mark}`) return;
        const gains = practiceGains(z, storyText(chat[lp.id]?.mes), panelField(lp.panel, '功法修炼'));
        if (!gains.length) { this.lastMark = `${a.currentIdentity()}|${mark}`; return; }
        this.busy = true;
        try {
            const derive = this.derive();
            const out = await L.commit(this.app.bridge, (v, zz) => {
                if (practiced(zz, mark) || String(zz.面板账本?.[String(lp.id)]?.h || '') !== String(rec.h)) return [];
                const lib = Array.isArray(zz.功法库) ? zz.功法库 : (zz.功法库 = []);
                const done = [];
                for (const g of gains) {
                    const s = lib.find(x => normName(x?.名称) === normName(g.name)); if (!s) continue;
                    const f = fixSkill(s); if (f.熟练度 !== g.before) continue;
                    s.熟练度 = g.after;
                    const log = Array.isArray(zz.功法记录) ? zz.功法记录 : (zz.功法记录 = []);
                    log.push({ 名称: f.名称, 变化: `+${g.gain}(实战积累)`, 时间: Date.now(), 楼层: lp.id, 凭据: mark }); while (log.length > 30) log.shift();
                    const pend = Array.isArray(zz.功法待播报) ? zz.功法待播报 : (zz.功法待播报 = []);
                    if (g.to !== g.from) pend.push({ 名称: f.名称, 阶段: g.to, 奖励: STAGE_EFFECT[g.to] || '', 楼层: lp.id });
                    if (g.after >= f.上限 && !s.圆满) { s.圆满 = true; pend.push({ 名称: f.名称, 阶段: '圆满', 奖励: `〔${L.gradeLabel(f.品阶)}〕 đã luyện tới giới hạn, có thể thăng phẩm (Tuế Nguyệt Trầm Đọng/Thương Thành) hoặc xung kích Nhập Đạo`, 楼层: lp.id }); }
                    while (pend.length > 8) pend.shift();
                    done.push(g);
                }
                zz.界面记账时间 = Date.now();
                if (derive) try { derive(v); } catch { /* engine not ready: next engine write derives */ }
                return done;
            }, zz => [practiced(zz, mark), JSON.stringify((zz.功法库 || []).map(s => [s?.名称, s?.熟练度]))]);
            if (out?.length) {
                this.app.hub?.toast?.(`Tích lũy thực chiến: ${out.map(g => `${g.name} +${g.gain}${g.to !== g.from ? ` (${stageLabel(g.to)}!)` : ''}`).join(', ')}`, 3600);
                this.app.hub?.scheduleEngineView?.(200);
            }
        } finally { this.busy = false; }
    }
    // ---------- 3. Công pháp thẻ nhân vật ----------
    cardSources() {
        const out = [], c = this.ctx;
        try {
            const vars = this.app.bridge.getVariables({ type: 'chat' }) || {};
            const other = Object.fromEntries(Object.entries(vars).filter(([k]) => !['诸天系统', '诸天记忆助手_v1', STORAGE].includes(k)));
            const items = scanSkills(other, 'Biến trò chuyện'); if (items.length) out.push({ label: 'Biến trò chuyện (kịch bản / thẻ khác)', items });
        } catch { /* ignore */ }
        try {
            const chat = c.chat || [];
            for (let i = chat.length - 1; i >= Math.max(0, chat.length - 30); i--) {
                const m = chat[i], v = m?.variables?.[m.swipe_id ?? 0];
                if (v && typeof v === 'object' && Object.keys(v).length) { const tree = v.stat_data && typeof v.stat_data === 'object' ? v.stat_data : v; const items = scanSkills(tree, `Tầng ${i}.stat_data`); if (items.length) out.push({ label: `Biến tầng MVU (Tầng ${i})`, items }); break; }
            }
        } catch { /* ignore */ }
        try {
            const ch = c.characters?.[c.characterId], ext = ch?.data?.extensions;
            const th = ext?.tavern_helper ?? ext?.TavernHelper_characterVariables;
            if (th && typeof th === 'object') { const items = scanSkills(th.variables ?? th, 'Thẻ nhân vật.tavern_helper'); if (items.length) out.push({ label: `Biến thẻ nhân vật (${ch.name || 'nhân vật hiện tại'})`, items }); }
        } catch { /* ignore */ }
        return out;
    }
    cardPlan(z = this.ledger()) {
        const sources = this.cardSources(), by = new Map();
        for (const src of sources) for (const it of src.items) { const n = normName(it.名称); if (!by.has(n)) by.set(n, { ...it }); }
        const all = [...by.values()];
        const plan = mergeSkills(z?.功法库, all.map(s => ({ ...s })));
        return { sources, items: all, changes: plan.changes };
    }
    scheduleCard() { if (!this.cfg.cardAuto) return; clearTimeout(this.cardTimer); this.cardTimer = setTimeout(() => this.importCard({ auto: true }).catch(e => console.warn('[Chư Thiên Tu Hành] Chưa đồng bộ công pháp thẻ nhân vật', e)), 1500); }
    async importCard({ auto = false } = {}) {
        if (this.busy || !this.app.adapter.currentIdentity() || this.app.adapter.isGenerating()) return null;
        const z = this.ledger(); if (!z) { if (!auto) throw Error('Cuộc trò chuyện hiện tại chưa có sổ cái Chư Thiên, vui lòng tạo trước tại 「Cài đặt → Khởi tạo trò chuyện mới」.'); return null; }
        const plan = this.cardPlan(z); if (!plan.changes.length) { if (!auto) this.app.hub?.toast?.('Công pháp thẻ nhân vật đã khớp với kho công pháp, không có mục nào cần đồng bộ.'); return plan; }
        const paths = [...new Set(plan.items.map(s => s.path.split(/[.[]/)[0]))];
        this.busy = true;
        try {
            const derive = this.derive();
            const res = await L.commit(this.app.bridge, (v, zz) => {
                const m = mergeSkills(zz.功法库, plan.items, '角色卡'); if (!m.changes.length) return m;
                zz.功法库 = m.lib;
                for (const r of Object.values(zz.面板账本 || {})) if (r?.snap && Array.isArray(r.snap.功法库)) r.snap.功法库 = mergeSkills(r.snap.功法库, plan.items, '角色卡').lib;
                const log = Array.isArray(zz.功法记录) ? zz.功法记录 : (zz.功法记录 = []);
                for (const ch of m.changes) log.push({ 名称: ch.name, 变化: ch.kind === '收录' ? `Thu lục (thẻ nhân vật) ${ch.to}` : `${ch.kind} ${ch.from}→${ch.to} (thẻ nhân vật)`, 时间: Date.now() });
                while (log.length > 30) log.shift();
                zz.角色卡功法同步 = { 时间: Date.now(), 来源: paths, 部数: plan.items.length, 变化: m.changes.length, 自动: auto };
                zz.界面记账时间 = Date.now();
                if (derive) try { derive(v); } catch { /* ignore */ }
                return m;
            }, zz => [JSON.stringify((zz.功法库 || []).map(s => [s?.名称, s?.熟练度, s?.品阶])), zz.角色卡功法同步?.时间]);
            const kindLabel = k => ({ '收录': 'Thu lục', '升品': 'Thăng phẩm', '熟练度': 'Độ thuần thục' }[k] || k);
            this.app.hub?.toast?.(`Đã đồng bộ công pháp thẻ nhân vật: ${res.changes.length} thay đổi (${res.changes.slice(0, 3).map(c => c.name + ' ' + kindLabel(c.kind)).join(', ')}${res.changes.length > 3 ? '…' : ''})`, 4200);
            this.app.hub?.scheduleEngineView?.(150);
            if (this.app.hub?.page === 'skills') this.render(this.app.hub.pages.get('skills').el);
            return res;
        } finally { this.busy = false; }
    }
    // ---------- UI ----------
    strip(n, tools) {
        if (n !== 4) { if (tools.dataset.owner === 'skills') { tools.innerHTML = ''; delete tools.dataset.owner; tools.onclick = null; } return; }
        tools.dataset.owner = 'skills'; this.tools = tools; this.refreshStrip();
        tools.onclick = e => {
            if (e.target.closest('[data-sk-more]')) return this.app.hub.go('skills');
            if (e.target.closest('[data-sk-appraise]')) return this.app.hub.go('appraise');
            if (e.target.closest('[data-sk-import]')) this.importCard().catch(err => this.app.hub.toast(err.message, 4000));
        };
    }
    refreshStrip() {
        const tools = this.tools; if (!tools || tools.dataset.owner !== 'skills') return;
        const z = this.ledger() || {}, lib = (z.功法库 || []).map(fixSkill), main = lib.find(s => normName(s.名称) === normName(z.功法?.名称));
        let card = { items: [], changes: [] }; try { card = this.cardPlan(z); } catch { /* ignore */ }
        const nx = main ? nextTarget(main) : null, last = practiceLog(z).at(-1);
        tools.innerHTML = `<div class="zt-plug-strip"><span class="zt-plug-title">Tu hành</span>${main ? `<span class="zt-chip" title="${esc(effectsOf(main).join('; '))}">${esc(main.名称)} · ${stageLabel(stageOf(main))}${nx ? ` · Cách giai đoạn tiếp theo ${fmtNum(nx - main.熟练度)}` : ''}</span>` : '<span class="zt-note">Chưa có công pháp chủ tu</span>'}${last ? `<span class="zt-chip">Thực chiến ${esc(last.名称)} +${last.增加}</span>` : ''}${card.items.length ? `<span class="zt-chip">Công pháp thẻ nhân vật ${card.items.length} bộ${card.changes.length ? ` · ${card.changes.length} mục có thể đồng bộ` : ' · Đã đồng bộ'}</span>${card.changes.length ? '<button type="button" class="zt-btn small primary" data-sk-import>Nhập / Đồng bộ</button>' : ''}` : ''}<button type="button" class="zt-btn small" data-sk-appraise title="Công pháp nhận được trong cốt truyện bị ghi nhầm thành Phàm phẩm có thể giám định lại tại đây" style="margin-left:auto">Giám định phẩm giai ›</button><button type="button" class="zt-btn small" data-sk-more>Hiệu quả giai đoạn & Nguồn gốc ›</button></div>`;
    }
    render(el) {
        const z = this.ledger(), lib = (z?.功法库 || []).map(fixSkill), main = normName(z?.功法?.名称);
        let card = { sources: [], items: [], changes: [] }; try { card = this.cardPlan(z || {}); } catch { /* ignore */ }
        const rows = lib.map(s => { const st = stageOf(s), nx = nextTarget(s), pct = Math.min(100, Math.round(s.熟练度 / Math.max(1, s.上限) * 100));
            return `<div class="zt-row"><span><b style="font-weight:500">${esc(s.名称)}</b> <span class="zt-grade" data-g="${esc(s.品阶)}">${esc(L.gradeLabel(s.品阶))}</span>${normName(s.名称) === main ? ' <span class="zt-chip">Chủ tu</span>' : ''}<span class="zt-desc">${effectsOf(s).map(esc).join('; ')}${nx ? ` · Giai đoạn tiếp theo 「${stageLabel(STAGES[STAGES.indexOf(st) + 1])}」: ${esc(STAGE_EFFECT[STAGES[STAGES.indexOf(st) + 1]])} (còn thiếu ${fmtNum(nx - s.熟练度)})` : (!s.入道 && s.熟练度 >= s.上限 ? ' · Đã đạt giới hạn phẩm giai này: thăng phẩm hoặc xung kích Nhập Đạo' : '')}</span></span><span class="zt-chip" title="${pct}%">${stageLabel(st)} ${fmtNum(s.熟练度)}/${fmtNum(s.上限)}</span></div>`; }).join('');
        const practice = practiceLog(z).reverse().slice(0, 10).map(r => `<div class="zt-row"><span>${esc(r.名称)} <span class="zt-desc">Tầng ${r.楼层} · ${new Date(r.时间).toLocaleString('vi-VN')}</span></span><span class="zt-chip">+${r.增加}</span></div>`).join('');
        const src = card.sources.map(s => `<div class="zt-row"><span><b style="font-weight:500">${esc(s.label)}</b><span class="zt-desc">${s.items.map(i => `${esc(i.名称)}${i.品阶 ? '〔' + esc(L.gradeLabel(i.品阶)) + '〕' : ''}${i.熟练度 != null ? ' ' + fmtNum(i.熟练度) : ''} <code>${esc(i.path)}</code>`).join('; ')}</span></span></div>`).join('');
        const sync = z?.角色卡功法同步;
        const kindLabel = k => ({ '收录': 'Thu lục', '升品': 'Thăng phẩm', '熟练度': 'Độ thuần thục' }[k] || k);
        el.innerHTML = `<div class="zt-eyebrow">CULTIVATION</div><h2 class="zt-h">Tu hành · Độ thuần thục</h2><p class="zt-sub">Hiệu quả giai đoạn sẽ được báo cho AI và phát huy tác dụng trong cốt truyện; độ thuần thục tăng lên nhờ mục 「功法修炼」 trong khối dữ liệu và tích lũy thực chiến.</p>
<div class="zt-actions" style="margin-bottom:10px"><button class="zt-btn" type="button" data-sk-back>‹ Quay lại trang Tu hành</button><button class="zt-btn" type="button" data-sk-appraise>Giám định phẩm giai ›</button></div>
<section class="zt-card"><h3>Kho công pháp <small>${lib.length} bộ</small></h3>${rows || '<div class="zt-note">Kho công pháp hiện đang trống. Khi AI ghi 「功法修炼: 收录:Tên công pháp〔Phẩm giai〕」 trong khối dữ liệu, công pháp sẽ xuất hiện tại đây, hoặc bạn có thể nhập từ thẻ nhân vật.</div>'}</section>
<section class="zt-card"><h3>Giai đoạn & Hiệu quả <small>Quy tắc nguyên bản</small></h3>${STAGES.map(st => `<div class="zt-row"><span>${stageLabel(st)}<span class="zt-desc">${esc(STAGE_EFFECT[st])}</span></span><span class="zt-chip">${STAGE_AT[st] ? '≥ ' + fmtNum(STAGE_AT[st]) : st === '入道' ? 'AI ghi 「入道:」' : '< 100'}</span></div>`).join('')}<div class="zt-note">Giới hạn phẩm giai: Phàm phẩm 100 · Linh phẩm 500 · Tiên phẩm 2,000 · Thần phẩm / Cấm kỵ 10,000. Khi đạt giới hạn cần thăng phẩm (Tuế Nguyệt Trầm Đọng / Thương Thành) mới có thể tiếp tục nâng cao.</div></section>
<section class="zt-card"><h3>Tích lũy thực chiến <small>10 lần gần nhất</small></h3>${practice || '<div class="zt-note">Chưa có bản ghi bù nào. Khi trong chính văn có sử dụng công pháp nhưng khối dữ liệu quên ghi thì sẽ xuất hiện tại đây.</div>'}</section>
<section class="zt-card"><h3>Công pháp thẻ nhân vật <small>Chỉ đọc, không sửa đổi thẻ nhân vật</small></h3>${src || '<div class="zt-note">Không tìm thấy biến công pháp / kỹ năng / võ học nào trong thẻ nhân vật hiện tại (hệ thống dò tìm trong biến trò chuyện, stat_data tầng MVU, và biến Tavern Helper của thẻ nhân vật).</div>'}
${card.changes.length ? `<div class="zt-note">Có thể đồng bộ ${card.changes.length} mục: ${card.changes.slice(0, 12).map(c => `${esc(c.name)} ${esc(kindLabel(c.kind))}${c.from != null ? ' ' + esc(c.from) + '→' : ' '}${esc(c.to)}`).join('; ')}</div><div class="zt-actions"><button class="zt-btn primary" type="button" data-sk-import>Nhập / Đồng bộ vào kho công pháp</button></div>` : card.items.length ? '<div class="zt-note">Đã khớp với kho công pháp.</div>' : ''}
${sync ? `<div class="zt-note">Lần đồng bộ trước: ${new Date(sync.时间).toLocaleString('vi-VN')} · Nguồn ${esc((sync.来源 || []).join(', '))} · ${sync.变化} thay đổi${sync.自动 ? ' (tự động)' : ''}</div>` : ''}</section>`;
        el.onclick = e => {
            if (e.target.closest('[data-sk-back]')) return this.app.hub.go('cult');
            if (e.target.closest('[data-sk-appraise]')) return this.app.hub.go('appraise');
            if (e.target.closest('[data-sk-import]')) this.importCard().catch(err => this.app.hub.toast(err.message, 4000));
        };
    }
    dispose() { clearTimeout(this.timer); clearTimeout(this.cardTimer); this.disposers.splice(0).forEach(f => { try { f(); } catch { /* ignore */ } }); try { this.app.bridge.uninjectPrompts(['mastery']); } catch { /* ignore */ } }
}
