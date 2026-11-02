# Lil H: gas-maker evidence and implementation

2 November 2026 · NPH v2.91 · local release

Gas-makers remain a first-class consideration in Lil H's meals, ingredient combinations, swaps, additions, removals and source-batch leftovers. His current diet is not being diagnosed as unsuitable. This review separates general digestive mechanisms from the specific household preferences already agreed with P.

## What the broader sources support

| Source | Useful evidence | Boundary for NPH |
|---|---|---|
| [NIDDK / US National Institutes of Health: gas and diet](https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/eating-diet-nutrition) | Some incompletely digested carbohydrates ferment. Its examples include legumes, cruciferous vegetables, apple/pear, dairy and whole grains; effects differ between people. | General digestive information, not a validated one-year-old gas-risk score or fixed combination limit. |
| [CHOC children's hospital: fibre and digestion](https://health.choc.org/healthy-gut-happy-kid-foods-that-support-digestion/) | Children's plant variety matters; rapid increases in fibre and large introductions of beans may produce discomfort. | Supports retaining varied foods and considering tolerance. This is general paediatric education, not a trial of Lil H's recipes or an age-specific dose. |
| [British Nutrition Foundation: fibre](https://www.nutrition.org.uk/nutritional-information/fibre/) | Fermentable fibres occur in leek, wheat/oats and pulses; rapid changes in fibre intake may cause wind or bloating. | Useful for ingredient awareness, without treating all grains or all portions alike. |
| [American Academy of Pediatrics: lactose in infants and children](https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Lactose-Intolerance-in-Children.aspx) | Dairy can contain lactose; lactose intolerance and milk allergy are different. Lactose tolerance requires its own assessment. | Confirmed full-fat products still count nutritionally. Their fat percentage and prior allergy results do not prove digestive tolerance or diagnose intolerance. No blanket dairy restriction is added. |
| [NASPGHAN Foundation / GiKids: FODMAPs](https://gikids.org/digestive-topics/fodmap/) | Discusses individual triggers, including garlic, in the context of specialist care for digestive conditions. | Its food tables are not adopted as a healthy baby's exclusion list. Garlic powder in a small optional pinch is not equated to a large serving or added to the strong category. |
| [ESPGHAN position paper, 2022](https://doi.org/10.1097/MPG.0000000000003526) | The paper found limited paediatric evidence for low-FODMAP treatment, with nutritional risks from restriction and a need for specialist oversight where used. | No automatic low-FODMAP diet, new elimination plan or diagnostic claim is introduced. The paper concerns paediatric gastrointestinal care, not general complementary feeding. |

The reviewed sources do not establish the app's precise one-strong/two-total limit, a universal yoghurt–cauliflower interaction, or a claim that potato/orzo cancels another ingredient's gas production. Those limits are retained explicitly as household preferences. P's report that yoghurt with cauliflower upset Lil H remains relevant personal context, rather than proof of an interaction for every child or every yoghurt combination.

## Ingredient review

All 45 supported stock ingredients, plus the temporary fruit-pouch substitute, have explicit digestion review data.

| Category | Ingredients | Behaviour |
|---|---|---|
| Higher-priority household contributors | Lentils, chickpeas, broccoli, cauliflower | Existing automatic household caps and main-meal separation retained; manual combinations warn. |
| Milder household contributors | Peas, leek | Count toward the existing combined cap; the relative ranking is a household choice. |
| Possible contributors / explanatory context | Apple, pear, garlic, oats, Weetabix, orzo, milk, yoghurt, variable fruit pouches | Ingredient-specific notes and sources. No new automatic food exclusions or numerical risk score. Actual grain product, quantity and tolerance can vary. |
| Other reviewed ingredients | Remaining supported proteins, vegetables, fruits, oil, herbs and spices | No additional restriction in this planner. This does not declare them incapable of contributing to gas or symptoms. |
| Missing digestion profile | A new or unreviewed recipe ingredient | Explicit review warning; excluded from new automatic choices until reviewed. |

The app does not know amounts actually eaten, laboratory carbohydrate content, or an individual's threshold. It therefore does not invent a combined fermentable-load calculation, grams-per-day gas limit, clinically defined strong/mild ranking, or an arbitrary cap on fruit, grains or fibre. Formula and snacks remain outside tracking, as requested.

## Changes implemented

1. **Visible recipe review.** Gas makers & combinations appears near the ingredient controls, showing higher/milder contributors and all applicable household combination warnings. A disclosure explains individual ingredients and links sources. Possible contributors appear separately as neutral information.
2. **Customised meals.** Swaps, additions and None rebuild the review from effective ingredients. When a day is known, an ingredient option now warns before selection if it introduces a clash with the other main meal. A global recipe edit still receives meal checks immediately; its affected plan days show contextual warnings after saving.
3. **Manual choice stays available.** A warning does not silently block a custom ingredient. None remains labelled exactly None. The recipe and plan show the resulting combination.
4. **Automatic choices keep digestion priority.** Re-plan, Randomise and automatic substitutions retain hard household limits even in fallback. Missing digestion metadata excludes a new automatic choice. Soft same-day separation remains preferred, with existing advisory behaviour when alternatives do not fit.
5. **Recorded food stays consistent.** Cooked/custom batches use their saved ingredients. Later global edits do not rewrite a leftover's digestion review. Expected leftovers continue to use their prospective source without entering Stock early.
6. **Distinct ingredients counted once.** A repeated key after a swap is not falsely described as two different gas-makers. This is not a claim that eating more of one ingredient cannot matter.
7. **Evidence wording.** Household limits and yoghurt combinations are identified as personal planning rules. The preferred base is not presented as neutralising gas, and full-fat dairy is not presented as automatically tolerated. Recipe/Info notes avoid calling any meal gas-free.

Custom shopping-list entries are still shopping-only (ST7); NPH does not currently have a free-form recipe builder. These changes cover the customised recipes it supports through ingredient edits. An arbitrary new shopping item is not silently inserted into a recipe or treated as having reviewed preparation/digestion data.

## Before and after examples

| Action | Previous gap | v2.91 |
|---|---|---|
| Add lentils to chicken orzo when dinner contains cauliflower | The addition checked its own meal; the other-meal conflict appeared only on the saved plan. | The Add option shows Same day as cauliflower before selection, then the recipe and day retain that warning. Removing lentils clears it. |
| Add broccoli and yoghurt to lentil orzo | Recipe ingredient pills identified foods, but the recipe review did not list its digestion conflicts together. | Visible warnings name the second gas-maker and the household yoghurt restriction. |
| Swap banana to apple | Fruit preparation changed, but there was no broader contributor explanation. | Apple awareness and its source appear; no automatic apple restriction is imposed. Removing it removes that note. |
| Open a customised leftover after editing the global recipe | Source consistency needed explicit regression coverage for digestion. | It retains the recorded lentil/leek combination and its matching notes, rather than a later cauliflower edit. |
| Add a new recipe ingredient without digestion review data | Preparation coverage alone could make it eligible for automation. | Digestion details need review is shown and actual new Re-plan choices exclude it. |

## Verification

- All 40 base recipes and all 45 stock-ingredient digestion profiles reviewed; zero base-recipe hard household clashes.
- Custom strong/strong, strong/two-milder and yoghurt/strong combinations checked; one higher plus one milder remains allowed.
- Real Add preview across two main meals, saving, removing, global custom versions and source-batch views checked in isolated Brave.
- Actual Re-plan proposals exclude missing digestion data; the preview leaves saved state unchanged.
- Existing 40-recipe, 87 portion-display, 84-meal baseline, planning and day/heads-up/week regressions pass.
- Dark 400px and light 320px phone layouts checked. A narrow-screen overflow in recipe facts was corrected by putting Makes on a separate row.

No tests used the live phone website or either phone's saved data. This is a local release; publication remains separate.
