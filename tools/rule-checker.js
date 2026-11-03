/* Development-only, read-only rule checker. Load into a disposable local app.
   audit() is a pure oracle over a detached snapshot; capture() is its adapter. */
(()=>{
  const DAY=86400000,copy=x=>JSON.parse(JSON.stringify(x)),sum=(xs,f=x=>x)=>xs.reduce((n,x)=>n+f(x),0),integer=n=>Number.isInteger(n)&&n>=0;
  const HOURS={pn:{B:10,L:13,D:19},lh:{B:7.5,L:10.5,D:15}},MEALS={pn:{B:8,L:12,D:18},lh:{B:8.5,L:11.5,D:16}};
  const at=(abs,h)=>{const d=new Date(abs*DAY);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),Math.floor(h),Math.round(h%1*60)).getTime()};
  const expiry=(lot,s,profile)=>s.w==='freezer'?s.since+(lot.who==='lh'?30:90):s.th?s.since+1:lot.made+(lot.who==='lh'||profile.recipes[lot.r]?.ta||profile.rice.includes(lot.r)?1:2);
  const thawReady=s=>s.w==='fridge'&&s.th&&s.at&&s.h?s.at+s.h*3600000:0;
  const deadline=(lot,s,profile)=>s.w==='fridge'&&s.th&&s.at?s.at+DAY:at(expiry(lot,s,profile)+1,0);
  const inDate=(lot,s,profile,day,slot)=>day<=expiry(lot,s,profile)&&at(day,MEALS[lot.who][slot])<deadline(lot,s,profile);
  const portionTotal=lot=>sum(lot?.stacks||[],s=>s.p);
  function audit(input){const errors=[],warnings=[],{state,profiles,clock,observed}=input;
    const add=(rule,path,message,detail)=>errors.push({rule,path,message,...(detail?{detail}: {})});
    const warn=(rule,path,message)=>warnings.push({rule,path,message});
    const mealOwners=new Map();
    for(const c of ['stock','custom','pn','lh','food','notes','items','favs'])if(!state[c]||typeof state[c]!=='object'||Array.isArray(state[c]))add('save',c,'Missing or invalid household collection');
    for(const [fid,lot] of Object.entries(observed.lots)){
      const path='food/'+fid,P=profiles[lot.who];if(!P||!P.recipes[lot.r]){add('C5',path,'Unknown profile or recipe');continue}
      if(!integer(lot.mk)||!Number.isInteger(lot.made)||!Array.isArray(lot.stacks)){add('C11',path,'Invalid batch size/date/stacks');continue}
      if(lot.facts&&lot.facts.portions!==lot.mk)add('C22',path,'Recorded batch size disagrees with batch facts');
      if(portionTotal(lot)>lot.mk)add('C11',path,'Stored portions exceed original cooking');
      const live=observed.states[fid];if(!live){add('C22',path,'Batch has no derived state');continue}
      const remaining=lot.stacks.map(s=>s.p),past=lot.stacks.map(()=>0),future=lot.stacks.map(()=>0);
      lot.stacks.forEach((s,i)=>{const sp=path+'/stacks/'+i;if(!Number.isInteger(s.p)||s.p<=0||!['fridge','freezer'].includes(s.w)||!Number.isInteger(s.since)){add('C11',sp,'Non-positive/non-integer portions or invalid storage');return}
        if(s.th&&s.w==='freezer')add('C16',sp,'Thawed food marked as refrozen');
        if(s.at!=null&&(!Number.isFinite(s.at)||s.at>clock.ms+1000))add('C18',sp,'Invalid/future process timestamp');
        if(s.h!=null&&(!Number.isFinite(s.h)||s.h<=0||s.h>24))add('C18',sp,'Invalid process duration');
        const actual=live.st[i];if(!actual||actual.exp!==expiry(lot,s,P))add('C16',sp,'Eat-by date disagrees with independent storage rules');
      });
      const ordered=live.uses.slice().sort((a,b)=>a.abs-b.abs||MEALS[lot.who][a.slot]-MEALS[lot.who][b.slot]);
      for(const u of ordered){const up=path+'/uses/'+u.id,key=lot.who+':'+u.id;
        if(mealOwners.has(key)&&mealOwners.get(key)!==fid)add('C5',up,'One meal allocated to two named batches');mealOwners.set(key,fid);
        if(!Number.isInteger(u.p)||u.p<=0||!Number.isInteger(u.abs)||!Object.hasOwn(HOURS[lot.who],u.slot)){add('C11',up,'Invalid meal quantity/date/slot');continue}
        const due=at(u.abs,MEALS[lot.who][u.slot]),isPast=u.abs<clock.day||u.abs===clock.day&&clock.hour>=HOURS[lot.who][u.slot];
        const eligible=lot.stacks.map((s,i)=>({s,i,exp:expiry(lot,s,P)})).filter(x=>remaining[x.i]>0);
        const rank=x=>{const validFridge=x.s.w==='fridge'&&inDate(lot,x.s,P,u.abs,u.slot);
          if(u.w==='freezer')return validFridge&&x.s.th?0:x.s.w==='freezer'?1:validFridge?2:3;
          return validFridge?(thawReady(x.s)>due?.5:0):x.s.w==='freezer'?1:2};
        eligible.sort((a,b)=>rank(a)-rank(b)||a.exp-b.exp);
        let need=u.p;const allocations=[];for(const x of eligible){if(!need)break;const q=Math.min(need,remaining[x.i]);need-=q;remaining[x.i]-=q;(isPast?past:future)[x.i]+=q;allocations.push({i:x.i,q,w:x.s.w})}
        if(sum(u.alloc,a=>a.q)+(u.short||0)!==u.p)add('C11',up,'Allocated portions plus shortage do not equal requested portions');
        if(JSON.stringify(u.alloc)!==JSON.stringify(allocations))add('C14',up,'Allocation disagrees with independent meal-time/fridge-first ordering',{expected:allocations,actual:u.alloc});
        if(u.short!==need)add('C15',up,'Incorrect portion shortage');
        const late=allocations.some(a=>!inDate(lot,lot.stacks[a.i],P,u.abs,u.slot)),notReady=allocations.some(a=>thawReady(lot.stacks[a.i])>due);
        if(!!u.late!==late)add('C17',up,'Incorrect expiry flag for assigned meal');
        if(!!u.notThawed!==notReady)add('C17',up,'Incorrect thaw readiness for assigned meal');
        if(!isPast&&(late||need||notReady||u.noTime||u.unfrozen))warn('C17',up,'Manual/planned meal needs attention');
        if(!isPast&&u.abs<lot.made)add('C17',up,'Meal precedes its named cooking');
      }
      live.st.forEach((s,i)=>{if(s.now!==lot.stacks[i].p-past[i]||s.free!==remaining[i]||s.past!==past[i]||s.fut!==future[i])add('C11',path+'/stacks/'+i,'Stored/eaten/reserved/free quantities disagree');
        if(!integer(s.now)||!integer(s.free)||s.free>s.now)add('C11',path+'/stacks/'+i,'Negative/impossible remaining portions');
        if(s.now>0&&clock.ms>=deadline(lot,lot.stacks[i],P))warn('C20',path+'/stacks/'+i,'Expired food retained for explicit discard');
      });
      if(live.now!==sum(live.st,s=>s.now)||live.free!==sum(live.st,s=>s.free))add('C22',path,'Batch totals disagree with stacks');
      if(live.cooked)live.cooked.forEach((c,i)=>{const s=lot.stacks[i];if(c.expired!==(clock.ms>=deadline(lot,s,P)))add('C20',path+'/stacks/'+i,'Cooked expiry presentation disagrees with record')});
      if(lot.auto){const start=Math.min(...lot.auto.stacks.filter(s=>s.w==='freezer'&&s.at).map(s=>s.at+(s.h||6)*3600000));lot.stacks.filter(s=>s.w==='fridge'&&s.th&&s.at&&!lot.auto.stacks.some(old=>JSON.stringify(old)===JSON.stringify(s))).forEach(s=>{if(Number.isFinite(start)&&s.at<start)add('C18',path,'Automatic thaw started before its source food was frozen')})}
    }
    for(const who of ['pn','lh']){
      for(const [k,v] of Object.entries(state[who]||{})){const m=/^fz-([mnp])([BLD])(-?\d+)$/.exec(k);if(!m||!v)continue;const path=who+'/'+k,lot=observed.lots[v.f];
        if(!lot){if(profiles[who].anchor+Number(m[3])<clock.day-3)warn('C22.history',path,'Older completed source has been archived');else add('C22',path,'Stored meal refers to a missing named batch');continue}
        if(lot.who!==who)add('C22',path,'Stored meal uses another profile\'s portions');
        if(!integer(v.p)||v.p<=0)add('C11',path,'Invalid stored meal quantity');
        const use=observed.states[v.f]?.uses.find(u=>u.id===m[1]+':'+m[2]+':'+m[3]);if(!use)add('C5',path,'Stored assignment has no matching meal/use');
      }
      for(const m of observed.meals[who]){const r=profiles[who].recipes[m.r];if(!r)continue;
        if(r.max===1&&!state[who]['fz-m'+m.slot+m.n]&&/left/.test(m.cls))add('C8',who+'/'+m.slot+m.n,'Fresh one-day recipe became implicit leftovers');
      }
    }
    return {ok:!errors.length,errors,warnings,counts:{batches:Object.keys(observed.lots).length,meals:sum(Object.values(observed.meals),a=>a.length)},coverage:['C1/C2 clock and chronology','C5 explicit source identity','C8 max-1 freshness','C11-C15 portion accounting/order','C16 date-based storage limits','C17 readiness/expiry flags','C18 process metadata','C20/C22 Cooked/source agreement']};
  }
  function capture(options={}){const before=JSON.stringify(S),day=todayAbs(),profiles={},lots={},states={},meals={};
    for(const [who,P] of Object.entries(PLANNERS)){profiles[who]={anchor:P.absOf(0),rice:P.cfg.riceDishes||[],recipes:Object.fromEntries(Object.entries(P.R).map(([r,x])=>[r,{max:x.max||null,ta:!!x.ta}]))};Object.assign(lots,P.plannedLots());meals[who]=[];
      const t=P._dbg.todayN(),dates=new Set();for(let n=t-3;n<=t+(options.horizon??14);n++)dates.add(n);
      for(const key of Object.keys(S[who])){const m=/^(?:x-[LD]|fz-[mnp][BLD]|sp-[BLD])(-?\d+)$/.exec(key);if(m)dates.add(+m[1])}
      for(const n of dates)for(const slot of ['L','D']){const m=P._dbg.mainInfo(slot,n);meals[who].push({n,slot,r:m.r,cls:m.cls||'',bad:!!m.bad,warn:!!m.warn})}
    }
    Object.assign(lots,S.food);
    for(const [fid,lot] of Object.entries(lots)){const st=lotState(fid,{lot});if(!st){states[fid]=null;continue}states[fid]={now:st.now,free:st.free,st:st.st,uses:st.uses,cooked:st.st.map(x=>cookedInfo(st,x))}}
    const snap=copy({state:S,profiles,clock:{day,hour:hrNow(),ms:Date.now()},observed:{lots,states,meals}});
    if(before!==JSON.stringify(S))throw Error('Checker adapter mutated household records');return snap;
  }
  function transition(before,after,action){const errors=[],add=(rule,path,message)=>errors.push({rule,path,message});
    if(['move','discard'].includes(action.kind)){const a=before.state.food[action.fid],b=after.state.food[action.fid];if(a){const expected=portionTotal(a)-(action.kind==='discard'?action.q:0),archived=!b&&action.kind==='discard'&&before.observed.states[action.fid]?.now===action.q;if(!archived&&portionTotal(b)!==expected)add('C11','food/'+action.fid,'Storage action created/lost portions');if(b&&JSON.stringify(a.facts)!==JSON.stringify(b.facts))add('C22','food/'+action.fid,'Storage action rewrote cooked ingredients/facts')}}
    if(['advance','replan','stock','move','discard','navigate','preview'].includes(action.kind))for(const who of ['pn','lh'])for(const [key,value] of Object.entries(before.state[who])){const m=/^(?:x-[LD]|b-|sp-[BLD]|o-|is-[xnp][BLD]|dy-[xnp][LD]|mt-[xnp][LD])(-?\d+)$/.exec(key);if(m&&PLANNERS[who].absOf(+m[1])<before.clock.day&&JSON.stringify(value)!==JSON.stringify(after.state[who][key]))add('C3',who+'/'+key,'Automatic/unrelated action rewrote a past meal')}
    return errors;
  }
  window.NPH_RULE_CHECKER={version:1,capture,audit,transition,expiry,portionTotal};
})();
