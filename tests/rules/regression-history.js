const assert=(x,m)=>{if(!x)throw Error(m)},checks=[];
for(const [who,P] of Object.entries(PLANNERS)){
 const t=P._dbg.todayN(),day=todayAbs(),r=who==='pn'?'beefstew':'s12';S.food={};S[who]={};SHNEED[who]=null;SHV++;
 const facts={v:1,legacy:false,ik:null,portions:2,sm:{},products:{},recipe:JSON.parse(JSON.stringify(P.R[r]))};
 S.food.recent={who,r,made:day-10,mk:2,src:null,facts,stacks:[{w:'freezer',p:1,since:day-9,th:false}]};
 S[who]['x-L'+(t-1)]={v:r};S[who]['fz-mL'+(t-1)]={f:'recent',p:1,w:'freezer'};
 const original=JSON.stringify(S.food.recent),meal=JSON.stringify(S[who]['x-L'+(t-1)]);
 assert(lotState('recent').done,'fixture has consumed all stored portions');tidyFood();
 assert(JSON.stringify(S.food.recent)===original,'recent source facts retained after last portion eaten: '+who);
 assert(JSON.stringify(S[who]['x-L'+(t-1)])===meal,'past meal unchanged by cleanup');
 S[who]['fz-mL'+(t+1)]={f:'recent',p:1,w:'freezer',planned:true};S[who]['x-L'+(t+1)]={v:r};P.cleanRefs();
 assert(!S[who]['fz-mL'+(t+1)].planned,'expected reference becomes actual without changing its meal');
 assert(JSON.stringify(S.food.recent)===original,'metadata transition does not rewrite cooked recipe');
 S[who]['x-D'+(t-4)]={v:r};S[who]['fz-mD'+(t-4)]={f:'cancelled-old-source',p:1,w:'fridge',planned:true};
 const past=JSON.stringify(S[who]['x-D'+(t-4)]);P.cleanRefs();assert(JSON.stringify(S[who]['x-D'+(t-4)])===past,'cleanup never resets an old meal override');
 S[who]['x-D'+(t+2)]={v:r};S[who]['fz-mD'+(t+2)]={f:'cancelled-future-source',p:1,w:'fridge',planned:true};P.cleanRefs();assert(!S[who]['fz-mD'+(t+2)]&&!S[who]['x-D'+(t+2)],'future cancelled expected choice still releases its slot');
 checks.push(who);
}
return {recentSourceHistory:true,expectedReferencePromotion:true,pastOverridesPreserved:true,cancelledFutureReleased:true,profiles:checks};
