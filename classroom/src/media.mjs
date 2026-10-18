export const media={
"lab_plan":{"image":"media/artwork/CC-STUDY-v003.png","video":null,"captions":"media/captions/C-L01.zh-CN.vtt","shot":"C-L01","alt":"小船实验计划的课堂桌面"},
"lab_bench":{"image":"media/artwork/CC-STUDY-v003.png","video":null,"captions":"media/captions/C-L02.zh-CN.vtt","shot":"C-L02","alt":"等待两次对比试验的小船"},
"lab_transfer":{"image":"media/artwork/CC-BOOK-TRIAL-v001.png","video":null,"captions":"media/captions/C-L03.zh-CN.vtt","shot":"C-L03","alt":"课堂桌面上的书箱、工具、砝码与空小船"},
  "harbor": {
    "image": "media/artwork/CC-HARBOR-v002.png",
    "video": null,
    "captions": "media/captions/C-V01.zh-CN.vtt",
    "shot": "C-V01",
    "alt": "码头上的大象与记筹伙伴"
  },
  "idea": {
    "image": "media/artwork/CC-HARBOR-v002.png",
    "video": null,
    "captions": "media/captions/C-V01.zh-CN.vtt",
    "shot": "C-V01",
    "alt": "大象与小秤的难题"
  },
  "scale": {
    "image": "media/artwork/CC-SCALE-v001.png",
    "video": null,
    "captions": "media/captions/C-V02A.zh-CN.vtt",
    "shot": "C-V02A",
    "alt": "老匠人与曹冲检查大秤的小模型"
  },
  "split": {
    "image": "media/artwork/CC-SPLIT-v002.png",
    "video": null,
    "captions": "media/captions/C-V02B.zh-CN.vtt",
    "shot": "C-V02B",
    "alt": "三个模型块与小秤"
  },
  "observe": {
    "image": "media/artwork/CC-POND-v001.png",
    "video": null,
    "captions": "media/captions/C-V03.zh-CN.vtt",
    "shot": "C-V03",
    "alt": "老匠人与曹冲在水槽旁观察空小船"
  },
  "reference": {
    "image": "media/artwork/CC-WATER-v001.png",
    "video": null,
    "captions": "media/captions/C-V04.zh-CN.vtt",
    "shot": "C-V04",
    "alt": "船舷、水面与参照"
  },
  "mark": {
    "image": "media/artwork/CC-WATER-v001.png",
    "video": null,
    "captions": "media/captions/C-V04.zh-CN.vtt",
    "shot": "C-V04",
    "alt": "船舷水痕特写"
  },
  "boarding": {
    "image": "media/artwork/CC-BOARDING-v002.png",
    "video": null,
    "captions": "media/captions/C-V05.zh-CN.vtt",
    "shot": "C-V05",
    "alt": "船上大象和一名船工；照护者和曹冲在岸上"
  },
  "materials": {
    "image": "media/artwork/CC-MATERIALS-v001.png",
    "video": null,
    "captions": "media/captions/C-V06.zh-CN.vtt",
    "shot": "C-V06",
    "alt": "石料、密封袋与漏水容器"
  },
  "load": {
    "image": "media/artwork/CC-UNLOADED-v001.png",
    "video": null,
    "captions": "media/captions/C-V07.zh-CN.vtt",
    "shot": "C-V07",
    "alt": "大象下船后，伙伴准备换载"
  },
  "ledger": {
    "image": "media/artwork/CC-LEDGER-v001.png",
    "video": null,
    "captions": "media/captions/C-V08.zh-CN.vtt",
    "shot": "C-V08",
    "alt": "逐批记录的情境桌面"
  },
  "review": {
    "image": "media/artwork/CC-E2-v001.png",
    "video": null,
    "captions": "media/captions/C-V09.zh-CN.vtt",
    "shot": "C-V09",
    "alt": "旧稿与新稿保留修正理由"
  },
  "report": {
    "image": "media/artwork/CC-REPORT-v001.png",
    "video": null,
    "captions": "media/captions/C-V10.zh-CN.vtt",
    "shot": "C-V10",
    "alt": "将依据摆在众人面前"
  },
  "source": {
    "image": "media/artwork/CC-STUDY-v003.png",
    "video": null,
    "captions": "media/captions/C-V11.zh-CN.vtt",
    "shot": "C-V11",
    "alt": "回到现代课堂的小船模型与学习卡"
  },
  "E1": {
    "image": "media/artwork/CC-E1-v001.png",
    "video": null,
    "captions": "media/captions/C-VE1.zh-CN.vtt",
    "shot": "C-VE1",
    "alt": "结局：别人可以复核的记录"
  },
  "E2": {
    "image": "media/artwork/CC-E2-v001.png",
    "video": null,
    "captions": "media/captions/C-VE2.zh-CN.vtt",
    "shot": "C-VE2",
    "alt": "结局：保留旧稿的修正"
  },
  "E3": {
    "image": "media/artwork/CC-E3-v001.png",
    "video": null,
    "captions": "media/captions/C-VE3.zh-CN.vtt",
    "shot": "C-VE3",
    "alt": "结局：准备下一次验证的河船"
  },
  "E4": {
    "image": "media/artwork/CC-E4-v001.png",
    "video": null,
    "captions": "media/captions/C-VE4.zh-CN.vtt",
    "shot": "C-VE4",
    "alt": "结局：对照记录查找缺项"
  }
};
for(const m of Object.values(media))m.audio='media/audio/'+m.shot+'-VO-v001.wav';
export function audioElement(key){const m=media[key];return m&&!m.video?'<details class="listen"><summary>听这段对白</summary><audio controls preload="none" data-media="'+key+'" data-shot="'+m.shot+'" src="'+m.audio+'" aria-label="本段对白朗读"></audio><p>可以边听边观察，也可以阅读本页文字。</p></details>':'';}
const attr=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function stillElement(key,className=''){const m=media[key];return m?'<img class="'+attr(className)+'" data-media="'+attr(key)+'" src="'+attr(m.image)+'" alt="'+attr(m.alt)+'" loading="eager">':'<span class="media-fallback">场景文字仍可阅读。</span>';}
export function mediaElement(key,className=''){
 const m=media[key];if(!m)return '<div class="media-fallback">场景文字仍可阅读。</div>';
 const common=' class="'+attr(className)+'" data-media="'+attr(key)+'"';
 return m.video?'<video'+common+' src="'+attr(m.video)+'" poster="'+m.image+'" controls playsinline preload="metadata" aria-label="'+attr(m.alt)+'"><track kind="subtitles" src="'+m.captions+'" srclang="zh-CN" label="中文" default></video>':'<img'+common+' src="'+m.image+'" alt="'+attr(m.alt)+'" loading="eager">';
}
export function installMediaFallbacks(root=document){root.addEventListener('error',event=>{
 const target=event.target;if(!target?.dataset?.media)return;const m=media[target.dataset.media];if(!m)return;
 if(target.tagName==='VIDEO'){
  const img=document.createElement('img');img.src=m.image;img.alt=m.alt+'；视频不可用，已切换静帧。';img.className=target.className;img.dataset.media=target.dataset.media;target.replaceWith(img);
  const status=document.querySelector('#status');if(status)status.textContent='本镜视频暂不可用，已切回图片。可阅读文字并继续互动。';
 }else if(target.tagName==='AUDIO'){const note=document.createElement('p');note.textContent='朗读暂不可用，可以阅读本页对白并继续观察。';target.replaceWith(note);
 }else if(target.tagName==='IMG'){
  const note=document.createElement('div');note.className='media-fallback '+target.className;note.textContent='图片暂不可用：'+m.alt+'。场景文字与互动仍可继续。';target.replaceWith(note);
 }
},true);}
let audioContext;
export function chime(enabled){
 if(!enabled)return;
 try{
 const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;
 audioContext??=new C();audioContext.resume().catch(()=>{});
 const o=audioContext.createOscillator(),g=audioContext.createGain();
 o.type='sine';o.frequency.setValueAtTime(440,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(330,audioContext.currentTime+.2);
 g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.3);
 o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.3);
 }catch{}
}


