// 1.1.3: 悬浮窗「切换」与「关闭」分开 · 头像悬浮窗也能关闭 · 大小最低 20% · 经典折叠一次 API 调用.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wantFloat, floatEntry, FLOAT_SIZES, floatDims, binHtml, CLOSE_TEXT, closeFloats } from '../src/lilith-float.js';

const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('floatLilith modes: auto / on = Lilith, off = avatar (切换), none = nothing (关闭)', () => {
    const phone = { coarse: true, width: 390 }, desk = { coarse: false, width: 1400 };
    assert.equal(floatEntry('auto', phone), 'lilith'); assert.equal(floatEntry('auto', desk), 'avatar');
    assert.equal(floatEntry('on', desk), 'lilith'); assert.equal(floatEntry('off', phone), 'avatar');
    assert.equal(floatEntry('none', phone), 'none'); assert.equal(floatEntry('none', desk), 'none');
    assert.equal(floatEntry(undefined, phone), 'lilith', 'unset = auto');
    assert.equal(wantFloat('none', phone), false, '关闭 never shows Lilith, even on a phone');
});
test('关闭 hides the avatar too; 切换 keeps it — two different settings values', () => {
    const f = src('src/lilith-float.js');
    assert.match(f, /this\.hideOriginalEntry\(on \|\| this\.settings\.get\('floatLilith'\) === 'none'\)/);
    assert.match(f, /app\.settings\.set\('floatLilith', 'none'\)/);
    assert.match(f, /const mode = target === 'avatar' \? 'off'/);
    assert.match(CLOSE_TEXT(), /ảnh đại diện đều không hiển thị nữa/); assert.match(CLOSE_TEXT(), /Chuyển đổi/); assert.match(CLOSE_TEXT(), /bảng 「Tiện ích mở rộng」/);
});
test('closeFloats asks first and only closes on yes', async () => {
    const set = []; const app = { settings: { set: (k, v) => set.push([k, v]) } };
    assert.equal(await closeFloats(app, { ask: async () => false }), false); assert.deepEqual(set, []);
    assert.equal(await closeFloats(app, { ask: async () => true }), true); assert.deepEqual(set, [['floatLilith', 'none']]);
});
test('drag targets: 切换 first, 关闭 second, for Lilith and for the avatar', () => {
    const lil = binHtml('đổi thành ảnh đại diện'), ava = binHtml('đổi thành Lilith', 'zt-entry-bin', 'zt-entry-bin');
    assert.match(lil, /data-t="swap"[\s\S]*đổi thành ảnh đại diện[\s\S]*data-t="close"[\s\S]*đóng cửa sổ nổi/);
    assert.match(ava, /id="zt-entry-bin"[\s\S]*đổi thành Lilith[\s\S]*đóng cửa sổ nổi/);
    const w = src('src/window-controls.js');
    assert.match(w, /swapFloat\(this\.app, 'lilith'\)/); assert.match(w, /void closeFloats\(this\.app\)/);
    assert.match(src('src/lilith-float.js'), /data-m="swap">Chuyển thành ảnh đại diện<\/button>[\s\S]{0,120}data-m="close">Đóng cửa sổ nổi…/);
});
test('sizes go down to 20 % for Lilith and the avatar; defaults unchanged', () => {
    assert.equal(FLOAT_SIZES.p20, 0.2);
    assert.deepEqual(floatDims('p20'), { w: 30, h: 33, peek: 24, k: 0.2 });
    assert.deepEqual(floatDims(undefined), floatDims('m'));
    const s = src('src/settings.js'); assert.match(s, /floatSize: 'm'/); assert.match(s, /avatarSize: 'xl'/);
    const h = src('src/hub-settings.js');
    assert.match(h, /sel\('floatSize', [^\n]*\['p20', '20% \(Nhỏ nhất\)'\]/); assert.match(h, /sel\('avatarSize', [^\n]*\['p20', '20% \(Nhỏ nhất\)'\]/);
    assert.match(src('src/window-controls.js'), /scale:\$\{k\};transform-origin:0 0/);
    assert.match(src('src/window-controls.js'), /\(p\.x - x\) \/ k/, 'translate is divided by the scale so the box lands where it should');
});
test('设置: the select is the 切换 (four values), 关闭悬浮窗 is its own button; 扩展面板 has 显示头像', () => {
    const h = src('src/hub-settings.js');
    assert.match(h, /sel\('floatLilith', 'Cửa sổ nổi \(chuyển đổi kiểu dáng\)', \[\['auto'[^\n]*\['on', 'Lilith nổi'\], \['off', 'Ảnh đại diện \(nút đánh thức gốc\)'\], \['none', 'Đã đóng/);
    assert.match(h, /act\('float-close', 'Đóng cửa sổ nổi…'/); assert.match(h, /'float-close': \(\) => closeFloats\(app\)/);
    assert.match(src('src/settings.js'), /data-act="avatar"[^\n]*Hiện ảnh đại diện/);
    assert.match(src('index.js'), /avatar:\(\)=>\{this\.settings\.set\('floatLilith','off'\)/);
});
test('终端 × is the original close (no floatLilith change on close)', () => {
    for (const f of ['src/window-controls.js', 'src/hub.js', 'src/mobile.js']) assert.doesNotMatch(src(f), /set\('floatLilith'/, f);
});
