import asyncio
from test_ui import setup,fixture,BROWSER,ROOT,APP,OUT
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER);c=await b.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True);await setup(c,'dark');pg=await c.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
  for target in ['np','lilh','shop','lilh','np']:
   await pg.evaluate('p=>go(p)',target)
   if await pg.evaluate('!!pageMotion'):
    geometry=await pg.evaluate("""()=>{for(const a of document.getAnimations())if(a.effect.target.matches('.nav-frame')){a.pause();a.currentTime=180}const real=document.getElementById(PAGES[current]),clone=document.querySelector('.nav-frame:last-child .page');const get=el=>[el,...el.querySelectorAll('.stick,.day,.item')].map(x=>{const r=x.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});return [get(real),get(clone)]}""")
    assert len(geometry[0])==len(geometry[1])
    assert all(abs(a-b)<.1 for old,new in zip(*geometry) for a,b in zip(old,new)),(target,geometry)
    await pg.evaluate('finishPageMotion()')
  await b.close();print('PASS: exact snapshot/live page, sticky header and card geometry across all navigation directions.')
asyncio.run(main())
