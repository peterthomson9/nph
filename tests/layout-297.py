"""Cooked cards: real Brave UI, disposable state, phone sizes and reduced motion."""
import asyncio,json,pathlib,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe'))
  for theme in ['dark','light']:
   for width in [400,320]:
    ctx=await browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London')
    await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await ctx.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"');{const R=Date,T=new Date('2026-11-02T09:00:00').getTime(),off=T-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}")
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'index.html').as_uri());await page.wait_for_timeout(1300)
    await page.evaluate("()=>{"+(ROOT/'tests/cooked-fixtures-297.js').read_text(encoding='utf-8')+"}")
    for who in ['lh','pn']:
     await page.locator('#shop-who [data-who="'+who+'"]').click();await page.wait_for_timeout(120)
     assert await page.locator('.cooked-card').count()==4
     assert await page.locator('.cmeta').first.evaluate('e=>getComputedStyle(e).fontSize')=='10px'
     assert await page.locator('.cstatus').first.evaluate('e=>getComputedStyle(e).fontSize')=='12px'
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     geometry=await page.evaluate("""()=>[...document.querySelectorAll('.cooked-card')].map(c=>{
      const b=c.getBoundingClientRect(),t=c.querySelector('.tx').getBoundingClientRect(),bar=c.querySelector('.cbar').getBoundingClientRect();
      return {aligned:Math.abs(t.left-bar.left)<.6,centred:Math.abs(bar.left-b.left-b.right+bar.right)<.6,inside:bar.bottom<b.bottom-3};
     })""")
     assert all(all(g.values()) for g in geometry)
     await page.locator('#shop-food').screenshot(path=str(ROOT/f'tests/cooked-297-{who}-{theme}-{width}.png'))
     first=page.locator('.cooked-card').first
     h=await first.evaluate('e=>e.getBoundingClientRect().height')
     await first.locator('[data-fdots]').click();await page.wait_for_timeout(250)
     assert await first.locator('.cbar').evaluate('e=>getComputedStyle(e).opacity')=='0'
     assert await first.evaluate('e=>e.getBoundingClientRect().height')==h
     assert await first.locator('.edbtn').count()==3
     for button in await first.locator('.edbtn').all():
      assert await button.evaluate('e=>e.scrollHeight<=e.clientHeight+1')
     await first.locator('.edbtn').nth(1).focus()
     await page.keyboard.press('Tab')
     assert await page.locator('.cooked-card.open .edbtn:focus').evaluate('e=>getComputedStyle(e).outlineStyle')!='none'
     if theme=='dark' and width==400:await page.locator('#shop-food').screenshot(path=str(ROOT/f'tests/cooked-297-{who}-actions.png'))
     await page.keyboard.press('Escape');await page.wait_for_timeout(300)
     assert await first.locator('.cbar').evaluate('e=>getComputedStyle(e).opacity')=='1'
     for mode,group in [('planned','fridge'),('warnings','fridge'),('thawing','fridge'),('freezing','freezer')]:
      await page.locator('[data-foodmode="'+group+':'+mode+'"]').click();await page.wait_for_timeout(260)
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
      assert await page.evaluate("()=>[...document.querySelectorAll('.cstatus')].every(e=>e.scrollWidth<=e.clientWidth+1)")
      await page.locator('[data-foodmode="'+group+':'+mode+'"]').click()
     results.append({'theme':theme,'width':width,'who':who,'alignedCentredBars':True,'actionsFit':True,'keyboardFocus':True})
    await ctx.close();assert not errors,errors
  # Reduced-motion uses the same states without entry/exit movement or bar fades.
  ctx=await browser.new_context(viewport={'width':320,'height':900},timezone_id='Europe/London',reduced_motion='reduce')
  await ctx.add_init_script("localStorage.setItem('nph-me','P')")
  page=await ctx.new_page();await page.goto((ROOT/'index.html').as_uri());await page.wait_for_timeout(1300)
  await page.evaluate("()=>{"+(ROOT/'tests/cooked-fixtures-297.js').read_text(encoding='utf-8')+"}")
  await page.locator('[data-fdots]').first.click()
  assert await page.locator('.edbtn').first.evaluate('e=>getComputedStyle(e).animationName')=='none'
  assert await page.locator('.cooked-card').first.locator('.cbar').evaluate('e=>getComputedStyle(e).transitionDuration')=='0s'
  await ctx.close();await browser.close()
 print(json.dumps({'phoneLayouts':results,'reducedMotion':True,'pageErrors':0}))
asyncio.run(main())
