import {ROLES} from './inquiry.mjs';
export const pick=(type,value,title,note='',selected=false,disabled=false)=>'<button data-inquiry="'+type+'" data-value="'+value+'" aria-pressed="'+selected+'" '+(disabled?'disabled':'')+'><b>'+title+'</b>'+(note?'<small>'+note+'</small>':'')+'</button>';
export function identity(s){return '<div class="learner-strip"><span class="role-seal">你</span><span><strong>'+ROLES[s.inquiry.role]+'</strong> · '+(s.mode==='story'?'和曹冲一起，把办法讲明白':'和曹冲一起，让证据说话')+'</span><button data-action="journal" class="small-link">我的观察册 ↗</button></div>';}
const hints={
 prologue:['看看秤，再看看象。问题出在哪里？','更多人拉得动，秤杆就一定承得住吗？','眼前的秤量程与支撑不足，先用模型检验办法。'],
 'route-lab':['观察两边高低，或比较支架能承几份。','小木块需要多少个相同砝码？不足的支撑会发出暂停信号。','三块木块分别是1、2、3份；支架先试2份，再试3份。'],
 observe:['先记下预测。试一次，再换一种载荷。','金线与水面位置不同，说明船的吃水不同。注意船底是否碰底。','移到深处，记录2块和3块时的现象。3块时金线与水面相合。'],
 reference:['船会上下移动。你的记号应该跟着谁？','浪会变，岸不会跟着船上下移动。','等水面平稳，在船舷留下水痕，同时记录船上的人和物。'],
 mark:['先观察水面和船身。','浪还在动时，先等一等；偏载时调整位置。','等风浪停，载荷放稳、船底离地，再留线。'],
 materials:['物品的形状需要和象一样吗？','两次称量隔一会儿，再比较有没有变。','石料和密封袋保持质量；漏水木桶会变轻。选经过两次称量的稳定物品。'],
 load:['水线回来时，还有什么可能变了？','打开前后对照，看看人员、器具和船。','可以让阿舟回船、卸下补充批次；也可以保留人员差异，在报告中校正。'],
 ledger:['先称，再记。每批有自己的编号。','对照船上批次，检查有没有漏记、重复。','在船上的每批恰好记1次，卸下的批次不计。'],
 review:['你最想验证哪一条证据？','看过提示不等于完成复核，要返回现场或账页检查。','先比较人员，再逐批核对账页，最后检查漂浮状态。'],
 report:['数字或图形之外，还需要说明为什么。','同水线对应的是同一艘船前后的总载荷。','人员相同可直接比较；人员不同需校正。实验版：象＝替代物＋后次人员－前次人员。'],
 source:['先按发生顺序摆卡，再教给新伙伴。','如果换了另一艘船，原来的水痕还能直接比较吗？','须用同一艘船、同一水域和相同漂浮姿态；人员器具保持相同或校正。']
};
export function help(s){const h=s.inquiry.hints[s.phase]||0,items=hints[s.phase]||['回看观察册中的证据，再试一步。'];return '<aside class="partner-help"><button data-inquiry="hint" '+(h>=3?'disabled':'')+'>曹冲，给我'+(h?'再一个':'一点')+'线索'+(h?' · '+h+'/3':'')+'</button>'+(h?'<p>'+items[Math.min(h,items.length)-1]+'</p>':'')+'</aside>';}
export function feedback(s){return s.inquiry.feedback?'<p class="feedback" role="status">'+s.inquiry.feedback+'</p>':'';}
export function conditionControls(s,extra=false){return '<div class="condition-actions" role="group" aria-label="调整河船条件">'+pick('condition','wait','等风浪停',s.calm?'水面已平静':'水面仍有波动',s.calm)+pick('condition','balance','把载荷摆匀',s.balanced?'船身已放平':'船身向一侧倾',s.balanced)+pick('condition','deep','移到深水处',s.free?'船底没有支撑':'船底碰到河床',s.free)+'</div>'+(extra?'<details><summary>做一个反例实验</summary><p>只改变一个条件，观察原来的结论还成立吗。</p><div class="button-row">'+pick('condition','wave','制造波浪')+pick('condition','tilt','将载荷移到一侧')+pick('condition','shallow','移入浅处')+'</div></details>':'');}
export function journal(s){const q=s.inquiry;return '<h2>我的观察册</h2><p>'+ROLES[q.role]+' · 每次尝试都留下线索</p><ol class="journal-list"><li><b>我的路线</b><p>'+(s.route?(s.route==='scale'?'检验大秤的支撑':'把小份合起来'):'还在码头准备')+'</p></li><li><b>最初的预测</b><p>'+(q.prediction===null?'还没有预测':q.prediction==='higher'?'加重后船会抬起':'加重后船会沉下')+'</p></li><li><b>水盆试验 · 最近30条</b>'+(q.trials.length?'<ul>'+q.trials.map((t,i)=>'<li>第'+(i+1)+'次：'+t.weight+'块 · '+(t.free?(t.weight===3?'金线与水面相合':t.weight<3?'船浮得比参照高':'船沉得比参照深'):'触底，盆底提供支撑')+'</li>').join('')+'</ul>':'<p>先动手，再保存观察。</p>')+'<p>已保存的自由漂浮关键载荷：'+(q.pondEvidence.length?q.pondEvidence.join('、')+'块':'尚无')+'。</p></li><li><b>材料复称</b><p>'+Object.entries(q.materialChecks).map(([k,v])=>({stone:'石料',bag:'密封袋',leak:'木桶'})[k]+' '+v+'/2次').join('；')+'</p></li><li><b>逐批称量</b><p>'+q.weighed.filter(Boolean).length+' 批已称；账页 '+s.counts.reduce((a,b)=>a+b,0)+' 笔。</p></li><li><b>前后对照</b><p>'+(q.configFound.includes('crew')?'发现阿舟的位置发生变化。':'可以回看人员、器具与船。')+'</p></li></ol><p>预测可以被证据改变。记录保留，是为了说清楚你怎样想明白的。</p>';}
