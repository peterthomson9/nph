// Disposable browser fixtures only; never load these into phone data.
materialiseFood0=()=>false;
S.food={};S.lh={};S.pn={};S.stock={};S.items={};SHNEED.lh=null;SHNEED.pn=null;
const nowDay=todayAbs();
for(const who of ['lh','pn']){
 const P=PLANNERS[who],t=P._dbg.todayN(),per=P.cfg.perDay;
 const rToday=who==='lh'?'s12':'beefstew',rSpare=who==='lh'?'s15':'frittata',rThaw=who==='lh'?'s14':'beefstew',rFreeze=who==='lh'?'m3':'beefstew';
 S.food[who+'-today']={who,r:rToday,made:nowDay-(who==='lh'?1:2),mk:2*per,out:0,src:null,stacks:[{w:'fridge',p:per,since:nowDay-(who==='lh'?1:2),th:false}]};
 S.food[who+'-spare']={who,r:rSpare,made:nowDay,mk:2*per,out:0,src:null,stacks:[{w:'fridge',p:per,since:nowDay,th:false}]};
 S.food[who+'-thaw']={who,r:rThaw,made:nowDay-5,mk:2*per,out:0,src:null,stacks:[{w:'fridge',p:per,since:nowDay,th:true,at:Date.now()-(who==='lh'?5:8)*3600000,h:thawHours(per,who)}]};
 S.food[who+'-freeze']={who,r:rFreeze,made:nowDay,mk:3,out:0,src:null,stacks:[{w:'freezer',p:2,since:nowDay,th:false,at:Date.now()-2*3600000,h:freezeHours(2)}]};
 S[who]['x-D'+t]={v:rToday};S[who]['fz-mD'+t]={f:who+'-today',p:per,w:'fridge'};
 S[who]['x-L'+t]={v:rThaw};S[who]['fz-mL'+t]={f:who+'-thaw',p:per,w:'fridge'};
 S[who]['x-L'+(t+1)]={v:rFreeze};S[who]['fz-mL'+(t+1)]={f:who+'-freeze',p:per,w:'freezer'};
}
shopView='cooked';foodWho='lh';go('shop');
