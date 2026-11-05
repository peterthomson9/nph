from pathlib import Path
import os
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe'))
 for w in (320,400):
  for theme in ('dark','light'):
   c=b.new_context(viewport={'width':w,'height':740},timezone_id='Europe/London');c.route('http**/*',lambda r:r.abort());c.add_init_script(f"localStorage.setItem('nph-me','P');localStorage.setItem('nph-theme','{theme}')")
   c.add_init_script("Date=class extends Date{constructor(...a){super(...(a.length?a:['2026-11-05T09:00:00']))}static now(){return new Date().getTime()}}")
   p=c.new_page();p.goto((root/'index.html').as_uri());p.wait_for_function("typeof S!=='undefined'")
   p.evaluate("go('lilh');finishPageMotion();openSettings()");assert p.locator('.sets details[data-section]').count()==5 and not p.locator('.sets details[open]').count()
   p.locator('summary').filter(has_text='Meal plan').click();p.get_by_role('button',name='One column').click();assert p.locator('details[open] summary').inner_text()=='Meal plan'
   p.evaluate("UPD.ready='new';paintUpdate();sharedError='Sample error';paintShared()")
   assert p.locator('#update-section summary').inner_text().endswith('Update ready')
   assert 'Needs attention' in p.locator('#shared-section summary').inner_text()
   p.evaluate("""document.querySelector('#dlg').close();const n=LH._dbg.todayN()+2;LH.showDay(n,true,true);LH.render();document.querySelector('#page-lilh .day[data-n="'+n+'"] .grp[data-pos="1"] [data-pk]').click()""")
   assert p.locator('#card .hleg').count()==0 and 'Just this day.' not in p.locator('#card').inner_text()
   group=p.locator('#card .og:not(.stg)').first;group.locator('[data-og]').click()
   book=group.locator('.optmore').first;assert book.locator('use').get_attribute('href')=='#i-book'
   assert book.bounding_box()['x']+book.bounding_box()['width']<=w
   assert p.locator('#card .pickwarn small').count()
   book.click();assert p.locator('[data-pvback]').is_visible();p.locator('[data-pvback]').click();assert p.locator('#card .optmore').count()
   c.close();print('PASS',w,theme)
 b.close()
