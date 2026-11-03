"""Start local Firebase emulators and run security/two-phone checks. No production access."""
import os,pathlib,shutil,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
deps=pathlib.Path(os.environ.get('NODE_PATH',str(ROOT/'node_modules')))
cli=deps/'firebase-tools/lib/bin/firebase.js'
if not cli.exists():raise SystemExit('Firebase test dependencies missing. Run npm ci first.')
env=os.environ.copy();env['NODE_PATH']=str(deps)
java=pathlib.Path(r'C:\Program Files\Android\Android Studio\jbr\bin')
if not shutil.which('java') and java.exists():env['PATH']=str(java)+os.pathsep+env['PATH']
env.setdefault('FIREBASE_EMULATORS_PATH',str(deps/'.cache/firebase-emulators'))
if env.get('NPH_USE_RUNNING_EMULATORS')=='1':command=[sys.executable,'tests/sync-checks.py']
else:command=['node',str(cli),'emulators:exec','--only','auth,firestore','--project','demo-nph',f'"{sys.executable}" tests/sync-checks.py']
subprocess.run(command,cwd=ROOT,env=env,check=True)
