/* npm ci; node tools/build-firebase.cjs. SDK versions are pinned in package-lock.json. */
require('esbuild').buildSync({entryPoints:['tools/firebase-entry.js'],bundle:true,minify:true,format:'iife',globalName:'NphFirebase',outfile:'vendor/firebase.js',legalComments:'eof'});
console.log('Built vendor/firebase.js from pinned Firebase dependencies.');
