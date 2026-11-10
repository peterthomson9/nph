"""Recipe corrections in disposable phone contexts; no household data used."""
import asyncio,json,os,pathlib
from playwright.async_api import async_playwright
APP=pathlib.Path(__file__).resolve().parent.parent
async def main():
 out=APP/'tests/screenshots/recipes-2115';out.mkdir(parents=True,exist_ok=True);results=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('BROWSER_EXE','C:/Users/thoms/AppData/Local/BraveSoftware/Brave-Browser/Application/brave.exe'))
  for theme in ['light','dark']:
   for width in [320,400]:
    ctx=await b.new_context(viewport={'width':width,'height':860},is_mobile=True,has_touch=True)
    await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    await ctx.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"')")
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((APP/'index.html').as_uri());await page.wait_for_function("typeof S!=='undefined'")
    for name,who,r,sm in [('pictured','lh','s13',{'potato':'sweetpotato','milk':'-'}),('fruit','lh','b1',{'banana':'apple','milk':'-','+pb':1}),('stew','pn','beefstew',{'beef':'chthigh'}),('toast','lh','b12',{}),('packet-rice','lh','s24',{}),('fresh-additions','lh','b1',{'+packetrice':1,'+wholemealbread':1,'+avocado':1})]:
     await page.evaluate("([who,r,sm])=>{S[who]['is-layout']={r,m:sm};PLANNERS[who].openR(r,'layout','Recipe check')}",[who,r,sm])
     await page.locator('.steps').scroll_into_view_if_needed();await page.wait_for_timeout(100)
     geometry=await page.evaluate("""()=>{const d=document.querySelector('#dlg'),all=[...document.querySelectorAll('.steps p,.ingl .it')];return {overflow:d.scrollWidth>d.clientWidth+1,clipped:all.some(e=>e.scrollWidth>e.clientWidth+1),steps:document.querySelector('.steps').innerText}}""")
     assert not geometry['overflow'] and not geometry['clipped'],(name,width,geometry)
     await page.screenshot(path=str(out/f'{name}-{theme}-{width}.png'))
     results.append({'case':name,'theme':theme,'width':width,**geometry})
     await page.evaluate("document.querySelector('#dlg').close()")
    assert not errors,errors
    await ctx.close()
  await b.close()
 (out/'checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
 print('PASS: 24 recipe layouts, light/dark, 320/400px; no overflow or clipped text')
asyncio.run(main())
