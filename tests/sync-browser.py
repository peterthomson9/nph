"""Only demo-nph and disposable profiles. All non-loopback requests are blocked."""
import asyncio,functools,http.server,json,pathlib,tempfile,threading,os
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_address[1]}/'
 errors=[]
 async with async_playwright() as pw:
  with tempfile.TemporaryDirectory(prefix='nph-sync-',ignore_cleanup_errors=True) as profiles:
   async def phone(name,offline=False):
    ctx=await pw.chromium.launch_persistent_context(str(pathlib.Path(profiles)/name),executable_path=BROWSER,viewport={'width':400,'height':900},timezone_id='Europe/London',is_mobile=True,has_touch=True,accept_downloads=True,offline=offline)
    async def local_only(route):
     if route.request.url.startswith(('http://127.0.0.1:','ws://127.0.0.1:')):await route.continue_()
     else:await route.abort()
    await ctx.route('**/*',local_only)
    await ctx.add_init_script("window.NPH_TEST_EMULATORS=true;localStorage.setItem('nph-me','"+('P' if name=='P' else 'N')+"');{const R=Date,T=new Date('2026-11-02T09:00:00').getTime(),off=T-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}")
    page=ctx.pages[0];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(url);await page.wait_for_function("typeof nphShared!=='undefined'");await page.evaluate('NPH_STORE.flush()')
    return ctx,page
   async def wait(page,expr):
    try:await page.wait_for_function(expr,timeout=30000)
    except Exception:
     print(await page.evaluate("({label:nphShared.label,error:nphShared.error,sharedError,binding:NPH_STORE.getSync(),body:document.querySelector('#card')?.innerText})"),flush=True)
     raise
   cp,p=await phone('P');cn,n=await phone('N')
   await p.evaluate("sharedAdapter.testSignIn('owner-'+crypto.randomUUID())")
   await n.evaluate("sharedAdapter.testSignIn('partner-'+crypto.randomUUID())")
   await wait(p,'nphShared.user!==null');await wait(n,'nphShared.user!==null')
   await p.evaluate("put('notes','sync-note',{text:'P starting copy'});put('stock','sync-stock',{qty:2});NPH_STORE.flush()")
   await n.evaluate("put('notes','n-local',{text:'N before joining'});NPH_STORE.flush()")
   await p.evaluate('openSettings()');await p.locator('[data-shared="create"]').click();await p.locator('[data-shared="confirm-create"]').click()
   await wait(p,"NPH_STORE.getSync()?.mode==='connected'&&nphShared.live&&!nphShared.pending")
   await p.locator('[data-shared="invite"]').click();await wait(p,"sharedInvitation.length===32")
   code=await p.evaluate('sharedInvitation')
   await n.evaluate('openSettings()');await n.locator('[data-shared="join"]').click();await n.locator('#shared-code').fill(code);await n.locator('[data-shared="confirm-join"]').click()
   await wait(n,"NPH_STORE.getSync()?.mode==='connected'&&nphShared.live&&!nphShared.pending")
   assert await n.evaluate("S.notes['sync-note'].text")=='P starting copy'
   assert await n.evaluate("!S.notes['n-local']")
   copies=await n.evaluate("NPH_STORE.snapshots")
   assert any('Before joining' in x['reason'] for x in copies)
   print('PASS: actual Auth/Firestore SDK, confirmed seed, invitation join and N pre-join recovery copy',flush=True)
   await p.evaluate("put('notes','sync-note',{text:'online edit'})")
   await wait(n,"S.notes['sync-note']?.text==='online edit'")
   await n.evaluate("put('notes','sync-note',null)")
   await wait(p,"!S.notes['sync-note']")
   print('PASS: bidirectional edits and durable deletion tombstones',flush=True)
   # Restart with a pending offline edit, then reconnect after P changed the same item.
   await cn.set_offline(True);await wait(n,'nphShared.online===false')
   await n.evaluate("put('notes','conflict',{text:'N queued offline'});put('notes','independent',{text:'N independent'});NPH_STORE.flush()")
   await wait(n,'nphShared.pending>=2')
   await p.evaluate("put('notes','conflict',{text:'P earlier commit'});NPH_STORE.flush()")
   await wait(p,'!nphShared.pending&&!nphShared.pumping')
   await cn.close();cn,n=await phone('N')
   await wait(n,"S.notes['conflict']?.text==='N queued offline'&&!nphShared.pending&&nphShared.live")
   await wait(p,"S.notes['conflict']?.text==='N queued offline'&&S.notes['independent']?.text==='N independent'")
   print('PASS: pending edits survive browser restart; later successful writes win; independent edits retained',flush=True)
   # Simulate losing the local acknowledgement after a successful server transaction.
   await n.evaluate("window.realAck=NPH_STORE.ackShared;NPH_STORE.ackShared=async()=>{throw Error('Simulated crash before local acknowledgement')};put('notes','ack-race',{text:'N first commit'});NPH_STORE.flush()")
   await wait(p,"S.notes['ack-race']?.text==='N first commit'")
   await wait(n,'nphShared.error!==null&&!nphShared.pumping')
   await p.evaluate("put('notes','ack-race',{text:'P later commit'});NPH_STORE.flush()")
   await wait(p,'!nphShared.pending&&!nphShared.pumping')
   await n.evaluate('NPH_STORE.ackShared=realAck;nphShared.retry()')
   await wait(n,"!nphShared.pending&&S.notes['ack-race']?.text==='P later commit'")
   assert await p.evaluate("S.notes['ack-race'].text")=='P later commit'
   print('PASS: retry after lost acknowledgement does not replay an old committed edit over a newer phone edit',flush=True)
   # One click's grouped changes reach the other phone as a single server snapshot.
   await n.evaluate("()=>{window.partialGroups=[];window.originalOnData=nphShared.onData;nphShared.onData=data=>{const count=Object.keys(data.notes).filter(k=>k.startsWith('group-')).length;if(count&&count!==140)partialGroups.push(count);originalOnData(data)}}")
   await p.evaluate("for(let i=0;i<140;i++)put('notes','group-'+i,{text:'Grouped change '+i});NPH_STORE.flush()")
   await wait(n,"Object.keys(S.notes).filter(k=>k.startsWith('group-')).length===140")
   assert await n.evaluate('partialGroups.length')==0
   print('PASS: 140-record action arrives atomically without partial groups',flush=True)
   # A failed phone transaction cannot send its changes to the cloud.
   await p.evaluate("window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='state')throw new DOMException('Simulated full storage','QuotaExceededError');return originalPut.apply(this,args)};put('notes','failed-local',{text:'Must not upload yet'});NPH_STORE.flush().catch(()=>{})")
   await wait(p,'NPH_STORE.error!==null');await asyncio.sleep(.3)
   assert await n.evaluate("!S.notes['failed-local']")
   await p.evaluate('IDBObjectStore.prototype.put=originalPut;NPH_STORE.save(S)')
   await wait(n,"S.notes['failed-local']?.text==='Must not upload yet'")
   print('PASS: failed local save never uploads; successful save retry retains and syncs the edit',flush=True)
   # Schema upgrade, exports and local-replacement guard.
   assert await n.evaluate("new Promise((resolve,reject)=>{const r=indexedDB.open('nph-local-v1',1);r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('current');q.onsuccess=()=>resolve(q.result.schema)}})")==2
   exported=await n.evaluate('makeBackup()');assert exported['formatVersion']==1 and exported['payload']['dataSchema']==1
   assert 'sync' not in exported['payload']['data']
   assert await n.evaluate("NPH_STORE.replace(NPH_STORE.read()).then(()=>false,()=>true)")
   await n.evaluate("NPH_STORE.save(S)")
   print('PASS: older app schema guard, compatible v1 exports and blocked phone-only restore while connected',flush=True)
   await n.evaluate('sharedAdapter.signOut()');await wait(n,'nphShared.user===null&&readOnly')
   await n.evaluate("put('notes','signed-out',{text:'Should be blocked'})")
   assert await n.evaluate("!S.notes['signed-out']")
   await n.evaluate("sharedAdapter.testSignIn('unrelated-'+crypto.randomUUID())")
   await wait(n,"nphShared.error!==null&&readOnly")
   assert await n.evaluate("S.notes['ack-race'].text")=='P later commit'
   print('PASS: signed-out and wrong-account editing is blocked without replacing saved data',flush=True)
   assert not errors,errors
   await cp.close();await cn.close()
 server.shutdown()
asyncio.run(main())
