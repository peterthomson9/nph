const p=PLANNERS.lh,d=p._dbg,from=d.todayN()+1;
return {version:NPH_V,recipes:p.R,ingredients:p.cfg.ING,shared:LH_SHARE,rotation:Array.from({length:28},(_,i)=>{const n=from+i;return {date:fmtAbs(d.absOf(n),{day:'numeric',month:'short'}),n,B:d.bfAt(n),L:d.valAt('L',n),D:d.valAt('D',n)}})};
