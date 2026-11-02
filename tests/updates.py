"""Exercise real SW upgrades on localhost, with disposable profiles and saved data."""
import asyncio,functools,http.server,json,pathlib,shutil,subprocess,tempfile,threading,os
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT.parent
(ROOT/'screenshots').mkdir(exist_ok=True)
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def deploy(target,version='2.105',broken=False):
    shutil.copytree(SOURCE/'icons',target/'icons',dirs_exist_ok=True)
    for name in ['index.html','sw.js','release.json','manifest.webmanifest']:shutil.copy2(SOURCE/name,target/name)
    for file in ['index.html','sw.js','release.json']:
        path=target/file
        path.write_text(path.read_text(encoding='utf-8').replace('2.105',version),encoding='utf-8')
    if broken:(target/'release.json').write_text(json.dumps({'version':'wrong','updateProtocol':1}),encoding='utf-8')
async def main():
 with tempfile.TemporaryDirectory(prefix='nph-update-tests-') as folder:
  webroot=pathlib.Path(folder)/'nph';webroot.mkdir();deploy(webroot)
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=folder))
  threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_address[1]}/nph/'
  try:
   async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=BROWSER)
    async def new_context(theme='dark',width=400):
      ctx=await browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London')
      await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
      await ctx.add_init_script("if(!localStorage.getItem('nph-me'))localStorage.setItem('nph-me','P');if(!localStorage.getItem('nph-theme'))localStorage.setItem('nph-theme','"+theme+"');window.initialSaved=localStorage.getItem('nph-kitchen-v1');")
      return ctx
    ctx=await new_context();page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(url);await page.wait_for_function("typeof UPD!=='undefined' && UPD.reg && UPD.reg.active && !UPD.checking")
    await page.evaluate('navigator.serviceWorker.ready');await page.reload();await page.wait_for_function("typeof UPD!=='undefined' && !UPD.checking")
    assert await page.evaluate('NPH_V')=='2.105'
    print('PASS: first install',flush=True)
    await page.evaluate("()=>{"+(SOURCE/'tests/cooked-fixtures-297.js').read_text(encoding='utf-8')+"\nS.custom.test={name:'Test custom item',cat:'cup'};S.stock.test={out:false,qty:3};S.items.test={name:'Test item'};S.favs.test={P:true};S.notes['upgrade-test']={text:'Keep IDs, 🥕 and <text>',who:'P'};saveLocal();localStorage.setItem(RECOVERY_KEY,'recovery sentinel');caches.open('other-app-cache').then(c=>c.put('/unrelated',new Response('keep')))}")
    await page.evaluate('NPH_STORE.flush()')
    saved=await page.evaluate('JSON.stringify(S)')
    # A partial deployment fails installation and leaves the previous app/cache usable.
    deploy(webroot,'2.106',broken=True)
    await page.evaluate('checkUpdates(true)')
    assert await page.evaluate('NPH_V')=='2.105'
    assert not await page.evaluate('!!UPD.reg.waiting')
    assert 'nph-2.105' in await page.evaluate('caches.keys()')
    print('PASS: incomplete release rejected',flush=True)
    deploy(webroot,'2.106')
    await page.evaluate('checkUpdates(true)');await page.wait_for_function("UPD.ready==='2.106'")
    assert await page.evaluate('NPH_V')=='2.105' # never reload just because an update arrived
    await page.locator('#app-update').wait_for(state='visible')
    await page.locator('[data-update-view]').click()
    assert await page.locator('#update-section').is_visible()
    # Editor and pending-write guards; no activation or storage reset.
    await page.evaluate('editing=true;applyUpdate()');assert await page.evaluate('!UPD.requested')
    await page.evaluate("editing=false;pend.set('dummy',{col:'notes',id:'dummy',data:{}});applyUpdate()")
    assert await page.evaluate('!UPD.requested');await page.evaluate('pend.clear()')
    denied=await page.evaluate("""async()=>{S.notes["quota-test"]={text:"Not yet saved"};const old=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='state')throw new DOMException('full','QuotaExceededError');return old.apply(this,args)};try{await applyUpdate();return !UPD.requested&&UPD.status.includes('storage')}finally{IDBObjectStore.prototype.put=old}}""")
    assert denied
    await page.evaluate("NPH_STORE.save(S)")
    saved=await page.evaluate("JSON.stringify(S)")
    # Another tab must retain unsaved edits when the first tab activates the release.
    second=await ctx.new_page();second.on('pageerror',lambda e:errors.append(str(e)))
    await second.goto(url+'#shop');await second.wait_for_function("typeof UPD!=='undefined' && UPD.reg && !UPD.checking")
    print('Two-window revisions:',await page.evaluate('NPH_STORE.revision'),await second.evaluate('NPH_STORE.revision'),flush=True)
    # Opening the fixture in a real second app can materialise normal derived food.
    # Reload its latest committed state before asking the first tab to update;
    # stale-write refusal is tested separately in storage.py.
    await page.reload();await page.wait_for_function("typeof UPD!=='undefined' && UPD.reg && !UPD.checking")
    await page.evaluate('NPH_STORE.flush()');saved=await page.evaluate('JSON.stringify(S)')
    await page.evaluate('openSettings()')
    await second.evaluate("editing=true;window.editSentinel='unsaved text'")
    async with page.expect_navigation():await page.locator('[data-update-apply]').click()
    await page.wait_for_function("typeof UPD!=='undefined' && NPH_V==='2.106' && !UPD.checking")
    assert json.dumps(await page.evaluate('NPH_STORE.initial'),sort_keys=True)==json.dumps(json.loads(saved),sort_keys=True)
    assert await page.evaluate("localStorage.getItem(RECOVERY_KEY)")=='recovery sentinel'
    assert await page.evaluate("localStorage.getItem('nph-me')")=='P'
    await second.wait_for_function('UPD.reloadReady')
    assert await second.evaluate("NPH_V==='2.105'&&editing&&window.editSentinel==='unsaved text'")
    assert 'other-app-cache' in await page.evaluate('caches.keys()')
    print('PASS: modern activation, save guards, other-tab edit preservation',flush=True)
    # An already downloaded update can be activated while offline.
    deploy(webroot,'2.107');await page.evaluate('checkUpdates(true)');await page.wait_for_function("UPD.ready==='2.107'")
    await ctx.set_offline(True);await page.evaluate('checkUpdates(true)')
    assert await page.evaluate('UPD.status.includes("ready")')
    await page.evaluate('openSettings()')
    async with page.expect_navigation():await page.locator('[data-update-apply]').click()
    await page.wait_for_function("typeof UPD!=='undefined' && NPH_V==='2.107' && !UPD.checking")
    assert await page.evaluate("S.notes['upgrade-test'].text")=='Keep IDs, 🥕 and <text>'
    await page.evaluate('checkUpdates(true)');assert await page.evaluate('UPD.status.includes("Offline")'),await page.evaluate('({status:UPD.status,ready:UPD.ready,reloadReady:UPD.reloadReady,online:navigator.onLine,checking:UPD.checking})')
    await ctx.close()
    print('PASS: downloaded activation and reopening offline',flush=True)
    # Real v2.83 cache + one-time transition navigation -> update-aware release.
    old_html=subprocess.check_output(['git','show','991934c:index.html'],cwd=SOURCE,text=True,encoding='utf-8')
    old_sw=subprocess.check_output(['git','show','991934c:sw.js'],cwd=SOURCE,text=True)
    (webroot/'index.html').write_text(old_html,encoding='utf-8');(webroot/'sw.js').write_text(old_sw,encoding='utf-8')
    legacy=await new_context();old=await legacy.new_page();old.on('pageerror',lambda e:errors.append(str(e)))
    await old.goto(url);await old.evaluate("async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready}")
    await old.reload();assert await old.evaluate('NPH_V')=='2.83'
    print('Legacy v2.83 installed; testing transition',flush=True)
    await old.evaluate("()=>{S.notes['legacy-sentinel']={text:'Old phone data'};saveLocal();localStorage.setItem('legacy-pref','keep')}")
    deploy(webroot)
    await old.goto(url+'?nph-update=1#shop')
    await old.wait_for_function("typeof UPD!=='undefined'&&NPH_V==='2.105'",timeout=30000)
    assert await old.evaluate("S.notes['legacy-sentinel'].text")=='Old phone data'
    assert await old.evaluate("localStorage.getItem('legacy-pref')")=='keep'
    assert 'nph-update' not in old.url
    await legacy.close()
    print('PASS: real v2.83 transition with saved data intact',flush=True)
    # Actual before/after Settings and available notice, both themes and phone sizes.
    deploy(webroot)
    for theme in ['dark','light']:
     for width in [400,320]:
      for name in ['after']:
       ctx=await new_context(theme,width);pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
       if name=='before':await pg.goto((ROOT/'before/index.html').as_uri())
       else:await pg.goto(url);await pg.wait_for_function("typeof UPD!=='undefined' && UPD.reg && !UPD.checking")
       await pg.evaluate('openSettings()');await pg.wait_for_timeout(350)
       if name=='after':
        await pg.evaluate("UPD.ready='2.106';UPD.status='v2.106 is ready. Your saved data will be kept.';paintUpdate()")
        await pg.locator('[data-update-apply]').focus();await pg.locator('#update-section').scroll_into_view_if_needed()
       else:await pg.locator('[data-backup-save]').scroll_into_view_if_needed()
       assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
       await pg.screenshot(path=str(ROOT/f'screenshots/{name}-{theme}-{width}.png'))
       if name=='after':
        await pg.evaluate("document.getElementById('dlg').close();paintUpdate()")
        await pg.wait_for_timeout(300)
        assert await pg.locator('#app-update').is_visible()
        assert await pg.locator('#app-update').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
        await pg.screenshot(path=str(ROOT/f'screenshots/notice-{theme}-{width}.png'))
       await ctx.close()
    assert not errors,errors
    await browser.close()
    print('PASS: legacy v2.83 transition, partial release rejected, modern waiting/update activation, exact saved data/recovery/preferences preserved, edit/sync/quota guards, no forced reload of another editing tab, offline activation/reopen, unrelated caches preserved; 320/400px light/dark screenshots; no page errors.')
  finally:server.shutdown();server.server_close()
asyncio.run(main())
