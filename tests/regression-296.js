const assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,180)),p=PLANNERS.lh,d=p._dbg,t=d.todayN(),a=d.absOf(t);
go('lilh');document.querySelector('#page-lilh').click();
const close=async()=>{document.querySelector('#dlg').close();await wait()},reset=()=>{S.lh={};S.food={};S.items={};SHV++;SHNEED.lh=null};
const lot=(fid,r,made,src,p=1,extra={})=>S.food[fid]={who:'lh',r,made,src,mk:p+1,out:0,stacks:[{w:'fridge',p,since:made,th:false}],...extra};
const proposal=async(mode)=>{p.render();const before=JSON.stringify(S);p.openRecalc(mode);assert(before===JSON.stringify(S),'preview is read only');return [...document.querySelectorAll('.reclist li')].map(x=>{const lines=x.innerText.split('\n');lines[0]=lines[0].toUpperCase();return lines.join('\n')})};
// User example: yesterday manually changed to salmon, today assigned Saturday's mash.
reset();S.lh['x-D'+(t-1)]={v:'s14'};S.lh['dy-xD'+(t-1)]={r:'s14',v:2};
const fid='c-lh-D'+(t-1)+'-s14';S.food[fid]=p.newLot('D',t-1,'s14');
lot('old','s19',a-2,null);S.lh['x-D'+t]={v:'s19'};S.lh['fz-mD'+t]={f:'old',w:'fridge',p:1};
assert(stackExp(S.food[fid],S.food[fid].stacks[0])===a,'yesterday expires today');assert(lotState('old').st[0].expired,'two-day-old LH batch is expired');
const foodBefore=JSON.stringify(S.food),pastBefore=JSON.stringify(S.lh['x-D'+(t-1)]);
let rows=await proposal();assert(rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes('Salmon, leek & pea orzo\nFrom the fridge')),'salmon replaces invalid mash at today dinner');
p.recClick(document.querySelector('[data-recok]'));await wait();deriveAll();p.render();
assert(S.lh['fz-mD'+t]?.f===fid&&d.valAt('D',t)==='s14','applied dinner uses yesterday actual salmon batch');
assert(JSON.stringify(S.food[fid])===JSON.stringify(JSON.parse(foodBefore)[fid])&&JSON.stringify(S.food.old)===JSON.stringify(JSON.parse(foodBefore).old)&&JSON.stringify(S.lh['x-D'+(t-1)])===pastBefore,'source, old portion and past meal preserved');
let st=lotState(fid);assert(st.now===1&&st.free===0&&st.uses.filter(x=>x.abs===a).length===1&&!st.uses.some(x=>x.late||x.short),'one portion reserved exactly once');
assert(lotState('old').free===1,'replaced expired portion remains in Cooked to discard');
let salmon=0;for(let n=t;n<t+7;n++)for(const sl of ['L','D'])if(d.R[d.valAt(sl,n)]?.t==='salmon')salmon++;
assert(salmon<=2,'future fresh salmon adjusts to preserve weekly cap');
// A cooked portion cannot bypass the salmon limit when no replacement can be made.
await close();reset();S.lh['x-D'+(t-1)]={v:'s14'};S.lh['dy-xD'+(t-1)]={r:'s14',v:2};S.food[fid]=p.newLot('D',t-1,'s14');
S.lh['x-D'+t]={v:'__skip'};for(const ing of p.cfg.ING)S.stock[p.cfg.skey(ing[0])]={out:true};
rows=await proposal();assert(!rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes('Salmon, leek & pea orzo\nFrom the fridge')),'weekly salmon cap retained without fresh replacement');await close();S.stock={};
// Shared expiry rules: full LH catalogue, PN normal/rice, thawed and frozen.
for(const r of Object.keys(d.R))assert(stackExp({who:'lh',r,made:a},{w:'fridge',since:a})===a+1,'following-day expiry '+r);
assert(stackExp({who:'pn',r:'beefstew',made:a},{w:'fridge',since:a})===a+2,'adult fresh expiry retained');
assert(stackExp({who:'pn',r:'friedrice',made:a},{w:'fridge',since:a})===a+1,'rice expiry retained');
assert(stackExp({who:'lh',r:'s14',made:a-10},{w:'fridge',since:a,th:true})===a+1,'thawed expiry starts at thaw');
assert(stackExp({who:'lh',r:'s14',made:a},{w:'freezer',since:a})===a+30,'freezer expiry retained');
// Stored source swaps/additions are checked; a hard gas clash is never rescued automatically.
reset();S.lh['x-D'+(t-1)]={v:'s11'};S.lh['is-xD'+(t-1)]={r:'s11',m:{'+broccoli':1,'+cauliflower':1}};
const bad=p.newLot('D',t-1,'s11');S.food.bad=bad;S.lh['x-D'+t]={v:'__skip'};
rows=await proposal();assert(!rows.some(x=>x.includes('From the fridge')&&x.includes(d.R.s11.n)),'actual source hard digestion clash excluded');await close();
// Valid already planned storage and manual fresh choices stay in Planned meals mode.
reset();lot('spare','s11',a-1,'D'+(t-1));lot('valid','s19',a-1,null);S.lh['x-D'+t]={v:'s19'};S.lh['fz-mD'+t]={f:'valid',w:'fridge',p:1};
rows=await proposal();assert(!rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes('From the fridge')),'valid stored dinner retained');await close();
reset();lot('spare','s11',a-1,'D'+(t-1));S.lh['x-D'+t]={v:'s17'};
rows=await proposal();assert(!rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes('From the fridge')),'manual fresh dinner retained');await close();
// Invalid future stored assignments are offered for explicit replacement, with their portions retained.
reset();lot('late','s20',a-1,null);S.lh['x-D'+(t+1)]={v:'s20'};S.lh['fz-mD'+(t+1)]={f:'late',w:'fridge',p:1};
rows=await proposal();assert(rows.some(x=>x.startsWith('TUE 3 NOV DINNER')&&x.includes('Past its eat-by date')&&x.includes('Replace it')),'invalid future storage has an optional repair');
assert(!document.querySelector('[data-rectick]').checked,'cooked replacement starts unticked');await close();
// Earliest expiry takes priority, own track before crossing, enough portions and thaw readiness.
reset();lot('newer','s11',a,null);lot('older','s12',a-1,'D'+(t-1));S.lh['x-D'+t]={v:'__skip'};
rows=await proposal();assert(rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes(d.R.s12.n)&&x.includes('From the fridge')),'older own-track portion wins');await close();
reset();lot('thaw','s11',a-5,'D'+(t-5),1,{stacks:[{w:'fridge',p:1,since:a,th:true,at:Date.now(),h:20}]});
rows=await proposal();assert(!rows.some(x=>/^MON 2 NOV/.test(x)&&x.includes('From the fridge')),'unready thaw not allocated today');await close();
// Today's expected leftovers follow final proposed recipe/source ingredients and remain outside Stock.
reset();S.lh['x-L'+t]={v:'s20'};S.lh['dy-xL'+t]={r:'s20',v:3};S.lh['x-L'+(t+1)]={v:'__skip'};S.lh['x-D'+t]={v:'__skip'};
rows=await proposal();assert(rows.some(x=>x.startsWith('MON 2 NOV DINNER\n')&&x.includes('Planned leftovers from today')),'expected lunch portion can fill same-day dinner');
p.recClick(document.querySelector('[data-recok]'));await wait();deriveAll();p.render();
const ref=S.lh['fz-mD'+t];assert(ref?.planned&&!S.food[ref.f],'expected portions not materialised before cooking');
st=lotState(ref.f);assert(st&&!st.uses.some(x=>x.short||x.late),'expected uses valid and within batch size');
return {salmonExample:true,previewReadOnly:true,portionsConserved:true,weeklySalmonMeals:salmon,lhExpiryRecipes:Object.keys(d.R).length,sourceGasChecks:true,manualChoicesPreserved:true,expiryAndTrackPriority:true,thawReadiness:true,expectedLeftovers:true};
