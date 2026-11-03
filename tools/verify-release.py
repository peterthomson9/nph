"""Required local pre-publish checks; only disposable browser contexts.
Run: python tools/verify-release.py
Full campaign: python tests/rules/run.py --steps 2000 --seeds 3,17,2026
"""
import concurrent.futures,os,pathlib,subprocess,sys
APP=pathlib.Path(__file__).resolve().parent.parent
def run(job):
 name,script,clock,fixture=job;env=os.environ.copy();env['CLOCK']=clock
 if fixture:env['FIXTURE']=fixture
 else:env.pop('FIXTURE',None)
 command=[sys.executable,'tests/runjs.py',script] if script.endswith('.js') else [sys.executable,script]
 if script=='tools/prepare-release.py':command+=['--check']
 if script=='tests/rules/run.py':command+=['--steps','100','--seeds','17','--report','tests/screenshots/rules-release-gate.json']
 r=subprocess.run(command,cwd=APP,env=env,capture_output=True,text=True,encoding='utf-8',errors='replace');return name,r.returncode,r.stdout+r.stderr
def main():
 brave=pathlib.Path(r'C:\Users\thoms\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe')
 if not os.environ.get('BROWSER_EXE') and brave.exists():os.environ['BROWSER_EXE']=str(brave)
 jobs=[('metadata','tools/prepare-release.py','',None),('shifted batch sources','tests/rules/regression-shifted-source.js','2026-11-03T20:15:00',None),('history cleanup','tests/rules/regression-history.js','2026-11-03T09:00:00',None),('storage boundaries','tests/rules/regression-boundaries.js','2026-11-03T09:00:00',None),('rule oracle and seeded actions','tests/rules/run.py','',None),('catalogue','tests/catalog-audit.js','2026-11-02T09:00:00',None),('recipe history','tests/regression-294.js','2026-11-02T10:00:00',None),('leftover planning','tests/regression-296.js','2026-11-02T10:00:00',None),('Cooked actions/portions','tests/regression-297.js','2026-11-02T09:00:00','tests/cooked-fixtures-297.js'),('fresh repeat','tests/regression-2105.js','2026-11-02T12:00:00',None),('source ingredients','tests/regression-2106.js','2026-11-02T10:00:00',None),('stock and freeze overlap','tests/regression-2107.js','2026-11-02T19:00:00',None),('source notices','tests/notices-2109.py','',None),('window Back and group highlights','tests/checklist-2110.py','',None),('header pills','tests/pill-highlights-2111.py','',None),('dropdown edge','tests/stock2107/test_clip.py','',None),('backups','tests/backups.py','',None),('durable storage','tests/storage.py','',None),('update/save boundary','tests/storage-update-boundary.py','',None),('updates','tests/updates.py','',None),('offline','tests/offline-289.py','',None)]
 failed=[];logs=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for name,code,output in pool.map(run,jobs):
   logs.append('== '+name+' ==\n'+output);print(('FAIL' if code else 'PASS')+': '+name,flush=True)
   if code:failed.append(name);print(output,flush=True)
 out=APP/'tests/screenshots/release-gate.txt';out.parent.mkdir(exist_ok=True);out.write_text('\n'.join(logs),encoding='utf-8')
 if failed:raise SystemExit(1)
 print('PASS: all '+str(len(jobs))+' release checks. Log: '+str(out))
if __name__=='__main__':main()
