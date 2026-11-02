"""Verify the release cache in a disposable localhost Brave context, then reload offline."""
import asyncio,functools,http.server,json,os,pathlib,threading,hashlib
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
   assert await page.evaluate('NPH_V')=='2.103'
   assert 'nph-2.103' in await page.evaluate('caches.keys()')
   assert await page.locator('head link[rel="manifest"]').get_attribute('href')=='./manifest.webmanifest'
   manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
   assert manifest['id']=='./' and manifest['start_url']=='./#np' and manifest['scope']=='./'
   icons=manifest['icons']+[i for s in manifest['shortcuts'] for i in s.get('icons',[])]
   for icon in icons:
    path,digest=icon['src'].split('?v=')
    assert hashlib.sha256((ROOT/path).read_bytes()).hexdigest().startswith(digest)
   await ctx.set_offline(True);await page.reload();await page.wait_for_timeout(400)
   assert await page.evaluate('NPH_V')=='2.103'
   for icon in icons:
    digest=await page.evaluate("""async path=>{const r=await fetch(path);if(!r.ok)throw Error('Icon unavailable');return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await r.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('')}""",icon['src'])
    assert digest.startswith(icon['src'].split('?v=')[1])
   assert await page.evaluate('Object.keys(PLANNERS.lh.R).length')==40
   assert not errors,errors
   print(json.dumps({'release':'2.103','cacheUpdated':True,'offlineReload':True,'recipes':40,'pageErrors':0}))
   await browser.close()
 finally: server.shutdown();server.server_close()
asyncio.run(main())
