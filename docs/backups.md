# NPH backups

In Settings, choose **Save backup** and keep the downloaded JSON file in Downloads or another private folder. This includes plans, stock, cooked food, custom items, item changes, notes and favourites. It does not include the app's built-in recipe catalogue, phone identity, appearance or Undo history.

To restore, choose **Restore backup**, select the file and check its date/counts. **Replace saved data** replaces this phone's household data and reloads the app. **Cancel** leaves it unchanged. After a restore, **Recover data from before the last restore** can put the preceding dataset back; another confirmed restore replaces that recovery copy.

The external JSON file survives clearing browser data if the file itself is retained. The internal recovery copy does not. This release supports files up to 8 MB. If a recovery copy cannot be stored, replacement is stopped. Local restore is unavailable while connected to shared storage.

## Compatibility contract

- App release `2.101` reads format `1` / data schema `1`, including files written by the approved `2.100` preview. App version is informational, not a compatibility gate.
- The original payload's SHA-256 checksum is verified before migration. This detects accidental changes, not authenticity; the file is ordinary unencrypted JSON.
- Keep `tests/fixtures/backups/v1-2.100.json` permanently as a historical regression fixture. Test both exporting the current release and restoring this older file through the actual UI.
- Increment the data schema only when saved record structure changes. Add each pure `BACKUP_MIGRATIONS[oldSchema]` step, retain the prior steps and test every historical fixture. Migration operates on a detached copy and must preserve IDs, batch facts and references.
- If envelope/checksum serialization changes, retain a reader for supported old envelope versions too. Do not simply increment `BACKUP_FORMAT` and discard the old reader.
- Catalogue changes must retain referenced recipe IDs or migrate those records deliberately. Unsupported schemas, missing recipe support and malformed data are rejected before replacing the live store.
- Future IndexedDB/Firestore storage implementations must export/import this logical format rather than expose their database internals. Do not include credentials or automatically enable local replacement against a shared household.

Run `python tests/backups.py` in a disposable local Brave context. Run `python tests/offline-289.py` with `BROWSER_EXE` set to the installed test browser for cache/offline checks. Never point tests at the live site or existing browser profiles.
