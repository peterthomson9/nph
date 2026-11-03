/* Bundle with esbuild; vendor/firebase.js is a pinned offline app asset. */
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithCredential,signOut,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,doc,collection,getDocFromServer,getDocsFromServer,runTransaction,writeBatch,onSnapshot,serverTimestamp,Timestamp,connectFirestoreEmulator} from 'firebase/firestore';

const CONFIG={apiKey:'AIzaSyBiJp8LejU1GG6cHe2myCcuTmGvpHyEWm0',authDomain:'nph-kitchen.firebaseapp.com',projectId:'nph-kitchen',storageBucket:'nph-kitchen.firebasestorage.app',messagingSenderId:'73141194867',appId:'1:73141194867:web:cef5633b940048762e1a06'};
export function make(){
  const testing=location.hostname==='127.0.0.1'&&globalThis.NPH_TEST_EMULATORS===true;
  const app=initializeApp(testing?{...CONFIG,projectId:'demo-nph',apiKey:'demo-key',authDomain:'demo-nph.firebaseapp.com'}:CONFIG);
  const auth=getAuth(app),db=getFirestore(app);
  if(testing){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080)}
  const house=h=>doc(db,'households',h),user=u=>doc(db,'users',u),invite=c=>doc(db,'invites',c);
  const key=(col,id)=>{
    if(!id||id.includes('/')||new TextEncoder().encode(col+'!'+id).length>1400)throw Error('A saved item has an unsupported shared ID. Keep your backup and ask for a compatibility update.');
    return col+'!'+id;
  };
  const record=(h,col,id)=>doc(db,'households',h,'records',key(col,id));
  const envelope=op=>({schema:1,col:op.col,id:op.id,value:op.data,deleted:op.data===null,writer:auth.currentUser.uid,at:serverTimestamp()});
  function decode(snap){
    const data=NPH_SHARED.empty();
    for(const row of snap.docs){
      const r=row.data();
      if(r.schema!==1||!NPH_SHARED.COLS.includes(r.col)||typeof r.id!=='string'||typeof r.deleted!=='boolean'||!Object.hasOwn(r,'value')||['__proto__','constructor','prototype'].includes(r.id)||row.id!==key(r.col,r.id))throw Error('This shared save needs a newer compatible NPH version.');
      if(!r.deleted)data[r.col][r.id]=r.value;
    }
    return NPH_SHARED.valid(data);
  }
  async function check(h){const s=await getDocFromServer(house(h));if(!s.exists()||s.data().schema!==1||s.data().ready!==true)throw Error('The starting household upload is not complete yet. Retry on the main phone first.');return s.data()}
  return {
    ...(testing?{testSignIn:async name=>{const token='eyJhbGciOiJub25lIn0.'+btoa(JSON.stringify({sub:name,email:name+'@example.test',email_verified:true,name}))+'.';return signInWithCredential(auth,GoogleAuthProvider.credential(token))}}:{}),
    auth:fn=>onAuthStateChanged(auth,fn),
    signIn:()=>signInWithPopup(auth,new GoogleAuthProvider()),signOut:()=>signOut(auth),
    profile:async uid=>{const s=await getDocFromServer(user(uid));if(!s.exists())return null;const h=await getDocFromServer(house(s.data().household));return {...s.data(),owner:h.exists()&&h.data().owner===uid}},
    async seed(b,data){
      const ops=NPH_SHARED.changes(NPH_SHARED.empty(),data);ops.forEach(op=>{key(op.col,op.id);if(new TextEncoder().encode(JSON.stringify(op.data)).length>800000)throw Error('A saved item is too large to share. Save a backup before continuing.')});
      const already=await runTransaction(db,async tx=>{
        const s=await tx.get(house(b.household));
        if(s.exists()){if(s.data().owner!==b.uid||s.data().schema!==1)throw Error('This household cannot be initialised from this account.');return s.data().ready}
        tx.set(house(b.household),{owner:b.uid,members:{[b.uid]:true},schema:1,ready:false,createdAt:serverTimestamp()});return false;
      });
      if(already)return;
      for(let n=0;n<ops.length;n+=50){const batch=writeBatch(db);for(const op of ops.slice(n,n+50))batch.set(record(b.household,op.col,op.id),envelope(op));await batch.commit()}
      const batch=writeBatch(db);batch.update(house(b.household),{ready:true});batch.set(user(b.uid),{household:b.household});await batch.commit();
    },
    async invitation(code){
      if(!/^[a-f0-9]{32}$/.test(code))throw Error('Paste the complete 32-character invitation code.');
      const s=await getDocFromServer(invite(code));
      if(!s.exists()||s.data().joinedUid&&s.data().joinedUid!==auth.currentUser.uid)throw Error('This invitation has expired or has already been used. Ask the main phone for a new code.');
      return s.data();
    },
    async join(code,h,uid){const batch=writeBatch(db);batch.update(house(h),{['members.'+uid]:true,invite:code});batch.update(invite(code),{joinedUid:uid});batch.set(user(uid),{household:h});await batch.commit()},
    async read(h){await check(h);return decode(await getDocsFromServer(collection(db,'households',h,'records')))},
    listen(h,fn,fail){return onSnapshot(collection(db,'households',h,'records'),{includeMetadataChanges:true},snap=>{
      if(snap.metadata.fromCache||snap.metadata.hasPendingWrites)return;
      try{fn(decode(snap))}catch(e){fail(e)}
    },fail)},
    async write(b,ops){
      const checkpoint=doc(db,'households',b.household,'clients',b.client),upto=ops.at(-1).seq;
      const latest=new Map();for(const op of ops)latest.set(key(op.col,op.id),op);
      await runTransaction(db,async tx=>{
        const state=await tx.get(checkpoint),ack=state.exists()?state.data().seq:0;
        if(ack>=upto)return;
        for(const op of latest.values())if(op.seq>ack)tx.set(record(b.household,op.col,op.id),envelope(op));
        tx.set(checkpoint,{uid:b.uid,seq:upto});
      });
    },
    async invite(h,code){
      const root=await check(h);if(root.owner!==auth.currentUser.uid)throw Error('Create invitations on the phone that started this household.');
      if(Object.keys(root.members).length>=2)throw Error('Both household accounts are already connected.');
      const batch=writeBatch(db);batch.set(invite(code),{household:h,owner:auth.currentUser.uid,joinedUid:null,createdAt:serverTimestamp()});await batch.commit();
    }
  };
}
