const assert=(v,m)=>{if(!v)throw Error(m)},report={base:0,swaps:0,omissions:0,additions:0};
const text=()=>document.querySelector('.steps').textContent;
const open=(p,r,sm={})=>{const who=p===PLANNERS.lh?'lh':'pn';S[who]['is-recipe-audit']={r,m:sm};p.openR(r,'recipe-audit','Recipe audit');
 const html=document.querySelector('.steps').innerHTML;
 assert(!/undefined|NaN|\{\{|For this ingredient swap/.test(html),who+' '+r+' invalid method');
 assert(document.querySelectorAll('.steps li:not(.gone)').length>0,r+' empty method');return text()};
for(const [who,p] of Object.entries(PLANNERS)){
 const d=p._dbg;
 for(const [r,x] of Object.entries(p.R)){
  if(x.ta)continue;open(p,r);report.base++;
  for(const a of x.need){
   const fam=Object.values(p.cfg.FAM).find(f=>f.includes(a.split('|')[0]))||[];
   const opts=[...fam,...(who==='lh'&&fam.includes('banana')?['pouchfruit']:[])].filter(k=>!a.split('|').includes(k)&&d.swapAllowed(r,a,k));
   for(const target of opts){const t=open(p,r,{[a]:target});assert(!/\bcook until.*Steam/s.test(t),r+' duplicated preparation');report.swaps++}
   if(who==='lh'&&!p.cfg.flexRules.canLeave(r,a,x.need)){
    open(p,r,{[a]:'-'});assert(!document.querySelector('.steps .rmw'),r+' crossed-out word in active step');report.omissions++;
   }
  }
  if(who==='lh')for(const [k] of p.cfg.ING){if(x.need.includes(k)||!p.cfg.flexRules.canAdd(r,k,x.need))continue;
   open(p,r,{['+'+k]:1});assert(document.querySelector('.addst'),r+' missing addition');report.additions++;
  }
 }
 delete S[who]['is-recipe-audit'];
}
const adult=PLANNERS.pn;
assert(Object.values(adult.R).every(x=>!x.need?.some(k=>/wholemealbread|packetrice/.test(k))),"adult default ingredients stay distinct");
assert(adult._dbg.swapAllowed("avoeggs","bread","wholemealbread"),"sliced bread can replace sourdough");
assert(adult._dbg.swapAllowed("curry","rice","packetrice")&&!adult._dbg.swapAllowed("rizseshus","rice","packetrice")&&!adult._dbg.swapAllowed("toltott","rice","packetrice"),"packet rice only replaces compatible dry rice uses");
assert(open(adult,"curry",{rice:"packetrice"}).includes("pouch instructions"),"packet rice method follows the pouch");
assert(!open(adult,"friedrice",{rice:"packetrice"}).includes("drain"),"fried rice skips dry rice preparation");
const p=PLANNERS.lh;
let t=open(p,'s13',{potato:'sweetpotato',milk:'-'});
assert(document.querySelectorAll('.steps li').length===4,'pictured recipe stays at four steps');
assert(t.indexOf('Steam')<t.indexOf('Add the')&&t.indexOf('Add the')<t.indexOf('Mash'),'steam before mash');
assert(!/milk/.test(t)&&!/For this ingredient swap/.test(t),'removed milk/prep paragraph gone');
assert(document.querySelector('.ingl').textContent.includes('150g sweet potato'),'swap has equivalent weight, not one whole squash');
t=open(p,'b1',{banana:'apple',milk:'-'});
assert(/Peel, core/.test(t)&&/Steam/.test(t)&&/120ml water/.test(t),'apple cooked and missing cereal liquid replaced');
assert(t.indexOf('Steam')<t.indexOf('Mix together'),'apple ready before assembly');
t=open(p,'b10',{apple:'banana'});assert(!/Steam/.test(t)&&/Peel and mash/.test(t),'ripe banana not given apple steaming method');
t=open(p,'b10',{apple:'pouchfruit'});assert(!/Steam|core|Peel/.test(t)&&/no cooking/.test(t),'pouch not peeled or steamed');
t=open(p,'s13',{potato:'sweetpotato',milk:'-','+oats':1});assert(/separately in 60ml water/.test(t),'added oats get own scaled liquid');
// A cooked source owns its ingredients even after global swaps/deletions change.
const x=structuredClone(p.R.s13),facts={v:1,legacy:false,recipe:x,sm:{potato:'sweetpotato',milk:'-'},portions:2,method:'Steamer & hob',products:{}};
S.food.recipeaudit={who:'lh',r:'s13',made:todayAbs(),mk:2,src:null,stacks:[{w:'fridge',p:2,since:todayAbs(),th:false}],facts};
const before=JSON.stringify(S.food.recipeaudit);S.lh['rs-s13']={m:{potato:'carrot'}};S.items['pn-sweetpotato']={gone:true};
p.openR('s13','@lot:recipeaudit','Source',false,false,null,'stored');
assert(/sweet potato/.test(text())&&!/measured milk/.test(text()),'source swaps and omission retained');
assert(JSON.stringify(S.food.recipeaudit)===before,'opening recipe never rewrites batch facts');
delete S.food.recipeaudit;delete S.lh['rs-s13'];delete S.items['pn-sweetpotato'];
assert(PLANNERS.pn._dbg.swapAllowed('beefstew','beef','chthigh'),'slow cooker meat swap supported');
assert(!PLANNERS.pn._dbg.swapAllowed('stirfry','chbreast','beef'),'stewing beef not offered in quick stir fry');
assert(!PLANNERS.pn._dbg.swapAllowed('bananabread','banana','kiwi'),'baking binder not swapped for kiwi');
assert(!PLANNERS.pn._dbg.swapAllowed('lencse','lentils','beans'),'dried lentils not swapped for canned beans');
t=open(PLANNERS.pn,'beefstew',{beef:'chthigh'});assert(/6 hours/.test(t)&&!/8 hours/.test(t),'slow cooker timing follows chicken');
assert(document.querySelector('.facts').textContent.includes('About 6 hours'),'time header follows swapped meat');
PLANNERS.pn.factClick(document.querySelector('[data-dd="m"]'));PLANNERS.pn.factClick(document.querySelector('[data-mopt="Hob"]'));
assert(/1 hour/.test(text())&&!/6 hours|slow cooker/i.test(text()),'selected hob method replaces slow cooker instructions');
t=open(PLANNERS.pn,'chpasta');
PLANNERS.pn.factClick(document.querySelector('[data-dd="m"]'));PLANNERS.pn.factClick(document.querySelector('[data-mopt="Hob + oven"]'));
assert(/Fry the chicken 8 min/.test(text())&&/200°C/.test(text())&&!/180°C/.test(text()),'oven adaptation leaves hob timings alone');
t=open(PLANNERS.pn,'lasagne',{mozzarella:'cheddar'});
assert(/250g cheddar/.test(document.querySelector('.ingl').textContent),'cheddar measured by weight, not balls');
t=open(p,'b7',{apple:'banana',blackberry:'banana'});
assert((t.match(/Peel and mash/g)||[]).length===1,'same replacement fruit prepared once');
document.querySelector('#dlg').close();
return {version:NPH_V,...report,picturedRecipe:true,fruitPreparation:true,sourceFactsUnchanged:true};
