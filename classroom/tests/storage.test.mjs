import test from 'node:test';
import assert from 'node:assert/strict';
const e=await import('../src/engine.mjs').catch(()=>({}));
const storage=await import('../src/storage.mjs').catch(()=>({}));
test('storage API exists',()=>assert.equal(typeof storage.restore,'function'));
test('round trip preserves learning evidence',()=>{const s=e.createState('lab');s.phase='load';s.reflections[0]='同样的船，也要核对人。';s.firstEnding='E4';const r=storage.restore(storage.serialize(s));assert.equal(r.phase,'load');assert.equal(r.reflections[0],s.reflections[0]);assert.equal(r.firstEnding,'E4');});
test('damaged and foreign records restore no state',()=>{for(const raw of ['{','null','{}','[]','{"version":99}'])assert.equal(storage.restore(raw),null);});
test('unsafe numeric and state values are rejected',()=>{for(const patch of [{phase:'<img>'},{cargo:[true]},{counts:[-1,0,0,0,0]},{mode:'unknown'},{claimedMass:-10},{firstEnding:'E99'},{calm:'yes'}]){const s={...e.createState('lab'),...patch};assert.equal(storage.restore(JSON.stringify(s)),null);}});
test('unavailable browser storage is reported without throwing',()=>{const result=storage.persist({setItem(){throw new Error('denied')}},e.createState('story'));assert.equal(result,false);});


test('ending without a first-ending history is damaged',()=>{const s=e.createState('lab');s.phase='reflect';s.ending='E1';s.firstEnding=null;assert.equal(storage.restore(JSON.stringify(s)),null);});
