import asyncio
from test_ui import setup,fixture,BROWSER,ROOT,APP,OUT
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER);c=await b.new_context(viewport={'width':320,'height':900},is_mobile=True,has_touch=True);await setup(c,'dark');pg=await c.new_page();await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await fixture(pg)
  await pg.evaluate("go('np');PN.setHu(true)");await pg.wait_for_timeout(350)
  # A group title jumps to its first concrete item.
  jump=pg.locator('#pn-hul .hujump[data-hu^="buy:"]');first=(await jump.get_attribute('data-hu'))[4:];await jump.click();await pg.wait_for_timeout(650)
  selected=pg.locator('#shop-cats .item').filter(has=pg.locator('[data-tick="'+first+'"]'))
  assert await selected.locator('.nphfx').evaluate("e=>e.style.getPropertyValue('--flash')")=='var(--warn)'
  # Each expanded item has its own target, including the last offscreen entry.
  await pg.evaluate("go('np');PN.setHu(true)");await pg.wait_for_timeout(300);await pg.locator('#pn-hul [data-hugroup="shopping"]').click();last=pg.locator('#pn-hu-shopping [data-hu]').last;key=(await last.get_attribute('data-hu'))[4:];assert key!=first;await last.click();await pg.wait_for_timeout(650)
  selected=pg.locator('#shop-cats .item').filter(has=pg.locator('[data-tick="'+key+'"]'))
  assert await selected.locator('.nphfx').count()==1
  assert await pg.evaluate('pageMotion===null')
  await b.close();print('PASS: group title and individual shopping notices jump/highlight their correct targets, including scrolled dropdown entries.')
asyncio.run(main())
