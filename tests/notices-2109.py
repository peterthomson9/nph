"""Batch-based swap notices and dismiss-first presses, disposable phone data."""
import asyncio,pathlib,sys,json
from playwright.async_api import async_playwright
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent/'stock2107'))
from test_ui import setup,BROWSER,APP,OUT
async def seed(pg,who):
 return await pg.evaluate("""who=>{
 materialiseFood0=()=>false;const SK='__skip';S.food={};S.pn={};S.lh={};S.stock={};S.items={};SHNEED.pn=null;SHNEED.lh=null;SHV++;
 for(const P of Object.values(PLANNERS)){const t=P._dbg.todayN();for(let n=t-8;n<t+9;n++){S[P.id]['b-'+n]={v:SK};for(const sl of ['L','D'])S[P.id]['x-'+sl+n]={v:SK}}}
 for(const [k] of PN_ING)S.stock['pn-'+k]={out:true};for(const [k] of LH_ING)S.stock['lh-'+k]={out:true};
 const P=PLANNERS[who],t=P._dbg.todayN(),r=who==='pn'?'beefstew':'s12';
 for(const n of [t-1,t,t+1,t+3,t+4])S[who]['x-L'+n]={v:r};
 if(who==='pn')S.pn['sp-L'+(t-1)]={p:'frittata'};
 S.food.source=P.newLot('L',t-1,r);S[who]['x-D'+(t+2)]={v:r};S[who]['fz-mD'+(t+2)]={f:'source',p:P.perDay,w:'fridge'};
 if(who==='pn')for(const n of [t+3,t+4])S.pn['x-D'+n]={v:'avoeggs'};
 SHV++;go(who==='pn'?'np':'lilh');finishPageMotion();P.setHu(true);return {t,r};
 }""",who)
async def main():
 errors=[];results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['light','dark']:
   for width in [320,400]:
    for who in ['pn','lh']:
     c=await b.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True);await setup(c,theme);pg=await c.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'")
     data=await seed(pg,who);t=data['t'];P='PN' if who=='pn' else 'LH';prefix='#'+who
     await pg.wait_for_timeout(300);await pg.locator(prefix+'-hul [data-hugroup="swaps"]').click();await pg.wait_for_timeout(280)
     rows=pg.locator(prefix+'-hu-swaps [data-hu]');acts=await rows.evaluate_all('es=>es.map(e=>e.dataset.hu)')
     assert acts.count('cook:m:L:'+str(t-1))==1,acts
     assert acts.count('cook:m:L:'+str(t+3))==1,acts
     assert 'cook:m:D:'+str(t+2) not in acts,acts
     assert await rows.count()==(4 if who=='pn' else 2),acts
     assert 'Meal cooked' in await rows.first.inner_text()
     assert 'Meal to cook' in await rows.nth(1).inner_text()
     if who=='pn':assert all('cook:m:D:'+str(n) in acts for n in [t+3,t+4]),acts
     before=await pg.evaluate('JSON.stringify(S)')
     await pg.screenshot(path=str(OUT/f'batches-{who}-{theme}-{width}.png'))
     await rows.first.click();await pg.wait_for_timeout(550)
     target=pg.locator(f'#page-{ "np" if who=="pn" else "lilh"} .grp[data-n="{t-1}"] .row:has(.meal[data-r="{data["r"]}"]) .nphfx')
     assert await target.count()==1
     assert await pg.locator(prefix+'-hud').get_attribute('aria-hidden')=='true'
     assert await pg.evaluate('JSON.stringify(S)')==before
     if who=='pn' and width==400 and theme=='light':
      await pg.evaluate("t=>{S.pn['sp-D'+(t+5)]={p:'beefstew',n:'frittata'};S.food.manual={who:'pn',r:'beefstew',made:todayAbs()-10,mk:2,src:null,stacks:[{w:'freezer',p:2,since:todayAbs()-8,th:false}]};S.pn['x-D'+(t+6)]={v:'beefstew'};S.pn['fz-mD'+(t+6)]={f:'manual',p:2,w:'freezer'};SHV++;PN.render();PN.setHu(true)}",t);await pg.wait_for_timeout(300)
      assert await pg.locator('#pn-hu-swaps [data-hu="cooked:manual"]').count()==1
      own=pg.locator(f'#pn-hu-swaps [data-hu="cook:p:D:{t+5}"]');assert await own.count()==1;await own.click();await pg.wait_for_timeout(550)
      assert await pg.locator(f'#page-np .grp[data-n="{t+5}"] .row:has(.meal.whop) .nphfx').count()==1
      assert await pg.locator(f'#page-np .grp[data-n="{t+5}"] .row:has(.meal.whon) .nphfx').count()==0
     # First outside press closes the panel, without opening the calendar.
     await pg.evaluate(P+'.setHu(true)');await pg.wait_for_timeout(280)
     cal=pg.locator(f'#page-{ "np" if who=="pn" else "lilh"} [data-calhold]');r=await cal.bounding_box();await pg.mouse.move(r['x']+r['width']/2,r['y']+r['height']/2);await pg.mouse.down();await pg.wait_for_timeout(280);assert not await pg.locator('#dlg').evaluate('e=>e.open');await pg.mouse.up()
     assert await pg.locator(prefix+'-hud').get_attribute('aria-hidden')=='true'
     # Clicking a page tab dismisses first; the second tap navigates.
     await pg.evaluate(P+'.setHu(true)');await pg.wait_for_timeout(280);await pg.locator('.tabbar [data-go="shop"]').click();assert await pg.evaluate('current')==('np' if who=='pn' else 'lilh');await pg.locator('.tabbar [data-go="shop"]').click();await pg.wait_for_timeout(220);assert await pg.evaluate('current')=='shop'
     results.append([who,theme,width]);await c.close()
  assert not errors,errors
  await b.close();print(json.dumps({'passed':True,'sourceBatchGrouping':results,'freshCookingsSeparate':True,'originalCardHighlighted':True,'dismissFirst':True,'savedRecordsUnchanged':True,'pageErrors':errors}))
asyncio.run(main())
