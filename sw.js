/* NPH app-file updates. Never clear localStorage, IndexedDB or non-NPH caches. */
const VERSION="nph-2.117", APP_VERSION="2.117";
const CORE=["./shared-core.js","./vendor/firebase.js","./index.html","./release.json","./manifest.webmanifest","./icons/icon-180.png?v=ffd59f706c53","./icons/logo.svg","./icons/icon-192.png?v=7edc0bdd41e1","./icons/icon-512.png?v=3ba3462d8f90","./icons/maskable-512.png?v=e606a5c9a685"];
const absolute=path=>new URL(path,self.location).href;
const ownRelease=key=>/^nph-\d/.test(key);
self.addEventListener("install",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  if(keys.includes(VERSION)&&self.registration.active)throw Error("Every release must use a new version.");
  const existing=keys.filter(k=>ownRelease(k)&&k!==VERSION);
  let updateAware=false;
  for(const key of existing){const response=await (await caches.open(key)).match(absolute("./release.json"));if(response){try{if((await response.json()).updateProtocol===1)updateAware=true}catch(_){}}}
  const legacyTransition=!!self.registration.active&&!updateAware;
  try{
    const cache=await caches.open(VERSION);
    await cache.addAll(CORE.map(url=>new Request(absolute(url),{cache:"reload"})));
    const release=await (await cache.match(absolute("./release.json"))).json();
    const html=await (await cache.match(absolute("./index.html"))).text();
    if(release.version!==APP_VERSION||release.updateProtocol!==1||!html.includes(`const NPH_V=window.NPH_VERSION||"${APP_VERSION}";`))throw Error("Incomplete release; keeping the installed app.");
    if(legacyTransition)await cache.put(absolute("./__legacy_transition__"),new Response("1"));
    // Only old installations lacking update controls bypass the waiting phase.
    // They keep their current page until reopened, except an explicit transition link.
    if(legacyTransition)await self.skipWaiting();
  }catch(error){await caches.delete(VERSION);throw error}
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  const legacyTransition=!!(await (await caches.open(VERSION)).match(absolute("./__legacy_transition__")));
  if(legacyTransition)for(const client of clients){
    const url=new URL(client.url),scope=new URL(self.registration.scope);
    // Do not await navigation inside activation: its fetch may need activation to finish.
    if(url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)&&url.searchParams.get("nph-update")==="1")client.navigate(client.url).catch(()=>{});
  }
  // Release caches contain only app files. Other sites, fonts and all saved data stay intact.
  await Promise.all((await caches.keys()).filter(k=>ownRelease(k)&&k!==VERSION).map(k=>caches.delete(k)));
})()));
self.addEventListener("message",event=>{
  if(event.data==="skipWaiting")event.waitUntil(self.skipWaiting());
  if(event.data?.type==="NPH_VERSION")event.ports[0]?.postMessage({version:APP_VERSION});
});
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);if(request.method!=="GET")return;
  if(["fonts.googleapis.com","fonts.gstatic.com"].includes(url.hostname)){
    event.respondWith((async()=>{const cache=await caches.open("nph-fonts"),hit=await cache.match(request);if(hit)return hit;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response})());return;
  }
  if(url.origin!==self.location.origin)return;
  if(url.pathname===new URL("./release.json",self.location).pathname){event.respondWith(fetch(request,{cache:"no-store"}));return}
  event.respondWith((async()=>{
    const cache=await caches.open(VERSION),hit=await cache.match(request.mode==="navigate"?absolute("./index.html"):request,{ignoreSearch:true});
    return hit||fetch(request);
  })());
});
