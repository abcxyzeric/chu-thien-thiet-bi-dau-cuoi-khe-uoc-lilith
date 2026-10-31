// Do not expose reasoning text. Metadata is used only to distinguish truncation from network/format errors.
export function textContent(v) {
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.map(p => typeof p?.text === 'string' ? p.text : '').join('');
    return '';
}
export function completionText(data, budget) {
    const c = data?.choices?.[0], text = textContent(c?.message?.content ?? c?.text);
    if (text.trim()) return text;
    if (c?.finish_reason === 'length' || c?.finish_reason === 'max_tokens') {
        const thinking = !!(data?.zt_reasoning_present || c?.message?.reasoning_content || c?.message?.reasoning);
        throw Object.assign(Error(`Đầu ra đã chạm giới hạn (${budget} tokens), chưa trả về chính văn${thinking ? ', cổng kết nối đã trả về nội dung suy nghĩ' : '; cổng kết nối không cung cấp đủ thông tin để xác định có phải do suy nghĩ chiếm hết hạn mức hay không'}. Có thể tăng giới hạn đầu ra cho tính năng này.`), { code: 'EMPTY_LENGTH' });
    }
    throw Error('Cổng kết nối không trả về chính văn (lý do kết thúc: ' + (c?.finish_reason || 'chưa cung cấp') + '); vui lòng kiểm tra mô hình/cổng kết nối, không ghi kết quả.');
}
const KIND = {
    event: '事件', 'sự kiện': '事件', 'su kien': '事件',
    promise: '承诺', 'lời hứa': '承诺', 'loi hua': '承诺', 'hẹn ước': '承诺',
    relationship: '关系', 'quan hệ': '关系', 'quan he': '关系',
    clue: '线索', 'manh mối': '线索', 'manh moi': '线索',
    location: '地点', 'địa điểm': '地点', 'dia diem': '地点',
    rule: '规则', 'quy tắc': '规则', 'quy tac': '规则',
    task: '任务', 'nhiệm vụ': '任务', 'nhiem vu': '任务',
    other: '其他', 'khác': '其他', 'khac': '其他',
};
const STATE = {
    '进行中': 'active', '有效': 'active', '未解决': 'active',
    'đang tiến hành': 'active', 'hiệu lực': 'active', 'chưa giải quyết': 'active', 'hoạt động': 'active',
    '已完成': 'resolved', '已解决': 'resolved',
    'đã hoàn thành': 'resolved', 'đã giải quyết': 'resolved',
};
// 1.1.4: 「Chỉnh lý ký ức thất bại: khóa ký ức bị trùng hoặc không an toàn」. The original validator (vendor, hash-locked) only accepts keys made of
// A-Z a-z 0-9 _ - / and CJK (U+3400–9FFF), 1–64 chars, no __proto__/constructor/prototype, each key once per batch.
// Models write「Lâm Tuyết·Quan hệ」「Nhiệm vụ: Lấy chìa khóa」「Lin Xue」, kana, full-width letters, or the same key twice — and one bad key
// threw away the whole batch. Keys are now cleaned to that alphabet and duplicates merged (the later entry wins, as the
// original commit does for the same key) BEFORE the unchanged original validation runs.
const KEY_BAD = /[^A-Za-z0-9_\-\u3400-\u9fff/]+/g;
const hashKey = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
/** One memory key → a key the original accepts (pure, for tests). `fallback` is used when nothing usable is left. */
export function memoryKey(key, fallback = 'mem') {
    let k = String(key ?? '').normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D').normalize('NFC')
        .trim().replace(KEY_BAD, '_').replace(/__proto__|constructor|prototype/gi, '_')
        .replace(/_{2,}/g, '_').replace(/\/{2,}/g, '/').replace(/^[_/]+|[_/]+$/g, '');
    if (!k) k = String(fallback || 'mem').replace(KEY_BAD, '_') || 'mem';
    return k.slice(0, 64).replace(/[_/]+$/, '') || 'mem';
}
export function normalizeMemory(raw) {
    let o; try { o = JSON.parse(String(raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')); } catch { return raw; }
    if (!Array.isArray(o?.upserts)) return raw;
    for (const [i, x] of o.upserts.entries()) if (x && typeof x === 'object') {
        const kind = String(x.kind ?? '').trim(), status = String(x.status ?? '').trim();
        x.kind = KIND[kind.toLowerCase()] || kind;
        x.status = STATE[status] || STATE[status.toLowerCase()] || status.toLowerCase();
        if (typeof x.key === 'string' || typeof x.key === 'number') x.key = memoryKey(x.key, `mem_${hashKey(String(x.text ?? i))}`);
        else if (x.key === undefined || x.key === null) x.key = memoryKey('', `mem_${hashKey(String(x.text ?? i))}`);
    }
    // same key twice in one batch: keep the later entry, in its position
    const seen = new Set();
    o.upserts = o.upserts.slice().reverse().filter(x => { if (!x || typeof x !== 'object' || typeof x.key !== 'string') return true; if (seen.has(x.key)) return false; seen.add(x.key); return true; }).reverse();
    return JSON.stringify(o);
}
export function memoryCore(core) {
    return Object.create(core, { validate: { value(raw, source) {
        try { return core.validate(normalizeMemory(raw), source); }
        catch (e) { throw Error('Chỉnh lý ký ức thất bại: ' + e.message + '. Ký ức cũ vẫn được giữ nguyên; đây không phải lỗi giao dịch, vui lòng không mua lặp lại.'); }
    }, enumerable: true } });
}
