"""Matched disposable phone previews and real-control interaction checks."""
import asyncio,pathlib,os,json,sys,base64,importlib.util
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
APP=ROOT.parent.parent
OUT=APP/'tests/screenshots/stock2107'
from helpers import swipe,animation_png
BROWSER=r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe'
OUT.mkdir(parents=True,exist_ok=True)
async def setup(ctx,theme):
 await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
 await ctx.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"');{const R=Date,off=new Date('2026-11-02T19:00:00').getTime()-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}")
async def fixture(pg):
 await pg.evaluate("()=>{"+(APP/'tests/cooked-fixtures-297.js').read_text(encoding='utf-8')+"""
 const day=todayAbs();S.food['pn-expired']={who:'pn',r:'paprikas',made:day-5,mk:4,src:null,stacks:[{w:'fridge',p:2,since:day-5,th:false}]};
 S.food['pn-expired-fz']={who:'pn',r:'beefstew',made:day-100,mk:4,src:null,stacks:[{w:'freezer',p:2,since:day-100,th:false}]};
 S.food['lh-expired']={who:'lh',r:'s12',made:day-4,mk:2,src:null,stacks:[{w:'fridge',p:1,since:day-4,th:false}]};
 for(const k of PN.thisWeekKeys())S.stock[k]={out:true,qty:2};
 foodWho='pn';shopView='cooked';shut.clear();go('shop');
 }""")
 await pg.wait_for_timeout(320)
async def shot(pg,name,view,theme,width):
 await pg.wait_for_timeout(280)
 await pg.screenshot(path=str(OUT/f'{name}-{view}-{theme}-{width}.png'))
async def main():
 errors=[];results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['dark','light']:
   for width in [320,400]:
    for name in ['after']:
     ctx=await b.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London');await setup(ctx,theme)
     pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
     await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
     await pg.evaluate('shopToTabs()');await shot(pg,name,'cooked',theme,width)
     if name=='after':
      # Click the header's label area, away from its arrow and pills.
      h=pg.locator('.cooked-head').first;box=await h.bounding_box();await pg.mouse.click(box['x']+25,box['y']+box['height']/2)
      assert await pg.evaluate("shut.has('cf-fridge')")
      await pg.locator('[data-foodmode="fridge:warnings"]').click();assert not await pg.evaluate("shut.has('cf-fridge')")
      assert await pg.evaluate("foodModes['pn:fridge']==='warnings'")
      await pg.locator('[data-foodmode="fridge:expired"]').click();await pg.wait_for_timeout(400)
      assert await pg.locator('[data-fcard="pn-expired:0"] .nphfx').count()==1
     await pg.evaluate("shopView='all';renderShop();shopToTabs()");await shot(pg,name,'all',theme,width)
     if name=='after':
      assert await pg.locator('.iname').first.evaluate("e=>getComputedStyle(e).fontSize")==await pg.locator('#page-np .meal b').first.evaluate("e=>getComputedStyle(e).fontSize")
      centers=await pg.locator('.cqc').first.evaluate("e=>{const a=e.querySelector('svg').getBoundingClientRect(),b=e.querySelector('b').getBoundingClientRect();return [a.y+a.height/2,b.y+b.height/2]}")
      assert abs(centers[0]-centers[1])<1,centers
     await pg.evaluate("shopView='buy';renderShop();shopToTabs()");await shot(pg,name,'buy',theme,width)
     await pg.evaluate("go('np');PN.showToday();PN.setHu(true)");await pg.wait_for_timeout(350)
     if name=='after':
      drop=await pg.locator('#pn-hud').bounding_box();buttons=await pg.locator('#page-np .recalc').bounding_box();assert drop['y']>=buttons['y']+buttons['height']-1,(drop,buttons)
      await pg.locator('#pn-hul [data-hugroup="expired"]').click();await pg.locator('#pn-hul [data-hugroup="shopping"]').click()
      assert await pg.locator('#pn-hu-shopping [data-hu^="buy:"]').count()>1
      assert '(' not in await pg.locator('#pn-hu-expired').inner_text()
     await shot(pg,name,'notices',theme,width)
     if name=='after':
      await pg.locator('#pn-hu-expired [data-hu]').first.click();await pg.wait_for_timeout(600)
      assert await pg.evaluate("current==='shop'")
      assert await pg.locator('[data-fcard="pn-expired:0"] .nphfx').evaluate("e=>e.style.getPropertyValue('--flash')")=='var(--bad)'
      await pg.evaluate("go('lilh');LH.setHu(true)");await pg.wait_for_timeout(300);await shot(pg,name,'lh-notices',theme,width)
     await pg.evaluate("go('np');PN.setHu(false);PN.openR('beefstew',null,null)");await pg.wait_for_timeout(300)
     await pg.locator('#dlg').evaluate('e=>e.scrollTop=0');await shot(pg,name,'recipe',theme,width)
     if name=='after':
      d=await pg.locator('#dlg').bounding_box();r=await pg.locator('.rbar').bounding_box();assert abs(d['y']-r['y'])<1,(d,r)
     await pg.evaluate("document.getElementById('dlg').close();go('np')");await pg.wait_for_timeout(350)
     if name=='after':
      # Calendar hold opens at 200ms. A quick tap retains Today behaviour.
      cal=pg.locator('#page-np [data-calhold]');cb=await cal.bounding_box();await pg.mouse.move(cb['x']+cb['width']/2,cb['y']+cb['height']/2);await pg.mouse.down();await pg.wait_for_timeout(250)
      assert await pg.locator('#dlg').evaluate('e=>e.open');await pg.mouse.up();await pg.evaluate("document.getElementById('dlg').close()")
      # Real scroll offset and visible bar remain fixed throughout and after motion.
      await pg.evaluate("window.navTargets=[];const base=goNow;goNow=(...a)=>{base(...a);navTargets.push(scrollY)}")
      await swipe(pg,'#page-np .day.today .meal',-85)
      positions=[]
      for delay in [30,45,60,80,110]:
       await pg.wait_for_timeout(delay);positions.append(await pg.evaluate('scrollY'))
       assert await pg.locator('.tabbar').evaluate('e=>Math.abs(e.getBoundingClientRect().bottom-900)<1')
      target=await pg.evaluate('navTargets.at(-1)');assert all(abs(y-target)<1 for y in positions),(positions,target)
      assert await pg.locator('.nav-motion').count()==0
      assert await pg.locator('main.page:not([hidden])').count()==1
     assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     results.append([name,theme,width]);await ctx.close()
  # Native frames document page transitions, compact notices and semantic flash.
  ctx=await b.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London');await setup(ctx,'dark');pg=await ctx.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
  await pg.evaluate("go('np')");await pg.wait_for_timeout(350)
  cdp=await ctx.new_cdp_session(pg);frames=[]
  async def frame(e):
   frames.append((e['metadata']['timestamp'],base64.b64decode(e['data'])));await cdp.send('Page.screencastFrameAck',{'sessionId':e['sessionId']})
  cdp.on('Page.screencastFrame',frame);await cdp.send('Page.startScreencast',{'format':'png','everyNthFrame':2,'maxWidth':400,'maxHeight':900})
  await pg.wait_for_timeout(120);await swipe(pg,'#page-np .day.today .meal',-90);await pg.wait_for_timeout(400);await swipe(pg,'#page-lilh .day.today .meal',-90);await pg.wait_for_timeout(400);await swipe(pg,'#page-shop .cooked-card',90);await pg.wait_for_timeout(400)
  await pg.evaluate("go('np');PN.setHu(true)");await pg.wait_for_timeout(350);await pg.locator('#pn-hul [data-hugroup="expired"]').click();await pg.wait_for_timeout(400);await pg.locator('#pn-hu-expired [data-hu]').first.click();await pg.wait_for_timeout(1100)
  await cdp.send('Page.stopScreencast');await pg.wait_for_timeout(100);animation_png(frames,OUT/'motion-preview.png');await ctx.close()
  ctx=await b.new_context(viewport={'width':320,'height':900},is_mobile=True,has_touch=True,reduced_motion='reduce');await setup(ctx,'light');pg=await ctx.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await pg.evaluate("go('lilh')");assert await pg.locator('.nav-motion').count()==0;await ctx.close()
  assert not errors,errors
  await b.close();print(json.dumps({'passed':True,'layouts':results,'pageErrors':errors}))
if __name__=='__main__':asyncio.run(main())
