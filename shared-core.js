/* Household sync protocol 1. The phone store owns the durable outbox. */
(function(root){
  'use strict';
  const COLS=['stock','custom','pn','lh','food','notes','items','favs'];
  const copy=v=>JSON.parse(JSON.stringify(v));
  const empty=()=>Object.fromEntries(COLS.map(c=>[c,{}]));
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function valid(data){
    if(!data||Object.keys(data).length!==8||COLS.some(c=>!data[c]||typeof data[c]!=='object'||Array.isArray(data[c])))throw Error('Unsupported shared save. Download a backup and update NPH.');
    return data;
  }
  function changes(before,after){
    const list=[];
    for(const col of COLS)for(const id of new Set([...Object.keys(before[col]),...Object.keys(after[col])])){
      if(['__proto__','constructor','prototype'].includes(id))throw Error('Unsupported record ID.');
      if(!same(before[col][id],after[col][id]))list.push({col,id,data:Object.hasOwn(after[col],id)?copy(after[col][id]):null});
    }
    return list;
  }
  function overlay(data,queue){
    const result=copy(valid(data));
    for(const op of queue||[]){if(op.data===null)delete result[op.col][op.id];else result[op.col][op.id]=copy(op.data)}
    return result;
  }
  // Called INSIDE the same IndexedDB transaction as each household save.
  function localSync(sync,before,after,group=crypto.randomUUID()){
    if(!sync)return null;
    if(sync.protocol!==1)throw Error('Update NPH before editing this shared save.');
    if(sync.mode!=='connected'&&!same(before,after))throw Error('Finish connecting this phone before editing.');
    const result=copy(sync);
    for(const op of changes(before,after)){op.seq=++result.seq;op.group=group;result.queue.push(op)}
    return result;
  }
  class Connection{
    constructor({store,adapter,onData=()=>{},onStatus=()=>{},canApply=()=>true,validate=valid}){
      Object.assign(this,{store,adapter,onData,onStatus,canApply,validate,user:null,profile:null,error:null,busy:false,live:false,online:true,stopped:false});
      this.unlisten=null;this.pumping=false;this.task=null;this.deferred=null;this.epoch=0;
    }
    get binding(){return this.store.getSync()}
    get pending(){return this.binding?.queue.length||0}
    get locked(){const b=this.binding;return !!b&&(!this.user||b.uid!==this.user.uid||b.mode!=='connected'||this.stopped)}
    get label(){
      if(this.store.error)return 'Changes not saved';
      if(this.error)return this.error;
      if(this.locked)return this.user?'Finish connecting this phone':'Sign in to resume syncing';
      if(!this.binding)return 'Saved on this phone only';
      if(!this.online)return this.pending?'Offline · changes saved on this phone':'Offline · saved on this phone';
      if(this.pending||this.pumping)return 'Saved on this phone · syncing…';
      if(this.deferred)return 'Shared · new changes waiting for this edit to close';
      return this.live?'Shared · up to date':'Saved on this phone · connecting…';
    }
    emit(){this.onStatus(this)}
    async start(){
      return this.adapter.auth(async user=>{
        this.epoch++;this.unlisten?.();this.unlisten=null;this.live=false;this.user=user;this.profile=null;this.error=null;this.stopped=false;this.emit();
        const epoch=this.epoch;
        if(!user)return;
        try{
          const b=this.binding;
          if(b&&b.uid!==user.uid)throw Error('Sign in with the account connected to this phone.');
          this.profile=await this.adapter.profile(user.uid);
          if(epoch!==this.epoch)return;
          if(b)await this.resume();
        }catch(e){this.fail(e)}
        this.emit();
      });
    }
    fail(error){
      this.error=error.code==='permission-denied'?'Access denied. Check your sign-in and household rules.':error.message||'Sync paused. Retry when connected.';
      this.live=false;if(error.code==='permission-denied'){this.stopped=true;this.unlisten?.();this.unlisten=null}this.emit();
    }
    async action(fn){
      if(this.busy)throw Error('A connection step is already running.');
      this.busy=true;this.error=null;this.emit();
      try{return await fn()}catch(e){this.fail(e);throw e}finally{this.busy=false;this.emit()}
    }
    async create(){return this.action(async()=>{
      if(!this.user||this.binding)throw Error('Sign in before creating your household.');
      if(await this.adapter.profile(this.user.uid))throw Error('This account already has a household. Join that household instead.');
      await this.store.flush();
      const b={protocol:1,household:crypto.randomUUID(),uid:this.user.uid,client:crypto.randomUUID(),seq:0,queue:[],mode:'seeding',seed:copy(this.store.read())};
      await this.store.changeSync(b,'Before creating shared household');this.emit();await this.resume();
    })}
    async join(code){return this.action(async()=>{
      if(!this.user||this.binding)throw Error('Sign in before joining a household.');
      const invitation=this.profile?null:await this.adapter.invitation(code);
      const household=this.profile?.household||invitation.household;
      const b={protocol:1,household,uid:this.user.uid,client:crypto.randomUUID(),seq:0,queue:[],mode:'joining',code:invitation?code:null};
      await this.store.flush();await this.store.changeSync(b,'Before joining shared household');this.emit();await this.resume();
    })}
    async resume(){
      let b=this.binding;if(!b||b.uid!==this.user?.uid)return;
      if(b.mode==='seeding'){
        await this.adapter.seed(b,b.seed);
        b={...b,mode:'connected'};delete b.seed;await this.store.changeSync(b);
      }else if(b.mode==='joining'){
        if(b.code)await this.adapter.join(b.code,b.household,b.uid);
        const remote=this.validate(await this.adapter.read(b.household));
        b={...b,mode:'connected'};delete b.code;
        await this.store.changeSync(b,'Before replacing phone copy with shared household',remote);this.onData(this.store.read());
      }
      this.profile=await this.adapter.profile(b.uid);this.error=null;this.stopped=false;
      this.watch();await this.pump();
    }
    watch(){
      this.unlisten?.();const b=this.binding,epoch=this.epoch;
      this.unlisten=this.adapter.listen(b.household,data=>{
        if(epoch!==this.epoch)return;
        this.live=true;this.error=null;this.deferred=data;this.apply().catch(e=>this.fail(e));
      },error=>{if(epoch===this.epoch)this.fail(error)});
    }
    async apply(){
      if(!this.deferred||!this.canApply()||this.locked)return;
      const data=this.deferred;this.deferred=null;
      await this.store.receiveShared(this.validate(data));this.onData(this.store.read());this.emit();
    }
    async pump(){
      if(this.pumping||this.locked||!this.binding||!this.online||this.stopped)return;
      if(!this.pending&&this.live){await this.apply();return}
      this.pumping=true;this.emit();
      try{
        await this.store.flush();
        while(this.pending&&this.online&&!this.locked){
          const b=this.binding,ops=[];let keys=new Set();
          for(let i=0;i<b.queue.length;){
            const group=b.queue[i].group||b.queue[i].seq,next=[];
            while(i<b.queue.length&&(b.queue[i].group||b.queue[i].seq)===group)next.push(b.queue[i++]);
            const all=new Set([...keys,...next.map(x=>x.col+'/'+x.id)]);
            if(all.size>350){if(!ops.length)throw Error('This change is too large to sync together. Save a backup and ask for a compatibility update.');break}
            ops.push(...next);keys=all;
          }
          const upto=ops.at(-1).seq;
          // Server transaction checkpoints make a retry after a crash idempotent.
          await this.adapter.write(b,ops);
          await this.store.ackShared(upto);
        }
        if(this.online){this.deferred=await this.adapter.read(this.binding.household);this.live=true;await this.apply()}
        this.error=null;
      }catch(e){this.fail(e)}finally{
        this.pumping=false;this.emit();clearTimeout(this.retryTimer);
        if(this.pending&&this.online&&!this.stopped&&!this.locked)this.retryTimer=setTimeout(()=>this.pump(),this.error?10000:0);
      }
    }
    async invite(){return this.action(async()=>{
      if(!this.binding||!this.user)throw Error('Connect your household first.');
      const code=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
      await this.adapter.invite(this.binding.household,code);return code;
    })}
    async retry(){return this.action(async()=>{if(!this.online)throw Error('Reconnect to the internet, then retry.');await this.resume()})}
    async signOut(){
      await this.store.flush();if(this.pending&&this.binding?.uid===this.user?.uid||this.pumping||this.busy)throw Error('Let pending changes sync before signing out.');
      await this.adapter.signOut();
    }
  }
  root.NPH_SHARED={COLS,copy,empty,valid,changes,overlay,localSync,Connection};
})(globalThis);
