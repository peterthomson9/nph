"""Activation-only, applicable-card pill waves in disposable local profiles."""
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent/'stock2107'))
from test_ui import fixture,BROWSER,APP,OUT
async def setup(c,theme):
 await c.route('**/fonts.googleapis.com/**',lambda r:r.abort())
 await c.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"');{const R=Date,off=new Date('2026-11-02T09:00:00').getTime()-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}")
async def main():
 errors=[];cases=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['light','dark']:
   for width in [320,400]:
    for who in ['pn','lh']:
     c=await b.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True);await setup(c,theme);pg=await c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
     await pg.evaluate("""who=>{const r=who==='pn'?'beefstew':'s12',t=todayAbs();S.food[who+'-solid']={who,r,made:t-5,mk:2,src:null,stacks:[{w:'freezer',p:2,since:t-2,th:false,at:Date.now()-24*3600000,h:6}]};for(const w of ['fridge','freezer'])S.food[who+'-expired-'+w]={who,r,made:t-110,mk:2,src:null,stacks:[{w,p:2,since:t-100,th:false}]};foodWho=who;shopView='cooked';foodModes[who+':fridge']='details';foodModes[who+':freezer']='details';go('shop');finishPageMotion()}""",who)
     saved=await pg.evaluate('JSON.stringify(S)')
     for storage,modes in [('fridge',['warnings','planned','thawing']),('freezer',['warnings','planned','freezing'])]:
      expected={'warnings':[who+'-spare:0'] if storage=='fridge' else [who+'-solid:0'],'planned':[who+'-today:0',who+'-thaw:0'] if storage=='fridge' else [who+'-freeze:0'],'thawing':[who+'-thaw:0'],'freezing':[who+'-freeze:0']}
      if who=='lh' and storage=='freezer':expected['warnings'].append('lh-freeze:0')
      for mode in modes:
       pill=pg.locator(f'[data-foodmode="{storage}:{mode}"]');colour=await pill.evaluate("e=>getComputedStyle(e).getPropertyValue('--toggle').trim()");await pill.click()
       flashed=await pg.locator('#shop-food [data-fcard]:has(.nphfx)').evaluate_all('es=>es.map(e=>e.dataset.fcard).sort()');assert flashed==sorted(expected[mode]),(who,storage,mode,flashed,expected[mode])
       assert await pg.locator('#shop-food .nphfx').evaluate_all('(es,c)=>es.every(e=>getComputedStyle(e).getPropertyValue("--flash").trim()===c)',colour)
       if mode=='planned':await pg.screenshot(path=str(OUT/f'pill-calendar-{who}-{storage}-{theme}-{width}.png'))
       await pill.click();assert await pg.locator('#shop-food .nphfx').count()==0
      # Expired remains the existing momentary highlight action.
      await pg.locator(f'[data-foodmode="{storage}:expired"]').click();await pg.wait_for_timeout(500)
      assert await pg.locator(f'[data-fcard="{who}-expired-{storage}:0"] .nphfx').count()==1
      await pg.evaluate("document.querySelectorAll('.nphfx').forEach(e=>e.remove())")
     assert await pg.evaluate('JSON.stringify(S)')==saved
     # Daily warnings and changes: one changed recipe, other ordinary cards.
     n=await pg.evaluate("""who=>{const P=PLANNERS[who],n=P._dbg.todayN()+2,bf=P._dbg.bfAt(n),r=who==='pn'?'beefstew':'s12',d=who==='pn'?'frittata':'s15';S[who]={};S.food={};SHNEED.pn=null;SHNEED.lh=null;for(const [k] of PN_ING)S.stock['pn-'+k]={out:false};for(const [k] of LH_ING)S.stock['lh-'+k]={out:false};for(let t=n-3;t<n+6;t++){S[who]['b-'+t]={v:'__skip'};for(const sl of ['L','D'])S[who]['x-'+sl+t]={v:'__skip'}}S[who]['b-'+n]={v:bf};S[who]['x-L'+n]={v:r};S[who]['x-D'+n]={v:d};const first=P.R[r].need[0];S[who]['is-xL'+n]={r,m:{[first]:'-'}};const key=k=>P.cfg.skey?P.cfg.skey(k):who+'-'+k,other=new Set([...P.R[bf].need,...P.R[d].need].flatMap(s=>s.split('|')).map(key)),unique=P.R[r].need.slice(1).flatMap(s=>s.split('|')).find(k=>!other.has(key(k)));if(!unique)throw Error('fixture needs a lunch-only ingredient');S.stock[key(unique)]={out:true};SHV++;go(who==='pn'?'np':'lilh');finishPageMotion();P.showDay(n,true);return n}""",who)
     await pg.wait_for_timeout(300);page='#page-'+('np' if who=='pn' else 'lilh');day=pg.locator(f'{page} .day[data-n="{n}"]');saved=await pg.evaluate('JSON.stringify(S)')
     await day.locator('[data-dswap]').click();assert await day.locator('.row:has(.nphfx)').count()==1
     assert await day.locator('.row:has(.meal[data-at="L:'+str(n)+'"]) .nphfx').evaluate("e=>e.style.getPropertyValue('--flash')")=='var(--ok)'
     await day.locator('[data-dswap]').click();assert await pg.locator(page+' .nphfx').count()==0
     await day.locator('[data-dwarn]').click()
     view=await day.locator('.row:has(.meal)').evaluate_all("es=>es.map(e=>({warning:!e.querySelector('.meal em .nw'),flash:!!e.querySelector('.nphfx')}))")
     assert any(x['flash'] for x in view) and all(x['flash']==x['warning'] for x in view),view
     assert await day.locator('.nphfx').evaluate_all("es=>es.every(e=>e.style.getPropertyValue('--flash')==='var(--warn)')")
     await day.locator('[data-dwarn]').click();assert await pg.locator(page+' .nphfx').count()==0
     assert not await day.evaluate("e=>e.classList.contains('dwjust')")
     assert await pg.evaluate('JSON.stringify(S)')==saved
     cases.append([who,theme,width]);await c.close()
  await b.close();assert not errors,errors;print(json.dumps({'passed':True,'cases':cases,'activationOnly':True,'onlyApplicableCards':True,'pillColours':True,'savedRecordsUnchanged':True,'pageErrors':errors}))
asyncio.run(main())
