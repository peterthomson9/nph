# Slot choices and pull refresh — 5 November 2026

The old renderer labels rows by position but builds selection windows using the moved card's original B/L/D key. This reproduces a breakfast-labelled row offering a main-meal picker. A lunch/dinner-only swap does not change breakfast; repeated permutations involving breakfast reproduce the reported result on both profiles.

The fix separates selection context from saved source context. The visible position chooses recipe groups and title; the original source continues to identify the displayed card for a replacement, ingredients, named batch reservations and recorded recipe facts. Split-person breakfast uses the destination breakfast groups too. Fresh breakfast recipes have max 1 day; selecting them through a moved main carrier cannot create a run of breakfast leftovers. Replacing a fresh-day carrier with a main dish renders one day's quantities. Existing permutations are interpreted on load without a data migration; invalid permutation strings fall back to BLD.

The approved refresh preview is now in the canonical app: frame-paced resistant indicator, profile accent, minimum 450ms busy feedback, 220ms return, reduced-motion alternative and stationary content. A completed pull awaits the authoritative local save, then checks updates and retries an already-bound household connection, followed by an in-place render. It does not reload or activate an app update. Existing save, membership, offline outbox and update activation boundaries remain.

## Verification

- Slot regression: all six permutations on both profiles, correct Add headings/groups, a real replacement stays on the tapped card, repeated moves, unchanged named lot/reservation/ingredient records, and split-person breakfast.
- Refresh regression: Chromium touch input on three pages, light/dark, 320/400px. Short pulls and touch cancellation do not refresh; a completed pull refreshes once. Data and a live-window marker remain identical, the page stays at its position, and the indicator settles. Open dialogs, below-top scrolling, failed local saves, offline feedback and reduced motion are covered.
- Existing recipe/source/backup/storage/update/offline/Firebase checks remain in the mandatory gate, now 26 checks. The additional seeded campaign runs 400 actions across seeds 3 and 17, including moves, recipe picks, portions, storage, Undo and Re-plan.

Screenshots and machine-readable results are local test artifacts under tests/screenshots/refresh-2116. Chrome/Android's installed-app gesture behaviour still needs the ordinary physical-phone check after updating. Browser automation uses disposable profiles only.
