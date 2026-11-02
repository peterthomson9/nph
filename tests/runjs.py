"""Run a script inside a local copy of NPH (index.html) in a 400px phone viewport and print what it returns.

    python tests/runjs.py tests/example-today.js

Optional settings (environment variables):
  CLOCK=2026-11-01T10:00:00   pretend it's this date and time (UK time)
  THEME=light|dark            force the theme
  FIXTURE=tests/example.js   optional disposable setup before the script
Never point this at the live app: it syncs to N's phone.
"""
import asyncio,json,os,sys,pathlib
from playwright.async_api import async_playwright
sys.stdout.reconfigure(encoding="utf-8")
F=(pathlib.Path(__file__).resolve().parent.parent/"index.html").as_uri()
async def main(js,w=400):
  w=int(os.environ.get("WIDTH",w))
  async with async_playwright() as p:
    b=await p.chromium.launch(**({"executable_path":os.environ["BROWSER_EXE"]} if os.environ.get("BROWSER_EXE") else {}));ctx=await b.new_context(viewport={"width":w,"height":860},is_mobile=True,has_touch=True,timezone_id="Europe/London")
    await ctx.route("**/fonts.googleapis.com/**",lambda r:r.abort())
    init="localStorage.setItem('nph-me','P');"
    if os.environ.get("THEME"):init+="localStorage.setItem('nph-theme','"+os.environ["THEME"]+"');"
    if os.environ.get("CLOCK"):
      init+=("{const T=new Date('"+os.environ["CLOCK"]+"').getTime(),off=T-Date.now(),RD=Date;"
             "class FD extends RD{constructor(...a){if(!a.length)super(RD.now()+off);else super(...a)}static now(){return RD.now()+off}}window.Date=FD}")
    await ctx.add_init_script(init)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(F);await pg.wait_for_timeout(1400)
    if os.environ.get("FIXTURE"):
      await pg.evaluate("()=>{"+pathlib.Path(os.environ["FIXTURE"]).read_text(encoding="utf-8")+"}")
      await pg.wait_for_timeout(80)
    print(json.dumps(await pg.evaluate("async()=>{"+pathlib.Path(js).read_text(encoding="utf-8")+"}"),indent=1,ensure_ascii=False))
    if os.environ.get("SCREENSHOT"):
      await pg.wait_for_timeout(800)
      await pg.screenshot(path=os.environ["SCREENSHOT"])
    if errs:raise RuntimeError("Page errors: "+str(errs))
    await b.close()
asyncio.run(main(sys.argv[1]))
