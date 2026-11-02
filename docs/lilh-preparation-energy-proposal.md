# Lil H: recipe preparation, energy and fat proposal

**1 November 2026 · audit of local NPH v2.88 · proposal only**

## Recommendation

Keep the existing recipe collection and improve its ingredient data and serving instructions before changing the rotation substantially. The strongest findings are missing connections between the recipe and its preparation/fat information—not evidence that Lil H is eating too little.

The first implementation should:

1. Give each recipe an explicit serving/preparation checklist derived from the ingredients actually used.
2. Move finishing oil out of the generic footer into measured ingredients and method steps.
3. Specify milk/yoghurt products clearly and preserve their contribution through swaps, additions, “None”, portion changes and leftovers.
4. Check meal structure and documented fat sources, without presenting an unmeasured diet as nutritionally complete or prescribing calories.
5. Prefer appropriate prepared recipes during Re-plan, retaining variety and the existing personalised digestion preferences.

Allergen tracking and snack tracking are outside this proposal, as requested. Prior tolerance does not determine choking preparation: peanut butter and fish still need their usual preparation checks.

## What was examined

- All **40 current recipes** after runtime updates: **11 breakfasts and 29 lunch/dinner recipes** (7 beef, 5 chicken, 5 salmon, 5 egg and 7 plant recipes).
- Ingredients, quantities, methods, texture notes, safety notes, shared stock mapping and the generic finishing instructions.
- Ingredient substitution/addition/removal, recipe text scaling, nutrient groups and Re-plan checks.
- A clean 28-day default plan, **2–29 November 2026**, using an isolated local Brave context. This is the default rotation, not either phone's saved choices.
- A separate local rendering check of default versus resized portions.

Source app: `index.html` in `site-repo`, version 2.88; SHA-256 at audit start: `332207FC174D279DF763F590DE566F220EAA2D726B78B53C38DAF0F6C2A0FFEE`.

The report concerns the latest local copy. The version currently running on either phone was not rechecked for this audit. Application code and saved phone data were not changed for this report.

## Lil H's current context

P reports approximately **500ml HiPP Organic Stage 3 per day**, separate drinking water, and **two snacks**, commonly kiwi, pear or other small fruits. Snacks vary and are not to be tracked in NPH yet.

HiPP's current UK **Growing Up Milk Powder** page gives **60kcal and 3.3g fat per 100ml prepared feed**. If that matches the product and preparation on your tin, 500ml supplies approximately **300kcal and 16.5g fat**. These are calculations from that label, not measured consumption or a recommendation for how much milk he should have. A ready-to-feed or overseas variant needs its own label. [HiPP product information](https://www.hipp.co.uk/shop/formula-milks/growing-up-milk).

That is meaningful background when reviewing the meals. It would be inappropriate to infer a fat deficit from the recipes alone or automatically enrich every dish. Fruit snacks add variety and energy, but their unrecorded quantities prevent an exact daily assessment. Use the formula and snacks as stated context, not automatic proof that daily needs have been met. This proposal does not change his formula routine or recommend concentrating feeds.

## Guidance used, and how it applies

The NHS advises thinking about food shape, size and texture; adapting firm/round foods; removing bones; and upright, supervised eating. Nut butter should be spread or mixed into food, rather than offered alone. These are preparation requirements, not a guarantee that an app can declare a meal safe for an individual child. [NHS food preparation](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/).

Young children need energy from fat; NHS guidance recommends full-fat yoghurt and cheese under two and advises against exclusively wholegrain starches for under-twos because their fibre can be filling. This supports reviewing products, meal bulk and explicit ingredients, not adopting an adult low-fat diet. [NHS toddler food guidance](https://www.nhs.uk/baby/weaning-and-feeding/what-to-feed-young-children/).

SACN recommends flexible diversification of foods, flavours and textures between one and two, taking developmental differences into account. I would therefore offer suitable serving variations, rather than impose a fixed finger-food quota. This report is for a household planner; it does not replace an individual feeding or growth assessment. [SACN recommendations](https://www.gov.uk/government/publications/sacn-report-feeding-young-children-aged-1-to-5-years/feeding-young-children-aged-1-to-5-years-summary-report#recommendations).

## Findings that affect the whole collection

### 1. Finishing oil is effectively invisible to planning

All **29 mains** get the footer “Stir in ½ tsp olive oil before serving” at default portion settings. **None of the 40 recipes lists oil in its required ingredient keys.** Seven beef recipes also use oil for browning in the method, without an ingredient-list quantity.

The rendered check confirmed that selecting a different batch size makes the finishing-oil instruction disappear: the portion-scaling note replaces the footer. This is a concrete defect, rather than a dietary inference.

**Proposed correction:** author the intended oil once as a measured recipe component. To preserve the existing finishing instruction for a two-portion main, that is **1 tsp finishing oil per batch, divided between its two portions**. This translates the existing household recipe; it is not an NHS-prescribed dose. Account separately for any existing browning oil, so it is neither silently lost nor added twice. Show ingredients, cooking steps, scaling and stock from the same record. Do not automatically add oil on top of the old footer.

### 2. Dairy product details are inconsistent

There are **19 recipes with milk**. Five breakfast recipes explicitly say whole milk; the other milk recipes use descriptions such as “milk”, “1 tbsp milk” or “splash of milk”. Three breakfasts use Greek yoghurt; only **b9** explicitly says full-fat. Both ingredients map to shared adult stock entries labelled simply “Milk” and “Greek yoghurt”. An in-stock tick cannot establish the product's fat content.

**Proposed correction:** specify the actual milk and full-fat plain yoghurt used for Lil H's recipes. If P/N use those same products, keep one shared stock entry with the correct description. If they use different products, give the distinct products separate stock entries. Do not rename an adult product to “whole” without confirming it is actually whole milk. Replace vague cooking-liquid quantities with tested household quantities before attempting numerical energy calculations.

### 3. Useful preparation advice exists, but coverage is uneven

Strong existing examples include b6's thinned peanut butter, b7's softened apple and mashed berries, s4/s13's explicit chickpea mashing, and s1/s22's fish-bone checks. Other recipes rely on phrases such as “mix everything”, “chop fine” or a time alone.

**Proposed correction:** use ingredient-specific preparation checks that apply to every occurrence, including substituted and added ingredients. Give firmness/moisture endpoints as well as indicative cooking times. A recipe can have spoon-fed or appropriate finger-food serving variants; the adult chooses the variant suited to Lil H's current skills. Do not turn every meal into smooth purée.

### 4. The default plan is not missing starch

Every meal in the sampled 28-day baseline has a starchy ingredient. Breakfasts comprise **10 porridge days, 12 Weetabix/yoghurt-with-cereal days and 6 egg breakfasts**. Main meal-days comprise **12 beef, 12 chicken, 8 salmon, 14 egg and 10 plant**. No day has pulses at both lunch and dinner.

Those findings support targeted checks, not adding starch to every recipe or removing oats/Weetabix from breakfast. The type of orzo and other starch products still needs to be known before describing an entire day as predominantly wholegrain.

Seven recipes are not selected in that default period: **b11, m6, s2, s3, s4, s5 and s13**. They remain available through swaps and Re-plan, so all seven are included in the audit and must receive the same corrections.

## Recipe-by-recipe proposals

These are qualitative reviews of recipe structure, not calorie calculations or findings of deficiency. “Record finish” means move the existing finishing oil into measured data; it does not mean add more oil than the recipe already intends. General preparation principles above apply to every row.

### Breakfasts — 11/11 reviewed

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **b1 Banana porridge** | Oats, 120ml whole milk, half banana; mashed fruit; texture note warns about stiffness. | Retain the moisture endpoint and make it part of the final serving step. | Keep the whole-milk base. No default extra oil or peanut butter needed solely because this is porridge. |
| **b2 Weetabix & raspberries** | 80ml unspecified milk; 1 tbsp unspecified Greek yoghurt; berries mashed. | Keep full cereal softening and fruit preparation in the method; check for dry cereal patches. | Specify dairy products. Keep its cereal energy and iron contribution; assess actual serving before enlarging it. |
| **b3 Spinach scramble & sweet potato** | Egg, 1 tbsp milk, half sweet potato; spinach already finely chopped; no listed cooking oil. | Keep soft egg pieces; add a cooked-spinach strand check and an explicit soft-potato endpoint. | Egg is already a fat source. If oil is used to cook it, list that measured amount rather than implying an oil-free dry pan. |
| **b4 Pear porridge** | Oats and whole milk; pear peeled, steamed and mashed. | Keep softness as the endpoint, rather than relying solely on six minutes. | Existing energy structure is reasonable to retain; quantify any extra milk used. |
| **b5 Blueberry yoghurt porridge** | Whole milk and oats; unspecified Greek yoghurt; berries “squashed flat”. | Use thoroughly mashed berries in this spoon-fed version, leaving no intact round berries; retain moisture. | Specify yoghurt. Keep whole milk; no automatic further enrichment. |
| **b6 Peanut butter banana Weetabix** | Smooth peanut butter is thinned into milk; cereal softened and banana mashed. | Retain this as the model nut-butter instruction; it must follow peanut butter into other recipes too. | Already has a named energy-dense ingredient. Clarify milk product; do not add a second fat by default. |
| **b7 Apple & blackberry porridge** | Whole milk; apple softened and mashed; blackberries mashed. | Keep those explicit steps and a softness check for the fruit. | Keep the milk/oat structure; document extra liquid if used. |
| **b8 Squash & egg scramble** | Egg, 60g squash, small potato and 1 tbsp milk; vegetables simply steamed ten minutes. | Add a final test for both vegetables and keep the egg mixture moist. | Egg contributes fat. Review the vegetable/serving quantities before adding more bulk; list any cooking oil actually used. |
| **b9 Banana yoghurt pot** | 3 tbsp explicitly full-fat Greek yoghurt, half banana and half Weetabix. | Retain cereal softening; avoid leaving dry clumps. | Small-looking recipe but not proven inadequate. Weigh the yoghurt/cereal once for a reproducible household portion; offer more according to appetite. |
| **b10 Weetabix & stewed apple** | 80ml unspecified milk; apple steamed and mashed. | Keep apple softness and full cereal soaking explicit. | Specify milk; no blanket fat addition just because there is no added oil. |
| **b11 Apple & cinnamon porridge** | Whole milk and oats; apple softened; available but absent from sampled rotation. | Same preparation standard as b4/b7. | Retain current structure and apply the same portion data despite its lower use. |

### Beef mains — 7/7 reviewed

All seven specify 5%-fat mince and currently receive the finishing-oil footer. Lean mince alone is not a reason to diagnose a low-fat meal; its amount, other ingredients and recorded oil all matter.

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **m1 Beef & lentil bolognese orzo** | Mince broken up, lentils cooked down, grated carrot; firm bits noted. | Consolidate mince/lentil tenderness and moist final texture into the serving step. | Record browning oil and finish separately. Keep orzo and avoid thinning the sauce excessively. |
| **m2 Mini cottage pie** | Potato mash, mince, carrot and peas; pea skins explicitly broken. | Retain pea preparation; verify carrot is soft and mince has no firm clumps. | Record both oils and milk amount. Add the method's 100ml water to the ingredients. |
| **m3 Mild beef goulash & sweet potato** | Mince with diced vegetables; method says soft then lightly mash. | Keep the vegetable tenderness endpoint and specify the final mince texture. | Record existing oils; keep the sweet potato rather than adding a second starch by default. |
| **m4 Beef, butternut & spinach orzo** | Squash mashed, mince browned, spinach wilted, then “mix everything”. | Specify cooked-spinach chopping and a final moist mixture check. | Record existing oils; keep the measured orzo and water rather than replacing starch with more vegetables. |
| **m5 Beef, leek & parsnip mash** | Leek sliced fine; parsnip/potato mashed; mince mixed through. | Add a check for remaining long leek fibres and firm mince pieces. | Record oils; make the mash liquid/consistency reproducible. |
| **m6 Beef & cauliflower tomato stew** | Cauliflower, peas and potato steamed then chopped fine; mince in sauce. | Explicitly break up peas, test potato/florets, and remove any firm stems from the serving. | Record existing oils. Potato is already present; do not classify the dish as missing starch. |
| **m7 Beef, courgette & sweet potato hash** | Small courgette pieces cooked five minutes; sweet potato steamed. | Add the final softness/moisture endpoint; the word “hash” should not imply a crisp or dry serving. | Record oils; retain the two-tablespoon sauce water measurement. |

### Chicken mains — 5/5 reviewed

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **s2 Chicken & butternut orzo** | Thigh meat chopped very fine; note recognises moisture; squash mashed. | Add a final check for chewy/stringy pieces and combine thoroughly with the moist base. | Thigh contributes some fat; record the existing finish and keep orzo quantity explicit. |
| **s6 Chicken, leek & potato mash** | Chicken chopped; vegetables mashed with unspecified milk. | Specify short tender chicken pieces, cooked-leek fibres, and the finished mash consistency. | Record finish and milk product/quantity. |
| **s9 Chicken & lentil ragu** | Thigh, lentils, carrot, orzo; 100ml water appears in ingredients but not the simmer step. | Confirm chicken texture and collapsed lentils; make sauce-water use explicit. | Record finish; keep the cereal/pulse base and avoid unnecessary dilution. |
| **s12 Chicken, sweet potato & broccoli** | Chicken chopped fine, vegetables mashed; no final moisture instruction. | Add broccoli-stem and chicken-fibre checks; specify the finished texture. | Record finish. Add only enough suitable liquid for texture; liquid alone is not an energy source. |
| **s21 Chicken, courgette & tomato orzo** | Small chicken pieces simmered in measured sauce; orzo cooked separately. | Add a tenderness check before final chopping and mixing. | Record finish; retain starch and sauce quantities. |

### Salmon mains — 5/5 reviewed

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **s1 Salmon, potato & pea mash** | Explicit skin/bone checks; everything mashed with milk. | Keep bone checking and explicitly ensure peas are broken up in the finished serving. | Salmon already supplies fat. Record the existing finish without automatically adding another enrichment. Specify milk. |
| **s5 Salmon & broccoli orzo** | Fish flaked and bone checked; broccoli chopped; pasta cooked separately. | Make the final “combine with orzo” instruction explicit; check firm stems. | Record finish and milk product/quantity. |
| **s8 Salmon & sweet potato mash** | Fish skin/bones removed, spinach and potato mashed together. | Keep bone check and explicitly deal with remaining spinach strands. | Salmon is a documented fat source; record existing finish. |
| **s14 Salmon, leek & pea orzo** | Fish bone check and mashed peas already stated. | Keep those steps; add cooked-leek fibre and moisture checks. | Record finish and milk; avoid treating fish as equivalent to a fat-free protein. |
| **s22 Salmon, courgette & potato mash** | Skin removed, bones checked carefully, mash with milk. | Retain its strong bone instructions and add final vegetable tenderness. | Record finish and milk product/quantity. |

### Egg mains — 5/5 reviewed

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **s7 Tomato eggs with orzo** | Spinach in sauce, eggs cooked until set, pasta added; spinach preparation not specified. | Chop cooked spinach and keep the egg/sauce mixture soft rather than dry clumps. | Eggs already contribute fat. Record existing finish rather than assuming no fat because no dairy is listed. |
| **s15 Egg, potato & carrot mash** | Hard-boiled eggs chopped fine and folded through milk mash. | Explicitly blend dry egg pieces into the moist mash; confirm carrot softness. | Record finish and measured milk. |
| **s18 Cauliflower, courgette & egg mash** | Vegetables mashed, egg chopped; limited final moisture description. | Add checks for cauliflower stems and dry egg pieces in the final serving. | Record finish; egg contributes fat. Do not automatically add yoghurt, which conflicts with current household digestion preferences. |
| **s19 Broccoli, egg & sweet potato mash** | Vegetables and hard-boiled eggs mashed; no sauce or milk. | Make final moisture and broccoli-stem checks explicit. | Record finish. A texture-liquid suggestion is reasonable if dry, but does not prove a need for extra calories. |
| **s20 Courgette, pea & egg orzo** | Peas cooked with pasta; eggs scrambled; no explicit pea crushing. | Add a pea-breaking step and prevent dry egg clumps. | Record finish and any actual oil used for scrambling, avoiding duplicate quantities. |

### Plant mains — 7/7 reviewed

These have the highest priority for checking the documented finishing component: the base recipes have no named milk/yoghurt quantity that could substitute reliably for it. This identifies missing recipe data, not a finding that their total diets lack fat.

| ID and recipe | Current recipe evidence | Proposed preparation change | Proposed energy/fat change |
|---|---|---|---|
| **s3 Lentil, carrot & sweet potato dhal** | Lentils should collapse and vegetables are mashed; current rinse instruction wrongly includes “250ml”. | Fix rinsing separately from cooking water; require lentil/vegetable tenderness. | Record finish. Keep water needed for cooking, but avoid turning it into a thin soup by default. |
| **s4 Chickpea, spinach & tomato stew** | Explicitly mashes every chickpea; spinach wilted; potato steamed. | Retain chickpea instruction, chop cooked spinach and make final potato preparation explicit. | Record finish; keep its potato base. Do not add more vegetables as a substitute for the finishing component. |
| **s10 Parsnip, carrot & chickpea mash** | Every chickpea squashed; roots and potato steamed; splash of milk. | Keep chickpea step and vegetable softness endpoints. | Record finish and milk product/quantity; avoid assigning a meaningful fat contribution to an unmeasured splash. |
| **s11 Butternut & lentil orzo** | Cover-depth water guidance; spinach wilted; current first step has awkward timing wording. | Rewrite the step cleanly; confirm lentils have broken down and cooked spinach is chopped. | Record finish; keep measured orzo. Review final thickness after cooking. |
| **s13 Chickpea, courgette & potato mash** | Every chickpea squashed; potato/courgette steamed; milk splash. | Retain the chickpea instruction and verify final potato softness. | Record finish and milk. No need to restore the old yoghurt version to add fat. |
| **s16 Lentil, pea & potato mash** | Lentils simmered; peas steamed; “mash everything” rather than explicit pea preparation. | Add pea-breaking check; fix the first-step timing wording and require softened lentils. | Record finish; retain potato and review thickness. |
| **s17 Tomato lentil orzo** | Lentils simmered in measured passata/water; orzo cooked separately. | Require fully softened lentils and a moist final mixture. | Record finish; keep existing starch, without labelling the whole meal inadequate from ingredients alone. |

## How I would implement the recipe changes

### A. A small preparation record for each ingredient

Use explicit, reviewed data rather than deriving safety instructions from recipe-name words. For example:

- `salmon`: bone/skin check and flaked serving preparation.
- `chickpeas` / `peas`: their preparation action is included when present.
- `blueberry` and other berry additions: an appropriate spoon-food preparation action.
- `apple` / `pear` / firm root vegetables: the chosen method's softness endpoint.
- `pb`: smooth butter dispersed in the food, never an isolated blob.
- `spinach` / `leek` / chicken: recipe-appropriate treatment of fibres/strands.

The checklist should derive from the **effective recipe** after swaps, additions and “None”. A chickpea swap must introduce the chickpea instruction; a removed ingredient must remove its instruction. Word substitution alone is insufficient. Actual method variants still require authoring/review—ingredient rules must not invent cooking times.

Show a short **Before serving** section after the method, grouping the relevant checks instead of repeating every general rule. Include every required action; do not truncate checks to fit a fixed item count. Put upright/supervised eating in a small shared reminder. Use “Preparation checks”, not a green “choking-safe” badge.

### B. Author measured quantities with an explicit basis

Store quantities as per-batch or per-serving values. Keep the existing baseline of one breakfast serving and two main servings. Use that same data for the ingredient list, method, portion changes and stock requirements.

This solves three current inconsistencies:

1. Finishing oil disappears when `Makes` is changed.
2. Added ingredients use fixed `addHint` strings that are not consistently rescaled with the rest of the recipe.
3. Method scaling currently matches numeric quantities but can miss a fraction such as `½ tsp`.

Do not scale food dimensions or cooking times as though they were ingredient amounts. Rinsing water, steamer depth and drained boiling water must remain separate from food-retained liquids used in nutrition calculations.

### C. Store preparation and ingredient facts with the batch

Cook-day views, read-only leftovers, stored-food previews, swaps, and Re-plan should all use the same source recipe facts. A leftover's preparation/fat view must include what went into that source batch. Reheating should preserve the appropriate serving check; it should not blindly offer instructions for cooking the same ingredient from raw again.

## Proposed planning logic

### Keep safety/preparation readiness separate from nutritional suggestions

**For recipe data and automatic choices:** require an authored preparation profile for supported ingredients and a valid method/serving combination. A recipe with missing preparation data should fail the recipe-data audit and be excluded from newly generated automatic choices until reviewed. Existing saved meals should remain visible and get a clear information warning; never silently alter food already cooked.

The app cannot verify whether an adult has actually removed a bone or softened a piece of fruit. Those remain serving actions, not facts inferred from checking a box in the planner.

**For energy/fat:** use a modest qualitative check:

- Does the meal retain a starchy base?
- Does its actual ingredient list contain a documented source of fat—such as egg, salmon, the specified dairy, nut butter or recorded oil?
- Was an intended ingredient removed, swapped for an unknown product or omitted because it is out of stock?
- Are the product type and quantities known enough to describe the recipe accurately?

Count the fat contributed by meat as well as by the more obvious sources above when product data supports it. Chicken or 5%-fat mince must not be treated as fat-free. There should be no rule that every meal needs added oil.

Example warning: **“Olive oil was left out—review this meal’s finishing ingredient.”** Example unknown: **“Milk type isn’t specified.”** Neither should be labelled “Lil H hasn’t had enough fat”. Merely detecting an egg or a few drops of oil is also insufficient to declare daily adequacy.

### Re-plan and Randomise

Evaluate these checks after applying the same effective swaps the recipe card shows. Prefer a complete, documented recipe using stock you have. Prefer reviewing or restoring an existing suitable finishing ingredient to adding a new food to every dish. If no option fits, explain the specific uncertainty and preserve the user's ability to choose manually, consistent with R1.

Keep the existing digestion preferences while making these changes. In particular, do not fix a missing-fat warning by adding yoghurt to a dish that the current household rules flag. Do not change protein quotas solely to increase fat.

### Day/week view

Show meal structure and preparation completeness. Do not calculate “remaining calories today”, prescribe a fixed daily fat target, or mark the whole day's diet complete from a planned menu. Actual portions eaten, product details and snack quantities are not available.

A small static context note can record: **“Usual routine: about 500ml HiPP Stage 3 plus water; two fruit snacks. Snacks and actual intake are not logged.”** It must not become a daily milk/snack checklist or a dairy-sufficiency shortcut.

For fibre/wholegrains, start by specifying product types. A future pattern suggestion can flag an unusually repetitive wholegrain/pulse-heavy plan for review, but there is no basis here for an arbitrary maximum number of oat, Weetabix or pulse meals. The current rotation already mixes breakfast cereals with potato and orzo mains.

### Texture progression

Offer reviewed serving alternatives where useful, guided by the adult's knowledge of Lil H's skills. Do not force a finger-food meal into a weekly plan or change all mashed meals to chunks. Recipe selection should not infer feeding ability solely from age. Feeding/swallowing difficulty would need individual professional advice before generic progression rules.

## Rules and implementation areas affected

| Existing rule/area | Proposed change |
|---|---|
| LH8: safe texture | Add ingredient-derived preparation and serving records; preserve suitable texture alternatives. |
| N1/N2: meal structure | Evaluate effective ingredients; distinguish a missing starch from an uncertain portion size. |
| New energy/fat rule | Require explicit recipe facts; warn about omissions/unknowns without claiming dietary adequacy. |
| N5: bottles cover dairy | Replace the assumption based on bottle count with the stated routine and an explicit limit on what the app knows. |
| R1: warnings and manual choices | Keep information warnings and manual choice; require reviewed data for automatic suggestions. |
| C11/C12/C22: portions and consistent views | One quantity basis and source-batch information; no new portions created by recipe metadata. |
| C23/C26: swaps and Re-plan | Regenerate checks after effective swaps/additions/removals, including expected leftovers. |
| LH14: new ingredient/recipe checks | Include preparation profile and quantity/fat-data audit before a recipe becomes an automatic choice. |
| Shared stock | Confirm actual dairy products; account for oil explicitly rather than as an untracked footer. |

Implementation would chiefly touch `LH_R`, `LH_ING`/`LH_SHARE`, `addHint`, `needOfSm`, `dietIssues`, `recipeTags`, source-recipe resolution, portion rendering/scaling, and the common checks used by picker/Re-plan/weekly summary. Keep the implementation small: reviewed recipe fields and shared evaluation functions, rather than a calorie-tracking subsystem.

## Test plan before a release

1. All 40 recipes have an authored serving profile and a consistent portion basis. All 29 mains account for their intended finish.
2. Milk/yoghurt product uncertainty is visible; shared stock remains correct when products really are shared.
3. One-, two- and larger-portion displays keep matching ingredient/method amounts. Oil is not lost, doubled or rounded into a substantially different quantity.
4. Default and resized recipes retain the finishing instruction; additions scale; preparation dimensions and times do not scale.
5. Swap to chickpeas/peas/fish/fruit/nut butter, add them, then choose “None”: the relevant preparation checks appear/disappear correctly.
6. Cook day, expected leftovers, actual fridge/freezer leftovers and recipe previews agree on ingredient and fat/preparation information.
7. Re-plan judges effective ingredients exactly as the card does, does not rewrite past meals, respects current digestion preferences and preserves portions.
8. Re-run the clean 28-day plan. Check baseline and modified menus without forcing extra fat into every recipe or an arbitrary wholegrain quota.
9. Inspect phone layouts in dark/light themes; preparation information remains easy to find and does not overwhelm the cooking method.

## Proposed delivery order

**First release:** repair the oil-footer/quantity problems, standardise confirmed dairy descriptions, correct the specific method issues below, and author preparation checks for all 40 recipes.

**Second step in the same feature:** connect those records to swaps, “None”, source batches and the planner; then validate the 28-day rotation. Keep snacks outside the app and make no formula or allergy-tracking changes.

I would not start with calorie targets or a wholesale menu rewrite. If growth, appetite or feeding is a concern, the recipe quantities and usual intake can be reviewed with a health visitor or paediatric dietitian rather than making the app diagnose an energy shortfall.

## Additional method defects found during this scan

- **s3:** a previous automated wording change incorrectly turned the rinse instruction into “Rinse the lentils until the 250ml water runs clear.” Rinsing and the measured cooking water must be separate steps. This should be corrected explicitly, not with another global text replacement.
- **s9:** 100ml water is in the ingredients but omitted from the simmer step.
- **m2:** 100ml water is in the method but absent from the ingredient list.
- **s11/s16:** the cover-depth instruction needs grammatical separation from “for 15 min”, plus a tenderness endpoint.
- **s5:** explicitly combine the cooked orzo with the fish/vegetable mixture.

These are proposals in this report; no application behavior was changed during the audit.
