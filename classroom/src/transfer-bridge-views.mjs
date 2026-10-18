import{boatDiagram}from'./diagram.mjs';
import{objectArt}from'./reasoning-views.mjs';
import{splitFeedback}from'./transfer-bridge-state.mjs';
const button=(type,value,text,extra='')=>'<button data-learning="'+type+'" data-value="'+value+'" '+extra+'>'+text+'</button>';
export function storyComparison(s){
 const before=s.learning.bridge.memory==='before';
 const reference={...s,phase:'mark',calm:true,balanced:true,free:true,learning:{...s.learning,story:{...s.learning.story,line:'hull'}}};
 return '<section class="river-memory" aria-label="对照两次船上的人和物"><div class="memory-heading"><span>回头看一眼</span><div class="memory-switch" role="group" aria-label="选择哪一次的画面">'+button('memory-view','before','第一次','aria-pressed="'+before+'"')+button('memory-view','now','这一次','aria-pressed="'+!before+'"')+'</div></div><div class="memory-scene" data-memory-scene="'+(before?'before':'now')+'">'+(before?boatDiagram(reference).replace('大象、阿舟与船：等待稳定后留线','第一次：大象和阿舟都在船上，水面与记号相齐'):boatDiagram(s))+'</div><p class="memory-caption">'+(before?'象在船上时，我们留下了这道记号。':s.crewPresent?'阿舟回到船上了。再看看水面和记号。':s.cargo.some(Boolean)?'象换成了石头。还有谁换了地方？':'大象上岸了。除了大象，还有谁换了地方？')+'</p><small>切换着看一看。放石头、请阿舟上船时，会回到“这一次”。</small></section>';
}
function splitControls(b){return '<div class="split-controls">'+button('split-weight',Math.max(0,(b.tools??0)-10),'− 10克','data-split-adjust="less" '+((b.tools===null||b.tools===0)?'disabled':''))+'<label for="split-weight">给工具分多少克？</label>'+button('split-weight',Math.min(320,(b.tools??0)+10),'＋ 10克','data-split-adjust="more" '+(b.tools===320?'disabled':''))+'</div><input id="split-weight" data-split-weight type="range" min="0" max="320" step="10" value="'+(b.tools??0)+'" aria-valuetext="'+(b.tools===null?'还没有分配':b.tools+'克给工具，'+(320-b.tools)+'克给书箱')+'"><div class="split-ticks" aria-hidden="true"><span>0克</span><span>160克</span><span>320克</span></div>';}
export function splitWorkbench(s){
 if(s.learning.reasoning.boats.length!==2||s.learning.reasoning.group!=='box-tool')return '';
 const b=s.learning.bridge,used=b.tools!==null;
 return '<details class="split-workshop"><summary>想用图试一试？打开重量尺</summary><div class="split-inner"><div class="split-heading"><div><p class="eyebrow">把总重量分成两份</p><h3>320克里，有谁的重量？</h3></div><span class="split-total">合起来 <b>320克</b></span></div><p>试着分给工具一份，书箱就是剩下的一份。这是在分重量，船上的物品没有动。</p><div class="split-bar '+(used?'':'unstarted')+'" data-split-bar aria-hidden="true"><span></span><i></i></div><div class="split-parts"><div>'+objectArt('tool')+'<span>我的试分 · 工具<output data-split-tools>'+(used?b.tools+'克':'还没分')+'</output><small>题目给出：20克</small></span></div><div>'+objectArt('box')+'<span>我的试分 · 书箱<output data-split-box>'+(used?320-b.tools+'克':'等你分一分')+'</output><small>分完后，再核对</small></span></div></div>'+splitControls(b)+'<div class="split-actions">'+button('split-check','','核对这次分配',used?'':'disabled')+button('split-reset','','重新分一分','class="text-button"')+'</div><p class="split-feedback '+(b.checked&&b.tools===20?'matched':'')+'" data-split-feedback role="status">'+splitFeedback(b)+'</p></div></details>';
}
export function bridgeSummary(s){
 const b=s.learning.bridge;if(s.mode!=='lab'||b.tools===null)return '';
 return '<section class="split-summary"><h3>我的重量分配</h3><p>我试着把320克分成：书箱'+(320-b.tools)+'克 ＋ 工具'+b.tools+'克。</p><p>'+(b.checked?(b.tools===20?'这次分配与题目对上了。':'工具这份还没对上题目，需要再调一调。'):'这次试分还没有核对。')+'</p></section>';
}
// Update just the scaffold while a native range gesture is in progress.
export function refreshSplit(s){
 const b=s.learning.bridge,used=b.tools!==null,root=document.querySelector('.split-workshop');if(!root)return;
 root.querySelector('[data-split-tools]').textContent=used?b.tools+'克':'还没分';
 root.querySelector('[data-split-box]').textContent=used?(320-b.tools)+'克':'等你分一分';
 const bar=root.querySelector('[data-split-bar]');bar.style.setProperty('--tool-share',((b.tools??0)/320*100)+'%');bar.classList.toggle('unstarted',!used);
 const range=root.querySelector('[data-split-weight]');range.value=String(b.tools??0);range.setAttribute('aria-valuetext',used?b.tools+'克给工具，'+(320-b.tools)+'克给书箱':'还没有分配');
 const controls=root.querySelectorAll('[data-learning="split-weight"]');controls[0].dataset.value=String(Math.max(0,(b.tools??0)-10));controls[0].disabled=!used||b.tools===0;controls[1].dataset.value=String(Math.min(320,(b.tools??0)+10));controls[1].disabled=b.tools===320;
 root.querySelector('[data-learning="split-check"]').disabled=!used;
 const feedback=root.querySelector('[data-split-feedback]');feedback.textContent=splitFeedback(b);feedback.classList.toggle('matched',b.checked&&b.tools===20);
}
