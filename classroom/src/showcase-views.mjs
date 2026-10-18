import {activeLearning,comparePair} from './learning-state.mjs';
import {storyPages} from './workshop-views.mjs';
import {stillElement} from './media.mjs';
import {miniBoat} from './play-views.mjs';
import {boatDiagram} from './diagram.mjs';
import {measurements,issues,ISSUE_TEXT} from './engine.mjs';
import {hypothesisText,directionText} from './reasoning-state.mjs';
import {objectArt} from './reasoning-views.mjs';
import {bridgeSummary} from './transfer-bridge-views.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const questions={mass:'多放木块，船会怎样？',crew:'小人上船，船会怎样？',bottom:'船底碰到盆底，会怎样？'};
const endings={E1:'记录对上了',E2:'修改后，记录对上了',E3:'暂不确认，再查一查',E4:'还有地方需要核对'};
const fold=(label,body,kind='')=>'<details class="showcase-fold '+kind+'"><summary>'+label+'</summary>'+body+'</details>';
const own=(text,story=false)=>fold('看看我写的话',text?.trim()?'<p class="showcase-own">'+esc(text)+'</p>':'<p class="showcase-empty">'+(story?'这一页还没写话。可以先指着图，讲给同桌听。':'这里还没写话。可以先说一说，再回到报告里补上。')+'</p>','own-fold');
const fact=(label,text)=>'<div class="showcase-fact"><span>'+label+'</span><p>'+esc(text)+'</p></div>';
const cue=text=>fold('需要一点提示','<p>'+esc(text)+'</p>','cue-fold');
export const canShowcase=s=>activeLearning(s)&&s.phase==='reflect';
export function showcaseLaunch(s){
 if(!canShowcase(s))return '';
 const story=s.mode==='story';
 return '<section class="showcase-launch '+s.mode+'" aria-label="讲给同学听"><div class="showcase-launch-art" aria-hidden="true">'+stillElement(story?'boarding':'lab_plan')+'</div><div class="showcase-launch-copy"><span>现在，把话筒交给你</span><h2>'+(story?'四幅画，一起讲个好故事':'把发现讲清楚，让记录来说话')+'</h2><p>'+(story?'看图慢慢讲。想不起来时，再打开自己写的话。':'带着问题、两次试验和修改的想法，开一场小小研究会。')+'</p></div><div class="showcase-actions"><button data-showcase-open class="showcase-start">'+(story?'我来讲故事':'展示我的研究')+' <span aria-hidden="true">↗</span></button><button class="peer-launch" data-peer-open>出题给同桌</button></div></section>';
}
function storySlide(s,p,i){return {label:p.word,title:p.title,body:'<div class="showcase-spread"><figure class="showcase-picture">'+stillElement(p.image)+'<figcaption><b>'+p.word+'</b><span>看着画面，慢慢讲。</span></figcaption></figure><section class="showcase-notes"><span class="showcase-kicker">这一页，你想怎么讲？</span><p class="showcase-question">'+p.prompt+'</p>'+own(s.learning.workshop?.captions?.[i],true)+fold('卡住了，看看参考讲法','<p>'+p.word+'，'+p.reference+'</p><small>参考可以帮你想一想，再用自己的话讲。</small>')+fold('请同桌问我一个问题','<p>'+p.question+'</p>')+'</section></div>'};}
function labSlides(s){
 const l=s.learning,b=l.lab,r=l.reasoning??{},m=measurements(s);
 const pair=comparePair(l),pending=issues(s),confirmed=['E1','E2'].includes(s.ending)&&pending.length===0;
 const reason={subtract:'320克砝码还替代了那20克工具，要减去它。',add:'工具拿走了，所以要在320克上再加20克。'}[b.transferReason]||'还没有选择理由';
 const records=['A','B'].map(k=>{const t=b.samples[k];return t?'<div class="showcase-sample">'+miniBoat(t,k+'栏 · 当时留下的记录')+'<p>'+t.weight+'块木块 · 小人'+(t.crew?'在船上':'在岸上')+'<br>船底'+(t.free?'不碰底':'碰到底')+'</p></div>':'<div class="showcase-sample missing"><b>'+k+'栏还没有记录</b><p>这部分先留空，可以讲已有的发现。</p></div>';}).join('');
 return [
 {label:'提出问题',title:'我的研究，从一个问题开始',body:'<div class="showcase-spread"><figure class="showcase-picture">'+stillElement('lab_plan')+'<figcaption><span>一艘小船，也藏着许多问题。</span></figcaption></figure><section class="showcase-notes">'+fact('我选的问题',questions[b.question]||'还没有选择问题')+fact('我最初的猜想',hypothesisText[b.hypothesis]||'还没有留下猜想')+'<p class="showcase-question">当时为什么这样猜？<br>你可以从见过的事情说起。</p>'+cue('猜想先留下。讲一讲你当时的想法，再到下一页看看试验记录。')+'</section></div>'},
 {label:'用记录说话',title:'把两次试验放在一起看',body:'<div class="showcase-evidence"><div><p class="showcase-kicker">同一艘小船 · A、B两栏保留当时的样子</p><div class="showcase-pair">'+records+'</div>'+(!pair.valid?'<p class="showcase-caution"><b>比较提醒：</b>'+esc(pair.message)+'</p>':'')+'<p class="showcase-question">哪一样变了？哪几样没变？<br>指着记录，说说你看到了什么。</p></div><section class="showcase-notes">'+fact('我选的观察结果',directionText[r.observation]||'还没有选择观察结果')+fact('我选的想法',{agree:'这次记录支持原来的猜想',revise:'我要修改原来的猜想'}[r.reflection]||'还没有留下想法')+own(s.reflections?.[0])+cue('先说木块、小人和船底，再看船身相对水面的位置。两次只改变研究的那一项，才便于找到变化的原因。')+'</section></div>'},
 {label:'回到大船',title:'这一次，称象结果怎样？',body:'<div class="showcase-evidence"><div class="showcase-boat">'+boatDiagram(s).replaceAll('id="river"','id="showcase-river"').replaceAll('url(#river)','url(#showcase-river)')+'<p>这张图来自本次称象记录。</p><div class="showcase-measures">'+fact('实际装上的石头',m.cargoMass+'千克')+fact('账页合计',m.recordedMass+'千克')+fact('阿舟的位置',s.crewPresent?'在船上':'在岸上')+'</div></div><section class="showcase-notes">'+fact('第一次的结局',endings[s.firstEnding]||'还没有结局')+fact('这一次的结局',endings[s.ending]||'还没有结局')+'<div class="showcase-fact"><span>我填写的称象数值</span><p>'+(s.claimedMass===null?'还没有填写':esc(s.claimedMass)+'千克')+'</p><small>'+(confirmed?'当前称象条件与记录已对上。':s.ending==='E3'?'这次选择暂不确认，可以讲一讲还想检查什么。':'还不能作为确认结果，要接着核对。')+'</small></div>'+own(s.reflections?.[1])+(pending.length?fold('看看还要核对哪里','<ul>'+pending.map(k=>'<li>'+ISSUE_TEXT[k]+'</li>').join('')+'</ul>'):cue('水线、人员和称重记录，哪些地方已经对上？如果修改过，讲讲是哪条线索提醒了你。'))+'</section></div>'},
 {label:'换个问题',title:'书箱旁边，还有一份重量',body:'<div class="showcase-evidence"><section class="showcase-transfer"><p class="showcase-kicker">题目里的两次装载</p><div class="showcase-objects"><div><h3>第一次</h3>'+objectArt('box')+'<b>书箱</b><span>＋</span>'+objectArt('tool')+'<b>工具20克</b></div><div><h3>第二次</h3>'+objectArt('weights')+'<b>砝码320克</b></div></div><p>同一艘船、同一盆水；船身平稳，不碰底。<br>两次水面都碰到同一道记号。</p><p class="showcase-question">这320克，替代了哪些东西？</p></section><section class="showcase-notes">'+fact('我填写的书箱重量',b.transferNumber?.trim()?b.transferNumber+'克':'还没有填写')+fact('我选择的理由',reason)+own(s.reflections?.[2])+(l.bridge?bridgeSummary(s):'')+fold('请同桌换个问法','<p>如果工具两次都留在船上，320克这次替代谁？</p><small>先想一想，再说说你的理由。</small>')+cue('先找两次都没变的东西，再比较换了的东西。题目中的320克替代了书箱和20克工具；只求书箱，要把工具这份减去。')+'</section></div>'}
 ];
}
export function showcasePages(s){return s.mode==='story'?storyPages.map((p,i)=>storySlide(s,p,i)):labSlides(s);}
export function showcaseFrame(s,index=0){
 const pages=showcasePages(s),i=Math.max(0,Math.min(3,Number.isFinite(index)?Math.trunc(index):0)),p=pages[i],story=s.mode==='story';
 return '<header class="showcase-header"><span>'+(story?'我的故事放映室':'我的小小研究会')+'</span><button data-showcase="close">返回我的成果 <span aria-hidden="true">×</span></button></header><div class="showcase-content"><div class="showcase-title"><span>'+String(i+1).padStart(2,'0')+'</span><div><p>'+(story?'四幅画面 · 用自己的话讲':'四页记录 · 说出你的依据')+'</p><h2 id="showcase-title" tabindex="-1">'+p.title+'</h2></div></div>'+p.body+'</div><footer class="showcase-footer"><button data-showcase="prev" '+(i===0?'disabled':'')+'>← 上一页</button><nav aria-label="展示页码">'+pages.map((x,n)=>'<button data-showcase="page" data-page="'+n+'" '+(n===i?'aria-current="step"':'')+' aria-label="第'+(n+1)+'页，'+x.label+'"><span>'+(n+1)+'</span><b>'+x.label+'</b></button>').join('')+'</nav><button data-showcase="next" '+(i===3?'disabled':'')+'>下一页 →</button><span class="showcase-position" role="status">第'+(i+1)+'页，共4页</span></footer>';
}
