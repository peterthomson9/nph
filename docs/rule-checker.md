# Rule checker and reproducible stress tests

Implemented 3 November 2026, v2.112. This is a development/release tool, not a phone-data repair tool. It never visits the hosted app or attaches to a saved browser profile. It opens the repository's local index.html in fresh disposable contexts, with a controlled UK clock and two independent seeded random generators (action selection and app choices).

Run before every publication:

```powershell
python tools/verify-release.py
```

This gate runs 21 checks: release identifiers; independent-oracle self-tests and a seeded smoke run; every regression found here; catalogue/recipe history; leftover planning; Cooked actions/portions; repeated fresh meals; source ingredients; stock/freeze overlap; notice links; Back/window behaviour; pill highlights; dropdown edge; backups; durable storage; save/update boundary; updates and offline reopening. It exits nonzero on failure and writes tests/screenshots/release-gate.txt. App-file releases still require a new NPH_V and prepare-release.py before this gate.

For sustained mixed actions, run:

```powershell
python tests/rules/run.py --steps 500 --seeds 3,17,2026
```

--steps is the number of completed actions **per seed**. Inapplicable attempts are skipped and counted separately. Reports include action counts by type, errors, expected warnings and coverage. --report selects a report path under the workspace. --clock changes the initial date/time. Use BROWSER_EXE to select an installed Chromium browser; the local Windows default is Brave. Python Playwright is required.

Every failed run saves its seed, original clock, initial snapshot, exact chosen actions/quantities/recipes and failing snapshot in tests/rules/failures/seed-N.json. Replay using:

```powershell
python tests/rules/run.py --replay tests/rules/failures/seed-3.json
```

Replay failures may cease to be applicable after a bug fix; that is reported explicitly rather than silently skipped. Full generated traces are ignored by Git because they can be large. The small permanent reproductions, regression-history.js, regression-boundaries.js and regression-shifted-source.js, are committed and are mandatory release checks. Add a new small regression for every further confirmed bug; never weaken an invariant to make a run pass.

## What is checked

tools/rule-checker.js is loaded only by tests. capture() gathers detached state and observations without writing anything; it verifies that household state did not change. audit(snapshot) does not call app allocation/expiry/readiness helpers: its portion ordering, date limits, exact thaw deadline and readiness calculations are separate. transition() checks storage conservation and dated past-meal protection. Expected warnings are reported separately from integrity errors and never auto-repaired.

| Rules | Checks/evidence |
|---|---|
| C1/C2 | UK meal ordering and cooked/eaten classification; controlled half-hour/hour/day advances. Exact 24-hour duration is tested across the UK clock change. |
| C3 | Automatic/unrelated actions preserve dated past picks, splits, order and dated ingredient/method/size changes. Template-origin keys are not misidentified as actual dates. |
| C5/C8 | Explicit named-source/profile/meal identity; one-day recipes cannot become implicit leftovers. Separate cookings and split rows also have existing focused regressions. |
| C11–C15 | Positive integer portions; independent chronological, ready-fridge-first allocation; eaten/reserved/free/short totals; move/discard conservation. |
| C16–C18/C20 | Fresh/rice/child/freezer dates, exact timestamped 24-hour thaw limit, readiness by mealtime, process metadata and automatic-thaw chronology; expired food stays warned and cannot gain a new life through a storage move. |
| C22/C23 | Batch size/facts, source references and Cooked expiry agree; recent source facts survive cleanup. Expected references become actual after cooking. |
| C7/C9/C10/C24–C30/R1 | Mixed real picker, split, reorder, re-plan, ingredient, size, storage assignment and Undo/Redo paths, plus existing source/history/planning/catalogue regression tests in the gate. These are behavioural examples, not a separate complete solver for every nutrition preference. |
| C31/C33 | Stock changes participate in the same sequences; device-local Undo/Redo and saved-data preservation use existing regression tests. |
| C32/C34 | Intentionally excluded: shared phone sync is not implemented. No cloud project is configured. |

Some observations necessarily come from the app: its recipe catalogue, generated implicit uses and rendered meal classification. Consequently this is not a mathematical proof of every planner rule or of recipe/clinical content. Catalogue author review remains required. Missing precise thaw timestamps in legacy records retain the existing date fallback; no history is invented. Completed sources older than the three-day checking window may be archived: their old saved meal links are informational warnings, while missing active/recent sources are errors. Manual choices needing attention remain warnings rather than being deleted.

## Bugs found and permanent reproductions

- Cleanup could discard an exhausted source while a meal in the recent three-day history still needed its facts. Keep it until those recent uses age out.
- Expected links stayed marked planned after cooking; later cleanup could reset an earlier meal override. Promote actual links and restrict cancellation cleanup to upcoming meals.
- Implicit dinner use could consume a shared portion before an explicit earlier lunch. Allocate by actual meal time before implicit/reference tie-breaks.
- Freezer expiry was absent from the assigned-meal late flag. Apply dates to both storage locations and show the existing red warning.
- Automatic thaw could be dated before freezing finished, or renew expired freezer food. Only assume the established 8pm take-out when the recorded freeze/expiry history permits it; retain an honest frozen warning otherwise.
- Timestamped thawed food could be treated as usable until the end of the following calendar date. Use the actual 24-hour deadline for current expiry, planned meals, available storage choices and re-plan; keep the documented untimed legacy fallback.

- v2.113: shifted original batch-position keys collided with actual dates holding stored-food reservations. Cards and recipe/nutrition checks could borrow another batch’s facts while the picker showed the correct saved recipe. Keep template and dated keys distinct, validate named-source identity, and preserve both same-recipe cooking differences and valid tomorrow leftovers. The permanent test is synthetic, derived from the reported scenario without publishing household backup data.

These changes preserve source facts, portions, backup format/data schema 1, explicit choices and existing safety-warning locations. No phone's saved data is edited or reset.

Validation for v2.113: the supplied backup reproduced the displayed-name mismatch in a disposable Brave context; the corrected lookup showed the saved chickpea/salmon choices with cooked food unchanged. All 21 release checks passed. A further 500 actions per seed (3, 17, 2026), 1,500 total, passed with zero integrity errors; expected manual warnings remained distinct. Only the minimal synthetic scenario is committed.
