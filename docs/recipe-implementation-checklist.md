# Implementing recipes and ingredients

2 November 2026 · v2.94

Apply this to new or substantially changed Lil H recipes and ingredients before marking their review complete. This combines the agreed rulebook and the preparation/energy and gas-source reviews; it does not introduce a different diet. P/N additions also require their own preferences and shared core rules to be checked. The automated child-catalogue gate described below applies to Lil H.

## Authored review

- **Core behaviour:** read C1–C34. Use the common planner, portions, storage and source-resolution paths. Recipe metadata must not create food, duplicate leftovers, change past portions or rewrite stored batches. Keep shared stock and undo behaviour consistent.
- **Stock, usual ingredients and simplicity:** favour familiar stock, short clear methods and the existing steamer/hob workflow while retaining required preparation actions. Reuse the correct shared product where appropriate. Add a defined ingredient/name/stock mapping before using it in a recipe. Custom shopping items remain shopping-only; they are not automatically reviewed recipe ingredients.
- **Cooking role and swaps:** declare a reviewed `LH_ROLES` entry. Choose a compatible substitution family or keep the ingredient fixed. Check title changes and actual preparation after substitutions; exchanging words is not sufficient for an incompatible cooking method. Keep orzo, oats and Weetabix distinct, and retain the current protein/dairy family boundaries.
- **Effective method (v2.115):** review the rendered method, not just metadata. Test each supported replacement, allowed None, addition, and representative combinations at one/two/three portions. Prepare, cook, combine and finish in that order; do not duplicate the serving checklist as an initial cooking step. Omitted ingredients must disappear from mixed instructions, required cooking liquid must remain listed, and additions must not instruct preparation after assembly. Check selected appliances, equivalent quantities, already-cooked source facts and measured liquids as well as words.
- **Preparation:** provide a non-empty `LH_PREP` entry and authored serving instructions. Review softness/moisture endpoints, bones/skin/gristle, round foods, fibres, egg/chicken cooking and smooth dispersed nut butter where relevant. Remove bay leaves/tough herb stems where used. Preserve texture choices suited to current skills; never infer those skills solely from age or declare a meal choking-safe.
- **Quantities:** use one breakfast portion or two main portions as the recipe basis. Every required ingredient needs an amount in the ingredient list. Separate food-retained cooking liquids from rinsing, steamer and drained boiling water. Keep the existing measured finishing oil for mains and separate beef browning oil; these are household recipe amounts, not clinical doses. Review quantities in the method, additions and resized batches; do not scale times, temperatures or food/equipment dimensions.
- **Addition instructions:** author an appropriate per-serving quantity and preparation method, or verify the supported group-specific hint. Food additions need a measured quantity; tiny optional herb pinches remain permitted. Verify the one-/two-/three-portion rendering and the new ingredient's preparation after Add and None.
- **Nutrition and energy:** explicitly classify the ingredient in `nut.groups`, including an empty array only for a deliberately reviewed non-grouped ingredient such as a herb. Check N1/N2 meal structure, pulse/vitamin-C combinations, daily iron, fish frequency and the overall rotation. Record a fat-source classification where applicable. All household dairy is full fat. Do not introduce calorie targets, a daily adequacy badge or automatic extra enrichment.
- **Digestion:** provide a valid `LH_GAS` profile, source/notes when flagged and matching nutrition gas categories. Higher-priority/milder limits and yoghurt combinations remain this household's preferences. Consider both main meals, every ingredient edit and the source batch. Possible contributors do not become new blanket exclusions. Day checks now derive strong contributors from the same nutrition classification, avoiding a separate list that could omit a new ingredient.
- **Household exclusions and scope:** keep Lil H's no-added-salt/stock-cube/honey and barista-oat-milk exclusions. Check processed ingredients and labels during review; key-name checks cannot detect every formulation. Keep formula/snacks as context, without adding snack/allergy tracking or changing his routine.
- **Storage:** review fridge/freezer life, reheating, thawing, non-freezable recipes and freshness. Update any required storage limits/configuration explicitly; an ingredient list cannot establish these properties automatically.
- **Evidence:** use current primary/authoritative paediatric and food-preparation guidance for new recommendations. General adult gas lists or IBS/FODMAP tables do not establish infant food bans or medical thresholds. The existing source reviews are starting points, not a substitute for reviewing a materially different food/method.
- **Presentation:** retain compact batch-scope wording, item counts, coloured change details, nutrition-only pills and the grouped serving reminder. Gas feedback stays on ingredient options and meal-card warnings. Missing older-batch finishing history is recipe-only; actual omissions still warn on cards.

After this review, add the recipe ID to `LH_RECIPE_RULES_REVIEW`; the normal patch sets its `rulesReviewed` field from that explicit list. Do not auto-populate that list from every recipe ID. A new ingredient requires an explicit cooking-role entry plus all related profiles/groups/mapping; copying an existing ingredient's fields is not a semantic review.

## Automated checks

`PLANNERS.lh._dbg.catalogAudit()` validates the current catalogue and reports individual problems. The release script fails if any are found. It checks review sign-off, recipe type and portion basis, ingredient amounts, cooking-water references, measured finishing/browning oil, serving/timing/storage fields, preparation and digestion profiles, nutrition/cooking-role consistency, gas-category agreement, compatible substitution families, known stock mappings, addition hints and fat-source classification. Baseline recipes must also pass the shared digestion/nutrition checks.

At runtime, incomplete catalogue data fails `autoReady` for Re-plan/Randomise and automatic ingredient substitutions. Manual edits still follow R1: available supported choices can be made with warnings. Stock, other-meal/day, repetition, weekly iron/fish and portion/storage checks continue to be evaluated in their actual context, not certified once for all plans by a catalogue flag.

Run in an isolated local Brave/Chrome browser, setting `BROWSER_EXE` to its executable:

```powershell
$env:CLOCK='2026-11-02T09:00:00'
python tests/runjs.py tests/catalog-audit.js
python tests/runjs.py tests/regression-294.js
python tests/runjs.py tests/regression-289.js
python tests/runjs.py tests/regression-291.js
python tests/runjs.py tests/planning-289.js
python tests/runjs.py tests/regression-292.js
python tests/runjs.py tests/weekly-289.js
python tests/runjs.py tests/reshuffle-apply.js
$env:CLOCK='2026-11-01T09:00:00'
python tests/runjs.py tests/expected-leftovers.js
python tests/runjs.py tests/regression-285.js
python tests/offline-289.py
```

Add a focused regression for a materially new behaviour, rather than relying on the existing 40-recipe coverage to exercise a new food or method. Update the rules, changelog, visual notes where relevant, version and delivery snapshot.

## Audit result and limits

The v2.94 current catalogue passes: **40 recipes, 45 stock ingredients and one temporary pouch substitute**. Fault injection verifies 14 incomplete/inconsistent cases are rejected; a copied new recipe cannot inherit sign-off, and actual Re-plan suggestions exclude unreviewed recipes. The same-day classification check also covers a newly classified strong contributor without editing a second list.

These checks enforce data completeness and the encoded household rules. They cannot establish that every future quantity, cooking time, product formulation or serving method is appropriate merely because fields exist. Those content decisions require the authored review above. This is why the sign-off and implementation instructions are separate from the automated audit.

### v2.118 review

Five recipes and three ingredients were reviewed for amounts, preparation, storage, nutritional groups, gas classifications and cooking roles. Avocado contributes a recorded fat source; wholemeal bread is a possible digestion contributor without an automatic restriction. Keep all three out of unrelated substitution families. Rice and toast are served fresh; keep heated rice, toast and avocado separate from the stored base. Bread preparation and portions use the NHS advice at https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/. The requested Warburtons product contains salt and wheat/soya, per https://www.warburtons.co.uk/products/bread/wholemeal-and-brown/wholemeal-medium-400g/. Rice handling follows the pack and the separation policy, consistent with https://www.food.gov.uk/print/pdf/node/4286. The catalogue audit now covers 45 recipes and 48 stock ingredients.
