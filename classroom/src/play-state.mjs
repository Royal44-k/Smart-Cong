import{workshopAction}from'./workshop-state.mjs';
export const blankPlay=()=>({round:0,solved:[],message:''});
export function validPlay(p){return !!p&&Number.isInteger(p.round)&&p.round>=0&&p.round<3&&Array.isArray(p.solved)&&p.solved.length<=3&&p.solved.every((n,i)=>n===i)&&p.solved.length<=p.round+1&&p.solved.length>=p.round&&typeof p.message==='string'&&p.message.length<=300;}
export const changeRounds=[
 {answer:'mass',A:{weight:1,crew:false,free:true},B:{weight:3,crew:false,free:true},text:'你发现木块变多了！小人和水深都没有变。'},
 {answer:'crew',A:{weight:2,crew:false,free:true},B:{weight:2,crew:true,free:true},text:'小人上船了！木块和水深一样，可以看看小人的重量带来了什么变化。'},
 {answer:'bottom',A:{weight:3,crew:false,free:true},B:{weight:3,crew:false,free:false},text:'这次水变浅了，船底碰到了盆底。盆底也在托着船。'}
];
export function playAction(s,type,value){
 if(workshopAction(s,type,value))return true;
 if(type==='book-place'&&s.mode==='story'&&s.journey==='full'&&s.phase==='source'){
  const match=/^(elephant|mark|replace|weigh):([0-3])$/.exec(String(value));if(!match)return false;
  const book=s.learning.story.book,card=match[1],slot=Number(match[2]),old=book.indexOf(card);
  if(slot>(old<0?book.length:book.length-1)||old===slot)return false;if(old!==-1)book.splice(old,1);book.splice(Math.min(slot,book.length),0,card);
  s.learning.message=book.join(',')==='elephant,mark,replace,weigh'?'四张图排顺了！再给下面的两句话选上合适的词。':'图卡放好了。可以用小箭头换位置，也可以拖到另一格。';return true;
 }
 if(s.mode!=='lab'||!['observe','load'].includes(s.phase))return false;
 const p=s.learning.play;
 if(type==='challenge-answer'&&['mass','crew','bottom'].includes(value)){
  if(p.solved.includes(p.round))return false;
  if(value===changeRounds[p.round].answer){p.solved.push(p.round);p.message=changeRounds[p.round].text;}
  else p.message='再看看两幅图：木块、小人和船底，哪一样变了？';return true;
 }
 if(type==='challenge-next'&&p.round<2&&p.solved.includes(p.round)){p.round++;p.message='';return true;}
 return false;
}
