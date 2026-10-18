import{blankPeer}from'./peer-state.mjs';
import{blankBridge}from'./transfer-bridge-state.mjs';
import{blankWorkshop}from'./workshop-state.mjs';
import{blankReasoning}from'./reasoning-state.mjs';
import{blankPlay}from'./play-state.mjs';
import {blankLearning,validLearning} from './learning-state.mjs';
import {blankInquiry,validInquiry} from './inquiry.mjs';
import {blankNarrative,validNarrative} from './narrative.mjs';
import {createState,PHASES,ISSUE_TEXT} from './engine.mjs';
export const STORAGE_KEY='caochong-waterline-v1';
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const arr=(x,n,fn)=>Array.isArray(x)&&x.length===n&&x.every(fn);
const bool=x=>typeof x==='boolean';
const counts=x=>arr(x,5,n=>Number.isInteger(n)&&n>=0&&n<=2);
const mass=x=>x===null||(Number.isInteger(x)&&x>=0&&x<=10000);
const ending=x=>x===null||['E1','E2','E3','E4'].includes(x);
export function serialize(s){return JSON.stringify(s);}
export function restore(raw) {
 try{
  if(typeof raw!=='string'||raw.length>200000)return null;
  const s=JSON.parse(raw);
  if(isObject(s)&&s.version===1){s.version=2;s.journey='core';s.narrative=blankNarrative();}
  if(isObject(s)&&s.version===2){s.version=3;s.inquiry=blankInquiry();s.inquiry.prediction=s.narrative?.poolPrediction??null;if(s.narrative?.sourceChecked)s.narrative.sourceChecked=false;s.inquiry.weighed=s.cargo?.map(Boolean)??[false,false,false,false,false];}
  if(!isObject(s)||s.version!==3||!['story','lab'].includes(s.mode)||!PHASES.includes(s.phase))return null;
  if(s.version===3&&s.inquiry&&!Object.hasOwn(s.inquiry,'pondEvidence')&&Array.isArray(s.inquiry.trials))s.inquiry.pondEvidence=[...new Set(s.inquiry.trials.filter(t=>t.free===true&&Number.isInteger(t.weight)&&t.weight>=0&&t.weight<=4).map(t=>t.weight))];
  if(!Object.hasOwn(s,'learning'))s.learning=blankLearning(false);
  if(s.learning&&!Object.hasOwn(s.learning,'revision')){s.learning.revision=2;if(s.learning.story)s.learning.story.words={motion:null,object:null};}
  if(s.learning?.revision===2){s.learning.revision=3;s.learning.play=blankPlay();}
  if(s.learning?.revision===3){s.learning.revision=4;s.learning.reasoning=blankReasoning(false);}
  if(s.learning?.revision===4){s.learning.revision=5;s.learning.workshop=blankWorkshop();}
  if(s.learning?.revision===5){s.learning.revision=6;s.learning.bridge=blankBridge();}
  if(s.learning?.revision===6){s.learning.revision=7;s.learning.peer=blankPeer();}
  if(!validLearning(s.learning))return null;
  if(!validInquiry(s.inquiry))return null;
  if(s.narrative?.sourceChecked&&s.inquiry.transfer!=='sameboat')return null;
  if(!['full','core'].includes(s.journey)||!validNarrative(s.narrative))return null;
  if(![null,'scale','split'].includes(s.route)||!['stone','bag'].includes(s.substitute))return null;
  if(!arr(s.cargo,5,bool)||!counts(s.counts)||!mass(s.claimedMass))return null;
  if(!['referenceCaptured','crewPresent','calm','balanced','free','accountCrew','sound'].every(k=>bool(s[k])))return null;
  if(!ending(s.firstEnding)||!ending(s.ending)||!arr(s.reflections,3,x=>typeof x==='string'&&x.length<=2000))return null;
  if(['ending','source','reflect'].includes(s.phase)&&!s.ending)return null;
  if(s.ending&&!s.firstEnding)return null;
  if(!Array.isArray(s.drafts)||s.drafts.length>100||!s.drafts.every(d=>isObject(d)&&typeof d.at==='string'&&d.at.length<50&&mass(d.claimedMass)&&arr(d.cargo,5,bool)&&counts(d.counts)&&bool(d.crewPresent)&&bool(d.accountCrew)&&Array.isArray(d.issues)&&d.issues.every(k=>Object.hasOwn(ISSUE_TEXT,k))))return null;
  if(!Array.isArray(s.trail)||s.trail.length>500||!s.trail.every(t=>isObject(t)&&typeof t.text==='string'&&t.text.length<=500&&typeof t.at==='string'&&t.at.length<50))return null;
  return Object.fromEntries(Object.keys(createState()).map(k=>[k,s[k]]));
 }catch{return null;}
}
export function persist(storage,s){try{storage.setItem(STORAGE_KEY,serialize(s));return true;}catch{return false;}}



