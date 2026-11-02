const assert=(v,m)=>{if(!v)throw Error(m)};
for(const [id,p] of Object.entries(PLANNERS)){
 go(id==='pn'?'np':'lilh');p.openRecalc('all');
 const ok=document.querySelector('[data-recok]');assert(ok,'reshuffle proposal exists');
 p.recClick(ok);await new Promise(r=>setTimeout(r,250));
 assert(!Object.hasOwn(S[id],'undefined'),'all proposal kinds write a valid key');
 for(const lot of Object.values(S.food))assert(lot.stacks.every(s=>s.p>=0),'no negative portions after reshuffle');
}
return {appliedToBothPlanners:true,validKeys:true,nonnegativePortions:true};
