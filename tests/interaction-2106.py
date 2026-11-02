"""Real-app phone layouts, gesture direction, stable calendar and motion demo."""
import asyncio,pathlib,os,json,base64,struct,zlib
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent
SOURCE=ROOT.parent
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
async def swipe(page,selector,dx,dy=0):
 await page.evaluate("""({selector,dx,dy})=>{const target=document.querySelector(selector),r=target.getBoundingClientRect(),x=innerWidth/2,y=Math.max(160,Math.min(innerHeight-180,r.top+r.height/2));const point=(cx,cy)=>new Touch({identifier:1,target,clientX:cx,clientY:cy});target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[point(x,y)]}));target.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[point(x+dx,y+dy)]}));target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[point(x+dx,y+dy)]}));}""",{'selector':selector,'dx':dx,'dy':dy})
async def setup(ctx,theme):
 await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
 await ctx.add_init_script("localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','"+theme+"');{const R=Date,T=new Date('2026-11-02T09:00:00').getTime(),off=T-R.now();window.Date=class extends R{constructor(...a){super(...(a.length?a:[R.now()+off]))}static now(){return R.now()+off}}}")
async def ready(pg,name):
 await pg.goto((SOURCE/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await pg.evaluate('NPH_STORE.flush()')
async def fixture(pg):
 await pg.evaluate("()=>{"+(SOURCE/'tests/cooked-fixtures-297.js').read_text(encoding='utf-8')+"\nconst n=PN._dbg.todayN()-2;S.food['pn-today'].src='L'+n;S.pn['x-L'+n]={v:'beefstew'};S.pn['is-xL'+n]={r:'beefstew',m:{beef:'chthigh'}};go('np');PN.showToday();}")
 await pg.wait_for_timeout(230)
def animation_png(frames,path):
 def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
 def parts(data):
  pos=8;header=None;compressed=[]
  while pos<len(data):
   size=struct.unpack('!I',data[pos:pos+4])[0];kind=data[pos+4:pos+8];value=data[pos+8:pos+8+size];pos+=size+12
   if kind==b'IHDR':header=value
   if kind==b'IDAT':compressed.append(value)
  return header,b''.join(compressed)
 parsed=[parts(data) for _,data in frames];header=parsed[0][0];width,height=struct.unpack('!II',header[:8]);out=bytearray(b'\x89PNG\r\n\x1a\n')
 out+=chunk(b'IHDR',header)+chunk(b'acTL',struct.pack('!II',len(frames),0));seq=0
 for i,((timestamp,_),(ihdr,data)) in enumerate(zip(frames,parsed)):
  assert ihdr==header
  duration=max(20,min(1200,round((frames[i+1][0]-timestamp)*1000))) if i+1<len(frames) else 450
  out+=chunk(b'fcTL',struct.pack('!IIIIIHHBB',seq,width,height,0,0,duration,1000,0,0));seq+=1
  if i==0:out+=chunk(b'IDAT',data)
  else:out+=chunk(b'fdAT',struct.pack('!I',seq)+data);seq+=1
 out+=chunk(b'IEND',b'');path.write_bytes(out)
async def main():
 results=[];errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=BROWSER)
  for theme in ['dark','light']:
   for width in [400,320]:
    for name in ['after']:
     ctx=await browser.new_context(viewport={'width':width,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London');await setup(ctx,theme)
     pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));await ready(pg,name);await fixture(pg)
     normal=await pg.locator('#page-np .day:not(.today) .row').first.evaluate('e=>({width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left})')
     await pg.screenshot(path=str(ROOT/f'screenshots/{name}-days-{theme}-{width}.png'))
     await pg.evaluate("go('shop');shopView='cooked';foodWho='pn';renderShop()");await pg.wait_for_timeout(230)
     await pg.evaluate('shopToTabs()')
     cooked=await pg.locator('.cooked-card').first.evaluate('e=>({width:e.getBoundingClientRect().width,left:e.getBoundingClientRect().left})')
     if name=='after':assert abs(normal['width']-cooked['width'])<=1 and abs(normal['left']-cooked['left'])<=1,(normal,cooked)
     await pg.screenshot(path=str(ROOT/f'screenshots/{name}-cooked-{theme}-{width}.png'))
     await pg.locator('.cooked-group').first.screenshot(path=str(ROOT/f'screenshots/{name}-cooked-group-{theme}-{width}.png'))
     if name=='after':assert 'Chicken' in await pg.locator('.cooked-card .meal b').first.inner_text()
     if name=='after':
      await pg.locator('.cooked-card [data-fdots]').first.click();await pg.wait_for_timeout(220)
      assert await pg.locator('.cooked-card.open').first.evaluate('e=>e.scrollWidth<=e.clientWidth+1')
      await pg.screenshot(path=str(ROOT/f'screenshots/{name}-actions-{theme}-{width}.png'))
     await pg.evaluate("go('lilh');dlgOwner='lh';LH.openCal()");await pg.wait_for_timeout(250)
     box=await pg.locator('#dlg').bounding_box();head=await pg.locator('.calhead').bounding_box()
     await pg.screenshot(path=str(ROOT/f'screenshots/{name}-calendar-{theme}-{width}.png'))
     if name=='after':
      assert abs(box['y']+box['height']/2-450)<2,box
      week=await pg.locator('.calweek').bounding_box()
      for _ in range(12):
       await pg.locator('[data-cal="1"]').click();await pg.wait_for_timeout(210)
       b=await pg.locator('#dlg').bounding_box();h=await pg.locator('.calhead').bounding_box();w=await pg.locator('.calweek').bounding_box()
       assert abs(b['y']-box['y'])<1 and abs(b['height']-box['height'])<1,(box,b)
       assert abs(h['y']-head['y'])<1 and abs(w['y']-week['y'])<1
       assert await pg.locator('.calgrid [data-day]').count()==42
      before=await pg.locator('.calhead b').inner_text();await swipe(pg,'.calgrid',-90);await pg.wait_for_timeout(230)
      assert await pg.locator('.calhead b').inner_text()!=before
      assert await pg.evaluate("current==='lilh'")
      await pg.locator('#dlg .close').click();await pg.evaluate("go('np')");await pg.wait_for_timeout(230)
      await swipe(pg,'#page-np .day.today .meal',-90);await pg.wait_for_timeout(230);assert await pg.evaluate("current==='lilh'")
      await swipe(pg,'#page-lilh .day.today .meal',-90);await pg.wait_for_timeout(230);assert await pg.evaluate("current==='shop'")
      await swipe(pg,'#page-shop .cooked-card',90);await pg.wait_for_timeout(230);assert await pg.evaluate("current==='lilh'")
      await swipe(pg,'#page-lilh .day.today .meal',5,120);assert await pg.evaluate("current==='lilh'")
      await pg.evaluate("editing=true");await swipe(pg,'#page-lilh .day.today .meal',90);assert await pg.evaluate("current==='lilh'");await pg.evaluate('editing=false')
      await pg.evaluate("go('np');go('shop');go('lilh')");await pg.wait_for_timeout(230)
      assert await pg.locator('main.page:not([hidden])').count()==1
      assert await pg.locator('[data-motion-out]').count()==0
     assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     results.append({'view':name,'theme':theme,'width':width,'dayCard':normal['width'],'cookedCard':cooked['width']})
     await ctx.close()
  ctx=await browser.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True,reduced_motion='reduce');await setup(ctx,'dark')
  pg=await ctx.new_page();await ready(pg,'after');await fixture(pg);await pg.evaluate("go('lilh')")
  assert await pg.locator('[data-motion-out]').count()==0
  assert not await pg.evaluate('document.getAnimations().some(a=>a.playState==="running"&&a.effect?.target?.matches("main.page"))')
  await pg.evaluate("dlgOwner='lh';LH.openCal();LH.calClick(document.querySelector('[data-cal=\"1\"]'))")
  assert not await pg.evaluate('document.getAnimations().some(a=>a.playState==="running"&&a.effect?.target?.closest(".calbody"))')
  await ctx.close()
  # Short actual-browser recording of page and calendar transitions.
  ctx=await browser.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True);await setup(ctx,'dark')
  pg=await ctx.new_page();await ready(pg,'after');await fixture(pg);await pg.wait_for_timeout(350)
  capture=await ctx.new_cdp_session(pg);frames=[]
  async def frame(event):
   frames.append((event['metadata']['timestamp'],base64.b64decode(event['data'])))
   await capture.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
  capture.on('Page.screencastFrame',frame)
  await capture.send('Page.startScreencast',{'format':'png','maxWidth':400,'maxHeight':900,'everyNthFrame':2})
  await pg.wait_for_timeout(150)
  await swipe(pg,'#page-np .day.today .meal',-110);await pg.wait_for_timeout(350)
  await pg.evaluate("window.navScrollTarget=null;const original=goNow;goNow=(...args)=>{original(...args);window.navScrollTarget=scrollY}")
  await swipe(pg,'#page-lilh .day.today .meal',-110)
  for _ in range(4):
   await pg.wait_for_timeout(65)
   assert await pg.locator('.tabbar').evaluate('e=>{const r=e.getBoundingClientRect();return Math.abs(r.width-400)<1&&Math.abs(r.bottom-900)<1}'),'Mobile viewport changed during swipe'
   assert await pg.evaluate('Math.abs(scrollY-window.navScrollTarget)<2'),await pg.evaluate('({scrollY,target:window.navScrollTarget})')
  await pg.wait_for_timeout(90)
  assert await pg.locator('#page-shop .stick').evaluate('e=>Math.abs(e.getBoundingClientRect().top)<2'),await pg.evaluate("({scrollY,top:document.querySelector('#page-shop .stick').getBoundingClientRect().top})")
  await swipe(pg,'#page-shop .cooked-card',110);await pg.wait_for_timeout(350)
  await pg.evaluate("dlgOwner='lh';LH.openCal()");await pg.wait_for_timeout(350)
  await swipe(pg,'.calgrid',-100);await pg.wait_for_timeout(350);await swipe(pg,'.calgrid',100);await pg.wait_for_timeout(350)
  await capture.send('Page.stopScreencast');await pg.wait_for_timeout(100);await ctx.close()
  assert len(frames)>8,len(frames)
  animation_png(frames,ROOT/'motion-preview.png')
  assert not errors,errors
  await browser.close()
  print(json.dumps({'passed':True,'cases':results,'calendarStableAcross12Months':True,'pageSwipesAndGuards':True,'reducedMotion':True,'pageErrors':errors},indent=1))
if __name__=='__main__':asyncio.run(main())
