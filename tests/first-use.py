"""Exercise first-use identity and existing Settings in isolated Brave contexts."""
import asyncio,os,pathlib
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(**({'executable_path':os.environ['BROWSER_EXE']} if os.environ.get('BROWSER_EXE') else {}))
  for theme,choice in [('dark','N'),('light','P')]:
   ctx=await browser.new_context(viewport={'width':400,'height':860},is_mobile=True,has_touch=True,timezone_id='Europe/London')
   await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
   await ctx.add_init_script('localStorage.setItem("nph-theme","'+theme+'");')
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto((pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri())
   prompt=page.locator('.phonecard');await prompt.wait_for()
   assert await prompt.locator('h2').inner_text()=='Whose phone is this?'
   assert await prompt.locator('button').count()==3
   assert await prompt.locator('[data-phoneconfirm]').is_disabled()
   await page.screenshot(path='tests/phone-setup-'+theme+'.png')
   await prompt.locator('[data-phonepick="'+choice+'"]').click()
   await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab')
   selected=prompt.locator('[data-phonepick="'+choice+'"]')
   style=await selected.evaluate('(b)=>{const s=getComputedStyle(b);return {focus:b.matches(":focus-visible"),shadow:s.boxShadow,outline:s.outlineColor,color:s.color}}')
   assert style['focus'] and style['shadow']=='none' and style['outline']==style['color'],style
   await page.screenshot(path='tests/phone-selected-'+theme+'.png')
   assert await page.evaluate('localStorage.getItem("nph-me")') is None
   await prompt.locator('[data-phoneconfirm]').click()
   assert await page.evaluate('localStorage.getItem("nph-me")')==choice
   await page.reload();await page.wait_for_timeout(1200)
   assert not await page.locator('#dlg').evaluate('(d)=>d.open')
   await page.locator('#page-np [data-settings]').click()
   assert await page.locator('[data-meopt="'+choice+'"]').get_attribute('aria-pressed')=='true'
   other='P' if choice=='N' else 'N';await page.locator('[data-meopt="'+other+'"]').click()
   assert await page.evaluate('localStorage.getItem("nph-me")')==other
   assert not errors,errors
   await ctx.close()
  await browser.close()
  print('PASS: fresh P/N selection, confirmation, persistence, Settings changes; dark/light, 400px; no page errors')
asyncio.run(main())
