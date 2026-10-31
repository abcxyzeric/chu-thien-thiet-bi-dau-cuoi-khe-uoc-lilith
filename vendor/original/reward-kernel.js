// Original award planner and original grant callback, extracted without rewriting rules.
import original from './runtime.js';
const C=original.ZhuTianMemoryCore;
const GRADES=new Set(['凡品','灵品','仙品','神品','禁忌']);
const own=(v,k)=>v!==null&&typeof v==='object'&&Object.hasOwn(v,k);
function matchesPromise(item,promised){
    const GRADE_TAGS={'凡品':['凡品','Phàm phẩm','Phàm Phẩm'],'灵品':['灵品','Linh phẩm','Linh Phẩm'],'仙品':['仙品','Tiên phẩm','Tiên Phẩm'],'神品':['神品','Thần phẩm','Thần Phẩm'],'禁忌':['禁忌','Cấm kỵ','Cấm Kỵ']};
    const normG=g=>{for(const [k,arr]of Object.entries(GRADE_TAGS))if(arr.includes(g))return k;return g;};
    const itemGrade=normG(item.品级);
    const promise=promised.replace(/\s+/g,''),name=item.名称.replace(/\s+/g,'');
    const i=promise.indexOf(name);
    if(i<0)return false;
    const after=promise.slice(i+name.length);
    const before=promise.slice(0,i);
    const allTags=Object.entries(GRADE_TAGS).flatMap(([k,arr])=>arr.map(t=>[k,t.replace(/\s+/g,'')]));
    const explicitBefore=allTags.find(([,g])=>[g,'【'+g+'】','〔'+g+'〕','（'+g+'）','('+g+')','['+g+']'].some(tag=>before.endsWith(tag)))?.[0];
    const afterMatch=allTags.flatMap(([k,g])=>['（'+g+'）','('+g+')','〔'+g+'〕','【'+g+'】','['+g+']'].map(tag=>[k,tag])).find(([,tag])=>after.startsWith(tag));
    const explicitAfter=afterMatch?.[0];
    if((explicitBefore&&explicitBefore!==itemGrade)||(explicitAfter&&explicitAfter!==itemGrade))return false;
    if(itemGrade!=='凡品'&&explicitBefore!==itemGrade&&explicitAfter!==itemGrade)return false;
    if(item.数量>1){
      let quantityPart=after;
      if(afterMatch){quantityPart=after.slice(afterMatch[1].length);}
      const qty=quantityPart.match(/^[×xX*](\d{1,3})(?!\d)/);
      if(Number(qty?.[1])!==item.数量)return false;
    }
    return true;
  }
function awardPlan(job,updates,ledger){
    const plan=[];
    for(const u of updates){
      const seen=new Set();
      if(!own(u,'入包奖励'))continue;
      const r=ledger.任务结算凭据?.[u.ID],task=ledger.任务库?.[u.ID];
      if(!r||r.点数!==u.结算点数||String(r.楼层)!==String(job.id)||task?.状态!=='已完成')
        throw Error('Chứng từ nhiệm vụ không khớp với tầng hiện tại; phần thưởng hiện vật chưa vào túi');
      const evidence=u.依据.replace(/\s+/g,''),body=job.body.replace(/\s+/g,'');
      if(!body.includes(evidence))throw Error('Căn cứ phần thưởng hiện vật không xuất hiện trong chính văn lượt này; chưa vào túi');
      // The task's *pre-settlement* record is in the original engine's rollback snapshot.
      // A model cannot promise a new item and self-approve it in the same reply.
      const previous=ledger.面板账本?.[String(job.id)]?.snap?.__vars?.['任务库.'+u.ID];
      const promised=typeof previous?.奖励==='string'?previous.奖励:'';
      if(!promised)throw Error('Trước khi kết toán nhiệm vụ chưa ghi nhận lời hứa phần thưởng hiện vật; chưa vào túi');
      if(previous.状态==='已完成'||previous.状态==='Đã hoàn thành')throw Error('Nhiệm vụ đã hoàn thành từ trước lượt này; không thể phát lại phần thưởng hiện vật');
      const items=u.入包奖励.map(x=>({名称:x.名称.trim(),品级:x.品级,数量:x.数量,分类:x.分类||'其他',效果:C.inert(C.text(x.效果||'',160))}));
      for(const item of items){
        if(!matchesPromise(item,promised))throw Error('Phần thưởng dự kiến của nhiệm vụ chưa quy định rõ phẩm cấp hoặc số lượng của “'+item.名称+'”; chưa vào túi');
        const key=item.名称+'\u0000'+item.品级;
        if(seen.has(key))throw Error('Tên và phẩm cấp của phần thưởng hiện vật trong cùng một lượt bị trùng lặp, vui lòng đối chiếu thủ công; chưa vào túi');
        seen.add(key);
      }
      plan.push({id:u.ID,points:u.结算点数,items,hash:C.hash(JSON.stringify(items))});
    }
    return plan;
  }
export {awardPlan};
export function grantRewards(vars,job,expectedHash,plan){
let granted=0;const added=new Set();const ticket=0;const current=()=>true;
const mutate=vars=>{
      if(!current(job,ticket))throw Error('Cuộc trò chuyện hoặc chính văn đã thay đổi; chưa vào túi');
      const s=vars.诸天系统;
      if(!s||s.面板账本?.[String(job.id)]?.h!==expectedHash)throw Error('Chứng từ thanh trạng thái gốc đã thay đổi; chưa vào túi');
      if(s.背包!==undefined&&!Array.isArray(s.背包))throw Error('Cấu trúc túi đồ bất thường; chưa ghi đè bản ghi hiện có');
      if(s.任务实物凭据!==undefined&&(!s.任务实物凭据||typeof s.任务实物凭据!=='object'||Array.isArray(s.任务实物凭据)))throw Error('Cấu trúc chứng từ hiện vật bất thường; chưa ghi đè bản ghi hiện có');
      const bag=s.背包||[],proof=s.任务实物凭据||{};
      for(const one of plan){
        const r=s.任务结算凭据?.[one.id],task=s.任务库?.[one.id];
        if(!r||r.点数!==one.points||String(r.楼层)!==String(job.id)||task?.状态!=='已完成')throw Error('Kết toán nhiệm vụ đã thay đổi; chưa vào túi');
        if(own(proof,one.id)&&proof[one.id].哈希!==one.hash)throw Error('Cùng một nhiệm vụ đã có chứng từ hiện vật khác, cần đối chiếu thủ công');
        // A paid item can have been consumed since its receipt was written.
        // The stable per-task receipt, not the current inventory quantity, prevents replay.
      }
      for(const one of plan){
        if(own(proof,one.id))continue;
        for(const item of one.items)bag.push({...item,来源:'任务奖励·'+one.id,价格:0});
        proof[one.id]={哈希:one.hash,楼层:job.id,物品数:one.items.reduce((n,x)=>n+x.数量,0)};
        added.add(one.id);granted+=proof[one.id].物品数;
      }
      s.背包=bag;s.任务实物凭据=proof;
      return vars;
    };
mutate(vars);return {granted,added:[...added]};
}
