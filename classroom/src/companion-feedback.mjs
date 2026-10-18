import{splitFeedback}from'./transfer-bridge-state.mjs';
import{reasoningReady}from'./reasoning-state.mjs';
import{measurements}from'./engine.mjs';
import{comparePair}from'./learning-state.mjs';
const answer=(mood,text)=>({mood,text});
const guides={
 start:'你好！选好一条学习路线，我们就出发。',prologue:'先仔细看，再把你的想法留下来。',idea:'大象这么大，可以怎样把难题变小呢？',
 'route-lab':'动手试一试，看看你的办法能不能用。',observe:'先猜一猜，再动手。留意船身和水面的位置。',reference:'记号要留在船身上，才能跟着船一起升降。',
 mark:'先让船停稳。看看船底，等水面平静，再留下记号。',materials:'选一样可以分开称的东西，来替代大象。',
 load:'每放上一堆，都看看水线。还要看看阿舟站在哪里。',ledger:'一堆一堆称，一次一次记。别漏记，也别多记。',
 review:'把两次船上的人和物对一对。哪里变了？',report:'你的记录能说明什么？把理由也讲清楚。',ending:'把这次的发现记下来，还可以回船边再试。',
 source:'照事情发生的顺序，把四张图排一排。',reflect:'把自己的发现讲给同桌听。也听听他是怎样想的。'
};
export function hintFor(s){
 if(s.mode==='lab'&&s.journey==='full'){
  if(s.phase==='prologue')return '选一个想研究的问题。两次只改这一项，其他条件保持一样。';
  if(s.phase==='observe'&&s.learning?.lab&&comparePair(s.learning).valid)return s.learning.reasoning.observation===null?'两次记录齐了。推一推观察窗，看看从A到B，船身向哪里动。':!reasoningReady(s.learning)?'你已经看过船位。再读读最初猜想，想想这次记录支持它，还是要改一改。':'观察和猜想都对照过了。最后说一说，怎样才是在比较同一件事。';
  if(s.phase==='observe')return '记下A，再只改变你要研究的那一项，记下B。两幅船形有什么不同？';
  if(s.phase==='source')return '砝码替代了书箱，还替代了第一次船上的什么？';
 }
 return guides[s.phase]||guides.start;
}
export function lessonContext(s){return {mode:s.mode,phase:s.phase,journey:s.journey,crewPresent:!!s.crewPresent,aligned:measurements(s).aligned,loaded:s.cargo.filter(Boolean).length,weighed:s.inquiry.weighed.filter(Boolean).length,recorded:s.counts.filter(n=>n===1).length,question:s.learning.lab.question,sampleA:!!s.learning.lab.samples.A,sampleB:!!s.learning.lab.samples.B};}
export function feedbackFor(a,b){
 if(!a||a.mode!==b.mode||a.journey!==b.journey)return null;
 const al=a.learning,bl=b.learning;
 if(a.phase!==b.phase){
  if(b.phase==='ending')return ['E1','E2'].includes(b.ending)?answer('happy',b.ending==='E2'?'你找到问题，又改了一遍。现在记录与结论对上了！':'水线、人和物、称重记录都对上了。你的理由也讲清楚了！'):answer('encourage','还有一个发现等着你。看看线索，回船边试一试。');
  if(a.phase==='prologue'&&b.phase==='observe'&&b.mode==='story')return answer('happy','你发现小秤放不下大象了。现在来看看，小船能帮什么忙。');
  if(a.phase==='observe'&&b.phase==='mark')return answer('happy',b.mode==='story'?'你让金线回到水面了！带着这个发现，到大船上试一试。':'两次记录和你的解释都留下了。带着发现，到大船上试一试！');
  if(a.phase==='mark'&&b.phase==='load'&&b.referenceCaptured)return answer('happy','记号留下了！接下来装石头时，就能对着它观察。');
  if(a.phase==='ledger'&&b.phase==='report'&&b.cargo.some(Boolean)&&b.counts.every((n,i)=>n===Number(b.cargo[i]))&&b.cargo.every((v,i)=>!v||b.inquiry.weighed[i]))return answer('happy','装船的每一批都称过，也记下了。接着说说你的理由。');
  if(a.phase==='source'&&b.phase==='reflect')return answer('happy',b.mode==='story'?'图和词都排好了！现在把故事讲给伙伴听。':'你用称象的办法想明白了新问题！把理由写进报告吧。');
  return answer('idle',hintFor(b));
 }
 if(b.mode==='lab'&&b.phase==='source'&&bl.bridge?.checked&&!al.bridge?.checked)return answer(bl.bridge.tools===20?'happy':'encourage',splitFeedback(bl.bridge));
 if(b.mode==='lab'&&b.phase==='source'&&bl.bridge&&!bl.bridge.checked&&(al.bridge?.checked||al.bridge?.tools===null&&bl.bridge.tools!==null||al.bridge?.tools!==null&&bl.bridge.tools===null))return answer('thinking',splitFeedback(bl.bridge));
 if(bl.workshop?.repair.message&&bl.workshop.repair.message!==al.workshop?.repair.message)return answer(bl.workshop.repair.mood,bl.workshop.repair.message);
 if(bl.reasoning.message!==al.reasoning.message&&bl.reasoning.message)return answer(bl.reasoning.mood,bl.reasoning.message);
 if(bl.play.solved.length>al.play.solved.length)return answer('happy',bl.play.message);
 if(bl.play.message!==al.play.message&&bl.play.message)return answer('encourage',bl.play.message);
 if(b.inquiry.weighed.some((v,i)=>v&&!a.inquiry.weighed[i]))return answer('happy',b.mode==='story'?'这一堆称好啦！把它的称重条放到同样的图案旁边。':'这一批称好了！看看秤上的数，把它记到对应的一行。');
 if(b.counts.some((v,i)=>v===1&&a.counts[i]!==1))return answer('happy',b.mode==='story'?'连好了！一堆石头对应一张称重条。':'这一批记下了。看看还有没有漏记或多记。');
 if(JSON.stringify(a.cargo)!==JSON.stringify(b.cargo)){
  const m=measurements(b);return answer('idle',m.aligned?(b.crewPresent?'水线碰到记号了，阿舟也在船上。接下来还要称一称、记一记。':'水线碰到记号了。阿舟刚才在船上，现在在哪里？'):m.difference<0?'船还浮得高一些。看看石头，也看看船上的人。':'船沉过记号了。取下一堆，再看一看。');
 }
 if(!a.crewPresent&&b.crewPresent)return answer('happy','你请阿舟回来了！两次的人一样了，再看看水线。');
 if(bl.story.seen.length>al.story.seen.length)return answer('happy',bl.message);
 if(al.story.guess===null&&bl.story.guess!==null||al.lab.hypothesis===null&&bl.lab.hypothesis!==null)return answer('thinking','你的猜想留下了。动手看看，结果会不会和想的一样。');
 if(bl.story.water!==al.story.water)return answer(bl.story.water===3?'happy':'thinking',bl.message);
 if(bl.story.line==='hull'&&al.story.line!=='hull')return answer('happy','记号留在船身上啦！它能跟着船一起升降。');
 if(bl.story.book.join(',')==='elephant,mark,replace,weigh'&&al.story.book.join(',')!==bl.story.book.join(','))return answer('happy','四张图排顺了！试着用“先、再、然后、最后”讲一讲。');
 if(bl.lab.finding==='changes'&&al.lab.finding!=='changes'&&comparePair(bl).valid&&reasoningReady(bl))return answer('happy','你用两次记录说明了变化。现在可以把发现带到大船上了！');
 if(JSON.stringify(bl.lab.samples)!==JSON.stringify(al.lab.samples))return answer(comparePair(bl).valid?'happy':'idle',comparePair(bl).valid?'两次只改变了一项，可以比较了。你看到了什么？':bl.lab.samples.A&&bl.lab.samples.B?comparePair(bl).message:'这一次记下了。还要留下另一次，才能比较。');
 if(bl.message!==al.message&&bl.message)return answer('encourage',bl.message);
 return null;
}
