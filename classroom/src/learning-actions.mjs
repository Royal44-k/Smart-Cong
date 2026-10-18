import{bridgeAction,transferFeedback}from'./transfer-bridge-state.mjs';
import{reasoningAction,resetLabReasoning,reasoningReady,storyEvidenceReady,transferReady}from'./reasoning-state.mjs';
import{measurements,saveDraft,resolveEnding}from'./engine.mjs';
import{comparePair,labReady,bookReady,activeLearning}from'./learning-state.mjs';
export const pairResult=s=>comparePair(s.learning);
const one=(v,a)=>a.includes(v),integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function move(s,p){s.phase=p;s.learning.message='';s.learning.reasoning.message='';s.learning.reasoning.mood='idle';s.inquiry.feedback='';}
export function learn(s,type,value){if(!activeLearning(s))return false;if(bridgeAction(s,type,value))return true;if(reasoningAction(s,type,value))return true;const l=s.learning,t=l.story,b=l.lab;const say=x=>l.message=x;const st=s.mode==='story';
 if(type==='hint'){l.hints[s.phase]=Math.min(3,(l.hints[s.phase]||0)+1);return true;}
 if(st){
  if(s.phase==='prologue'&&type==='look'&&one(value,['elephant','scale','boat'])){if(!t.seen.includes(value))t.seen.push(value);say({elephant:'大象扇了扇耳朵。它这么大，小秤可放不下！',scale:'秤盘小小的，秤杆细细的。得换个办法。',boat:'阿舟一上船，船就沉下一点。咦，这能帮上忙吗？'}[value]);return true;}
  if(s.phase==='observe'){
   if(type==='guess'&&t.guess===null&&one(value,['lower','higher'])){t.guess=value;t.waterSeen=[0];say('记住你的猜想。放一块木块试试吧！');return true;}
   if(type==='stone'&&t.guess!==null&&one(value,[-1,1])){t.water=Math.max(0,Math.min(4,t.water+value));if(!t.waterSeen.includes(t.water))t.waterSeen.push(t.water);say(t.water===3?'金线碰到水面啦！小木块让船回到了原来的位置。':t.water<3?'金线还在水面上方。再放一块，看看会怎样。':'金线到水面下面去了。拿走一块试试。');return true;}
  }
  if(s.phase==='mark'&&type==='line'&&one(value,['shore','wave','hull'])){t.line=value;s.calm=value==='hull';say({shore:'岸上的柱子不会跟着船升降。再找找船上的地方。',wave:'一阵风吹来，浪花跑远了。它留不住记号。',hull:'就在船身上，贴着平静的水面画一条线。船和记号一起升降，便于比较。'}[value]);return true;}
  if(s.phase==='load'){
   if(type==='cargo'&&integer(value,0,4)){l.bridge.memory='now';l.reasoning.evidence=[];l.reasoning.message='';s.cargo[value]=!s.cargo[value];if(!s.cargo[value])s.counts[value]=0;s.claimedMass=null;const m=measurements(s);say(m.aligned?'水面碰到记号啦！再看看：阿舟还在原来的地方吗？':m.difference<0?'船还浮得高一点。再试一堆，或看看谁不在船上。':'船沉过记号了。取下一堆，看看能不能对上。');if(!s.cargo[value])l.message+=' 这一堆取下了，它的称重条也先收起来。';return true;}
   if(type==='compare'&&one(value,['crew','boat','tools'])){if(!s.inquiry.configFound.includes(value))s.inquiry.configFound.push(value);say(value==='crew'?(s.crewPresent?'阿舟已经回到船上了。两次的人一样。':'找到了！刚才阿舟在船上，现在他提着秤站在岸上。'):'这一样没有变。再看看阿舟站在哪里。');return true;}
   if(type==='crew'){l.bridge.memory='now';l.reasoning.evidence=[];l.reasoning.message='';s.crewPresent=!s.crewPresent;s.claimedMass=null;say(s.crewPresent?'“我回来啦！”阿舟上了船。别忘了再看水线。':'阿舟又回到了岸上。船轻了一些。');return true;}
  }
  if(s.phase==='ledger'){
   if(type==='weigh'&&integer(value,0,4)&&s.cargo[value]){s.inquiry.weighed[value]=true;t.stamp=value;s.inquiry.activeBatch=value;say('阿舟分几次称好这一堆。拿到称重条了，把它贴到同样的图案下面。');return true;}
   if(type==='stamp'&&integer(value,0,4)){t.stamp=value;return true;}
   if(type==='paste'&&integer(value,0,4)){if(t.stamp===null||!s.inquiry.weighed[t.stamp])say('先请阿舟称一堆，拿到称重条。');else if(t.stamp!==value)say('看看两个图案：这张称重条属于另一堆。再找一找。');else if(!s.cargo[value])say('这一堆不在船上，不用贴到这次记录里。');else{s.counts[value]=1;say('贴好啦！一堆石头，一张称重条，不会漏，也不会重。');}return true;}
  }
  if(s.phase==='report'&&type==='reason'&&one(value,['total','appearance'])){s.inquiry.reportReason=value;s.claimedMass=measurements(s).recordedMass;s.accountCrew=false;say(value==='total'?'你的理由记下了。再看看人和物有没有变，就可以讲给大家听。':'你的想法记下了。形状像，就一定一样重吗？可以回船边再看一眼。');return true;}
  if(s.phase==='ending'&&type==='next-check'&&one(value,['people','record','water'])){t.endingPlan=value;say('记下了。下次就从这里开始找。');return true;}
  if(s.phase==='source'){
   if(type==='book-add'&&one(value,['elephant','mark','replace','weigh'])&&!t.book.includes(value)){t.book.push(value);return true;}
   if(type==='word'&&one(value,['sink','rise','elephant','both'])){const k=one(value,['sink','rise'])?'motion':'object';t.words[k]=value;say(value==='sink'?'对，石头多了，船身慢慢下沉。':value==='elephant'?'对，同一艘船，两次的阿舟和船桨都一样，石头替代的是大象。':value==='rise'?'想想刚才玩小船：多放一块，金线向哪里动？':'船还在呀。石头替代的是下了船的谁？');return true;}
   if(type==='book-undo'){t.book.pop();return true;}
  }
 }else{
  if(s.phase==='prologue'){
   if(type==='question'&&one(value,['mass','crew','bottom'])){resetLabReasoning(l);b.question=value;b.weight=value==='bottom'?3:1;b.crew=false;b.free=true;b.hypothesis=null;b.plan=null;b.samples={A:null,B:null};b.finding=null;return true;}
   if(type==='hypothesis'&&b.question&&b.hypothesis===null&&one(value,['lower','same','higher'])){b.hypothesis=value;return true;}
   if(type==='plan'&&one(value,['one','many'])){b.plan=value;say(value==='many'?'两项一起变，就很难知道是谁起了作用。想一想，怎样只检查一件事？':'留下其他条件，只改变你要研究的一项。接下来由你安排两次试验。');return true;}
  }
  if(s.phase==='observe'){
   if(type==='restore-sample'&&one(value,['A','B'])&&b.samples[value]){Object.assign(b,{...b.samples[value]});say('已照'+value+'栏摆好小船。A、B记录都没有改；可以接着调整，再决定要不要记入。');return true;}
   if(type==='bench-weight'&&integer(value,1,5)){b.weight=value;return true;}
   if(type==='bench-crew'){b.crew=!b.crew;return true;}
   if(type==='bench-depth'){b.free=!b.free;return true;}
   if(type==='sample'&&one(value,['A','B'])){resetLabReasoning(l);b.samples[value]={weight:b.weight,crew:b.crew,free:b.free};b.finding=null;say('已记入'+value+'栏。'+comparePair(l).message);return true;}
   if(type==='finding'&&one(value,['changes','same'])){b.finding=value;say(!comparePair(l).valid?comparePair(l).message:!reasoningReady(l)?'先说清A、B的变化，再回看你的猜想。':value==='changes'?'你用两次记录解释了变化。可以把发现带到大船上了。':'把A和B的船身位置比一比，再说说有什么变化。');return true;}
  }
  if(s.phase==='source'){
   if(type==='transfer-number'&&typeof value==='string'){b.transferNumber=/^\d{0,4}$/.test(value)?value:'';return true;}
   if(type==='transfer-reason'&&one(value,['subtract','add'])){b.transferReason=value;return true;}
  }
 }
 if(type==='continue'){
  if(st){switch(s.phase){case'prologue':if(t.seen.includes('elephant')&&t.seen.includes('scale'))move(s,'observe');else say('看看大象，再看看秤。找出称不下的原因。');break;case'observe':if(t.guess!==null&&t.water===3&&t.waterSeen.some(n=>n!==3)){s.calm=false;move(s,'mark');}else say('先猜一猜，再动手。让金线回到水面，才知道能不能这样比。');break;case'mark':if(t.line==='hull'){s.referenceCaptured=true;s.calm=true;s.balanced=true;s.free=true;s.crewPresent=false;move(s,'load');}else say('找一个能跟着船升降的地方，留住水面的位置。');break;case'load':if(measurements(s).aligned)move(s,'ledger');else say('水面还没碰到记号。再调整船上的石头。');break;case'ledger':move(s,'report');break;case'ending':move(s,'source');break;case'source':if(bookReady(l))move(s,'reflect');else say(t.book.join(',')!=='elephant,mark,replace,weigh'?'先让象上船，再画记号。试着把图按事情发生的顺序排一排。':'图排好了，还要给两句话选上合适的词。');break;default:return false;}}
  else{switch(s.phase){case'prologue':if(b.question&&b.hypothesis&&b.plan==='one')move(s,'observe');else say('选好问题，留下猜想，再想好怎样比较。');break;case'observe':if(labReady(l)){if(b.history.length>=12)b.history.shift();b.history.push({question:b.question,A:{...b.samples.A},B:{...b.samples.B},valid:true});s.calm=false;s.balanced=false;s.free=false;move(s,'mark');}else say(comparePair(l).valid?(!reasoningReady(l)?'看过A、B，选出船位的变化，再看看要不要修改最初猜想。':'两次记录有了，还要说说它们告诉了你什么。'):comparePair(l).message);break;case'source':if(transferReady(l)&&Number(b.transferNumber)===300&&b.transferReason==='subtract')move(s,'reflect');else say(transferFeedback(l));break;default:return false;}}
  return true;
 }
 if(st&&s.phase==='report'&&one(type,['finish','defer'])){if(type==='finish'&&!storyEvidenceReady(l)){say('先翻看船、水线和阿舟这三条线索，再讲你的办法。');return true;}if(type==='finish'&&s.inquiry.reportReason===null){say('先选一句话，说说你为什么这样想。');return true;}if(type==='finish'){s.claimedMass=measurements(s).recordedMass;s.accountCrew=false;saveDraft(s);}s.ending=resolveEnding(s,type==='finish');s.firstEnding??=s.ending;move(s,'ending');return true;}
 if(st&&one(type,['back-load','back-ledger','back-report'])&&one(s.phase,['ledger','report','ending'])){move(s,{'back-load':'load','back-ledger':'ledger','back-report':'report'}[type]);return true;}
 return false;
}
