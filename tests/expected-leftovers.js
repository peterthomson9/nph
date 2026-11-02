const assert=(v,m)=>{if(!v)throw Error(m)};
const p=PLANNERS.pn,t=p._dbg.todayN(),r='beefstew';
S.pn['x-L'+t]={v:r};S.pn['dy-xL'+t]={r,v:3};
S.pn['x-L'+(t+1)]={v:'__skip'};S.pn['x-L'+(t+2)]={v:'__skip'};
// The source is a real cook event today; no food is saved before 1pm.
const entry=Object.entries(p.plannedLots()).find(([,l])=>l.src==='L'+t);
assert(entry,'expected batch exists before cooking');const [fid,lot]=entry;
assert(!S.food[fid],'expected batch must not be in Stock');
const before=lotState(fid).now;assert(before===4,'six made minus two eaten gives four expected leftovers');
S.pn['x-D'+(t+1)]={v:r};S.pn['fz-mD'+(t+1)]={f:fid,w:'fridge',p:2,planned:true};p.render();
assert(lotState(fid).uses.some(u=>u.slot==='D'&&u.abs===p._dbg.absOf(t+1)),'expected leftovers can cross to a later dinner');
const RD=Date,offset=5*3600000;window.Date=class extends RD{constructor(...a){super(...(a.length?a:[RD.now()+offset]))}static now(){return RD.now()+offset}};
materialiseFood();p.render();
assert(S.food[fid]&&!S.food[fid].planned,'same batch becomes actual at cooking time');
assert(lotState(fid).now===before,'cooking transition preserves portions');
assert(lotState(fid).uses.some(u=>u.slot==='D'&&u.abs===p._dbg.absOf(t+1)),'planned use survives cooking');
return {expectedPortions:before,actualPortions:lotState(fid).now,plannedUsePreserved:true};
