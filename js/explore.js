'use strict';
(() => {
  const search=document.getElementById('search'), access=document.getElementById('access-filter'), sort=document.getElementById('sort'), grid=document.getElementById('catalog-grid');
  const params=new URLSearchParams(location.search);
  let category=['Scholarships','Digital skills','Languages','Learning'].includes(params.get('category'))?params.get('category'):'all';
  function render(){
    const query=search.value.trim().toLocaleLowerCase();
    let result=AFH.opportunities.filter(item=>(category==='all'||item.category===category)&&(access.value==='all'||item.access===access.value)&&`${item.title} ${item.provider} ${item.location} ${item.category} ${item.description}`.toLocaleLowerCase().includes(query));
    if(sort.value==='title')result.sort((a,b)=>a.title.localeCompare(b.title));
    if(sort.value==='hours')result.sort((a,b)=>a.prepHours-b.prepHours);
    grid.replaceChildren(...result.map(item=>AFH.card(item,true)));
    document.getElementById('results-count').textContent=`${result.length} of ${AFH.opportunities.length} opportunities`;
    document.getElementById('no-results').hidden=result.length>0;
    document.querySelectorAll('[data-category]').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $(grid).stop(true,true).hide().fadeIn(AFH.duration()); AFH.refreshSaved();
  }
  function reset(){search.value='';access.value='all';sort.value='featured';category='all';render();}
  search.addEventListener('input',render);access.addEventListener('change',render);sort.addEventListener('change',render);
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;render();}));
  document.getElementById('reset-filters').addEventListener('click',reset);document.getElementById('empty-reset').addEventListener('click',reset);
  function compare(){
    const selected=AFH.store.get().compare.map(id=>AFH.opportunities.find(item=>item.id===id));
    const panel=document.getElementById('comparison');document.getElementById('clear-compare').disabled=!selected.length;
    if(!selected.length){panel.replaceChildren(AFH.el('p','','Your comparison is a blank canvas. Select a few possibilities above.'));return;}
    const wrap=AFH.el('div','table-responsive');const table=AFH.el('table','table');
    const caption=AFH.el('caption','',`Comparing ${selected.length} opportunities. Hours are suggested preparation estimates.`);table.append(caption);
    const head=AFH.el('thead'),headRow=AFH.el('tr');const label=AFH.el('th','','At a glance');label.scope='col';headRow.append(label);
    selected.forEach(item=>{const th=AFH.el('th','',item.title);th.scope='col';headRow.append(th);});head.append(headRow);table.append(head);
    const body=AFH.el('tbody');
    [['Direction','category'],['Location','location'],['Access','accessLabel'],['Hours / week','prepHours']].forEach(([label,key])=>{const row=AFH.el('tr'),th=AFH.el('th','',label);th.scope='row';row.append(th);selected.forEach(item=>row.append(AFH.el('td','',String(item[key]))));body.append(row);});
    const row=AFH.el('tr'),th=AFH.el('th','','Manage');th.scope='row';row.append(th);
    selected.forEach(item=>{const td=AFH.el('td'),button=AFH.el('button','text-button','Remove');button.type='button';button.setAttribute('aria-label',`Remove ${item.title} from comparison`);button.addEventListener('click',()=>AFH.store.update(s=>{s.compare=s.compare.filter(id=>id!==item.id);}));td.append(button);row.append(td);});body.append(row);table.append(body);wrap.append(table);panel.replaceChildren(wrap);
  }
  document.getElementById('clear-compare').addEventListener('click',()=>AFH.store.update(s=>{s.compare=[];}));window.addEventListener('afh:change',compare);
  const dialog=document.getElementById('detail-dialog');dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  AFH.openDetails=item=>{
    const content=document.getElementById('detail-content');const title=AFH.el('h2','',item.title);title.id='detail-title';const meta=AFH.el('div','detail-meta');meta.append(AFH.el('span','badge-soft',item.category),AFH.el('span','badge-soft',item.location));
    const prep=AFH.el('div','detail-preparation');prep.append(AFH.el('h3','','Your first step'),AFH.el('p','',item.preparation));
    const actions=AFH.el('div','button-row');const visit=AFH.el('a','btn btn-primary','Visit official provider ↗');visit.href=item.url;visit.target='_blank';visit.rel='noopener noreferrer';actions.append(visit,AFH.saveButton(item));
    content.replaceChildren(AFH.el('p','eyebrow',item.provider),title,meta,AFH.el('p','',item.details),prep,AFH.el('p','small-text',`${item.prepHours} hours per week is a planning estimate. Check current dates, costs and eligibility on the provider’s website.`),actions);AFH.refreshSaved();dialog.showModal();
  };
  render();compare();const resource=AFH.opportunities.find(i=>i.id===params.get('resource'));if(resource)AFH.openDetails(resource);
})();
