/* Seeded user-action driver. No real profiles/URLs; Python owns the clock. */
(()=>{
  let rng=1;const choose=xs=>xs.length?xs[Math.floor(random()*xs.length)]:null;
  function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296}
  const pause=()=>new Promise(r=>setTimeout(r,0));
  const close=()=>{for(const P of Object.values(PLANNERS))P.setHu(false);if($('dlg').open)$('dlg').close();finishPageMotion()};
  function next(){const who=choose(['pn','lh']),P=PLANNERS[who],t=P._dbg.todayN(),n=t+Math.floor(random()*8),slot=choose(['B','L','D']);
    const kind=choose(['stock','pick','pick','move','discard','advance','navigate','ingredient','size','replan','undo','split','order','assign']);
    if(kind==='stock'){const key=choose(shopItems().filter(x=>!x.cid))?.key;return {kind,who,key}}
    if(kind==='advance')return {kind,hours:choose([.5,1,2,3,6,12,24])};
    if(kind==='navigate')return {kind,page:choose(['np','lilh','shop'])};
    if(kind==='undo')return {kind,scope:choose(['pn','lh','shop','fpn','flh']),direction:choose(['undo','redo'])};
    if(kind==='move'||kind==='discard'||kind==='assign'){
      const entries=Object.entries(S.food).filter(([,lot])=>lot?.who===who).flatMap(([fid])=>{const s=lotState(fid);return (s?.st||[]).filter(x=>x.now>0).map(x=>({fid,i:x.i,w:x.w,p:x.now,free:x.free,th:x.th,expired:x.expired}))});
      const entry=choose(entries.filter(x=>kind==='discard'||kind==='assign'||x.w==='freezer'||!x.th&&!x.expired));
      if(!entry)return {kind:'stock',who,key:choose(shopItems()).key};return {kind,who,...entry,n,slot};
    }
    return {kind,who,n,slot};
  }
  async function act(a){close();const P=PLANNERS[a.who];let changed=true;
    if(a.kind==='advance'){window.__NPH_TEST_CLOCK+=a.hours*3600000;dateTick();renderAll()}
    else if(a.kind==='stock'){go(a.who==='lh'?'lilh':'np');finishPageMotion();setOut(a.key,!stockOf(a.key).out)}
    else if(a.kind==='navigate'){if(a.page===current)return false;go(a.page,true);finishPageMotion()}
    else if(a.kind==='undo'){if(!HIST[a.scope]?.[a.direction].length)return false;histStep(a.direction,a.scope)}
    else if(a.kind==='move'||a.kind==='discard'){
      go('shop');finishPageMotion();foodWho=a.who;shopView='cooked';renderShop();const old=S.food[a.fid];if(!old)return false;
      const x=lotState(a.fid)?.st[a.i];if(!x||x.now<=0)return false;
      if(a.kind==='move'&&x.w==='fridge'&&!cookedInfo(lotState(a.fid),x).canFreeze)return false;
      openMove(a.fid,a.i,a.kind==='discard'?'discard':x.w==='freezer'?'thaw':'freeze');if(!mvCtx)return false;
      a.q=a.q??(1+Math.floor(random()*mvCtx.max));while(mvCtx.q!==a.q)moveClick($('card').querySelector(`[data-mvq="${a.q>mvCtx.q?1:-1}"]`));moveClick($('card').querySelector('[data-mvok]'));
    }else{
      go(a.who==='lh'?'lilh':'np');finishPageMotion();P.showDay(a.n,true);
      if(a.kind==='order'){a.to=a.to??choose([1,2]);P.swapPos(a.n,0,a.to)}
      else if(a.kind==='split'){
        if(!P.cfg.split)return false;const button=document.createElement('button');button.dataset.split=a.slot+':'+a.n;document.getElementById(a.who==='pn'?'page-np':'page-lilh').append(button);button.click();button.remove();
      }else if(a.kind==='replan'){
        // Open from a real page click so the existing trusted-in-app guard applies.
        const button=document.querySelector('#page-'+(a.who==='pn'?'np':'lilh')+' [data-act="recalc"]');button.click();
        const ok=$('card').querySelector('[data-recok]');if(ok)P.recClick(ok);else changed=false;
      }else if(a.kind==='ingredient'||a.kind==='size'){
        const root=document.getElementById(a.who==='pn'?'page-np':'page-lilh'),meal=root.querySelector(a.slot==='B'?`.day[data-n="${a.n}"] .meal[data-ik="b${a.n}"]`:`.meal[data-at="${a.slot}:${a.n}"]`);if(!meal)return false;meal.click();
        if(a.kind==='ingredient'){
          const ingredient=a.ingredient?$('card').querySelector(`[data-sub="${a.ingredient}"]`):choose([...$('card').querySelectorAll('[data-sub]')]);if(!ingredient)return false;a.ingredient=ingredient.dataset.sub;ingredient.click();
          const option=a.subto?$('card').querySelector(`[data-subto="${a.subto}"]:not([disabled])`):choose([...$('card').querySelectorAll('[data-subto]:not([disabled])')]);if(!option)return false;a.subto=option.dataset.subto;option.click();const confirm=$('card').querySelector('[data-subok]');if(confirm)confirm.click();
        }else{
          const dd=$('card').querySelector('[data-dd="d"]');if(!dd)return false;dd.click();
          const option=a.size?$('card').querySelector(`[data-dopt="${a.size}"]:not([disabled])`):choose([...$('card').querySelectorAll('[data-dopt]:not([disabled])')]);if(!option)return false;a.size=+option.dataset.dopt;option.click();const ok=$('card').querySelector('[data-cfok]');if(ok)ok.click();
        }
      }else{
        const root=document.getElementById(a.who==='pn'?'page-np':'page-lilh'),pick=root.querySelector(`[data-pk="${a.slot==='B'?'bf:'+a.n:'day:'+a.slot+':'+a.n}"],[data-pk="main:${a.slot}:${a.n}"]`);if(!pick)return false;pick.click();
        if(a.kind==='assign'){
          const stored=$('card').querySelector(`[data-fzpick="${a.fid}:${a.w}"]:not([disabled])`);if(stored)stored.click();else return false;
        }else{
          const options=[...$('card').querySelectorAll('[data-pick]:not([disabled])')];const option=a.recipe?options.find(x=>x.dataset.pick===a.recipe):choose(options);if(!option)return false;a.recipe=option.dataset.pick;option.click();
        }
      }
    }
    close();await pause();if(rafId){cancelAnimationFrame(rafId);rafId=0}renderAll();await pause();return changed?{...a,changed:true}:false;
  }
  window.NPH_STRESS={init:seed=>{rng=seed||1},next,act};
})();
