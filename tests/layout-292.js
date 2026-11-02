const p=PLANNERS.lh,t=p._dbg.todayN(),n=t+2,assert=(v,m)=>{if(!v)throw Error(m)};go('lilh');document.querySelector('#page-lilh').click();
S.lh['b-'+n]={v:'b1'};S.lh['is-b'+n]={r:'b1',m:{banana:'pear',milk:'-','+pb':1,'+yoghurt':1}};p.render();
document.querySelector('#page-lilh .day[data-n="'+n+'"] [data-dswap]').click();
let meal=document.querySelector('#page-lilh .day[data-n="'+n+'"] .meal[data-r="b1"]'),line=meal.querySelector('em');
assert(line.scrollHeight<=line.clientHeight+1&&line.scrollWidth<=line.clientWidth+1,'all ingredient changes fit without truncation');assert(line.querySelectorAll('[data-change]').length===4,'four changes visible');
p.openR('b3');const h=document.querySelector('.serving-head');assert(h&&h.contains(document.querySelector('.serving-intro')),'reminder inside serving header');
document.querySelector('#dlg').scrollTop=h.offsetTop-120;
assert(document.querySelector('#card').scrollWidth<=document.querySelector('#card').clientWidth+1,'serving header fits phone');
return {width:innerWidth,allChangesVisible:true,servingReminderGrouped:true};
