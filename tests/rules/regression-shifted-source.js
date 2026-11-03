// Minimal synthetic reproduction of the v2.112 phone report. No household backup data.
const assert=(ok,message)=>{if(!ok)throw Error(message)},pause=()=>new Promise(r=>setTimeout(r,100));
const P=PLANNERS.lh,d=P._dbg,t=d.todayN(),root=document.querySelector('#page-lilh');
assert(t===29,'Run with CLOCK=2026-11-03T20:15:00');
go('lilh');finishPageMotion();S.lh={};S.food={};S.stock={};SHV++;SHNEED.lh=null;
// Monday stored meals shifted the two original batch positions one day later.
for(const sl of ['L','D'])S.lh['sh-'+sl+(t-1)]={v:1};
S.lh['sw-L'+(t-1)]={v:'s20'};S.lh['sw-D'+(t-1)]={v:'m3'};
S.lh['is-D'+(t-1)]={r:'m3',m:{sweetpotato:'potato'}};
S.lh['o-'+t]={v:'BDL'}; // Actual lunch is the dinner track on this date.
const beef=lotIdOf('lh','D',t,'m3'),egg=lotIdOf('lh','L',t,'s20');
S.food[beef]=P.newLot('D',t,'m3');S.food[egg]=P.newLot('L',t,'s20');
for(const [sl,r,f] of [['L','m3',beef],['D','s20',egg]]){
 S.lh['x-'+sl+(t+1)]={v:r};S.lh['fz-m'+sl+(t+1)]={f,p:1,w:'fridge'};
}
S.lh['sw-L'+(t+1)]={v:'s13'};S.lh['sw-D'+(t+1)]={v:'s8',rp:1};
P.showDay(t+2,true);renderAll();
const foodBefore=JSON.stringify(S.food),stateBefore=JSON.stringify(S.lh);
const title=(sl,n)=>root.querySelector(`.meal[data-at="${sl}:${n}"] b`).textContent;
const clickSwap=(sl,n)=>root.querySelector(`[data-pk="${d.mainInfo(sl,n).pk}"]`).click();
assert(d.mainInfo('L',t+2).ik==='L'+(t+1),'shifted batch origin collides with tomorrow date');
for(const n of [t+2,t+3]){
 assert(d.valAt('L',n)==='s13'&&title('L',n)===d.R.s13.n,'chickpea choice and card agree after shifted storage');
 assert(d.valAt('D',n)==='s8'&&title('D',n)===d.R.s8.n,'salmon choice and card agree after shifted storage');
}
assert(title('D',t)==='Mild beef goulash & potato'&&title('L',t+1)==='Mild beef goulash & potato','cook day and actual stored leftovers retain potato swap');
assert(title('D',t+1)===d.R.s20.n,'tomorrow actual egg leftovers retained');
assert(d.review('s13',{},'L'+(t+1)).fat.includes('whole milk'),'future nutrition comes from chickpea ingredients, not beef source');
root.querySelector(`.meal[data-at="L:${t+2}"]`).click();await pause();
assert(document.querySelector('#card h2').textContent===d.R.s13.n,'future recipe window matches current choice');
assert(document.querySelector('#card .needs').textContent.toLowerCase().includes('chickpea'),'future recipe has chickpeas');
document.querySelector('#dlg').close();
assert(JSON.stringify(S.food)===foodBefore&&JSON.stringify(S.lh)===stateBefore,'source resolution is read only');

// The real picker, not a direct override, must update both the fresh batch and its leftover.
clickSwap('L',t+2);await pause();
assert(document.querySelector('#card [data-pick="s13"]').classList.contains('cur'),'picker current agrees with card');
document.querySelector('#card [data-pick="s12"]').click();await pause();renderAll();
for(const n of [t+2,t+3])assert(d.valAt('L',n)==='s12'&&title('L',n)===d.R.s12.n,'manual swap updates both dates');
clickSwap('L',t+2);document.querySelector('#card [data-pick="s13"]').click();await pause();renderAll();
assert(title('L',t+2)===d.R.s13.n,'swapping back is reflected on card');

// Re-plan preview/cancel must not rewrite actual batches or tomorrow's reservations.
const beforePreview=JSON.stringify(S),tomorrow=JSON.stringify([S.lh['fz-mL'+(t+1)],S.lh['fz-mD'+(t+1)]]);
P.openRecalc('plan');assert(JSON.stringify(S)===beforePreview,'reshuffle preview is read only');
const ok=document.querySelector('[data-recok]');assert(ok,'reshuffle has choices');P.recClick(ok);await pause();renderAll();
assert(JSON.stringify(S.food)===foodBefore,'reshuffle does not rewrite actual food');
assert(JSON.stringify([S.lh['fz-mL'+(t+1)],S.lh['fz-mD'+(t+1)]])===tomorrow,'valid tomorrow leftovers stay reserved');
for(let n=t+2;n<=t+4;n++)for(const sl of ['L','D'])assert(title(sl,n)===d.R[d.valAt(sl,n)].n,'post-reshuffle title agrees with recipe ID');

// Same-recipe collisions must not borrow the earlier batch's custom ingredients either.
S.lh['sw-L'+(t+1)]={v:'m3'};P.render();
assert(title('L',t+2)===d.R.m3.n,'a separate fresh beef batch keeps its own sweet potato');
assert(title('L',t+1)==='Mild beef goulash & potato','actual beef leftovers keep recorded potato');
assert(JSON.stringify(S.food)===foodBefore,'same-recipe display does not mutate recorded food');
await NPH_STORE.flush();
return {shiftedBatchDateCollision:true,pickerCardRecipeAgreement:true,nutritionSource:true,manualSwap:true,reshufflePreservesTomorrow:true,sameRecipeDifferentBatch:true,foodUnchanged:true};
