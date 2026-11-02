const assert=(v,m)=>{if(!v)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,100));
const out={checks:[]};
for(const [id,p] of Object.entries(PLANNERS)){
 const d=p._dbg,t=d.todayN();out[id]={expectedLots:Object.keys(p.plannedLots()).length};
 const sl='L',n=t+1,r=d.valAt(sl,n),ik=d.mainInfo(sl,n).ik;
 p.openR(r,ik,'test',false,false,sl+':'+n,'Cooked test');
 assert(!document.querySelector('#card [data-sub]'),id+' read-only swaps');
 const leaf=document.querySelector('[data-pcat="nut"]'),cal=document.querySelector('[data-pcat="plan"]');
 if(leaf&&cal){leaf.click();cal.click();assert(leaf.getAttribute('aria-expanded')==='true'&&cal.getAttribute('aria-expanded')==='true','pill groups independent')}
 document.querySelector('#dlg').close();await wait();
}
const p=PLANNERS.pn,d=p._dbg,t=d.todayN(),sl='D',r='beefstew';
S.pn['x-D'+(t-1)]={v:'stirfry'};S.pn['x-D'+t]={v:r};S.pn['is-xD'+t]={r,m:{beef:'chbreast'}};S.pn['dy-xD'+t]={r,v:2};
S.pn['x-D'+(t+1)]={v:r};S.food.test={who:'pn',r,src:'D'+t,made:d.absOf(t),mk:4,stacks:[{w:'fridge',p:2,since:d.absOf(t)}]};S.pn['fz-mD'+(t+1)]={f:'test',w:'fridge',p:2};
p.render();let toggle=document.querySelector(`#page-np .day[data-n="${t}"] [data-dswap]`);assert(toggle,'day swap button exists');toggle.click();assert([...document.querySelectorAll(`#page-np .day[data-n="${t}"] .swshow em`)].some(e=>e.textContent.toLowerCase().includes('chicken')),'day toggle displays green swaps');toggle=document.querySelector(`#page-np .day[data-n="${t}"] [data-dswap]`);toggle.click();
p.openR(r,'xD'+t,'test',false,false,'D:'+(t+1),'Cooked test');
assert(document.querySelector('#card h2').textContent.toLowerCase().includes('chicken'),'renamed recipe');
assert(document.querySelector('#card').textContent.includes('2 days'),'source portion size');
document.querySelector('#dlg').close();await wait();
go('np');const before=JSON.stringify(S);p.openRecalc('all');assert(document.querySelector('[data-recok]'),'reshuffle opens');
assert(before===JSON.stringify(S),'reshuffle preview must not save or create food');document.querySelector('#dlg').close();await wait();
for(const p0 of Object.values(PLANNERS))for(const fam of Object.values(p0.cfg.FAM)){
 assert(!(fam.includes('orzo')&&(fam.includes('weetabix')||fam.includes('oats'))),'orzo breakfast swap');
 assert(!(fam.includes('noodles')&&fam.includes('wedges')),'noodles wedges swap');
}
const h=PLANNERS.lh,ht=h._dbg.todayN();S.lh['x-L'+ht]={v:'s11'};S.lh['is-xL'+ht]={r:'s11',m:{butternut:'carrot'}};S.lh['x-L'+(ht+1)]={v:'s11'};
h.render();const hik=h._dbg.mainInfo('L',ht).ik;
h.openR('s11',hik,'cook day',false,false,'L:'+ht);const cookTags=[...document.querySelectorAll('[data-pin="nut"]')].map(x=>x.textContent).join('|');document.querySelector('#dlg').close();await wait();
h.openR('s11','xL'+(ht+1),'leftovers',false,false,'L:'+(ht+1),'Cooked test');
assert([...document.querySelectorAll('[data-pin="nut"]')].map(x=>x.textContent).join('|')===cookTags,'leftover nutrient/gas tags match source');
assert(document.querySelector('#card h2').textContent.toLowerCase().includes('carrot'),'leftover ingredient title: '+document.querySelector('#card h2').textContent+' source '+hik);
assert(!document.querySelector('.digestion-review'),'read-only recipe has no digestion explainer');
document.querySelector('[data-pcat="nut"]').click();document.querySelector('[data-pcat="plan"]')?.click();
out.checks=['read-only source recipe','source portions','ingredient names','independent pill groups','preview leaves data unchanged','substitution outliers','leftover nutrition and gas-makers'];
return out;
