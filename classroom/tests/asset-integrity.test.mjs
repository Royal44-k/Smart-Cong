import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {media} from '../src/media.mjs';
const json=async f=>JSON.parse((await readFile(f,'utf8')).replace(/^\uFEFF/,''));
test('adopted files, runtime bindings and shot references resolve to actual image assets',async()=>{
 const catalog=await json('media/catalog.json'),shots=await json('media/shots.json');assert.equal(catalog.assets.length,17);assert.equal(new Set(catalog.assets.map(a=>a.id)).size,17);assert.equal(shots.length,19);
 for(const a of catalog.assets){const data=await readFile('media/'+a.file);assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),a.width);assert.equal(data.readUInt32BE(20),a.height);assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256);}
 for(const m of Object.values(media)){assert.ok((await stat(m.image)).size>1000);assert.ok(shots.some(s=>s.id===m.shot));assert.equal(m.video,null);}
 for(const s of shots)assert.ok(catalog.assets.some(a=>a.file===s.imageFile));
});
test('every shot has truthful receipt status and monotonic subtitles within target duration',async()=>{
 const shots=await json('media/shots.json');for(const s of shots){assert.equal(s.videoReceived,false);assert.equal(s.audioReceived,true);assert.ok((await stat('media/'+s.expectedAudio)).size>1000);const text=await readFile('media/'+s.captionFile,'utf8');assert.match(text,/^WEBVTT/);assert.match(text,/朗读音轨/);const times=[...text.matchAll(/00:(\d\d):(\d\d)\.(\d{3}) --> 00:(\d\d):(\d\d)\.(\d{3})/g)].map(m=>[60*Number(m[1])+Number(m[2])+Number(m[3])/1000,60*Number(m[4])+Number(m[5])+Number(m[6])/1000]);assert.equal(times.length,2);let end=0;for(const [a,b]of times){assert.ok(a>=end&&b>a&&b<=s.seconds);end=b;}}
});

test('19 dialogue tracks are real aligned PCM audio with two matching spoken cues',async()=>{const m=await json('media/audio/manifest.json');assert.equal(m.tracks.length,19);for(const t of m.tracks){const b=await readFile(t.file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt32LE(4)+8,b.length);assert.equal(createHash('sha256').update(b).digest('hex'),t.sha256);assert.equal(t.channels,1);assert.equal(t.bits,16);assert.ok(t.duration>3&&t.duration<20);assert.equal(t.cues.length,2);assert.ok(t.cues[0].end<t.cues[1].start);assert.ok(t.cues[1].end<t.duration);for(const c of t.cues)assert.ok((await stat(c.file)).size>1000);}});
