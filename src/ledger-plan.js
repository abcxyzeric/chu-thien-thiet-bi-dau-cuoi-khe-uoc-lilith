import { bagAdd, normGradeKey } from './ledger-ops.js';
import { canAcquireForbidden } from './commerce-plan.js';
import { preserveNative } from './native-owned.js';
import { syncBonds } from './bonds-data.js';
import original from '../vendor/original/runtime.js';
import {createLedgerKernel} from '../vendor/original/ledger-kernel.js';
import {awardPlan,grantRewards} from '../vendor/original/reward-kernel.js';
export const clone=x=>structuredClone(x);
export const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export async function digest(x){const bytes=new TextEncoder().encode(stable(x));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');}
export const history=chat=>chat.filter(m=>!(m.is_system&&m.extra?.zhutianCovenantTerminal?.kind==='ledger-receipt')).map(m=>({name:m.name,is_user:!!m.is_user,is_system:!!m.is_system,swipe_id:m.swipe_id,mes:m.mes}));
export async function assertHistory(chat,receipts){const h=history(chat);for(const r of Object.values(receipts||{})){if(!Number.isSafeInteger(r.historyLength)||r.historyLength>h.length||await digest(h.slice(0,r.historyLength))!==r.historyHash)throw Error('Nhánh chính văn không khớp với chứng từ đã kết toán. Đã đóng băng giao dịch; không tự động hoàn tác, trừ phí lặp lại hay phát thưởng lần nữa, vui lòng kiểm tra thủ công trên bản sao lưu.');}}
function validLedger(vars){const s=vars?.诸天系统;if(!s||Array.isArray(s)||!Number.isSafeInteger(s.系统点)||s.系统点<0)throw Error('Cần có sổ cái nguyên bản hợp lệ và Điểm Hệ Thống là số nguyên không âm; không tạo số dư giả lập.');return s;}
export async function planOperation(vars,chat,kind,index){
 const before=clone(vars),next=clone(vars),s=validLedger(next);
 let info={id:chat.length-1,latest:true},title='',detail='',sourceMessage=null,given=0;
 const k=createLedgerKernel(info,fn=>{fn(next);k.ztDerive(next);return Promise.resolve(next);});
 if(kind==='panel'){
  const source=chat.map((m,i)=>({m,i})).filter(x=>!x.m.is_system).at(-1);
  if(!source||source.m.is_user)throw Error('Chỉ xử lý tin nhắn nhân vật mô hình cuối cùng đã lưu hiện tại; tin nhắn người dùng không thể làm nguồn kết toán.');
  const raw=source.m.mes;const parsed=original.ZhuTianLedgerAgent.parse(raw);if(!parsed)throw Error('Phản hồi này không có khối dữ liệu ZhuTianPanel duy nhất.');
  info.id=source.i;sourceMessage=source.i;
  const fields=k.ztParsePanel(parsed.block),batch=k.ztTaskBatch(fields);if(batch.error)throw Error(batch.error);
  delete s.任务同步提示;
  await k.ztApplyPanel(null,fields,parsed.block);
  if(s.任务同步提示)throw Error(s.任务同步提示);
  // All rewards are planned on a clone. A missing promise/evidence rolls back the entire plan,
  // including points. Nothing from this function touches the host.
  const job={id:source.i,body:original.ZhuTianMemoryCore.clean(raw)};
  const rewards=awardPlan(job,parsed.updates,s);
  given=grantRewards(next,job,k.ztHash(parsed.block),rewards).granted;
  title='Đồng bộ kết toán cốt truyện nguyên bản';detail=`Tin nhắn nguồn #${source.i}; cập nhật nhiệm vụ ${batch.items.length} mục; vật phẩm thưởng vào túi lần này ${given} món.`;
 }else if(kind==='buy'){
  const item=s.商城库存?.[index];if(!item||item.已购)throw Error('Hàng hóa đã bán hết hoặc tồn kho đã thay đổi.');
  if(!Number.isSafeInteger(Number(item.价格))||Number(item.价格)<0)throw Error('Giá hàng hóa không hợp lệ.');
  const forbidden=normGradeKey(item.品阶)==='禁忌';
  if(forbidden){if(item.特殊代价?.resource!=='因果筹码'||item.特殊代价?.amount!==1)throw Error('Hàng hóa Cấm kỵ thiếu cái giá nhận được có thể kiểm nghiệm, vui lòng nhập hàng lại.');if(!canAcquireForbidden(s))throw Error('Chưa đủ điều kiện nhận hàng hóa Cấm kỵ.');}
  const discount=forbidden?0:k.ztDiscount(s),price=Math.ceil(Number(item.价格)*(100-discount)/100);
  if(s.系统点<price)throw Error('Điểm Hệ Thống không đủ, chưa mua.');
  // Same original buy handler rules: reputation discount, ceil, one unit, stable sold flag.
  if(forbidden){s.专属资源.因果筹码--;for(const p of Object.values(s.面板账本||{}))if(p?.snap?.专属资源)p.snap.专属资源.因果筹码=Math.max(0,(Number(p.snap.专属资源.因果筹码)||0)-1);}
  s.系统点-=price;s.累计消费=(k.toNum(s.累计消费)||0)+price;s.界面记账时间=Date.now();
  bagAdd(s,{名称:item.名称,品级:normGradeKey(item.品阶)||'凡品',来源:'Thương thành',价格:price,分类:item.分类||'其他',效果:item.效果||''},1);item.已购=true;
  title='Vạn Giới Thương Thành · Mua hàng';detail=`${item.名称} ×1; giá gốc ${item.价格}; giảm giá Danh Vọng ${discount}%; thực trả ${price} Điểm Hệ Thống${forbidden?', trả thêm 1 Nhân Quả Trù Mã một lần duy nhất, sau khi nhận không có giới hạn sử dụng':''}.`;
 }else if(['use','recycle'].includes(kind)){
  const item=s.背包?.[index];if(!item)throw Error('Mục trong túi đồ đã thay đổi.');
  const quantity=Number(item.数量??1);if(!Number.isSafeInteger(quantity)||quantity<1)throw Error('Số lượng vật phẩm không hợp lệ.');
  const consumed=kind==='recycle'||/消耗|tiêu hao|đan dược/i.test(String(item.分类||'其他'));
  const value=kind==='recycle'?k.recycleValue(item):0;
  if(consumed){if(quantity===1)s.背包.splice(index,1);else item.数量=quantity-1;}
  if(value){s.系统点+=value;s.界面记账时间=Date.now();}
  title=kind==='recycle'?'Hành Nang Thứ Nguyên · Thu hồi':'Hành Nang Thứ Nguyên · Sử dụng';
  detail=kind==='recycle'?`${item.名称} ×1; hoàn trả ${value} Điểm Hệ Thống theo định giá thu hồi nguyên bản.`:`${item.名称}; ${consumed?'đã tiêu hao 1 cái':'vật phẩm không tiêu hao, giữ nguyên vật phẩm'}. Mô tả hiệu quả chỉ dùng làm tham khảo cốt truyện: ${item.效果||'chưa ghi nhận'}.`;
 }else throw Error('Loại giao dịch không xác định.');
 if(kind==='panel') { preserveNative(s,before.诸天系统); syncBonds(s,before.诸天系统); }
 k.ztDerive(next);
 if(Array.isArray(s.背包)&&s.背包.some(item=>!Number.isSafeInteger(Number(item.数量??1))||Number(item.数量??1)<1))throw Error('Số lượng túi đồ vượt quá phạm vi an toàn; chưa ghi dữ liệu.');
 if(!Number.isSafeInteger(s.系统点)||s.系统点<0||!Number.isSafeInteger(Number(s.累计消费??0)))throw Error('Giá trị số vượt quá phạm vi an toàn.');
 return {variables:next,title,detail,delta:s.系统点-validLedger(before).系统点,balance:s.系统点,given,sourceMessage,changed:stable(before)!==stable(next)};
}
