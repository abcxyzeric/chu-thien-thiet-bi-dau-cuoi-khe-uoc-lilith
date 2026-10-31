// 真实触摸互动 — native gesture layer on top of the ORIGINAL Lilith stage (vendor ZhuTianLilithMotion, unmodified).
// The original stage already reacts to a tap/click/Enter on a body part (bubble line + expression timeline + body
// motion) and lets the eyes follow a hovering mouse. This layer adds what a touch screen can do on top of it:
//   * stroke  — rubbing back and forth on a part (or a long slide) escalates through three stroke lines
//   * hold    — keeping a finger/mouse still on a part for 650 ms; the click that would follow is swallowed
//   * look    — on touch, her eyes follow the finger while it is down and settle back ~0.9 s after release
//   * haptics — navigator.vibrate on touch pointers only (tap 8 ms, stroke 6 ms per level, hold 15 ms), switchable
// Every reaction goes through the original speak(zone, point) so the expression/motion timeline is the original one;
// only the bubble text is replaced by the gesture line. Nothing here calls a model or touches the ledger.

export const STROKE_LINES = Object.freeze({
    cheek: [
        'Ưm… tay của chủ nhân ấm quá. Cho, cho phép xoa thêm một lát nữa thôi đấy nhé.',
        'Má bị chủ nhân xoa nóng bừng lên rồi đây này… không được cười đâu đấy.',
        'Cứ xoa tiếp thế này là Lilith sẽ ăn vạ không chịu đi đâu đó nha?',
    ],
    horn: [
        'Đừng, đừng vuốt dọc theo sừng mà… chỗ đó nhạy cảm lắm!',
        'Ư… chủ nhân cố tình đúng không? Sừng nóng ran cả lên rồi này.',
        'Đủ rồi đủ rồi! Còn sờ nữa là phải ký thêm điều khoản bổ sung đấy!',
    ],
    wing: [
        'Màng cánh phải vuốt xuôi theo chiều mới dễ chịu… Đúng rồi, cứ như vậy đó.',
        'Ưm~ Cánh được chăm sóc kỹ thế này, lần sau sẽ đưa ngài bay nhanh hơn một chút.',
        'Chủ nhân còn làm thế nữa là Lilith sẽ bọc ngài vào trong cánh luôn đấy.',
    ],
    tail: [
        'Á! Đuôi không thể vuốt kiểu đó được đâu… sẽ, sẽ bị nhũn người ra mất.',
        'Đuôi tự quấn lấy ngài ư? Đó, đó đâu phải do ta bảo nó làm!',
        'Hừ, đuôi đã nhận chủ rồi, chủ nhân phải chịu trách nhiệm tới cùng đấy nhé.',
    ],
    arm: [
        'Nắm tay thì cứ nắm tay đi, đừng có cù vào lòng bàn tay ta mà.',
        'Tay được chủ nhân nắm thế này, nhiệm vụ hôm nay hình như cũng chẳng còn khó khăn mấy nữa.',
        'Không buông ra sao? Được thôi, vậy cứ nắm thế này cùng đi nhé.',
    ],
    thigh: [
        'Này, sờ đi đâu đấy hả? Trong khế ước làm gì có ghi điều khoản này!',
        '… Hôm nay lá gan của chủ nhân cũng lớn gớm nhỉ.',
        'Còn không dừng lại là Lilith sẽ thu tiền lãi đó nha.',
    ],
    lower: [
        'Vạt áo bị ngài vò nhăn hết cả rồi… lát nữa phải giúp ta vuốt phẳng lại đấy.',
        'Đừng kéo nữa mà, gấu váy sẽ rối tung lên mất!',
        'Được rồi được rồi, Lilith đứng yên không nhúc nhích, cho ngài chỉnh sửa thỏa thích luôn.',
    ],
    chest: [
        'Ấn ký khế ước đang phát sáng kìa… chủ nhân có cảm nhận được không?',
        'Tiếng tim đập ư? Đó là tiếng vọng của khế ước thôi, không, không phải tại ta hồi hộp đâu.',
        'Cứ ấn vào đó mãi là tiếng tim đập của Lilith sẽ bị ngài nghe hết sạch mất.',
    ],
});
export const HOLD_LINES = Object.freeze({
    cheek: [
        'Được chủ nhân nâng má thế này… được rồi, chỉ cho phép ngắm một lát thôi nhé.',
        'Cứ nhìn ta chằm chằm như vậy, Lilith sẽ ngại đấy.',
    ],
    horn: [
        'Nắm lấy sừng là hành động thân mật lắm đó, chủ nhân có biết không hả?',
        '… Không buông tay sao? Vậy Lilith sẽ coi như ngài đang nghiêm túc đấy nhé.',
    ],
    wing: [
        'Nắm chặt cánh không buông ư? Vậy Lilith đưa ngài bay một vòng nhé.',
        'Đừng lo, cánh đã khép gọn rồi, sẽ không quạt bay ngài đi mất đâu.',
    ],
    tail: [
        'Đuôi bị tóm chặt mất rồi… đ-được thôi, cứ để ngài nắm vậy.',
        'Chóp đuôi đang run rẩy á? Làm gì có chuyện đó!',
    ],
    arm: [
        'Muốn Lilith ở bên ngài bao lâu cũng được, chỉ cần đừng buông tay là được.',
        'Nắm chặt thêm chút nữa đi, chặng đường phía trước chúng ta cùng bước.',
    ],
    thigh: [
        '… Cứ ấn giữ mãi không buông là có ý gì đây hả, chủ nhân?',
        'Còn ấn tiếp nữa là khế ước sẽ phải thêm điều khoản phụ đấy.',
    ],
    lower: [
        'Muốn giữ ta ở lại sao? Cứ nói thẳng ra đi mà.',
        'Bộ dạng níu chặt vạt áo thế này, cứ như sợ ta chạy mất không bằng.',
    ],
    chest: [
        'Ngài có nghe thấy không? Đây là khế ước của chúng ta đang đập từng nhịp đấy.',
        'Đặt tay ở nơi này… tâm ý của Lilith đều bị ngài biết hết cả rồi.',
    ],
});
export const GESTURE = Object.freeze({ strokeMin: 60, strokeLong: 140, strokeStep: 180, reversals: 2, holdMs: 650, holdSlop: 8, lookRelease: 900 });

/** Pure stroke classifier (tested in node): path length + direction reversals → null | level 0..2.
 *  Points are CSS pixels on screen, so the feel is the same on a phone and on a large monitor. */
export function classifyStroke(points) {
    let path = 0, reversals = 0, lastDir = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i][0] - points[i - 1][0], dy = points[i][1] - points[i - 1][1], d = Math.hypot(dx, dy);
        if (d < 1.5) continue; path += d;
        const major = Math.abs(dx) >= Math.abs(dy) ? dx : dy, dir = Math.sign(major);
        if (dir && lastDir && dir !== lastDir && d >= 3) reversals++;
        if (dir) lastDir = dir;
    }
    if (!(path >= GESTURE.strokeMin && reversals >= GESTURE.reversals) && !(path > GESTURE.strokeLong)) return { level: null, path, reversals };
    return { level: Math.min(2, Math.floor((path - GESTURE.strokeMin) / GESTURE.strokeStep)), path, reversals };
}

export class TouchLayer {
    constructor(settings) { this.settings = settings; this.off = []; this.stage = null; this.stats = { taps: 0, strokes: 0, holds: 0 }; this.seen = {}; }
    enabled() { return this.settings.get('touchGestures') !== false; }
    buzz(e, pattern) { if (e?.pointerType === 'touch' && this.settings.get('haptics') !== false) try { navigator.vibrate?.(pattern); } catch { /* optional */ } }
    /** Attach to a mounted original stage ({frame, figure, bubble, speak, rig}). Safe to call again on remount. */
    attach(motion) {
        this.detach();
        const stage = motion?.stages?.[0]; if (!stage?.figure || typeof stage.speak !== 'function') return false;
        this.stage = stage;
        const { figure, frame } = stage, root = figure.getRootNode?.() || document, win = figure.ownerDocument.defaultView || window;
        const vb = figure.viewBox?.baseVal, W = vb?.width || 424, H = vb?.height || 632;
        const on = (el, type, fn, opts) => { el.addEventListener(type, fn, opts); this.off.push(() => el.removeEventListener(type, fn, opts)); };
        const logical = e => { const b = figure.getBoundingClientRect(); return b.width ? [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H] : null; };
        const zoneAt = e => { const el = root.elementFromPoint?.(e.clientX, e.clientY); return el?.closest?.('.zt-zone')?.dataset.zone || null; };
        // Strokes need the browser not to scroll while a finger is on a body part (the original zones allow pan-y).
        const style = figure.ownerDocument.createElement('style');
        style.textContent = '.zt-stage[data-zt-touch=on] .zt-zone{touch-action:none!important}';
        (root.nodeType === 11 ? root : figure.ownerDocument.head).append(style);
        frame.dataset.ztTouch = this.enabled() ? 'on' : 'off';
        this.off.push(() => { style.remove(); delete frame.dataset.ztTouch; });
        let g = null, swallowUntil = 0, lookTimer = 0;
        const say = (zone, text, point) => { stage.speak(zone, point); if (text && stage.bubble) stage.bubble.textContent = text; };
        on(figure, 'pointerdown', e => {
            if (!this.enabled()) return;
            const zone = e.target?.closest?.('.zt-zone')?.dataset.zone; if (!zone) return;
            const p = logical(e);
            g = { id: e.pointerId, zone, type: e.pointerType, start: [e.clientX, e.clientY], pts: [[e.clientX, e.clientY]], last: p, level: -1, held: false, moved: false };
            g.timer = win.setTimeout(() => {
                if (!g || g.moved || g.level >= 0) return;
                g.held = true; this.stats.holds++; swallowUntil = win.performance.now() + 1200;
                const lines = HOLD_LINES[g.zone] || [], n = (this.seen['hold:' + g.zone] = (this.seen['hold:' + g.zone] ?? -1) + 1);
                say(g.zone, lines[n % lines.length], g.last); this.buzz(e, 15);
            }, GESTURE.holdMs);
            if (e.pointerType === 'touch' && p) { stage.rig?.pointAt?.(p, win.performance.now(), 0); win.clearTimeout(lookTimer); }
        }, true);
        on(figure, 'pointermove', e => {
            if (!g || e.pointerId !== g.id) return;
            const p = logical(e); if (!p) return;
            if (Math.hypot(e.clientX - g.start[0], e.clientY - g.start[1]) > GESTURE.holdSlop) g.moved = true;
            g.last = p; g.pts.push([e.clientX, e.clientY]); if (g.pts.length > 240) g.pts.splice(1, g.pts.length - 240);
            if (g.type === 'touch') stage.rig?.pointAt?.(p, win.performance.now(), 0);
            if (g.held) return;
            const zone = zoneAt(e) || g.zone, r = classifyStroke(g.pts);
            if (r.level !== null && r.level > g.level) {
                g.level = r.level; g.zone = zone; this.stats.strokes++; swallowUntil = win.performance.now() + 1200;
                say(zone, STROKE_LINES[zone]?.[r.level], p); this.buzz(e, 6 * (r.level + 1));
            }
        }, true);
        const end = e => {
            if (!g || e.pointerId !== g.id) return;
            win.clearTimeout(g.timer);
            if (!g.moved && !g.held && g.level < 0 && e.type === 'pointerup') { this.stats.taps++; this.buzz(e, 8); }
            if (g.type === 'touch') { win.clearTimeout(lookTimer); lookTimer = win.setTimeout(() => stage.rig?.pointAt?.(null, win.performance.now()), GESTURE.lookRelease); }
            g = null;
        };
        on(figure, 'pointerup', end, true); on(figure, 'pointercancel', end, true);
        // After a hold or a stroke the browser still sends a click; the original would answer it with a tap line.
        on(figure, 'click', e => { if (win.performance.now() < swallowUntil) { swallowUntil = 0; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
        this.off.push(() => { win.clearTimeout(lookTimer); if (g) win.clearTimeout(g.timer); });
        this.offSettings = this.settings.onChange?.(k => { if (k === 'touchGestures' && this.stage) this.stage.frame.dataset.ztTouch = this.enabled() ? 'on' : 'off'; });
        return true;
    }
    detach() { this.off.splice(0).forEach(f => { try { f(); } catch { /* gone */ } }); this.offSettings?.(); this.offSettings = null; this.stage = null; }
    dispose() { this.detach(); }
}
