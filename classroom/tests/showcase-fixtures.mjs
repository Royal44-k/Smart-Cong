import{createState}from'../src/engine.mjs';
export function finishedState(mode='story',ending='E2'){
 const s=createState(mode);s.journey='full';s.phase='reflect';s.referenceCaptured=true;s.crewPresent=true;s.cargo=[true,true,true,true,false];s.counts=[1,1,1,1,0];s.inquiry.weighed=[true,true,true,true,false];s.inquiry.reportReason='total';s.claimedMass=2700;s.ending=ending;s.firstEnding=ending==='E2'?'E4':ending;
 Object.assign(s.learning.story,{seen:['elephant','scale','boat'],guess:'lower',water:3,waterSeen:[0,1,2,3],line:'hull',book:['elephant','mark','replace','weigh'],words:{motion:'sink',object:'elephant'}});
 s.learning.workshop.captions=['先请大象上船，等水面静下来。','把记号画在船身上，记住水面的位置。','请阿舟回来，再调石头，让水面碰到记号。','每堆称一次、记一次，把重量加起来。'];
 s.reflections=mode==='story'?['我发现人也有重量。','人和物要一样，水线才好比。','我还想用小船称一篮苹果。']:['我原来猜不会变，后来看到B栏的船沉得更深。','我请阿舟回来，拿走了多出来的一小堆石头。','320克里还有工具的20克，减去后才是书箱。'];
 Object.assign(s.learning.lab,{question:'mass',hypothesis:'same',plan:'one',weight:3,samples:{A:{weight:1,crew:false,free:true},B:{weight:3,crew:false,free:true}},finding:'changes',transferNumber:'300',transferReason:'subtract'});
 Object.assign(s.learning.reasoning,{evidence:['boat','line','people'],observation:'lower',reflection:'revise',boats:['A','B'],group:'box-tool'});
 return s;
}
