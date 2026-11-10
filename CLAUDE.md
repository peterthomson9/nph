# NPH: shared meal planner

NPH is a single-file web app (`index.html`) used on P's and N's phones at:
https://peterthomson9.github.io/nph/

An older Claude artifact also exists at https://claude.ai/code/artifact/151e0bb8-8974-437f-bb72-b7c8c313493c, but that is not the phone deployment.

It plans meals for P (Peter) and N, and for their baby Lil H, and tracks stock, a shopping list and cooked food in the fridge and freezer. The GitHub Pages build saves locally and supports opt-in Firebase household syncing. Phones remain separate until explicitly connected.

## Safety

- **Never test on the real NPH.** Test on a local copy (headless Chromium/Playwright, see `tests/`), never by clicking around the live link or changing either phone's saved data.
- Never edit or reset saved data; only change the page code.
- Publish phone updates to the GitHub Pages URL above. Read the deployed version first so nothing published from elsewhere is lost. Do not publish a phone update only to the Claude artifact.

## Changing logic

Before implementing or changing any logic, check it against the core rules (section 0 of `docs/nph-rules.md`). Tell P which rules it touches and outline what changes in the rulebook, then update the rulebook along with the code.

## Each release

1. Bump `NPH_V` in `index.html` (search `const NPH_V=`).
2. Run `python tools/prepare-release.py` to derive the service-worker version and `release.json` from `NPH_V`, then `python tools/prepare-release.py --check`. Every app-file release must use a new version; never edit an installed cache in place. Test on a local copy: no page errors, the changed behaviour works, nothing else moved. For updates/backups run `tests/updates.py`, `tests/backups.py` and `tests/offline-289.py` in disposable browser contexts.
3. Publish to the URL above.
4. Add one dated line to `docs/nph-changelog.md`; update `docs/nph-style-guide.md` (and its pass log) for anything visual; update `docs/nph-rules.md` for anything about behaviour.

The approved v2.102 update controls check on launch, foreground and reconnection; downloaded releases wait for Update now. Do not clear browser data to update. Existing installations without update controls can transition using `https://peterthomson9.github.io/nph/?nph-update=1#np`; see `docs/updates.md`. Preserve the v1 backup reader and historical regression fixture when changing storage in future.

From v2.104, IndexedDB is authoritative for household saves. Do not restore, clear, overwrite or read `nph-kitchen-v1` as if it were the current save: it is retained migration input and a source for detecting older-window writes. Await `NPH_STORE.flush()` at reload boundaries. See `docs/storage.md`; run `tests/storage.py` and `tests/storage-update-boundary.py` for storage or update changes. The app script is intentionally inert until the storage bootstrap injects it; browser tests must wait for `typeof S !== 'undefined'` before inspecting it. Never move startup back before storage readiness.

## Docs

- `docs/nph-rules.md`: the rulebook. Section 0 "Core rules" is the source of truth for how meals, portions, storage, splits and swaps must behave; items marked **to build** / **to check** are agreed but not yet in the app. P has reviewed the core rules (C1–C34). Section 1 has Lil H's digestion and nutrition rules (LH, N, R1).
- `docs/nph-style-guide.md`: the visual standard (tokens, text scale, buttons, dialogs, wording).
- `docs/nph-changelog.md`: one line per change.

## Phone sync rollout

Firebase project `nph-kitchen` is created. v2.114 was approved by P; production rule deployment and phone connection remain. P's phone is the starting copy; never let empty/incomplete remote data replace it. See `docs/firebase-sync.md`. No production seed has occurred. C34 remains last successful server write wins; C33 Undo remains local and cannot reverse a later remote change. Preserve the durable outbox, checkpoint deduplication, membership rules and internal schema-2 older-app guard. Run `python tests/sync.py` in addition to the existing required release gate when changing this protocol. Never test against production or saved phones.

## Planned next

Implemented v2.112: read-only rule checker, seeded mixed-action stress tests and permanent reproductions. Run `python tools/verify-release.py` before every publish; see `docs/rule-checker.md` for coverage, long runs, reports and replay. Every confirmed new bug needs a committed regression in that gate. Phone syncing is implemented in v2.114; production rules and the controlled phone connection remain.

## Current version

v2.118 (10 Nov 2026). Phones may retain an older cached version until its update is installed. Verify the hosted version when publishing. See the end of `docs/nph-changelog.md` for what's in each release.

## Working with P

- Plain language; give the reasoning before the steps.
- Keep it simple: no over-engineering.
- Watch token usage: test on local headless copies, keep screenshots small.
- Every visual change (including text, highlights, controls and windows) follows `docs/nph-style-guide.md`: consistency across the app, modern, sleek and fairly simple. Subtle fixes proceed directly. Larger changes need a real-app Before/After preview and approval before applying to the main app. Major redesigns need 2–3 options with trade-offs and representative previews first. Apply an already selected exact preview without asking again.

## Testing

`tests/runjs.py <script.js>` loads `index.html` in a 400px-wide phone viewport and runs the script inside the page, printing its result (see `tests/example-today.js`). Set `CLOCK=2026-11-01T10:00:00` to pretend it's a given time (many rules depend on cook-by and meal times) and `THEME=light` or `dark` to force a theme. Needs `pip install playwright` and `playwright install chromium`.

Set `BROWSER_EXE` to an installed Brave/Chrome executable to test that browser instead of bundled Chromium. `SCREENSHOT` optionally names an output PNG. The v2.85 regression scripts are `tests/regression-285.js` and `tests/expected-leftovers.js` (the latter uses `CLOCK=2026-11-01T09:00:00`). The recipe audit is in `docs/recipe-audit-v2.85.md`.

v2.89 uses `CLOCK=2026-11-02T09:00:00`: `tests/regression-289.js` checks all 40 recipes, quantities, effective preparation and batch facts; `tests/planning-289.js` checks actual automatic choices and source corrections; `tests/weekly-289.js` checks day/heads-up/week agreement. `WIDTH=320` with `tests/layout-289.js` checks the narrow dairy controls. See `docs/lilh-preparation-energy-implementation.md` for the feature and examples.

Useful hooks inside the page: `PLANNERS.pn` / `PLANNERS.lh` (each has `showToday()`, `render()`, `openRecalc()`, `huAct()`, `focusMeal(slot,n)` and `_dbg` with `todayN()`, `valAt()`, `R` and more), `go('np'|'lilh'|'shop')`, and the shared store `S`. Re-plan's buttons only respond when the window was opened by a tap on the page (like a real user), so open it by clicking the page's Re-plan button in tests.

Household confirmation (2 Nov 2026, v2.90): milk, yoghurt and all other dairy are always full fat. No product-type confirmation prompts or uncertain-fat warnings are needed. Preserve existing shared/separate stock mappings and batch records. `tests/regression-290.js` covers the change.

v2.91: digestion remains a priority in customised recipes and day combinations. Preserve Lil H household limits, distinguish these from general evidence, and require a reviewed digestion profile for every automatic recipe ingredient. Test with `tests/regression-291.js`; evidence and boundaries are in `docs/lilh-gas-evidence-v2.91.md`.

v2.92: the date ingredient-change toggle includes swaps (green), additions (blue) and removals (amber). Recipe scope wording is concise; fat sources are nutrition pills, gas-makers remain only in the digestion review, and Before serving groups its reminder with the heading. `tests/regression-292.js`, `tests/layout-292.js` and the enhanced `tests/first-use.py` verify these owner-requested UI changes.

v2.93: remove Gas makers & combinations and its explanatory body from recipe windows. Retain amber ingredient-choice and meal-card warnings, source-batch checks and automatic digestion rules. The updated `tests/regression-291.js` checks the retained warning locations.

v2.94: earlier-batch finishing history is recipe-only; it adds no meal/day warning or planning issue. Real omissions and digestion warnings remain. Follow `AGENTS.md` and `docs/recipe-implementation-checklist.md` for new/changed recipes and ingredients. `tests/catalog-audit.js` is a required catalogue check; `tests/regression-294.js` verifies the notice scope, future-entry gates and same-day classification. Record explicit review in `LH_RECIPE_RULES_REVIEW`; never auto-approve new IDs. Current catalogue: 40 recipes, 45 stock ingredients and one temporary substitute, no audit issues.

v2.96: Lil H fresh fridge food is cook day plus the following calendar day only. Re-plan prioritises actual in-date spare portions, then fresh choices, then expected leftovers with their source facts. Invalid stored dates participate in repair previews; manual picks, already-cooked safeguards and the weekly salmon cap remain. Swap green matches the date badge in all themes. See `docs/leftovers-review-v2.96.md`; test with `tests/regression-296.js` at CLOCK=2026-11-02T09:00:00 and `tests/layout-296.js` in both themes/phone widths.

v2.97: approved Cooked cards share day-view rows/animations. Amber grouped alerts mean usable unassigned portions; Eat today is status text, expired/date-invalid food stays red, and day-view readiness checks remain. The centred bar aligns to text and fades out throughout the action animation. Calendar and active freeze/thaw modes use their respective colours/timing. Preserve original dialogs and Add to meal for unfreezable spares. At CLOCK=2026-11-02T09:00:00 run tests/regression-297.js with FIXTURE=tests/cooked-fixtures-297.js; tests/layout-297.py covers both profiles/themes/phone widths and reduced motion. Fixtures belong only in disposable tests.

v2.98: owner requests the Cooked date/portion metadata one size smaller: use the existing 10px micro token for this line only. Titles and coloured statuses keep their approved sizes. See style-guide pass 44.

v2.106: effective ingredient names and named source facts apply consistently to both profiles. New N & P batches capture original facts; preserve legacy fallbacks and v1 backups. Approved page/calendar transitions and card widths follow style-guide pass 52. Run tests/regression-2106.js (CLOCK=2026-11-02T10:00:00), tests/interaction-2106.py and tests/navigation-2106.py, alongside leftover/Cooked and release checks.

v2.107: approved Stock/checklist changes and bottom-cutoff correction follow style-guide pass 53. Run tests/regression-2107.js at CLOCK=2026-11-02T19:00:00, tests/stock2107/test_ui.py, test_clip.py, test_notices.py and check_motion.py. Keep stable To buy visit order, original fresh expiry before freezing, C18 timing, semantic highlights and exact navigation snapshot/live geometry. Native Android system bars require physical-device verification.
