// 0.8.4 Bảng phối màu — colour palettes that override the world theme's colours (decorations of the world stay).
// One table drives both places that must match: the terminal shell (Lilith shadow root, CSS variables of world.css)
// and the status-bar engine iframe (.mvu-sys variables). Pure: returns CSS text; world.js applies the attribute.
//   auto      = colours follow the world theme (Tiên hiệp / Cyberpunk / Quỷ dị / Chư Thiên), as before
//   <id>      = fixed palette for every world

/** win / side / surface / input = surfaces (dark → less dark); ink / muted = text; accent = main; accent2 = second. */
export const PALETTES = Object.freeze({
    lilith:  { label: 'Tử Dạ · Lilith (Tím nguyên bản)', win: '#15101e', side: '#1b1325', surface: '#241a30', input: '#0f0b15', ink: '#f3edf7', muted: '#ac9bbd', accent: '#c59bee', accent2: '#d2b992' },
    inkgold: { label: 'Mặc Kim · Huyền Mặc Lưu Kim',     win: '#0f0e0c', side: '#15130f', surface: '#211d16', input: '#0a0908', ink: '#f2ead8', muted: '#b3a88f', accent: '#d9b56a', accent2: '#e9d5a4' },
    celadon: { label: 'Thanh Từ · Vũ Quá Thiên Thanh',   win: '#0e1417', side: '#121b1f', surface: '#1a272c', input: '#091013', ink: '#e8f0f2', muted: '#97aab0', accent: '#86bfd0', accent2: '#cdbb8f' },
    sakura:  { label: 'Phi Anh · Dạ Anh',                win: '#170f14', side: '#1e131a', surface: '#2b1a25', input: '#110a0e', ink: '#f8eaf0', muted: '#c09aab', accent: '#f09ab8', accent2: '#f2c58f' },
    frost:   { label: 'Sương Lam · Tinh Dạ',             win: '#0c1220', side: '#101829', surface: '#182339', input: '#080d18', ink: '#e9f0ff', muted: '#93a3c4', accent: '#8fb4ff', accent2: '#c8d7f5' },
    crimson: { label: 'Xích Hà · Giáng Hồng Hổ Phách',   win: '#160c0c', side: '#1d1010', surface: '#2b1716', input: '#100808', ink: '#f6e8e4', muted: '#bf9a92', accent: '#e8735f', accent2: '#f0b35a' },
    slate:   { label: 'Thạch Mặc · Xám độ bão hòa thấp', win: '#111214', side: '#16181b', surface: '#202328', input: '#0b0c0e', ink: '#eceef1', muted: '#9ca3ad', accent: '#b8c1cc', accent2: '#d8c7a0' },
});
export const PALETTE_OPTIONS = [['auto', 'Theo chủ đề thế giới (Mặc định)'], ...Object.entries(PALETTES).map(([k, p]) => [k, p.label])];
export const isPalette = id => Object.prototype.hasOwnProperty.call(PALETTES, id);

const mix = (a, b, pct) => `color-mix(in srgb,${a} ${pct}%,${b})`;

/** CSS for the terminal shadow root (variables consumed by hub.css / world.css). */
export function shellCss() {
    return Object.entries(PALETTES).map(([id, p]) => {
        const sel = `:host([data-zt-palette=${id}][data-zt-world])`;
        return `${sel}{--accent:${p.accent};--gold:${p.accent2};--ink:${p.ink};--muted:${p.muted};--line:${mix(p.accent, 'transparent', 11)};`
            + `--zt-win:${p.win};--zt-win-line:${mix(p.accent, 'transparent', 36)};--zt-head:linear-gradient(110deg,${mix(p.surface, p.win, 70)},${p.win});--zt-side:${p.side};`
            + `--zt-main:radial-gradient(ellipse at 100% 0,${mix(p.accent, 'transparent', 8)},transparent 60%),radial-gradient(ellipse at 0 100%,${mix(p.accent2, 'transparent', 5)},transparent 55%);`
            + `--zt-surface:${p.surface};--zt-surface-h:${mix(p.surface, p.accent, 82)};--zt-input:${p.input};--zt-top-a:${mix(p.surface, p.win, 60)};--zt-top-b:${p.win};--zt-bar:${p.side};`
            + `--zt-primary-a:${mix(p.accent, p.win, 55)};--zt-primary-b:${mix(p.accent2, p.win, 50)};--zt-nav:${p.muted};--zt-ink2:${p.ink};--zt-text2:${mix(p.ink, p.muted, 60)};--zt-panel2:${mix(p.surface, p.win, 55)};`
            + `--zt-sel:${p.accent};--zt-sel-bar:${p.accent2};--zt-switch:${mix(p.accent, p.win, 65)};--zt-switch-off:${mix(p.surface, p.win, 80)};--zt-deco:${p.accent};--zt-deco2:${p.accent2}}\n`
            + `${sel} .zt-card{border-color:${mix(p.accent, 'transparent', 16)}}\n` + fxRule(id, p, sel);
    }).join('');
}

/** CSS for the status-bar engine document (html[data-zt-hub] inside the terminal, see hub.js ENGINE_CSS). */
export function engineCss() {
    return Object.entries(PALETTES).map(([id, p]) => {
        const h = `html[data-zt-hub][data-zt-palette=${id}][data-zt-palette]`;   // beats the world rules regardless of order
        return `${h},${h} body{background:${p.win}!important}\n`
            + `${h} .mvu-sys{--bg:${p.win};--bg2:${p.side};--panel:${mix(p.surface, p.win, 70)};--panel2:${p.surface};--input:${p.input};--text:${p.ink};--muted:${p.muted};--faint:${mix(p.muted, p.win, 75)};`
            + `--hair:${mix(p.accent, 'transparent', 12)};--border:${mix(p.accent, 'transparent', 18)};--gold:${p.accent2};--jade:${p.accent};--violet:${p.accent};--v-task:${p.accent};`
            + `--accent-soft:${mix(p.accent, p.win, 16)};--accent-line:${mix(p.accent, p.win, 55)};--btn-hover-bg:${mix(p.accent, p.win, 24)};--btn-hover-text:${p.ink};--c-hl:${p.accent}}\n`;
    }).join('');
}

const fxRule = (id, p, sel) => `${sel}{--fx-a:${p.accent};--fx-g:${p.accent2};--fx-bg:${mix(p.win, 'transparent', 93)}}\n`;
/** Hiệu ứng diễn xuất cards outside the terminal (their own shadow host). */
export function fxCss() { return Object.entries(PALETTES).map(([id, p]) => fxRule(id, p, `:host([data-zt-palette=${id}])`)).join(''); }
