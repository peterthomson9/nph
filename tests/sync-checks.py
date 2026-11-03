"""Called by the emulator runner; both test programs use demo-nph only."""
import subprocess,sys
for command in [['node','tests/sync-security.cjs'],[sys.executable,'tests/sync-browser.py']]:
 subprocess.run(command,check=True)
