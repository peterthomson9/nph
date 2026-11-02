"""Keep release metadata consistent with index.html. Run before every publish."""
from pathlib import Path
import argparse,json,re

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true',help='Verify without changing files')
    args=parser.parse_args()
    root=Path(__file__).resolve().parent.parent
    html=(root/'index.html').read_text(encoding='utf-8')
    match=re.search(r'const NPH_V=window\.NPH_VERSION\|\|"([0-9]+\.[0-9]+(?:\.[0-9]+)?)";',html)
    if not match:raise SystemExit('No supported NPH version in index.html')
    version=match.group(1)
    sw=(root/'sw.js').read_text(encoding='utf-8')
    expected,count=re.subn(r'const VERSION="nph-[^"]+", APP_VERSION="[^"]+";',f'const VERSION="nph-{version}", APP_VERSION="{version}";',sw,count=1)
    if count!=1:raise SystemExit('Unexpected service-worker version declaration')
    manifest={'version':version,'updateProtocol':1}
    if args.check:
        if sw!=expected or json.loads((root/'release.json').read_text(encoding='utf-8'))!=manifest:raise SystemExit('Release metadata does not match index.html; run tools/prepare-release.py')
        print(f'PASS: index, worker and release manifest agree on v{version}')
    else:
        (root/'sw.js').write_text(expected,encoding='utf-8')
        (root/'release.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
        print(f'Prepared app-file release v{version}; household data format is unchanged')
if __name__=='__main__':main()
