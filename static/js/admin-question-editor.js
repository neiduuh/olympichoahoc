(function(){
  'use strict';
  const subMap={'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎'};
  const supMap={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾'};
  const reverse={}; Object.entries(subMap).forEach(([a,b])=>reverse[b]=a); Object.entries(supMap).forEach(([a,b])=>reverse[b]=a);
  function applyMap(el,map){
    if(!el) return;
    const a=el.selectionStart??0,b=el.selectionEnd??0;
    if(a===b){ alert('Hãy bôi đen phần cần đổi thành chỉ số trước. Ví dụ: chọn số 2 trong H2O rồi bấm x₂.'); el.focus(); return; }
    const selected=el.value.slice(a,b);
    const out=[...selected].map(ch=>map[ch]??ch).join('');
    el.setRangeText(out,a,b,'select'); el.dispatchEvent(new Event('input',{bubbles:true})); el.focus();
  }
  window.chemFormat=function(target,mode){
    const el=document.getElementById(target); if(!el)return;
    applyMap(el, mode==='sub'?subMap:mode==='sup'?supMap:reverse);
  };
  window.syncQuestionType=function(){
    const g=document.getElementById('game'),q=document.getElementById('qtype'),p=document.querySelector('input[name="points"]');
    if(!g||!q)return;
    if(g.value==='bee'){q.value='short';if(p){p.value=10;p.readOnly=true;}}
    if(g.value==='soccer'||g.value==='basketball'){q.value='mcq';if(p){p.value=10;p.readOnly=true;}}
    if(g.value==='racing'){q.value='tf4';if(p){p.value=50;p.readOnly=true;}}
    window.showQuestionFields();
  };
  window.showQuestionFields=function(){
    const q=document.getElementById('qtype'); if(!q)return;
    ['mcq','short','tf4'].forEach(x=>{const el=document.getElementById(x);if(el)el.style.display=x===q.value?'block':'none';});
  };
  window.previewQuestionImage=function(input){
    const img=document.getElementById('questionImagePreview'); if(!img)return;
    if(input.files&&input.files[0]){ img.src=URL.createObjectURL(input.files[0]); img.hidden=false; }
  };
  document.addEventListener('DOMContentLoaded',()=>{ window.syncQuestionType(); });
})();
