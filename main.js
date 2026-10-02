/* main.js — UI, progress, scoring */
const $=i=>document.getElementById(i),KEY='momentumMayhem.v2';
let P;try{P=JSON.parse(localStorage.getItem(KEY))}catch(e){}
P=P||{stars:[],pts:[],unlocked:1};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n),total=()=>P.pts.reduce((a,b)=>a+(b||0),0);
let cur=0,lv,spec,vals={},tries=0,busy=false,failed=false,popText='';

function refresh(){
  spec.controls.forEach(k=>{const i=$('i_'+k.id);$('o_'+k.id).textContent=G.fmt(vals[k.id],k.step<1?1:0)+k.unit});
  $('readout').innerHTML=spec.info(vals).map(r=>'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
  if(lv.prev&&!busy)lv.prev(vals);
}
function load(i,keep){
  cur=i;lv=LEVELS[i];G.clear();G.tick=null;G.ts=1;G.yaw=0;busy=failed=false;if(!keep)tries=0;
  const old=keep?vals:{};spec=lv.init(keep);vals={};
  $('lname').textContent='Level '+(i+1)+' · '+lv.name;$('ltag').textContent=lv.tag;$('formula').textContent=lv.formula;$('brief').textContent=lv.intro;
  const c=$('controls');c.innerHTML='';
  spec.controls.forEach(k=>{vals[k.id]=old[k.id]!==undefined?old[k.id]:k.val;const f=document.createElement('div');f.className='field';
    f.innerHTML='<label>'+k.label+'<b id="o_'+k.id+'"></b></label><input type="range" id="i_'+k.id+'" min="'+k.min+'" max="'+k.max+'" step="'+k.step+'" value="'+vals[k.id]+'">';
    c.appendChild(f);const inp=f.querySelector('input');inp.oninput=()=>{vals[k.id]=+inp.value;G.beep(300+vals[k.id]%40*8,.04,'triangle',.04);refresh()}});
  refresh();$('go').disabled=false;$('go').textContent='🚀 GO!';
  ['msg','win','menu'].forEach(x=>$(x).classList.toggle('hidden',x!=='msg'&&true));$('msg').classList.remove('show','hidden');$('win').classList.add('hidden');$('menu').classList.add('hidden');
  $('sc').textContent='⭐ '+total();
}
function go(){
  if(!$('menu').classList.contains('hidden')||!$('win').classList.contains('hidden'))return;
  if(failed){load(cur,true);return}
  if(busy)return;busy=true;tries++;$('go').disabled=true;$('msg').classList.remove('show');
  document.querySelectorAll('#controls input').forEach(i=>i.disabled=true);
  popText='';lv.go(vals);
}
const Game={
  pop(t){const e=$('pop');e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show')},
  end(ok,c,msg,pop){
    busy=false;G.ts=1;
    if(ok){let s=c>.7?3:c>.35?2:1;if(tries>3)s=Math.max(1,s-1);
      const pts=s*100+(tries===1?50:0);P.stars[cur]=Math.max(P.stars[cur]||0,s);P.pts[cur]=Math.max(P.pts[cur]||0,pts);P.unlocked=Math.max(P.unlocked,cur+2);save();
      $('sc').textContent='⭐ '+total();Game.pop(pop||'NICE!');[523,659,784,1047].forEach((f,i)=>setTimeout(()=>G.beep(f,.2,'triangle',.12),i*110));
      setTimeout(()=>{$('ws').textContent=stars(s);$('wt').textContent=['','Nice!','Great shot!','PERFECT!'][s];$('wm').textContent=msg+'  +'+pts+' pts';$('wf').textContent='💡 '+lv.fact;
        $('wNext').textContent=cur===LEVELS.length-1?'🏆 Finish':'Next ▶';$('win').classList.remove('hidden')},1300);
    }else{failed=true;$('msg').textContent=msg;$('msg').classList.add('show');$('go').disabled=false;$('go').textContent='↺ Reset & try again';G.beep(150,.4,'sawtooth',.1,-90)}
  }
};
function openMenu(){
  $('win').classList.add('hidden');$('grid').innerHTML='';
  LEVELS.forEach((l,i)=>{const d=document.createElement('div');d.className='lc'+(i<P.unlocked?'':' lock');
    d.innerHTML='<b>'+(i+1)+'</b><i>'+l.name+'</i><u>'+l.tag+'</u><s>'+stars(P.stars[i]||0)+'</s>';d.onclick=()=>load(i);$('grid').appendChild(d)});
  $('menu').classList.remove('hidden');
}
$('go').onclick=go;$('menuBtn').onclick=openMenu;$('wMenu').onclick=openMenu;$('wRe').onclick=()=>load(cur);
$('wNext').onclick=()=>cur===LEVELS.length-1?openMenu():load(cur+1);
$('resetP').onclick=()=>{if(confirm('Reset all progress?')){P={stars:[],pts:[],unlocked:1};save();openMenu();$('sc').textContent='⭐ 0'}};
addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});
load(0);openMenu();