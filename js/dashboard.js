/* Dashboard renders derived values from the saved JSON state. */
'use strict';
(() => {
  const el=AFH.el, get=id=>document.getElementById(id);
  const milestoneTitles=['Discover your direction','Prepare your starting point','Practise with purpose','Reflect and move forward'];
  const milestoneContent={
    'Scholarships':['Read eligibility criteria for one scholarship and save its official page.','List the required documents and draft a motivation-letter outline.','Improve one application document and check it against the official instructions.','Review your preparation, confirm current dates and choose your next action.'],
    'Digital skills':['Choose one course and complete an introductory lesson.','Set up your tools and create a realistic practice schedule.','Build a small project using what you have learned.','Review your project, explain your code and choose your next skill.'],
    'Languages':['Choose a language skill and try one introductory exercise.','Prepare a short vocabulary list and schedule regular practice.','Complete listening, reading or writing exercises and record what you learn.','Repeat an earlier exercise and notice what has become easier.'],
    'Learning':['Choose one subject and identify a lesson at your current level.','Gather the learning materials and plan short study sessions.','Work through a lesson and practise without looking at the solution.','Review your notes and choose one topic to explore next.']
  };
  function renderStats(s){const minutes=s.sessions.reduce((sum,entry)=>sum+entry.minutes,0),target=s.plan?s.plan.hours*4:0;get('stat-saved').textContent=s.saved.length;get('stat-milestones').textContent=`${s.milestones.length} / 4`;get('stat-hours').textContent=`${AFH.hours(minutes)} h`;get('stat-target').textContent=`${target} h`;const percent=target?Math.min(100,Math.round(minutes/(target*60)*100)):0;get('progress-ring').style.setProperty('--percent',percent+'%');get('progress-ring').setAttribute('aria-label',`${percent} percent of study target completed`);get('progress-number').textContent=percent+'%';get('progress-caption').textContent=target?`${AFH.hours(minutes)} of ${target} planned hours logged. ${percent===100?'You reached your time target. Keep learning!':'Every small session moves you forward.'}`:'Create a plan to give your study time a target.';}
  function renderJourney(s){
    get('dashboard-greeting').replaceChildren();
    if(s.plan){get('dashboard-greeting').append(document.createTextNode(`Keep going, ${s.plan.name}.`));get('edit-plan-link').textContent='Edit my plan ↗';}
    else{get('dashboard-greeting').append(document.createTextNode('Keep '),el('em','','moving forward.'));get('edit-plan-link').textContent='Create a plan ↗';}
    const content=get('journey-content');
    if(!s.plan){content.replaceChildren(AFH.empty('A fresh page is a good start.','Create a four-week plan to see your milestones here.','planner.html','Build my plan ↗'));return;}
    const summary=el('div','goal-summary');summary.append(el('strong','',s.plan.interest+' · '+s.plan.hours+' hours / week'),el('p','',s.plan.goal));summary.lastChild.style.marginBottom='0';
    const journey=el('div');
    milestoneTitles.forEach((title,index)=>{
      const done=s.milestones.includes(index), row=el('article','milestone'+(done?' is-complete':''));
      row.append(el('span','milestone-number',done?'✓':String(index+1).padStart(2,'0')));
      const body=el('div','milestone-body'),label=el('label'),input=el('input');input.type='checkbox';input.checked=done;input.dataset.milestone=index;input.setAttribute('aria-label',`Complete week ${index+1}: ${title}`);
      input.addEventListener('change',()=>{const checked=input.checked;if(AFH.store.update(s=>{s.milestones=checked?[...s.milestones,index]:s.milestones.filter(i=>i!==index);})){AFH.toast(checked?'Milestone completed. One step closer.':'Milestone marked incomplete.');const next=document.querySelector('[data-milestone="'+index+'"]');if(next)next.focus();}else input.checked=!checked;});
      label.append(input,document.createTextNode(title));
      const date=new Date(s.plan.start+'T12:00:00');date.setDate(date.getDate()+7*index);
      body.append(el('small','',`WEEK ${index+1} · FROM ${AFH.formatDate(AFH.localDate(date))}`),label,el('p','',milestoneContent[s.plan.interest][index]));row.append(body);journey.append(row);
    });
    content.replaceChildren(summary,journey);
  }
  function renderSaved(s){const content=get('saved-content'),items=s.saved.map(id=>AFH.opportunities.find(item=>item.id===id));get('clear-saved').disabled=!items.length;
    get('saved-total').textContent=items.length?`${items.length} saved opportunities · ${items.reduce((sum,item)=>sum+item.prepHours,0)} suggested preparation hours per week in total. Choose a manageable combination.`:'';
    if(!items.length){content.replaceChildren(AFH.empty('Your next possibility is out there.','Save opportunities from Explore and find them here, even after a reload.','opportunities.html','Discover opportunities ↗'));return;}
    const wrap=el('div','table-responsive'),table=el('table','table saved-table');table.append(el('caption','','Your saved education resources. Remove individual items or clear the list.'));const head=el('thead'),row=el('tr');['Opportunity','Direction','Hours / week','Actions'].forEach(text=>{const th=el('th','',text);th.scope='col';row.append(th);});head.append(row);table.append(head);const body=el('tbody');
    items.forEach(item=>{const row=el('tr'),name=el('th');name.scope='row';const link=el('a','',item.title+' ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';name.append(link,el('small','',item.provider));const actions=el('td'),remove=el('button','btn btn-outline','Remove');remove.type='button';remove.setAttribute('aria-label',`Remove ${item.title} from saved`);remove.addEventListener('click',()=>{if(AFH.store.update(s=>{s.saved=s.saved.filter(id=>id!==item.id);})){AFH.toast('Opportunity removed.');get('saved-title').tabIndex=-1;get('saved-title').focus();}});actions.append(remove);row.append(name,el('td','',item.category),el('td','',String(item.prepHours)),actions);body.append(row);});table.append(body);wrap.append(table);content.replaceChildren(wrap);
  }
  function renderSessions(s){get('session-count').textContent=`${s.sessions.length} session${s.sessions.length===1?'':'s'}`;const list=get('session-list');if(!s.sessions.length){list.replaceChildren(AFH.empty('Your effort deserves a record.','Finish a little learning, then log your first session.'));return;}
    const sessions=[...s.sessions].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
    list.replaceChildren(...sessions.map(entry=>{const row=el('article','session-entry'),text=el('div');text.append(el('strong','',`${entry.minutes} minutes`),el('small','',` · ${AFH.formatDate(entry.date)}`),el('p','',entry.note));const remove=el('button','text-button danger-text','Delete');remove.type='button';remove.setAttribute('aria-label',`Delete ${entry.minutes} minute session on ${entry.date}`);remove.addEventListener('click',async()=>{if(await AFH.confirm('Delete this study session?','This removes the session from your study log and recalculates your total time.')){if(AFH.store.update(s=>{s.sessions=s.sessions.filter(item=>item.id!==entry.id);})){AFH.toast('Study session deleted.');get('log-title').tabIndex=-1;get('log-title').focus();} }});row.append(text,remove);return row;}));
  }
  function render(){const s=AFH.store.get();renderStats(s);renderJourney(s);renderSaved(s);renderSessions(s);}
  window.addEventListener('afh:change',render);render();
  get('clear-saved').addEventListener('click',async()=>{if(await AFH.confirm('Clear saved opportunities?','Your study plan and study sessions will remain. You can save the opportunities again from Explore.')){if(AFH.store.update(s=>{s.saved=[];}))AFH.toast('Saved opportunities cleared.'); }});
  const today=AFH.localDate();get('session-date').value=today;get('session-date').max=today;get('session-date').min='2000-01-01';
  const validation=AFH.bindValidation(get('session-form'),{
    'session-date':input=>AFH.store.dateValid(input.value)&&input.value>='2000-01-01'&&input.value<=AFH.localDate()?'':'Choose a valid study date from 2000 through today.',
    'session-minutes':input=>Number.isInteger(Number(input.value))&&Number(input.value)>=5&&Number(input.value)<=480&&Number(input.value)%5===0?'':'Enter 5–480 minutes in steps of 5.',
    'session-note':input=>input.value.trim().length>=5&&input.value.length<=160?'':'Describe your study session in 5–160 characters.'
  });
  get('session-form').addEventListener('submit',event=>{event.preventDefault();if(!validation.validate()){get('session-status').textContent='Please correct the highlighted fields.';return;}if(AFH.store.get().sessions.length>=500){get('session-status').textContent='Your log holds 500 sessions. Export a backup before deleting old sessions.';return;}
    const session={id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),date:get('session-date').value,minutes:Number(get('session-minutes').value),note:get('session-note').value.trim()};
    if(!AFH.store.update(s=>s.sessions.push(session))){get('session-status').textContent='Session was not saved. Check the storage message above.';return;}get('session-form').reset();get('session-date').value=AFH.localDate();validation.clear();get('session-status').textContent='Your study session is saved. A small win worth noticing.';AFH.toast('Small win saved. Your study total has been updated.');});
  get('export-data').addEventListener('click',()=>{const backup={app:'Afghan Future Hope',version:1,exportedAt:new Date().toISOString(),data:AFH.store.get()};AFH.download(`AfghanFutureHope_Backup_${AFH.localDate()}.json`,JSON.stringify(backup,null,2),'application/json');get('backup-status').textContent='Backup download started. Keep the file private; it contains your plan and notes.';});
  get('import-data').addEventListener('change',async event=>{const input=event.target,file=input.files[0];if(!file)return;try{if(file.size>1024*1024)throw Error('Choose a JSON backup smaller than 1 MB.');const data=AFH.store.validateBackup(JSON.parse(await file.text()));if(await AFH.confirm('Restore this backup?',`This replaces your current local progress with ${data.saved.length} saved opportunities, ${data.sessions.length} sessions and ${data.plan?'one plan':'no plan'}. Download your current backup first if you want to keep it.`)){if(AFH.store.replace(data)){get('backup-status').textContent='Backup restored successfully.';AFH.toast('Your backup is restored.');}else get('backup-status').textContent='Restore failed. Your existing progress is unchanged.';}}catch(error){get('backup-status').textContent=error instanceof SyntaxError?'This file is not valid JSON. Your progress is unchanged.':error.message;}finally{input.value='';}});
  get('print-dashboard').addEventListener('click',()=>window.print());
  get('reset-data').addEventListener('click',async()=>{if(await AFH.confirm('Delete all your local progress?','This deletes your saved opportunities, plan, milestones, readiness checklist, comparison and study log from this browser. Download a backup first if you want to keep them.')){if(AFH.store.reset()){get('backup-status').textContent='Your local project data has been deleted.';AFH.toast('Your local progress has been deleted.');}}});
})();
