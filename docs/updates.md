# Updating NPH

Installed-app logo refresh (v2.103): the page links to the stable manifest URL and the approved logo images have content-versioned URLs. After installing the app update, open the home-screen app online. Chrome may offer **Review app update** in its menu; review and accept the new logo if offered. Chrome/Android control the final launcher refresh. A plain home-screen shortcut may need to be added again; do not uninstall an installed app or clear site data to change its icon.

NPH checks for updates when opened, brought back on screen or reconnected. In Settings, **App updates** shows the installed version, **Check for updates** and, once a complete new release has downloaded, **Update now**. An available notice offers **View update** or **Later**. A downloaded update can be opened offline.

Finish your edit before updating. The app verifies that changes are saved locally before reopening. If shared writes are still pending or storage cannot save your changes, it keeps the current page open and explains why. Another open tab is offered the new version without interrupting its edit. Updates preserve saved household data, recovery backups and phone preferences; the JSON backup format remains version 1.

## One-time transition from an older installation

On each phone, open:

https://peterthomson9.github.io/nph/?nph-update=1#np

Keep the phone online while the new app downloads, then check Settings for v2.102 or later. If the browser has not completed its background check, close and reopen the link while connected. Once the app has loaded, reopen the saved home-screen app. Do not delete site data or uninstall the app to update.

The browser still controls worker-check scheduling; this is not a guarantee of an immediate download. Without an old worker, the query also gives the new page a fresh navigation URL. With an old worker, navigation prompts a worker check. The replacement worker downloads a verified release, activates once because the old installation lacks update controls, and navigates only the marked transition window. The update-aware page removes that parameter. Other old windows load the new app when reopened.

## Release implementation

- `sw.js` remains at a stable URL, registered with `updateViaCache: none`.
- Cache the complete core release using network revalidation, then verify that cached HTML, worker and `release.json` agree on the version. Only update-aware release caches are used to detect modern installations; the legacy bootstrap marker is persisted so activation survives worker restarts.
- Modern releases wait for an explicit activation message. Page reload occurs only for the requesting tab after its local save. Other tabs detect the new controller and show a ready-to-open status.
- Navigation uses the current release's cached HTML, including offline. Fonts use their separate cache. Cleanup is restricted to NPH release names, leaving application data and unrelated caches intact.
- Run `python tools/prepare-release.py` after changing `NPH_V`, and `python tools/prepare-release.py --check` before publishing. Keep backup schema changes separate.
- `python tests/updates.py` uses a disposable localhost `/nph/` site and real legacy HTML/worker from the initial repository commit. It tests upgrade retention across all eight groups, incomplete releases, edit/sync/quota guards, multiple tabs and offline activation. `tests/backups.py` retains the historical v2.100 backup round trip; `tests/offline-289.py` checks current-release offline reopening. Set `BROWSER_EXE` to the installed disposable-test browser where needed. Never use a live phone profile.
