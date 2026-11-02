"""Real worker activation must await late IndexedDB saves before reload."""
import asyncio,functools,http.server,json,pathlib,shutil,tempfile,threading,os,subprocess
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT.parent
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def deploy(target,version):
 shutil.copytree(SOURCE/'icons',target/'icons',dirs_exist_ok=True)
 for name in ['index.html','sw.js','release.json','manifest.webmanifest']:shutil.copy2(SOURCE/name,target/name)
 for name in ['index.html','sw.js','release.json']:
  path=target/name;path.write_text(path.read_text(encoding='utf-8').replace('2.104',version),encoding='utf-8')
async def main():
 with tempfile.TemporaryDirectory(prefix='nph-store-upgrade-') as folder:
  deploy(pathlib.Path(folder),'2.104')
  # Start with the real previously published localStorage app and worker.
  for name in ['index.html','sw.js','release.json','manifest.webmanifest']:
   old=subprocess.check_output(['git','show','51351eb:'+name],cwd=SOURCE)
   (pathlib.Path(folder)/name).write_bytes(old)
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=folder))
  threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_address[1]}/'
  try:
   async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=BROWSER)
    ctx=await browser.new_context();await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await ctx.add_init_script("localStorage.setItem('nph-me','P')")
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(url);await page.wait_for_function("typeof UPD!=='undefined'&&UPD.reg&&UPD.reg.active&&!UPD.checking")
    await page.reload();await page.wait_for_function("typeof UPD!=='undefined'&&!UPD.checking")
    await page.evaluate("()=>{put('notes','before-migration',{text:'Real v2.103 save'});saveLocal()}")
    original=await page.evaluate('localStorage.getItem(LKEY)')
    deploy(pathlib.Path(folder),'2.104');await page.evaluate('checkUpdates(true)');await page.wait_for_function("UPD.ready==='2.104'")
    await page.evaluate('openSettings()')
    async with page.expect_navigation():await page.locator('[data-update-apply]').click()
    await page.wait_for_function("typeof NPH_STORE!=='undefined'&&typeof UPD!=='undefined'&&NPH_V==='2.104'")
    assert await page.evaluate("NPH_STORE.initial.notes['before-migration'].text")=='Real v2.103 save'
    assert await page.evaluate('localStorage.getItem(LKEY)')==original
    await page.wait_for_function('!UPD.checking')
    print('PASS: real published v2.103 -> v2.104 update migrates the last phone save',flush=True)
    deploy(pathlib.Path(folder),'2.105')
    await page.evaluate('checkUpdates(true)');await page.wait_for_function("UPD.ready==='2.105'")
    await page.evaluate("""()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>{put('notes','late-save',{text:'Saved during activation'});saveLocal().catch(()=>{})},{once:true});openSettings()}""")
    async with page.expect_navigation():await page.locator('[data-update-apply]').click()
    await page.wait_for_function("typeof UPD!=='undefined'&&NPH_V==='2.105'")
    assert await page.evaluate("NPH_STORE.initial.notes['late-save'].text")=='Saved during activation'
    await page.wait_for_function('!UPD.checking')
    deploy(pathlib.Path(folder),'2.106');await page.evaluate('checkUpdates(true)');await page.wait_for_function("UPD.ready==='2.106'")
    await page.evaluate("()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>{editing=true;window.editSentinel='Keep this edit'},{once:true});openSettings()}")
    await page.locator('[data-update-apply]').click()
    await page.wait_for_function('UPD.reloadReady&&!UPD.requested')
    assert await page.evaluate("NPH_V==='2.105'&&editing&&window.editSentinel==='Keep this edit'")
    await page.evaluate('editing=false')
    async with page.expect_navigation():await page.locator('[data-update-apply]').click()
    await page.wait_for_function("typeof UPD!=='undefined'&&NPH_V==='2.106'")
    assert await page.evaluate('NPH_V')=='2.106'
    assert await page.evaluate("S.notes['late-save'].text")=='Saved during activation'
    assert not errors,errors
    await browser.close()
    print('PASS: actual worker activation flushes late IndexedDB saves; a newly opened edit defers reload; retry preserves data.')
  finally:server.shutdown();server.server_close()
asyncio.run(main())
