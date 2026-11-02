# Leftovers and Re-plan review — 2 November 2026

Implemented locally in v2.96; reviewed using disposable Brave sessions, without loading or changing phone data.

## Findings and corrections

| Finding | Result |
|---|---|
| The date swap badge used the mint green `--ok`; ordinary Swap actions used a separate lime token. | `--swap` now aliases the badge's green in all themes. Warning swaps stay amber; added/removed ingredient colours retain their meanings. |
| The shared fresh-food expiry calculation gave Lil H cooking date +2, despite his cook-day-plus-tomorrow batch policy. | Every Lil H fresh fridge batch now expires at the end of the following calendar day. Recipe storage instructions use the same wording. Existing older food remains recorded and flagged; it is never silently discarded. |
| Re-plan chose fresh batches before looking for actual spare fridge portions. | Actual fridge portions now reserve suitable meals first, ordered by eat-by date, with the original meal track first. New recipe choices then account for those reservations. |
| A stored-food assignment was skipped even when its date was invalid. | Before today's cook-by, an invalid storage assignment can receive a suitable in-date fridge replacement in the preview. Valid stored food and today's already-cooked meals stay. Future invalid stored meals receive an unticked Replace it option. |
| Later automatic salmon batches could block an existing cooked salmon portion through the weekly limit. | Use the cooked portion first when the later automatic batch can be replaced, then change that fresh batch. Manual choices, already-cooked food and the weekly salmon cap remain protected. With no available replacement, the cap still applies. |
| Temporary automatic choices in the preview could be mistaken for manual picks by the expected-leftover pass. | Mark staged choices as automatic, matching saved Re-plan choices. Today's expected leftovers remain usable after their source meal, without entering Stock early. |
| Cooked-meal replacement candidates lacked the common readiness gate. | Apply the same reviewed-data and hard digestion gate used by other automatic choices. |

## Your salmon example

Before: Sunday dinner is manually corrected to Salmon, leek & pea orzo, making two portions. Monday dinner still points at Saturday's broccoli, egg & sweet potato mash.

After: Monday's Re-plan preview offers **Salmon, leek & pea orzo — From the fridge** for dinner. Confirming reserves Sunday's one remaining portion exactly once. Saturday's expired mash returns to spare food in Cooked, flagged for disposal; it is not erased. An automatic salmon batch later in the week changes when needed to respect the weekly maximum.

Fresh Lil H food cooked Sunday is usable Sunday/Monday, and expired Tuesday. Adult fresh-food limits, rice limits, frozen storage and thawing calculations are unchanged. Freezing food changes its storage rules; a thawed older batch is assessed from its thaw date, rather than rejected solely because its original cooking date was earlier.

## Boundaries retained

- Re-plan previews changes before saving. Closing it restores the original plan and food records.
- Planned meals preserves manual fresh picks; Everything can reconsider those picks. Valid stored assignments stay. Future already-cooked replacements require the existing Replace it tick box.
- Own-track leftovers precede cross-track use. Only available spare portions are used automatically; Re-plan does not silently steal a portion already reserved on another meal. An existing invalid future reservation is offered for explicit repair rather than silently moved.
- Actual source ingredients, including swaps, additions and removals, feed readiness, gas-maker and nutrition checks. Weekly salmon limits, portion availability, source-meal ordering and thaw readiness still apply. If no suitable slot exists, food stays spare in Cooked.
- Older saved invalid assignments are warned, not treated as safe or discarded automatically. Past meals stay unchanged.

## Evidence and storage policy

[NHS: storing and reheating food](https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/storing-and-reheating-food/) advises cooling promptly, using refrigerated food within two days, rice within 24 hours and defrosted food within 24 hours, and reheating only once. Lil H's following-calendar-day cutoff is this household's stricter planning policy. Calendar-day planning does not measure actual cooling, fridge temperature or handling; existing preparation and reheating instructions still matter.

## Verification

- `tests/regression-296.js`: reproduced salmon preview and saved dinner, original source/past meal preservation, exact portion reservation, expired food retained, weekly cap including no-stock fallback, expiry across all 40 child recipes, unchanged adult/rice/thaw/freezer limits, source customisation digestion checks, manual/valid stored choices, optional future-date repair, expiry/track ordering, thaw readiness and today's expected leftovers.
- `tests/layout-296.js`: both planners, matching badge/action/expanded-text greens, visible keyboard focus, fitting actions and no horizontal overflow, light/dark at 320px/400px.
- Existing planning, source-recipe, expected-to-cooked, catalogue and saved-reshuffle regressions passed in local Brave. Catalogue: 40 recipes, 45 stock ingredients plus the temporary pouch, zero audit issues.
