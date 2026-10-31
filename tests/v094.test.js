// 0.9.4: 聊天群 → 群员 → 发布招募令 — a name typed while「随机世界」is selected is no longer silently ignored.
// Browser side: tests/native_v094.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { recruitMode, recruitPrompt, RECRUIT_PLACEHOLDER } from '../src/hub-group.js';
import { CAPABILITIES } from '../src/contracts.js';

const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const G = { 成员: [], 候选历史: [] };

test('recruitMode: 随机 + a typed name = 指定世界; 随机 without a name stays random', () => {
    assert.deepEqual(recruitMode('rand', '  青丘 '), { mode: 'world', hint: '青丘' });
    assert.deepEqual(recruitMode('rand', ''), { mode: 'rand', hint: '' });
    assert.deepEqual(recruitMode('rand', '   '), { mode: 'rand', hint: '' });
    assert.deepEqual(recruitMode(undefined, null), { mode: 'rand', hint: '' });
});
test('recruitMode: 指定世界 / 指定角色 keep their mode and need a name (refused before any fee)', () => {
    assert.deepEqual(recruitMode('world', '斗罗大陆'), { mode: 'world', hint: '斗罗大陆' });
    assert.deepEqual(recruitMode('char', '孙悟空'), { mode: 'char', hint: '孙悟空' });
    assert.throws(() => recruitMode('world', ' '), /Khi chọn Chỉ định thế giới vui lòng điền tên thế giới/);
    assert.throws(() => recruitMode('char', ''), /Khi chọn Chỉ định nhân vật vui lòng điền tên nhân vật/);
    assert.equal(recruitMode('world', 'x'.repeat(50)).hint.length, 30);
});
test('the prompt for a name typed under 随机 asks for that world (it used to ask for a random seed world)', () => {
    const { mode, hint } = recruitMode('rand', '青丘');
    const p = recruitPrompt(G, { mode, hint, budget: 100000, maxTier: 3, rand: () => 0 });
    assert.match(p.text, /đến từ thế giới 「青丘」/);
    assert.doesNotMatch(recruitPrompt(G, { mode: 'rand', budget: 100000, maxTier: 3, rand: () => 0 }).text, /đến từ thế giới 「/);
});
test('UI wiring: placeholder per mode, typing switches 随机 → 指定世界, back to 随机 clears, recruit() validates first', () => {
    assert.match(RECRUIT_PLACEHOLDER.rand, /tự động chuyển sang 「Chỉ định thế giới」/);
    const s = src('src/hub-group.js');
    assert.match(s, /placeholder="\$\{RECRUIT_PLACEHOLDER\.rand\}"/);
    assert.doesNotMatch(s, /随机时可空/);
    assert.match(s, /el\.addEventListener\('input', e => \{ if \(e\.target\.matches\?\.\('\[data-f=rhint\]'\)\) this\.recruitHintTyped\(\); \}\)/);
    assert.match(s, /if \(m && i && m\.value === 'rand' && i\.value\.trim\(\)\) \{ m\.value = 'world';/);
    assert.match(s, /if \(m\.value === 'rand'\) i\.value = '';/);
    const body = s.slice(s.indexOf('async recruit(rawMode, rawHint)'));
    assert.ok(body.indexOf('recruitMode(rawMode, rawHint)') < body.indexOf('L.spend(zz, RECRUIT_FEE)'), 'validated before the fee');
});
test('capability listed', () => {
    assert.equal(CAPABILITIES.find(c => c.name === 'Ô nhập Lệnh Chiêu Mộ đi theo chế độ')?.state, 'implemented');
});
