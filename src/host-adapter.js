import {LedgerService} from './ledger-service.js';
import { ID, STORAGE, PROMPT, identity, snapshotToken, normalizeIntent } from './contracts.js';
import { hostSupport, loadHostModule, fetchHostVersion, probeCapabilities } from './compat.js';
// 0.3.0: no static `import … from '/script.js'` any more (a missing export would kill module linking on other hosts).
// sendMessageAsUser / is_send_press are resolved at start() through a dynamic import, verified for 1.16.0–1.19.0.

/** SillyTavern's #mes_stop is visible exactly while the main chat generates (missing element: assume visible). */
export function stopButtonShown(doc = globalThis.document) {
    const el = doc?.getElementById?.('mes_stop'); if (!el) return true;
    try { return el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none'; } catch { return true; }
}
export class HostAdapter {
    constructor(original) {
        this.original = original;
        this.disposers = [];
        this.subscribers = new Set();
        this.busy = false;
        this.generating = false;
        this.sawStop = false;
        this.dead = false;
        this.generationEpoch = 0;
        this.sendingReceipts = new Set();
        this.version = null;
        this.support = null;
        this.capabilities = [];
        this.host = null;
        this.transactions = new LedgerService(this);
    }
    context() { return globalThis.SillyTavern?.getContext?.(); }
    async start() {
        const c = this.context();
        this.host = await loadHostModule();
        if (this.dead) return;
        if (!c?.eventSource || !c.eventTypes || typeof c.saveChat !== 'function' || typeof this.host.sendMessageAsUser !== 'function') throw Error('Máy chủ thiếu giao diện đã kiểm nghiệm (Bus sự kiện / saveChat / sendMessageAsUser), dừng khởi động, chưa sửa đổi dữ liệu.');
        try { const v = await fetchHostVersion(); this.version = v.pkgVersion; this.versionInfo = v; }
        catch { throw Error('Không thể đối chiếu phiên bản SillyTavern, đã chặn ghi dữ liệu.'); }
        if (this.dead) return;
        this.support = hostSupport(this.version);
        if (!this.support.ok) throw Error(this.support.reason);
        await new Promise(resolve => {
            const event=c.eventTypes.APP_READY;
            const ready=()=>{c.eventSource.removeListener(event,ready);resolve();};
            this.disposers.push(()=>c.eventSource.removeListener(event,ready));
            c.eventSource.on(event,ready); // APP_READY is in autoFireAfterEmit on 1.16.0–1.19.0: late subscribers fire immediately.
        });
        if (this.dead) return;
        this.capabilities = probeCapabilities(this.context(), this.host);
        const missing = this.capabilities.filter(x => !x.ok && ['eventSource','eventTypes','saveChat','saveMetadata','setExtensionPrompt','addOneMessage'].includes(x.key));
        if (missing.length) throw Error('Máy chủ thiếu giao diện cốt lõi: ' + missing.map(x => x.label).join(', ') + '; dừng khởi động, chưa sửa đổi dữ liệu.');
        if (this.support.level === 'newer') globalThis.toastr?.warning(this.support.reason, 'Thiết Bị Đầu Cuối Khế Ước Chư Thiên');
        for (const key of ['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_EDITED','MESSAGE_SWIPED','MESSAGE_DELETED','USER_MESSAGE_RENDERED','CHARACTER_MESSAGE_RENDERED']) {
            const event = c.eventTypes[key]; if (!event) continue;
            const fn = () => {
                if (['CHAT_CHANGED','MESSAGE_EDITED','MESSAGE_SWIPED','MESSAGE_DELETED'].includes(key)) this.generationEpoch++;
                if (key === 'CHAT_CHANGED') this.clearPrompt();
                this.notify();
            };
            c.eventSource.on(event, fn);this.disposers.push(()=>c.eventSource.removeListener(event,fn));
        }
        const on=(key,fn)=>{const e=c.eventTypes[key];if(e){c.eventSource.on(e,fn);this.disposers.push(()=>c.eventSource.removeListener(e,fn));}};
        on('GENERATION_STARTED',(type,opts,dry)=>{if(!dry){this.generating=true;this.sawStop=false;this.generationEpoch++;this.notify();}});
        on('GENERATION_ENDED',()=>{this.generating=false;this.notify();});
        on('GENERATION_STOPPED',()=>{this.generating=false;this.notify();});
        on('GENERATION_AFTER_COMMANDS',(type,opts,dry)=>{if(!dry&&!['quiet','impersonate'].includes(type))this.refreshPrompt(type);});
        const stop=globalThis.document?.getElementById?.('mes_stop');
        if(stop&&typeof MutationObserver==='function'){const mo=new MutationObserver(()=>this.checkStop());mo.observe(stop,{attributes:true,attributeFilter:['style','class','hidden']});this.disposers.push(()=>mo.disconnect());}
    }
    subscribe(fn) { this.subscribers.add(fn); return ()=>this.subscribers.delete(fn); }
    notify() { if(!this.dead)for(const fn of this.subscribers) { try{fn();}catch(e){console.warn('[Chư Thiên] Làm mới chỉ đọc thất bại',e.message);} } }
    /** 0.8.5: a missed GENERATION_ENDED (phone browser backgrounded mid-stream, a thinking model) left `generating` true
     *  for good: the status-bar renderer then never touched the last floor (raw <ZhuTianPanel> text on phones) and trades
     *  refused with Cuộc trò chuyện chính đang tạo phản hồi. SillyTavern shows its stop button while the main chat generates and hides it at the end
     *  (also when the end event is lost). So: once the stop button was seen during this generation and is hidden again,
     *  the generation is over and a stale flag clears itself. GENERATION_STARTED fires *before* SillyTavern sets
     *  is_send_press and shows the button, and quiet generations never show it: a button that was never seen therefore
     *  changes nothing (the send lock stays exactly as before). */
    checkStop() {
        if(!this.generating)return;
        if(stopButtonShown())this.sawStop=true;
        else if(this.sawStop&&!this.host?.isSendPress?.()){this.generating=false;this.sawStop=false;this.notify?.();}
    }
    isGenerating() {
        this.checkStop();
        return this.generating||!!this.host?.isSendPress?.();
    }
    currentIdentity() { return identity(this.context()); }
    variables() {
        // Storage corroborated against Tavern Helper variables.ts @519599bc... (type:'chat').
        // Read-only: do not silently prefer a new variable root or overwrite an old one.
        const v=this.context()?.chatMetadata?.variables;
        return v && typeof v==='object'&&!Array.isArray(v)?v:{};
    }
    ledger() { const l=this.variables().诸天系统;return l&&typeof l==='object'&&!Array.isArray(l)?l:null; }
    memory() {
        const c=this.original.ZhuTianMemoryCore;
        return c.state(this.variables()[c.NS]);
    }
    timeline() {
        return this.original.ZhuTianMemoryCore.timeline((this.context()?.chat||[]).map((m,i)=>({
            message_id:i,role:m.is_system?'system':m.is_user?'user':'assistant',name:m.name,is_hidden:!!m.is_system,message:m.mes||''
        })));
    }
    settings() { return this.context()?.chatMetadata?.[STORAGE] || {}; }
    async setRecall(enabled) {
        if(this.busy)throw Error('Giao dịch đang được lưu, vui lòng sửa cài đặt sau.');
        if(!this.currentIdentity())throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước.');
        if(enabled && document.querySelector('#zt-memory-assistant-v1:not([data-zt-native])'))throw Error('Phát hiện Trợ lý Ký ức bản cũ: vui lòng tắt bản cũ trước rồi mới bật gợi ý hồi ức bản mới để tránh tiêm trùng lặp.');
        const c=this.context(),chat=c.chat,id=this.currentIdentity();
        c.chatMetadata[STORAGE]={...this.settings(),schema:1,recallEnabled:!!enabled};
        await c.saveMetadata();
        if(this.currentIdentity()!==id||this.context().chat!==chat)throw Error('Trò chuyện đã chuyển, vui lòng quay lại cuộc trò chuyện ban đầu để kiểm tra cài đặt.');
        this.refreshPrompt();this.notify();
    }
    async setNativeLedger(enabled) {
        if(this.busy||this.dead||this.generating||!this.currentIdentity())throw Error('Vui lòng dừng tạo/giao dịch và mở cuộc trò chuyện đơn nhân vật trước.');
        if(enabled&&this.transactions.legacyActive())throw Error('Vui lòng tắt thanh trạng thái cũ và trợ lý cũ trước; không thể để hai bộ máy cùng ghi vào một sổ cái.');
        const c=this.context(),id=this.currentIdentity(),target={avatar_url:c.characters[c.characterId].avatar,file_name:c.getCurrentChatId()};
        c.chatMetadata[STORAGE]={...this.settings(),nativeLedgerEnabled:!!enabled};
        await c.saveMetadata();
        const disk=await this.transactions.request('get',target);
        if(id!==this.currentIdentity()||disk?.[0]?.chat_metadata?.[STORAGE]?.nativeLedgerEnabled!==!!enabled)throw Error('Chưa thể xác thực việc lưu cài đặt, vui lòng tải lại trang để kiểm tra.');
        this.notify();
    }
    clearPrompt() { this.context()?.setExtensionPrompt?.(PROMPT,'',1,0,false,0); }
    refreshPrompt(type='') {
        const c=this.context();
        if(this.dead||!identity(c)||!this.settings().recallEnabled||this.assistantOwnsPrompt?.()||document.querySelector('#zt-memory-assistant-v1:not([data-zt-native])')){this.clearPrompt();return;}
        try{
            const core=this.original.ZhuTianMemoryCore,st=this.memory();
            if(!st.enabled){this.clearPrompt();return;}
            let time=this.timeline();if(['regenerate','swipe'].includes(type)){const last=time.findLast(x=>x.role==='assistant'&&!x.hidden);if(last)time=time.filter(x=>x.id<last.id);}
            const q=time.findLast(x=>x.role==='user'&&!x.hidden)?.body||'';
            const recalled=core.recall(st,time,this.ledger(),q),id=identity(c);
            c.setExtensionPrompt(PROMPT,recalled.content,1,0,false,0,()=>!this.dead&&this.currentIdentity()===id&&this.settings().recallEnabled&&!document.querySelector('#zt-memory-assistant-v1:not([data-zt-native])'));
        }catch(e){this.clearPrompt();console.warn('[Chư Thiên] Gợi ý hồi ức chưa được bật:',e.message);}
    }
    draft(target,action) {
        const c=this.context();if(!identity(c))throw Error('Vui lòng mở cuộc trò chuyện đơn nhân vật trước, bản này không tiếp quản trò chuyện nhóm.');
        return {...normalizeIntent(target,action),id:crypto.randomUUID(),chatIdentity:identity(c),chatRef:c.chat,token:snapshotToken(c),epoch:this.generationEpoch};
    }
    async send(draft) {
        if(this.dead)throw Error('Tiện ích đã tắt.');
        if(this.busy||this.isGenerating())throw Error('Đang có thao tác khác hoặc cuộc trò chuyện chính đang tạo phản hồi, vui lòng thử lại sau.');
        const c=this.context();
        if(!draft?.id||this.sendingReceipts.has(draft.id))throw Error('Thao tác này đã được gửi, không gửi lặp lại.');
        if(identity(c)!==draft.chatIdentity||c.chat!==draft.chatRef||snapshotToken(c)!==draft.token||draft.epoch!==this.generationEpoch)throw Error('Trò chuyện hoặc chính văn đã thay đổi, vui lòng xem trước lại rồi mới gửi.');
        if(document.getElementById('file_form_input')?.files?.length)throw Error('Ô nhập chính đang có tệp đính kèm chờ gửi, vui lòng xử lý tệp đính kèm trước để tránh gửi nhầm vào tương tác này.');
        const normalized=normalizeIntent(draft.target,draft.action);
        const diskTarget={avatar_url:c.characters[c.characterId].avatar,file_name:c.getCurrentChatId()};
        this.busy=true;this.sendingReceipts.add(draft.id);this.notify();
        try {
            const message=await this.host.sendMessageAsUser(normalized.message,'');
            // After host events/save, use the original object identity to avoid stamping a different chat.
            if(!draft.chatRef.includes(message))throw Error('Máy chủ chưa xác nhận đối tượng tin nhắn, dừng các thao tác tiếp theo; vui lòng không tự động gửi lại.');
            if(identity(this.context())!==draft.chatIdentity||this.context().chat!==draft.chatRef)throw Error('Cuộc trò chuyện đã thay đổi trong lúc gửi. Tin nhắn có thể đã được ghi vào cuộc trò chuyện gốc, vui lòng kiểm tra thủ công; không tự động gửi lại.');
            message.extra ||= {};
            message.extra[STORAGE]={kind:'player-interaction',id:draft.id,target:normalized.target,version:1,at:Date.now()};
            await this.context().saveChat();
            // saveChatConditional catches errors internally; its resolved promise is NOT a disk receipt.
            // Read the actual server chat back before reporting success. This endpoint is pinned too.
            const response=await fetch('/api/chats/get',{method:'POST',headers:c.getRequestHeaders(),credentials:'same-origin',cache:'no-store',body:JSON.stringify(diskTarget),signal:AbortSignal.timeout(15000)});
            if(!response.ok)throw Error('Không thể xác thực trạng thái lưu tin nhắn, đã dừng các thao tác tiếp theo');
            const disk=await response.json();
            if(!Array.isArray(disk)||!disk.some(m=>m.extra?.[STORAGE]?.id===draft.id&&m.is_user&&m.mes===message.mes))throw Error('Không tìm thấy chứng từ tin nhắn lần này trong bản ghi máy chủ, vui lòng kiểm tra bản lưu thủ công');
            if(identity(this.context())!==draft.chatIdentity)throw Error('Tin nhắn đã được xác thực ở cuộc trò chuyện gốc, nhưng cuộc trò chuyện hiện tại đã chuyển sang nơi khác');
            this.notify();
            return {message,id:this.context().chat.indexOf(message)};
        } catch(e) {
            // A host call can save before rejecting. Fail closed: never silently delete or repeat it.
            throw Error(`${e.message} Nếu nội dung đã xuất hiện trong chính văn, vui lòng không gửi lặp lại.`);
        } finally {this.busy=false;this.notify();}
    }
    dispose() {this.transactions.dispose();this.dead=true;this.generationEpoch++;this.disposers.splice(0).forEach(fn=>fn());this.subscribers.clear();this.clearPrompt();}
}
