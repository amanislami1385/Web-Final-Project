'use strict';
(() => {
  AFH.readinessSteps=['I have chosen one learning goal.','I have checked the official provider’s requirements.','I have found a realistic time to study each week.','I have prepared the materials or documents I need.','I know how to save a backup of my progress.'];
  const list=document.getElementById('readiness-list');
  AFH.readinessSteps.forEach((text,index)=>{const label=AFH.el('label','readiness-item');const input=AFH.el('input');input.type='checkbox';input.dataset.ready=index;input.addEventListener('change',()=>{const checked=input.checked;if(!AFH.store.update(s=>{s.readiness=checked?[...s.readiness,index]:s.readiness.filter(i=>i!==index);})){input.checked=!checked;return;}AFH.toast(checked?'Preparation step saved. Keep going.':'Preparation step unchecked.');});label.append(input,document.createTextNode(text));list.append(label);});
  function render(){const ready=AFH.store.get().readiness;list.querySelectorAll('input').forEach(input=>input.checked=ready.includes(Number(input.dataset.ready)));const percent=Math.round(ready.length/5*100);document.getElementById('readiness-score').textContent=`${percent}%`;document.getElementById('readiness-progress').setAttribute('aria-valuenow',percent);document.querySelector('#readiness-progress .progress-bar').style.width=percent+'%';document.getElementById('readiness-caption').textContent=`${ready.length} of 5 preparation steps complete. ${ready.length===5?'You have a clear starting point.':'One small step at a time.'}`;}
  window.addEventListener('afh:change',render);render();
})();
