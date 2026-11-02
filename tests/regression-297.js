const assert=(v,m)=>{if(!v)throw Error(m)},wait=ms=>new Promise(r=>setTimeout(r,ms)),root=document.querySelector('#shop-food');
const card=fid=>root.querySelector('[data-fcard="'+fid+':0"]'),tap=(el)=>{assert(el,'button exists');el.click()};
const geom=e=>e.getBoundingClientRect(),opacity=e=>+getComputedStyle(e).opacity;
const before=JSON.stringify(S),checks=[];
for(const who of ['lh','pn']){
 tap(document.querySelector('#shop-who [data-who="'+who+'"]'));await wait(40);
 assert(root.querySelectorAll('.cooked-card').length===4,'four stored batch stacks');
 assert(!card(who+'-today').querySelector('.has-warning'),'assigned Eat today has no amber outline');
 assert(card(who+'-today').querySelector('.cstatus').textContent==='Eat today','normal Eat today text');
 assert(card(who+'-spare').querySelector('.has-warning'),'unassigned fridge portions have amber outline');
 assert(!!card(who+'-freeze').querySelector('.has-warning')===(who==='lh'),'partly assigned freezer batch flags only its spare quantity');
 assert(!card(who+'-thaw').querySelector('.has-warning'),'assigned thawing adds no amber assignment warning');
 assert(root.querySelectorAll('.cphase').length===2,'ongoing process name badges');
 for(const c of root.querySelectorAll('.cooked-card')){
  const b=geom(c),tx=geom(c.querySelector('.tx')),bar=geom(c.querySelector('.cbar'));
  assert(Math.abs(bar.left-tx.left)<.6,'bar starts at the text');
  assert(Math.abs((bar.left-b.left)-(b.right-bar.right))<.6,'bar insets are equal');
  assert(bar.bottom<b.bottom-3,'bar clears highlighted border');
 }
 assert(document.documentElement.scrollWidth<=innerWidth+1,'page has no horizontal overflow');
 let c=card(who+'-today'),h=geom(c).height;
 tap(c.querySelector('[data-fdots]'));await wait(180);
 assert(c.classList.contains('open')&&c.querySelector('.row.ed'),'menu opens in the row');
 assert(c.querySelectorAll('.edbtn').length===3,'three inline controls');
 assert(opacity(c.querySelector('.cbar'))===0,'bar hidden while menu is active');
 assert(opacity(c.querySelector('.tx'))===0,'text uses native fade');
 assert(geom(c).height===h,'menu does not change card height');
 assert(getComputedStyle(c.querySelector('.edbtn')).animationName==='edin','native opening animation');
 for(const button of c.querySelectorAll('.edbtn'))assert(button.scrollHeight<=button.clientHeight+1,'action label fits');
 // A model refresh must preserve the open menu without flashing its bar.
 renderFood();c=card(who+'-today');await wait(40);
 assert(c.classList.contains('open')&&opacity(c.querySelector('.cbar'))===0,'refresh preserves hidden bar and menu');
 tap(c.querySelector('[data-fdots]'));
 assert(c.classList.contains('closing')&&c.querySelector('.edb.out'),'native closing animation begins');
 await wait(80);assert(opacity(c.querySelector('.cbar'))===0,'bar stays hidden while buttons leave');
 await wait(260);assert(!c.querySelector('.edb')&&opacity(c.querySelector('.cbar'))===1,'bar fades back after buttons leave');
 // Rapid closing/reopening must not let an old timer reveal the bar.
 tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdots]'));await wait(210);
 assert(c.classList.contains('open')&&opacity(c.querySelector('.cbar'))===0,'rapid reopening has no bar flash');
 document.querySelector('.cooked-head h3').click();await wait(310);
 assert(!fOpen&&opacity(c.querySelector('.cbar'))===1,'outside tap closes and restores bar');
 tap(root.querySelector('[data-foodmode="fridge:warnings"]'));await wait(260);
 assert(card(who+'-spare').querySelector('.cstatus').textContent.includes('not assigned'),'warning mode explains spare quantity');
 assert(card(who+'-today').querySelector('.cstatus').textContent==='All portions assigned','Eat today is not a warning');
 assert(root.querySelectorAll('[data-foodmode*="changes"]').length===0,'no storage ingredient-change toggle');
 tap(root.querySelector('[data-foodmode="fridge:planned"]'));await wait(260);
 assert(root.querySelector('.cooked-group').querySelectorAll('.dwb.on').length===1,'one active text group');
 const planned=card(who+'-today').querySelector('.cstatus'),plan=planned.querySelector('.cplan'),ic=geom(plan.querySelector('.ic')),txt=geom(plan.querySelector('span'));
 assert(Math.abs((ic.top+ic.height/2)-(txt.top+txt.height/2))<2,'calendar icon and date share a row');
 const expected=getComputedStyle(card(who+'-today')).getPropertyValue(who==='lh'?'--lilh':'--np').trim();
 const probe=document.createElement('span');probe.style.color=expected;root.append(probe);
 assert(getComputedStyle(planned).color===getComputedStyle(probe).color,'planned text uses the profile colour');probe.remove();
 for(const [where,phase] of [['fridge','thawing'],['freezer','freezing']]){
  tap(root.querySelector('[data-foodmode="'+where+':'+phase+'"]'));await wait(260);
  const id=who+(phase==='thawing'?'-thaw':'-freeze'),entry=lotState(id),x=entry.st[0],p=cookedPhase(x),c=card(id),bar=c.querySelector('.cbar');
  assert(c.querySelector('.cstatus').textContent===p.label,'process text uses stored timing');
  assert(Math.abs(parseFloat(bar.style.getPropertyValue('--pct'))-p.pct)<.1,'process bar tracks remaining duration');
  assert(opacity(bar)===1,'active process has a visible bar');
  const colour=getComputedStyle(bar.querySelector('i')).backgroundColor;
  probe.style.color=p.colour;root.append(probe);
  assert(colour===getComputedStyle(probe).color,'process bar uses the storage blue');probe.remove();
  const unrelated=where==='fridge'?card(who+'-today'):null;
  if(unrelated)assert(opacity(unrelated.querySelector('.cbar'))===0,'unrelated expiry bar is hidden in process mode');
  tap(root.querySelector('[data-foodmode="'+where+':'+phase+'"]'));await wait(260);
 }
 // Real dialogs are still connected to the stored batch, with Cancel preserving it.
 c=card(who+'-freeze');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdate]'));await wait(60);
 assert(document.querySelector('#dlg').open&&document.querySelector('[data-dtok]'),'date sheet opens');
 tap(document.querySelector('[data-dtno]'));await wait(320);
 c=card(who+'-freeze');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdisc]'));await wait(60);
 assert(document.querySelector('#dlg').open&&document.querySelector('[data-mvok]'),'discard sheet opens');
 tap(document.querySelector('[data-mvno]'));await wait(320);
 assert(JSON.stringify(S)===before,'view controls and cancelled dialogs do not modify food, stock or plan');
 checks.push(who);
}
// Real Freeze/To fridge/Discard changes must conserve portions, except an explicit discard.
foodWho='lh';renderShop();
S.food.action={who:'lh',r:'m3',made:todayAbs(),mk:3,src:null,out:0,stacks:[{w:'fridge',p:2,since:todayAbs(),th:false}]};renderFood();
let c=card('action');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-ffrz]'));await wait(50);
tap(document.querySelector('[data-mvok]'));await wait(400);
assert(S.food.action.stacks.reduce((n,x)=>n+x.p,0)===2&&S.food.action.stacks[0].w==='freezer','Freeze moves existing portions');
c=card('action');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fthaw]'));await wait(50);
tap(document.querySelector('[data-mvok]'));await wait(400);
assert(S.food.action.stacks.reduce((n,x)=>n+x.p,0)===2&&S.food.action.stacks.some(x=>x.w==='fridge'&&x.p===1),'To fridge moves its selected portion without losing the rest');
c=card('action');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdisc]'));await wait(50);
tap(document.querySelector('[data-mvok]'));await wait(400);
assert(S.food.action.stacks.reduce((n,x)=>n+x.p,0)===1,'discard removes only the selected stack');
c=card('action');tap(c.querySelector('[data-fdots]'));tap(c.querySelector('[data-fdisc]'));await wait(50);
tap(document.querySelector('[data-mvok]'));await wait(400);
assert((S.food.action?.stacks||[]).reduce((n,x)=>n+x.p,0)===0,'the remaining portion needs its own confirmed discard');
// Unfreezable spare portions retain their original Add to meal action.
c=card('lh-spare');tap(c.querySelector('[data-fdots]'));assert(c.querySelector('[data-fadd]'),'unfreezable spares can be placed');
const foodBefore=JSON.stringify(S.food);tap(c.querySelector('[data-fadd]'));await wait(60);
assert(current==='lilh'&&document.querySelector('[data-placeno]'),'Add to meal opens placement');
tap(document.querySelector('[data-placeno]'));await wait(60);assert(JSON.stringify(S.food)===foodBefore,'cancelled placement preserves food');
go('shop');foodWho='lh';shopView='cooked';renderShop();
// Expired freezer food stays red and is not an amber unassigned portion.
const expired={who:'lh',r:'m3',made:todayAbs()-31,mk:2,src:null,out:0,stacks:[{w:'freezer',p:1,since:todayAbs()-31}]};S.food.expired=expired;renderFood();
assert(card('expired').querySelector('.has-bad')&&!card('expired').querySelector('.has-warning'),'expired freezer food remains red');
assert(getComputedStyle(card('expired').querySelector('.row')).getPropertyValue('--rw').trim()==='1.5px','red outline remains visible');
assert(!cookedPhase({w:'freezer',at:Date.now()-7*3600000,h:6}),'completed freezing has no process badge');
assert(!cookedPhase({w:'fridge',th:true,at:Date.now()-8*3600000,h:7}),'completed thawing has no process badge');
// A minute refresh can complete a process without exposing its bar through an open menu.
foodModes['lh:freezer']='freezing';renderFood();tap(card('lh-freeze').querySelector('[data-fdots]'));await wait(160);
const foodAtStart=JSON.stringify(S.food),BaseDate=Date,offset=7*3600000;
window.Date=class extends BaseDate{constructor(...a){super(...(a.length?a:[BaseDate.now()+offset]))}static now(){return BaseDate.now()+offset}};
dateTick();await wait(100);
assert(!root.querySelector('[data-foodmode="freezer:freezing"]')&&foodModes['lh:freezer']==='details','completed process resets its text mode');
assert(card('lh-freeze').classList.contains('open')&&opacity(card('lh-freeze').querySelector('.cbar'))===0,'process completion preserves the hidden bar');
assert(JSON.stringify(S.food)===foodAtStart,'process time refresh does not rewrite food records');
window.Date=BaseDate;closeFoodActions(true);renderFood();
return {version:NPH_V,profiles:checks,textAlignedSymmetricBars:true,animatedBarHiding:true,nativeActions:true,assignmentOnlyAmber:true,processTimingAndColours:true,dialogsAndPlacement:true,portionsConserved:true,expiredFoodRed:true};
