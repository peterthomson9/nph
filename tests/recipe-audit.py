"""Build the recipe review from the local browser export in recipe-data.json."""
import json,re
from pathlib import Path
data=json.loads(Path('tests/recipe-data.json').read_text(encoding='utf-8-sig'))
out=['# Recipe and substitution audit — v2.85','',
'Reviewed every runtime recipe after the app applies its recipe updates. Takeaways are excluded from cooking-method checks. This is a code/content audit, not a kitchen trial. Existing digestion groups are retained; nutrient pills are ingredient categories, not calculated nutrient amounts.','',
'## Substitution outliers addressed','',
'- Orzo, oats and Weetabix no longer substitute for each other. Each has a different preparation and role.',
'- Pasta, orzo, rice, couscous, noodles and frozen wedges no longer share one swap family.',
'- Mince, whole meat, sausages, ham, bacon, salmon and breaded cod no longer share one family.',
'- Lil H’s beef, chicken, fish, eggs, lentils and chickpeas no longer replace each other by changing a word in the existing method.',
'- Potato/sweet potato are separated from other vegetables; Lil H’s florets, leaves, leek, peas and courgette are separated from roots.',
'- Milk and yoghurt, plain cream and tzatziki, tomato sauce and lasagne sauce, and bread and ready-made pancakes/croissants/wraps are separated.',
'- Existing saved substitutions are preserved. Cross-meat substitutions still available in adult dishes need the cooking-method review noted below.','',
'## Method corrections','',
'- Lil H m4 and m5: 100ml sauce water added to the ingredient list.',
'- Lil H s11 and s16: water must cover lentils by 2cm, with top-ups specified.',
'- Lil H m7: splash made explicit as 2 tbsp, in ingredients and method.',
'- Existing measured sauce water is repeated where the method says “the water” or “and water”.',
'- Adult chpasta and baconpasta: missing pasta-cooking step added.',
'- Recipes using steaming or boiling now explain equipment/cooking-water levels; drained water is distinguished from sauce water.','',
'## Remaining content review','',
'These are review candidates rather than proven errors. A pinch, handful, splash or pack instruction can be intentional. Swapping whole chicken/beef/pork can require different cooking times; the app warns, but does not author a new tested method.','',
'## Coverage and quantity candidates','',
'| Page | Recipe | Required fields | Ingredient lines to review for quantities |',
'|---|---|---|---|']
counts={}
for who,d in data.items():
 recipes=[(k,r) for k,r in d['recipes'].items() if not r.get('ta')];counts[who]=len(recipes)
 for k,r in recipes:
  missing=[f for f in ['need','ing','s'] if not r.get(f)]
  vague=[i for i in r.get('ing',[]) if not re.search(r'\d|[½¼¾⅓⅔]',i) and not re.match(r'optional|water to cover',i,re.I)]
  out.append('| '+who+' | '+k+' — '+r['n']+' | '+(', '.join(missing) if missing else 'Present')+' | '+('; '.join(vague).replace('|',' / ') or '—')+' |')
out[2:2]=[f"Coverage: {counts['pn']} adult recipes and {counts['lh']} Lil H recipes ({sum(counts.values())} total).",'']
Path('docs/recipe-audit-v2.85.md').write_text('\n'.join(out)+'\n',encoding='utf-8')
print('Audited',counts,'recipes; report written')
