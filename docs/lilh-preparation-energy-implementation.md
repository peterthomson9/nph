# Lil H preparation and energy changes

**v2.90 update, 2 November 2026:** P has confirmed all household dairy is always full fat. Dairy sources now count automatically, including in earlier batch views. Product prompts and type-uncertainty warnings described in this v2.89 report have been removed. Existing stock mappings and batch data remain intact; unrecorded finishing-oil details still show a warning.

2 November 2026 · NPH v2.89 · implemented and tested locally

The [proposal](lilh-preparation-energy-proposal.md) has been implemented across all 40 recipes. The existing rotation and personalised digestion preferences are retained. Formula and snacks remain context; no snack/allergy tracker or calorie target has been added.

## What changed

- Every supported ingredient has reviewed serving preparation. Each recipe has an authored texture description and one-breakfast/two-main portion basis. Before serving derives all actions from the actual ingredients after swaps, additions and None. Swaps also introduce the target ingredient's preparation into the method. Optional soft vegetable alternatives are available for the two scramble breakfasts, subject to his current skills.
- All 29 mains list 1 tsp finishing olive oil per two-portion batch, preserving the old ½ tsp per portion. The seven beef dishes separately list their existing ½ tsp browning oil. The footer no longer adds oil. Oil participates in stock requirements; choosing None raises a specific review warning.
- Ingredients, method liquids, fractions and additions scale together. One portion of a main has ½ tsp finish; three have 1½ tsp. Beef browning oil becomes ¼ tsp and ¾ tsp respectively. Food dimensions, equipment water depth and cooking times stay unchanged. An egg fraction represents beaten egg measured for the batch, rather than silently rounding up a whole egg.
- Recipe dairy intentions are explicit. Former main-recipe splashes start at 30ml whole milk per two portions; texture can still be adjusted gradually. The yoghurt pot specifies 45g yoghurt, approximately its previous three tablespoons. These are authored household starting quantities, not a laboratory-tested recipe or measured intake.
- Actual milk/yoghurt type starts Unspecified. Select Whole / Full-fat plain / Other in a recipe. Adult stock names are preserved. If the products differ, switch to separate Lil H stock and specify that product independently. The setting never confirms an unrecorded earlier batch's product retrospectively.
- Qualitative checks distinguish a missing finishing ingredient, unknown/different dairy and no documented fat source. Meat, egg, salmon and nut butter also count as sources. There is no rule that every meal requires an extra fat, and no statement that a planned recipe proves daily sufficiency.
- New batches record their recipe, ingredient changes, product types, method and size. Global changes, deletion and restocking do not rewrite them. Explicit source corrections update that batch; size corrections carry into leftover recipe displays. Earlier batches show that finishing/product details were not recorded and retain the earlier ingredient list. Expected leftovers remain prospective and do not enter Stock early.
- Recipe review, cards/day warnings, heads-up, weekly summary and planning use the same ingredient evaluation. Automatic choices require reviewed preparation and respect hard digestion restrictions even in fallback; manual choices remain available with information warnings. Normal selection prefers options without soft warnings.

## Specific method repairs

| Recipe | Before | After |
|---|---|---|
| Lentil, carrot & sweet potato dhal | Rinsing incorrectly mentioned the measured 250ml water. | Rinse under running water and discard it; use 250ml separately for cooking, then check collapsed lentils and soft vegetables. |
| Chicken & lentil ragu | Ingredients included 100ml water; simmer step omitted it. | Simmer step explicitly uses the 100ml, with chicken and lentil endpoints. |
| Mini cottage pie | Method used 100ml water absent from ingredients. | Water appears in both places and scales with the batch. |
| Butternut & lentil orzo; lentil, pea & potato mash | Cover-depth and timing ran together. | Separate cover-by-2cm instruction, approximate cooking time, tenderness endpoint and top-up/reduce guidance. |
| Salmon & broccoli orzo; salmon, leek & pea orzo | Cooked orzo was not explicitly combined in the final step. | Final step combines drained orzo with the fish, vegetables and measured milk. |
| Blueberry yoghurt porridge | Squash berries flat. | Thoroughly mash them for the authored spoon-fed serving; the same action follows additions and swaps. |
| Scrambled egg recipes | Cooking fat/pan assumptions were unclear. | Non-stick, low-heat methods; the orzo scramble lists and scales its two tablespoons of water. No unlisted oil is implied. |

## Examples in use

| Situation | Before | After |
|---|---|---|
| Dhal changed from two portions to one | Scaling note replaced the finishing-oil footer. | Ingredients and method both retain ½ tsp finishing oil. |
| Beef orzo changed to three portions | Fractional browning oil did not scale consistently. | ¾ tsp browning oil plus 1½ tsp finishing oil, listed separately. |
| Banana swapped to apple | Mostly a word replacement in the recipe. | Apple preparation appears in the method and serving checks: remove peel/pips/core, soften and mash. Banana-specific checks disappear. |
| Peas added to a two-portion main | Fixed one-tablespoon addition, without a consistent batch basis. | Two tablespoons for the batch, three at three portions; crush every pea, with cooking time unchanged. |
| Oil left out of an egg main | Oil was invisible to the recipe's planning requirements. | Specific finishing-ingredient warning; egg still appears as a recorded fat source. |
| Unknown milk in stock | Generic Milk tick could be mistaken for whole-milk confirmation. | Product-type warning until selected; optional separate stock if Lil H's milk differs. |
| Cooked carrot version followed by a global recipe edit | Leftover details could follow later recipe/stock changes. | Recorded carrot batch retains its preparation, product choices and original quantities. |

## Validation

Local disposable Brave contexts; no tests against the phone deployment or saved phone data.

- All 40 recipes and all ingredient profiles checked; all 29 mains rendered at one, two and three portions (87 resized cases).
- Effective swaps/additions/removals, fish/pea/nut-butter/fruit checks, measured recipe fixes, unchanged dimensions/times and scaled additions.
- Shared/separate dairy selection and preservation of adult stock; unknown types remain explicit.
- Source and read-only leftover records; legacy-batch uncertainty; implicit ingredient deletion, later restocking, explicit source correction and changed source portions.
- Actual Re-plan proposals exclude missing preparation records and hard gas clashes; previews do not save changes. Existing leftover/re-plan regressions preserve portion counts and valid keys.
- Clean 2–29 November baseline: 84 meals retain starch and recorded fat sources when dairy products are confirmed, without changing the rotation or forcing further enrichment.
- Dark/light phone rendering checked in Brave. Existing green swap text, exact None label, first-use identity and independent nutrient pill behaviour retained.
- Day warnings, heads-up and the weekly summary agree on finishing omissions and product uncertainty. Narrow 320px dairy controls fit without horizontal overflow. The v2.89 service-worker cache installs and reloads offline in a disposable localhost Brave context.

The changes support preparation and household planning; an adult still performs the serving checks. The app records intended ingredients and qualitative sources, not quantities eaten or the adequacy of Lil H's entire diet. Preparation wording was checked against [NHS preparation guidance](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/); dairy/energy context follows [NHS toddler food guidance](https://www.nhs.uk/baby/weaning-and-feeding/what-to-feed-young-children/).

This release is local. The GitHub Pages phone deployment has not been changed by this implementation.
