# NPH: shared meal planner

NPH is a single-file web app (`index.html`) published as a claude.ai artifact:
https://claude.ai/code/artifact/151e0bb8-8974-437f-bb72-b7c8c313493c

It plans meals for P (Peter) and N, and for their baby Lil H, and tracks stock, a shopping list and cooked food in the fridge and freezer. It's shared between P's and N's phones through the artifact's shared database (capabilities `{"db":{},"user":{}}`).

## Safety

- **Never test on the real NPH.** It syncs live to N's phone. Test on a local copy (headless Chromium/Playwright, see `tests/`), never by clicking around the live link.
- Never edit or reset saved data; only change the page code.
- Publish updates to the **same URL** above (so the shared data and N's link keep working), and don't change the capabilities. Read the live version first so nothing published from elsewhere is lost.

## Changing logic

Before implementing or changing any logic, check it against the core rules (section 0 of `docs/nph-rules.md`). Tell P which rules it touches and outline what changes in the rulebook, then update the rulebook along with the code.

## Each release

1. Bump `NPH_V` in `index.html` (search `const NPH_V=`).
2. Test on a local copy: no page errors, the changed behaviour works, nothing else moved.
3. Publish to the URL above.
4. Add one dated line to `docs/nph-changelog.md`; update `docs/nph-style-guide.md` (and its pass log) for anything visual; update `docs/nph-rules.md` for anything about behaviour.

## Docs

- `docs/nph-rules.md`: the rulebook. Section 0 "Core rules" is the source of truth for how meals, portions, storage, splits and swaps must behave; items marked **to build** / **to check** are agreed but not yet in the app. P has reviewed the core rules (C1–C34); C34 is parked. Section 1 has Lil H's digestion and nutrition rules (LH, N, R1).
- `docs/nph-style-guide.md`: the visual standard (tokens, text scale, buttons, dialogs, wording).
- `docs/nph-changelog.md`: one line per change.

## Reminders for P

- When the core rules are built into the app (before the release that finishes them), ask P again about C34 in `docs/nph-rules.md`: build the "If both phones change the same thing" setting, or remove it and keep "last change wins".

## Planned next

A checker that reads the whole plan and stored food and lists anything breaking a core rule, run after thousands of random actions on a test copy; every bug found becomes a saved test that must pass before each publish.

## Current version

v2.83 (1 Nov 2026). See the end of `docs/nph-changelog.md` for what's in each release.

## Working with P

- Plain language; give the reasoning before the steps.
- Keep it simple: no over-engineering.
- Watch token usage: test on local headless copies, keep screenshots small.
- For design changes, show options with screenshots of the real app before building; apply the ones P picks without changes directly.

## Testing

`tests/runjs.py <script.js>` loads `index.html` in a 400px-wide phone viewport and runs the script inside the page, printing its result (see `tests/example-today.js`). Set `CLOCK=2026-11-01T10:00:00` to pretend it's a given time (many rules depend on cook-by and meal times) and `THEME=light` or `dark` to force a theme. Needs `pip install playwright` and `playwright install chromium`.

Useful hooks inside the page: `PLANNERS.pn` / `PLANNERS.lh` (each has `showToday()`, `render()`, `openRecalc()`, `huAct()`, `focusMeal(slot,n)` and `_dbg` with `todayN()`, `valAt()`, `R` and more), `go('np'|'lilh'|'shop')`, and the shared store `S`. Re-plan's buttons only respond when the window was opened by a tap on the page (like a real user), so open it by clicking the page's Re-plan button in tests.
