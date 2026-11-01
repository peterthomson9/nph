"""Run a script inside a local copy of NPH (index.html) in a 400px phone viewport and print what it returns.

    python tests/runjs.py tests/example-today.js

Optional settings (environment variables):
  CLOCK=2026-11-01T10:00:00   pretend it's this date and time (UK time)
  THEME=light|dark            force the theme
Never point this at the live app: it syncs to N's phone.
"""
import asyncio,json,os,sys,pathlib
from playwright.async_api import async_playwright
F=(pathlib.Path(__file__).resolve().parent.parent/"index.html").as_uri()
async def main(js,w=400):
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={"width":w,"height":860},is_mobile=True,has_touch=True,timezone_id="Europe/London")
    await ctx.route("**/fonts.googleapis.com/**",lambda r:r.abort())
    init="localStorage.setItem('nph-me','P');"
    if os.environ.get("THEME"):init+="localStorage.setItem('nph-theme','"+os.environ["THEME"]+"');"
    if os.environ.get("CLOCK"):
      init+=("{const T=new Date('"+os.environ["CLOCK"]+"').getTime(),off=T-Date.now(),RD=Date;"
             "class FD extends RD{constructor(...a){if(!a.length)super(RD.now()+off);else super(...a)}static now(){return RD.now()+off}}window.Date=FD}")
    await ctx.add_init_script(init)
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto(F);await pg.wait_for_timeout(1400)
    print(json.dumps(await pg.evaluate("async()=>{"+open(js).read()+"}"),indent=1,ensure_ascii=False))
    if errs:print("ERRORS",errs)
    await b.close()
asyncio.run(main(sys.argv[1]))
