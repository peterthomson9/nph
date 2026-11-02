"""Local-only Back history, header-only symbols and visible group highlights."""
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent/'stock2107'))
from test_ui import setup,fixture,BROWSER,APP,OUT
async def open_list(pg,who):
 await pg.evaluate("who=>{go(who==='pn'?'np':'lilh',true);PLANNERS[who].setHu(true)}",who)
 await pg.wait_for_function("who=>history.state?.nphL===who+'-hu'",arg=who)
 await pg.wait_for_timeout(280)
async def main():
 errors=[];cases=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['light','dark']:
   for width in [320,400]:
    for who in ['pn','lh']:
     c=await b.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True);await setup(c,theme);pg=await c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
     await open_list(pg,who);before=await pg.evaluate('JSON.stringify(S)');hash_before=await pg.evaluate('location.hash');h=await pg.evaluate('history.length')
     await pg.locator(f'#{who}-hul [data-hugroup="swaps"]').click();assert await pg.evaluate('history.length')==h
     assert await pg.locator(f'#{who}-hu-swaps .hurow svg').count()==0
     assert await pg.locator(f'#{who}-hul .hujump svg').count()>0
     await pg.screenshot(path=str(OUT/f'header-symbols-{who}-{theme}-{width}.png'))
     await pg.go_back();await pg.wait_for_function("who=>!document.getElementById(who+'-hud').classList.contains('open')",arg=who)
     assert await pg.evaluate('location.hash')==hash_before
     assert await pg.evaluate('JSON.stringify(S)')==before
     # Dialog closes first, then the checklist beneath it; neither leaves page.
     await open_list(pg,who);await pg.evaluate("who=>{dlgOwner=who;PLANNERS[who].openCal()}",who);await pg.wait_for_function("history.state?.nphL==='dlg'")
     await pg.go_back();await pg.wait_for_function("!document.getElementById('dlg').open");assert await pg.locator(f'#{who}-hud').evaluate("e=>e.classList.contains('open')")
     await pg.go_back();await pg.wait_for_function("who=>!document.getElementById(who+'-hud').classList.contains('open')",arg=who)
     # All visible matching expired cards, excluding unrelated and offscreen.
     await pg.evaluate("""who=>{for(let i=0;i<12;i++)S.food['expired-'+i]={who,r:who==='pn'?'beefstew':'s12',made:todayAbs()-5,mk:2,src:null,stacks:[{w:'fridge',p:1,since:todayAbs()-5,th:false}]};PLANNERS[who].render()}""",who)
     await open_list(pg,who);await pg.locator(f'#{who}-hul [data-hujump="expired"]').click();await pg.wait_for_timeout(650)
     matches=await pg.evaluate("""()=>{const top=stickH(),bottom=document.querySelector('.tabbar').getBoundingClientRect().top,cards=[...document.querySelectorAll('#shop-food [data-fcard]')];return {expected:cards.filter(e=>{const r=e.getBoundingClientRect();return e.dataset.expired==='true'&&r.bottom>top&&r.top<bottom}).map(e=>e.dataset.fcard).sort(),actual:cards.filter(e=>e.querySelector('.nphfx')).map(e=>e.dataset.fcard).sort(),total:cards.filter(e=>e.dataset.expired==='true').length}}""")
     assert matches['actual']==matches['expected'] and len(matches['actual'])>=2 and matches['total']>len(matches['actual']),matches
     assert await pg.evaluate("[...document.querySelectorAll('#shop-food .nphfx')].every(e=>e.style.getPropertyValue('--flash')==='var(--bad)')")
     cases.append([who,theme,width]);await c.close()
  # Meal-source groups also highlight all visible source rows, not only first.
  c=await b.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True);await setup(c,'dark');pg=await c.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
  await pg.evaluate("""()=>{S.food={};S.pn={};SHNEED.pn=null;SHNEED.lh=null;for(const [k] of PN_ING)S.stock['pn-'+k]={out:true};const t=PN._dbg.todayN();for(let n=t-1;n<t+8;n++){S.pn['b-'+n]={v:'__skip'};for(const sl of ['L','D'])S.pn['x-'+sl+n]={v:'__skip'}}S.pn['x-L'+t]={v:'beefstew'};S.pn['x-D'+t]={v:'frittata'};S.pn['x-L'+(t+1)]={v:'paprikas'};S.pn['x-D'+(t+4)]={v:'avoeggs'};SHV++;go('np',true)}""")
  await open_list(pg,'pn');await pg.locator('#pn-hul [data-hugroup="swaps"]').click();acts=await pg.locator('#pn-hu-swaps [data-hu]').evaluate_all('es=>es.map(e=>e.dataset.hu)');await pg.locator('#pn-hul [data-hujump="swaps"]').click();await pg.wait_for_timeout(600)
  actual=await pg.evaluate("""acts=>{const top=stickH(),bottom=document.querySelector('.tabbar').getBoundingClientRect().top,targets=acts.map(a=>{const [,tag,sl,n]=a.split(':');return document.querySelector(`#page-np .meal[data-at="${sl}:${n}"]`)?.closest('.row')}).filter(Boolean);return {expected:targets.filter(e=>{const r=e.getBoundingClientRect();return r.bottom>top&&r.top<bottom}).length,flashed:targets.filter(e=>e.querySelector('.nphfx')).length}}""",acts)
  assert actual['flashed']==actual['expected'] and actual['flashed']>=2,actual
  await b.close();assert not errors,errors;print(json.dumps({'passed':True,'phoneCases':cases,'backClosesNewestWindow':True,'headerSymbolsOnly':True,'visibleMatchingCardsOnly':True,'multipleMealSourcesHighlighted':True,'pageErrors':errors}))
asyncio.run(main())
