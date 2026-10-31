import { WindowControls } from './src/window-controls.js';
import { OperationRecords } from './src/operation-records.js';
import { Commerce } from './src/commerce.js';
import { StoryCollect } from './src/story-collect.js';
import { Bonds } from './src/bonds.js';
import { AdminConsole } from './src/admin.js';
import original from './vendor/original/runtime.js';
import {HostAdapter} from './src/host-adapter.js';
import {Hub} from './src/hub.js';
import {HubSettings} from './src/hub-settings.js';
import {HubPlugins} from './src/hub-plugins.js';
import {HubGroup} from './src/hub-group.js';
import { HubManual } from './src/hub-manual.js';
import { PersonaHost } from './src/persona.js';
import { HubPersona } from './src/hub-persona.js';
import { HubSwitches } from './src/hub-switches.js';
import {ID, VERSION} from './src/contracts.js';
import {hooksSupported, fetchHostVersion} from './src/compat.js';
import {Settings} from './src/settings.js';
import {Bridge} from './src/th-bridge.js';
import {StatusBarHost} from './src/statusbar-host.js';
import {AssistantHost} from './src/assistant-host.js';
import {Features} from './src/features.js';
import {Portrait} from './src/portrait.js';
import {MacroLikeHost} from './src/macro-like.js';
import {installInterceptor} from './src/prompt-filter.js';
import {TouchLayer} from './src/touch.js';
import {openApiCenter,mountApiInline} from './src/api-center.js';
import {Takeover} from './src/takeover.js';
import {World} from './src/world.js';
import {HubAtlas} from './src/hub-atlas.js';
import {FX} from './src/fx.js';
import {LilithStage} from './src/lilith-stage.js';
import {SkillSync} from './src/skill-sync.js';
import { Appraise } from './src/appraise.js';
import { PanelGuard } from './src/panel-guard.js';
import { RerollGuard } from './src/reroll-guard.js';
import {LilithFloat} from './src/lilith-float.js';
import {MobileLayout} from './src/mobile.js';
import {ErrorLog} from './src/diag-report.js';
import {DeviceCheck} from './src/device-check.js';
import {Onboarding} from './src/onboarding.js';
import {DataIO} from './src/data-io.js';
import {Perf} from './src/perf.js';
import {unbindAll} from './src/wb-unbind.js';
import {WORLD_NAME} from './src/features.js';
import {errorLine} from './src/errors.js';

// manifest.generate_interceptor is looked up on globalThis at generation time: define it as soon as the module loads.
installInterceptor();

const base=new URL('./',import.meta.url).href;
let app=null,starting=null,disposed=false,abortStart=0,pending=null,hooked=false;

/** Everything that runs while the extension is enabled. Each part fails independently and reports in diagnostics. */
class App {
    constructor(adapter){this.adapter=adapter;this.original=original;this.base=base;this.parts=[];}
    async start(){
        const a=this.adapter;
        // 0.9.1: remember the last plugin errors for Sao chép thông tin chẩn đoán (first, so start-up failures are caught too)
        try{this.errorLog=new ErrorLog(base).start();this.parts.push(this.errorLog);}catch(e){console.warn('[Chư Thiên] Nhật ký báo lỗi chưa khởi động',e);}
        this.settings=new Settings(a);
        this.bridge=new Bridge(a,this.settings);this.parts.push(this.bridge);
        a.statusbarActive=()=>!!this.statusbar?.active;
        this.macros=new MacroLikeHost(a,this.settings);try{this.macros.start();this.parts.push(this.macros);}catch(e){console.warn('[Chư Thiên] Macro biến chưa khởi động',e);}
        const V=original.ZhuTianLilithVoice,voiceKit=V?{cardStyle:V.cardStyle,labelStyle:V.labelStyle,avatarStyle:V.avatarStyle,decorate:V.decorate,avatars:original.ZhuTianLilithAvatars}:null;
        this.takeover=new Takeover(a,this.settings);
        try{this.statusbar=new StatusBarHost(a,this.bridge,this.settings,base,{macros:this.macros,voice:voiceKit});await this.statusbar.start();this.parts.push(this.statusbar);}
        catch(e){this.statusbarError=e.message;console.error('[Chư Thiên] Thanh trạng thái gốc chưa khởi động',e);this.statusbar=null;}
        if(this.settings.get('assistant')){
            try{this.assistant=new AssistantHost({adapter:a,bridge:this.bridge,original,settings:this.settings,openTerminal:p=>this.openTerminal(p),persona:()=>this.persona}).start();this.parts.push(this.assistant);}
            catch(e){this.assistantError=e.message;this.assistant=null;console.warn('[Chư Thiên] Trợ lý Lilith chưa khởi động:',e.message);globalThis.toastr?.warning(e.message,'Chư Thiên · Lilith');}
        }
        // 0.5.0: ONE window. The Lilith window is the shell; the hub adds every system page into it.
        this.hubSettings=new HubSettings(this);
        try{this.hub=new Hub(this).start();this.parts.push(this.hub);}catch(e){this.hubError=e.message;console.error('[Chư Thiên] Thiết bị đầu cuối chưa khởi động',e);}
        // 1.1.5 Thiết lập nhân cách trợ lý hệ thống (mặc định Lilith = không thay đổi gì)
        try{this.personaHost=new PersonaHost(this).start();this.parts.push(this.personaHost);}catch(e){console.warn('[Chư Thiên] Thiết lập trợ lý hệ thống chưa khởi động',e);}
        try{this.plugins=new HubPlugins(this).start();this.parts.push(this.plugins);}catch(e){console.warn('[Chư Thiên] Quản lý phụ trợ chưa khởi động',e);}
        try{this.group=new HubGroup(this).start();this.parts.push(this.group);}catch(e){console.warn('[Chư Thiên] Nhóm chat chưa khởi động',e);}
        // 1.1.4: Cẩm nang — docs/MANUAL.md inside the terminal (read-only)
        try{this.manual=new HubManual(this).start();this.parts.push(this.manual);}catch(e){console.warn('[Chư Thiên] Cẩm nang chưa khởi động',e);}
        try{this.personaPage=new HubPersona(this).start();this.parts.push(this.personaPage);}catch(e){console.warn('[Chư Thiên] Trang thiết lập trợ lý chưa khởi động',e);}
        try{this.switches=new HubSwitches(this).start();this.parts.push(this.switches);}catch(e){console.warn('[Chư Thiên] Công tắc tính năng chưa khởi động',e);}
        // 0.7.0: world themes, Đồ phổ, Hiệu ứng diễn xuất (each optional; the terminal works without them).
        try{this.world=new World(this).start();this.parts.push(this.world);}catch(e){console.warn('[Chư Thiên] Chủ đề thế giới chưa khởi động',e);}
        try{this.atlas=new HubAtlas(this).start();this.parts.push(this.atlas);}catch(e){console.warn('[Chư Thiên] Đồ phổ chưa khởi động',e);}
        try{this.fx=new FX(this).start();this.parts.push(this.fx);}catch(e){console.warn('[Chư Thiên] Hiệu ứng diễn xuất chưa khởi động',e);}
        try{this.skills=new SkillSync(this).start();this.parts.push(this.skills);}catch(e){console.warn('[Chư Thiên] Độ thuần thục tu hành chưa khởi động',e);}
        // 1.0: Giám định phẩm giai — công pháp / vật phẩm nhận được trong cốt truyện không còn bị khóa ở Phàm phẩm (AI giám định hoặc sửa thủ công, chỉ tăng không giảm)
        try{this.appraise=new Appraise(this).start();this.parts.push(this.appraise);}catch(e){console.warn('[Chư Thiên] Giám định phẩm giai chưa khởi động',e);}
        // 1.1.1: Bảo vệ định dạng khối dữ liệu — tự động chỉnh lý khi khối dữ liệu của phản hồi mới bị lẫn vào chính văn / chưa đóng thẻ / nằm trong chuỗi suy nghĩ; có thể bổ sung khi bị thiếu
        try{this.panelGuard=new PanelGuard(this).start();this.parts.push(this.panelGuard);}catch(e){console.warn('[Chư Thiên] Bảo vệ định dạng khối dữ liệu chưa khởi động',e);}
        try{this.rerollGuard=new RerollGuard(this).start();this.parts.push(this.rerollGuard);}catch(e){console.warn('[Chư Thiên] Hoàn tác sổ cái khi reroll chưa khởi động',e);}
        this.touch=new TouchLayer(this.settings);this.parts.push(this.touch);
        if(this.assistant){this.assistant.onMotion=m=>this.touch.attach(m);if(this.assistant.motion)this.touch.attach(this.assistant.motion);}
        this.portrait=new Portrait(this);this.parts.push(this.portrait);
        try{await this.portrait.start();}catch(e){console.warn('[Chư Thiên] Chế độ ảnh đứng quay về hoạt ảnh phân lớp nguyên bản:',e.message);}
        try{this.lilith=new LilithStage(this).start();this.parts.push(this.lilith);}catch(e){console.warn('[Chư Thiên] Nhân vật giao diện Lilith chưa khởi động',e);}
        // 0.9.0: phones get the terminal full screen (follows the keyboard; landscape = left rail). Before the float, which asks it.
        if(this.hub)try{this.mobile=new MobileLayout(this).start();this.parts.push(this.mobile);}catch(e){console.warn('[Chư Thiên] Bố cục di động chưa khởi động',e);}
        for (const [key, Module] of [['windowControls', WindowControls], ['records', OperationRecords], ['commerce', Commerce], ['collect', StoryCollect], ['bonds', Bonds], ['adminConsole', AdminConsole]]) {
            try { this[key] = new Module(this).start(); this.parts.push(this[key]); }
            catch (e) { console.error('[Chư Thiên 1.1] Mô-đun chưa khởi động', key, e); globalThis.toastr?.error?.(key + ' chưa khởi động: ' + e.message, 'Chư Thiên'); }
        }
        // 0.8.2: phones never show the portrait inside the window — Lilith floats on the page instead (and speaks there).
        try{this.float=new LilithFloat(this).start();this.parts.push(this.float);}catch(e){console.warn('[Chư Thiên] Lilith nổi chưa khởi động',e);}
        this.features=new Features(this);this.features.start();this.parts.push(this.features);
        // 1.0: Tự động giảm cấp hiệu ứng động (máy cấu hình thấp / hệ thống bật giảm chuyển động)
        try{this.perf=new Perf(this).start();this.parts.push(this.perf);}catch(e){console.warn('[Chư Thiên] Kiểm tra hiệu ứng động chưa khởi động',e);}
        // 1.0: Xuất / Nhập bản lưu + Phiên bản cấu trúc sổ cái (kiểm tra khi mở trò chuyện, cấu trúc cũ sao lưu trước rồi nâng cấp, cấu trúc mới hơn chỉ đọc)
        try{this.dataIO=new DataIO(this).start();this.parts.push(this.dataIO);}catch(e){console.warn('[Chư Thiên] Xuất nhập bản lưu chưa khởi động',e);}
        // 0.9.1: Tự kiểm tra thiết bị di động (runs only when the user starts it)
        this.deviceCheck=new DeviceCheck(this);this.parts.push(this.deviceCheck);
        // 0.8.4: one API setting — the terminal's Kết nối page shows the Trung tâm API form (the original v1.1 form wrote only Lilith's copy).
        if(this.hub)this.hub.hook('onPage',p=>{if(p==='api')try{mountApiInline(this.hub.shadow.getElementById('page-api'),this.apiOpts());}catch(e){console.warn('[Chư Thiên] Trang kết nối',e);}});
        if(this.statusbar)this.statusbar.openApi=()=>this.openApiCenter();
        if(this.hub?.page==='api')try{mountApiInline(this.hub.shadow.getElementById('page-api'),this.apiOpts());}catch(e){console.warn('[Chư Thiên] Trang kết nối',e);}
        // 0.9.3: Hướng dẫn tân thủ (after the Kết nối page hook, so its 「Quay lại hướng dẫn」 strip lands on top of the mounted form)
        if(this.hub)try{this.guide=new Onboarding(this).start();this.parts.push(this.guide);}catch(e){console.warn('[Chư Thiên] Hướng dẫn tân thủ chưa khởi động',e);}
        this.settings.mountDrawer({open:()=>this.openTerminal(),restore:()=>this.restoreLegacy(),float:()=>this.float?.show(),avatar:()=>{this.settings.set('floatLilith','off');globalThis.toastr?.info('Kéo ảnh đại diện xuống cuối màn hình để đổi thành Lilith, hoặc đóng cửa sổ nổi.','Chư Thiên · Đã hiện ảnh đại diện',{timeOut:5000});}});
        globalThis.__zhutianApp=this;
    }
    openTerminal(page){if(this.hub)this.hub.open(page);else this.assistant?.open();}
    apiOpts(){return {bridge:this.bridge,ns:original.ZhuTianMemoryCore?.NS,notify:()=>this.adapter.notify?.()};}
    /** Inside the open terminal the Kết nối page is the Trung tâm API; elsewhere (diagnostics popup) the same form opens as a dialog. */
    openApiCenter(){if(this.hub?.isOpen){this.hub.go('api');return null;}return openApiCenter(this.apiOpts());}
    async runTakeover(){
        const t=globalThis.toastr,list=this.takeover.pending();
        if(!list.length){t?.info('Không phát hiện biểu thức chính quy (Regex) hoặc kịch bản Tavern Helper bản cũ nào còn đang bật; Sách Thế Giới được tiện ích tự động cài đặt và gắn kết.','Chư Thiên · Tiếp quản');return {items:[],reload:false};}
        const names=list.map(i=>`${i.kind==='regex'?'Regex':'Kịch bản Tavern Helper'} (${i.scope==='global'?'Toàn cục':'Thẻ nhân vật'}): ${i.name}`).join('\n');
        if(!globalThis.confirm(`Sẽ tắt ${list.length} mục bản cũ sau đây để tiện ích này tiếp quản (không xóa, có thể "Khôi phục bản cũ" bất cứ lúc nào):\n\n${names}`))return {items:[],reload:false,cancelled:true};
        try{const r=await this.takeover.run();this.statusbar?.rebuild();
            if(r.reload){t?.success('Đã tắt bản cũ. Trang sẽ làm mới sau 2 giây để Tavern Helper gỡ nạp kịch bản cũ.','Chư Thiên · Tiếp quản');setTimeout(()=>location.reload(),2000);}
            else t?.success(`Đã tắt ${r.items.length} Regex cũ, hiện do tiện ích tiếp quản nguyên bản.`,'Chư Thiên · Tiếp quản');
            return r;}catch(e){t?.error(errorLine(e),'Chư Thiên · Tiếp quản');throw e;}
    }
    async restoreLegacy(){
        const t=globalThis.toastr;
        try{const r=await this.takeover.restore();
            if(!r.items.length){t?.info('Không có bản ghi nào có thể khôi phục (các mục trong thẻ nhân vật cần mở đúng nhân vật tương ứng trước).','Chư Thiên · Khôi phục');return r;}
            t?.warning('Đã bật lại bản cũ. Để tránh xuất hiện hai Lilith và trùng lặp thanh trạng thái, vui lòng tắt tiện ích này trong danh sách Tiện ích mở rộng rồi làm mới trang.','Chư Thiên · Khôi phục',{timeOut:12000});
            this.statusbar?.rebuild();return r;}catch(e){t?.error(errorLine(e),'Chư Thiên · Khôi phục');throw e;}
    }
    dispose(){if(globalThis.__zhutianApp===this)globalThis.__zhutianApp=null;for(const p of this.parts.splice(0).reverse()){try{p.dispose();}catch(e){console.warn('[Chư Thiên] Gỡ nạp',e);}}this.settings?.dispose();}
}

async function boot(){
    if(app||starting)return starting;
    const token=++abortStart;
    starting=(async()=>{
        if(document.getElementById(ID))return;
        const candidate=new HostAdapter(original);pending=candidate;let next=null;
        try{
            await candidate.start();
            if(disposed||token!==abortStart){candidate.dispose();return;}
            next=new App(candidate);await next.start();
            if(disposed||token!==abortStart){next.dispose();candidate.dispose();return;}
            app=next;
            console.info(`[Chư Thiên] ${VERSION} đã tải trên SillyTavern ${candidate.version} (${candidate.support.tested?'đã nghiệm thu':'dò tìm năng lực'}).`);
        }catch(error){next?.dispose();candidate.dispose();app=null;if(!disposed&&token===abortStart){console.error('[Chư Thiên]',error);globalThis.toastr?.error(error.message,'Thiết Bị Đầu Cuối Khế Ước Chư Thiên: Khởi động bị chặn');}}
    })().finally(()=>{starting=null;pending=null;if(!disposed&&!app&&token!==abortStart)void boot();});
    return starting;
}
export function activate(){hooked=true;disposed=false;void boot();}
/** 0.8.2: turning the extension off also takes the Chư Thiên worldbook off every character card / the global list / the open
 *  chat (setting Tự động gỡ gắn kết khi tắt tiện ích, default on). SillyTavern awaits this hook for at most 5 s, then saves the settings —
 *  the record written here is what Cài đặt → Sách Thế Giới → Khôi phục gắn kết uses after re-enabling. */
async function autoUnbind(){
    const c=globalThis.SillyTavern?.getContext?.(), store=c?.extensionSettings?.[ID];
    if(!c||(store&&store.wbUnbindOnDisable===false))return null;
    try{
        const rec=await Promise.race([unbindAll(c,WORLD_NAME,{chat:true}),new Promise(r=>setTimeout(()=>r(null),4500))]);
        if(rec&&rec.count){c.extensionSettings[ID]={...(c.extensionSettings[ID]||{}),wbUnbound:{...rec,auto:true,noticed:false}};c.saveSettingsDebounced?.();console.info(`[Chư Thiên] Đã gỡ gắn kết Sách Thế Giới: ${rec.count} nơi`);}
        return rec;
    }catch(e){console.warn('[Chư Thiên] Gỡ gắn kết Sách Thế Giới khi tắt thất bại',e);return null;}
}
export function deactivate(){const p=autoUnbind();disposed=true;abortStart++;pending?.dispose();app?.dispose();app?.adapter?.dispose();app=null;return p;}

// SillyTavern 1.16.x has no manifest hooks: it only injects this module. Start ourselves there, after APP_READY.
// 1.17+ calls activate() right after the script loads (before APP_READY), so this path stays idle on those hosts.
(function selfStart(tries=0){
    const c=globalThis.SillyTavern?.getContext?.();
    if(!c?.eventSource||!c.eventTypes?.APP_READY){if(tries<240)setTimeout(()=>selfStart(tries+1),250);return;}
    const ready=async()=>{
        c.eventSource.removeListener(c.eventTypes.APP_READY,ready);
        if(hooked||disposed)return;
        let version='';try{version=(await fetchHostVersion()).pkgVersion;}catch{}
        if(hooked||disposed)return;
        if(version&&!hooksSupported(version)){console.info('[Chư Thiên] Máy chủ không có hook vòng đời tiện ích (<1.17), tự động khởi động.');void boot();}
        else setTimeout(()=>{if(!hooked&&!disposed){console.info('[Chư Thiên] Chưa nhận được hook activate, tự động khởi động.');void boot();}},4000);
    };
    c.eventSource.on(c.eventTypes.APP_READY,ready);
})();
