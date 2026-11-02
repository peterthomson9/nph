const assert=(v,m)=>{if(!v)throw Error(m)},p=PLANNERS.lh,d=p._dbg,t=d.todayN();
S.items['pn-milk']={lhProduct:'other'};S.items['pn-yoghurt']={lhProduct:'unknown'};
const before=JSON.stringify(S);
for(const r of Object.keys(d.R)){
 const v=d.review(r,d.subsOf(r,null));
 assert(!v.issues.some(i=>/^(Milk |Yoghurt (type|differs))/.test(i.t)),r+' no product uncertainty');
 if(v.keys.includes('milk'))assert(v.fat.includes('whole milk'),r+' milk source');
 if(v.keys.includes('yoghurt'))assert(v.fat.includes('full-fat plain yoghurt'),r+' yoghurt source');
}
assert(before===JSON.stringify(S),'review preserves saved records');
S.lh['x-L'+t]={v:'s1'};S.lh['x-L'+(t+1)]={v:'s1'};
const lot=p.newLot('L',t,'s1');lot.facts.products={milk:'unknown',yoghurt:'other'};S.food.dairy=lot;
let v=d.review('s1',d.subsOf('s1','@lot:dairy'),'@lot:dairy');assert(v.fat.includes('whole milk'),'stored batch uses confirmed household dairy');
const old={...lot};delete old.facts;S.food.old=old;v=d.review('s1',d.subsOf('s1','@lot:old'),'@lot:old');
assert(v.fat.includes('whole milk')&&v.issues.some(i=>i.t==='Earlier batch: finishing details were not recorded'),'legacy dairy known, finishing uncertainty retained');
assert(d.review('b1',{milk:'-'}).fat.every(f=>f!=='whole milk'),'None removes dairy contribution');
assert(d.diet('s11','L',{'+yoghurt':1}).some(i=>i.h&&/^Yoghurt with/.test(i.t)),'digestion warning retained');
go('lilh');p.openR('b2');assert(!document.querySelector('[data-lhproduct],[data-lhdairy]'),'confirmation controls removed');
assert(document.querySelector('.rhero').textContent.includes('Fat source: whole milk')&&document.querySelector('.rhero').textContent.includes('Fat source: full-fat plain yoghurt'),'confirmed dairy in nutrition pills');
assert(p._dbg.NAME.milk==='Whole milk'&&p._dbg.NAME.yoghurt==='Full-fat Greek yoghurt','stock defaults explicit');
return {recipes:40,fullFatDairyAutomatic:true,storedAndLegacyBatches:true,savedRecordsPreserved:true,removalAndDigestionChecksPreserved:true,productPromptsRemoved:true};
