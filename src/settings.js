// Extension-level settings (extension_settings[ID]) plus the native SillyTavern settings drawer.
// Nothing here is chat data; API keys entered in the Lilith connection page live in scriptVariables, which stay
// in the user's local settings.json and are never part of this repository.
import { assertSaveEnvironment, recordSaveFailure } from './save-environment.js';
import { ID, VERSION } from './contracts.js';
import { HOST_TESTED } from './compat.js';

export const LIVE2D_CORE_URL = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js';
const DEFAULTS = Object.freeze({
    schema: 1,
    assistant: true,             // original Lilith window, memory, workbench, private chat (native bridge)
    statusbar: 'terminal',       // terminal (0.5.0: data blocks go to the terminal, a chip stays in the story) | native (old in-message bar) | off
    floorTag: true,              // terminal mode: the small “Hệ thống đã ghi nhận” chip in place of each data block
    hubPage: 'ov',               // last terminal page (reopens there)
    hubOutsideClose: 'auto',     // auto (phones) | always | never — click outside the terminal closes it
    hubBackClose: true,          // phone back gesture closes the terminal
    statusbarMaxDepth: 1,        // original regex maxDepth 1: floors at depth 0..1 get the live bar, older ones the compact card
    compactHistory: true,        // original "Hiển thị rút gọn tầng cũ": Điểm Hệ Thống · Hảo cảm · Nhiệm vụ one-liner (click to expand)
    voiceBox: true,              // original "Khung thoại độc quyền của Lilith" regex, switchable
    promptStripPanels: true,     // original "Tầng cũ không gửi cho AI": status blocks of older floors are removed from the prompt
    promptPanelKeepDepth: 2,     // original minDepth 2: the two newest floors keep their panel in the prompt
    worldbookAuto: true,         // install + bind the 诸天 worldbook on 诸天 chats (never overwrites, skips if already active)
    wbUnbindOnDisable: true,     // 0.8.2: disabling the extension (1.17+ hook) unbinds the 诸天 worldbook from cards / global / open chat
    wbUnbound: null,             // 0.8.2: what the last unbind removed (for Khôi phục gắn kết)
    floatLilith: 'auto',         // 0.8.2: floating entry — auto (Lilith on phones / touch) | on (Lilith) | off (avatar) | none (1.1.3: closed, no floating entry)
    guide: null,                 // 0.9.3: Hướng dẫn tân thủ answer {state: 'done'|'skipped', at, version}; null = opens once by itself
    deviceCheck: null,           // 0.9.1: last Tự kiểm tra trên điện thoại thật result {at, version, text} (no chat data; shown in Sao chép thông tin chẩn đoán)
    mobileLayout: 'auto',        // 0.9.0: terminal on phones — auto (full screen on phones) | full (always) | window (0.8.5 floating window)
    motion: 'auto',              // 1.0: Hiệu ứng động auto (reduced motion / low fps on phones → lite) | full | lite
    floatSize: 'm',              // 0.8.3: floating Lilith size p20 / p30 / p40 (1.1.3) | xs 55 % | s 65 % | m 75 % (default) | l 90 % | xl 100 % (= 0.8.2)
    avatarSize: 'xl',            // 1.1.3: round avatar launcher size, same keys; xl = 100 % (64 px, unchanged)
    apiTimeout: 180,             // 0.8.4: seconds for the original's independent-API requests (Trò chuyện riêng / Ký ức / Bàn làm việc); original fixed 60
    palette: 'auto',             // 0.8.4: Bảng phối màu — auto (world colours) | lilith | inkgold | celadon | sakura | frost | crimson | slate
    floatPos: null,              // 0.8.2: {x, y, edge, tucked} of the floating portrait
    macroLike: true,             // {{get_chat_variable::…}} for the worldbook without Tavern Helper
    touchGestures: true,         // stroke / long-press / touch look on the Lilith portrait
    haptics: true,               // vibration feedback for touch gestures (phones that support it)
    takeoverLog: [],             // legacy v1.1 items switched off by Tiếp quản một chạm (for Khôi phục bản cũ)
    hud: true,                   // compact ledger HUD above the input bar
    hotkeys: true,               // Alt+Z Lilith, Alt+X terminal, Alt+S latest status bar
    portrait: { mode: 'rig', variant: 'default', autoMood: true },   // rig | variants | live2d
    fx: { mode: 'full', outside: true },                   // 0.7.0 Hiệu ứng diễn xuất: full | brief (result card only) | off; outside = Gợi ý cốt truyện card when the terminal is closed
    world: { enabled: true, theme: 'auto', prompt: true },  // 0.7.0 Chủ đề thế giới: auto | default | xianxia | cyber | eerie; prompt = ask the model to record 当前世界/世界类型
    lilith: { react: true, pageLines: true, camera: true, story: true }, // 0.7.0 Nhân vật giao diện Lilith; 0.8.0 story = Bong bóng thoại + Lời thoại cốt truyện khi chạm khoảng trống
    appraise: { prompt: true, raise: true },                  // 1.0 Giám định phẩm giai: Gợi ý ghi rõ phẩm giai khi thu lục · Đính chính công pháp cốt truyện qua 「Thu lục:X[Phẩm giai cao hơn]」
    skills: { prompt: true, practice: true, cardAuto: false },
    panelGuard: { repair: true, backfill: 'missing', remind: true, skillHint: true }, // 1.1.1 Bảo vệ định dạng khối dữ liệu
    gachaMode: 'classic',        // 1.1.2 Chế độ rút thẻ: classic Gộp cổ điển | chunk Kết toán mỗi 10 lượt rút
    // 1.1.5 Nhân cách trợ lý hệ thống: lilith (default — nothing changes) | orb (numbered Quang cầu Hệ thống) | custom; avatar = small data: URI
    persona: { preset: 'lilith', name: '', code: '001', call: '', en: '', personality: '', style: '', story: '', chat: '', avatar: '' },
    // 1.1.5 Công tắc tính năng: whole modules (page + prompt + background work); navHidden = terminal pages taken out of the navigation
    modules: { group: true, groupAuto: true, plugins: true, slash: true, guide: true },
    navHidden: [],
    // 1.1.5 Nhóm chat × Sách Thế Giới
    groupWorld: { read: true, memory: true, budget: 1600 },
    live2d: { accepted: false, coreUrl: LIVE2D_CORE_URL, model: '', scale: 1, x: 0, y: 0, follow: true, lipsync: true, idle: true, moodMap: {} },
    scriptVariables: {},
    legacyImported: false,
});
const merge = (base, over) => {
    const out = structuredClone(base);
    for (const [k, v] of Object.entries(over || {})) out[k] = v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k]) ? merge(out[k], v) : v;
    return out;
};
/** Adds missing keys (recursively for plain objects) without replacing anything the user already has. */
export function fillDefaults(target, defaults) {
    for (const [k, v] of Object.entries(defaults)) {
        if (!(k in target) || target[k] === undefined) target[k] = structuredClone(v);
        else if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) fillDefaults(target[k], v);
    }
    return target;
}

export class Settings {
    constructor(adapter) { this.adapter = adapter; this.listeners = new Set(); this.drawer = null; }
    ctx() { return this.adapter.context(); }
    /** The stored object keeps its identity: defaults are filled in place, never by swapping in a clone
     *  (a swap on every read made `all[key] = f(all[key])` write into an already-discarded object). */
    get all() {
        const store = this.ctx().extensionSettings;
        if (!store[ID] || typeof store[ID] !== 'object') store[ID] = {};
        fillDefaults(store[ID], DEFAULTS);
        // 0.7.0: the old in-message status bar is no longer offered in the settings (terminal-only UI). A stored
        // 'native' is moved to 'terminal' exactly once; the code path stays for hosts/tests that set it explicitly.
        if (store[ID].migrated070 !== true) { if (store[ID].statusbar === 'native') store[ID].statusbar = 'terminal'; store[ID].migrated070 = true; }
        return store[ID];
    }
    get(key) { return this.all[key]; }
    set(key, value) { assertSaveEnvironment(); const all = this.all, prev = all[key]; all[key] = value; try { this.save(); } catch (e) { all[key] = prev; throw e; } this.emit(key); }
    patch(key, part) { this.set(key, merge(this.all[key] || {}, part)); }
    save() {
        assertSaveEnvironment();
        try { const pending = this.ctx().saveSettingsDebounced(); pending?.catch?.(e => recordSaveFailure(e, 'Lưu cài đặt')); return pending; }
        catch (e) { recordSaveFailure(e, 'Lưu cài đặt'); throw e; }
    }
    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    emit(key) { for (const fn of this.listeners) try { fn(key); } catch (e) { console.warn('[Chư Thiên Cài Đặt]', e); } }
    scriptVariables() { const v = this.all.scriptVariables; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
    setScriptVariables(v) { this.set('scriptVariables', v); }

    /** Native settings drawer in the Extensions panel. 0.5.0: everything lives in the terminal; only the entry and the
     *  emergency restore stay here (works on 1.16–1.19: plain inline-drawer markup). */
    mountDrawer(actions) {
        const target = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
        if (!target || this.drawer) return;
        const wrap = document.createElement('div');
        wrap.id = ID + '-settings'; wrap.className = 'zt-settings';
        wrap.innerHTML = `
<div class="inline-drawer">
  <div class="inline-drawer-toggle inline-drawer-header"><b>Thiết Bị Đầu Cuối Chư Thiên <small>${VERSION}</small></b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
  <div class="inline-drawer-content">
    <div class="zt-set-actions">
      <div class="menu_button" data-act="open">Mở Thiết Bị Đầu Cuối Chư Thiên</div>
      <div class="menu_button" data-act="float" title="Đưa cửa sổ nổi đã đóng quay lại trang dưới hình dáng Lilith">Hiện Lilith nổi</div>
      <div class="menu_button" data-act="avatar" title="Đưa cửa sổ nổi đã đóng quay lại trang dưới hình dáng ảnh đại diện tròn">Hiện ảnh đại diện</div>
      <div class="menu_button" data-act="restore" title="Bật lại các Regex và kịch bản Tavern Helper bản cũ đã bị tắt bởi &quot;Tiếp quản một chạm&quot;">Khôi phục khẩn cấp bản cũ</div>
    </div>
    <small class="zt-set-note">Mọi tính năng và cài đặt đều nằm trong thiết bị đầu cuối (Ảnh đại diện Lilith → Cài đặt). Máy chủ đã nghiệm thu: SillyTavern ${HOST_TESTED.join(' / ')}; không cần Tavern Helper, không cần nhập Regex.</small>
  </div>
</div>`;
        wrap.querySelector('.zt-set-actions').addEventListener('click', e => { const act = e.target.closest('[data-act]')?.dataset.act; if (act) actions[act]?.(); });
        target.append(wrap); this.drawer = wrap;
    }
    dispose() { this.drawer?.remove(); this.drawer = null; this.listeners.clear(); }
}
