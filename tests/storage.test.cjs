/* Run: node tests/storage.test.cjs — no dependencies required. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function setup(initial = {}, failWrites = false) {
  const data = new Map(Object.entries(initial));
  const listeners = {};
  const ctx = {structuredClone, Set, JSON, Date, Number, Event: class {constructor(type){this.type=type;}},
    localStorage: {getItem:key=>data.get(key)??null,setItem:(key,value)=>{if(failWrites)throw Error('QuotaExceeded');data.set(key,value);},removeItem:key=>data.delete(key)},
    document: {getElementById:()=>null}, addEventListener:(type,fn)=>{listeners[type]=fn;},dispatchEvent:()=>{}};
  ctx.window=ctx;
  vm.createContext(ctx);
  ['data.js','store.js'].forEach(name=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),ctx));
  return {store:ctx.AFH.store,data,listeners};
}
const plan={name:'Aman',interest:'Digital skills',level:'Undergraduate',start:'2026-11-17',hours:5,goal:'Build and explain my first accessible website.'};
test('empty storage works and valid state survives a fresh load',()=>{const a=setup();assert.equal(a.store.get().saved.length,0);assert.equal(a.store.update(s=>{s.saved=['cs50'];s.plan=plan;s.milestones=[0];}),true);const b=setup(Object.fromEntries(a.data));assert.equal(b.store.get().plan.hours*4,20);assert.equal(b.store.get().saved[0],'cs50');assert.equal(b.store.get().milestones[0],0);});
test('Endterm favorites migrate without unknown or duplicate IDs',()=>{const a=setup({'afh-saved':JSON.stringify(['cs50','cs50','unknown'])});assert.deepEqual(Array.from(a.store.get().saved),['cs50']);});
test('malformed JSON and wrong schema do not crash',()=>{assert.equal(setup({'afh-final-v1':'not json'}).store.get().saved.length,0);assert.equal(setup({'afh-final-v1':'[]'}).store.get().plan,null);assert.equal(setup({'afh-final-v1':JSON.stringify({version:1,saved:'bad',sessions:[null,{}],plan:{}})}).store.get().sessions.length,0);});
test('quota failure does not falsely commit state',()=>{const a=setup({},true);assert.equal(a.store.update(s=>{s.saved=['cs50'];}),false);assert.equal(a.store.get().saved.length,0);});
test('state snapshots cannot mutate persistent data',()=>{const a=setup();a.store.get().saved.push('cs50');assert.equal(a.store.get().saved.length,0);});
test('strict backup validation rejects foreign, malformed and invalid data',()=>{const a=setup();for(const raw of [{},{app:'Other',version:1,data:a.store.blank()},{app:'Afghan Future Hope',version:1,data:{...a.store.blank(),saved:['evil']}},{app:'Afghan Future Hope',version:1,data:{...a.store.blank(),plan:{...plan,hours:-1}}}])assert.throws(()=>a.store.validateBackup(raw));});
test('round-trip export/import preserves plan, sessions and derived totals',()=>{const a=setup();a.store.update(s=>{s.plan=plan;s.saved=['cs50','khan'];s.sessions=[{id:'session-1',date:'2026-11-17',minutes:60,note:'Completed a programming lesson.'},{id:'session-2',date:'2026-11-17',minutes:30,note:'Reviewed the practice problems.'}];s.readiness=[0,1];});const backup=JSON.parse(JSON.stringify({app:'Afghan Future Hope',version:1,data:a.store.get()}));const b=setup();assert.equal(b.store.replace(b.store.validateBackup(backup)),true);assert.equal(b.store.get().sessions.reduce((sum,s)=>sum+s.minutes,0),90);assert.equal(b.store.get().readiness.length,2);});
test('real calendar dates, session ranges and plan constraints are checked',()=>{const a=setup();assert.equal(a.store.dateValid('2026-02-30'),false);assert.equal(a.store.dateValid('2024-02-29'),true);assert.equal(a.store.planValid({...plan,hours:2.5}),false);assert.equal(a.store.sessionValid({id:'a',date:'2026-11-17',minutes:7,note:'Test note'}),false);});
test('delete-all also clears legacy favorites, so they cannot reappear',()=>{const a=setup({'afh-saved':'["cs50"]'});a.store.update(s=>{s.plan=plan;});assert.equal(a.store.reset(),true);const b=setup(Object.fromEntries(a.data));assert.equal(b.store.get().saved.length,0);assert.equal(b.store.get().plan,null);});
test('cross-tab changes update the local state',()=>{const a=setup();a.listeners.storage({key:'afh-final-v1',newValue:JSON.stringify({...a.store.blank(),saved:['cs50']})});assert.equal(a.store.get().saved[0],'cs50');a.listeners.storage({key:'afh-final-v1',newValue:null});assert.equal(a.store.get().saved.length,0);});
