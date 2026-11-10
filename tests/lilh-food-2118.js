const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const p=PLANNERS.lh,d=p._dbg,t=d.todayN(),ids=['b12','b13','s23','s24','s25'];
for(const [k,shared] of Object.entries({wholemealbread:'pn-wholemealbread',avocado:'pn-avocado',packetrice:'pn-packetrice'})){
 assert(p.cfg.skey(k)===shared&&shopItems().filter(i=>i.key===shared).length===1,k+' single shared stock row');
 for(const [r,x] of Object.entries(p.R))if(!x.need.includes(k))assert(p.cfg.flexRules.canAdd(r,k,x.need),k+' can be added to '+r);
}
for(const r of ids){
 const x=p.R[r];
 assert(d.review(r).ready&&d.diet(r,x.t==='bf'?'B':'L',{}).length===0,r+' passes household checks');
 p.openR(r,null,null);
 assert(document.querySelector('.prep-list').textContent.includes(x.need.includes('packetrice')?'Store only the batch base':'avocado'),r+' fresh serving checks');
 document.querySelector('#dlg').close();
}
assert(d.review('b13').fat.includes('avocado'),'avocado recorded as fat source');
go('lilh');finishPageMotion();p.openRecalc('all');
const apply=document.querySelector('[data-recok]');assert(apply,'reshuffle has suggestions');p.recClick(apply);
const proteins=['beef','chicken','salmon','eggs','chickpeas','lentils','pb'];
let pairs=0;
for(let n=t;n<t+28;n++){
 const fresh=sl=>!d.isRefDay('m',sl,n)&&d.runOf(sl,n).s===n&&p.R[d.valAt(sl,n)];
 if(!fresh('L')||!fresh('D'))continue;
 pairs++;
 const keys=sl=>d.review(d.valAt(sl,n),d.subsOf(d.valAt(sl,n),d.mainInfo(sl,n).ik),d.mainInfo(sl,n).ik).keys;
 const a=keys('L'),b=keys('D');
 assert(!proteins.some(k=>a.includes(k)&&b.includes(k)),'duplicate fresh protein on day '+n+': '+d.valAt('L',n)+' / '+d.valAt('D',n));
}
assert(pairs>0,'tested fresh lunch/dinner pairs');
// A chosen lunch with an added egg must count even though its recipe category is plant.
const n=t+2,l=d.runOf('L',n).b,dinner=d.runOf('D',n).b;
S.lh={['sw-L'+l.ostart]:{v:'s25'},['is-L'+l.ostart]:{r:'s25',m:{'+eggs':1}},['sw-D'+dinner.ostart]:{v:'s15',rp:1}};
p.openRecalc('plan');
const confirm=document.querySelector('[data-recok]');assert(confirm,'protected lunch conflict has a proposal');p.recClick(confirm);
assert(d.valAt('L',n)==='s25','chosen lunch kept');
const dr=d.valAt('D',n),ik=d.mainInfo('D',n).ik;
assert(p.R[dr]&&!d.review(dr,d.subsOf(dr,ik),ik).keys.includes('eggs'),'added egg also excludes an egg dinner');
return {newRecipes:ids.length,sharedStock:true,freshPairs:pairs,editedProteinChecked:true};
