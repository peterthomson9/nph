const assert=(v,m)=>{if(!v)throw Error(m)};
const close=()=>{if($('dlg').open)$('dlg').close()};
for(const [who,p,r,main] of [['pn',PN,'avoeggs','beefstew'],['lh',LH,'b12','s24']]){
 const page=who==='pn'?'np':'lilh',n=p._dbg.todayN()+2;
 go(page);finishPageMotion();p.render();
 const move=(key,slot)=>{
  document.querySelector('#page-'+page+' .rbtn[data-r="'+key+'"]').click();
  const select=$('card').querySelector('[data-recipe-category]');
  assert(select,'recipe library dropdown');
  select.value=slot;select.dispatchEvent(new Event('change',{bubbles:true}));close();p.render();
 };
 move(r,'L');move(main,'B');
 assert(!document.querySelector('#'+who+'-shelf-bf [data-r="'+r+'"]')&&document.querySelector('#'+who+'-shelf-lunch [data-r="'+r+'"]'),'recipe moves shelves');
 for(const order of ['BLD','DLB']){
  S[who]['o-'+n]={v:order};
  for(const sl of ['B','L','D'])S[who][sl==='B'?'b-'+n:'x-'+sl+n]={v:'__skip'};
  for(let pos=0;pos<3;pos++){
   p.showDay(n,true,true);p.render();
   document.querySelector('#page-'+page+' .day[data-n="'+n+'"] .grp[data-pos="'+pos+'"] [data-pk]').click();
   const choices=k=>$('card').querySelector('.optrow [data-pick="'+k+'"],.optrow [data-preview="'+k+'"]:not([data-fz])');
   assert(!!choices(r)===(pos===1)&&!!choices(main)===(pos===0),who+' '+order+' wrong picker category '+pos);
   close();
  }
 }
 assert(p.R[r].t==='bf'&&p.R[r].max===1,'category preserves original recipe and portions');
}
return {profiles:2,libraryAndReorderedPickers:true};
