# Private household syncing — v2.114

Firebase project: `nph-kitchen`. The public web configuration is bundled in `tools/firebase-entry.js`; no administrator credentials are needed in the app. Hosting stays at https://peterthomson9.github.io/nph/. The Firebase console project, Google provider, authorized GitHub Pages domain and Firestore database have been created by P. Console creation alone does not enable phone syncing. Deploy the reviewed `firestore.rules` before connecting phones; no production rules or household data have been changed by the local implementation/tests.

## First connection

1. Download external v1 backups on both phones. Install the reviewed app release through the existing update controls.
2. On P's phone, Settings → Shared household → Sign in with Google. Use P's own Google account. Create household → Use this phone's copy confirms the starting dataset. A pre-connection recovery copy is also retained locally.
3. Wait until Shared · up to date. Invite other phone creates a random 128-bit, single-use, 24-hour code. Expiry is measured from the server timestamp, independent of either phone's clock.
4. On N's phone, sign in with N's own Google account. Join household, paste the code, then Use shared copy. Review the replacement wording first. The existing local data becomes a recovery copy, and the shared dataset becomes authoritative on this phone. Joining never silently merges N's older plan into P's starting copy.
5. Test one reversible stock change in each direction, then an offline change and reconnection. Google popup behaviour and native installed-app behaviour still require this physical-device check; the emulator cannot verify real Google OAuth or production project configuration.

An account already linked to a household gets Use shared household after sign-in; this still requires confirmation before replacing local data. P/N labels remain local note attribution and are not account permissions. Only the owner offers invitations. A household permits two authenticated Google accounts; more devices using an existing member account can reconnect explicitly.

## Production rules

In the Firebase console for `nph-kitchen`, Firestore Database → Rules: replace the initial deny-all rules with the exact reviewed `firestore.rules`, then Publish. The default rules stay closed until this deployment. Google sign-in alone grants no access to another household. Reads/writes require membership. Invitations cannot be listed, expire after 24 hours, and are consumed in the same atomic batch as adding the second member and writing their private account pointer. Other accounts cannot add themselves, remove the owner, change the schema or reset a completed seed. Seed records cannot be read until the owner completes the upload.

There is no automatic whole-household restore in this release. Connected phones can export backups, but cannot replace shared data through a phone-only restore. Shared disaster recovery needs a separate isolated review and explicit household replacement implementation.

## Persistence and conflicts

- Household IndexedDB state and pending operations commit in one transaction. Local save failures cannot send data to Firebase. Record IDs, eight collection names, portions and stored source facts are unchanged. Backup format 1/data schema 1 remains supported; exports contain no Firebase credentials, invitations, membership or device queue.
- A connected state uses internal state schema 2 (same IndexedDB database/version). Old app code rejects that state instead of editing without an outbox. Unconnected state remains schema 1. Existing stale-window revision checks remain active.
- Each record has a durable sequence number and action group. A local event's related records are sent in one Firestore transaction (up to 350 unique records per action). An oversized action pauses visibly with its unsent data retained; it is never partly sent or silently discarded. A server checkpoint per browser installation prevents a successful write from being replayed after a crash before local acknowledgement. More independent offline groups drain in bounded transactions.
- The last successful shared write wins for the same record, using server commit order rather than phone clocks. Different record edits are retained. A deletion is a permanent tombstone until intentionally overwritten; an old listener cannot resurrect a removed record. This policy does not merge simultaneous field-level edits within the same record.
- Full collection reads occur at connection/flush reconciliation, not on every render or idle save notification. Stream snapshots with pending local writes or cache-only contents are ignored. Locally pending edits overlay remote snapshots until acknowledged. Incoming changes wait while an editor is open, and use the existing recipe/portion validator before local replacement.
- Remote changes never create Undo entries. A later remote change invalidates local Undo/Redo groups touching that record so Undo cannot reverse another phone's later work. Preferences, phone identity and remaining history stay device-local.
- Updates can reload with a durable outbox; server checkpoints make recovery safe. Connection setup still blocks activation. A failed local save or newly opened editor retains the existing update guards. The service worker caches the core and pinned Firebase SDK together with the app.

## Verification and maintenance

Install the pinned dependencies with `npm ci`; rebuild the checked-in browser bundle with `node tools/build-firebase.cjs`. `vendor/firebase.js` includes the Firebase library license notices. Node dependencies are development tools; the browser uses the checked-in bundle without a runtime CDN dependency.

`python tests/sync.py` runs Auth/Firestore emulators for **demo-nph only**, then the permission suite and two disposable persistent Brave profiles. All non-loopback browser requests are blocked. Java 21+ and Node are required. Tests cover membership, unconsumed/atomic invitations, third-account rejection, writer/record identities, checkpoint ownership, incomplete-seed access, bidirectional edits/deletion, browser restart with pending offline changes, last-successful-write conflicts, lost acknowledgement deduplication, grouped commits, local transaction failure, v1 exports, local restore guard and signed-out/wrong-account protection. Expected permission denials are test assertions.

`python tools/verify-release.py` includes these Firebase checks alongside the existing meal, backup, storage, update and offline gates. For isolated source copies only, `NPH_HISTORY_REPO` can point at the canonical checkout to read historical Git fixtures. `NODE_PATH` can select an existing local dependency install. `NPH_USE_RUNNING_EMULATORS=1` is only for a known, already-running local demo emulator. Normal releases start/stop their own emulators.

Remaining validation before real use: publish the reviewed security rules and app, exercise actual Google sign-in on both phones, seed only from P, join N, and confirm the real Firebase connection. Local tests do not prove the console region, billing settings, deployed rules or Google provider configuration. Keep external backups; sync propagates mistakes and is not an independent backup.
