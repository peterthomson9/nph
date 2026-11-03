"""Read-only audit and replayable stress runs, local disposable browsers only.
Usage: python tests/rules/run.py --steps 5000 --seeds 3,17,2026
       python tests/rules/run.py --replay tests/rules/failures/example.json
"""
import argparse,asyncio,json,pathlib,os,time
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent;APP=ROOT.parent.parent
BROWSER=os.environ.get('BROWSER_EXE',r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
async def main(args):
 if args.replay:
  recorded=json.loads(pathlib.Path(args.replay).read_text(encoding='utf-8'));args.clock=recorded['clock'];args.seeds=str(recorded['seed'])
 report={'format':1,'started':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'runs':[]};failure=False
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=BROWSER)
  for seed in [int(s) for s in args.seeds.split(',')]:
   ctx=await browser.new_context(viewport={'width':400,'height':900},is_mobile=True,has_touch=True,timezone_id='Europe/London');await ctx.route('**/fonts.googleapis.com/**',lambda r:r.abort())
   await ctx.add_init_script("localStorage.setItem('nph-me','P');{const RD=Date;window.__NPH_TEST_CLOCK=new RD('"+args.clock+"').getTime();window.Date=class extends RD{constructor(...a){super(...(a.length?a:[window.__NPH_TEST_CLOCK]))}static now(){return window.__NPH_TEST_CLOCK}}}")
   await ctx.add_init_script("{let n="+str(seed^2654435769)+";Math.random=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296}}")
   pg=await ctx.new_page();page_errors=[];pg.on('pageerror',lambda e:page_errors.append(str(e)))
   await pg.goto((APP/'index.html').as_uri());await pg.wait_for_function("typeof S!=='undefined'");await pg.evaluate('NPH_STORE.flush()')
   for path in [APP/'tools/rule-checker.js',ROOT/'driver.js']:await pg.evaluate(path.read_text(encoding='utf-8'))
   print('Oracle self-test:',await pg.evaluate((ROOT/'self-test.js').read_text(encoding='utf-8')),flush=True)
   await pg.evaluate('seed=>NPH_STRESS.init(seed)',seed)
   initial=await pg.evaluate('window.__NPH_LAST_CAPTURE=NPH_RULE_CHECKER.capture({horizon:28})');audit=await pg.evaluate('NPH_RULE_CHECKER.audit(window.__NPH_LAST_CAPTURE)')
   trace=[];counts={};attempts=0;done=0;errors=audit['errors'];before=initial
   replay=json.loads(pathlib.Path(args.replay).read_text(encoding='utf-8'))['trace'] if args.replay else None
   target=len(replay) if replay is not None else args.steps
   while not errors and done<target and attempts<target*4:
    action=replay[done] if replay is not None else await pg.evaluate('NPH_STRESS.next()');attempts+=1
    try:
     changed=await pg.evaluate("""async a=>{const before=window.__NPH_LAST_CAPTURE,actual=await NPH_STRESS.act(a);if(!actual)return null;
       delete actual.changed;const after=NPH_RULE_CHECKER.capture({horizon:0}),audit=NPH_RULE_CHECKER.audit(after);
       const errors=[...audit.errors,...NPH_RULE_CHECKER.transition(before,after,actual)];window.__NPH_LAST_CAPTURE=after;
       return {action:actual,errors,warningCount:audit.warnings.length}}""",action)
     if not changed:
      if replay is not None:errors=[{'rule':'replay','message':'Recorded action no longer applicable','action':action}]
      continue
     action=changed['action'];errors=changed['errors']
     trace.append(action);done+=1;counts[action['kind']]=counts.get(action['kind'],0)+1
     if page_errors:errors.append({'rule':'runtime','message':page_errors[-1]})
     if done%100==0:
      await pg.evaluate('NPH_STORE.flush()')
      print(json.dumps({'seed':seed,'actions':done,'warnings':changed['warningCount'],'errors':len(errors)}),flush=True)
    except Exception as e:errors=[{'rule':'runtime','message':str(e)}];trace.append(action)
   if not errors:
    audit=await pg.evaluate('NPH_RULE_CHECKER.audit(NPH_RULE_CHECKER.capture({horizon:84}))');errors=audit['errors'];await pg.evaluate('NPH_STORE.flush()')
    if done<target:errors.append({'rule':'driver','message':'Requested action count was not reached'})
   result={'seed':seed,'actions':done,'attempts':attempts,'counts':counts,'errors':errors,'warnings':audit.get('warnings',[]),'coverage':audit.get('coverage',[])}
   report['runs'].append(result);failure|=bool(errors)
   if errors:
    before=await pg.evaluate('window.__NPH_LAST_CAPTURE');output=ROOT/'failures';output.mkdir(exist_ok=True);path=output/f'seed-{seed}.json';path.write_text(json.dumps({'seed':seed,'clock':args.clock,'version':await pg.evaluate('NPH_V'),'trace':trace,'initial':initial,'failure':before,'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8');print('FAIL',path, json.dumps(errors[:4]),flush=True)
   else:print('PASS',seed,done,counts,flush=True)
   await ctx.close()
  await browser.close()
 out=APP/args.report;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 if failure:raise SystemExit(1)
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--steps',type=int,default=2000);parser.add_argument('--seeds',default='3,17,2026');parser.add_argument('--clock',default='2026-11-03T09:00:00');parser.add_argument('--replay');parser.add_argument('--report',default='tests/screenshots/rules-report.json');asyncio.run(main(parser.parse_args()))
