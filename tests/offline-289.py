"""Verify the release cache in a disposable localhost Brave context, then reload offline."""
import asyncio,functools,http.server,json,os,pathlib,threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(**({'executable_path':os.environ['BROWSER_EXE']} if os.environ.get('BROWSER_EXE') else {}))
   ctx=await browser.new_context(viewport={'width':400,'height':860},timezone_id='Europe/London')
   await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
   await ctx.add_init_script("localStorage.setItem('nph-me','P')")
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(f'http://127.0.0.1:{server.server_address[1]}/index.html')
   await page.evaluate("async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready}")
   await page.reload();await page.wait_for_timeout(400)
   assert await page.evaluate('NPH_V')=='2.101'
   assert 'nph-2.101' in await page.evaluate('caches.keys()')
   await ctx.set_offline(True);await page.reload();await page.wait_for_timeout(400)
   assert await page.evaluate('NPH_V')=='2.101'
   assert await page.evaluate('Object.keys(PLANNERS.lh.R).length')==40
   assert not errors,errors
   print(json.dumps({'release':'2.101','cacheUpdated':True,'offlineReload':True,'recipes':40,'pageErrors':0}))
   await browser.close()
 finally: server.shutdown();server.server_close()
asyncio.run(main())
