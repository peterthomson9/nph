/* NPH offline cache. The version below changes with every update, which is what tells phones there's a new version. */
const VERSION="nph-1.1";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=="nph-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting()});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  if(u.hostname.endsWith("fonts.googleapis.com")||u.hostname.endsWith("fonts.gstatic.com")){
    e.respondWith(caches.open("nph-fonts").then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>hit))));return}
  if(u.origin!==location.origin)return;
  if(e.request.mode==="navigate"){e.respondWith(caches.match("./index.html").then(hit=>hit||fetch(e.request)));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request)));
});
