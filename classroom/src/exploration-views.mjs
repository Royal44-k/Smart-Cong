import{comparePair,labReady}from'./learning-state.mjs';
import{reasoningReady}from'./reasoning-state.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(a,v,text,extra='')=>'<button data-learning="'+a+'" data-value="'+v+'" '+extra+'>'+text+'</button>';
export const reflectionQuestions=mode=>mode==='story'?['试着用“先、再、然后、最后”讲一讲。','你发现阿舟换了地方时，是怎么做的？','下次还想用小船称什么？']:['我的猜想和两次记录一样吗？用A、B的记录说一说。','称大象时，我改过哪一处？为什么要改？','称书箱时，为什么要减去20克？'];
export function printReflections(s){return s.reflections.map((r,i)=>'<section class="printed-reflection"><h2>我的话 '+(i+1)+'</h2><p class="reflection-question">'+esc(reflectionQuestions(s.mode)[i])+'</p>'+(r.trim()?'<p>'+esc(r).replaceAll('\n','<br>')+'</p>':'<div class="reflection-blank"></div>')+'</section>').join('');}
export function markWorkbench(s,draw){
 const chosen=s.learning.story.line;
 return '<div class="mark-workbench"><div class="mark-head"><b>把这一刻留下来</b><span>点一处 · 划一道</span></div><div class="mark-canvas" data-mark-canvas data-chosen="'+(chosen||'')+'">'+draw(s)+['hull','shore','wave'].map(k=>'<button type="button" class="mark-surface mark-'+k+'" data-mark-surface="'+k+'" aria-label="在'+({hull:'船身',shore:'岸边柱子',wave:'浪花'}[k])+'上画记号" aria-pressed="'+(chosen===k)+'"><span>'+({hull:'船身',shore:'岸柱',wave:'浪花'}[k])+'</span></button>').join('')+'<svg class="mark-ink" viewBox="0 0 800 345" aria-hidden="true"><path/></svg></div><p class="mark-instruction">在图上选一处，点一下或按住划一道线。也可以用下面的按钮。</p></div>';
}
const trialText=t=>t?t.weight+'块木块 · 小人在'+(t.crew?'船上':'岸上')+' · '+(t.free?'不碰底':'碰到底'):'还没记下这一刻';
export function labDesk(s,draw,reasoningHtml,recordHtml,findingHtml){
 const l=s.learning,b=l.lab,pair=comparePair(l),ready=reasoningReady(l),done=labReady(l);
 const step=!pair.valid?0:!ready?1:2;
 const titles=['摆试验','比记录','说发现'],ids=['arrange','compare','explain'];
 const tips=!b.samples.A?(b.samples.B?'B栏已经留下了。摆好另一种情况，再记入A栏。':'摆好小船，把第一次记入A栏。'):!b.samples.B?'A栏留下了。只改要研究的一项，把第二次记入B栏。':!pair.valid?'两次记录有了。先看看比较的条件是否合适。':!ready?'两次只改了一项。推一推观察窗，把看到的变化说出来。':done?'观察和解释都留下了，可以把发现带到大船上。':'看过记录了。最后说一说，怎样才能这样比较。';
 const nav='<nav class="desk-guide" aria-label="我的实验步骤">'+titles.map((t,i)=>'<button data-desk-jump="'+ids[i]+'" '+(i===step?'aria-current="step"':'')+'><span class="desk-step-number">'+(i<step||done?'✓':i+1)+'</span><span><b>'+t+'</b><small>'+(i<step||done?'已完成':i===step?'现在这里':'随时可看')+'</small></span></button>').join('')+'</nav><p class="desk-next">'+tips+'</p>';
 const slots='<div class="sample-slots">'+['A','B'].map(k=>'<article data-sample-card="'+k+'" class="sample-card '+(b.samples[k]?'recorded':'')+'"><h3>'+k+'栏 <small>'+(b.samples[k]?'已留下':'等你记录')+'</small></h3><p>'+trialText(b.samples[k])+'</p>'+button('sample',k,'记入'+k+'栏','aria-describedby="sample-note"')+button('restore-sample',k,'照'+k+'摆回',b.samples[k]?'':'disabled')+'</article>').join('')+'</div><p class="hint" id="sample-note">“记入”会换掉这一栏；“摆回”只摆小船，不改记录。</p>';
 const controls='<div class="bench-controls"><h2>动手摆一摆</h2><p class="control-label">木块数量 <small>每块10克</small></p><div class="number-choice">'+[1,2,3,4,5].map(n=>button('bench-weight',n,n+'块','aria-pressed="'+(b.weight===n)+'"')).join('')+'</div><div class="bench-switches">'+button('bench-crew','',b.crew?'让小人上岸':'把小人放上船','aria-pressed="'+b.crew+'"')+button('bench-depth','',b.free?'把水调浅':'把水调深','aria-pressed="'+!b.free+'"')+'</div>'+slots+'</div>';
 const bench='<section class="desk-arrange" aria-labelledby="desk-arrange"><h2 id="desk-arrange" tabindex="-1"><span>1</span> 现在的小船</h2><div class="bench-layout"><div class="bench-picture">'+draw(b,b.samples.A)+'<p class="bench-now">'+trialText(b)+'</p><p class="hint">金色虚线：A栏留下的船形。小人重20克。</p></div>'+controls+'</div><p class="desk-live" role="status">'+esc(l.message)+'</p></section>';
 const empty='<div class="comparison-empty"><span>A ↔ B</span><h3>把两次的小船放在一起看</h3><p>先在操作区摆好小船，分别记入A栏、B栏。这里会留下两幅船形，供你慢慢比较。</p><button data-desk-jump="arrange">去摆小船 ↑</button></div>';
 const compare='<section class="desk-compare" aria-labelledby="desk-compare"><h2 id="desk-compare" tabindex="-1"><span>2</span> 留下的两次记录</h2>'+ (reasoningHtml||empty)+'<details class="compact-record"><summary>查看两次试验的数字记录</summary>'+recordHtml+'</details><p class="pair-result '+(pair.valid?'valid':'')+'">'+pair.message+'</p></section>';
 return nav+'<div class="experiment-desk">'+bench+compare+'</div><section class="desk-explain" aria-labelledby="desk-explain"><h2 id="desk-explain" tabindex="-1"><span>3</span> 把发现讲清楚</h2>'+findingHtml+'</section>';
}
