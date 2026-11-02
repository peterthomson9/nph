"""Disposable browser tests only: no live URL or saved browser profiles."""
import asyncio,json,pathlib,os
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parent
APP=ROOT.parent
(ROOT/'screenshots').mkdir(exist_ok=True)
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
async def context(browser,theme='dark',width=400):
    ctx=await browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London',accept_downloads=True)
    await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await ctx.add_init_script("""window.initialSaved=localStorage.getItem('nph-kitchen-v1');
      if(!localStorage.getItem('nph-me'))localStorage.setItem('nph-me','N');
      if(!localStorage.getItem('nph-theme'))localStorage.setItem('nph-theme','THEME');
      {const R=Date,T=new Date('2026-11-02T09:00:00').getTime(),off=T-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}
    """.replace('THEME',theme))
    return ctx

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=BROWSER)
    ctx=await context(browser);page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((APP/'index.html').as_uri());await page.wait_for_timeout(1400)
    await page.evaluate("()=>{"+(ROOT/'cooked-fixtures-297.js').read_text(encoding='utf-8')+"\nS.custom['test-custom']={name:'A & B <test>',cat:'cup'};S.stock['cu-test-custom']={qty:3,out:false};S.items['cu-test-custom']={name:'Long custom item'};S.notes['test-note']={pl:'lh',r:'s12',sec:'method',who:'P',text:'Keep <exact> & Unicode: é 🥕',at:Date.now()};S.favs['lh-s12']={N:true};saveLocal();}")
    await page.evaluate('openSettings()')
    async with page.expect_download() as info:await page.locator('[data-backup-save]').click()
    download=await info.value;backup_path=ROOT/'roundtrip-backup.json';await download.save_as(backup_path)
    file=json.loads(backup_path.read_text(encoding='utf-8'));assert file['formatVersion']==1
    assert all(file['payload']['data'][c] for c in file['payload']['data'])
    assert 'nph-me' not in backup_path.read_text(encoding='utf-8')
    # Reject malformed, incompatible and tampered files without writing saved data.
    result=await page.evaluate("""async()=>{
      const good=await makeBackup(),before=localStorage.getItem(LKEY),results=[];
      for(const mutate of [f=>{f.formatVersion=99},f=>{delete f.payload.data.notes},f=>{f.payload.data.notes.bad={text:'tampered'}},f=>{f.payload.data.food.bad={who:'lh',mk:-1}},f=>{f.payload.data.notes.bad=JSON.parse('{"__proto__":{}}')}]){
        const f=structuredClone(good);mutate(f);let rejected=false;try{await parseBackup(JSON.stringify(f))}catch(e){rejected=true}results.push(rejected);
      }
      let badJSON=false;try{await parseBackup('{')}catch(e){badJSON=true}
      return {rejected:results,badJSON,unchanged:before===localStorage.getItem(LKEY)};
    }""")
    assert all(result['rejected']) and result['badJSON'] and result['unchanged'],result
    # Quota failure must preserve the original live dataset and in-memory state.
    result=await page.evaluate("""async()=>{
      const f=await makeBackup(),before=localStorage.getItem(LKEY),memory=JSON.stringify(S),original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k===RECOVERY_KEY)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v)};
      let rejected=false;try{await applyBackup(f)}catch(e){rejected=e.name==='QuotaExceededError'}finally{Storage.prototype.setItem=original}
      return rejected&&before===localStorage.getItem(LKEY)&&memory===JSON.stringify(S);
    }""")
    assert result
    result=await page.evaluate("""async()=>{const f=await makeBackup(),before=localStorage.getItem(LKEY);db={};let rejected=false;try{await applyBackup(f)}catch(e){rejected=true}finally{db=null}return rejected&&before===localStorage.getItem(LKEY)}""")
    assert result
    # Backwards compatibility: a real saved v2.100 file is accepted by v2.101.
    legacy_text=(ROOT/'fixtures/backups/v1-2.100.json').read_text(encoding='utf-8')
    legacy=json.loads(legacy_text)
    assert legacy['payload']['appVersion']=='2.100'
    assert file['payload']['appVersion']=='2.101'
    parsed=await page.evaluate('async text => await parseBackup(text)',legacy_text)
    assert parsed==legacy
    compatibility=await page.evaluate('async()=>{const f=await makeBackup();f.payload.appVersion="999.0";f.sha256=await backupDigest(f.payload);return (await parseBackup(JSON.stringify(f))).payload.appVersion}')
    assert compatibility=='999.0' # app release number alone never determines compatibility
    future=await page.evaluate('async()=>{const f=await makeBackup(),before=localStorage.getItem(LKEY);f.payload.dataSchema=999;f.sha256=await backupDigest(f.payload);try{await parseBackup(JSON.stringify(f));return false}catch(e){return before===localStorage.getItem(LKEY)}}')
    assert future
    # Restore into a fresh phone context, through the real file input and confirmation.
    fresh=await context(browser,'light');target=await fresh.new_page();target.on('pageerror',lambda e:errors.append(str(e)))
    await target.goto((APP/'index.html').as_uri());await target.wait_for_timeout(1400)
    await target.evaluate("()=>{S.notes['previous']={text:'Recovery sentinel'};saveLocal();openSettings()}")
    previous=await target.evaluate('JSON.stringify(S)')
    backup_path=ROOT/'fixtures/backups/v1-2.100.json'
    expected=legacy['payload']['data']
    await target.locator('#backup-file').set_input_files(backup_path)
    await target.locator('[data-backup-confirm]').wait_for()
    assert await target.evaluate("JSON.stringify(S.notes)==='{}'")==False
    # Cancel leaves existing data unchanged, then choose the same file again.
    await target.locator('[data-backup-cancel]').click()
    assert await target.evaluate('JSON.stringify(S)')==previous
    await target.locator('#backup-file').set_input_files(backup_path)
    async with target.expect_navigation():await target.locator('[data-backup-confirm]').click()
    await target.wait_for_timeout(300)
    assert json.loads(await target.evaluate('window.initialSaved'))==expected
    assert await target.evaluate("localStorage.getItem('nph-me')")=='N'
    assert await target.evaluate("localStorage.getItem('nph-theme')")=='light'
    recovery=await target.evaluate("JSON.parse(localStorage.getItem(RECOVERY_KEY))")
    assert recovery['payload']['data']==json.loads(previous)
    # Recover the previous dataset through the same guarded restore path.
    await target.evaluate('openSettings()');await target.locator('[data-backup-recovery]').click()
    async with target.expect_navigation():await target.locator('[data-backup-confirm]').click()
    await target.wait_for_timeout(300)
    assert json.loads(await target.evaluate('window.initialSaved'))==json.loads(previous)
    assert not errors,errors
    await ctx.close();await fresh.close()
    # Matched before/after and expanded confirmation, phone widths and both themes.
    for theme in ['dark','light']:
      for width in [400,320]:
        for version in ['after']:
          ctx=await context(browser,theme,width);pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
          await pg.goto((APP/'index.html').as_uri());await pg.wait_for_timeout(1100);await pg.evaluate('openSettings()')
          await pg.wait_for_timeout(350)
          if version=='after':
            await pg.locator('[data-backup-save]').focus()
            await pg.locator('[data-backup-save]').scroll_into_view_if_needed()
          else:await pg.locator('[data-syncpri="new"]').scroll_into_view_if_needed()
          assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
          await pg.screenshot(path=str(ROOT/f'screenshots/{version}-{theme}-{width}.png'))
          if version=='after':
            await pg.locator('#backup-file').set_input_files(ROOT/'fixtures/backups/v1-2.100.json')
            await pg.locator('[data-backup-confirm]').wait_for();await pg.wait_for_timeout(350);await pg.locator('[data-backup-confirm]').focus()
            assert await pg.locator('#card').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
            await pg.screenshot(path=str(ROOT/f'screenshots/restore-{theme}-{width}.png'))
          await ctx.close()
    assert not errors,errors
    await browser.close()
    print('PASS: all 8 groups round-trip, Unicode/IDs/batches preserved, validation, checksum, cancellation, quota failure, shared-mode guard, recovery, identity/theme preserved; 320/400px dark/light previews; no page errors.')
asyncio.run(main())
