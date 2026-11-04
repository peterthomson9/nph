"""Disposable localhost/Brave storage migration, failure and recovery checks."""
import asyncio,functools,http.server,json,pathlib,tempfile,threading,os,time
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT.parent
(ROOT/'screenshots').mkdir(exist_ok=True)
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
LEGACY=json.loads((SOURCE/'tests/fixtures/backups/v1-2.100.json').read_text(encoding='utf-8'))
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def setup(ctx,theme='dark',seed=True):
 await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
 # One offset per browser context: reloading must not rewind the test clock.
 offset=1793610000000-int(time.time()*1000) # 2 Nov 2026, 09:00 UTC
 await ctx.add_init_script("""if(!localStorage.getItem('nph-me'))localStorage.setItem('nph-me','N');if(!localStorage.getItem('nph-theme'))localStorage.setItem('nph-theme','THEME');{const R=Date,off=OFFSET;window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}""".replace('THEME',theme).replace('OFFSET',str(offset)))
 if seed:
  await ctx.add_init_script("if(!localStorage.getItem('nph-kitchen-v1')){localStorage.setItem('nph-kitchen-v1',"+json.dumps(json.dumps(LEGACY['payload']['data'],ensure_ascii=False))+ ");localStorage.setItem('nph-recovery-v1',"+json.dumps(json.dumps(LEGACY,ensure_ascii=False))+")}")
async def ready(page,url):
 await page.goto(url)
 await page.wait_for_function("typeof S!=='undefined'&&typeof NPH_STORE!=='undefined'")
 await page.evaluate('NPH_STORE.flush()')
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(SOURCE)))
 threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_address[1]}/'
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(executable_path=BROWSER)
   ctx=await browser.new_context(viewport={'width':400,'height':900},timezone_id='Europe/London',accept_downloads=True);await setup(ctx)
   page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await ready(page,url)
   assert await page.evaluate('NPH_STORE.initial')==LEGACY['payload']['data']
   legacy_raw=await page.evaluate('localStorage.getItem(LKEY)')
   assert json.loads(legacy_raw)==LEGACY['payload']['data']
   assert len(await page.evaluate('NPH_STORE.snapshots'))>=2
   await page.evaluate("async()=>{put('notes','durable-note',{text:'Keep 🥕 & <text>'});await NPH_STORE.flush()}")
   expected=await page.evaluate('NPH_STORE.read()')
   await page.reload();await page.wait_for_function("typeof S!=='undefined'")
   assert await page.evaluate('NPH_STORE.initial')==expected
   assert await page.evaluate('localStorage.getItem(LKEY)')==legacy_raw
   assert await page.evaluate("localStorage.getItem('nph-me')")=='N'
   print('PASS: all eight groups migrated, original save retained, reload reads IndexedDB, identity retained',flush=True)
   # A checkpoint is made before a later change and before every explicit restore.
   before_count=len(await page.evaluate('NPH_STORE.snapshots'))
   await page.evaluate("async()=>{const R=Date;window.Date=class extends R{static now(){return R.now()+31*60*1000}};put('notes','later',{text:'Later save'});await NPH_STORE.flush()}")
   assert len(await page.evaluate('NPH_STORE.snapshots'))>before_count
   # Fail after the snapshot write was queued; both snapshot and state must roll back.
   result=await page.evaluate("""async()=>{
     const before=JSON.stringify(NPH_STORE.read()),snapshots=JSON.stringify(NPH_STORE.snapshots),put=IDBObjectStore.prototype.put;
     IDBObjectStore.prototype.put=function(...args){if(this.name==='state')throw new DOMException('Full','QuotaExceededError');return put.apply(this,args)};
     let failed=false;try{await NPH_STORE.replace(Object.fromEntries(COLS.map(c=>[c,{}])))}catch(e){failed=e.name==='QuotaExceededError'}finally{IDBObjectStore.prototype.put=put}
     const same=before===JSON.stringify(NPH_STORE.read())&&snapshots===JSON.stringify(NPH_STORE.snapshots);
     await NPH_STORE.save(S);return {failed,same};
   }""")
   assert result=={'failed':True,'same':True},result
   print('PASS: periodic checkpoint and atomic quota-failure rollback',flush=True)
   # Stale windows cannot overwrite a successful save made in another window.
   second=await ctx.new_page();await ready(second,url)
   await page.evaluate("async()=>{put('notes','first-window',{text:'Latest committed'});await NPH_STORE.flush()}")
   result=await second.evaluate("""async()=>{S.notes['stale-window']={text:'Unsaved in stale window'};try{await saveLocal();return false}catch(e){return e.name==='NPHConflict'&&NPH_STORE.conflict}}""")
   assert result
   await page.reload();await page.wait_for_function("typeof S!=='undefined'")
   assert await page.evaluate("!!S.notes['first-window']&&!S.notes['stale-window']")
   # An old app's localStorage write is captured as a recoverable alternative.
   older={**LEGACY['payload']['data'],'notes':{'old-window':{'text':'Older app wrote this'}}}
   await second.evaluate("data=>localStorage.setItem('nph-kitchen-v1',JSON.stringify(data))",older)
   await page.wait_for_function("NPH_STORE.snapshots.some(s=>s.reason==='Saved by an older app window')")
   snap=await page.evaluate("async()=>await NPH_STORE.getSnapshot(NPH_STORE.snapshots.find(s=>s.reason==='Saved by an older app window').id)")
   assert snap['data']==older
   await second.close()
   print('PASS: stale-window guard and older-window save captured without replacing current data',flush=True)
   # Snapshot retention remains bounded; restore an old exported file using the real UI.
   await page.evaluate("async()=>{for(let i=0;i<15;i++){const data=NPH_STORE.read();data.notes['snapshot-test']={text:String(i)};await NPH_STORE.replace(data)}}")
   assert len(await page.evaluate('NPH_STORE.snapshots'))<=12
   await page.reload();await page.wait_for_function("typeof S!=='undefined'");await page.evaluate('NPH_STORE.flush()')
   previous=await page.evaluate('NPH_STORE.read()')
   previous_snapshot_ids=set(await page.evaluate('NPH_STORE.snapshots.map(s=>s.id)'))
   await page.evaluate('openSettings()');await page.locator('#backup-file').set_input_files(SOURCE/'tests/fixtures/backups/v1-2.100.json')
   await page.locator('[data-backup-confirm]').wait_for()
   await page.locator('[data-backup-cancel]').click();assert await page.evaluate('NPH_STORE.read()')==previous
   await page.locator('#backup-file').set_input_files(SOURCE/'tests/fixtures/backups/v1-2.100.json')
   async with page.expect_navigation():await page.locator('[data-backup-confirm]').click()
   await page.wait_for_function("typeof S!=='undefined'")
   assert await page.evaluate('NPH_STORE.initial')==LEGACY['payload']['data']
   copies=await page.evaluate('NPH_STORE.snapshots')
   restore=next(s for s in copies if s['reason']=='Before restoring data' and s['id'] not in previous_snapshot_ids)
   snapshot=await page.evaluate('async id=>await NPH_STORE.getSnapshot(id)',restore['id'])
   assert snapshot['data']==previous, {col:{key:{'before':previous[col].get(key),'saved':snapshot['data'][col].get(key)} for key in previous[col].keys()|snapshot['data'][col].keys() if previous[col].get(key)!=snapshot['data'][col].get(key)} for col in previous if previous[col]!=snapshot['data'][col]}
   await page.evaluate('openSettings()');await page.locator('[data-storage-recovery]').click()
   await page.locator('[data-snapshot-review="'+restore['id']+'"]').click()
   async with page.expect_navigation():await page.locator('[data-backup-confirm]').click()
   await page.wait_for_function("typeof S!=='undefined'")
   assert await page.evaluate('NPH_STORE.initial')==previous
   assert len(await page.evaluate('NPH_STORE.snapshots'))<=12
   await page.evaluate('openSettings()')
   async with page.expect_download() as info:await page.locator('[data-backup-save]').click()
   download=await info.value;await download.save_as(ROOT/'roundtrip-backup.json')
   exported=json.loads((ROOT/'roundtrip-backup.json').read_text(encoding='utf-8'))
   assert exported['formatVersion']==1 and exported['payload']['dataSchema']==1
   assert exported['payload']['data']==await page.evaluate('JSON.parse(JSON.stringify(S))')
   assert not errors,errors
   print('PASS: 12-copy retention, v1 backup import/export, cancellation and recovery restore',flush=True)
   await ctx.close()
   # Do not replace unreadable legacy data with an empty planner.
   bad=await browser.new_context(viewport={'width':320,'height':900});await setup(bad,seed=False)
   await bad.add_init_script("localStorage.setItem('nph-kitchen-v1','{broken')")
   pg=await bad.new_page();await pg.goto(url);await pg.wait_for_function("typeof NPH_STORAGE_BOOT_ERROR!=='undefined'")
   assert await pg.evaluate("localStorage.getItem('nph-kitchen-v1')")=='{broken'
   assert await pg.evaluate("typeof S==='undefined'")
   assert await pg.locator('[role="alert"]').evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}')
   await pg.screenshot(path=str(ROOT/'screenshots/startup-error-dark-320.png'))
   await bad.close()
   print('PASS: unreadable migration is blocked without replacing original data',flush=True)
   quota=await browser.new_context(viewport={'width':400,'height':900});await setup(quota,'light')
   await quota.add_init_script("{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='state')throw new DOMException('Full','QuotaExceededError');return original.apply(this,args)}}")
   pg=await quota.new_page();expected_errors=[];pg.on('pageerror',lambda e:expected_errors.append(str(e)));await pg.goto(url)
   await pg.wait_for_function("typeof NPH_STORAGE_BOOT_ERROR!=='undefined'")
   assert await pg.evaluate("typeof S==='undefined'")
   assert json.loads(await pg.evaluate("localStorage.getItem('nph-kitchen-v1')"))==LEGACY['payload']['data']
   assert not expected_errors,expected_errors
   await pg.screenshot(path=str(ROOT/'screenshots/startup-error-light-400.png'))
   await quota.close()
   quota=await browser.new_context();await setup(quota)
   await quota.add_init_script("{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='snapshots')throw new DOMException('Full','QuotaExceededError');return original.apply(this,args)}}")
   pg=await quota.new_page();await pg.goto(url);await pg.wait_for_function("typeof NPH_STORAGE_BOOT_ERROR!=='undefined'")
   assert await pg.evaluate("typeof S==='undefined'")
   assert await pg.evaluate("""async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('nph-local-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const value=await new Promise((resolve,reject)=>{const r=db.transaction('state','readonly').objectStore('state').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return value===undefined}""")
   await quota.close()
   print('PASS: migration quota failure leaves the original save untouched',flush=True)
   # Render the actual new settings, recovery list and replacement warning.
   for theme in ['dark','light']:
    for width in [400,320]:
     for name in ['after']:
      c=await browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London');await setup(c,theme)
      pg=await c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
      if name=='before':await pg.goto((ROOT/'before/index.html').as_uri());await pg.wait_for_timeout(1100)
      else:
       await ready(pg,url)
       await pg.wait_for_function('typeof UPD!=="undefined"&&!UPD.checking')
       assert not await pg.evaluate('UPD.ready===NPH_V')
      await pg.evaluate('openSettings()');await pg.wait_for_timeout(350)
      await pg.locator('[data-backup-save]').scroll_into_view_if_needed()
      assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
      await pg.screenshot(path=str(ROOT/f'screenshots/{name}-{theme}-{width}.png'))
      await pg.locator('section.sgrp').filter(has=pg.locator('[data-backup-save]')).screenshot(path=str(ROOT/f'screenshots/{name}-backup-{theme}-{width}.png'))
      if name=='after':
       await pg.locator('[data-storage-recovery]').click();await pg.wait_for_timeout(350)
       await pg.locator('[data-snapshot-review]').first.focus()
       assert await pg.locator('#card').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
       await pg.screenshot(path=str(ROOT/f'screenshots/recovery-{theme}-{width}.png'))
       await pg.locator('#dlg').screenshot(path=str(ROOT/f'screenshots/recovery-dialog-{theme}-{width}.png'))
       await pg.locator('[data-snapshot-review]').first.click();await pg.wait_for_timeout(350)
       await pg.locator('[data-backup-confirm]').focus()
       await pg.screenshot(path=str(ROOT/f'screenshots/confirm-{theme}-{width}.png'))
      await c.close()
   assert not errors,errors
   await browser.close()
   # Confirm committed data survives an actual browser/profile restart.
   with tempfile.TemporaryDirectory(prefix='nph-durable-profile-') as profile:
    persistent=await p.chromium.launch_persistent_context(profile,executable_path=BROWSER,headless=True);await setup(persistent)
    pg=await persistent.new_page();await ready(pg,url)
    await pg.evaluate("async()=>{put('notes','restart',{text:'Survives browser close'});await NPH_STORE.flush()}")
    await persistent.close()
    persistent=await p.chromium.launch_persistent_context(profile,executable_path=BROWSER,headless=True);await setup(persistent)
    pg=await persistent.new_page();await ready(pg,url)
    assert await pg.evaluate("S.notes.restart.text")=='Survives browser close'
    await persistent.close()
   print('PASS: actual browser restart; dark/light 320/400px recovery screens; no page errors')
 finally:server.shutdown();server.server_close()
asyncio.run(main())
