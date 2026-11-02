const assert=(x,m)=>{if(!x)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100)),close=async()=>{document.querySelector('#dlg').close();await wait()},p=PLANNERS.lh,d=p._dbg,R=d.R,t=d.todayN(),out={version:NPH_V};
const open=(r,ik=null,at=null,ro=null)=>p.openR(r,ik,'test',false,false,at,ro),text=sel=>document.querySelector(sel).textContent;
go('lilh');document.querySelector('#page-lilh').click();
assert(Object.keys(R).length===40,'40 recipes');
assert(p.cfg.ING.every(([k])=>LH_PREP[k]),'preparation for every supported ingredient');
for(const [r,x] of Object.entries(R)){
 assert(d.review(r).ready,r+' reviewed');assert(x.basis===(x.t==='bf'?1:2),r+' portion basis');
 open(r);assert(document.querySelectorAll('.prep-list li').length>=x.need.length-1,r+' checklist coverage');
 if(x.t!=='bf'){
   assert(x.need.includes('oil'),r+' oil required');assert(text('.ingl').includes('1 tsp olive oil for finishing'),r+' oil measured');
   for(const n of [1,2,3]){document.querySelector('[data-dd="d"]').click();document.querySelector('[data-dopt="'+n+'"]').click();
     assert(text('.steps').includes(d.scaleStep('Stir in 1 tsp olive oil',n/2)),r+' resized finish '+n);
     assert(text('.ingl').includes(d.scaleIng('1 tsp olive oil for finishing',n/2)),r+' resized ingredient '+n);
     if(x.t==='beef')assert(text('.steps').includes(d.scaleStep('½ tsp olive oil',n/2)),r+' fractional browning '+n);
   }
 }await close();
}
out.recipes=40;out.mains=29;out.scaledMains=87;
assert(d.scaleStep('Use ½ tsp oil and 100ml water; simmer 15 min with 2cm water below the basket.',1.5)==='Use ¾ tsp oil and 150ml water; simmer 15 min with 2cm water below the basket.','quantities only');
assert(d.scaleIng('80g beef mince (5% fat)',.5)==='40g beef mince (5% fat)','fat percentage unchanged');
assert(!/250ml/.test(R.s3.s[0])&&R.s3.s[1].includes('250ml'),'rinsing separate from cooking');
assert(R.s9.s[0].includes('100ml water')&&R.m2.ing.some(i=>i.includes('100ml water')),'water present in method and ingredients');
assert(R.s5.s[2].includes('orzo')&&R.s14.s[2].includes('orzo'),'combine orzo');
assert(!/dries out/.test(R.s11.s[0]+R.s16.s[0])&&R.s11.s[0].includes('until the lentils have broken down'),'clean lentil wording');
// Preparation follows the effective recipe, including additions and None.
let a=d.review('b1',{banana:'apple','+pb':1,'+blueberry':1});
assert(a.keys.includes('apple')&&!a.keys.includes('banana'),'effective fruit');
assert(a.checks.some(c=>c.includes('apple peel'))&&a.checks.some(c=>c.includes('sticky blob'))&&a.checks.some(c=>c.includes('every blueberry')),'swap and addition actions');
a=d.review('b1',{banana:'-'});assert(!a.checks.some(c=>c.includes('banana')),'removed fruit check disappears');
a=d.review('s17',{'oil':'-','+peas':1,'+chickpeas':1});assert(a.checks.some(c=>c.includes('every pea'))&&a.checks.some(c=>c.includes('every chickpea')),'pulse/pea additions');
for(const r of ['s1','s5','s8','s14','s22'])assert(d.review(r).checks.some(c=>c.includes('pin bones')),r+' fish checks');
for(const r of Object.keys(R).filter(r=>R[r].need.includes('peas')))assert(d.review(r).checks.some(c=>c.includes('Crush every pea')),r+' pea checks');
assert(d.diet('s19','L',{oil:'-'}).some(i=>/^Olive oil was/.test(i.t)),'specific oil omission warning');
assert(!d.diet('s19','L',{oil:'-'}).some(i=>/^No documented fat/.test(i.t)),'egg is still fat source');
assert(d.review('m1',{oil:'-'}).fat.includes('5%-fat beef mince')&&d.review('s2',{oil:'-'}).fat.includes('chicken thigh'),'meat is not fat-free');
assert(d.diet('s11','L',{'+yoghurt':1}).some(i=>i.h&&/^Yoghurt with/.test(i.t)),'digestion still applies');
// Household dairy is confirmed full fat without confirmation controls.
assert(d.review('b1').fat.includes('whole milk'),'whole milk counted by default');
assert(d.review('b9').fat.includes('full-fat plain yoghurt'),'full-fat yoghurt counted by default');
S.items['pn-milk']={lhProduct:'other'};S.items['pn-yoghurt']={lhProduct:'unknown'};
assert(!d.review('b1').issues.some(i=>/^Milk/.test(i.t))&&!d.review('b9').issues.some(i=>/^Yoghurt type/.test(i.t)),'old product flags cannot override household confirmation');
open('b2');assert(!document.querySelector('[data-lhproduct],[data-lhdairy]'),'no product prompts');await close();
// Rendered swap preparation and added quantities are scaled by the main's two-portion basis.
S.lh['is-b'+(t+1)]={r:'b1',m:{banana:'apple','+pb':1}};open('b1','b'+(t+1));
assert(text('.steps').includes('Cook until easily squashed'),'authored fruit preparation before swapped method');await close();
S.lh['is-test']={r:'s17',m:{'+peas':1}};open('s17','test');assert(text('.addli').includes('2 tbsp'),'addition base quantity');
await close();S.lh['rs-s17']={m:{'+peas':1}};open('s17');document.querySelector('[data-dd="d"]').click();document.querySelector('[data-dopt="3"]').click();
assert(text('.addli').includes('3 tbsp')&&text('.steps').includes('3–4 min'),'addition scales without scaling cooking time');await close();delete S.lh['rs-s17'];
// New cooked batches retain facts when future/global recipes or stock are edited.
S.lh['x-L'+t]={v:'s11'};S.lh['is-xL'+t]={r:'s11',m:{butternut:'carrot'}};S.lh['x-L'+(t+1)]={v:'s11'};
const sourceIk=d.mainInfo('L',t).ik;S.lh['is-'+sourceIk]={r:'s11',m:{butternut:'carrot'}};
const lot=p.newLot('L',t,'s11');assert(lot&&lot.facts&&!lot.facts.legacy,'new batch records facts');
S.food.reviewtest=lot;S.lh['fz-mD'+(t+1)]={f:'reviewtest',w:'fridge',p:1};S.lh['x-D'+(t+1)]={v:'s11'};
S.lh['rs-s11']={m:{butternut:'potato',oil:'-'}};S.items['pn-carrot']={gone:true};
const before=d.review('s11',d.subsOf('s11','@lot:reviewtest'),'@lot:reviewtest');
assert(before.keys.includes('carrot')&&before.keys.includes('oil')&&!before.keys.includes('butternut'),'batch preserves ingredients despite future edits/deleted stock');
open('s11','xD'+(t+1),'D:'+(t+1),'Cooked test');
assert(text('.prep-list').includes('Cook carrot')&&text('.ingl').includes('olive oil'),'leftover facts shown');
assert(text('.steps').includes('1 tsp olive oil')&&text('#card').includes('Cook-day method (reference)'),'leftover original method labelled reference');
assert(!document.querySelector('[data-sub]'),'leftover remains read-only');await close();
const legacy={...lot};delete legacy.facts;S.food.legacytest=legacy;open('s11','@lot:legacytest',null,'Earlier batch');
assert(text('.review-warnings').includes('not recorded')&&!text('.ingl').includes('oil for finishing'),'legacy batch does not invent oil');await close();
// A missing preparation record blocks automation, while leaving the recipe manually reviewable.
const prep=LH_PREP.orzo;delete LH_PREP.orzo;assert(!d.autoReady('s17'),'unreviewed automatic data gate');open('s17');assert(text('.review-warnings').includes('Preparation details need review'),'manual information warning');await close();LH_PREP.orzo=prep;
// Clean data for a 28-day baseline; the new checks do not rewrite the rotation or force enrichment.
S.lh={};S.food={};S.items={};S.items['pn-milk']={lhProduct:'whole'};S.items['pn-yoghurt']={lhProduct:'full'};
let meals=0;for(let n=t;n<t+28;n++)for(const sl of ['B','L','D']){const r=sl==='B'?d.bfAt(n):d.valAt(sl,n);assert(!d.diet(r,sl).some(i=>/^No starchy|^No documented fat|^Olive oil/.test(i.t)),'baseline structure '+n+sl);assert(d.review(r).ready,'baseline prepared '+n+sl);meals++}
out.baselineMeals=meals;out.checks=['all recipes and profiles','batch/added quantity scaling','specific method fixes','effective ingredient preparation','confirmed full-fat dairy','qualitative fat warnings','source and historical batch facts','automatic preparation gate','28-day rotation'];
go('lilh');open('s1');const panel=document.querySelector('.serving-checks');document.querySelector('#dlg').scrollTop=panel.offsetTop-140;out.horizontalOverflow=document.querySelector('#card').scrollWidth>document.querySelector('#card').clientWidth+1;assert(!out.horizontalOverflow,'phone recipe fits');
return out;
