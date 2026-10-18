export const repairCases = [
  {question:'mass', title:'木块多了，还是小人上船了？', goal:'这次只研究木块数量。让两次的小人位置和水深一样。',
   A:{weight:1,crew:false,free:true}, B:{weight:3,crew:true,free:true}},
  {question:'crew', title:'只看看小人上船的影响', goal:'这次只研究小人的位置。木块和水深可不能跟着变。',
   A:{weight:2,crew:false,free:true}, B:{weight:4,crew:true,free:true}},
  {question:'bottom', title:'是谁在托着小船？', goal:'这次只研究船底是否碰底。先让两次的木块和小人一样。',
   A:{weight:3,crew:false,free:true}, B:{weight:2,crew:true,free:false}}
];
export const blankWorkshop=()=>({page:0,captions:['','','',''],repair:{case:0,B:{...repairCases[0].B},reason:null,records:[],message:'',mood:'idle'}});
const integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const trial=t=>!!t&&integer(t.weight,1,5)&&typeof t.crew==='boolean'&&typeof t.free==='boolean';
const names={weight:'木块数量',crew:'小人位置',free:'水的深浅'};
const keyOf=q=>({mass:'weight',crew:'crew',bottom:'free'})[q];
export function repairStatus(index,B){
  const c=repairCases[index];if(!c||!trial(B))return{valid:false,message:'先把小船摆好，再检查。'};
  const changed=Object.keys(names).filter(k=>c.A[k]!==B[k]),key=keyOf(c.question);
  if(!changed.length)return{valid:false,message:'现在两次完全一样。还要改变题目中要研究的那一项。'};
  if(c.question!=='bottom'&&!B.free)return{valid:false,message:'B船碰到了盆底。先把水调深，让船自由漂浮。'};
  const extra=changed.filter(k=>k!==key);
  if(extra.length)return{valid:false,message:extra.map(k=>names[k]).join('、')+'也变了。对照A栏，把它'+(extra.length>1?'们':'')+'调回一样，再看看。'};
  if(!changed.includes(key))return{valid:false,message:'这次要研究'+names[key]+'。让这一项不同，其他条件一样。'};
  return{valid:true,message:'两次只改变'+names[key]+'，其他条件保持一样。'};
}
export function validWorkshop(w){
  if(!w||!integer(w.page,0,3)||!Array.isArray(w.captions)||w.captions.length!==4||w.captions.some(t=>typeof t!=='string'||t.length>160))return false;
  const r=w.repair;
  if(!r||!integer(r.case,0,2)||!trial(r.B)||![null,'one','same'].includes(r.reason)||typeof r.message!=='string'||r.message.length>300||!['idle','thinking','happy','encourage'].includes(r.mood)||!Array.isArray(r.records)||r.records.length<r.case||r.records.length>r.case+1)return false;
  if(!r.records.every((v,i)=>v&&v.case===i&&v.reason==='one'&&repairStatus(i,v.B).valid))return false;
  const checked=r.records[r.case];
  return !checked||r.reason==='one'&&Object.keys(names).every(k=>checked.B[k]===r.B[k]);
}
export function workshopAction(s,type,value){
  const w=s.learning?.workshop;if(!w)return false;
  if(s.mode==='story'&&s.journey==='full'&&s.learning.enabled&&s.phase==='reflect'){
    if(type==='book-page'&&integer(Number(value),0,3)){w.page=Number(value);return true;}
    if(type==='book-prev'&&w.page>0){w.page--;return true;}
    if(type==='book-next'&&w.page<3){w.page++;return true;}
    if(type==='caption'&&value&&integer(value.page,0,3)&&typeof value.text==='string'){w.captions[value.page]=value.text.slice(0,160);return true;}
  }
  if(s.mode!=='lab'||!['observe','load'].includes(s.phase)||!type.startsWith('repair-'))return false;
  const r=w.repair,done=!!r.records[r.case],say=(text,mood='thinking')=>{r.message=text;r.mood=mood;};
  if(type==='repair-reset'){r.records=r.records.slice(0,r.case);r.B={...repairCases[r.case].B};r.reason=null;say('这一组回到原来的摆法。前面修好的记录还在。');return true;}
  if(type==='repair-next'&&done&&r.case<2){r.case++;r.B={...repairCases[r.case].B};r.reason=null;r.message='';r.mood='idle';return true;}
  if(done)return false;
  let changed=false;
  if(type==='repair-weight'&&/^[1-5]$/.test(String(value))){r.B.weight=Number(value);changed=true;}
  if(type==='repair-crew'){r.B.crew=!r.B.crew;changed=true;}
  if(type==='repair-depth'){r.B.free=!r.B.free;changed=true;}
  if(changed){r.reason=null;say('B栏的摆法变了。对照A栏，再检查要保留的条件。');return true;}
  if(type==='repair-reason'&&['one','same'].includes(value)){r.reason=value;say(value==='one'?'理由先留下，再检查两次的实际摆法。':'两次全都一样，还能看出要研究的变化吗？','thinking');return true;}
  if(type==='repair-check'){
    const status=repairStatus(r.case,r.B);
    if(!status.valid)say(status.message,'encourage');
    else if(r.reason!=='one')say('摆法可以比较了。再选一个理由，说明为什么这样比。','thinking');
    else{r.records.push({case:r.case,B:{...r.B},reason:'one'});say('你修好了！'+status.message+'这份修改已经记下。','happy');}
    return true;
  }
  return false;
}
