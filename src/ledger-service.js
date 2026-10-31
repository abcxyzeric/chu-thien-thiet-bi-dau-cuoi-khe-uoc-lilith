import {assertSaveEnvironment} from './save-environment.js';
import {STORAGE,LEDGER_SCHEMA,identity,inert} from './contracts.js';
import {clone,stable,digest,history,assertHistory,planOperation} from './ledger-plan.js';
export class LedgerService {
 #drafts=new Map();
 constructor(adapter){this.adapter=adapter;this.uncertain=new Set();}
 get receipts(){return this.adapter.settings().ledgerReceipts||{};}
 legacyActive(){
  if(document.querySelector('#zt-memory-assistant-v1:not([data-zt-native])'))return true; // our native Lilith is tagged, a real old TH helper is not
  for(const frame of document.querySelectorAll('iframe[id^="TH-message--"]'))try{if(typeof frame.contentWindow?.ztApplyPanel==='function')return true;}catch{return true;}
  return false;
 }
 ready(){const a=this.adapter;const schema=Number(a.context()?.chatMetadata?.[STORAGE]?.ledgerSchema)||0;if(schema>LEDGER_SCHEMA)throw Error('Phiên bản cấu trúc sổ cái đến từ bản cập nhật mới hơn, cấm ghi dữ liệu.');if(a.dead||a.busy||a.isGenerating())throw Error('Tiện ích đã tắt hoặc đang có thao tác khác diễn ra.');if(!a.currentIdentity())throw Error('Chỉ hỗ trợ cuộc trò chuyện đơn nhân vật.');if(!a.settings().nativeLedgerEnabled)throw Error('Vui lòng sao lưu trò chuyện, tắt bộ máy cũ và bật rõ ràng kết toán nguyên bản trước.');if(this.legacyActive())throw Error('Phát hiện thanh trạng thái cũ hoặc trợ lý cũ, từ chối để hai bộ máy cùng ghi vào sổ cái.');assertSaveEnvironment({requireLocks:true});if(this.uncertain.has(a.currentIdentity()))throw Error('Trạng thái ghi trước đó không rõ, đã đóng băng giao dịch trong phiên này. Vui lòng tải lại trang và kiểm tra bản ghi máy chủ trước, không thử trừ điểm lại.');}
 state(){const c=this.adapter.context();return stable([identity(c),c.chat,c.chatMetadata]);}
 async request(endpoint,target,extra={}){const r=await fetch('/api/chats/'+endpoint,{method:'POST',headers:this.adapter.context().getRequestHeaders(),credentials:'same-origin',cache:'no-store',body:JSON.stringify({...target,...extra}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(`Giao diện lưu trữ máy chủ ${endpoint} trả về ${r.status}`);return r.json();}
 async prepare(kind,index){
  this.ready();const a=this.adapter,c=a.context(),chat=clone(c.chat),metadata=clone(c.chatMetadata),stamp=this.state(),epoch=a.generationEpoch;
  const id=crypto.randomUUID(),target={avatar_url:c.characters[c.characterId].avatar,file_name:c.getCurrentChatId()};
  await assertHistory(chat,this.receipts);
  if(kind==='panel'&&a.statusbarActive?.())throw Error('Thanh trạng thái nguyên bản đang chạy và là bộ máy kết toán cốt truyện duy nhất (giống bản gốc); thiết bị đầu cuối không hạch toán lặp lại cùng một chính văn.');
  if(kind==='panel'){
   const last=chat.map((m,i)=>({m,i})).filter(x=>!x.m.is_system).at(-1)?.i;
   const logicalHistory=history(chat),logicalHash=await digest(logicalHistory);
   if(Object.values(this.receipts).some(r=>r.kind==='panel'&&(r.sourceMessage===last||(r.historyLength===logicalHistory.length&&r.historyHash===logicalHash))))throw Error('Chính văn này đã được hạch toán, chứng từ nguyên bản chặn kết toán lặp lại; đạo cụ đã tiêu hao sau đó cũng không cấp bù.');
  }
  const plan=await planOperation(metadata.variables,chat,kind,Number(index));
  if(!plan.changed&&kind!=='use')throw Error('Sổ cái không có thay đổi mới nào có thể lưu.');
  const h=history(chat),proof={id,kind,title:plan.title,detail:plan.detail,delta:plan.delta,balance:plan.balance,sourceMessage:plan.sourceMessage,historyLength:h.length,historyHash:await digest(h),variablesHash:await digest(plan.variables),at:Date.now(),schema:1};
  this.ready();if(this.state()!==stamp||a.generationEpoch!==epoch)throw Error('Chính văn hoặc sổ cái đã thay đổi, vui lòng xem trước lại.');
  this.#drafts.clear();this.#drafts.set(id,{id,target,identity:identity(c),stamp,epoch,chat,metadata,plan,proof});
  return Object.freeze({id,...clone(proof)});
 }
 async commit(id){
  this.ready();const d=this.#drafts.get(id);if(!d)throw Error('Bản xem trước đã hết hạn hoặc đã được lưu, không thực thi lặp lại.');
  const a=this.adapter;const guard=()=>{if(this.uncertain.has(d.identity)||Number(a.context()?.chatMetadata?.[STORAGE]?.ledgerSchema)>LEDGER_SCHEMA||a.dead||a.isGenerating()||a.currentIdentity()!==d.identity||a.generationEpoch!==d.epoch||this.state()!==d.stamp||this.legacyActive())throw Error('Trò chuyện, sổ cái hoặc quyền kết toán đã thay đổi, vui lòng xem trước lại.');};
  a.busy=true;a.notify();
  try{return await navigator.locks.request('zhutian-ledger:'+d.identity,{ifAvailable:true},async lock=>{
   if(!lock)throw Error('Thẻ trình duyệt khác đang xử lý cuộc trò chuyện này, vui lòng xem trước lại sau.');
   guard();const disk=await this.request('get',d.target);guard();
   if(!Array.isArray(disk)||!disk[0]?.chat_metadata||stable(disk.slice(1))!==stable(d.chat)||stable(disk[0].chat_metadata)!==stable(d.metadata))throw Error('Bản lưu trên máy chủ không khớp với bản xem trước. Vui lòng đợi SillyTavern lưu xong hoặc tải lại trang rồi xem trước lại; chưa ghi dữ liệu.');
   const metadata=clone(d.metadata);metadata.variables=clone(d.plan.variables);metadata[STORAGE]={...metadata[STORAGE],ledgerSchema:LEDGER_SCHEMA,ledgerReceipts:{...(metadata[STORAGE]?.ledgerReceipts||{}),[id]:clone(d.proof)}};
   const text=inert(`【Hệ Thống Chư Thiên · Đã Thực Thi Kết Toán】\n${d.plan.title}\n${d.plan.detail}\nBiến động Điểm Hệ Thống: ${d.plan.delta>=0?'+':''}${d.plan.delta}; Số dư: ${d.plan.balance}\nChứng từ: ${id}\nĐây là bản ghi hệ thống, không phải phản hồi của nhân vật hay mô hình. Sổ cái đã thực thi, vui lòng không trừ phí hoặc phát thưởng lặp lại.`).replaceAll('[','［').replaceAll(']','］').replaceAll('`','｀');
   const message={name:'Hệ Thống Chư Thiên',is_user:false,is_system:true,send_date:new Date().toISOString(),mes:text,extra:{isSmallSys:true,[STORAGE]:{kind:'ledger-receipt',id,version:1}}};
   const next=[{...clone(disk[0]),chat_metadata:metadata},...clone(d.chat),message];
   // Consume approval before issuing a possibly-ambiguous write. No retry and no compensating rollback.
   guard();this.#drafts.delete(id);this.uncertain.add(d.identity);
   const saved=await this.request('save',d.target,{chat:next,force:false});if(!saved.ok)throw Error('Máy chủ chưa xác nhận ghi dữ liệu.');
   let verify=await this.request('get',d.target);
   // 1.1.4: one more read after a short pause (an older SillyTavern save of this chat may still have been in flight); never re-written here
   if(!Array.isArray(verify)||stable(verify)!==stable(next)){await new Promise(r=>setTimeout(r,800));verify=await this.request('get',d.target);}
   if(!Array.isArray(verify)||stable(verify)!==stable(next))throw Error('Đọc lại bản lưu không khớp, đã đóng băng giao dịch; vui lòng vào Cài đặt → Chẩn đoán & Bảo trì → 「Kiểm tra và mở khóa sổ cái」 để đối chiếu; không tự động thử lại.');
   this.uncertain.delete(d.identity);
   // The target is captured, never inferred again after await. Do not copy into another chat.
   if(a.currentIdentity()===d.identity&&this.state()===d.stamp&&!a.dead){
    const c=a.context();c.chatMetadata.variables=clone(metadata.variables);c.chatMetadata[STORAGE]=clone(metadata[STORAGE]);c.chat.push(message);await c.addOneMessage(message);a.notify();
   }else throw Error('Cuộc trò chuyện gốc đã được lưu và xác thực, nhưng ngữ cảnh hiện tại đã thay đổi. Vui lòng tải lại cuộc trò chuyện gốc để xem bản ghi; không gửi lại lần nữa.');
   return clone(d.proof);
  });}catch(error){if(this.uncertain.has(d.identity))throw Error('Trạng thái ghi chưa được xác thực, đã đóng băng giao dịch. Vui lòng không tiếp tục thao tác trên cuộc trò chuyện này, hãy tải lại trang để đối chiếu bản ghi máy chủ trước; không tự động thử lại. '+error.message);throw error;}finally{a.busy=false;a.notify();}
 }
 cancelPreview(){this.#drafts.clear();}
 dispose(){this.#drafts.clear();}
}
