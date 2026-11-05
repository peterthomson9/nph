"""Disposable phone browsers. Real touch input plus save/network boundary checks."""
import asyncio,json,pathlib,os
from playwright.async_api import async_playwright
APP=pathlib.Path(__file__).resolve().parents[1];OUT=APP/'tests/screenshots/refresh-2116'
async def main():
 OUT.mkdir(parents=True,exist_ok=True);report=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('BROWSER_EXE','C:/Users/thoms/AppData/Local/BraveSoftware/Brave-Browser/Application/brave.exe'))
  for theme in ['light','dark']:
   for width in [320,400]:
    ctx=await browser.new_context(viewport={'width':width,'height':740},is_mobile=True,has_touch=True)
    await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await ctx.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"')")
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((APP/'index.html').as_uri());await page.wait_for_function("typeof S!=='undefined'")
    await page.wait_for_timeout(200);await page.evaluate("window.refreshChecks=0;window.identityMarker=crypto.randomUUID();checkUpdates=async manual=>{if(manual)refreshChecks++;await new Promise(r=>setTimeout(r,160))}")
    cdp=await ctx.new_cdp_session(page)
    async def touch(kind,y=45,x=width/2):
     await cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if kind in ['touchEnd','touchCancel'] else [{'x':x,'y':y}]})
    async def pull(full=True,cancel=False):
     await touch('touchStart')
     for y in range(55,270 if full else 100,15):
      await touch('touchMove',y);await page.wait_for_timeout(16)
     await touch('touchCancel' if cancel else 'touchEnd')
     await page.wait_for_timeout(780)
    for tab in ['np','lilh','shop']:
     await page.evaluate("p=>{go(p);finishPageMotion();scrollTo(0,0)}",tab);await page.wait_for_timeout(200)
     await page.evaluate('NPH_STORE.flush()')
     before=await page.evaluate('({data:JSON.stringify(S),marker:identityMarker})')
     count=await page.evaluate('refreshChecks')
     await pull(False);assert await page.evaluate('refreshChecks')==count,'short pull refreshed'
     await pull(cancel=True);assert await page.evaluate('refreshChecks')==count,'cancel refreshed'
     await pull();assert await page.evaluate('refreshChecks')==count+1,'real touch did not refresh once'
     after=await page.evaluate('({data:JSON.stringify(S),marker:identityMarker})')
     assert before==after,'refresh reloaded or changed data'
     assert await page.evaluate('scrollY')==0,'page jumped'
     assert await page.locator('.pull-refresh').is_hidden(),'spinner stuck'
     await touch('touchStart');await touch('touchMove',265);await page.wait_for_timeout(30)
     await page.screenshot(path=str(OUT/f'{tab}-{theme}-{width}.png'))
     await touch('touchCancel');await page.wait_for_timeout(260)
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'overflow'
     report.append([tab,theme,width])
    # Open windows and below-top scroll cannot initiate refresh.
    count=await page.evaluate('refreshChecks')
    # A second finger cancels an already armed pull, even if lifted without moving.
    await touch('touchStart');await touch('touchMove',265)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':width/2,'y':265},{'x':width/2+35,'y':270}]})
    await touch('touchEnd');await page.wait_for_timeout(300)
    assert await page.evaluate('refreshChecks')==count,'second finger triggered refresh'
    await page.evaluate('openSettings()');await pull();assert await page.evaluate('refreshChecks')==count
    await page.evaluate("$('dlg').close();scrollTo(0,300)");await pull();assert await page.evaluate('refreshChecks')==count
    await page.evaluate('scrollTo(0,0)')
    # A failed local commit must block sync/update requests.
    await page.evaluate("()=>{window.realFlush=NPH_STORE.flush;NPH_STORE.flush=async()=>{throw Error('Test save failed')}}")
    await pull();assert await page.evaluate('refreshChecks')==count
    await page.evaluate('()=>{NPH_STORE.flush=realFlush}')
    await ctx.set_offline(True);await pull()
    assert await page.locator('.pull-refresh').is_hidden()
    assert 'Offline' in await page.locator('.toast').inner_text()
    await ctx.set_offline(False)
    for who in ['pn','lh']:
     root='np' if who=='pn' else 'lilh'
     await page.evaluate("""who=>{go(who==='pn'?'np':'lilh');finishPageMotion();const P=PLANNERS[who],n=P._dbg.todayN()+2;window.slotTestDay=n;S[who]['o-'+n]={v:'DLB'};S[who]['b-'+n]={v:'__skip'};S[who]['x-L'+n]={v:'__skip'};S[who]['x-D'+n]={v:'__skip'};P.showDay(n,true,true);P.render()}""",who)
     n=await page.evaluate('slotTestDay')
     for pos in [0,1,2]:
      await page.locator(f'#page-{root} .day[data-n="{n}"] .grp[data-pos="{pos}"] [data-pk]').first.click()
      assert ['breakfast','lunch','dinner'][pos] in await page.locator('#card header').inner_text()
      assert await page.evaluate("document.querySelector('#dlg').scrollWidth<=document.querySelector('#dlg').clientWidth+1")
      await page.screenshot(path=str(OUT/f'picker-{who}-{pos}-{theme}-{width}.png'))
      await page.evaluate("$('dlg').close()")
    assert not errors,errors
    await ctx.close()
  # Reduced motion keeps the feedback visible without an animated spinner.
  ctx=await browser.new_context(viewport={'width':320,'height':740},is_mobile=True,has_touch=True,reduced_motion='reduce')
  await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
  page=await ctx.new_page();await page.goto((APP/'index.html').as_uri());await page.wait_for_function("typeof S!=='undefined'")
  assert await page.evaluate("(()=>{const el=document.querySelector('.pull-refresh');el.classList.add('loading');return getComputedStyle(el.querySelector('svg')).animationName})()")=='none'
  await ctx.close();await browser.close()
 (OUT/'checks.json').write_text(json.dumps({'passed':report,'realTouch':True,'saveFailureBlocksRequests':True,'offline':True,'reducedMotion':True},indent=2))
 print('PASS: real touch on all 3 pages, light/dark 320/400px; cancellation, no reload/data changes, save failure, offline, dialogs, scrolling, reduced motion')
asyncio.run(main())
