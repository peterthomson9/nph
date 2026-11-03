const assert=(x,m)=>{if(!x)throw Error(m)},out=[];
for(const [who,P] of Object.entries(PLANNERS)){
 const t=P._dbg.todayN(),a=todayAbs(),r=who==='pn'?'beefstew':'s12';S.food={};S[who]={};SHNEED[who]=null;SHV++;
 // An explicit lunch happens before the same batch's implicit dinner.
 let target=null,source=null;for(let n=t;n>=t-6;n--){S[who]['x-D'+(n-1)]={v:r};S[who]['x-D'+n]={v:r};S[who]['x-D'+(n-2)]={v:'__skip'};const run=P._dbg.runOf('D',n);if(run.s<n){target=n;source=run.s;break}}
 assert(target!==null,'fixture has an implicit dinner leftover track');const made=P.absOf(source);
 S.food.shared={who,r,made,mk:P.perDay*2,src:'D'+source,stacks:[{w:'fridge',p:P.perDay,since:made,th:false}]};S[who]['x-L'+target]={v:r};S[who]['fz-mL'+target]={f:'shared',p:P.perDay,w:'fridge'};
 const prior=P.lotUses('shared').filter(u=>u.n<target).reduce((n,u)=>n+u.p,0);S.food.shared.mk+=prior;S.food.shared.stacks[0].p+=prior;
 const allocation=lotState('shared'),lunch=allocation.uses.find(u=>u.slot==='L'&&u.n===target),dinner=allocation.uses.find(u=>u.slot==='D'&&u.n===target);assert(lunch&&dinner&&lunch.short===0&&dinner.short===P.perDay,'earlier lunch takes portions before later dinner '+who+' '+JSON.stringify({target,source,uses:allocation.uses}));S.food={};S[who]={};SHV++;
 // A freezer date is still an eat-by limit, including future named selections.
 S.food.old={who,r,made:a-110,mk:2,src:null,stacks:[{w:'freezer',p:1,since:a-100,th:false}]};S[who]['x-D'+(t+1)]={v:r};S[who]['fz-mD'+(t+1)]={f:'old',p:1,w:'freezer'};
 const old=lotState('old');assert(old.uses[0].late,'expired freezer assignment must have an expiry flag: '+who);
 P.render();const info=P._dbg.mainInfo('D',t+1);assert(info.bad&&/date/i.test(info.em),'expired freezer meal must show red date warning: '+who);
 // Food cannot have been taken out to thaw before it was frozen.
 S.food={};S[who]={};SHNEED[who]=null;SHV++;
 const hr=new Date().getHours(),frozenAt=Date.now()-2*3600000;
 S.food.sameDay={who,r,made:a,mk:2,src:null,stacks:[{w:'freezer',p:1,since:a,th:false,at:frozenAt,h:1}]};S[who]['x-D'+t]={v:r};S[who]['fz-mD'+t]={f:'sameDay',p:1,w:'freezer'};
 if(hr<cookBy(who,'D')){autoThaw();assert(!S.food.sameDay.stacks.some(s=>s.w==='fridge'&&s.at<frozenAt+3600000),'automatic thaw cannot invent an earlier thaw time: '+who)}
 // Exact 24-hour expiry must not be rounded up to the end of tomorrow.
 S.food={};S[who]={};SHNEED[who]=null;SHV++;
 S.food.timed={who,r,made:a-5,mk:2,src:null,stacks:[{w:'fridge',p:1,since:a-1,th:true,at:Date.now()-25*3600000,h:7}]};
 let state=lotState('timed');assert(state.st[0].expired&&cookedInfo(state,state.st[0]).expired,'thawed food expires after 24 hours, even on the same calendar date');
 const before=JSON.stringify(S.food.timed);openMove('timed',0,'freeze');assert(JSON.stringify(S.food.timed)===before,'expired food cannot be renewed by a storage move');
 S.food.timed.stacks[0].at=Date.now()-23*3600000;S[who]['x-D'+t]={v:r};S[who]['fz-mD'+t]={f:'timed',p:1,w:'fridge'};
 state=lotState('timed');assert(!state.st[0].expired&&state.uses[0].late,'a meal after the exact deadline is flagged before the food expires now');
 P.render();assert(P._dbg.mainInfo('D',t).bad,'day card shows the exact-deadline warning');
 const legacy={...S.food.timed.stacks[0]};delete legacy.at;assert(stackDeadline(S.food.timed,legacy)>Date.now(),'untimed legacy thaw keeps its existing date fallback');
 const dst=Date.parse('2027-03-27T12:00:00Z');assert(stackDeadline(S.food.timed,{w:'fridge',th:true,at:dst,since:a})===dst+86400000,'24 hours stays exact across the UK clock change');
 out.push(who);
}
return {chronologicalPortions:true,freezerExpiry:true,noBackdatedThaw:true,exact24HourExpiry:true,legacyFallback:true,dstDuration:true,profiles:out};
