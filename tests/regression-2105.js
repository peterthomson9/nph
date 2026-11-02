// Disposable data only. A one-day recipe never becomes an implicit leftover run.
const assert=(ok,message)=>{if(!ok)throw Error(message)},wait=()=>new Promise(r=>setTimeout(r,100));
const p=PLANNERS.pn,d=p._dbg,t=d.todayN(),root=document.querySelector('#page-np');
const reset=()=>{S.pn={};S.food={};SHV++;SHNEED.pn=null;for(const ingredient of PN_ING)S.stock['pn-'+ingredient[0]]={out:false}};
const set=(slot,n,r)=>S.pn['x-'+slot+n]={v:r};
go('np');reset();
set('L',t-2,'__skip');set('L',t-1,'avoeggs');set('L',t,'__skip');set('L',t+1,'__skip');
const yesterday=JSON.stringify(S.pn['x-L'+(t-1)]);
p.showDay(t,true);
const swap=root.querySelector(`[data-pk="day:L:${t}"],[data-pk="main:L:${t}"]`);
assert(swap,'today lunch swap is available');swap.click();await wait();
const fresh=document.querySelector('#card [data-pick="avoeggs"]');assert(fresh&&!fresh.disabled,'regular fresh avo and eggs option is selectable');fresh.click();await wait();
const actual=d.mainInfo('L',t);
assert(actual.r==='avoeggs'&&/cook/.test(actual.cls)&&!/left|stored/.test(actual.cls),`fresh choice should cook today, got ${JSON.stringify(actual)}`);
assert(p.madeOf('L',t,'avoeggs')===2,'fresh avo and eggs makes two portions');
assert(d.runOf('L',t).s===t&&d.runOf('L',t-1).t===t-1,'yesterday and today are separate cookings');
assert(!p.newLot('L',t-1,'avoeggs')&&!p.newLot('L',t,'avoeggs'),'two portions eaten by two people create no leftover lot');
assert(!S.pn['fz-mL'+t]&&JSON.stringify(S.pn['x-L'+(t-1)])===yesterday,'no stored link is invented and yesterday record is untouched');
assert(root.querySelector(`.day[data-n="${t}"] .meal[data-at="L:${t}"]`)?.textContent.includes('2 portions'),'actual meal card shows two fresh portions');

// Every authored one-day shared recipe is independent on adjacent days, in both tracks.
const checked=[];
for(const [r,recipe] of Object.entries(d.R).filter(([,r])=>r.max===1&&!r.ta))for(const slot of ['L','D']){
 reset();for(const n of [t-1,t,t+1])set(slot,n,r);set(slot,t-2,'__skip');set(slot,t+2,'__skip');
 for(const n of [t-1,t,t+1]){
  const info=d.mainInfo(slot,n),run=d.runOf(slot,n);
  assert(run.s===n&&run.t===n&&/cook/.test(info.cls)&&!/left/.test(info.cls),`${r} ${slot} ${n} must be freshly cooked`);
  assert(p.madeOf(slot,n,r)===2&&!p.newLot(slot,n,r),`${r}: no uneaten portion is created`);
 }
 checked.push(slot+':'+r);
}

// Genuine multi-day batches still retain their own leftover days.
reset();for(const n of [t,t+1,t+2])set('D',n,'beefstew');set('D',t-1,'__skip');set('D',t+3,'__skip');
const source=d.runOf('D',t+1).s;
assert(source<t+1&&/left/.test(d.mainInfo('D',t+1).cls),'normal batch leftovers remain linked, including skipped-day gaps');
assert(p.madeOf('D',source,'beefstew')===6&&p.newLot('D',source,'beefstew').stacks[0].p===4,'normal six-portion batch keeps four uneaten portions');

// Explicit storage choices remain explicit, including their existing warnings.
reset();set('L',t-1,'avoeggs');set('L',t,'avoeggs');
S.food['named-avo']={who:'pn',r:'avoeggs',made:d.absOf(t-1),mk:4,out:0,src:null,stacks:[{w:'fridge',p:2,since:d.absOf(t-1),th:false}]};
S.pn['fz-mL'+t]={f:'named-avo',p:2,w:'fridge'};
const foodBefore=JSON.stringify(S.food),refBefore=JSON.stringify(S.pn['fz-mL'+t]);
assert(/stored/.test(d.mainInfo('L',t).cls),'an explicit named storage selection is still shown as stored');
assert(JSON.stringify(S.food)===foodBefore&&JSON.stringify(S.pn['fz-mL'+t])===refBefore,'classification does not rewrite stock or explicit references');

// Breakfasts already behave independently and must remain so.
reset();S.pn['b-'+(t-1)]={v:'avoeggs'};S.pn['b-'+t]={v:'avoeggs'};
assert(d.bfAt(t-1)==='avoeggs'&&d.bfAt(t)==='avoeggs'&&!S.pn['fz-mB'+t],'repeated breakfasts remain fresh without automatic storage assignments');
// Leave the real reported view on screen for phone-layout verification.
reset();set('L',t-2,'__skip');set('L',t-1,'avoeggs');set('L',t,'avoeggs');set('L',t+1,'__skip');p.showDay(t,true);p.render();
await NPH_STORE.flush();
return {version:NPH_V,freshPicker:true,oneDayTrackCases:checked.length,noPhantomPortions:true,normalBatchLeftovers:true,explicitStoragePreserved:true,pastRecordPreserved:true};
