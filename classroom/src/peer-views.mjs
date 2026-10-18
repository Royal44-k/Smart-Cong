import{storyPages}from'./workshop-views.mjs';
import{stillElement}from'./media.mjs';
import{objectArt}from'./reasoning-views.mjs';
import{peerResult,peerSnapshot}from'./peer-state.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const peerTitles=['请大象上船','在船身画线','换上石头','分开称石头'];
export const peerPurposes=['看看大象在船上时，水面到哪里。','记住刚才水面的位置，换石头时好比较。','让石头替大象，回到刚才的水线，还要看看船上的人和物是否一样。','每份称一次、记一次，再把重量加起来。'];
const alternatives=[['看看大象站在岸上有多高。','让空船漂一会儿，就知道大象多重。'],['在岸边画线，记住船停在哪里。','在浪花上画线，水动也没关系。'],['把石头堆得像大象，就一定一样重。','水线碰到记号就行，不用看船上的人。'],['随便称一份，就知道全部有多重。','一份记两次，总重量就更准。']];
const reasonOrder=[['pretty','purpose','hurry'],['purpose','hurry','pretty'],['hurry','pretty','purpose'],['pretty','hurry','purpose']];
const relationText={less:'比砝码轻',same:'和砝码一样重',more:'比砝码重'};
const positionText={first:'只在第一次',both:'两次都在',second:'只在第二次'};
const button=(action,label,value='',pressed=null,extra='')=>'<button data-peer="'+action+'" data-value="'+esc(value)+'" '+(typeof pressed==='boolean'?'aria-pressed="'+pressed+'" ':'')+extra+'>'+label+'</button>';
function picture(i){return stillElement(storyPages[i].image);}
function storyboard(g,make=false){
 return '<div class="peer-storyboard '+(make?'making':'')+'">'+storyPages.map((p,i)=>{
  const hidden=!make&&g.hidden===i&&g.stage==='solve'&&!g.peeked;
  if(make)return button('hide',picture(i)+'<span class="peer-film-label"><b>'+p.word+'</b>'+peerTitles[i]+'</span><small>'+(g.hidden===i?'这幅藏起来':'选这一幅')+'</small>',i,g.hidden===i);
  return '<figure class="'+(g.hidden===i?'peer-gap':'')+'">'+(hidden?'<div class="peer-curtain"><b>第'+(i+1)+'幅藏起来啦</b><span>看看前后，想一想。</span>'+button('peek','掀开纸帘看一眼')+'</div>':picture(i))+'<figcaption><b>'+p.word+'</b><span>'+(hidden?'等你补回来':peerTitles[i])+'</span></figcaption></figure>';
 }).join('')+'</div>';
}
function storyBody(g){
 if(g.stage==='make')return '<p class="peer-lead">选一幅藏起来，请同桌把故事接完整。</p>'+storyboard(g,true)+'<p class="peer-note">不会改动你写好的故事书。藏一藏，也能发现每一步的用处。</p>';
 return '<div class="peer-play-grid"><div>'+storyboard(g)+'<p class="peer-note">'+(g.stage==='done'?'图和理由对上了。你能换一句话讲清楚吗？':g.stage==='explain'?'图已经接上了。想一想，这一步帮了什么忙？':g.peeked?'这次看过纸帘里的图，也可以继续想、继续说。':'看看留下的三幅图。需要帮助时，可以掀开纸帘。')+'</p></div><section class="peer-task">'+(g.stage==='solve'?'<h3>哪幅图应该放回来？</h3><div class="peer-picture-choices">'+[2,0,3,1].map(i=>button('guess',picture(i)+'<span>'+peerTitles[i]+'</span>',i,g.guess===i)).join(''):'<h3>这一步有什么用？</h3>'+(g.stage==='done'?'<p class="peer-explanation">'+peerPurposes[g.hidden]+'</p><p>请指着图，用自己的话讲给同桌听。</p>':'<div class="peer-reasons">'+reasonOrder[g.hidden].map(v=>button('reason',{purpose:peerPurposes[g.hidden],pretty:alternatives[g.hidden][0],hurry:alternatives[g.hidden][1]}[v],v,g.reason===v)).join('')+'</div>'))+'</section></div>';
}
function loadCards(g){
 const tool=(on)=>on?'<div class="peer-item">'+objectArt('tool')+'<b>工具 '+g.tool+'克</b></div>':'<p class="peer-shore">工具在岸上</p>';
 return '<div class="peer-loads"><article><h3>第一次</h3><p>船上放着</p><div class="peer-items"><div class="peer-item">'+objectArt('box')+'<b>书箱</b><small>重量等你来算</small></div>'+tool(g.position!=='second')+'</div></article><article><h3>第二次</h3><p>船上放着</p><div class="peer-items"><div class="peer-item">'+objectArt('weights')+'<b>砝码 '+g.total+'克</b></div>'+tool(g.position!=='first')+'</div></article></div><p class="peer-condition">同一艘船，同一盆水；船身平稳，不碰底。<br>两次水面都碰到同一道记号。</p>';
}
export function peerProof(g){
 const last=g.checked;if(!last||JSON.stringify(last)!==JSON.stringify(peerSnapshot('lab',g)))return '';
 const n=Number(g.answer),a=n+(g.position==='second'?0:g.tool),b=g.total+(g.position==='first'?0:g.tool),gap=Math.abs(a-b);
 return '<section class="peer-proof"><h3>把你填的数放回图里</h3><div><p><span>第一次</span><b>'+(g.position==='second'?n+'克':n+' + '+g.tool+' = '+a+'（克）')+'</b></p><p><span>第二次</span><b>'+(g.position==='first'?g.total+'克':g.total+' + '+g.tool+' = '+b+'（克）')+'</b></p></div><p>'+(gap?'按这个答案算，两次还差'+gap+'克。再看看工具这一份。':'按这个答案算，两次一样重。再说说工具去了哪里。')+'</p></section>';
}
function labBody(g){
 const make=g.stage==='make',r=peerResult('lab',g);
 return '<p class="peer-lead">'+(make?'每换一题，就换一箱书。选好砝码、工具和摆法，再请同桌来算。':'工具在哪一次上船？先比较，再算一算。')+'</p><div class="peer-play-grid"><div>'+loadCards(g)+'</div><section class="peer-task">'+(make?'<fieldset><legend>砝码合起来有多重？</legend><div class="peer-chips">'+[220,320,420].map(n=>button('total',n+'克',n,g.total===n)).join('')+'</div></fieldset><fieldset><legend>工具有多重？</legend><div class="peer-chips">'+[20,40,60].map(n=>button('tool',n+'克',n,g.tool===n)).join('')+'</div></fieldset><fieldset><legend>工具在哪次上船？</legend><div class="peer-reasons">'+Object.entries(positionText).map(([v,t])=>button('position',t,v,g.position===v)).join('')+'</div></fieldset>':g.stage==='done'?'<p class="peer-result-number"><span>这题的书箱</span><b>'+r.expected+'<small>克</small></b></p><p class="peer-explanation">'+({first:'砝码替代了书箱和工具。只求书箱，要减去工具这份。',both:'工具两次都在船上。留下书箱和砝码来比，它们一样重。',second:'书箱替代了第二次的砝码和工具。要把这两份重量加起来。'}[g.position])+'</p><p>换一道题时，先看工具的位置，再决定怎样算。</p>':'<fieldset><legend>书箱和砝码比一比</legend><div class="peer-reasons">'+Object.entries(relationText).map(([v,t])=>button('relation',t,v,g.relation===v)).join('')+'</div></fieldset><label for="peer-number">这题的书箱有多重？</label><div class="peer-number-row"><input id="peer-number" data-peer-number inputmode="numeric" maxlength="3" autocomplete="off" value="'+esc(g.answer)+'" aria-describedby="peer-number-help"><span>克</span></div><p id="peer-number-help" class="peer-note">自己算一算，把数字填在这里。</p>'+button('peek','给我一点线索','','', 'class="peer-text-button"'))+'</section></div><div data-peer-proof>'+peerProof(g)+'</div>';
}
export function peerSummary(s,print=false){
 const mode=s.mode,g=s.learning?.peer?.[mode];if(!g?.records.length)return '';
 const content='<p>最近'+g.records.length+'次核对。只记下选过、算过的内容，不是得分。</p>'+g.records.map((r,i)=>{const good=peerResult(mode,r),body=mode==='story'?'藏起第'+(r.hidden+1)+'幅；选了“'+peerTitles[r.guess]+'”；'+(r.reason?'理由：'+({purpose:peerPurposes[r.hidden],pretty:alternatives[r.hidden][0],hurry:alternatives[r.hidden][1]}[r.reason]):'还没选择理由。'):'砝码'+r.total+'克，工具'+r.tool+'克，'+positionText[r.position]+'上船；选了“'+relationText[r.relation]+'”，填了'+r.answer+'克。';return '<article><b>第'+(i+1)+'次核对 · '+(good.correct?'这题对上了':mode==='story'&&good.picture?'画面已接上，理由还要想一想':'还要再想一想')+'</b><p>'+esc(body)+'</p><small>'+(r.peeked?'这次看过提示。':'这次没有打开提示。')+'</small></article>';}).join('');
 return print?'<section class="peer-records"><h2>小游戏里的几次尝试</h2>'+content+'</section>':'<details class="peer-records"><summary>小游戏里的几次尝试（'+g.records.length+'）</summary>'+content+'</details>';
}
export function peerFrame(s){
 const mode=s.mode,g=s.learning.peer[mode],make=g.stage==='make',pass=g.stage==='pass',done=g.stage==='done';
 const title=pass?'请把屏幕交给同桌':mode==='story'?(make?'藏起哪一幅？':done?'故事接完整啦':g.stage==='explain'?'画面接上了，再说说用处':'少了哪幅图？'):(make?'这道题，由你来出':done?'这箱书，称明白啦':'工具换了地方，怎样算？');
 const stageName=make?'你来出题':pass?'交给同桌':done?'交换想法':'你来解题';
 const body=pass?'<section class="peer-handoff"><span class="peer-handoff-title">题目准备好啦</span><h3>轮到你来解！</h3><p>请同桌点下面的按钮开始。<br>一个人也可以玩，换个角色想一想。</p><p class="peer-note">题目已经收好，不会一边解一边变。</p></section>':mode==='story'?storyBody(g):labBody(g);
 const main=make?button('prepare','题目准备好了 →','','','class="peer-primary"'):pass?button('solve','我来解题 →','','','class="peer-primary"'):done?button('edit','交换角色，再出一题 →','','','class="peer-primary"'):button('check',mode==='story'&&g.stage==='solve'?'补回这幅 →':mode==='story'?'看看对不对 →':'核对一下 →','','','class="peer-primary"');
 return '<header class="peer-header"><span>我出题，你来解 <b>'+stageName+'</b></span>'+button('close','返回我的成果 ×')+'</header><div class="peer-content"><div class="peer-title"><p>'+(mode==='story'?'曹冲的故事小剧场':'小象的出题桌')+'</p><h2 id="peer-title" tabindex="-1">'+title+'</h2></div>'+body+(!pass?'<aside class="peer-feedback" data-mood="'+g.mood+'"><span class="companion-sprite" data-mood="'+g.mood+'" aria-hidden="true"></span><p data-peer-feedback>'+esc(g.message||(make?'你来安排这一题。选好后，再让同桌看看。':'慢慢想，不用抢时间。'))+'</p></aside>':'')+'</div><footer class="peer-footer">'+(done?'<span>把理由讲给同桌听，再交换角色。</span>':!make?button('edit','回去改题'):'<span>可以和同桌轮流，也可以自己玩。</span>')+main+'</footer>';
}
