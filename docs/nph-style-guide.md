# NPH style guide

The one standard every page, panel and dialog in NPH follows. It was first written on 29 Oct 2026 (app v2.37) by reading the app's CSS and markup and measuring every button, card and dialog in light and dark mode on a 400px-wide phone screen. Where the app did something more than one way, the way it does it most often became the standard. The rest are listed as deviations in the pass log at the end.

How to use it: when anything is added or changed, it uses these values. Each consistency pass checks one area against this guide, records what it found in the pass log, and the area counts as checked until it next changes.

All sizes are CSS pixels at a 400px-wide phone viewport. Colours are design tokens: always use the token, never a hard-coded colour, so dark mode follows automatically.

---

## 1. Colours

### 1.1 Base surfaces

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | #F7F7FA (was lilac #DEDCEC until v2.67) | #0F0F16 | Page background behind cards |
| `--surface` | #FFFFFF | #1F1F2A | Cards, dialogs, buttons |
| `--chip` | #F5F5FA | #272734 | Meal tiles, facts, segmented controls, inner tiles |
| `--ink` | #22222E | #E9E9F1 | Main text, icon-button icons |
| `--muted` | #5F5F74 | #A5A5BB | Secondary text, row-action icons, close × |
| `--line` | #D3D1E3 | #33334A | Every border and divider |
| `--on-acc` | #FFFFFF | #15151D | Text on a filled accent button |
| `--shadow` | 0 10px 30px rgba(24,20,48,.18) | 0 10px 30px rgba(0,0,0,.5) | Dialogs and floating panels only |

### 1.2 Page accents

Each page has one accent, set as `--acc` on the page and on any dialog it opens. Accents mark the current tab, the text of "Today"-style buttons, selected options, focus rings, and the today highlight.

| Page | Token | Light | Dark |
|---|---|---|---|
| N & P | `--np` | #5638CF | #B3A0FF |
| Lil H | `--lilh` | #1C78C0 | #78C3F0 |
| Stock | `--shop` | #A1379A | #EC98DF |

Dialogs opened from food that belongs to someone use that person's page accent (a Lil H discard is blue even on the Stock page).

### 1.3 Status colours: one meaning each

| Token | Light | Dark | Meaning: use it for this and nothing else |
|---|---|---|---|
| `--ok` | #2E8A5E | #6CC79B | In stock, ready, all good, fresh (first half of the eat-by time) |
| `--mid` | #B98A00 | #F2C94C | Halfway: leftover bar from 50% of its time |
| `--warn` / `--warn-bg` | #A6520B / #FBEEDB | #F0A54A / #3A2C17 | Needs attention: missing ingredient, eat today, last day, rule warning |
| `--bad` / `--bad-bg` | #C0392B / #FBE4E1 | #F08A80 / #3A1C1A | Past its date, can't be done, destructive buttons (Delete, Discard, Remove) |
| `--rep` / `--rep-bg` | #2B6CA8 / #E2EEFA | #86BEF2 / #172738 | A replacement suggestion: "swap to add this" |
| `--keep` / `--keep-bg` | #0E7C76 / #DDF3F1 | #5FD3C8 / #11302D | "Keeps" notes: a meal that keeps fewer days |
| `--swap` | #4F7A0E | #A8D46B | Swapping: the Swap button, swap icons, and ingredient swaps in recipes (highlighted words, "Changed everywhere" chip, swap tips). A swap that's needed because something is missing stays `--warn` (v2.70) |

### 1.4 Storage colours

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--k-fridge` | #2F86A8 | #6CC6E4 | Fridge: Cooked-tab Fridge section, "From the fridge", thaw button |
| `--k-freezer` | #1D4ED8 | #4C8DFF | Freezer: Freezer section, "Move to freezer", "From the freezer", freeze-or-plan notes, thaw reminders |

### 1.5 Shopping category colours

Used as the 4px left edge of a category card (`--kc`) and its header icon.

| Category | Icon | Token | Light | Dark |
|---|---|---|---|---|
| Fruit & veg | leaf | `--k-veg` | #3F8A43 | #7CC57E |
| Meat & fish | drum | `--k-meat` | #B0413E | #E8807A |
| Dairy, eggs & chilled | egg | `--k-chill` | #B8901A | #E6C559 |
| Bread & bakery | toast | `--k-bread` | #A0672F | #D9A26B |
| Pasta, rice & grains | pasta | `--k-grain` | #C17F1E | #EDB45C |
| Cupboard | jar | `--k-cup` | #C25A2C | #EE936A |
| Seasoning & herbs | herb | `--k-herbs` | #5F8A2A | #A9CF72 |
| Frozen | snow | `--k-frozen` | #2F86C2 | #7DC0EE |
| Baking | muffin | `--k-bake` | #B5527F | #E893BA |
| Snacks & treats | cookie | `--k-snack` | #7A4A2C | #C9946E |
| Lil H's milk & pouches | bottle | `--k-lhmilk` | #5C6BD6 | #9CA7F2 |
| Baby care | nappy | `--k-babycare` | #2A8C88 | #6FCDC8 |
| Household | roll | `--k-house` | #6B6788 | #AAA6C8 |

### 1.6 Recipe-type colours

Used as a meal's type colour (`--tcol`) in the swap picker and recipe groups.

| Type | Token | Light | Dark |
|---|---|---|---|
| Chicken | `--chicken` | #C98E1E | #E9B95A |
| Beef | `--beef` | #9B2C2C | #E07A7A |
| Pork & sausage | `--pork` | #8A4F8A | #C08BC0 |
| Fish (N & P) | `--fish` | #2F7FB5 | #7FB6E0 |
| Salmon (Lil H) | `--salmon` | #D9604B | #F2907E |
| Veg & egg (N & P) | `--veg` | #4C8C4A | #85C383 |
| Lentil, chickpea & veg (Lil H) | `--plant` | #4E9A5F | #7CC48C |
| Egg (Lil H) | `--egg` | #B8960F | #E6CB4C |
| Breakfast | `--bf` | #8A5A3C | #D2A07E |
| Baking | `--bake` | #8C6239 | #D2A272 |
| N's favourite | `--n` | #C2477A | #E88AB0 |
| P's dish | `--p` | #2F6E8E | #7EC0DE |

`--n` and `--p` also mean "N" and "P" everywhere: split-meal halves, hearts and notes.

### 1.7 Meal icon tints

Each meal icon has its own tint `--i-<icon>`, defined in both modes in `:root`, for example steak #C43E3C / #D67876, fish #278AD4 / #68ADE1 and takeout #C8402F / #E57B6E. The meal icon bubble uses its tint at about 15% behind the icon at 100%. Takeaway uses `--ta`, #C8402F / #E57B6E.

---

## 2. Text

Font: Figtree (400, 600, 700, 800), falling back to the system UI font. Base size 15px.

**Text scale (v2.66):** every text size is one of six steps, set as tokens in `:root`. Never write a pixel size for text; use the token.

| Token | Size | Used for |
|---|---|---|
| `--fs-cap` | 12px | Small caps labels, meta lines, pills, chips, tags, counts |
| `--fs-sm` | 13px | Dialog body text, status lines, form labels, toolbar text buttons |
| `--fs-body` | 15px | Reading text, item names, dialog buttons, day titles |
| `--fs-title` | 17px | Card titles |
| `--fs-h2` | 20px | Dialog and recipe titles |
| `--fs-h1` | 28px | Page titles |

Exceptions: the meal-type label on meal cards stays 8px until the meal-card decision (options page, point 1); the close × and delete glyphs keep their own sizes; text inputs stay at 16px or more so phones don't zoom in. Text sizes quoted elsewhere in this guide mean the nearest step.

| Role | Size / weight | Extra | Example |
|---|---|---|---|
| Page title (h1) | 28px / 800 | letter-spacing −0.03em | "N & P", "Stock" |
| Dialog title (h2) | 20px / 800 | | "Move to the freezer" |
| Card title (h3) | 17px / 800 | | "Fruit & veg", "Fridge" |
| Day title (h3 in a day card) | 15px / 800 | +0.01em | "Thursday 29 Oct" |
| Section label (h4) | 12px / 800 | UPPERCASE, +0.08em, `--muted` | "YOU NEED", "METHOD" |
| Field label (small caps) | 12px / 700 | UPPERCASE, +0.08em, `--muted` | "COOK WITH", "MAKES", Re-plan day labels |
| Meal type on a meal card | 8px / 700 | UPPERCASE, +0.06em, `--muted`. Kept small on purpose so cards stay short (decided 29 Oct 2026) | "BREAKFAST", "LUNCH", "DINNER" |
| Body / reading text | 15px / 400 | line-height 1.5 in recipe steps; also recipe tips and Info & safety text | Recipe steps, tips, preferences |
| Dialog body text | 13px / 400 | `--ink`; explanations and notes under a field in `--muted` (decided 29 Oct 2026) | "This removes Wed 28 Oct breakfast.", "You can undo this from the Stock page." |
| Form label | 13px / 800 | `--muted`, sentence case; "Optional" after it in the meta style | "Name", "Cooked", "Where from?" |
| Status line | 13px / 700 | `--ink`, `--warn` when it's soon, `--bad` when it's past; the split-day hint uses the person's colour | "1 day left · eat by Fri 30 Oct" |
| Corner label on a card | 12px / 700 | `--muted` | "4 portions" on a food card |
| Group header (collapsible group inside a panel or dialog) | 15px / 800 | count beside it 12px / 600 `--muted` | "Breakfast  15 dishes", "In the fridge  1 meal" |
| Card header count | 12px / 600 | `--muted`, or the status colour it reports | "All in", "1 meal", "Empty" |
| Divider label | 12px / 800 | UPPERCASE, +0.08em, `--muted`, then a 1px `--line` rule to the edge. Week dividers use the page accent and add the date range at 12px / 700 `--muted`, sentence case | "FOOD", "ADD", "WEEK 4 OF 4  26 Oct – 1 Nov" |
| Day tag | 12px / 700 | UPPERCASE, +0.08em, `--acc`, no border, right of the day title | "TODAY" |
| Button sub-label | 12px / 700 | `--muted`, under the label of a two-line button | "Open groups", "All recipes" under Randomise |
| Bottom bar label | 12px / 700 | `--muted`; current page in its accent | "N & P", "Lil H", "Stock" |
| Hint pop-up (toast) | 13px / 700 | `--bg` text on an `--ink` box | "Tap ✎ to rename or × to delete an item" |
| Meal name on a meal card | 12px / 700 | Up to 2 lines (decided 29 Oct 2026). No brackets on meal cards: Hungarian dishes show the English from their brackets, others drop the bracket (v2.68). Recipe windows and lists keep the full name | "Leek & potato soup", "Paprika chicken & rice" |
| Item name (shopping, food cards) | 13.76–15px / 700 | | "Brown onions" |
| Meta line | 12px / 600 | `--muted` | "Cook today · 6 portions · 4 left" |
| Toolbar text button | 13px / 800 | accent colour | "Today", "Expand all" |
| Dialog button | 15px / 800 | | "Save", "Cancel" |
| Pill / chip | 12px / 700 | | heads-up chips, ingredient chips |

Capitalisation: sentence case everywhere: "Got everything", "Move to freezer", "Expand all", "Re-plan upcoming meals". Never Title Case. Small-caps labels are written in sentence case and made uppercase by CSS only.

---

## 3. Spacing and shape

| Thing | Value |
|---|---|
| Page side gutter | 8px each side |
| Gap between cards (days, categories, cooked sections) | 12px |
| Card | radius 16px, 1.5px `--line` border, `--surface` background |
| Card padding | 12px (day cards: 13px top/bottom) |
| Inner tile (meal tile, fact, tip, food card) | radius 12px (food cards 14px), padding 8px 10px (tips 10px 12px, food cards 12px; corrected 29 Oct 2026) |
| Empty-state card | radius 16px, 1.5px dashed `--line` border, `--surface`, padding 22px 18px, items left-aligned 10px apart: title (16px / 800), note (13.76px `--muted`), one in-card button |
| Gap between rows inside a card | 6px |
| Gap between buttons in a toolbar | 4px (decided 29 Oct 2026) |
| Top-bar drop tabs | container padding 4px, gap 4px, radius 16px |
| Dialog | radius 20px, padding 20px, gap 14px between blocks, 16px side margin |
| Recipe card body | padding 18px 18px 22px, 20px between sections |
| Pills and chips | radius 99px |
| Focus ring | 3px `--acc` outline, 2px offset (−3px inside full-width rows and menus) |

---

## 4. Buttons

Borders are authored as 1.5px. They render at 1px on a standard-density screen.

| Type | Class | Size | Radius | Border | Background / text | Icon | Spacing |
|---|---|---|---|---|---|---|---|
| Toolbar icon button: Undo, Redo, Re-plan, Calendar, Edit, Search, date pen | `.calbtn` | 30 × 30, square (decided 29 Oct 2026) | 10px | 1.5px `--line` | `--surface` / `--ink` | 16px | 4px apart |
| "Today"-style text button: Today, Expand all / Collapse all | `.todaybtn` | auto × 30, padding 0 11px | 10px | 1.5px `--line` | `--surface` / `--acc` text | none | 4px apart |
| Compact icon button in a day header: split, edit past day | `.hsplit` | 30 × 26 | 8px | 1.5px `--line` | transparent / `--muted` | 15px | 4px apart |
| Row action button: swap, remove ×, freeze, thaw | `.sbtn` | 34 wide × full row height | 11px | 1.5px `--line` | `--chip` fill, no visible border (v2.67) / `--muted`; freeze on a 12% `--k-freezer` tint, thaw on a 12% `--k-fridge` tint, a swap that needs attention on `--warn-bg` | 16px | 5px apart, always to the right of the meal tile |
| Ghost pill: "Show more", hearts | `.wkmore`, `.fav` | auto × 24–28 | 99px | 1.5px tint of the colour | 10% tint / colour | 14–15px | |
| Header round button: Settings | `.setb` | 34 × 34 | 50% | 1.5px `--line` | `--surface` / `--muted` | 18px | top right of the page header |
| Dialog header round button: back ‹, notes pen, choose ✓ | `.pvb`, `.pvok` | 38 × 38 | 50% | 1.5px `--line` | `--surface` / `--ink` | 20px (pen 17px) | |
| Dialog close × | `.close` | 28 × 28 | none | none | transparent / `--muted`, "×" at 24px | text glyph | top right, in line with the title |
| Dialog button: confirm, Cancel | `.todaybtn` in `.acts` | equal widths × 42 | 10px | 1.5px `--line` | `--surface` / `--acc` | none | 8px apart |
| Destructive dialog button: Delete, Discard, Remove | `.todaybtn.warnb` | as above | 10px | 1.5px `--bad` | `--surface` / `--bad` | none | |
| Randomise (decided 30 Oct 2026) | `.rand` | equal widths × 42+ (two lines: label + sub-label), 8px apart | 10px | 1.5px `--line` | `--surface` / `--acc` text, sub-label `--muted` | 16px | 8px apart |
| Option row in a picker | `.opt` + `.optmore` | full width × 37+ | 10px (split between the two) | none | transparent / `--ink` | 18px | ⋯ joined on the right |
| Collapsible header | `.cathead`, `.oghead` | full width × 41–45 | none | none | transparent | 18–20px | chevron far right |
| Tick (in stock) | `.tick` | 28 × 28 | 50% | 2px | `--ok` filled when ticked | 16px | |
| Pill / chip: heads-up, ingredient chips | `.huc`, `.need`, `.chip` | auto × 24 | 99px | 1.5px or none | 12% tint / colour | 13px | 6px apart |
| Segmented choice: N & P / Lil H, meal slots, settings options | | equal widths × 34 (settings 38, inside a 3px-padded track) | 10px | 1.5px `--line` | `--surface`; selected = `--acc` border and text on a 14% `--acc` tint (P and N choices use `--p` / `--n` as their accent) | 16px | 6px apart |
| Bottom bar tab | `.tabbar button` | one third wide × 45 | none | none | transparent / `--muted`; current = `--acc` with a bar on top | 21px | |
| In-card action button: Move to freezer / fridge, Add to meal, Discard, Show everything | `.todaybtn` in `.facts2` or `.empty` | equal widths × 36; Discard always last (right), and on its own it takes the right half | 10px | 1.5px, the meaning colour at 45% mixed into `--line` | `--surface` / the meaning colour (`--bad`, `--k-freezer`, `--k-fridge`, `--warn` for Add to meal, or `--acc`) | 16px | 8px apart |
| Group header: collapsible group inside a panel or dialog | `.shead`, `.oghead` | full width × 41, padding 10px 12px | none | none | transparent / `--ink` | 18px, chevron right | |
| Drag handle | `.grip` | 26px column, 34px tap area (an invisible strip covers the gap either side), full row height | 8px | none | transparent / `--muted` | 16px dots | left of the meal tile (decided 29 Oct 2026) |

### 4.1 Button states (decided 29 Oct 2026, v2.41)

Every button follows these. Write new buttons so they inherit them; don't add a per-button hover or pressed colour.

| State | Looks like | How it's built |
|---|---|---|
| Pressed (finger or mouse down) | One shade darker (one shade lighter in dark mode). Small buttons also shrink to 94%. Rows, meal tiles, headers, menu rows, drop tabs and options in the swap list only shade | A 10% `--ink` layer on top: `background-image: linear-gradient(var(--press), var(--press))`. Shrink is `transform: scale(.94)` over 0.08s, switched off for reduced motion. A do-nothing `touchstart` listener on the document makes this work on iPhones |
| Hover (computer only) | A fainter shade on top, so anything selected stays selected | A 5% `--ink` layer (`--hov`), inside `@media (hover:hover)`. Remove × also turns `--bad` |
| Selected / switched on (an option you chose) | Accent border and text on a 14% accent tint | `color-mix(in srgb, var(--acc) 14%, var(--surface))`. Menu rows show the tint and a tick, no border |
| Where you are (navigation) | Filled with the page accent, `--on-acc` text | The open drop tab, the Stock view tab, the picked day in the calendar. The bottom bar shows the current page as accent text with a 3px bar on top |
| Today / the one you have now | A 2px accent ring, no fill | Today's day card, today in the calendar, your current meal in the swap list |
| Greyed out (disabled) | 40% opacity, same shape | The other person's favourite heart is the exception: it stays readable because it still shows their choice |
| Keyboard focus | 3px accent ring | See section 3 |

Tints for status pills, chips and "Show more" are separate: they follow the colour they show (section 1.3), not these rules.

### 4.2 Other components (added 29 Oct 2026)

**Settings, top (v2.69):** "Changes on {page}" (N & P, Lil H, Stock, or Cooked (N & P / Lil H)) with a dropdown arrow, then Undo and Redo as two equal dialog buttons. The arrow shows the last 10 changes on that page since NPH was opened on this phone: 15px icon, what changed (13px), how long ago (12px `--muted`), 1px `--line` between rows.


| Component | Where | Look |
|---|---|---|
| Sync pill | page header, left of Settings | 11.84px / 700 `--muted`, 1.5px `--line` border, radius 99px, padding 4px 10px, `--surface`; a coloured status dot first. Says "This phone" on phones and "Saved on this phone only" on wider screens |
| Basket counter | right end of a shopping row | a 26 · 50 · 26 px grid: the middle pill (26 tall, radius 99px, 7% `--ink` tint, cart + plus icons 15px) shows when nothing is in the basket; − and + appear either side once something is, and the box turns to a 15% `--shop` tint with the number at 14.4px / 800 |
| Item tag | after a shopping item's amount; in recipe ingredient chips | 10.88px / 700, radius 99px, padding 0 7px, 1px border. Variants: Lil H (`--lilh` outline), low (`--shop` 18% tint), week (`--warn-bg`), not needed (`--bad` 16% tint) |
| Timer and temperature chip | inside recipe steps | 13.12px / 700, radius 7px, padding 0 6px, 1.5px `--line` border, `--chip` background, 12px clock or flame icon. Squarer than pills on purpose, because it sits inside a sentence |
| Leftover meal tile | meal pages | the meal tile tinted with `--k-fridge` at 9% over `--chip`, at 82% opacity; a small fridge badge after the meal type |
| Kitchen category labels | Kitchen panel | divider-label style in the category colour (`--kc`), with the category icon at 15px |
| Hint pop-up (toast) | above the bottom bar | the page accent at 20% over `--surface`, 1.5px accent-45% border, `--ink` text 13px / 700, padding 9px 14px, radius 12px, `--shadow`, just above the bottom bar (84px from the bottom, 60px with the compact bottom bar). Right after a change it ends with an "Undo" in the accent (800) and stays 5 seconds; otherwise 2.2 seconds (v2.68) |

### 4.3 Touch areas (v2.66)

On touch screens (`pointer: coarse`) every small button gets an invisible touch area bigger than what you see, so it's easier to hit. Button sizes and the gaps between them don't change.

- The touch area is a transparent `::after` layer around the button, set per button with `--tt`, `--tr`, `--tb`, `--tl` (top, right, bottom, left, in px).
- Each side reaches out by half the gap to the next control, so two touch areas never overlap, and the whole area is up to 44px each way.
- Inside a card, it never reaches past the card's own padding.
- New small buttons must be added to this list with values worked out the same way.
- Known small ones (v2.66): heads-up chips are clipped by the scrolling strip; the shopping amount button reaches about 44×41; hearts about 89% of 44px.

---

## 5. Button order and position

- **Meal pages (N & P, Lil H), right-aligned under the drop tabs:** heads-up strip, then Re-plan, then Today: a 30×30 icon button with the calendar icon and no text (v2.74). Tap it to glide to today (about a third of a second, easing out; instant with reduced motion); press and hold to open the calendar (v2.73). Undo and Redo live in the message after a change and at the top of Settings (v2.69). The heads-up strip shows every reminder side by side when they all fit; when they don't, they become one chip, "{n} things to check today" with a › chevron, coloured by the most urgent. Tapping it drops a list down under the toolbar (v2.79), not a window: one full-width row per reminder (44px tall, 12px radius, `--surface` with a 1px `--line` border, its coloured 17px icon, the words in `--ink`, a › on the right), 6px apart, sliding open in about 0.2s (no animation with reduced motion). The chip's chevron points down when shut and up when open. Tap the chip again, tap anywhere else or press Escape to close it; tapping a row closes it and goes where that reminder points. It covers the page under it rather than pushing it down. A single reminder too long for the strip slides (v2.73).
- **Stock page, To buy and All items:** Edit, Search, Expand all / Collapse all.
- **Stock page, Cooked tab:** Expand all only. Edit and Search are removed, not left as blank spaces.
- **Every toolbar (the default, decided 29 Oct 2026):** buttons sit flush to the right edge, 4px apart. A button that doesn't apply on a tab or page is taken out entirely, so the rest close up to the right with no gaps.
- **Everywhere:** Undo always sits directly left of Redo, and Expand all / Collapse all is always last.
- **Press and hold (v2.82):** every press and hold in the app takes 400ms, as on Android (iPhone uses 500ms): the Today button's calendar, dragging a meal (was 250ms from v2.76). While a meal is held and dragged it keeps its normal look, with no edit buttons. Moving your finger more than 8–10px first cancels it, so scrolling never triggers it.
- **Meal rows (v2.76):** the meal tile with a ⋯ joined to its right (36px, same look as the swap list's ⋯: a 1px divider, 18px dots, `--muted`; it takes the tile's tint). The divider is `--line` on a plain card and mixes in the card's own colour on a tinted one (fridge, freezer, takeaway, missing, the bake's dashed outline) so it stays as easy to see (v2.79). The Weekend bake card works the same way: ⋯, edit view (Recipe, Swap, Remove) and one dashed outline round the tile and ⋯ together (v2.79); it can't be dragged, as there's only one bake slot a week. No drag dots: press and hold the tile to drag it to another slot that day (Alt + up/down arrow with a keyboard). Tapping the tile opens its recipe. Tapping the ⋯ opens its edit view (v2.69): the text hides, the icon stays on the left, and buttons fill the rest of the tile, icon above a 12px / 700 word, plain `--surface` background, coloured by meaning: Recipe (`book`, accent), then Taken out / Still frozen (fridge or freezer colour) when they apply (no Freeze: freezing is only on the Cooked tab, v2.71), Swap (accent, `--warn` when the meal needs a swap), Remove (`--bad`, always last). A past meal to check (rule C17) shows its "Check: …" line in bold `--muted`, with no outline, and its edit view starts with **Had it** (`check`, `--ok`). While open, the ⋯ stays in place (accent colour, tap it again to close) and the buttons fill the space between the meal icon and the ⋯. The meal icon and the ⋯ each sit on their own tile, the same fill, 10px radius and height as the buttons, 6px from the card edge and 6px apart (v2.79). They slide in quickly from the right, one after another (0.2s, 25ms apart) and fade out on close (0.13s); none with reduced motion. Button fill: 7% `--ink` over the card's own tint, so it suits every card colour (v2.78). Borders go round the whole card, meal and ⋯ together: 2px accent while open, 2px `--warn` or 1.5px `--bad` for a problem, 1.5px `--k-freezer` for a meal from the freezer (v2.79), and the 2px accent ring on slots you can drop a meal into. Any tap that isn't one of its buttons closes it (tapping the tile then only closes, it doesn't open the recipe); a button closes it after doing its job. On past days this replaces the pen: Recipe opens editable.
- **Cooked cards (v2.69):** header (icon, name, portions on the right), then time left on the left and the made date right-aligned on one line (the "freezing: frozen in about …" part in bold `--k-freezer`, and the "out of the freezer …" part of thawing food in bold `--k-fridge`, v2.72), the time bar, then pills (Planned, Thawing). A ⋯ (32px, 18px dots, `--muted`, accent while open) sits far right in the header after the portions (v2.76); tapping it shows a row of tiles in the same style as the meal edit view: Freeze (greyed out when it can't be frozen, never removed) or To fridge, Add to meal (only for spare food that can't be frozen), Change date (`cal`, accent), Discard (`--bad`, last). Tapping the card or anywhere else that isn't a tile hides them. No pen and no spare-portions note.
- **Day header:** title left, then Today tag, then edit-past-day pen, then split. The split is always far right.
- **Dialog header:** title left, close × top right. The swap window uses a short title ("Swap dinner") with the date under it at 12px / 600 `--muted`, then a key of pills for only the colours in that list (Recent `--rep`, Keeps 2 days `--keep`, Missing `--warn`; 12px / 700 on a 14% tint); its Randomise buttons just say "Open groups" / "All recipes" with the shuffle icon (v2.69). Recipe cards and previews use a hero header: back ‹ far left, notes pen, then choose ✓ or close × far right.
- **Dialog footer:** confirm first (left), dismiss second (right). The confirm button names the action ("Freeze", "Save", "Delete").
- **Shopping item rows:** tick left, name and amount in the middle, basket counter right.

---

## 6. Dialogs

- **Container:** max width 368px (16px side margins), radius 20px, padding 20px, 14px gap between blocks, `--shadow`, `--surface`. Accent = the page the content belongs to.
- **Header:** one row. Title left (h2, 20px/800), close × right (28×28, 24px glyph, `--muted`). No subtitle unless it says what or when; subtitles use the meta style.
- **Body blocks:** the subject first, as an icon bubble and name ("stmeal"). Then controls (portion steppers, date fields, segmented choices). Then info notes (`.stinfo`: 16px icon and 13.76px text, `--ink`). Then warnings (`.stwarn`: `--bad-bg` box, `--bad` text, 16px icon).
- **Footer (`.acts`):** one or two equal buttons, 42 tall, 8px apart, sitting 24px below the content above them. Confirm left, dismiss right. A destructive confirm uses the destructive style. Single-button footers are full width. A button may carry a 16px icon before its label (for example the shuffle icon on "Reshuffle").
- **Choices inside a dialog:** equal tiles side by side, each with a label and a small description underneath (as in the date window's Breakfast / Lunch / Dinner and Re-plan's Planned meals / Everything). The most common choice starts selected, and the footer confirms it.
- **Tick boxes everywhere (v2.82):** the recipe window's rounded square, with the tick centred: 24px in To buy and All items (radius 7px, tap area unchanged), 20px in windows (radius 6px); 2px `--line` border, filled with the item's colour when ticked. No round ticks anywhere.
- **Pills in a window (v2.82):** every pill in one window is 28px tall, with a 1.5px border that's transparent until highlighted, so a highlighted pill is never bigger; heart pills in a pair are the same width.
- **Recipe pills fold (v2.83):** the pills under a recipe's facts fold into one 30px round icon per kind, left to right: planned days (calendar, page accent: purple on N & P, blue on Lil H), good-for tags (leaf, green), freezing (snowflake, freezer blue), ingredient swaps (swap colour). A count badge shows when there's more than one. Tapping an icon fills it and sends its pills out to the right one after another (springy, 45ms apart); tapping any of those pills sends them back into the icon. One kind open at a time. No animation with reduced motion.
- **Day warning button (v2.83):** next to the date: 26px pill, info icon and the count, amber outline on an amber tint; filled amber while on. Card details are `--muted` normally; while on, the warnings are amber 700 and a card with none says "No warnings" in `--muted`.
- **Settings choice buttons:** their tap areas stay on the button (v2.83 fix: they were covering Undo, Redo and the change list).
- **Highlight after a jump (v2.83):** the view glides the item to the middle of the screen (the Today glide), then a glossy yellow wave crosses it once in about a second: it fills from the left to the right, then empties from the left, with a bright sheen on its leading edge and a soft shine along the top. Drawn as one sliding band (no masks or blur), so every phone shows all of it. A plain fade with reduced motion. Jumping to something in a folded group opens that group first.
- **Info & safety (v2.82):** a panel header with Expand all / Collapse all, and every section folds with the chevron header used in the Kitchen panel. "This rotation" and "This week's nutrition" start open.
- **Meal colours (v2.82):** each food type has its own colour so breakfast, lunch and dinner stand apart: breakfast green, chicken orange, egg yellow, lentil & chickpea pink, beef red, salmon blue.
- **Tick boxes in a list (v2.80):** 20px, accent fill when ticked, label 13.76px / 700 `--ink` beside it, 32px tall row, plain words with no brackets ("Replace it"). Used in Re-plan for leftovers that are already cooked: they start unticked.
- **Dismiss wording:** "Cancel". Re-plan has no dismiss button (v2.79): its footer is one full-width button (Reshuffle, or Change it / Change them) and the × closes it without changing anything.
- **Phones (560px wide or less):** every window is a bottom sheet (the heads-up list is no longer a window; it drops down under the toolbar, v2.79): it slides up from the bottom, fills the width, and closes with a swipe down (or ×, or Back). Small windows (`.sm`) are full width too. Above 560px, windows are centred and pop in. Reduced motion turns both animations off.
- **Recipe card:** full-height sheet with a hero header (icon, type label, title 20px/800, facts row of three tiles) and sections labelled with h4 section labels.

---

## 7. Icons

One meaning per icon and one icon per meaning. Icons are 24-unit outline symbols (`#i-*`), drawn with `currentColor`.

| Meaning | Icon |
|---|---|
| Kitchen stock (ingredients you have) | `basket`, the same as the Stock page, since both show what's in stock |
| Recipes | `book` (an open book) |
| Cooked food tab | `pot` |
| Fridge / from the fridge / move to fridge | `fridge` |
| Freezer / freeze / thaw reminder | `snow` |
| Info & safety, information note | `info` |
| Swap a meal or ingredient | `swap` |
| Remove, discard, delete, leave out | `x` |
| Add | `plus` |
| Edit (notes, past day, rename, amount, date) | `pen` |
| Yes / in stock / selected / choose | `check` |
| Date, planned for | `cal` |
| Shuffle: Re-plan and Randomise | `dice` (drawn as shuffle arrows) |
| Undo / Redo | `undo` / `redo` |
| Search | `search` |
| Sync (Settings → Syncing) | `recalc` (circular arrows). Used only for syncing |
| Settings | `gear` |
| Portions (Makes) | `users` |
| Time | `clock`; oven temperature `flame` |
| To buy | `cart` |
| View details | `dots` |
| Expand / collapse / back | `chev` (rotated) |
| Split a meal | `split` |
| Drag | `grip` |
| Favourite | `heart` |
| Light / dark | `sun` / `moon` |
| Layout: cards / list | `l1` / `list` |
| Pages | `plate` N & P, `baby` Lil H, `basket` Stock |

Sizes: 16px in toolbar and row buttons, 15px in compact buttons, 13px in chips, 18–20px in headers and pickers, 21px in the bottom bar. Shopping categories use their own icons (section 1.5); those icons mean that category only.

---

## 8. Wording for repeated phrases

| Situation | Exact wording |
|---|---|
| Dismiss a dialog | Cancel |
| Save an edit | Save |
| Everything in stock | Got everything |
| Collapse / expand all groups | Collapse all / Expand all |
| Cooking day | Cook today · {made} portions · {n} left, plus " · cook fresh" for meals made fresh each time; on past days, Cooked · … No cooking method or time on the card (it's in the recipe), and no day counts (v2.66) |
| Leftover day | Leftovers · {n} portions · {n} left (or "none left") |
| Not ready in time | Still thawing · ready about {8pm}, after this meal / Still frozen · … (amber outline and text) |
| Stored food | From the fridge / From the freezer |
| Missing items | Missing: {items} |
| Own meal on a split day | Just for P / Just for N |
| Eat-by | {n} days left / 1 day left / Eat today (Cooked cards don't repeat the date, decided 30 Oct 2026) |
| Short date | Fri 30 Oct (weekday short, day, month short) |
| Long date | Friday 30 Oct |
| Re-plan | "Re-plan" (with the hyphen) for the button and title; "Reshuffle" for the action inside it |
| Past day locked (view only) | This day has passed, so this is view only. To change what you had, tap the pen on the day, then the meal. |
| Already-cooked food (view only) | Cooked {Thu 29 Oct} / Made {date}, so this is view only. To change it, open the meal on the day it was cooked. |

Numbers are digits ("2 days", "6 portions"). Use "portion" for one and "portions" for more. Separators are " · ".

---

## 9. Dark mode

Every colour above has a dark value, in `:root` under `@media (prefers-color-scheme: dark)` (not `[data-theme="light"]`) and again under `:root[data-theme="dark"]`. Sizes, spacing, radii and icons are identical in both modes. Tints are made with `color-mix(in srgb, <token> N%, transparent or --surface)` so they follow the mode. No component may use a hard-coded colour.

---

## Pass log

| Pass | Date | App version | Area | Result |
|---|---|---|---|---|
| 1 | 29 Oct 2026 | 2.37 | Guide created; N & P page checked | 8 deviations found (below) |
| 1a | 29 Oct 2026 | 2.38 | Decisions applied | Toolbar buttons 30×30, 4px apart, on every page; Kitchen tab uses `basket`, Recipes tab uses `book`. Pass 1 items 1, 3 and 4 fixed |
| 1b | 29 Oct 2026 | 2.39 | Decisions applied | "Show more" is a 24px pill; Re-plan uses the shuffle icon (`dice`) inside its window too, and `recalc` is no longer used. Pass 1 items 2 and 6 fixed |
| 1c | 29 Oct 2026 | 2.40 | Decisions applied | Meal cards: type 8px, name 12px (option C), so items 5 and 8 are settled as deliberate exceptions. Re-plan list view: day labels use the field-label style and the buttons sit 24px below the list, like other dialogs. "Nothing needs changing" view: a Planned meals / Everything choice, then Reshuffle / Keep as is (option A). Item 7 (drag handles) still open |
| 2 | 29 Oct 2026 | 2.41 | Button colours and states, whole app | Found: no button changed when pressed; hover on only 4 kinds of button (one hid the selected tick, and remove × went orange instead of red); Settings showed choices as a raised grey tile, unlike everywhere else; selected tints anywhere from 10% to 18%; greyed-out at 35%, 40% or 45%; focus rings 2px or 3px in mixed colours; 67 leftover style rules for 13 kinds of button that no longer exist. Applied (tap option B): rules in section 4.1. Settings choices use the outline and tint. All selected tints 14%, greyed-out 40%, focus rings 3px accent. Leftover rules deleted. Checked by comparing every element on every page and main window against 2.40 in both modes: only the intended buttons changed |
| 2a | 29 Oct 2026 | 2.42 | Toolbar alignment | The Cooked tab no longer keeps empty spaces where Edit and Search sit on the other tabs; Undo and Redo close up next to Expand all on the right. Made the default for every toolbar (section 5). The other toolbars already followed it |
| 3 | 29 Oct 2026 | 2.43 | Lil H page (412px light/dark, 1280px) | Page title 28.8px on every screen (was 32px above 400px); day headers 26px tall with or without header buttons; remove × icon 16px |
| 4 | 29 Oct 2026 | 2.44 | Stock: To buy, All items, edit mode, search, category picker | Edit-mode rename/delete 34×34 r11 with 16px icons; empty-state and add-card titles 16px; Add button 800; picker icons 18px; category cards 12px side padding so row controls line up under the chevron; 900 weights (not in the font) changed to 800 |
| 5 | 29 Oct 2026 | 2.45 | Stock: Cooked tab | Discard `--bad`, Move to freezer `--k-freezer`, Move to fridge `--k-fridge` (were page pink); 16px icons; food name 14.72px; Made/Planned lines meta style; empty note 12px padding. Waiting on owner: guide says 8×10 padding for food cards, app uses 12 |
| 6 | 29 Oct 2026 | 2.46 | Drop panels: Kitchen, Recipes, Info & safety | Expand all last in panel toolbars; panel padding 12px (was 16); Likes/Avoid/Good to know use the field-label style; counts and methods meta size; recipe names 700; recipe tiles r12 |
| 7 | 29 Oct 2026 | 2.47 | Meal dialogs: recipe card, swap list, preview, takeaway, remove meal, Re-plan, calendar | Recipe card title 20px, its × 38px round; type/tip/weekday labels field-label style; chips 11.84px, 13px icons; counts and option notes meta size; option names 700; "Remove this meal?" uses red Remove + Cancel; single footer buttons full width 42px; unavailable options 40%; calendar r16, padding 12, 30px chevron buttons, 16px title. Waiting on owner: takeaway has two Choose buttons |
| 8 | 29 Oct 2026 | 2.48 | Stock dialogs: freeze, discard, change date, rename, delete | Date field matches other text fields; segmented choices 13.6px/800 everywhere; steppers r10 |
| 9 | 29 Oct 2026 | 2.49 | Settings, page headers, bottom bar | Setting descriptions and version line meta style; header sync pill 11.84px. Final re-check of every area at 412px light/dark, 1280px, plus 360px and 768px: no sideways scrolling, no dark-mode mismatches, nothing hard-coded, no remaining small differences |
| 10 | 29 Oct 2026 | 2.50 | Owner decisions on the big items | Food-card padding corrected in the guide (12px); takeaway keeps only the ✓ (footer Choose removed); Sync icon (`recalc`) added to the icon table (pass 1b's "no longer used" now means "no longer used for Re-plan"); dialog body text standardised at 13.76px; drag handles get a 34px tap area. Everything listed as "not covered" in passes 3–9 added (sections 2, 3, 4, 4.2) |
| 11 | 29 Oct 2026 | 2.51 | Loop over the newly added parts, every area | Week dividers matched to the divider-label style (were 12.48px +0.06em); TODAY tag 10.24px (was 11.2px); panel group headers padded like dialog ones (10px 12px); card-header counts meta style; "Show everything" 36px like other in-card buttons; hearts use pill text (11.84px / 700); split-day hint at status-line size; "4 portions" 11.84px / 700; all tags 700 weight; recipe tips and Info & safety text at body 15px (were 14.4px). Also found against the original guide: meal tiles had 11px corners (now 12px) and the takeaway title sat above centre (now centred). Re-checked at 412px light/dark and 1280px: no sideways scrolling, no dark-mode mismatches |
| 12 | 30 Oct 2026 | 2.66 | Owner choices from the modern-apps comparison (points 3, 4, 9, 10) | Six-step text scale with tokens (section 2); invisible touch areas on every small button, no size or gap changes (section 4.3); every window a bottom sheet on phones (section 6); meal cards drop the cooking method (section 8). Checked headless at 400px: sizes and positions unchanged, touch areas don't overlap, swipe-to-close works on every window, earlier test loops still pass |
| 13 | 30 Oct 2026 | 2.67 | Owner choices, round 1 | Row action buttons soft filled (point 2C); light background near-white #F7F7FA (point 6C); heads-up strip collapses to one chip that opens a list (point 8B) |
| 14 | 30 Oct 2026 | 2.68 | Owner choices, round 2 | Meal-card names without brackets, English for Hungarian dishes (point 1B); dark, accent-tinted message box with Undo (Undo C); toolbar Undo/Redo kept until the Settings row is built |
| 15 | 30 Oct 2026 | 2.69 | Owner choices, round 3 | Tap-a-meal edit view (section 5); Cooked cards tap to show tiles, greyed Freeze, Change date replaces the pen; swap window short title, date and colour key; Undo/Redo out of every toolbar and into Settings with recent changes |
| 16 | 30 Oct 2026 | 2.70 | Owner request | Swap gets its own colour, `--swap` (lime green), everywhere it appears |
| 17 | 30 Oct 2026 | 2.71 | Owner request | Freeze removed from the meal edit view; freezing only from the Cooked tab |
| 18 | 30 Oct 2026 | 2.72 | Owner request | Cooked cards: freezing text in freezer blue, thawing text in fridge blue |
| 19 | 30 Oct 2026 | 2.73 | Owner request | Today and calendar combined (tap / press and hold); heads-up chips side by side when they fit, one list chip when they don't |
| 20 | 30 Oct 2026 | 2.74 | Owner request | Today button icon-only; quick eased scroll to today |
| 21 | 31 Oct 2026 | 2.75 | Rules release | Diet warnings use `--warn`: a swap-window option that breaks a soft rule gets a `--warn-bg` row with its reason in `--warn`; an ingredient option adds " · {reason}" to its small label in `--warn`; Re-plan lists a fallback pick with an amber info line; meal cards use the amber outline and put the reason first in their meta line |
| 22 | 31 Oct 2026 | 2.76 | Owner request | One press-and-hold time (250ms); hold a meal to drag it (drag dots removed); ⋯ on meal cards and Cooked cards opens their buttons; heads-up list drops from the top; the basket − / + tap areas no longer cover the whole shopping row |
| 23 | 31 Oct 2026 | 2.77 | Rule C17 option B | Past meals to check: plain grey "Check: …" on the card, a neutral heads-up chip, and Had it in the edit view |
| 24 | 31 Oct 2026 | 2.78 | Owner request | ⋯ edit view cleaned up (⋯ stays, animated buttons, blended fill); card borders wrap the meal and ⋯ together |
| 25 | 31 Oct 2026 | 2.79 | Owner request | Re-plan loses "Keep as is"; Weekend bake gets the ⋯ and edit view; icon and ⋯ tiles in the edit view; freezer border wraps the ⋯; tinted dividers; heads-up list drops down under the toolbar |
| 26 | 31 Oct 2026 | 2.80 | Rule C26 option C | Re-plan covers today's still-to-come meals and tomorrow's; already-cooked leftovers get a "Replace it" tick box |
| 29 | 1 Nov 2026 | 2.83 | Owner request | Day warning button; recipe pills fold into icons; highlight redrawn left to right; jumps open folded groups; Settings Undo/Redo fixed |
| 28 | 1 Nov 2026 | 2.82 | Owner request | Checks list rows jump to their subject with a glide and a glossy wave; option A colours (breakfast and lentil/chickpea swapped); square ticks everywhere, centred; equal pill sizes; 400ms hold; Info sections fold; weekly nutrition; header gap; centred cards; calendar swipe; panel flash fixed |
| 27 | 31 Oct 2026 | 2.81 | Rules C7, C26, R1 | Re-plan list view gets the Planned meals / Everything choice tiles above the list; cooked food from the freezer says "Already cooked: in the freezer" |

### Pass 1: N & P page (v2.37), checked against this guide

1. *(Fixed in 2.38.)* **Toolbar icon buttons are two sizes.** Undo and Redo are 30×30; Re-plan and Calendar are 36×30 (the standard was then 36×30; now 30×30). The Stock toolbar has the same split.
2. *(Fixed in 2.39.)* **Two icons for one meaning.** Re-plan uses `dice` on the page but `recalc` on the buttons inside the Re-plan dialog.
3. *(Fixed in 2.38.)* **One icon, two meanings: `fridge`.** It's the Kitchen drop-tab icon (ingredient stock) and also the "From the fridge" badge on leftover meals. (`jar` can't replace it: that's the Cupboard category.)
4. *(Fixed in 2.38.)* **One icon, two meanings: `pot`.** It's the Recipes drop-tab icon and also the Stock page's Cooked tab.
5. *(Settled in 2.40: 8px by choice.)* **The field label on meal tiles is smaller than the standard.** "BREAKFAST / LUNCH / DINNER" is 9.6px/700 (+0.06em) against the 10.24px/700 (+0.08em) field label used in the recipe card facts.
6. *(Fixed in 2.39.)* **Pill heights vary.** Heads-up chips are 24px but the "Show more" pill is 27px.
7. **Drag handles are 16px wide.** That's fiddly to hit on a phone (also flagged by the test loops). Every other row control is 34px wide.
8. *(Settled in 2.40: kept at 11.2px.)* **The meta line on meal tiles is 11.2px/600** against the 11.84px/600 standard (shopping items use 11.84px).

Checked and consistent: the heads-up strip (it scrolls on purpose when its text is wider than the strip), the drop tabs (Kitchen / Recipes / Info & safety), the day card shape and spacing, the today highlight, the row-action order (freeze, swap, remove) and the colour tokens in both modes (no hard-coded colours on this page). The dialogs this page opens and the bottom bar are separate areas, checked in later passes.

### Added 30 Oct 2026 (v2.58)

| Part | Standard |
|---|---|
| Calendar | Opens as a small centred window (dialog: title "Pick a date", × to close), not inside the page, so the page keeps its place |
| Cooked card states | Spare and freezable: blue card and note, no outline; on its last day (eat today) it adds a 2px `--warn` outline (decided 30 Oct 2026). Still thawing: 2px `--k-freezer` outline and the "Thawing · ready about …" line as a status pill like "Planned" (snow icon, 11.84px / 700, `--k-freezer` on a 14% tint, 8px corners), over whatever else the card shows (unless it's past its date or won't be thawed in time). Spare and can't be frozen (thawed food, takeaways, meals that don't freeze): 2px `--warn` outline, 8% `--warn` tint, amber note and an Add to meal button. Past date or too late: `--bad`. Planned line: `--ok` text on a 14% `--ok` tint, 8px corners |
| Time-left bar | Green over half, amber at half or less, red track when empty (eat today) |
| "Add to meal" bar | Under the meal-page toolbar: accent 12% tint, 1.5px accent-45% border, 14px corners, 13.76px text, Cancel on the right. Meals you can pick get a 2px accent ring; the rest fade to 40% |

