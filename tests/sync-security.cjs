/* Run with local demo-nph emulator; never runs against a real project. */
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,getDocs,collection,writeBatch,serverTimestamp,Timestamp}=require('firebase/firestore');
const fs=require('node:fs');require('firebase/firestore').setLogLevel('silent');
(async()=>{
 const env=await initializeTestEnvironment({projectId:'demo-nph',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.rules','utf8')}});
 await env.clearFirestore();
 const google={firebase:{sign_in_provider:'google.com'},email_verified:true};
 const P=env.authenticatedContext('P',google).firestore(),N=env.authenticatedContext('N',google).firestore(),X=env.authenticatedContext('X',google).firestore(),anon=env.unauthenticatedContext().firestore();
 const h=db=>doc(db,'households','test-house'),i=(db,code='a'.repeat(32))=>doc(db,'invites',code);
 let count=0;async function yes(p){await assertSucceeds(p);count++}async function no(p){await assertFails(p);count++}
 await no(setDoc(h(anon),{owner:'P',members:{P:true},schema:1,ready:false,createdAt:serverTimestamp()}));
 await yes(setDoc(h(P),{owner:'P',members:{P:true},schema:1,ready:false,createdAt:serverTimestamp()}));
 await no(getDoc(h(X)));
 await no(getDocs(collection(P,'households','test-house','records')));
 const row={schema:1,col:'notes',id:'test',value:{text:'seed'},deleted:false,writer:'P',at:serverTimestamp()};
 await yes(setDoc(doc(P,'households','test-house','records','notes!test'),row));
 const ready=writeBatch(P);ready.update(h(P),{ready:true});ready.set(doc(P,'users','P'),{household:'test-house'});await yes(ready.commit());
 await no(getDocs(collection(X,'households','test-house','records')));await no(getDocs(collection(anon,'households','test-house','records')));
 await no(setDoc(h(N),{owner:'P',members:{P:true,N:true},schema:1,ready:true}));
 await yes(setDoc(i(P),{household:'test-house',owner:'P',createdAt:serverTimestamp(),joinedUid:null}));
 await no(getDocs(collection(N,'invites')));
 const join=writeBatch(N);join.update(h(N),{'members.N':true,invite:'a'.repeat(32)});join.update(i(N),{joinedUid:'N'});join.set(doc(N,'users','N'),{household:'test-house'});await yes(join.commit());
 await yes(getDocs(collection(N,'households','test-house','records')));
 const third=writeBatch(X);third.update(h(X),{'members.X':true,invite:'a'.repeat(32)});third.update(i(X),{joinedUid:'X'});await no(third.commit());
 await no(setDoc(doc(N,'households','test-house','records','notes!test'),row));
 await no(setDoc(doc(N,'households','test-house','records','notes!other'),{...row,writer:'N'}));
 await yes(setDoc(doc(N,'households','test-house','records','notes!test'),{...row,writer:'N',value:null,deleted:true}));
 await yes(setDoc(doc(P,'households','test-house','clients','client-p'),{uid:'P',seq:5}));
 await no(setDoc(doc(N,'households','test-house','clients','client-p'),{uid:'N',seq:6}));
 await no(setDoc(doc(P,'households','test-house','clients','client-p'),{uid:'P',seq:4}));
 const undoReady=writeBatch(P);undoReady.update(h(P),{ready:false});await no(undoReady.commit());
 await no(getDoc(doc(N,'users','P')));
 console.log(`PASS: ${count} Firebase permission checks (Google accounts, membership, atomic invite, third-account rejection, record identity, checkpoint ownership, tombstones)`);
 await env.cleanup();
})().catch(e=>{console.error(e);process.exitCode=1});
