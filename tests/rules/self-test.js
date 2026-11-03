(()=>{
 const C=NPH_RULE_CHECKER,base=C.capture({horizon:0}),assert=(x,m)=>{if(!x)throw Error(m)},clone=x=>JSON.parse(JSON.stringify(x)),tests=[];
 assert(C.audit(base).ok,'baseline fails before oracle self-test');const fid=Object.keys(base.observed.lots).find(k=>base.observed.states[k]?.uses.length),stack=base.observed.states[fid];assert(fid,'baseline must include batch allocations');
 const mutation=(name,rule,edit)=>{const data=clone(base),before=JSON.stringify(data);edit(data);assert(before!==JSON.stringify(data),'mutation was ineffective: '+name);const frozen=JSON.stringify(data),r=C.audit(data);assert(r.errors.some(e=>e.rule===rule),name+' was not detected: '+JSON.stringify(r.errors));assert(JSON.stringify(data)===frozen,'audit mutated '+name);tests.push(name)};
 mutation('negative portions','C11',x=>x.observed.lots[fid].stacks[0].p=-1);
 mutation('incorrect expiry','C16',x=>x.observed.states[fid].st[0].exp++);
 mutation('portion created during allocation','C11',x=>x.observed.states[fid].uses[0].alloc[0].q++);
 mutation('incorrect readiness','C17',x=>x.observed.states[fid].uses[0].notThawed=!x.observed.states[fid].uses[0].notThawed);
 mutation('incorrect assigned expiry','C17',x=>x.observed.states[fid].uses[0].late=!x.observed.states[fid].uses[0].late);
 mutation('batch total mismatch','C22',x=>x.observed.states[fid].now++);
 mutation('dangling current source','C22',x=>x.state.pn['fz-mL'+(PLANNERS.pn._dbg.todayN()+1)]={f:'not-a-real-source',p:2,w:'fridge'});
 mutation('fresh recipe became leftover','C8',x=>{const m=x.observed.meals.pn[0];m.r='avoeggs';m.cls='left';delete x.state.pn['fz-m'+m.slot+m.n]});
 mutation('future process timestamp','C18',x=>x.observed.lots[fid].stacks[0].at=x.clock.ms+86400000);
 const timed=clone(base),lot={who:'pn',r:'beefstew',made:base.clock.day-5,mk:2,stacks:[{w:'fridge',p:1,since:base.clock.day-1,th:true,at:base.clock.ms-25*3600000,h:7}]};timed.state.pn={};timed.state.lh={};timed.state.food={timed:lot};timed.observed.lots={timed:lot};timed.observed.meals={pn:[],lh:[]};timed.observed.states={timed:{now:1,free:1,uses:[],st:[{...lot.stacks[0],exp:base.clock.day,now:1,free:1,past:0,fut:0}],cooked:[{expired:false}]}};assert(C.audit(timed).errors.some(e=>e.rule==='C20'),'exact 24h expiry mutation was missed');tests.push('exact thaw deadline independently detected');
 const legacy=clone(base);delete legacy.observed.lots[fid].facts;assert(C.audit(legacy).ok,'legacy batch without recorded facts must remain supported');tests.push('legacy facts remain optional');
 const old=clone(base);old.state.pn['fz-mL'+(PLANNERS.pn._dbg.todayN()-10)]={f:'archived-source',p:2,w:'fridge'};assert(C.audit(old).ok&&C.audit(old).warnings.some(e=>e.rule==='C22.history'),'archived historical reference is informational, not an active allocation');tests.push('archived references remain historical');
 const past=PLANNERS.pn._dbg.todayN()-1,before=clone(base);before.state.pn['is-xD'+past]={r:'beefstew',m:{beef:'chthigh'}};const after=clone(before);delete after.state.pn['is-xD'+past];assert(C.transition(before,after,{kind:'advance'}).some(e=>e.rule==='C3'),'actual dated ingredient history mutation was missed');tests.push('dated history mutation detected');
 return {passed:true,mutationChecks:tests};
})();
