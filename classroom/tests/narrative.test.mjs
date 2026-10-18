import {inquire} from '../src/inquiry.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createState} from '../src/engine.mjs';
import {restore,serialize} from '../src/storage.mjs';
import * as narrative from '../src/narrative.mjs';
test('new attempts default to full story while legacy attempts resume core',()=>{
 const fresh=createState();assert.equal(fresh.journey,'full');assert.equal(fresh.version,3);
 const legacy={...fresh,version:1,phase:'load',referenceCaptured:true};delete legacy.journey;delete legacy.narrative;
 const migrated=restore(JSON.stringify(legacy));assert.equal(migrated.journey,'core');assert.equal(migrated.phase,'load');assert.equal(migrated.referenceCaptured,true);
 assert.deepEqual(restore(serialize(fresh)),fresh);
});
test('scale route needs model inspection and preserves first route',()=>{
 const s=createState();s.phase='route-lab';s.route='scale';assert.equal(narrative.canLeave(s),false);
 inquire(s,'support-test');inquire(s,'support',3);assert.equal(inquire(s,'support-test'),true);assert.equal(narrative.canLeave(s),true);assert.equal(s.route,'scale');
 assert.equal(narrative.act(s,'weigh-small',0),false);
});
test('split route requires three distinct model batches, repeat click cannot count twice',()=>{
 const s=createState();s.phase='route-lab';s.route='split';
 for(const v of [0,0,1]){inquire(s,'model-select',v);for(let i=0;i<=v;i++)inquire(s,'model-add');inquire(s,'model-read');}assert.equal(narrative.canLeave(s),false);
 inquire(s,'model-select',2);for(let i=0;i<3;i++)inquire(s,'model-add');inquire(s,'model-read');assert.equal(narrative.canLeave(s),true);assert.deepEqual(s.narrative.smallWeighed,[0,1,2]);
});
test('pond requires two distinct floating observations and an explanation',()=>{const s=createState();s.phase='observe';inquire(s,'predict','higher');for(let i=0;i<3;i++)inquire(s,'pond-add');assert.equal(narrative.canLeave(s),false);inquire(s,'pond-depth');inquire(s,'pond-sample');inquire(s,'observation','load');assert.equal(narrative.canLeave(s),false);inquire(s,'pond-remove');inquire(s,'pond-sample');inquire(s,'pond-add');assert.equal(narrative.canLeave(s),true);inquire(s,'pond-depth');assert.equal(narrative.canLeave(s),false);});
test('bad reference remains in history and can be corrected without score penalty',()=>{
 const s=createState();s.phase='reference';narrative.act(s,'reference','shore');assert.equal(narrative.canLeave(s),false);
 narrative.act(s,'reference','hull');assert.equal(narrative.canLeave(s),true);assert.deepEqual(s.narrative.referenceAttempts,['shore','hull']);
});
test('leaking substitute is rejected; stable bags and stones accepted',()=>{
 const s=createState();s.phase='materials';inquire(s,'material-select','leak');inquire(s,'material-check');inquire(s,'material-check');inquire(s,'material-use');assert.equal(narrative.canLeave(s),false);
 inquire(s,'material-select','bag');inquire(s,'material-check');inquire(s,'material-check');inquire(s,'material-use');assert.equal(narrative.canLeave(s),true);assert.equal(s.substitute,'bag');
});
test('both valid weighing orders accepted, mark after replacement rejected',()=>{
 assert.equal(narrative.validSequence(['config','elephant','mark','replace','weigh']),true);
 assert.equal(narrative.validSequence(['config','elephant','mark','weigh','replace']),true);
 assert.equal(narrative.validSequence(['config','elephant','replace','mark','weigh']),false);
 assert.equal(narrative.validSequence(['config','elephant','mark','mark','weigh']),false);
});
test('retelling and transfer both required; a changed answer revokes completion',()=>{const s=createState();s.phase='source';s.ending='E1';s.firstEnding='E1';for(const k of ['config','elephant','mark','replace','weigh'])narrative.act(s,'sequence-add',k);inquire(s,'transfer','otherboat');narrative.act(s,'source-check');assert.equal(narrative.canLeave(s),false);inquire(s,'transfer','sameboat');narrative.act(s,'source-check');assert.equal(narrative.canLeave(s),true);assert.deepEqual(restore(serialize(s)),s);inquire(s,'transfer','otherboat');assert.equal(narrative.canLeave(s),false);narrative.act(s,'sequence-undo');assert.equal(s.narrative.sequence.length,4);});
test('malformed new fields and premature terminal state are rejected',()=>{
 const s=createState();s.narrative.poolWeights=999;assert.equal(restore(serialize(s)),null);
 const t=createState();t.phase='source';assert.equal(restore(serialize(t)),null);
});
