"""Direct page links have no initial transition; navigation/calendar do not edit data."""
import asyncio,pathlib,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe'))
  c=await b.new_context(viewport={'width':400,'height':900});await c.route('**/fonts.googleapis.com/**',lambda r:r.abort());await c.add_init_script("localStorage.setItem('nph-me','P')")
  pg=await c.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.goto((ROOT.parent/'index.html').as_uri()+'#shop');await pg.wait_for_function("typeof S!=='undefined'");await pg.evaluate('NPH_STORE.flush()')
  assert await pg.evaluate("current==='shop'&&pageMotion===null")
  before=await pg.evaluate('JSON.stringify(S)')
  await pg.evaluate("go('lilh',true)");assert await pg.evaluate('pageMotion!==null');await pg.wait_for_timeout(220)
  await pg.evaluate("dlgOwner='lh';LH.openCal();LH.calClick(document.querySelector('[data-cal=\"1\"]'))");await pg.wait_for_timeout(220)
  await pg.evaluate("document.getElementById('dlg').close();go('np',true)");await pg.wait_for_timeout(220)
  assert await pg.evaluate('JSON.stringify(S)')==before
  assert not errors,errors
  await b.close();print('PASS: direct Stock link starts without a wrong-page animation; navigation/calendar leave saved records unchanged.')
asyncio.run(main())
