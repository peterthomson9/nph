const assert=(v,m)=>{if(!v)throw Error(m)},results=[];
for(const [id,p] of Object.entries(PLANNERS)){
 const root=document.querySelector('#page-'+(id==='pn'?'np':'lilh')),n=p._dbg.todayN()+2,r=p._dbg.bfAt(n),ik='b'+n;
 go(id==='pn'?'np':'lilh');S[id]['is-'+ik]={r,m:id==='lh'?{spinach:'carrot',banana:'pear'}:{}};
 // Use a fixed breakfast so both the badge and normal meal Swap action are present.
 if(id==='lh'){S.lh['b-'+n]={v:'b1'};S.lh['is-'+ik]={r:'b1',m:{banana:'pear'}}}
 else {S.pn['x-L'+n]={v:'beefstew'};S.pn['is-xL'+n]={r:'beefstew',m:{beef:'chbreast'}}}
 p.render();let day=root.querySelector('.day[data-n="'+n+'"]'),badge=day.querySelector('[data-dswap]');
 assert(badge,id+' swap badge present');const colour=getComputedStyle(badge).color;
 day.querySelector('.mdots').click();await new Promise(r=>setTimeout(r,200));day=root.querySelector('.day[data-n="'+n+'"]');
 const action=[...day.querySelectorAll('.edbtn')].find(x=>x.textContent==='Swap');assert(action,id+' inline Swap present');
 assert(getComputedStyle(action).color===colour,id+' normal Swap matches top badge green');
 assert(![...day.querySelectorAll('.edbtn')].some(b=>b.scrollWidth>b.clientWidth+1),'inline actions fit');
 assert(document.documentElement.scrollWidth<=innerWidth+1,'no horizontal page overflow');
 action.focus();assert(getComputedStyle(action).outlineStyle!=='none','keyboard focus visible');
 p.closeEd();await new Promise(r=>setTimeout(r,200));badge=day.querySelector('[data-dswap]');badge.click();
 const changes=root.querySelector('.day[data-n="'+n+'"] [data-change="swap"]');assert(changes,'expanded swap text exists');
 assert(getComputedStyle(changes).color===colour,'expanded swap text matches green');
 results.push({planner:id,colour});
 if(id==='lh'){p.focusDay(n);root.querySelector('.day[data-n="'+n+'"] .mdots').click()}
}
return {width:innerWidth,results,matched:true,actionsFit:true,focusVisible:true};
