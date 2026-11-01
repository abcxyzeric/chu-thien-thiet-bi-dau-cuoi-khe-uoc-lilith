import { frameScope, releaseFrames } from './action-support.js';
import { esc } from './hub.js';
import * as L from './ledger-ops.js';
import { capture, assertCapture, checkedCommit, askFeature, parseObject, audit, refreshEngine, isUncertain } from './action-support.js';
import { ITEM_BUTTONS, planFromButton, applyItemPlan } from './item-actions.js';
import { canAcquireForbidden, THEMES, CATEGORIES, USES, themeLabel, categoryLabel, useLabel, preferences, rollGacha, shopGrades, planSlots, validateProduct, productPrompt, SHOP_FEE, GACHA_FEE, parseObjectsLoose, fitSlot, shenPityLeft, SHEN_PITY } from './commerce-plan.js';

/** 1.1.1: model batch sizes (halved down to 1 when an answer is cut off) and the gacha settlement chunk. */
export const GACHA_BATCH = 5, SHOP_BATCH = 8, GACHA_CHUNK = 10;
/** 1.1.3 经典折叠: the whole draw is ONE model call (all unfolded items in one request). Output budget grows with the
 *  item count (≥ 8192, ~240 tokens per item, ≤ 32768); only a cut-off / invalid answer is retried. */
export const classicTokens = n => Math.min(32768, Math.max(8192, 1024 + 240 * Math.max(0, n | 0)));
/** 1.1.2: the gacha mode the player picked (default 经典折叠). */
export const gachaMode = settings => (settings?.get?.('gachaMode') === 'chunk' ? 'chunk' : 'classic');
export const GACHA_MODES = Object.freeze({
    classic: { label: 'Gộp cổ điển', note: 'Toàn bộ lần rút được quyết toán chung và trừ phí một lần; khi ≥50 lượt rút thì Phàm phẩm gộp thành một dòng 「Tạp vật Phàm phẩm ×N」, khi ≥100 lượt rút thì Linh phẩm cũng gộp thành một dòng, phần đã gộp chỉ đếm số lượng chứ không gọi tạo chi tiết; các vật phẩm còn lại được tạo hết trong một lần gọi API duy nhất (chỉ thử lại khi câu trả lời bị cắt cụt hoặc không đạt chuẩn). Thất bại không trừ phí.' },
    chunk: { label: 'Quyết toán mỗi 10 lượt', note: 'Mỗi 10 lượt rút được tạo, kiểm duyệt và trừ phí riêng, mọi vật phẩm đều tạo từng món một (mỗi yêu cầu 5 món); nếu giữa chừng thất bại thì phần đã hoàn thành vẫn ghi nhận vào sổ như thường, phần còn lại không trừ phí. Số lần gọi API nhiều hơn.' },
});
/** 1.1.2 经典折叠: the grades a draw of `count` pulls folds into one summary row (old 3.1 behaviour, thresholds 50 / 100). */
export function foldGrades(count) { return count >= 100 ? ['凡品', '灵品'] : count >= 50 ? ['凡品'] : []; }
/** One 待处理 row standing for `n` folded pulls of `grade` — worth exactly n single items (price × 数量). Pure. */
export function foldedRow(grade, n) {
    const gl = L.gradeLabel(grade);
    return { 名称: `Tạp vật ${gl}`, 品级: grade, 分类: '其他', 效果: `${n} món vật tư lẻ tẻ ${gl} mở ra từ hộp mù lần này (Gộp cổ điển: gộp bản ghi, không tạo từng món)`, 来源: 'Hộp mù', 价格: L.TIER_PRICE[grade], 数量: n };
}
/** A generated product as a 待处理 row. Pure. */
export const pendingRow = it => ({ 名称: it.name, 品级: it.grade, 分类: it.category, 效果: `${it.effect} (Nguồn: ${it.world}; ${it.origin})`, 来源: 'Hộp mù', 价格: L.TIER_PRICE[it.grade], 数量: 1 });
/** Was this model answer cut off? finish_reason length / max_tokens, or a JSON array that never closes. Pure. */
export function looksTruncated(text, finish = '') {
    if (/^(length|max_tokens)$/i.test(String(finish || ''))) return true;
    const t = String(text || '').trim().replace(/\s*```$/, '');
    return t.includes('[') && !t.endsWith(']');
}

export class Commerce {
    constructor(app) { this.app = app; this.off = []; this.mounted = new WeakSet(); this.busy = false; }
    start() {
        const h = this.app.hub; if (!h) return this;
        h.addNav('Giao dịch', 'commerce', 'Tùy chỉnh', 'gear', { title: 'Tùy chỉnh hàng hóa', render: el => this.render(el) });
        const sb = this.app.statusbar; if (sb) { const prev = sb.enhanceFrame, enhance = (f, d) => { prev?.(f, d); this.mount(f, d); }; sb.enhanceFrame = enhance; this.off.push(() => { if (sb.enhanceFrame === enhance) sb.enhanceFrame = prev; }); }
        h.hook('onEngine', (f, doc) => this.mount(f, doc));
        h.hook('onEngineView', () => { try { const d = h.engineFrame?.contentDocument; this.paintShenPity(d); this.paintGachaMode(d); } catch { /* engine gone */ } });
        return this;
    }
    pref(kind) { return preferences(this.app.settings.get('commerce')?.[kind]); }
    render(el) {
        const section = kind => { const p = this.pref(kind), choices = (key, all, lblFn) => all.map(v => `<label style="display:inline-flex;gap:5px;margin:5px"><input type="checkbox" name="${key}" value="${v}" ${p[key].includes(v) ? 'checked' : ''}>${lblFn(v)}</label>`).join('');
            return `<form class="zt-card" data-kind="${kind}"><h3>Tùy chỉnh ${kind === 'shop' ? 'nhập hàng Cửa hàng' : 'phần thưởng Hộp mù'}</h3><label>Nguồn gốc <select name="scope"><option value="mixed" ${p.scope === 'mixed' ? 'selected' : ''}>Chư Thiên hỗn hợp</option><option value="current" ${p.scope === 'current' ? 'selected' : ''}>Thế giới hiện tại</option><option value="named" ${p.scope === 'named' ? 'selected' : ''}>Thế giới/tác phẩm chỉ định</option></select></label><input name="world" maxlength="80" value="${esc(p.world)}" placeholder="Tác phẩm/thế giới chỉ định (tên gốc)"><p>Đề tài hỗn hợp</p>${choices('themes', THEMES, themeLabel)}<p>Danh mục hàng hóa</p>${choices('categories', CATEGORIES, categoryLabel)}<p>Công dụng</p>${choices('uses', USES, useLabel)}<p><label>Mục loại trừ (phân cách bằng dấu phẩy)<input name="exclude" maxlength="400" value="${esc(p.exclude)}" placeholder="Vật phẩm hoặc đề tài không muốn xuất hiện lại"></label></p><label><input name="original" type="checkbox" ${p.original ? 'checked' : ''}>Cho phép tự sáng tác (khai báo nguyên tác cũng cần tự kiểm chứng)</label><p><select name="repeats"><option value="avoid">Tránh trùng lặp gần đây (gồm cả hiệu quả tương tự)</option><option value="consumables" ${p.repeats === 'consumables' ? 'selected' : ''}>Cho phép vật phẩm tiêu hao thông dụng lặp lại</option></select></p><button class="zt-btn primary" type="submit">Lưu cấu hình ${kind === 'shop' ? 'Cửa hàng' : 'Hộp mù'}</button><span role="status"></span></form>`;
        };
        const mode = gachaMode(this.app.settings);
        const modeCard = `<section class="zt-card" data-gacha-mode><h3>Chế độ rút thẻ <small>1.1.2 · Trong khu rút thẻ cũng có thể chuyển đổi</small></h3><div class="zt-actions">${Object.entries(GACHA_MODES).map(([id, m]) => `<button type="button" class="zt-btn${mode === id ? ' primary' : ''}" data-mode="${id}" aria-pressed="${mode === id}">${m.label}${id === 'classic' ? ' (Mặc định)' : ''}</button>`).join('')}</div><p class="zt-note">${GACHA_MODES[mode].note}</p></section>`;
        el.innerHTML = `<h3>Tùy chỉnh hàng hóa</h3><p class="zt-note">Cục bộ quyết định tổ hợp đề tài và phẩm giai, mô hình tạo nội dung, sau đó kiểm duyệt và tránh trùng lặp gần đây. Tùy chỉnh không làm thay đổi xác suất hộp mù. Hộp mù: Phàm 60% / Linh 38% / Tiên 1.9% / Thần 0.1%, lượt rút thứ 100 bảo hiểm Tiên phẩm · 1000 lượt rút chắc chắn ra Thần phẩm, Cấm kỵ không nằm trong bể hộp mù. Tạo thất bại không trừ Điểm Hệ Thống; lệnh gọi API có thể vẫn tính phí. Mỗi lần tối đa 200 lượt rút.</p>${modeCard}${section('shop')}${section('gacha')}`;
        el.querySelector('[data-gacha-mode]').onclick = e => {
            const b = e.target.closest('[data-mode]'); if (!b) return;
            try { this.app.settings.set('gachaMode', b.dataset.mode); } catch (err) { this.app.hub.toast('Chưa lưu được chế độ rút thẻ: ' + err.message, 6000); return; }
            this.render(el); try { this.paintGachaMode(this.app.hub.engineFrame?.contentDocument); } catch { /* engine gone */ }
        };
        el.querySelectorAll('form').forEach(form => form.onsubmit = e => {
            e.preventDefault(); const fd = new FormData(form), p = { scope: fd.get('scope'), world: fd.get('world'), exclude: fd.get('exclude'), original: fd.has('original'), repeats: fd.get('repeats'), themes: fd.getAll('themes'), categories: fd.getAll('categories'), uses: fd.getAll('uses') };
            if (!p.themes.length || !p.categories.length || !p.uses.length || (p.scope === 'named' && !String(p.world).trim())) { form.querySelector('[role=status]').textContent = 'Vui lòng chọn ít nhất một đề tài/danh mục/công dụng và điền thế giới chỉ định.'; return; }
            this.app.settings.set('commerce', { ...(this.app.settings.get('commerce') || {}), [form.dataset.kind]: preferences(p) }); form.querySelector('[role=status]').textContent = 'Đã lưu';
        });
    }
    mount(frame, doc) {
        if (this.dead || this.mounted.has(doc)) return; this.mounted.add(doc);
        const off = frameScope(this, frame, doc);
        const click = e => {
            const b = e.target.closest?.('.btn-refresh-store,.btn-gacha,.btn-buy-item,' + ITEM_BUTTONS); if (!b) return;
            e.preventDefault(); e.stopImmediatePropagation();
            if (frame.classList.contains('zt-sb-frame') && Number(frame.dataset.ztFloor) !== this.app.statusbar.latestPanel()?.id) { this.app.hub.toast('Tầng lịch sử chỉ đọc, vui lòng thao tác trên thiết bị đầu cuối hiện tại.'); return; }
            if (b.disabled || this.busy) return;
            (b.matches(ITEM_BUTTONS) ? this.item(b, frame) : this.handle(b, frame)).catch(e => this.app.hub.toast(e.message, 8000));
        }; doc.addEventListener('click', click, true); off.push(() => doc.removeEventListener('click', click, true));
        const root = doc.querySelector('.mvu-sys'), btn = doc.createElement('button'); btn.type = 'button'; btn.textContent = 'Tùy chỉnh hàng hóa / Tránh trùng gần đây'; btn.style.cssText = 'padding:10px;margin:8px;border-radius:8px'; btn.onclick = () => this.app.hub.go('commerce');
        root?.querySelector('.btn-refresh-store')?.parentElement?.append(btn); off.push(() => btn.remove());
        this.strictStacking(frame, off);
        this.paintShenPity(doc); this.paintGachaMode(doc);
        // The snapshot original functions are untouched, but UI probabilities now agree with the local planner.
    }
    /** 1.1.1 audit: the original bagAdd (still used by 无限口袋) stacks on 名称+品级 only — route it through the strict
     *  ledger-ops rule (same name, grade, price, source, category and effect), still one save via the engine's writer. */
    strictStacking(frame, off) {
        const w = frame.contentWindow; if (!w || typeof w.bagAdd !== 'function' || w.bagAdd.__zt || typeof w.sysWriteVars !== 'function') return;
        const orig = w.bagAdd;
        const strict = (item, n) => w.sysWriteVars(v => {
            const z = v.诸天系统 && typeof v.诸天系统 === 'object' ? v.诸天系统 : (v.诸天系统 = {});
            L.bagAdd(z, { 名称: item?.名称, 品级: item?.品级 || '凡品', 来源: item?.来源 || '', 价格: item?.价格 || 0, 分类: item?.分类 || '其他', 效果: item?.效果 || '' }, n);
            return v;
        });
        strict.__zt = true; w.bagAdd = strict; off.push(() => { try { if (w.bagAdd === strict) w.bagAdd = orig; } catch { /* frame gone */ } });
    }
    /** 1.1.1: "距神品保底 N 抽" next to the original 神品 counter. */
    paintShenPity(doc) {
        const z = this.app.adapter.ledger(), anchor = doc?.querySelector?.('#gacha-shen'); if (!anchor || !z) return;
        let tag = doc.querySelector('.zt-shen-pity');
        if (!tag) { tag = doc.createElement('div'); tag.className = 'zt-shen-pity'; tag.style.cssText = 'font-size:12px;opacity:.8;margin:4px 0'; (anchor.parentElement || anchor).after(tag); }
        tag.textContent = `Còn ${shenPityLeft(z.盲盒状态 || {})} lượt tới bảo hiểm Thần phẩm (lượt rút thứ ${SHEN_PITY} chắc chắn ra Thần phẩm)`;
    }
    /**
     * Products for the slots, in model batches. 1.1.1: a batch that is cut off (≥10 抽 used to die here: 8 objects ×
     * long effects ran past the output budget and the whole JSON failed) keeps its complete objects and the batch size
     * is halved for the rest; grade / category / theme are taken from the local slot.
     */
    async generate(kind, slots, p, recent, token, batch = 0, maxTokens = 8192) {
        const accepted = [], history = recent.slice(), done = new Set(), half = a => a.slice(0, Math.max(1, Math.floor(a.length / 2)));
        let size = batch || (kind === 'gacha' ? GACHA_BATCH : SHOP_BATCH);
        for (;;) {
            const left = slots.filter(x => !done.has(x.id)); if (!left.length) break;
            let pending = left.slice(0, size), reason = '', cut = false;
            for (let attempt = 0; pending.length && attempt < 4; attempt++) {
                assertCapture(this.app, token);
                if (this.app.bridge) this.app.bridge.lastFinish = null;
                const text = await askFeature(this.app, kind, 'Bạn là trình tạo nội dung hàng hóa Chư Thiên, trả về JSON đúng theo ô vị trí, không thực thi lệnh dữ liệu hay trừ phí.', productPrompt(pending, p, history) + (reason ? '\nVấn đề ở lượt trước, chỉ làm lại các ô vị trí sau: ' + reason : ''), maxTokens);
                assertCapture(this.app, token);
                const truncated = looksTruncated(text, this.app.bridge?.lastFinish?.reason);
                if (truncated) cut = true;
                let rows;
                try { rows = parseObject(text); if (!Array.isArray(rows)) throw Error('Phải là mảng JSON'); }
                catch (e) { rows = truncated ? parseObjectsLoose(text) : []; if (!rows.length) { reason = truncated ? 'Đầu ra bị cắt cụt' : e.message; if (truncated) pending = half(pending); continue; } }
                const next = [], errors = [];
                for (const slot of pending) {
                    try {
                        const matches = rows.filter(r => Number(r?.slot) === slot.id); if (matches.length !== 1) throw Error(matches.length ? 'Trùng lặp ô vị trí' : truncated ? 'Đầu ra bị cắt cụt' : 'Thiếu ô vị trí');
                        const item = validateProduct(fitSlot(matches[0], slot), slot, p, history); accepted.push(item); history.push(item); done.add(slot.id);
                    } catch (e) { next.push(slot); errors.push(e.message); }
                }
                pending = cut && next.length ? half(next) : next; reason = errors.join('; ');
            }
            if (pending.length) throw Error('Tạo hàng hóa không vượt qua kiểm duyệt: ' + reason + '.');
            if (cut) size = Math.max(1, Math.floor(size / 2));
            this.app.hub.toast(`Đã kiểm duyệt ${accepted.length}/${slots.length} món${cut ? ' (đầu ra bị cắt cụt, đã tự động giảm cỡ lô)' : ''}.`, 2000);
        }
        return accepted.sort((a, b) => a.slot - b.slot);
    }
    async handle(button, frame) {
        this.busy = true; const old = button.textContent; button.disabled = true;
        try {
            const token = capture(this.app), z = this.app.adapter.ledger(), w = frame.contentWindow, root = frame.contentDocument.querySelector('.mvu-sys');
            if (button.matches('.btn-buy-item')) return await this.buy(button, token);
            const kind = button.matches('.btn-gacha') ? 'gacha' : 'shop';
            const count = kind === 'shop' ? 8 : Math.max(1, Math.min(200, parseInt(button.dataset.custom ? root.querySelector('#gacha-custom-n')?.value : button.dataset.times) || 1));
            const fee = kind === 'shop' ? SHOP_FEE : count * GACHA_FEE;
            if (Number(z.系统点) < fee) throw Error('Điểm Hệ Thống không đủ; chưa bắt đầu tạo.');
            const p = this.pref(kind);
            if (kind === 'shop') {
                const stock = JSON.stringify(z.商城库存 || []), slots = planSlots(shopGrades(z), p, z.当前世界);
                button.textContent = 'Đang tạo và kiểm duyệt… (chưa trừ Điểm Hệ Thống)';
                let products; try { products = await this.generate(kind, slots, p, z.商品历史 || [], token); } catch (e) { throw Error(e.message + ' Chưa trừ Điểm Hệ Thống.'); }
                const batch = crypto.randomUUID();
                await checkedCommit(this.app, token, current => {
                    if (JSON.stringify(current.商城库存 || []) !== stock) throw Error('Tồn kho đã thay đổi; chưa trừ phí, vui lòng thử lại.');
                    L.spend(current, fee);
                    current.商城库存 = products.map((it, i) => ({ id: batch + '-' + i, 名称: it.name, 品阶: it.grade, 分类: it.category, 效果: `${it.effect} (Nguồn: ${it.world}; ${it.origin})${it.acquisition ? '〔Nhận món này cần thêm 1 Phỉnh Nhân Quả, sau khi nhận không có hạn chế sử dụng bổ sung〕' : ''}`, 价格: it.price, 来源世界: it.world, 原创: it.origin, 特殊代价: it.acquisition, 已购: false }));
                    current.商品历史 = [...(current.商品历史 || []), ...products.map(it => ({ name: it.name, effect: it.effect, world: it.world, theme: it.theme, batch }))].slice(-160);
                    audit(current, kind, `Làm mới Thương thành: trừ ${fee} điểm, lên kệ ${products.length} món`);
                });
                refreshEngine(this.app);
                this.app.hub.toast('Tồn kho mới đã được lưu; bản ghi làm mới chỉ lưu tại nhật ký cục bộ.', 5000);
                return;
            }
            if (gachaMode(this.app.settings) === 'classic') return await this.classic(count, p, token, button, frame);
            // 1.1.1: the gacha settles every 10 pulls — each chunk rolls from the ledger as it is now, is generated,
            // checked and charged on its own. A failure stops there: what was settled stays, the rest is not charged.
            const all = []; let doneCount = 0;
            try {
                while (doneCount < count) {
                    const n = Math.min(GACHA_CHUNK, count - doneCount), z1 = this.app.adapter.ledger();
                    if (Number(z1.系统点) < n * GACHA_FEE) throw Error('Điểm Hệ Thống không đủ');
                    const before = JSON.stringify(z1.盲盒状态 || {}), roll = rollGacha(z1.盲盒状态, n);
                    const slots = planSlots(roll.grades, p, z1.当前世界);
                    button.textContent = `Đang tạo và kiểm duyệt… ${doneCount}/${count} (lô này chưa trừ phí)`;
                    const products = await this.generate(kind, slots, p, z1.商品历史 || [], token);
                    const batch = crypto.randomUUID();
                    await checkedCommit(this.app, token, current => {
                        if (JSON.stringify(current.盲盒状态 || {}) !== before) throw Error('Trạng thái bảo hiểm đã thay đổi, vui lòng rút lại');
                        L.spend(current, n * GACHA_FEE);
                        current.盲盒状态 = { ...(current.盲盒状态 || {}), ...roll.state }; current.待处理物品 ||= [];
                        current.待处理物品.push(...products.map(pendingRow));
                        current.商品历史 = [...(current.商品历史 || []), ...products.map(it => ({ name: it.name, effect: it.effect, world: it.world, theme: it.theme, batch }))].slice(-160);
                        audit(current, kind, `Hộp mù ${n} lượt${count > n ? ` (lượt ${doneCount + 1}–${doneCount + n} / tổng ${count})` : ''}: trừ ${n * GACHA_FEE} điểm, ${products.length} món vào kết quả chờ xử lý`);
                    });
                    all.push(...products); doneCount += n;
                    refreshEngine(this.app); this.paintShenPity(frame.contentDocument);
                }
            } catch (e) {
                // 1.1.1 audit: a batch whose save could not be verified may or may not be on disk — never claim "未扣"
                if (isUncertain(this.app, token)) throw Error(`${doneCount ? `${doneCount} lượt đầu đã xác nhận ghi sổ; ` : ''}Kết quả lưu của lượt ${doneCount + 1}–${Math.min(count, doneCount + GACHA_CHUNK)} chưa thể xác nhận (có thể đã trừ điểm và ghi vào mục chờ xử lý), giao dịch đã đóng băng. Vui lòng tải lại cuộc trò chuyện để đối chiếu Điểm Hệ Thống và vật phẩm chờ xử lý, đừng rút lặp lại. (${e.message})`);
                if (!doneCount) throw Error(e.message.replace(/[。.]?$/, '') + '. Chưa trừ Điểm Hệ Thống, bảo hiểm không thay đổi.');
                this.app.hub.toast(`Đã hoàn thành ${doneCount}/${count} lượt và ghi sổ, ${count - doneCount} lượt còn lại chưa trừ phí (${e.message}).`, 9000);
            }
            if (all.length) w.addCartRecord?.(root, `Rút hộp mù (${doneCount} lần)`, `${all.map(it => `[${L.gradeLabel(it.grade)}]${it.name}`).join(', ')}; kết quả đã lưu vào vật phẩm chờ xử lý, giữ lại mới vào túi đồ.`);
            if (doneCount === count) this.app.hub.toast('Đã lưu kết quả rút, vui lòng giữ lại hoặc phân giải trong phần kết quả chờ xử lý.', 5000);
        } finally { this.busy = false; button.disabled = false; button.textContent = old; }
    }
    /**
     * 1.1.2 经典折叠 (the pre-1.1.1 way, as asked by players to spare the model): the whole draw is rolled from the ledger
     * once, generated, then charged in ONE verified write. ≥50 pulls fold every 凡品 into one row, ≥100 pulls fold 灵品
     * too — folded pulls never reach the model. Any failure before the write charges nothing.
     */
    async classic(count, p, token, button, frame) {
        const w = frame.contentWindow, root = frame.contentDocument?.querySelector('.mvu-sys'), z = this.app.adapter.ledger(), fee = count * GACHA_FEE;
        if (Number(z.系统点) < fee) throw Error('Điểm Hệ Thống không đủ; chưa bắt đầu tạo.');
        const before = JSON.stringify(z.盲盒状态 || {}), roll = rollGacha(z.盲盒状态, count), folded = foldGrades(count);
        const counts = {}; for (const g of roll.grades) counts[g] = (counts[g] || 0) + 1;
        const slots = planSlots(roll.grades.filter(g => !folded.includes(g)), p, z.当前世界);
        button.textContent = slots.length ? `Đang tạo và kiểm duyệt… (yêu cầu một lần ${slots.length} món, chưa trừ Điểm Hệ Thống)` : 'Đang quyết toán… (chưa trừ Điểm Hệ Thống)';
        let products = [];
        if (slots.length) try { products = await this.generate('gacha', slots, p, z.商品历史 || [], token, slots.length, classicTokens(slots.length)); } catch (e) { throw Error(e.message.replace(/[。.]?$/, '') + '. Chưa trừ Điểm Hệ Thống, bảo hiểm không thay đổi.'); }
        const rows = [...products.map(pendingRow), ...folded.filter(g => counts[g]).map(g => foldedRow(g, counts[g]))];
        const foldText = folded.filter(g => counts[g]).map(g => `${L.gradeLabel(g)} ${counts[g]} món gộp thành một dòng`).join(', ');
        const batch = crypto.randomUUID();
        try {
            await checkedCommit(this.app, token, current => {
                if (JSON.stringify(current.盲盒状态 || {}) !== before) throw Error('Trạng thái bảo hiểm đã thay đổi, vui lòng rút lại');
                L.spend(current, fee);
                current.盲盒状态 = { ...(current.盲盒状态 || {}), ...roll.state }; current.待处理物品 ||= [];
                current.待处理物品.push(...rows);
                current.商品历史 = [...(current.商品历史 || []), ...products.map(it => ({ name: it.name, effect: it.effect, world: it.world, theme: it.theme, batch }))].slice(-160);
                audit(current, 'gacha', `Hộp mù ${count} lượt (Gộp cổ điển): trừ ${fee} điểm, ${rows.length} dòng vào kết quả chờ xử lý${foldText ? ` (${foldText})` : ''}`);
            });
        } catch (e) {
            if (isUncertain(this.app, token)) throw Error(`Kết quả lưu của ${count} lượt rút hộp mù chưa thể xác nhận (có thể đã trừ điểm và ghi vào mục chờ xử lý), giao dịch đã đóng băng. Vui lòng tải lại cuộc trò chuyện để đối chiếu Điểm Hệ Thống và vật phẩm chờ xử lý, đừng rút lặp lại. (${e.message})`);
            throw Error(e.message.replace(/[。.]?$/, '') + '. Chưa trừ Điểm Hệ Thống, bảo hiểm không thay đổi.');
        }
        refreshEngine(this.app); this.paintShenPity(frame.contentDocument);
        try { w?.addCartRecord?.(root, `Rút hộp mù (${count} lần · Gộp cổ điển)`, `${rows.map(r => `[${L.gradeLabel(r.品级)}]${r.名称}${r.数量 > 1 ? ' ×' + r.数量 : ''}`).join(', ')}; kết quả đã lưu vào vật phẩm chờ xử lý, giữ lại mới vào túi đồ.`); } catch { /* cart is cosmetic */ }
        this.app.hub.toast(`Đã lưu kết quả rút${foldText ? ` (${foldText})` : ''}, vui lòng giữ lại hoặc phân giải trong phần kết quả chờ xử lý.`, 5000);
    }
    /** 1.1.2: 抽卡模式 switch next to the original gacha buttons (and on the 商品定制 page). */
    paintGachaMode(doc) {
        const first = doc?.querySelector?.('.btn-gacha'); if (!first) return;
        let box = doc.querySelector('.zt-gacha-mode');
        if (!box) {
            box = doc.createElement('div'); box.className = 'zt-gacha-mode';
            box.style.cssText = 'margin:8px 0;padding:8px 10px;border:1px dashed rgba(180,140,220,.45);border-radius:10px;font-size:12px;line-height:1.6';
            (first.parentElement || first).after(box);
            box.addEventListener('click', e => {
                const b = e.target.closest?.('[data-zt-gacha-mode]'); if (!b) return;
                e.preventDefault(); e.stopPropagation();
                try { this.app.settings.set('gachaMode', b.dataset.ztGachaMode); } catch (err) { this.app.hub.toast('Chưa lưu được chế độ rút thẻ: ' + err.message, 6000); }
                this.paintGachaMode(doc);
            });
        }
        const mode = gachaMode(this.app.settings);
        const btn = id => `<button type="button" data-zt-gacha-mode="${id}" aria-pressed="${mode === id}" style="margin-right:6px;padding:3px 10px;border-radius:999px;border:1px solid rgba(180,140,220,.6);cursor:pointer;font:inherit;${mode === id ? 'background:#8d5fc0;color:#fff' : 'background:transparent;color:inherit'}">${GACHA_MODES[id].label}</button>`;
        box.innerHTML = `<b style="margin-right:8px">Chế độ rút thẻ</b>${btn('classic')}${btn('chunk')}<div style="opacity:.8;margin-top:4px">${GACHA_MODES[mode].note}</div>`;
    }
    /** 1.1.1 audit: 保留 / 分解 / 品阶分解 / 全部保留 / 回收 — one verified write instead of the original 2–N saves. */
    async item(button, frame) {
        const doc = frame.contentDocument, w = frame.contentWindow, root = doc?.querySelector('.mvu-sys');
        this.busy = true; button.disabled = true;
        try {
            const token = capture(this.app), plan = planFromButton(button, this.app.adapter.ledger(), doc);
            let receipt;
            try {
                receipt = await checkedCommit(this.app, token, current => {
                    const r = applyItemPlan(current, plan);
                    audit(current, 'item', `${r.title}: ${r.detail}${r.gain ? `, +${r.gain} Điểm Hệ Thống` : ''}`);
                    return r;
                });
            } catch (e) {
                if (isUncertain(this.app, token)) throw Error(`Kết quả lưu thao tác vật phẩm chưa thể xác nhận, giao dịch đã đóng băng. Vui lòng tải lại cuộc trò chuyện để đối chiếu túi đồ, mục chờ xử lý và Điểm Hệ Thống, đừng bấm lặp lại. (${e.message})`);
                throw Error(`${e.message.replace(/[。.]?$/, '')}. Vật phẩm và Điểm Hệ Thống đều không thay đổi.`);
            }
            refreshEngine(this.app);
            for (const f of ['renderPending', 'renderBag', 'renderRecycle', 'renderPocket', 'syncPointsFromVars']) try { w?.[f]?.(root); } catch { /* frame re-renders on its own */ }
            try { if (receipt.title !== 'Giữ lại' && receipt.title !== 'Giữ lại tất cả' && receipt.title !== '保留' && receipt.title !== '全部保留') w?.addCartRecord?.(root, receipt.title, receipt.detail + (receipt.gain ? ` (+${receipt.gain.toLocaleString()})` : '')); } catch { /* cart is cosmetic */ }
            this.app.hub.toast(`Đã lưu ${receipt.title}: ${receipt.detail}${receipt.gain ? `, +${receipt.gain.toLocaleString()} Điểm Hệ Thống` : ''}`, 4000);
        } finally { this.busy = false; button.disabled = false; }
    }
    async buy(button, token) {
        const z = this.app.adapter.ledger(), name = button.dataset.name, price = Number(button.dataset.price);
        const candidate = (z.商城库存 || []).find(i => !i.已购 && i.名称 === name && Number(i.价格) === price);
        if (!candidate) throw Error('Hàng hóa đã bán hết hoặc tồn kho đã thay đổi.');
        const stamp = JSON.stringify(candidate), grade = candidate.品阶 || '凡品', extra = candidate.特殊代价;
        if (grade === '禁忌' && (!extra || extra.resource !== '因果筹码' || extra.amount !== 1)) throw Error('Hàng hóa Cấm kỵ cũ thiếu cái giá nhận được có thể kiểm chứng, vui lòng nhập hàng mới rồi mua.');
        if (grade === '禁忌' && !confirm(`Để nhận 「${name}」 cần ${price.toLocaleString()} Điểm Hệ Thống và 1 Phỉnh Nhân Quả; sau khi nhận không có hạn chế sử dụng bổ sung. Xác nhận?`)) return;
        await checkedCommit(this.app, token, current => {
            const it = (current.商城库存 || []).find(x => !x.已购 && x.名称 === name && Number(x.价格) === price && (!candidate.id || x.id === candidate.id));
            if (!it || JSON.stringify(it) !== stamp) throw Error('Tồn kho đã thay đổi, chưa trừ phí.');
            const discount = grade === '禁忌' ? 0 : Math.min(30, Math.floor((Number(current.专属资源?.名望) || 0) / 1000));
            const pay = Math.ceil(price * (100 - discount) / 100);
            if (grade === '禁忌') {
                if (!canAcquireForbidden(current)) throw Error('Không đủ điều kiện nhận vật phẩm Cấm kỵ; chưa trừ phí.');
                current.专属资源.因果筹码--;
                for (const r of Object.values(current.面板账本 || {})) if (r?.snap?.专属资源) r.snap.专属资源.因果筹码 = Math.max(0, (Number(r.snap.专属资源.因果筹码) || 0) - 1);
            }
            L.spend(current, pay); L.bagAdd(current, { 名称: it.名称, 品级: grade, 分类: it.分类, 效果: `${it.效果}${it.来源世界 ? ' (Nguồn: ' + it.来源世界 + ')' : ''}`, 来源: '商城', 价格: pay }, 1); it.已购 = true;
            audit(current, 'purchase', `Mua ${it.名称}, trừ ${pay} Điểm Hệ Thống${extra ? ', 1 Phỉnh Nhân Quả' : ''}`);
        });
        refreshEngine(this.app);
        const w = this.app.hub.engineFrame?.contentWindow; w?.addCartRecord?.(w.document.querySelector('.mvu-sys'), 'Mua hàng', `${name}: ${candidate.效果}; đã nhập kho, không trừ phí lần nữa.`);
        this.app.hub.toast('Đã mua và đối chiếu bản lưu máy chủ.');
    }
    dispose() { this.dead = true; releaseFrames(this); this.off.splice(0).forEach(f => f()); }
}
