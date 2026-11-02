const p=PLANNERS.lh,d=p._dbg,R=d.R,t=d.todayN(),n=t+1,assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100)),close=async()=>{document.querySelector('#dlg').close();await wait()};
go('lilh');document.querySelector('#page-lilh').click();
let audit=d.catalogAudit();assert(!audit.issues.length,JSON.stringify(audit.issues));
// Missing older-batch history belongs only to its recipe window.
S.lh['x-L'+t]={v:'s1'};S.lh['x-L'+n]={v:'s1'};const lot=p.newLot('L',t,'s1');delete lot.facts;S.food.earlier=lot;S.lh['fz-mL'+n]={f:'earlier',w:'fridge',p:1};
const saved=JSON.stringify(S.food.earlier),ik='xL'+n;
assert(d.review('s1',d.subsOf('s1',ik),ik).issues.some(i=>i.recipeOnly&&/^Earlier batch/.test(i.t)),'recipe-only notice retained');
assert(!d.diet('s1','L',d.subsOf('s1',ik),ik).some(i=>/^Earlier batch/.test(i.t)),'notice excluded from plan checks');
assert(!d.mainInfo('L',n).warns.length&&!d.mainInfo('L',n).warn,'legacy meal has no amber warning');p.render();
let day=document.querySelector('#page-lilh .day[data-n="'+n+'"]');assert(!day.querySelector('[data-dwarn]'),'legacy notice adds no day warning count');
assert(!day.textContent.includes('Earlier batch'),'legacy notice absent on card');
p.openR('s1',ik,'leftovers',false,false,'L:'+n,'Earlier batch');assert(document.querySelector('.recipe-alerts').textContent.includes('Earlier batch: finishing details were not recorded'),'notice visible in recipe');await close();
assert(JSON.stringify(S.food.earlier)===saved,'batch record unchanged');
// An intentional omission still warns on the meal card.
S.lh['x-D'+n]={v:'s19'};S.lh['is-xD'+n]={r:'s19',m:{oil:'-'}};assert(d.mainInfo('D',n).warns.some(w=>/^Olive oil was left out/.test(w)),'real ingredient warning retained');
// Future strong contributors use their classification for day rules without a second hard-coded list.
const carrotGroups=p.cfg.nut.groups.carrot,carrotGas=LH_GAS.carrot;
try{p.cfg.nut.groups.carrot=[...carrotGroups,'gas'];LH_GAS.carrot={tier:'strong',note:'Test classification',source:'niddk'};
 assert(d.dayGasWhy('m3',{},'L',n,null).includes('Same day as'),'new strong classification participates in day combinations');
}finally{p.cfg.nut.groups.carrot=carrotGroups;LH_GAS.carrot=carrotGas}
// Missing metadata and incompatible substitution roles must not become automatically usable.
const mutations=[
 ['nutrition groups',()=>{const old=p.cfg.nut.groups.carrot;delete p.cfg.nut.groups.carrot;return ()=>p.cfg.nut.groups.carrot=old},'m3'],
 ['preparation',()=>{const old=LH_PREP.carrot;delete LH_PREP.carrot;return ()=>LH_PREP.carrot=old},'m3'],
 ['digestion',()=>{const old=LH_GAS.carrot;delete LH_GAS.carrot;return ()=>LH_GAS.carrot=old},'m3'],
 ['category agreement',()=>{const old=LH_GAS.carrot;LH_GAS.carrot={tier:'strong',note:'test',source:'niddk'};return ()=>LH_GAS.carrot=old},'m3'],
 ['role family',()=>{p.cfg.FAM.orzo.push('weetabix');return ()=>p.cfg.FAM.orzo.pop()},'s17'],
 ['temporary role family',()=>{const old=p.cfg.tempSubs.orzo;p.cfg.tempSubs.orzo=['pouchfruit'];return ()=>{if(old)p.cfg.tempSubs.orzo=old;else delete p.cfg.tempSubs.orzo}},'s17'],
 ['stock mapping',()=>{const old=LH_SHARE.carrot;LH_SHARE.carrot='pn-unknown';return ()=>LH_SHARE.carrot=old},'m3'],
 ['fat source',()=>{const old=LH_FAT.beef;delete LH_FAT.beef;return ()=>LH_FAT.beef=old},'m3'],
 ['recipe sign-off',()=>{const old=R.m3.rulesReviewed;R.m3.rulesReviewed=false;return ()=>R.m3.rulesReviewed=old},'m3'],
 ['portion basis',()=>{const old=R.m3.basis;R.m3.basis=3;return ()=>R.m3.basis=old},'m3'],
 ['ingredient amount',()=>{const old=R.m3.ing;R.m3.ing=R.m3.ing.filter(t=>!/carrot/.test(t));return ()=>R.m3.ing=old},'m3'],
 ['water method',()=>{const old=R.m2.s;R.m2.s=old.map(t=>t.replace('100ml water','water'));return ()=>R.m2.s=old},'m2'],
 ['measured finish',()=>{const old=R.m3.ing;R.m3.ing=old.filter(t=>!/for finishing/.test(t));return ()=>R.m3.ing=old},'m3'],
 ['addition quantity',()=>{const old=p.cfg.addHint;p.cfg.addHint=(k,...args)=>k==='carrot'?['A little carrot','Cook until soft']:old(k,...args);return ()=>p.cfg.addHint=old},'m3']
];
for(const [label,change,r] of mutations){const restore=change();try{assert(!d.autoReady(r),label+' gates automation');assert(d.catalogAudit().issues.length,label+' fails release audit')}finally{restore()}}
// A copied new recipe cannot inherit approval from its source.
R['review-test']={...JSON.parse(JSON.stringify(R.m3)),n:'Review test'};
assert(d.recipeDataIssues('review-test').includes('full rule review not signed off')&&!d.autoReady('review-test'),'new recipe needs explicit sign-off');delete R['review-test'];
// Actual Re-plan proposals also obey the new readiness gate.
S.lh={};S.food={};S.items={};const signed=R.m3.rulesReviewed;R.m3.rulesReviewed=false;
const before=JSON.stringify(S);p.openRecalc('all');assert(before===JSON.stringify(S),'preview does not save');
const choices=[...document.querySelectorAll('.reclist .rcx b')].map(e=>e.textContent);assert(choices.length>5&&!choices.includes(R.m3.n),'unreviewed recipe excluded from actual proposals');document.querySelector('#dlg').close();await wait();R.m3.rulesReviewed=signed;
audit=d.catalogAudit();assert(!audit.issues.length,JSON.stringify(audit.issues));
return {version:NPH_V,recipeOnlyLegacyNotice:true,noCardOutlineOrCount:true,genuineOmissionWarningRetained:true,ingredients:audit.ingredients,temporaryIngredients:audit.temporaryIngredients,recipes:audit.recipes,catalogIssues:audit.issues.length,incompleteDataCasesBlocked:mutations.length,newRecipeNeedsSignOff:true,automaticProposals:choices.length};
