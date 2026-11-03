# Phone-local saves and recovery (v2.104)

On first opening, NPH copies the eight household data groups from the earlier browser save into IndexedDB and keeps a Before storage upgrade recovery copy. The migration transaction must finish before the app starts. The original browser save remains untouched by the migration. Each phone migrates independently; there is no Firebase or phone sync in this release.

New household saves use IndexedDB. Identity, appearance and view preferences remain separate. A save is complete only after its transaction commits; the existing status pill shows saving or failure. If saving fails, keep the window open and download a backup of its in-memory data. If another window saved a newer revision, the stale window cannot overwrite it: download its unsaved changes before reloading. Different data saved by an older app window is captured as a recovery alternative and reported.

In Settings, choose **Recovery copies**, then **Review copy**. Check the date, reason and summary before **Replace saved data**. Replacement creates a recovery copy of the previous committed dataset and writes all replacement collections in the same transaction. Cancellation leaves data unchanged. An unsuccessful write rolls back both replacement and snapshot. Household editing is temporarily blocked during replacement.

Up to 12 copies are retained: the pre-upgrade dataset, compatible earlier explicit recovery data, periodic pre-change copies after a 30-minute interval and pre-restore copies. Recovery copies stay inside this browser's storage. Continue **Save backup** downloads for an independent copy that survives deleting browser data. External backup format/schema remain at 1; historical v2.100 backups are tested.

The app waits for saves before activation and again before a service-worker-triggered reload. An edit opened during activation defers reload. Pending/in-flight non-durable shared writes remain a separate block. Future Firestore integration must explicitly persist its write queue; a committed household state does not prove a cloud write is complete.

## Implementation and maintenance

- Database `nph-local-v1`, database version 1: `state` holds `current`; `snapshots` uses snapshot ID keys. State has schema 1, revision, detached household data, timestamps, writer app version and the last observed legacy value. Snapshots contain detached data, date, reason and app version.
- Startup loads/validates the authoritative record before injecting the existing classic application script. This preserves its globals/inline handlers while preventing empty default state from racing the database load. Unsupported schemas and open/migration failures show a visible startup panel; existing data is not reset.
- Every save uses a serialized transaction with a disk-revision check. Every replacement writes its prior snapshot and new state together. Runtime data is copied separately from bootstrap data and persisted objects. No storage code recalculates recipe facts or portions.
- The old `nph-kitchen-v1` and `nph-recovery-v1` text are retained for migration and older-window recovery; they are not a mirror of current saves. Do not roll back to a localStorage-only app expecting it to read new IndexedDB edits. Export the current v1 backup first if moving to a different implementation.
- Database schema migrations and backup format migrations are independent from app-release numbers. Keep historical readers/fixtures, migrate detached records deliberately and preserve IDs/references. Future database-version upgrades need explicit object-store upgrades and data migrations; a newer unknown state schema must never be treated as empty.
- `tests/storage.py` exercises all eight groups, original-data retention, transaction failures at both state/snapshot writes, stale windows, older-app writes, bounded recovery, v1 backup round trips, startup failure and an actual disposable-browser restart. `tests/storage-update-boundary.py` upgrades the real published v2.103 app into this release and verifies late saves and newly opened edits during subsequent real worker activations.
- Also run `tests/backups.py`, `tests/updates.py`, `tests/offline-289.py` and relevant shared-app regressions. All tests use local files/localhost with disposable profiles. Never point them at live phone data.

## v2.114 connection protocol

Unconnected phones retain state schema 1. Connecting upgrades the authoritative record to internal schema 2 and atomically stores household/account binding, device sequence, action groups and the durable outbox in the same state transaction. IndexedDB database version remains 1; external backup format/data schema stay 1. Earlier app code rejects a connected state instead of bypassing the queue. See firebase-sync.md for seeding, membership, retry/checkpoint handling and recovery limits.
