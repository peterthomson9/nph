# Recipe method review — 4 November 2026

Reviewed the runtime catalogue: 86 adult and 40 Lil H cooking recipes; 16 takeaway labels have no cooking method. This is a source/content and browser review, not a kitchen trial.

The reported s13 potato → sweet potato, milk → None case exposed a general rendering error: the whole replacement's preparation/serving checklist was inserted before the original method. It instructed cooking/mashing before steaming, and mixed steps retained crossed-out ingredients.

## Corrections

- Lil H edited recipes use authored sequences for all 40 recipe IDs, based on their actual source ingredients. Roots are prepared before steaming; firm fruit is cooked before assembly, soft fruit is mashed, and pouches are stirred in. Repeated replacement fruit is prepared once. The example remains four steps.
- None removes mixed-step instructions for that ingredient. Milk-free cereal uses the same measured amount of water, shown in ingredients. Oil omissions retain the existing nutrition warning and use a non-stick pan with a little water where browning is needed.
- Added oats/cereal have their own measured liquid and separate preparation. Chicken/fish/vegetable additions specify separate preparation. Bay instructions appear in the cooking stage. Existing measured quantities and cooking endpoints scale appropriately.
- Root/fruit swaps use comparable edible weights; cheddar substitutions use grams, not mozzarella balls. Slow-cooker meats use their corresponding timing; appliance selections adapt the instructions, retaining hob times in mixed oven/hob recipes.
- Future quick chicken dishes offer thigh/breast, not stewing beef/pork. Slow-cooker beef/chicken/pork choices remain available. Dry lentils are not interchangeable with canned pulses; binding banana is fixed in banana bread/cookies. These restrictions apply to automatic and manual choices.
- Base adult corrections cover missing pasta/rice cooking, separately cooked sides, bay removal, milk in mash, fresh salad additions, sausage doneness, chicken endpoints, cheese/cinnamon usage and fresh-vs-reheated chicken.

## Authored checklist

Existing ingredient identities, shared stock mappings, portion bases, nutrition/fat/digestion profiles, storage policy and household preferences remain. No new foods or nutrition targets were introduced. Existing reviewed Lil H recipe IDs retain their sign-off following this method review. Source batch records are not rewritten by opening a recipe; future base definitions receive the authored corrections.

Preparation endpoints were checked against [NHS preparing food safely](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/): soften firm produce, prepare fruit appropriately, remove fish bones and adapt texture. Doneness and reheating language follows [Food Standards Agency cooking guidance](https://www.food.gov.uk/safety-hygiene/cooking-your-food). Times are estimates, not guarantees of doneness. Existing household egg and storage rules remain unchanged.

## Verification and limits

- Permanent browser regression: 126 base recipes, 346 offered single swaps, 112 allowed single omissions and 727 additions render without empty/invalid methods. Focused assertions cover the reported sequence, fruit/pouch preparation, missing cereal liquid, scaled additions, duplicate fruit, cheese weights, selected appliance/timing and immutable source facts.
- Existing preparation/quantity/history regression covers all 40 Lil H recipes, 87 resized main-recipe views and a 28-day rotation.
- Layout checks cover the pictured mash, edited fruit porridge and chicken-swapped stew in light/dark at 320/400px. No horizontal overflow or clipped text; screenshots remain local test artifacts.
- Seeded planning checks cover 300 actions across seeds 3 and 17, including swaps, stock, moves, portions, Undo, Re-plan and storage assignments.
- The mandatory release gate includes the new method and layout regressions, alongside storage, backup, update, offline and sync checks.

The enumeration covers individual supported operations plus focused combined cases; it does not prove every possible multi-edit combination or future recipe is correct. Historical unsupported substitutions are retained, not silently migrated or certified as newly supported. Future entries require explicit authored method review rather than inheriting a passing catalogue count.

The recovery regression now keeps one test-clock offset across reloads and selects the newly created recovery snapshot by ID. This fixes a test-only clock rewind/older-snapshot selection; full data equality and restore assertions remain. Release-check output uses UTF-8 so an emulator failure cannot hide its own diagnostic log.
