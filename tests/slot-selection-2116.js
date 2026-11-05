const assert=(v,m)=>{if(!v)throw Error(m)},close=()=>{if($('dlg').open)$('dlg').close()},report=[];
for(const [who,P] of Object.entries(PLANNERS)){
 const n=P._dbg.todayN()+2,page=who==='pn'?'np':'lilh';go(page);finishPageMotion();
 const clear=()=>{S[who]={};S.food={};S.stock={};};
 const openAt=pos=>{
  P.showDay(n,true,true);P.render();
  const btn=document.querySelector('#page-'+page+' .day[data-n="'+n+'"] .grp[data-pos="'+pos+'"] [data-pk]');
  assert(btn,'slot button');btn.click();
  return {header:$('card').querySelector('header').textContent,keys:[...$('card').querySelectorAll('[data-pick],[data-preview]')].filter(b=>!b.closest('.stg')).map(b=>b.dataset.pick||b.dataset.preview).filter(k=>P.R[k]&&!P.R[k].ta)};
 };
 for(const order of ['BLD','BDL','LBD','LDB','DBL','DLB']){
  clear();S[who]['o-'+n]={v:order};
  for(const s of ['B','L','D'])S[who][s==='B'?'b-'+n:'x-'+s+n]={v:'__skip'};
  for(let pos=0;pos<3;pos++){
   const {header,keys}=openAt(pos),word=['breakfast','lunch','dinner'][pos];
   assert(header.startsWith('Add '+word),who+' '+order+' '+pos+' header: '+header);
   assert(keys.length>0,'choices exist');
   if(pos===0)assert(keys.every(k=>P.R[k].t==='bf'),who+' '+order+' breakfast inherited main choices '+keys.filter(k=>P.R[k].t!=='bf').join(','));
   if(pos===2)assert(keys.every(k=>P.R[k].t!=='bf'),'dinner inherited breakfast/light-lunch choices');
   close();
  }
  // Selecting a new breakfast changes precisely the card displayed at breakfast.
  const {keys}=openAt(0),chosen=keys.find(k=>!$('card').querySelector('[data-pick="'+k+'"]')?.disabled)||keys[0];
  P.applyPick(chosen,{quiet:true});P.render();
  const r=document.querySelector('#page-'+page+' .day[data-n="'+n+'"] .grp[data-pos="0"] [data-r]');
  assert(r?.dataset.r===chosen,'choice was written to another visible slot');
  assert(P.R[chosen].max===1,'fresh breakfast became a batch');
  report.push({who,order,correct:true});
 }
 // Actual repeated swaps preserve card identity, ingredients and named storage sources.
 clear();S[who]['b-'+n]={v:who==='pn'?'pbtoast':'b1'};S[who]['x-L'+n]={v:who==='pn'?'beefstew':'s13'};S[who]['x-D'+n]={v:who==='pn'?'curry':'s6'};
 const source=who==='pn'?'beefstew':'s13',sm=who==='pn'?{beef:'chthigh'}:{potato:'sweetpotato'};
 S[who]['is-xL'+n]={r:source,m:sm};
 const before=JSON.stringify(S[who]['is-xL'+n]);
 S.food['slot-source']={who,r:source,made:todayAbs(),mk:4,src:null,stacks:[{w:'fridge',p:4,since:todayAbs(),th:false}],facts:{v:1,legacy:false,sm,recipe:structuredClone(P.R[source]),portions:4,products:{},method:'Hob'}};
 S[who]['fz-mL'+n]={f:'slot-source',w:'fridge',p:who==='pn'?2:1};
 const lotBefore=JSON.stringify(S.food['slot-source']),refBefore=JSON.stringify(S[who]['fz-mL'+n]);
 for(const [a,b] of [[1,2],[0,2],[0,1],[1,2],[0,2]]){
  P.swapPos(n,a,b);P.render();
  for(let pos=0;pos<3;pos++){const data=openAt(pos);assert(data.header.toLowerCase().includes(['breakfast','lunch','dinner'][pos]),'repeated move menu mismatch');close()}
  assert(JSON.stringify(S[who]['is-xL'+n])===before,'drag rewrote ingredient source');
  assert(JSON.stringify(S.food['slot-source'])===lotBefore&&JSON.stringify(S[who]['fz-mL'+n])===refBefore,'drag changed the named lot or its reservation');
 }
 if(P.cfg.split){
  for(const order of ['BLD','DLB','LBD']){
   S[who]['o-'+n]={v:order};const carrier=order[0];S[who]['sp-'+carrier+n]={n:carrier==='B'?'pbtoast':'creampasta'};P.render();
   const btn=document.createElement('button');btn.dataset.pk='n:'+carrier+':'+n;document.getElementById('page-'+page).append(btn);btn.click();
   const keys=[...$('card').querySelectorAll('[data-pick]')].map(b=>b.dataset.pick).filter(k=>P.R[k]&&!P.R[k].ta);
   assert(keys.length&&keys.every(k=>P.R[k].t==='bf'),'split breakfast choices inherited source slot');close();btn.remove();
  }
 }
 clear();
}
return {version:NPH_V,permutations:report.length,repeatedSwaps:true,splitBreakfast:true,actualSelectionsStayInClickedSlot:true,sourceIngredientRecordsUnchanged:true};
