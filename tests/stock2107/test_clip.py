import asyncio
from test_ui import setup,fixture,BROWSER,ROOT,APP,OUT
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['light','dark']:
   for width in [320,400]:
    for height in [640,900]:
     c=await b.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True);await setup(c,theme);pg=await c.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
     await pg.evaluate("go('np');PN.setHu(true)");await pg.wait_for_timeout(350);await pg.locator('#pn-hul [data-hugroup="expired"]').click();await pg.locator('#pn-hul [data-hugroup="shopping"]').click();await pg.wait_for_timeout(350)
     bounds=await pg.evaluate("""()=>{const d=document.getElementById('pn-hud'),s=d.querySelector('.hudin'),r=s.getBoundingClientRect(),f=d.querySelector('.hufoot').getBoundingClientRect(),bar=document.querySelector('.tabbar').getBoundingClientRect();const rows=[...s.querySelectorAll('.hurow')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect()).filter(b=>b.top>=r.top&&b.top<r.bottom-1);return {bottom:d.getBoundingClientRect().bottom,bar:bar.top,edge:r.bottom,foot:f.top,last:rows.at(-1)?.bottom}}""")
     assert bounds['bottom']<bounds['bar']-5,bounds
     assert bounds['last'] is None or bounds['last']<=bounds['edge']+1,bounds
     assert bounds['foot']>=bounds['edge']-1,bounds
     await pg.screenshot(path=str(OUT/f'no-clip-{theme}-{width}-{height}.png'))
     await pg.locator('#pn-hud .hudin').evaluate('e=>e.scrollTop=e.scrollHeight');await pg.wait_for_timeout(250)
     assert await pg.locator('#pn-hud .hufoot').inner_text()=='End of list'
     assert await pg.locator('#pn-hul .hugroup').last.evaluate("e=>{const r=e.getBoundingClientRect(),s=e.closest('.hudin').getBoundingClientRect();return r.bottom<=s.bottom+1}")
     await c.close()
  await b.close();print('PASS: full rows at the dropdown edge, opaque footer, last item reachable and no navigation overlap at 320/400px, 640/900px heights, light/dark.')
asyncio.run(main())
