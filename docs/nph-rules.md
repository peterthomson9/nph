# NPH rulebook

The rules NPH must follow. Bug hunts test the app against this file. Written 29 Oct 2026 (app v2.51) from the app's code, the project instructions, saved notes and the rules agreed in chat. Updated 30 Oct 2026 (app v2.58): every decided rule is now built. Core rules added 30 Oct 2026 (app v2.74) as a draft for P to check.

---

### Approved visual identity — v2.99, 2 November 2026

Use logo family B across installed app artwork and shared page icons. Follow the style guide's neutral surfaces, violet/blue/muted-plum accents and restrained category colours. Preserve semantic green swaps, blue additions, amber removals/warnings and red errors; colour changes must not alter nutrition, storage, planning, portions or saved records. This supersedes earlier logo/palette descriptions only.

## 0. Core rules (draft 30 Oct 2026, app v2.74, for P to check)

### v2.104 approved durable storage and recovery (2 Nov 2026)

- IndexedDB is the authoritative phone-local household store after a completed migration transaction. Load it before running app logic; migrate all eight collections and the pre-upgrade snapshot atomically, preserving the original localStorage text. An inaccessible, invalid or unsupported save must show a visible startup error rather than run an empty planner over it.
- Keep record IDs, nested batch facts, portions and data schema 1 intact (C22/C23). Identity, theme and view preferences remain phone-local. Exported backup format 1/schema 1 stays compatible with the historical v2.100 file. C33 transient phone-local Undo and the future C34 shared-write policy are unchanged. Normal date-based app behaviour resumes after loading.
- Serialize detached saves and report pending/failed transactions honestly. A stale window cannot overwrite a newer revision. Preserve a different save from an older localStorage app window as a recovery alternative and notify the user; do not silently merge or replace the authoritative state.
- Keep at most 12 dated recovery copies. Capture the prior committed dataset before changes after a 30-minute interval and before explicit restores; include migration and compatible prior recovery data. Review a selected copy through the replacement confirmation. Recovery snapshots and replacement state commit in one transaction; failures roll both back. These internal copies do not replace external downloaded backups.
- Temporarily block household edits during confirmed replacement. Flush durable saves before requesting an app update and again before its controller-change reload. A newly opened edit or failed save defers reload. Existing pending non-durable shared writes still block updates; this release does not configure Firebase or enable syncing.

### v2.103 installed logo refresh (2 Nov 2026)

- Restore the page's stable `manifest.webmanifest` link and reference the already approved logo family B with content-versioned icon URLs. Keep manifest ID, start URL, scope and name stable so existing installed-app identity and saved data are preserved. Include matching browser/touch icons and cache the exact versioned assets for offline use.
- Changing installed-app artwork does not alter portions, recipes, household data, backup schemas, storage or syncing. Chrome controls installed-icon refresh and may require user review; do not clear site data or uninstall the app as a logo-update method.

### v2.102 approved app updates (2 Nov 2026)

- App-file updates preserve every household collection, stable record ID, recorded batch fact, portion relationship, internal backup recovery and phone preference. Saved-data/backup format remains schema 1. C22 consistency, C33 device-local Undo and C34 shared-write conflicts are unchanged; normal reload clears transient history only.
- Validate a complete release before offering activation. Download in the background, show the installed version and check result in Settings, and offer Update now only once ready. Check on launch, foreground and reconnect; ordinary foreground checks are throttled. Report offline explicitly and allow an already downloaded release to open offline.
- Before requested activation/reload, finish edits/backup operations and verify a local save. Pending/in-flight non-durable shared writes block reload. Future sync must make its queue durable before relaxing that guard. Another open tab keeps its edit and is offered a reload rather than forced to reload.
- Only NPH release caches are removed. Never clear household storage, IndexedDB, recovery snapshots, fonts or unrelated caches as an update method. A failed/incomplete release leaves the installed version usable.
- One-time bootstrap activation is limited to installations lacking the update protocol. Only an explicit `?nph-update=1` transition window is navigated automatically; other legacy windows keep their current page until reopened. Update-aware releases subsequently wait for user activation. Browser scheduling/network availability still govern when a check can complete.
- App, worker and release-manifest versions derive from `NPH_V` using `tools/prepare-release.py`. Every release uses a new version; partial/mismatched deployments fail installation. Retain actual legacy and modern upgrade regression checks before publishing update changes.

### v2.101 approved backup and restore (2 Nov 2026)

- Backups contain all eight saved household collections with stable record IDs, author metadata and recorded batch facts. Export/restore must not invent portions, rewrite ingredients or reclassify a historical batch. Normal date-based app behaviour resumes after loading restored data. This preserves C22/C23 and the recorded-batch rules.
- The backup envelope (`formatVersion`) and saved-data schema (`dataSchema`) are versioned independently from the app release. A newer app must continue reading supported old schemas; schema changes require explicit pure migrations and historical-file regression fixtures. App-version numbers alone never reject a backup. Preserve old recipe IDs or provide an explicit compatible migration when changing the catalogue. Unsupported/newer formats or invalid files fail before replacing data.
- Restore is an explicit replacement of every household collection together, after validation, summary and confirmation. Persist a verified recovery copy before replacing anything; quota/write failures leave the current dataset intact. Preserve this phone's identity, theme and other local preferences. Reload clears transient Undo/Redo history, consistent with device-local Undo (C33).
- Local restore is blocked while shared storage is connected, writes are pending, or the app is read-only/connecting. Future shared recovery must first open an isolated recovery copy and require a separately confirmed household replacement. Last successful shared write wins (C34) is unchanged; this release does not enable phone syncing.
- Save backup downloads an external JSON file; report that the download started rather than claiming the operating system saved it. A recovery copy inside browser storage is not a substitute for an external file after browser data is deleted.

### v2.97 approved Cooked-card presentation (2 Nov 2026)

- C22: Cooked Fridge/Freezer cards use the approved day-view layout, storage tints and inline action animation. Default text is Made [date] · [portions], followed by expiry. Ingredient-change toggles remain in day views only.
- Cooked amber grouped warnings/counts and outlines flag usable unassigned portions, including the spare quantity in a partly assigned stack. Eat today remains amber expiry text/bar without adding a warning count or outline. Expired food and invalid eat-by assignments stay red and are excluded from usable-unassigned warnings. The Cooked tab's date-issue count excludes mere thawing/readiness problems.
- C17/C18/C20: day-view readiness/expiry warnings and all existing storage eligibility, time estimates, food records and portion accounting remain unchanged. Cooked name badges and header toggles identify active freezing/thawing; blue text/bars use remaining duration divided by total duration. Completed processes lose their badge/toggle, and an active process view returns to expiry when none remain. Cards outside the selected process show muted text and hide the bar.
- Header warning, calendar and process modes are exclusive per profile/storage section. Calendar text/icons use the profile accent without a planning outline. These controls are view state, not saved meal edits or Undo entries.
- The centred bar has equal horizontal insets, measured from the recipe text's start. It stays clear of borders and fades out with text when actions open. It remains hidden through the outgoing button animation, then returns. Refreshing/resizing an open menu cannot flash its bar.
- Freeze / To fridge, Change date and Discard use existing dialogs/confirmations. Unfreezable spare portions retain Add to meal in the first action position, preserving the three-button row and placement capability.

### v2.96 leftover priority and Lil H fridge limit (2 Nov 2026)

- C16/LH6: Lil H's fresh refrigerated batches are usable on the cook day and following calendar day only. This is the owner's stricter household policy; it is not a claim that NHS guidance universally prohibits food two calendar days after cooking. Thawed portions retain their separate 24-hour limit; freezer and adult rules are unchanged. Recipe storage wording, Cooked dates, swap availability and Re-plan use the same date calculation. Existing expired food stays recorded until discarded.
- C7/C26: Re-plan reserves actual spare fridge portions before choosing fresh batches, earliest eat-by first, in their own lunch/dinner track before crossing tracks. Reservations participate in the preview's subsequent checks. Today's expected leftovers are considered after proposed source recipes, with actual source customisations and no food created before cooking. Manual fresh picks stay in Planned meals mode, and valid existing storage assignments stay.
- C17/C26: before today's cook-by/mealtime, an invalid stored assignment can be offered a suitable in-date fridge replacement. Today's already-cooked meal stays. Future cooked assignments with date/quantity/thaw-readiness problems get the existing unticked Replace it option, including when they have no nutrition warning. Expired portions are not automatically discarded.
- LH1/C29: a cooked salmon leftover can take priority over a replaceable automatic future salmon batch; that fresh batch must change so the two-meal weekly maximum remains. Manual future salmon choices and cooked reservations remain protected. Do not waive the cap when stock leaves no suitable fresh replacement.
- C11/C22: preview changes are temporary and restored on close; confirming reserves the existing named batch. It neither duplicates cooked portions nor rewrites historical meals or batch facts. Gas-maker, nutrition, readiness and thaw checks remain active.

### v2.94 historical notices and new-entry review (2 Nov 2026)

- R1/C22/C26: Earlier batch: finishing details were not recorded is a recipe-only historical-data notice. It is absent from card/day warning text, counts and outlines, heads-up, weekly warning suggestions and planning reasons. The recipe window retains it. This does not clear genuine missing-ingredient, omitted-oil, digestion, storage or nutrition warnings and does not modify saved batch records.
- LH14/N1/N2/N7: new or substantially changed child recipes/ingredients must complete `recipe-implementation-checklist.md`. Explicit nutrition groups, preparation/digestion profiles, compatible cooking roles, stock mappings, addition quantities and fat-source classification are checked. New recipe IDs require deliberate review sign-off, a correct portion basis, ingredient amounts, cooking-liquid references, finishing data and serving/timing/storage information. The catalogue audit flags incomplete data and baseline rule violations; incomplete entries fail automatic readiness.
- LH3/LH4/LH12: same-day strong contributors derive from the same nutrition classification used for recipe checks. New classifications therefore participate without updating a second fixed list. Ingredient category/profile disagreement is an audit failure. Temporary substitutions must also have compatible cooking roles.
- The existing R1 manual-choice warnings and soft-rule fallback remain; runtime stock, day/week and portion/storage rules are still evaluated in context. An author review is required for content correctness, actual cooking instructions, product formulation and source guidance; metadata checks alone do not certify food preparation or nutrition.

### v2.93 recipe digestion presentation (2 Nov 2026)

- R1: remove the Gas makers & combinations heading, explanatory body and disclosure from recipe windows, including source/leftover views. Gas-maker feedback remains amber on ingredient Add/Swap options and meal-card warnings. LH3/LH4/LH12/LH13/LH14 checks, source ingredients and automatic planning preferences remain active. Other recipe alerts and nutrition pills are unaffected. This supersedes earlier notes requiring a visible recipe digestion section.

### v2.92 ingredient-change and recipe presentation (2 Nov 2026)

- C22/C23: the date's ingredient-change toggle counts and displays actual swaps, additions and removals, including source-batch leftovers. Swaps stay green, additions use the recipe Add blue, and removals use amber. Addition-only and removal-only edits expose the toggle too. Turning on warnings still switches out of the change view as before.
- R1: ingredient and preparation warnings remain visible in the recipe header. Fat sources move to the green nutrition pills; the separate Energy & ingredients section is removed. Digestion labels are not nutrition tags: gas-maker information and combination warnings stay in their own review, with all planning rules unchanged.
- Scope wording under recipe ingredient controls is only the swap icon plus This only changes this batch, or This changes all batches of this recipe in the recipe library. Read-only views still prevent ingredient changes. You need shows the active item count without tap-to-tick instructions; checkboxes still work.
- Before serving groups its existing moisture, temperature, texture and supervision reminder with the heading, above ingredient checks. No preparation instruction or planning rule is removed.

### v2.91 gas-maker priority and evidence (2 Nov 2026)

- LH3/LH4/LH12/LH13 remain household planning preferences: one higher-priority (historically called strong) ingredient and at most two higher-priority/milder ingredients per meal; avoid higher-priority foods at both main meals. Keep Lil H's yoghurt-combination restriction. These are not validated medical risk ratings, intolerance diagnoses or universal infant food-combining rules. A preferred base does not neutralise fermentation. Full-fat dairy remains the nutritional assumption, without guaranteeing digestive tolerance.
- C22/C23/R1: use actual ingredients after swaps, additions and None for meal checks, contextual other-main-meal previews, recipe warnings, plan warnings and source-batch views. The recipe has a visible Gas makers & combinations section. Manual choices remain allowed and warned; automatic choices retain the hard household restrictions, including fallback.
- LH14: all 45 supported stock ingredients plus the temporary fruit-pouch substitute have reviewed digestion profiles. Missing digestion data warns and excludes new automatic choices. A repeated ingredient counts once as a distinct source; the app does not know the fermentable load actually eaten.
- Broader awareness covers apple, pear, garlic, grains, dairy and variable pouch contents. These notes are separate from the higher/milder counts and do not create new bans or an automatic low-FODMAP diet. Do not remove nutritious foods wholesale or prescribe a dose from adult/IBS guidance. See `lilh-gas-evidence-v2.91.md` for sources and limits.
- Customised recipes use these checks. Custom shopping-list entries remain shopping-only (ST7), not automatically reviewed recipe ingredients. No custom item is silently classified as gas-free.

### v2.90 household dairy confirmation (2 Nov 2026)

- P confirms that milk, yoghurt and all other household dairy are always full fat. This supersedes the v2.89 dairy-uncertainty rule below: count whole milk and full-fat yoghurt automatically wherever present, including additions, substitutions and earlier batch views. Other supported dairy uses the same full-fat household policy.
- N5/N7: remove dairy type confirmation prompts, uncertainty/different-product warnings and the new separate-stock chooser. Existing separate stock mappings, saved records and stock availability remain intact. Choosing None still removes that ingredient's contribution; digestion warnings (including yoghurt with a strong gas-maker) still apply. This confirmation does not establish daily intake adequacy.
- C22: older product flags do not override this household correction. Earlier-batch finishing-oil uncertainty remains separate and visible. No saved ingredient, stock or portion data is reset.

### v2.89 preparation and energy clarifications (2 Nov 2026)

- LH8/LH14: every supported ingredient and all 40 Lil H recipes have reviewed preparation information. The recipe's **Before serving** checks use its effective ingredients, including swaps, additions and None. There is no safety-complete badge, automatic claim that preparation was performed, or mandatory finger-food quota. Missing preparation information excludes a new automatic choice; existing meals and manual choices remain visible with a warning.
- N1/N2/N7: starch and recorded fat sources are qualitative recipe checks. They do not measure consumption or diagnose inadequate intake. Preserve the existing digestion preferences and protein rotation; never add yoghurt or a second fat automatically to satisfy a check. Automatic fallback must also respect hard digestion restrictions.
- C11/C12/C22: breakfast quantities have a one-portion basis; mains have a two-portion basis. Each main records its existing finish as 1 tsp olive oil per two-portion batch; beef also records the existing ½ tsp browning oil separately. Ingredient and method amounts scale together, including fractions and additions. Cooking times, food dimensions and equipment water depths do not scale.
- C7/C22/C23/C26: new cooked batches preserve their recipe, effective ingredients, dairy product choices, method and batch size. Later global edits, stock deletion or restocking do not rewrite that food. Explicit cook-day corrections update its facts; portion corrections update its recorded size. Read-only leftovers show those facts, retain serving checks and label the original method as reference, with reheating guidance. Earlier batches retain their previous recipe and say that finishing/product details were not recorded; never invent oil or a confirmed product for food already cooked.
- Shared stock: recipe amounts specify whole milk and full-fat plain Greek yoghurt, but the actual stock type starts **Unspecified**. Confirm Whole / Full-fat plain / Other in a recipe review. Keep shared P/N stock generic; if the products differ, choose separate Lil H stock. Switching creates no ingredient consumption and deletes neither stock entry.
- N5/N6: use the reported routine—about 500ml HiPP Stage 3, separate drinking water, two fruit snacks—as context only. Snacks, bottles and actual intake are not logged; the app cannot declare dairy, energy or fat requirements met.

### v2.85 clarifications (1 Nov 2026)

- C7/C22: a leftover recipe is a read-only view of its source cook-day recipe, including ingredient swaps, cooking method, portion scale, nutrient categories and gas-makers. Stored portions use their source batch too. Names and card swap details reflect those ingredients.
- C2/C26: expected leftovers from a batch due to be cooked today can be swapped and considered by Re-plan before the cook-by time. They are planned portions, not actual Stock, and can only be used after the source meal. At cook-by time the same batch becomes actual food without duplicating portions. Cancelling its source clears a pending storage link.
- Ingredient substitutions must share a cooking role. Orzo, oats, Weetabix, noodles and frozen wedges are not interchangeable. Existing saved swaps are preserved. See `recipe-audit-v2.85.md` for the full family and recipe review.
- Measured method liquids scale with the selected batch size; cooking times do not scale.

The few truths every feature must respect. **How this is used (P, 31 Oct 2026):** before implementing or changing any logic, check it against these rules, and tell P which rules it touches and what changes in this document, before building. Sections 1–5 below describe how each feature behaves; when a feature and a core rule disagree, the core rule wins. Written from the app as it is now: where the app does something I'm not sure you want, it's marked **Check**.

### Days and time

| # | Rule |
|---|---|
| C1 | A day is a calendar day in UK time. Mealtimes: N & P 8am, 12pm, 6pm; Lil H 8:30am, 11:30am, 4pm. |
| C2 | A meal counts as cooked (and its leftovers go in the fridge) once its day has passed, or today once its cook-by time has gone. N & P: breakfast 10am, lunch 1pm, dinner 7pm. Lil H: 1 hour before each of his mealtimes, so breakfast 7:30am, lunch 10:30am, dinner 3pm (decided 30 Oct 2026, confirmed 31 Oct; built v2.75). |
| C3 | Days that have passed never change by themselves. Batches moving, Re-plan, thaw reminders and tidying never touch them. Only you change a past day, from the meal itself (swap or recipe), and the stored food from that day follows your change. Warnings about a meal being ready or in date (still thawing, still frozen, not enough, past its date) only apply to today's and upcoming meals; once a meal has happened its card just says where the food came from (v2.77). |
| C4 | The plan starts on Mon 26 Oct 2026: nothing is planned before then, but you can add meals to earlier days if you want (decided 30 Oct 2026; built v2.75: earlier days show empty slots you can fill, and a meal added there just counts as eaten). |

### Every meal has one answer

| # | Rule |
|---|---|
| C5 | Every breakfast, lunch and dinner (each person's own on a split day) is exactly one of: **cooked that day**, **leftovers** of a batch, **stored food** (one named meal from the fridge or freezer), a **takeaway**, or **empty**. Never two at once, never none. |
| C6 | Breakfast is made fresh each day. It's never a batch and never leaves leftovers. Stored food can be a breakfast only if you put it there yourself from the swap window; Re-plan, Randomise and reshuffles never plan stored food for a breakfast (decided 31 Oct 2026; already how the app works). |
| C7 | Lunch and dinner are separate tracks: a batch's own leftover days stay in its track. Any meal's leftovers can be put on any later lunch or dinner (including the same day's dinner) while they're in date, and the portions come off that batch. You can always do this yourself from the swap window ("In the fridge"). Re-plan only crosses tracks as a last resort: when spare portions would otherwise go past their eat-by date with nothing planned in their own track, it puts them on a lunch or dinner in the other track (typically a dinner's leftovers on the next day's lunch), and shows this before saving like any other change (decided 30 Oct 2026; built v2.75). Re-plan only puts leftovers where they don't break a digestion or nutrition rule (R1); if there's nowhere suitable before the eat-by date, the portion stays spare for the Cooked tab (decided 31 Oct 2026, built v2.81). |
| C8 | Batch length counts the cook day as day 1: a 2-day batch is the cook day plus 1 leftover day; a 3-day batch is the cook day plus 2. N & P: 2–3 days at 2 portions a day. A recipe makes 6 portions (3 days) unless you change Makes, so on a 2-day slot 2 portions are spare for the freezer. Lil H: 2 days at 1 portion a day (2 portions). A meal never covers more days than it keeps: rice dishes and fish 2 days (cook day + 1), made-fresh meals 1 day (cook day only); any days left over in the slot stay empty for another meal. |
| C9 | A day in the middle of a batch that's swapped, removed, a takeaway, stored food, or both eating your own is skipped: the batch carries on round it and its portions wait. |
| C10 | If a batch isn't cooked on its cook day (takeaway, stored food, or both eating your own), it moves to the next day with all its days, and every later batch in that track moves a day too. Past days never move. One Undo puts it all back. |

### Portions

| # | Rule |
|---|---|
| C11 | Every portion that's cooked is in exactly one place at any moment: eaten, in the fridge, in the freezer, or thrown away. Only cooking makes portions and only discarding removes uneaten ones. No action creates or loses a portion. |
| C12 | A batch makes days × people eating (N & P 6 for 3 days, Lil H 2), unless you change Makes. On a split day the batch only counts the people eating it; each person's own meal is 1 portion unless you choose more. |
| C13 | Once a meal is cooked (after its cook-by time), whatever isn't eaten that day goes in the fridge by itself. |
| C14 | A meal planned from storage takes portions from the fridge first (soonest eat-by first), then the freezer. |
| C15 | Stored food covering fewer people than the meal is allowed but flagged amber ("Only 1 portion…"). |

### Keeping food safe

| # | Rule |
|---|---|
| C16 | Fridge: N & P within 2 days of cooking (rice dishes 1 day; takeaway leftovers by the next day). Lil H: cook day and following calendar day only, under the household's stricter policy. Thawed food: within 24 hours of leaving the freezer. Freezer: 3 months for N & P, 1 month for Lil H. Thawed food is never refrozen; some meals never go in the freezer. |
| C17 | A meal can only use stored food that was made on or before that day, is still in date that day, and (from the freezer) is thawed by its mealtime. Anything else is flagged on the card (amber for "won't be ready", red for "past its date"), never shown as fine. If a meal that has already happened had one of those problems, the app still counts it as eaten (C2) but, for the last 3 days, its card asks "Check: it was still thawing. Did you have this?" in plain grey, and the heads-up says "Fri dinner: check what you had". The meal's ⋯ then has **Had it** (clears the check) next to Swap (pick what you actually had; the portions go back to storage) (decided 31 Oct 2026, option B; built v2.77). |
| C18 | Freezing and thawing take time: freezing about 3 hours + 1.5 per portion; thawing about 6 hours + 3 per portion (Lil H 4 + 3), at most a day. Food taken out before it froze is simply fresh food with its original eat-by date. |
| C19 | From 8pm the night before (or on the day), frozen food planned for a meal is assumed taken out to thaw. "It's still frozen" puts it back exactly as it was. |
| C20 | Food past its date stays on the Cooked tab, in red, until you discard it. It's never used for a meal. |
| C21 | Freezing is only done from the Cooked tab. |

### One truth, shown everywhere

| # | Rule |
|---|---|
| C22 | The meal cards, the Cooked tab, the heads-up strip, the swap window's "In the fridge / freezer" and Re-plan all show the same numbers for the same food. A meal card shows its portions as they were on its own day: freezing or throwing away portions later only changes the cards from that day on, never earlier ones (decided 31 Oct 2026, built v2.78). Wording (v2.82): a cook day says how many it makes ("Cook today · 6 portions"); a leftover day says how many are in the fridge at that meal ("Leftovers · 4 portions"), or "Last portion" / "Last portions" when that meal finishes the batch (1 or 2 portions eaten). No "X left". |

### Changing the plan

| # | Rule |
|---|---|
| C23 | Swapping a batch's cook day changes the whole batch. Swapping a later day changes just that day (C9). Picking something new for a day releases any stored food that day was using. |
| C24 | Removing a meal removes that day and its remaining leftover days, never earlier ones. Leftovers already cooked stay in the fridge. Removing a past meal also removes what it put in storage, because it wasn't cooked. |
| C25 | Stored food that's all planned can still be picked: after asking, it comes off the latest meal it was planned for, which goes back to the plan (or is left empty if it was the batch's own leftovers). |
| C26 | Re-plan only changes upcoming meals, follows the same rules as the swap windows, keeps meals you chose unless you pick Everything, and shows every change before saving. **Upcoming** means the meal's mealtime (C1) hasn't passed: today, only meals still to come that aren't cooked yet (C2); from tomorrow, every meal, including leftover days of a batch that started earlier. **Already cooked leftovers** (from tomorrow on) are only offered when they have a warning, with a "Replace it" tick box that starts unticked; ticked ones are replaced and their portions stay in the fridge as spare (freeze or add to a meal from the Cooked tab). A meal of today's that's already cooked is about to be eaten, so it stays. Meals Re-plan put in itself don't count as "meals you chose" next time. Meals planned from the fridge or freezer count as cooked food too (same tick box). The list has **Planned meals** (your picks stay) and **Everything** (your picks with a problem change too). Every meal is judged as it will be made, with its ingredient swaps, so Re-plan and the card always agree on a warning. (Decided 31 Oct 2026, option C; built v2.80, v2.81.) |
| C27 | Each thing you do is one Undo step on that page, and Undo puts back everything it changed, stored food included. Automatic things (food going in the fridge after cooking, thaw reminders, tidying) are never an Undo step of their own. |

### Split meals

| # | Rule |
|---|---|
| C28 | Splitting keeps the plan for whoever's phone it is and gives the other person one of their own dishes (N's dishes for N, P's dishes for P). Each half is independent: its own swap, stored food and portions. Both eating your own moves the batch (C10). Joining again brings back the plan (decided 31 Oct 2026; built v2.75). |

### Choosing meals

| # | Rule |
|---|---|
| C29 | Swap windows, Randomise and Re-plan never offer a meal that breaks a hard rule: P's dislikes in the shared plan, N's creamy or cheesy dishes outside a split, Lil H's salt, stock or honey, two harsh foods (lentils, broccoli, cauliflower) in one meal, or a third salmon meal in a week. |
| C30 | Soft rules warn but allow: a repeat within 10 days (N & P) or a week (Lil H), harsh foods on the same day, a meal that keeps fewer days than the slot. Randomise and Re-plan avoid them; you can still pick them. |

### Stock

| # | Rule |
|---|---|
| C31 | One shared stock. Running out of something shows it missing on every meal that needs it and puts it on To buy; getting it clears both. Herbs, spices and stock cubes never make a meal "missing" unless the dish is built on them. Past days never show "Missing". |

### Both phones

| # | Rule |
|---|---|
| C32 | **To build for the GitHub Pages app:** Both phones show the same plan, stock and stored food. A saved change on one phone reaches the other within seconds while online. Until sync is built, each phone saves its own data. P's phone is the main copy for the first shared upload (decided 1 Nov 2026). |
| C33 | Undo history belongs to each phone and is lost when the app closes, so one phone can't undo the other's change. |
| C34 | **Decided 1 Nov 2026, to build with C32:** If both phones change the same saved item, the last successful write to the shared database wins. Remove the unused "Newest / P's / N's" conflict choice from Settings when sync is built. |

### Questions for P

1. ~~C34: who wins when both phones change the same item?~~ Last successful shared write wins; remove the unused selector when sync is built (decided 1 Nov 2026).
2. ~~Anything missing?~~ Nothing yet (31 Oct 2026). Add a rule whenever a gap turns up.

---

## 1. Lil H's food

### General

| # | Rule | How the app does it |
|---|---|---|
| LH1 | Salmon at most once a week, plus its leftover day (2 salmon meals Mon–Sun at most). | Swap windows hide salmon once there are 2 salmon meals that week ("Salmon already this week"). |
| LH2 | Meats used evenly: beef and chicken equally often. Fish isn't counted here (salmon follows LH1). Changed 31 Oct 2026 (was "beef no more often than any other protein"). | The rotation from 31 Oct 2026 has 6 beef and 6 chicken batches in every 4 weeks (plus 6 egg, 6 lentil/chickpea and 4 salmon; 7 egg and 5 lentil/chickpea once the LH3 recipe fix is built). Re-plan → Everything picks the least-used protein first while keeping every safety rule. |
| LH5 | Veg used evenly: no vegetable much more often than the others. Changed 31 Oct 2026 (was "courgette included regularly"). | **To check:** courgette is in 11 of every 28 batches from when it was a rule, which is likely more than most other veg. Even it out when the rotation is next changed. |
| LH6 | Lunch and dinner are 2-day batches: cook day + 1 leftover day. | Each batch is 2 days (2 portions: today + tomorrow). |
| LH7 | Breakfast is never leftovers: made fresh every day. | Breakfasts are never batches. |
| LH8 | Appropriate preparation and texture for his current skills: soft/moist food, mashed berries/pulses/peas, fish bone/skin checks, tender short chicken pieces, chopped fibres, cooked egg and dispersed smooth nut butter. An adult supervises upright eating. | v2.89: ingredient-derived Before serving checks for all 40 recipes, including swaps/additions/None and source batches. Optional soft-vegetable serving variants on b3/b8; no fixed texture quota or safety guarantee. |
| LH9 | No added salt, stock cubes or honey. Herbs and spices optional, a tiny pinch, one new one at a time. | Under-2s notes; herbs are optional additions. |
| LH10 | No meal repeated within 1 week (confirmed 29 Oct 2026). | Swap windows mark meals "Already this week". |
| LH11 | Mealtimes: breakfast ~8:30, lunch ~11:30, dinner ~16:00. Usual routine: about 500ml HiPP Stage 3 plus drinking water and two fruit snacks (not tracked). | The Cooked tab's date window uses 8:30am / 11:30am / 4pm for Lil H's food and 8am / 12pm / 6pm for N & P's. |

### Digestion and nutrition (combined 31 Oct 2026)

Two sets of rules checked the same way: every Lil H ingredient is sorted into groups (below), and meals and weeks are checked against those groups. The digestion rules preserve this household's preference to avoid combinations that have been troublesome for Lil H (yoghurt with cauliflower upset him); they are not universal claims about babies' digestion. The nutrition rules follow NHS guidance for children over 12 months: variety, starchy food and fruit or veg with meals, suitable protein foods, and full-fat dairy under two. Household portion preferences are not measurements of intake; no daily adequacy claim is made. Items marked **to build** aren't in the app yet.

**Ingredient groups**

| Ingredient | Digestion | Nutrition |
|---|---|---|
| Beef mince | | protein, iron-rich |
| Chicken thigh | | protein |
| Salmon | | protein, oily fish |
| Eggs | | protein, iron-rich |
| Lentils | strong gas-maker | protein, iron-rich |
| Chickpeas | strong gas-maker | protein, iron-rich |
| Peanut butter | | protein |
| Broccoli | strong gas-maker | veg, vitamin C |
| Cauliflower | strong gas-maker | veg, vitamin C |
| Peas | milder gas-maker | veg, vitamin C |
| Leek | milder gas-maker | veg |
| Potato | easy base | starchy, veg, vitamin C |
| Sweet potato | easy base | starchy, veg, vitamin C |
| Carrot | easy base | veg |
| Butternut squash | easy base | veg |
| Courgette | easy base | veg |
| Orzo | easy base | starchy |
| Oats | easy base | starchy |
| Weetabix | | starchy, iron-rich |
| Banana | easy base | fruit |
| Parsnip | | veg |
| Spinach | | veg, iron-rich, vitamin C |
| Passata | | veg, vitamin C |
| Raspberries, blueberries, blackberries, kiwi | | fruit, vitamin C |
| Apple, pear | | fruit |
| Milk, yoghurt | | dairy |
| Olive oil, herbs and spices | | |

**Digestion rules**

| # | Rule | How the app does it |
|---|---|---|
| LH3 | **Hard rule for automatic household planning:** at most one strong gas-maker in a meal. Strong gas-makers: lentils, chickpeas, broccoli, cauliflower (chickpeas added 31 Oct 2026). | Recipes are written that way. Swaps and Add warn rather than block (see R1). Built v2.75: chickpeas joined the list; Cauliflower, courgette & chickpea mash (s18) becomes Cauliflower, courgette & egg mash (an egg meal: the rotation then has 7 egg and 5 lentil/chickpea batches every 4 weeks, decided 31 Oct 2026, option A); Creamy cauliflower & chickpea (s13) becomes Chickpea, courgette & potato mash (see LH12). |
| LH4 | Strong gas-makers (LH3) avoided on the same day (lunch and dinner). | Swap windows flag "Same day as …". It's "avoid", so a warning, not a hard block. If it happens anyway (e.g. after a meal moves a day), both meal cards show an amber outline and "Same day as …" (Q3, 30 Oct 2026). Chickpeas count too (v2.75). From v2.82 (built v2.83) the warning words live behind the day's amber warning button: see R1. |
| LH12 | **Hard household rule (added 31 Oct 2026):** limit combined higher-priority/milder gas contributors. At most 2 gas-makers in a meal, counting the strong ones (LH3) and the milder ones (peas, leek). Yoghurt never goes in the same meal as a strong gas-maker (yoghurt with cauliflower upset him). | Built v2.75: Creamy cauliflower & chickpea (s13: cauliflower, chickpeas, peas, leek and yoghurt) became Chickpea, courgette & potato mash; yoghurt comes out of Salmon & broccoli orzo (s5) and Parsnip, carrot & chickpea mash (s10), replaced by a splash of milk. Warnings for swaps and Add: see R1. |
| LH13 | **Soft household rule (added 31 Oct 2026):** a meal with a gas-maker also has a familiar preferred base (historically called easy-to-digest): potato, sweet potato, carrot, butternut squash, courgette, orzo, oats or banana. | Built v2.75: Beef & cauliflower tomato stew (m6) had none, so potato was added. Every other meal with a gas-maker already has one. |

**Nutrition rules**

| # | Rule | Where the app stands |
|---|---|---|
| N1 | **Soft rule:** every lunch and dinner has a starchy food, a protein and at least one veg. | Breaks it now: Beef & cauliflower tomato stew (m6, fixed by the LH13 potato), Creamy cauliflower & chickpea (s13, fixed by its LH12 rewrite), Parsnip, carrot & chickpea mash (s10: potato added). All fixed in v2.75. |
| N2 | **Soft rule:** every breakfast has a starchy food and a fruit or veg. | Built v2.75: Squash & egg scramble (b8) has a little potato steamed with the squash; Banana yoghurt pot (b9) has ½ Weetabix crumbled in. |
| N3 | **Soft rule:** iron-rich food every day. A lentil or chickpea meal (iron from plants) has a vitamin C food in the same meal, which helps him absorb the iron. | Built v2.75. Two days in the 4-week rotation had no iron-rich food (week 1 Thursday, week 2 Friday); their breakfasts changed to Weetabix ones. The potato in Parsnip, carrot & chickpea mash gives it vitamin C. |
| N4 | Oily fish 1–2 meals a week (salmon). Together with LH1 (at most 2), every Mon–Sun week has at least one salmon meal. | The rotation has 4 salmon batches in 4 weeks (one a week). Swapping salmon away can leave a week with none: the swap window and the heads-up warn (v2.75). |
| N5 | Keep the reported milk/snack routine as context; do not infer daily dairy or nutrient adequacy from bottle count. | v2.89: static routine note; no milk/snack log or automatic dairy-sufficiency shortcut. v2.90: household dairy is confirmed full fat, so no product-type prompt is required. |
| N7 | Record intended finishing ingredients, quantities and known fat sources; flag omissions and uncertain products without diagnosing an energy/fat deficit. | v2.89: oil required in all 29 mains; separate beef browning amount; whole milk/full-fat plain yoghurt specified in recipe amounts, v2.90 confirms all household dairy is full fat automatically. Meat, egg, salmon and peanut butter count as sources too. Effective-ingredient review feeds recipe, cards/day warnings, heads-up, weekly view, picker, Randomise and Re-plan. |
| N6 | Weekly check: each Mon–Sun week on the Lil H page is checked against N1–N4. A week that misses a goal (no salmon, a day with no iron-rich food, a lunch or dinner missing a group) gets an amber heads-up saying which goal and which day. | Built v2.75: checks the rest of the current week, from today. **Weekly summary (v2.82):** Lil H's Info & safety has "This week's nutrition": Monday to now as eaten, the rest as planned, with ingredient swaps, updating as meals change. From v2.89 it also shows preparation-information coverage and ingredient/product details to review, with an explicit limit on whole-day intake assessment. It shows N1, N3 and N4 with a day-by-day iron row, gas-maker clashes and hard digestion breaks (LH3, LH4, LH12), the protein mix and veg/fruit variety, and up to 6 "more / less" suggestions for the meals still to come, each naming the food and the nutrient, and tapping through to the meal. |

**How both sets are used**

| # | Rule | Where the app stands |
|---|---|---|
| R1 | **Where warnings show (v2.83, decided 1 Nov 2026):** a day with any warning (a clash, a nutrition or digestion warning, a missing ingredient, food not ready or past its date) gets an amber button with the count next to its date. Cards show their normal details; pressing the button swaps every card's details for its warnings ("No warnings" on a card with none), and pressing again swaps back. Amber and red outlines stay on the cards that have one. **Planning follows the rules; you're warned, never blocked (decided 31 Oct 2026).** Re-plan and Randomise follow every digestion and nutrition rule: hard rules always, soft rules too, picking only meals that meet them. If they can't (for example, ingredients have run out and nothing left meets them), they still fill the meal but show a warning on it. Your own changes are always allowed but warned: swapping a meal, swapping an ingredient, adding or leaving out an ingredient. Warnings say what's wrong and where: "Second gas-maker: lentils", "Yoghurt with cauliflower", "No starchy food in this meal", "No vitamin C with the chickpeas", "No iron-rich food on Tue", "No salmon this week". They show on the option in the swap window or ingredient list before you pick it, and on the meal card afterwards (amber outline). Replaces the warning part of LH12 and N8. | Built v2.75. Automatic ingredient swaps (when something's run out) never create a gas-maker clash. |
| LH14 | **New recipes and ingredients (added 31 Oct 2026):** every new Lil H recipe or ingredient is checked against the digestion and nutrition rules before it goes into the app. Reviewed preparation, digestion, nutrition and cooking-role data are required for automatic choices, with explicit recipe sign-off and a release audit (v2.94). A new ingredient is first added to the ingredient groups table above. Replaces the earlier N7. Preparation profile, serving method and quantity basis must be reviewed too. | Required authoring process plus runtime catalogue readiness and `tests/catalog-audit.js` (v2.94); see `recipe-implementation-checklist.md`. Items you add yourself on the Stock page are shopping-only and never go into recipes (ST7), so they don't need sorting. |

Formula, snacks, supplements and individual growth/feeding assessments are outside this feature. The implementation does not change his reported feeding routine. Guidance and scope are documented in `lilh-preparation-energy-proposal.md`.

## 2. P & N's food

| # | Rule | How the app does it |
|---|---|---|
| PN1 | **Soft rule:** no lunch or dinner repeated within 10 days (changed 31 Oct 2026, was 2 weeks). Beyond that, meals are spread evenly: Re-plan and Randomise prefer the meals you've had least recently, so no favourite comes round much more often than the rest. Favourites (hearts) still make a meal a little more likely. | Cook days within 10 days either side are marked "Had in the last 10 days" and Randomise avoids them. Built v2.75: 10 days; Re-plan and Randomise favour the meals not cooked for longest (looking 6 weeks either side). |
| PN2 | Lunch and dinner batches last 2–3 days. | A main recipe makes 3 days (6 portions); a 2-day slot leaves 2 spare portions to freeze. |
| PN3 | Creamy or cheesy dishes only as N's split meals, never in the shared plan. Mozzarella and similar are fine for P. | N's dishes ("n" recipes) are only offered on split days. |
| PN4 | Tomato-heavy chicken dishes are P-only. | P's dishes ("p" recipes) are only offered on split days. |
| PN5 | Every breakfast comes with oat milk lattes. | Added to every breakfast's ingredients. |
| PN6 | Breakfast-style meals can be a light lunch (made fresh, 1 day). | Some breakfasts are allowed as lunches. |
| PN7 | P: no tinned beans, mushrooms, falafel, hummus or chickpeas, and nothing very spicy, in the shared plan: a hard rule the audit counts (decided 29 Oct 2026). | Recipe choices; N's own split dishes can still have them. |
| PN8 | N: not a big fan of curries; likes beans and lentils but no more than other dishes; prefers dried to tinned. A preference, not a hard rule: curries are allowed but kept rare. | Recipe choices. |

## 3. Shared stock

| # | Rule |
|---|---|
| ST1 | One stock across all pages: running out of an ingredient on any page shows it missing everywhere it's used. |
| ST2 | Lil H's milk & pouches (and baby care) are his own categories, separate from the shared food. |
| ST3 | Running out puts the item on To buy; ticking it on To buy puts it back in stock and clears "Missing" on every meal. |
| ST4 | Meals that need something you've run out of turn orange ("Missing: …") until it's back or the meal is swapped. Past days never show "Missing". |
| ST5 | Deleting an item takes it off the list and the kitchen; recipes leave it out; meals built around it ask to be swapped. Delete can be undone, and deleted items can be brought back from a "Deleted items" list at the bottom of All items, shown only in edit mode (pen on). |
| ST6 | Renaming an item shows the new name everywhere: list, kitchen, recipes, swap windows. |
| ST7 | Custom items (added by you) can be renamed and deleted; they never affect recipes. Adding an item whose name already exists (or the name it had before a rename) puts the existing item on To buy instead of making a duplicate. Renaming an item to a name another item already has is refused: "There's already an item called …" (Q2, 30 Oct 2026). |

## 4. How features should behave

| Area | Expected behaviour |
|---|---|
| Shopping list | To buy shows exactly the items that are out or marked to buy; the Stock tab badge shows the To buy count. The basket counter (− n +) records how many to buy. |
| Swaps | Swapping a batch changes all its days. Swapping (or removing) a single day changes just that day: a swapped or removed middle day of a batch is skipped and the batch carries on round it (e.g. stew Sat, swap Sun, stew leftovers Mon). Ingredient swaps can be made from the ⋯ preview in the swap window; they go on the meal once it's chosen. "All planned" stored food can still be picked: after a confirmation it's taken off the latest meal it was planned for, which goes back to the plan (or is left empty if it was the batch's own leftovers). Swap windows respect the rules above and say why a meal isn't offered. Past days can only be changed from the swap button. |
| Re-plan | Picks follow the same rules as the swap windows: no repeats within 10 days (P & N) or a week (Lil H), and an even spread of meals, salmon once a week, no same-day harsh foods, and meals that last the whole batch. Only changes upcoming meals (C26: today's still-to-come meals that aren't cooked yet, and everything from tomorrow); fills empty lunches and dinners; uses fridge leftovers first; already-cooked leftovers with a warning are offered with a "Replace it" tick box, unticked; "Planned meals" keeps your picks (not Re-plan's own earlier picks), "Everything" reshuffles them too; shows the changes before saving. |
| Freezing | Spare portions can go in the freezer on the day they're cooked. The snowflake starts at everything not eaten today and warns which planned meals come off (kept as is, 29 Oct 2026). Freezer portions keep 3 months (P & N) or 1 month (Lil H). |
| Thawing | Thaw in the fridge the night before; once thawed, eat within 24 hours; never refreeze. Thawing time is tracked roughly from when it comes out of the freezer: about 6 hours plus 3 for each portion (Lil H's pots 4 + 3), at most a day. Until then the Cooked tab shows "Thawing · ready about …", and a meal it's planned for that's due before then gets an amber outline and "Still thawing" (plus a heads-up). A planned frozen meal gets a thaw reminder; when it shows, the app assumes you took it out and moves it to the fridge, with an "It's still frozen" button to undo. |
| Leftovers and use-by | Cooked food keeps 2 days in the fridge (rice 1 day). Day 3 of a P & N batch is the last day. Anything past its date shows as "Past its eat-by date" and stays in the Cooked tab until you discard it (kept as is, 29 Oct 2026). Leftovers, a takeaway, stored food or both eating your own on a batch's cook day move the batch to the next day with all its days, and every later batch in that meal (lunch or dinner) shifts a day too, so every batch stays whole (decided 29 Oct 2026, option B). The move carries on through the plan (there are no empty days in the rotation to stop it), picks and day swaps move with their batch, takeaways and stored food stay on their dates, past days never move, and one Undo reverts it. A takeaway on a leftover day doesn't move anything: the batch just has one day fewer. |
| Stored food on a meal | If the stored food has fewer portions than the people eating that meal (e.g. 1 portion on a lunch for two), the card shows an amber outline and "Only 1 portion: one of you needs something else" (Q1, 30 Oct 2026). |
| Takeaways | Nothing to buy; whatever was planned carries on as leftovers; takeaway leftovers can be saved. |
| Removing and adding meals | Removing a meal leaves an empty slot with +; adding fills it. Removing a batch's cook day removes its leftover days too (confirmed 29 Oct 2026). |
| Split meals (P & N) | Tapping split then a meal gives whoever's phone it is one of their own dishes; the other keeps the plan; either can swap their half. N can have one of her dishes and P his own. Each person's own meal is 1 portion unless you choose more; extra portions go in the fridge like any batch. If both people have their own meal, the batch moves. |
| Rename / delete / custom items | See section 3. |
| Undo / redo | Each page has its own history (N & P, Lil H, Stock, Cooked N & P, Cooked Lil H). Undo puts back exactly what the last action changed, including stored food, notes and hearts. History lasts until the app is closed. |
| Notes and favourites | Notes are tagged with the phone's owner (P or N), up to 200 characters. Each person can only change their own heart and delete their own notes. |
| Calendar and Today | Tapping Today glides to today; pressing and holding it opens the calendar (v2.76). The calendar opens as a window over the page (the page keeps its place) and shows the 4-week cycle weeks and past meals. |
| Recipe window | From a meal card: today and upcoming meals can be edited (portions, cooking method, ingredient swaps). Past days open view only when you tap the meal; edit them from the meal's ⋯ → Recipe (v2.69, which replaced the day's pen) or from the swap window's ⋯, and the stored food from that meal follows. Food already cooked (leftover days, meals from the fridge or freezer) is always view only: change it on the day it was cooked. Lil H's fruit can be swapped for a fruit pouch for one meal (never in the recipe itself). |
| Cooked tab | Spare portions nothing is planned for: freezable ones show a blue note and Move to freezer; ones that can't be frozen (thawed food, takeaways, meals that don't freeze) are amber with Add to meal, which opens the meal page to pick a lunch or dinner up to the eat-by date (confirming what changes if the slot isn't empty). Planned uses are green. Discard is always on the right. |
| Settings | Whose phone (P/N), appearance, layout; the current sync conflict choice is unused and will be removed with C32. Settings don't change the plan. |

## 5. Over time

| # | Expected |
|---|---|
| T1 | At midnight, yesterday becomes a past day: locked except via swap; leftovers move on by a day. |
| T2 | The 4-week rotation wraps round: week 4 is followed by week 1 with no gap or doubled day. |
| T3 | Month and year ends don't break dates, week labels or the calendar. |
| T4 | The clocks changing (BST ends last Sunday of October, starts last Sunday of March) don't shift a day or mealtime. |
| T5 | Stored food dates move on correctly: fridge food expires after 2 days, frozen food after its freezer time, thawed food after 24 hours. |

---

## Open questions

Situations the rulebook doesn't cover yet. Nothing here is changed in the app until you answer.

| # | Found | Situation | What the app does now | Options | Recommendation | Status |
|---|---|---|---|---|---|---|
| Q1 | 30 Oct 2026 | Stored food with fewer portions than the meal needs, e.g. 1 portion of takeaway leftovers put on a shared lunch for two. | Lets you place it, shows "From the fridge" with no warning, and counts 1 portion as enough for both of you. | A) Allow it but show an amber "Only 1 portion: one of you needs something else". B) Turn the meal into a split automatically: whoever's phone it is gets the leftovers, the other keeps the planned meal. C) Don't offer stored food that can't cover the whole meal. | A: simplest, keeps you free to decide, and stops the plan looking covered when it isn't. | done (answered 30 Oct 2026: recommendation applied, v2.65) |
| Q2 | 30 Oct 2026 | Renaming an item to a name another item already has (e.g. renaming a custom item to "Carrots"). | Allows it, so the list shows two "Carrots". (Adding a new item with an existing name already uses the existing one.) | A) Refuse with "There's already an item called Carrots". B) Allow it as now. | A, to match how adding works. | done (answered 30 Oct 2026: recommendation applied, v2.65) |
| Q3 | 30 Oct 2026 | Lil H: a batch moved a day by stored food on its cook day can land a harsh food (lentils, broccoli, cauliflower) on the same day as another one (rule LH4 is "avoid", a warning). | Allows it. Swap windows warn "Same day as …", but the plan itself doesn't show it. Seen once in the audit (cauliflower lunch next to broccoli dinner after a moved lunch). | A) Leave as is. B) Show an amber "Same day as broccoli" on the meal card when it happens. C) Move both of Lil H's tracks together (changes the option B decision). | B: it flags the rare case without changing how moving works. | done (answered 30 Oct 2026: recommendation applied, v2.65) |

### First-use phone choice (v2.88, 1 Nov 2026)

A fresh browser with no valid P/N identity opens a dedicated Whose phone is this? prompt. Neither person is selected initially. Tapping P or N selects it provisionally; Confirm saves it on this phone. Later visits use the saved choice, and Settings still lets either person change it. This supplies the phone identity used by C28 and change/note labels; it does not change meal rules.

### Presentation convention — v2.100, 2 November 2026

Apply the owner-approved compact typography and sentence-case roles from the style guide. Preserve full essential instructions and recipe names, readable wrapping, text-input minimum size, and all meal/storage/nutrition behaviour. Keep meal names 12px and Cooked date/portion metadata 10px.
