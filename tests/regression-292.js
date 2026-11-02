const p=PLANNERS.lh,d=p._dbg,t=d.todayN(),n=t+2,assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100)),close=async()=>{document.querySelector('#dlg').close();await wait()},card=()=>document.querySelector('#card'),text=sel=>document.querySelector(sel).textContent;
go('lilh');document.querySelector('#page-lilh').click();
const colour=token=>{const e=document.createElement('span');e.style.color='var('+token+')';document.body.append(e);const c=getComputedStyle(e).color;e.remove();return c};
S.lh['b-'+n]={v:'b1'};S.lh['is-b'+n]={r:'b1',m:{banana:'pear',milk:'-','+pb':1}};p.render();
let toggle=document.querySelector('#page-lilh .day[data-n="'+n+'"] [data-dswap]');assert(toggle&&toggle.textContent.trim()==='3','date toggle counts all three changes');toggle.click();
let meal=document.querySelector('#page-lilh .day[data-n="'+n+'"] .meal[data-r="b1"]');
for(const [kind,token] of [['swap','--ok'],['add','--lilh'],['remove','--warn']]){const e=meal.querySelector('[data-change="'+kind+'"]');assert(e,'change '+kind+' present');assert(getComputedStyle(e).color===colour(token),kind+' colour');}
assert(meal.textContent.includes('peanut butter added')&&meal.textContent.includes('whole milk removed'),'added and removed text');
p.openR('b1','b'+n,'breakfast');assert(text('.subhint').trim()==='This only changes this batch','batch scope text only');
assert(document.querySelector('.subhint .ic'),'scope swap icon');
assert(getComputedStyle(document.querySelector('.needs .added')).color===colour('--lilh'),'recipe addition pill blue');
assert(getComputedStyle(document.querySelector('.needs .rmd')).color===colour('--warn'),'recipe removal pill amber');
assert(!card().textContent.includes('tap to tick off')&&!card().textContent.includes('Tap an ingredient to'),'verbose hints removed');
assert([...card().querySelectorAll('h4')].some(e=>e.textContent.startsWith('You need')&&/\d+ items$/.test(e.textContent)),'item count only');
assert(!document.querySelector('.recipe-review')&&!card().textContent.includes('Energy & ingredients'),'energy section removed');
let tags=[...document.querySelectorAll('[data-pin="nut"]')].map(e=>e.textContent);
assert(tags.includes('Fat source: smooth peanut butter')&&!tags.includes('Fat source: whole milk'),'effective fat sources in nutrition pills');
assert(!tags.some(t=>/gas.?maker/i.test(t)),'no digestion tags among nutrition');
assert(document.querySelector('.serving-head h4').textContent==='Before serving'&&document.querySelector('.serving-head .serving-intro').textContent.includes('upright'),'serving reminder grouped with heading');
assert(getComputedStyle(document.querySelector('.serving-intro')).color===colour('--muted'),'serving reminder uses muted body style');
const nut=document.querySelector('[data-pcat="nut"]');nut.click();assert([...document.querySelectorAll('[data-pin="nut"]')].every(e=>!e.hidden),'nutrition pills still expand');await close();
// An addition or removal alone must make the date toggle available.
for(const sm of [{'+pb':1},{milk:'-'}]){S.lh['is-b'+n]={r:'b1',m:sm};p.render();toggle=document.querySelector('#page-lilh .day[data-n="'+n+'"] [data-dswap]');assert(toggle&&toggle.textContent.trim()==='1','single non-swap edit counted');}
// Recipe-library scope stays explicit for both planners.
p.openR('s12');assert(text('.subhint').trim()==='This changes all batches of this recipe','global scope');
tags=[...document.querySelectorAll('[data-pin="nut"]')].map(e=>e.textContent);assert(tags.some(t=>t==='Fat source: olive oil')&&!tags.some(t=>t.includes('gas-maker')),'fat pills replace misplaced gas tags');
assert(!document.querySelector('.digestion-review'),'digestion explainer absent from recipe');await close();
go('np');document.querySelector('#page-np').click();PLANNERS.pn.openR('beefstew');assert(text('.subhint').trim()==='This changes all batches of this recipe','adult recipe scope');assert(!card().textContent.includes('tap to tick off'),'adult item hint removed');await close();go('lilh');document.querySelector('#page-lilh').click();
// Genuine recipe warnings remain visible after removing the energy section.
S.lh['rs-s19']={m:{oil:'-'}};p.openR('s19');assert(text('.recipe-alerts').includes('Olive oil was left out'),'omission warning retained');assert([...document.querySelectorAll('[data-pin="nut"]')].some(e=>e.textContent==='Fat source: egg'),'egg fat source remains');await close();delete S.lh['rs-s19'];
// Read-only stored food displays all source changes even after global recipe edits.
S.lh={};S.food={};S.lh['x-L'+t]={v:'s11'};S.lh['x-L'+(t+1)]={v:'s11'};let ik=d.mainInfo('L',t).ik;S.lh['is-'+ik]={r:'s11',m:{butternut:'carrot',spinach:'-','+peas':1}};
S.food.changes=p.newLot('L',t,'s11');S.lh['rs-s11']={m:{butternut:'potato','+leek':1}};S.lh['x-D'+n]={v:'s11'};S.lh['fz-mD'+n]={f:'changes',w:'fridge',p:1};p.render();
toggle=document.querySelector('#page-lilh .day[data-n="'+n+'"] [data-dswap]');if(toggle.getAttribute('aria-pressed')!=='true')toggle.click();
meal=document.querySelector('#page-lilh .day[data-n="'+n+'"] .meal[data-at="D:'+n+'"]');
assert(meal.querySelectorAll('[data-change]').length===3&&meal.textContent.includes('carrot')&&meal.textContent.includes('peas added')&&meal.textContent.includes('spinach removed')&&!meal.textContent.includes('leeks added'),'source changes retained in card view');
p.openR('s11','xD'+n,'leftovers',false,false,'D:'+n,'Cooked test');assert(!document.querySelector('[data-sub]'),'leftovers remain read-only');assert([...document.querySelectorAll('[data-pin="nut"]')].some(e=>e.textContent==='Fat source: olive oil'),'source fat pill');await close();
// Final screenshot: the simplified recipe header and ingredient scope.
S.lh={};S.food={};p.openR('s12');document.querySelector('[data-pcat="nut"]').click();document.querySelector('#dlg').scrollTop=0;
assert(card().scrollWidth<=card().clientWidth+1,'phone layout fits');
return {version:NPH_V,threeChangeTypesAndColours:true,additionAndRemovalOnlyToggle:true,recipePillColoursMatch:true,conciseScopeBothPlanners:true,nutritionAndDigestionSeparated:true,fatPillsAndOmissionWarnings:true,servingHeaderGrouped:true,readOnlySourceChanges:true};
