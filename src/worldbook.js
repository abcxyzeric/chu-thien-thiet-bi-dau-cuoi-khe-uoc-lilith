import { SHOP_RULE, STORY_RULE, BOND_RULE } from './commerce-rules.js';
// 诸天 worldbook as installed by this extension (0.8.1; 0.8.4 Mô-đun mạnh defaults).
// The 35 original v1.1 entries in vendor/original have been translated to Vietnamese; this file applies the
// small native corrections on top when the book is built, and adds the entries for features the original never had.
// Patches are exact text replacements: if a replaced text is missing (an edited copy), that patch is skipped, never guessed.
export const WORLDBOOK_REV = '1.1.1';

/** 0.8.4 Mô-đun mạnh: worldbook entries the user can switch from Quản lý phụ trợ (book-wide). `def` = state in a NEW install;
 *  Thần Hào Tiêu Xài and Tay Đấm Chư Thiên are constant (injected every turn) in v1.1 and dominate the economy/fights, so they start off.
 *  An existing book is never changed automatically — Quản lý phụ trợ shows the recommendation and a one-click button. */
export const BALANCE_MODULES = Object.freeze([
    { name: 'Thần Hào Tiêu Xài', comment: '08｜Cốt lõi｜Thần Hào Tiêu Xài', legacyComment: '08｜核心｜神豪挥霍', def: false, strong: true, desc: 'Tiêm thường trực: tiền bạc vô hạn, hoàn trả tiêu dùng, dùng tiền nghiền ép; sẽ làm Điểm Hệ Thống / vật giá mất ý nghĩa' },
    { name: 'Tay Đấm Chư Thiên', comment: '13｜Phụ trợ｜Tay Đấm Chư Thiên', legacyComment: '13｜外挂｜诸天打手', def: false, strong: true, desc: 'Tiêm thường trực: triệu hồi tay đấm mạnh mẽ đánh thay bất cứ lúc nào' },
    { name: 'Cải Biên Trạng Thái Thực Tại', comment: '20｜Trưởng thành｜Cải Biên Trạng Thái Thực Tại', legacyComment: '20｜成长｜现实状态改写', def: true, strong: true, desc: 'Kích hoạt theo từ khóa: trực tiếp sửa đổi trạng thái thực tại' },
    { name: 'Ngôn Linh Cải Tự', comment: '21｜Trưởng thành｜Ngôn Linh Cải Tự', legacyComment: '21｜成长｜言灵改字', def: true, strong: true, desc: 'Kích hoạt theo từ khóa: sửa chữ thành sự thật' },
    { name: 'Điểm Hệ Thống Vạn Dụng', comment: '10｜Thương thành｜Điểm Hệ Thống Vạn Dụng', legacyComment: '10｜商城｜系统点万用', def: true, desc: 'Kích hoạt theo từ khóa: ước nguyện vạn năng (có phụ phí)' },
    { name: 'Sao Chép Bản Nguyên · Sao Chép Đồ Giám', comment: '19｜Trưởng thành｜Sao Chép Bản Nguyên · Sao Chép Đồ Giám', legacyComment: '19｜成长｜本源复刻·图鉴复刻', def: true, desc: 'Kích hoạt theo từ khóa: sao chép năng lực của người khác' },
]);
export const DEFAULT_OFF = BALANCE_MODULES.filter(m => !m.def).map(m => m.comment);
const matchModule = (entryComment, m) => {
    const c = String(entryComment || '');
    return c === m.comment || c === m.legacyComment || (/^\d{2}｜/.test(c) && c.slice(0, 3) === m.comment.slice(0, 3));
};
/** Pure: {comment → on} from a loaded book (null = entry missing). */
export function moduleStates(book) {
    const list = Object.values(book?.entries || {});
    return BALANCE_MODULES.map(m => { const e = list.find(x => matchModule(x?.comment, m)); return { ...m, exists: !!e, on: e ? !e.disable : null }; });
}
/** Pure: the book with the given modules switched ({comment: on}); other entries untouched. */
export function applyModules(book, want) {
    const out = structuredClone(book || { entries: {} }); let changed = 0;
    for (const e of Object.values(out.entries || {})) {
        if (!e) continue;
        const hit = Object.prototype.hasOwnProperty.call(want, e.comment) ? e.comment
            : BALANCE_MODULES.find(m => matchModule(e.comment, m) && (Object.prototype.hasOwnProperty.call(want, m.comment) || Object.prototype.hasOwnProperty.call(want, m.legacyComment)));
        const key = typeof hit === 'string' ? hit : hit ? (Object.prototype.hasOwnProperty.call(want, hit.comment) ? hit.comment : hit.legacyComment) : null;
        if (key) { const dis = !want[key]; if (!!e.disable !== dis) { e.disable = dis; changed++; } }
    }
    return { book: out, changed };
}

const PATCHES = [
    { comment: '05｜Cốt lõi｜Bổ sung quy tắc thanh trạng thái',
      from: 'bấm liên tiếp 5 lần vào biểu tượng ◆ ở dưới cùng thanh trạng thái để mở,',
      to: 'mở tại Thiết Bị Đầu Cuối Chư Thiên 「Cài đặt → Nâng cao · Quản trị viên → Bảng điều khiển Quản trị viên」 (trong thiết bị đầu cuối không còn lối vào bấm 5 lần ◆),' },
    { comment: '05｜Cốt lõi｜Bổ sung quy tắc thanh trạng thái',
      from: 'sẽ được thay thế bằng giá trị thực tế (cần có Tavern Helper).',
      to: 'sẽ được thay thế bằng giá trị thực tế (tiện ích này hỗ trợ nguyên bản, không cần Tavern Helper).' },
    // 1.1.1: 神品 pity — the 1000th pull without a 神品 is a 神品 (matches the 0.1 % rate); 仙品 pity unchanged
    { comment: '11｜Thương thành｜Hộp Mù Vạn Giới', since: '1.1.1',
      from: '神品次数}} lần (không đặt lại bảo hiểm)\n',
      to: '神品次数}} lần (không đặt lại bảo hiểm Tiên phẩm)\n- Tiến độ bảo hiểm Thần phẩm: {{get_chat_variable::诸天系统.盲盒状态.神品保底计数}}/1000 (đủ 1000 lượt chắc chắn ra Thần phẩm; bản lưu trước 1.1.1 sẽ được tính bù ở lần rút tiếp theo)\n' },
    { comment: '11｜Thương thành｜Hộp Mù Vạn Giới', since: '1.1.1',
      from: 'Rút ra Thần phẩm chỉ ghi nhận số lần, không đặt lại bảo hiểm Tiên phẩm. Phẩm giai Cấm kỵ tuyệt đối không thể rút ra từ hộp mù.',
      to: 'Rút ra Thần phẩm không đặt lại bảo hiểm Tiên phẩm; khi liên tiếp 1000 lượt chưa ra Thần phẩm thì lượt thứ 1000 chắc chắn ra Thần phẩm (đặt lại bảo hiểm Thần phẩm, bảo hiểm Tiên phẩm vẫn cộng dồn bình thường). Phẩm giai Cấm kỵ tuyệt đối không thể rút ra từ hộp mù.' },
];

const GROUP_RULE = `<rule_setting_simple>
rule_name: Nhóm Chat Chư Thiên (Tiện ích · Nối tiếp chính văn)
version: 1
rule_type: Quy tắc hiện
- Ký chủ sở hữu 「Nhóm Chat Chư Thiên」 xuyên thế giới, đây là giao diện hệ thống trong ý thức của Ký chủ, người ngoài không thể nhìn thấy. Các thành viên nhóm ở thế giới riêng của họ, chỉ có thể trò chuyện, phát lì xì, tặng quà, giao dịch chợ phiên qua nhóm chat; bản thân thành viên nhóm chỉ khi 「Thành viên nhóm giáng lâm」 mới đến bên cạnh Ký chủ.
- Các mục 【Nhóm Chat Chư Thiên】【Nhóm chat · Bản ghi nhập kho thực tế】 trong ngữ cảnh được tiện ích tạo ra dựa theo sổ cái thực tế. Những vật phẩm trong bản ghi đã thực sự nằm trong túi đồ hệ thống của Ký chủ, nguồn gốc chính là từ nhóm chat (được chuyển phát qua không gian hệ thống). Trong chính văn khi Ký chủ lấy ra, sử dụng hoặc nhắc tới những thứ này bắt buộc phải giữ đúng nguồn gốc đó, không được viết lệch thành nhặt được, mua được, tặng trực tiếp trước mặt hay tông môn cấp phát.
- Cốt truyện có thể nối tiếp tự nhiên với nhóm chat (Ký chủ liếc nhìn tin nhắn nhóm, nói lấp lửng nguồn gốc với người bên cạnh, nhắc tới một người bạn trong nhóm), nhưng không được tự bịa ra cuộc trò chuyện nhóm, lì xì hay quà tặng không có trong bản ghi thay cho thành viên nhóm, cũng không được cộng lặp lại Điểm Hệ Thống hay túi đồ trong khối dữ liệu cho những thứ đã nhận từ nhóm chat.
- Các khoản thu từ nhóm chat đã được tiện ích ghi vào sổ cái; khối dữ liệu chỉ ghi những thay đổi mới phát sinh trong cốt truyện lượt này.
</rule_setting_simple>`;

/** Entries added by the extension, appended after the originals (uid continues from the last original). */
function extraEntries(base) {
    const tpl = base.find(r => /^35｜/.test(String(r?.comment || ''))) || base[base.length - 1] || {};
    return [{ ...structuredClone(tpl), comment: '36｜Liên kết｜Nhóm Chat Chư Thiên (Tiện ích)', content: GROUP_RULE, key: ['聊天群', '群员', '红包', '赠礼', '降临', 'nhóm chat', 'thành viên nhóm', 'lì xì', 'tặng quà', 'giáng lâm'],
        constant: true, order: 110, position: 4, depth: 2, role: 0, disable: false }];
}

/** Original rules → the worldbook entries this version installs. Returns { rules, applied, skipped }.
 *  `previous` = without this version's own patches (what an unmodified older install contains; not a customization). */
export function latestRules(original, { legacy = false, previous = false } = {}) {
    const rules = structuredClone(Array.isArray(original) ? original : []), applied = [], skipped = [];
    for (const p of PATCHES) {
        if (previous && p.since === WORLDBOOK_REV) continue;   // the book as the previous version installed it
        const r = rules.find(x => x.comment === p.comment || (/^\d{2}｜/.test(String(x?.comment || '')) && String(x.comment).slice(0, 3) === p.comment.slice(0, 3)));
        if (r && typeof r.content === 'string' && r.content.includes(p.from)) { r.content = r.content.replace(p.from, p.to); applied.push(p.from); }
        else skipped.push(p.from);
    }
    const have = new Set(rules.map(r => r.comment));
    for (const e of extraEntries(rules)) if (!have.has(e.comment) && !rules.some(r => /^36｜/.test(String(r.comment || '')))) rules.push(e);
    for (const r of rules) if (BALANCE_MODULES.some(m => !m.def && matchModule(r.comment, m))) r.disable = true;   // 0.8.4: new installs start balanced
    if (!legacy) for (const r of rules) {
        if (/^09｜/.test(String(r.comment || ''))) r.content = SHOP_RULE;
        if (/^05｜/.test(String(r.comment || ''))) r.content = r.content.replace('</rule_setting_simple>', STORY_RULE + '\n</rule_setting_simple>');
        if (/^29｜/.test(String(r.comment || ''))) r.content = r.content.replace('</rule_setting_simple>', BOND_RULE + '\n</rule_setting_simple>');
        if (/^11｜/.test(String(r.comment || ''))) r.content = r.content.replace('</rule_setting_simple>', '\nNội dung hàng hóa tuân theo tùy chỉnh hàng hóa và tránh trùng lặp gần đây; không rút lại phẩm giai đã được xác định cục bộ. Không tự thêm giới hạn sử dụng vì lý do cân bằng. Chỉ nối tiếp cốt truyện khi người dùng chủ động gửi bản tóm tắt, không yêu cầu gửi toàn bộ nhật ký rút thưởng.\n</rule_setting_simple>');
    }
    rules.forEach((r, i) => { r.uid = i; r.displayIndex = i; });
    return { rules, applied, skipped };
}

/** Merge for「Cập nhật lên bản mới nhất」: built-in entries (matched by comment or 01｜..36｜ prefix) are replaced with the latest text; every other entry
 *  (added by the user, or renamed in an older copy) is kept after them and counted; the user's on/off choice of a built-in entry is kept. */
export function mergeWorldbook(existing, latest) {
    const old = Object.values(existing?.entries || {});
    const byComment = new Map();
    const prefixOf = s => (/^(\d{2}｜)/.exec(String(s || '')) || [])[1] || '';
    const byPrefix = new Map();
    for (const e of old) {
        if (!byComment.has(e.comment)) byComment.set(e.comment, e);
        const p = prefixOf(e.comment);
        if (p && !byPrefix.has(p)) byPrefix.set(p, e);
    }
    const matchedOld = new Set();
    const out = latest.map(r => {
        const p = prefixOf(r.comment);
        const prev = byComment.get(r.comment) || (p ? byPrefix.get(p) : null);
        if (prev && !matchedOld.has(prev)) {
            matchedOld.add(prev);
            return { ...structuredClone(r), ...structuredClone(prev), content: r.content, comment: r.comment, disable: !!prev.disable };
        }
        return structuredClone(r);
    });
    const kept = old.filter(e => !matchedOld.has(e));   // never silently dropped; reported so the user can review
    const entries = {};
    [...out, ...kept.map(e => structuredClone(e))].forEach((e, i) => { entries[i] = { ...e, uid: i, displayIndex: i }; });
    return { book: { ...structuredClone(existing), entries }, replaced: matchedOld.size, added: out.length - matchedOld.size, kept: kept.length };
}
