const assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100)),p=PLANNERS.lh,d=p._dbg,t=d.todayN();go('lilh');document.querySelector('#page-lilh').click();
S.items['pn-milk']={lhProduct:'whole'};S.items['pn-yoghurt']={lhProduct:'full'};
const orzo=LH_PREP.orzo;delete LH_PREP.orzo;
S.lh['rs-m3']={m:{'+lentils':1,'+cauliflower':1}};
const before=JSON.stringify(S);p.openRecalc('all');
assert(before===JSON.stringify(S),'preview does not save');
const selected=[...document.querySelectorAll('.reclist .rcx b')].map(e=>e.textContent),ids=selected.map(n=>Object.keys(d.R).find(k=>d.R[k].n===n));
assert(ids.length>5,'meaningful replan suggestions');assert(ids.every(r=>r&&d.autoReady(r)&&!d.diet(r,d.R[r].t==='bf'?'B':'L',d.subsOf(r,null)).some(i=>i.h)),'actual replan excludes incomplete prep and hard gas clashes');
assert(ids.every(r=>!d.R[r].need.includes('orzo')&&r!=='m3'),'unreviewed orzo / clashing m3 not selected');
p.recClick(document.querySelector('[data-recok]'));await wait();LH_PREP.orzo=orzo;
// A source correction changes this batch, retaining its other facts despite subsequent global edits.
S.lh={};S.food={};S.items={};S.lh['x-L'+t]={v:'s11'};S.lh['x-L'+(t+1)]={v:'s11'};
let ik=d.mainInfo('L',t).ik;S.lh['is-'+ik]={r:'s11',m:{butternut:'carrot'}};
const lot=p.newLot('L',t,'s11');S.food['c-lh-L'+t+'-s11']=lot;
S.lh['rs-s11']={m:{butternut:'potato',oil:'-','+peas':1}};
p.openR('s11',ik,'cook day',false,false,'L:'+t);document.querySelector('[data-sub="spinach"]').click();document.querySelector('[data-subto="-"]').click();
const sm=d.subsOf('s11',ik);assert(sm.spinach==='-'&&sm.butternut==='carrot'&&!sm.oil&&!sm['+peas'],'explicit source correction retains original batch facts');
document.querySelector('#dlg').close();await wait();
// Implicit deletions are recorded at cooking, not resurrected by later stock changes.
S.lh={};S.food={};S.items={'pn-spinach':{gone:true}};S.lh['x-L'+t]={v:'s11'};S.lh['x-L'+(t+1)]={v:'s11'};
// Spinach is a separate LH stock item, unlike the other shared vegetables.
S.items={'lh-spinach':{gone:true}};
const omitted=p.newLot('L',t,'s11');assert(omitted.facts.sm.spinach==='-','implicit deletion recorded');
S.food.omitted=omitted;S.items={};assert(!d.review('s11',d.subsOf('s11','@lot:omitted'),'@lot:omitted').keys.includes('spinach'),'restocking does not rewrite cooked batch');
// Correcting batch size uses the same source key and updates recorded portions during materialisation.
S.food={};S.lh={};S.lh['x-L'+(t-1)]={v:'s11'};S.lh['x-L'+t]={v:'s11'};
ik=d.mainInfo('L',t-1).ik;const past=p.newLot('L',t-1,'s11');S.food['c-lh-L'+(t-1)+'-s11']=past;
S.lh['dy-'+ik]={r:'s11',v:3};materialiseFood0(d.absOf(t-1));
assert(S.food['c-lh-L'+(t-1)+'-s11'].facts.portions===3,'corrected source portions recorded');
return {replanChoices:ids.length,unreviewedChoicesExcluded:true,hardGasClashesExcluded:true,batchCorrectionsPreserveFacts:true,deletedIngredientsStayOmitted:true,sourcePortionsUpdated:true};
