# NPH implementation rules

Use the canonical `site-repo` checkout for changes; sibling `nph-v*` folders are delivery snapshots. Read `CLAUDE.md` and section 0 of `docs/nph-rules.md` before changing logic or recipe data. Follow the owner's latest decisions and update the rulebook alongside implementation.

For **all visual work**, including text, highlights, controls and windows:

- Read `docs/nph-style-guide.md` and follow its current owner decisions. Keep N & P, Lil H and Stock consistent, modern, sleek and fairly simple; reuse components/tokens, restrained semantic colour and concise text hierarchy.
- Apply subtle consistency fixes directly, with no preview needed.
- For larger visible changes, prepare matched Before/After previews from the real app in isolated local copies, explain the effect and ask P to approve the concrete result before changing the canonical app.
- For major redesigns, give 2–3 distinct options with trade-offs and representative previews, then seek approval for the chosen design. Do not break a larger change into small edits to bypass this policy. An already selected exact preview does not require repeated approval.
- Check affected views in light/dark and 320px/400px phone layouts, including relevant text wrapping, focus, selection, warning and expanded states. Update the visual pass log and release notes. Do not claim the whole app was visually verified when only specific surfaces were checked.
- Every window, modal, popup and dropdown must use the shared Back-history registry. Mobile Back/back-swipe dismisses the newest open window before leaving the current page; other close methods remove its history entry. Nested disclosures within one dropdown do not create separate windows. See the v2.110 rulebook entry and tests/checklist-2110.py.

For new or substantially changed Lil H recipes/ingredients:

1. Complete `docs/recipe-implementation-checklist.md`. This includes preparation, measured quantities, nutrition, fat, digestion, compatible cooking roles, shared stock, storage and contextual planning rules. Review medical content against current authoritative sources; distinguish household preferences from clinical guidance.
2. Populate every required metadata field. Do not treat an absent nutrition/preparation/digestion classification as neutral. Do not broaden a substitution family merely to make stock available.
3. Add a new recipe ID to `LH_RECIPE_RULES_REVIEW` only after the authored review is complete. Copying an existing recipe does not provide a new sign-off. `LH_ROLES` is an explicit ingredient cooking-role review; update it deliberately with the related profiles and nutrition groups.
4. Run the catalogue audit and local checks listed in the checklist before delivery. Do not silence an audit by bypassing readiness checks or weakening a rule. Fix the data or leave the new entry unavailable to automatic selection until reviewed.

Tests must use disposable local Brave/Chrome contexts, never the live app or saved phone data. Metadata must not create portions or rewrite a cooked batch's ingredients. Preserve manual choices with warnings, recipe-only historical notices, and the current rule that gas-maker explanations are absent from recipe windows.
