const assert=(v,m)=>{if(!v)throw Error(m)},wait=ms=>new Promise(r=>setTimeout(r,ms||100));
finishPageMotion();
// Stable priority order through real tick controls and quantity changes.
for(const row of PN_ING)S.stock['pn-'+row[0]]={out:true,qty:2};
shopView='buy';keep.clear();buyOrder=null;go('shop');finishPageMotion();
const order=()=>[...document.querySelectorAll('#shop-cats [data-tick]')].map(b=>b.dataset.tick);
const before=order(),key=before.find(k=>PN.thisWeekKeys().has(k));assert(key,'weekly ingredient fixture');
document.querySelector(`[data-tick="${key}"]`).click();await wait();assert(JSON.stringify(order())===JSON.stringify(before),'ticking must not reorder');
document.querySelector(`[data-tick="${key}"]`).click();await wait();assert(JSON.stringify(order())===JSON.stringify(before),'unticking must not reorder');
document.querySelector(`[data-q="${key}:1"]`).click();await wait();assert(JSON.stringify(order())===JSON.stringify(before),'quantity must not reorder');
// Freeze timing uses each stack timestamp and the next planned thaw-start.
const t=todayAbs(),n=PN._dbg.todayN();
const x={w:'freezer',p:2,since:t,th:false,at:Date.now()-3600000,h:6};
S.food.overlap={who:'pn',r:'beefstew',made:t,mk:4,src:null,stacks:[x]};
S.pn['x-L'+(n+1)]={v:'beefstew'};S.pn['fz-mL'+(n+1)]={f:'overlap',p:2,w:'freezer'};
assert(lotState('overlap').fut[0].unfrozen,'freezing overlaps tomorrow thaw-start');
go('np');finishPageMotion();PN.showDay(n+1,true);await wait();
const meal=document.querySelector(`#page-np .meal[data-at="L:${n+1}"]`);
assert(meal.closest('.row').innerText.includes('Not frozen yet'),'meal shows fridge-return warning '+JSON.stringify(PN._dbg.mainInfo('L',n+1))+' text='+meal.closest('.row').innerText);
const action=meal.closest('.row').querySelector('[data-unfrozen]');assert(action,'fridge-return action');action.click();
assert(mvCtx.kind==='thaw'&&!mvCtx.nl.stacks.find(s=>s.w==='fridge').th,'return before frozen stays fresh');
assert(stackExp(mvCtx.nl,mvCtx.nl.stacks.find(s=>s.w==='fridge'))===t+2,'original expiry retained');
document.getElementById('dlg').close();
S.food.overlap.stacks[0].at=Date.now()-6*3600000;assert(!lotState('overlap').fut[0].unfrozen,'fully frozen uses ordinary thaw logic');
S.food.overlap.stacks[0].at=Date.now()-3600000;S.pn['x-L'+(n+2)]={v:'beefstew'};S.pn['fz-mL'+(n+2)]={f:'overlap',p:2,w:'freezer'};delete S.pn['fz-mL'+(n+1)];
assert(!lotState('overlap').fut[0].unfrozen,'enough time before later thaw-start');
delete S.pn['fz-mL'+(n+2)];
// Expired pill only highlights; collapsed pills open the chosen text mode.
S.food.expired={who:'pn',r:'beefstew',made:t-5,mk:2,src:null,stacks:[{w:'fridge',p:2,since:t-5,th:false}]};
foodWho='pn';shopView='cooked';shut.add('cf-fridge');foodModes['pn:fridge']='details';go('shop');finishPageMotion();
document.querySelector('[data-foodmode="fridge:planned"]')?.click();
shut.add('cf-fridge');renderFood();document.querySelector('[data-foodmode="fridge:warnings"]').click();
assert(!shut.has('cf-fridge')&&foodModes['pn:fridge']==='warnings','collapsed pill selects its mode');
const mode=foodModes['pn:fridge'];document.querySelector('[data-foodmode="fridge:expired"]').click();await wait(500);
assert(foodModes['pn:fridge']===mode,'expired highlight does not replace text mode');
assert(document.querySelector('[data-fcard="expired:0"] .nphfx')?.style.getPropertyValue('--flash')==='var(--bad)','expired red highlight');
assert(!document.querySelector('.cooked-count.bad'),'meal count stays grey');
foodModes['pn:freezer']='freezing';delete S.food.overlap;renderFood();assert(foodModes['pn:freezer']==='details','empty freeze mode resets');
// The full header target remains a native keyboard-operable button.
document.querySelector('[data-cat="cf-fridge"]').click();assert(shut.has('cf-fridge'),'header collapses');
document.querySelector('[data-cat="cf-fridge"]').click();assert(!shut.has('cf-fridge'),'header expands');
return {stableShoppingOrder:true,freezeOverlap:true,freshExpiryPreserved:true,expiredHighlight:true,collapsedPills:true,staleModesReset:true};
