import {learningReflection,learningPrint} from '../src/learning-views.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {finishedState} from './showcase-fixtures.mjs';
import {canShowcase,showcasePages,showcaseLaunch,showcaseFrame} from '../src/showcase-views.mjs';
test('展示仅属于完整学习的成果页，不增加旧练习路线的任务',()=>{
 const s=finishedState();assert.equal(canShowcase(s),true);
 for(const patch of [{phase:'source'},{journey:'core'},{learning:{...s.learning,enabled:false}}])assert.equal(canShowcase({...s,...patch}),false);
});
test('故事四幅图沿用已定分镜，学生图注和参考身份分开',()=>{
 const s=finishedState();s.learning.workshop.captions[0]='我说 <船>\n等一等。';
 const p=showcasePages(s);assert.equal(p.length,4);
 assert.deepEqual(p.map(x=>x.label),['先','再','然后','最后']);
 assert.match(p[0].body,/我说 &lt;船&gt;\n等一等/);
 assert.match(p[0].body,/看看我写的话/);assert.match(p[0].body,/参考讲法/);
 assert.doesNotMatch(p[0].body,/<video|<details[^>]* open/);
});
test('空图注不冒充学生讲述，不创建评分或通过标记',()=>{
 const s=finishedState();s.learning.workshop.captions=['','','',''];
 const html=showcasePages(s).map(p=>p.body).join('');
 assert.match(html,/这一页还没写话/);assert.doesNotMatch(html,/你已掌握|得分|展示成功/);
});
test('实验页保留原猜想、两次实际条件与学生观察',()=>{
 const s=finishedState('lab');const pages=showcasePages(s);
 assert.equal(pages.length,4);assert.match(pages[0].body,/位置不会变/);
 assert.match(pages[1].body,/1块木块/);assert.match(pages[1].body,/3块木块/);
 assert.match(pages[1].body,/B栏的船沉得更深/);assert.match(pages[1].body,/我要修改原来的猜想/);
 assert.match(pages[1].body,/我原来猜不会变/);
});
test('缺少B栏时不拿当前桌面补记录，也不声称比较有效',()=>{
 const s=finishedState('lab');s.learning.lab.samples.B=null;s.learning.lab.weight=5;
 const html=showcasePages(s)[1].body;
 assert.match(html,/B栏还没有记录/);assert.doesNotMatch(html,/5块木块/);
 assert.match(html,/比较提醒/);
});
test('实验图取自A和B快照，逆向或触底状态保留原样',()=>{
 const s=finishedState('lab');s.learning.lab.question='bottom';
 s.learning.lab.samples.A={weight:4,crew:true,free:false};
 s.learning.lab.samples.B={weight:4,crew:true,free:true};
 s.learning.reasoning.observation='lower';
 const html=showcasePages(s)[1].body;
 assert.match(html,/船底碰到底/);assert.match(html,/船底不碰底/);
 assert.match(html,/我选的观察结果/);assert.match(html,/B栏的船沉得更深/);
});
test('暂缓或未对齐的称象结局不被展示改成确认',()=>{
 for(const ending of ['E3','E4']){
 const s=finishedState('lab',ending);const html=showcasePages(s)[2].body;
 assert.match(html,/还不能作为确认结果|暂不确认/);assert.doesNotMatch(html,/已确认：2700/);
 }
 const s=finishedState('lab');s.free=false;
 assert.match(showcasePages(s)[2].body,/还不能作为确认结果/);
});
test('数字缺失不按0显示，第一次结局保留，错误书箱答案原样展示',()=>{
 const s=finishedState('lab');s.claimedMass=null;s.learning.lab.transferNumber='340';s.learning.lab.transferReason='add';
 assert.match(showcasePages(s)[2].body,/还没有填写/);assert.match(showcasePages(s)[2].body,/第一次/);
 assert.match(showcasePages(s)[3].body,/340克/);assert.match(showcasePages(s)[3].body,/再加20克/);
});
test('展示缺失表达只留空，不用系统答案代填',()=>{
 const s=finishedState('lab');s.reflections=['','',''];s.learning.lab.transferNumber='';s.learning.lab.transferReason=null;
 const html=showcasePages(s).map(x=>x.body).join('');
 assert.match(html,/这里还没写话/);assert.match(html,/还没有填写/);
 assert.match(html,/还没有选择理由/);
});
test('构造页面、翻页框架均不改变状态或原有作品页码',()=>{
 const s=finishedState();s.learning.workshop.page=2;const old=JSON.stringify(s);
 for(let i=0;i<4;i++)showcaseFrame(s,i);showcaseLaunch(s);
 assert.equal(JSON.stringify(s),old);
});
test('页码越界被限制，首尾按钮及当前页给出清楚语义',()=>{
 const s=finishedState();assert.match(showcaseFrame(s,-8),/第1页，共4页/);
 assert.match(showcaseFrame(s,8),/第4页，共4页/);
 assert.match(showcaseFrame(s,0),/data-showcase="prev" disabled/);
 assert.match(showcaseFrame(s,3),/data-showcase="next" disabled/);
 assert.match(showcaseFrame(s,2),/aria-current="step"/);
});
test('入口随模式呈现不同内容，不增加必做流程',()=>{
 assert.match(showcaseLaunch(finishedState()),/我来讲故事/);
 assert.match(showcaseLaunch(finishedState('lab')),/展示我的研究/);
 assert.equal(showcaseLaunch({...finishedState(),journey:'core'}),'');
});

test('原报告及打印也如实保留未填与错误的迁移回答',()=>{const s=finishedState('lab');s.learning.lab.transferNumber='';s.learning.lab.transferReason=null;for(const html of [learningReflection(s),learningPrint(s)]){assert.match(html,/书箱重量：还没有填写/);assert.doesNotMatch(html,/我说明了工具的变化/);}s.learning.lab.transferNumber='340';s.learning.lab.transferReason='add';assert.match(learningPrint(s),/再加20克/);});
