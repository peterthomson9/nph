const p=PLANNERS.lh,d=p._dbg,R=d.R,t=d.todayN(),n=t+2,assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100)),close=async()=>{document.querySelector('#dlg').close();await wait()};
go('lilh');document.querySelector('#page-lilh').click();
assert(p.cfg.ING.every(([k])=>LH_GAS[k]),'all supported ingredients have digestion review');
let baseHard=0;for(const r of Object.keys(R)){const g=d.gasReview(r,{},null);assert(!g.unknown.length,r+' digestion reviewed');assert(d.autoReady(r),r+' ready');if(g.issues.some(i=>i.h))baseHard++}
assert(baseHard===0,'baseline recipes meet household combinations');
const cases=[
 ['s11',{'+broccoli':1},'Second gas-maker'],
 ['s4',{'+cauliflower':1},'Second gas-maker'],
 ['s11',{'+peas':1,'+leek':1},'Too many gas-makers'],
 ['s18',{'+yoghurt':1},'Yoghurt with'],
 ['s11',{'+yoghurt':1},'Yoghurt with']
];
for(const [r,sm,why] of cases)assert(d.gasReview(r,sm,null).issues.some(i=>i.h&&i.t.startsWith(why)),r+' custom '+why);
const stacked=d.gasReview('s11',{'+broccoli':1,'+peas':1,'+yoghurt':1},null).issues;
assert(stacked.some(i=>/^Second gas-maker/.test(i.t))&&stacked.some(i=>/^Too many gas-makers/.test(i.t))&&stacked.some(i=>/^Yoghurt with/.test(i.t)),'all simultaneous combination warnings shown');
assert(!d.gasReview('s11',{'+peas':1},null).issues.some(i=>i.h),'one higher + one milder remains allowed');
assert(!d.gasReview('s18',{courgette:'cauliflower'},null).issues.some(i=>/^Second gas-maker/.test(i.t)),'same ingredient not counted as two distinct gas-makers');
assert(!d.gasReview('b1',{banana:'apple','+yoghurt':1,'+garlic':1},null).issues.some(i=>i.h),'possible contributors do not invent hard bans');
const fruit=d.gasReview('b1',{banana:'pear'},null);assert(fruit.possible.includes('pear')&&!fruit.strong.includes('pear'),'fruit awareness separate from household caps');
// One-off custom Add warns about the other main meal before it is chosen.
S.lh['x-L'+n]={v:'s21'};S.lh['x-D'+n]={v:'s18'};p.openR('s21','xL'+n,'test',false,false,'L:'+n);
document.querySelector('[data-sub="+"]').click();let option=document.querySelector('[data-subto="+lentils"]');
assert(option&&!option.disabled&&option.classList.contains('dwarn')&&option.textContent.includes('Same day as cauliflower'),'custom Add previews other-meal clash without blocking');option.click();
assert(S.lh['is-xL'+n].m['+lentils']===1,'custom addition saved');
assert(!document.querySelector('.digestion-review')&&!document.querySelector('#card').textContent.includes('Gas makers & combinations'),'recipe explainer removed');
assert(d.mainInfo('L',n).warns.some(w=>w.includes('Same day as cauliflower')),'saved custom clash remains on meal card');
document.querySelector('[data-sub="+lentils"]').click();document.querySelector('[data-subto="!"]').click();
assert(!d.mainInfo('L',n).warns.some(w=>w.includes('Same day as cauliflower')),'removing custom contributor clears meal-card clash');await close();
// A global custom recipe and a one-off use the same classifier.
S.lh['rs-s11']={m:{'+broccoli':1,'+peas':1}};p.openR('s11');assert(!document.querySelector('.digestion-review')&&d.diet('s11','L',d.subsOf('s11',null)).some(i=>/^Second gas-maker/.test(i.t)),'global custom checks retained without explainer');await close();delete S.lh['rs-s11'];
// Swapping roots into a new fruit preparation rebuilds contributor notes, too.
S.lh['is-b'+n]={r:'b1',m:{banana:'apple'}};p.openR('b1','b'+n);assert(!document.querySelector('.digestion-review')&&d.gasReview('b1',d.subsOf('b1','b'+n),'b'+n).possible.includes('apple'),'fruit awareness retained internally');await close();
S.lh['is-b'+n]={r:'b1',m:{banana:'-'}};p.openR('b1','b'+n);assert(!d.gasReview('b1',d.subsOf('b1','b'+n),'b'+n).possible.includes('apple'),'None removes contributor');await close();
// Stored custom food keeps source ingredients when later global recipes change.
S.lh={};S.food={};S.lh['x-L'+t]={v:'s21'};S.lh['x-L'+(t+1)]={v:'s21'};const ik=d.mainInfo('L',t).ik;S.lh['is-'+ik]={r:'s21',m:{'+lentils':1,'+leek':1}};
const lot=p.newLot('L',t,'s21');S.food.gasbatch=lot;S.lh['rs-s21']={m:{'+cauliflower':1}};
const g=d.gasReview('s21',d.subsOf('s21','@lot:gasbatch'),'@lot:gasbatch');assert(g.strong.includes('lentils')&&g.mild.includes('leek')&&!g.strong.includes('cauliflower'),'stored custom source preserved');
// Unreviewed digestion metadata is explicit and excludes actual automatic proposals.
S.lh={};S.food={};const profile=LH_GAS.orzo;delete LH_GAS.orzo;
assert(!d.autoReady('s17'),'unknown digestion profile gates automation');p.openR('s17');assert(document.querySelector('.recipe-alerts').textContent.includes('Digestion details need review'),'unknown data warning retained');await close();
const before=JSON.stringify(S);p.openRecalc('all');assert(before===JSON.stringify(S),'Re-plan preview preserves data');
const chosen=[...document.querySelectorAll('.reclist .rcx b')].map(e=>Object.keys(R).find(r=>R[r].n===e.textContent));assert(chosen.length>5&&chosen.every(r=>r&&!R[r].need.includes('orzo')),'actual automatic choices exclude unreviewed digestion');document.querySelector('#dlg').close();await wait();LH_GAS.orzo=profile;
// Custom shopping entries are not silently assumed to be reviewed recipe ingredients.
S.custom.gasTest={name:'Mystery ingredient',cat:'veg'};assert(!d.ORDER.includes('cu-gasTest'),'shopping-only custom item is not inserted into recipes');
S.lh={};S.food={};S.lh['x-L'+n]={v:'s11'};S.lh['rs-s11']={m:{'+broccoli':1,'+yoghurt':1}};p.render();
const warnings=d.mainInfo('L',n).warns;assert(warnings.some(w=>/^Second gas-maker/.test(w))&&warnings.some(w=>/^Yoghurt with/.test(w)),'all combination warnings retained on meal cards');
document.querySelector('#page-lilh .day[data-n="'+n+'"] [data-dwarn]').click();
const day=document.querySelector('#page-lilh .day[data-n="'+n+'"]');assert(day.textContent.includes('Second gas-maker')&&day.textContent.includes('Yoghurt with'),'amber warning view shows both conflicts');
p.openR('s11');assert(!document.querySelector('.digestion-review'),'no recipe explainer for clashing combination');
document.querySelector('#dlg').scrollTop=0;
assert(document.querySelector('#card').scrollWidth<=document.querySelector('#card').clientWidth+1,'phone layout fits: '+JSON.stringify([...document.querySelectorAll('#card, #card *')].filter(e=>e.clientWidth&&e.scrollWidth>e.clientWidth+1).slice(0,12).map(e=>({tag:e.tagName,c:e.className,w:e.clientWidth,s:e.scrollWidth}))));
return {recipes:40,ingredientProfiles:p.cfg.ING.length,baselineHardClashes:baseHard,customMealChecks:true,customDayPreview:true,sourceBatchChecks:true,possibleContributorsAreInformational:true,unreviewedAutomationExcluded:true,automaticProposals:chosen.length};
