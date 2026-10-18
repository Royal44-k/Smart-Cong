export const blankBridge=()=>({memory:'now',tools:null,checked:false});
const weight=n=>Number.isInteger(n)&&n>=0&&n<=320&&n%10===0;
export const validBridge=b=>!!b&&['before','now'].includes(b.memory)&&(b.tools===null||weight(b.tools))&&typeof b.checked==='boolean'&&(!b.checked||b.tools!==null);
export function bridgeAction(s,type,value){
 if(!s.learning?.enabled||s.journey!=='full')return false;
 const l=s.learning,b=l.bridge;
 if(s.mode==='story'&&s.phase==='load'&&type==='memory-view'&&['before','now'].includes(value)){b.memory=value;return true;}
 if(s.mode!=='lab'||s.phase!=='source'||l.reasoning.boats.length!==2||l.reasoning.group!=='box-tool')return false;
 if(type==='split-weight'&&weight(value)){b.tools=value;b.checked=false;l.message='';return true;}
 if(type==='split-check'&&b.tools!==null){b.checked=true;return true;}
 if(type==='split-reset'){b.tools=null;b.checked=false;return true;}
 return false;
}
export function splitFeedback(b){
 if(b.tools===null)return '先试着给工具分一点重量，再看看书箱还剩多少。';
 if(!b.checked)return '这是你的试分。和题目中的20克工具核对一下。';
 if(b.tools===20)return '对上了！两部分合起来仍是320克，工具这份也与题目相同。再用自己的算式说明书箱有多重。';
 return '两部分合起来是320克。不过，你给工具分了'+b.tools+'克，题目中的工具是20克。调一调，再核对。';
}
export function transferFeedback(l){
 if(l.reasoning.required&&(l.reasoning.boats.length!==2||l.reasoning.group!=='box-tool'))return '先把相同的船配成一对，再找全砝码替代的物品。';
 const n=Number(l.lab.transferNumber);
 if(l.lab.transferNumber==='')return '书箱的重量还没有写下。可以先用重量尺试一试，再自己算一算。';
 if(n===320)return '320克还包含工具的重量。我们只想知道书箱有多重，可以怎样算？';
 if(n===340)return '320克里已经有工具的重量了。又加20克，工具的重量就算了两次。再看看怎样只留下书箱。';
 if(n!==300)return '再核对一下：书箱和20克工具合起来，要与320克砝码一样重。';
 return '重量写下了。再说说：320克里已经含有工具的重量，应该怎样只留下书箱？';
}
