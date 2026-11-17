/* Plan validation, calculated hours, and persisted profile/goal. */
'use strict';
(() => {
  const field=id=>document.getElementById(id), form=field('plan-form');
  function limits(){const today=new Date(),next=new Date(today);next.setFullYear(next.getFullYear()+1);return {min:AFH.localDate(today),max:AFH.localDate(next)};}
  function refreshLimits(){const {min,max}=limits();field('start-date').min=min;field('start-date').max=max;}
  refreshLimits();
  const saved=AFH.store.get().plan;
  if(saved){field('display-name').value=saved.name;field('interest').value=saved.interest;field('level').value=saved.level;field('start-date').value=saved.start;field('weekly-hours').value=saved.hours;field('goal').value=saved.goal;field('consent').checked=true;field('editing-notice').hidden=false;}
  const validation=AFH.bindValidation(form,{
    'display-name':input=>input.value.trim().length>=2&&input.value.trim().length<=60&&/\p{L}/u.test(input.value)&&!/[<>]/.test(input.value)?'':'Enter a name or nickname of 2–60 characters without angle brackets.',
    interest:input=>['Scholarships','Digital skills','Languages','Learning'].includes(input.value)?'':'Choose your direction.',
    level:input=>['Secondary school','Undergraduate','Graduate','Independent learner'].includes(input.value)?'':'Choose your starting point.',
    'start-date':input=>{const {min,max}=limits();const unchanged=AFH.store.get().plan?.start===input.value;return AFH.store.dateValid(input.value)&&((input.value>=min&&input.value<=max)||unchanged)?'':'Choose today or a valid date within the next year.';},
    'weekly-hours':input=>input.value&&Number.isInteger(Number(input.value))&&Number(input.value)>=1&&Number(input.value)<=40?'':'Enter a whole number between 1 and 40.',
    goal:input=>input.value.trim().length>=20&&input.value.length<=500?'':'Describe your goal in 20–500 characters.',
    consent:input=>input.checked?'':'Confirm that you understand browser storage.'
  });
  function preview(){const name=field('display-name').value.trim();field('preview-name').textContent=name?`${name}’s next chapter.`:'A little effort. A lot of possibility.';field('preview-direction').textContent=field('interest').value||'Choose your direction to get started.';const value=Number(field('weekly-hours').value), hours=Number.isInteger(value)&&value>=1&&value<=40?value:0;field('preview-hours').textContent=hours*4;field('preview-weekly').textContent=`${hours} hours`;field('goal-count').textContent=`${field('goal').value.length} / 500`;}
  form.addEventListener('input',()=>{preview();field('plan-result').hidden=true;});form.addEventListener('change',preview);preview();
  form.addEventListener('submit',event=>{
    event.preventDefault();refreshLimits();
    if(!validation.validate()){field('form-status').textContent='Please correct the highlighted fields.';return;}
    const plan={name:field('display-name').value.trim(),interest:field('interest').value,level:field('level').value,start:field('start-date').value,hours:Number(field('weekly-hours').value),goal:field('goal').value.trim()};
    if(!AFH.store.update(state=>{state.plan=plan;})){field('form-status').textContent='Your plan could not be saved. Check the storage message above.';return;}
    field('form-status').textContent='Your study plan has been saved successfully.';field('result-summary').textContent=`${plan.name}, you have set aside ${plan.hours*4} hours across four weeks for ${plan.interest.toLowerCase()}, starting ${AFH.formatDate(plan.start)}.`;
    $('#plan-result').stop(true,true).prop('hidden',false).hide().fadeIn(AFH.duration());field('plan-result').scrollIntoView({behavior:AFH.duration()?'smooth':'instant',block:'start'});field('plan-result').focus({preventScroll:true});field('editing-notice').hidden=false;AFH.toast('Your plan is saved. Your next chapter is ready.');
  });
  field('download-plan').addEventListener('click',()=>{const p=AFH.store.get().plan;if(!p)return;AFH.download('AfghanFutureHope_Study_Plan.txt',`AFGHAN FUTURE HOPE\n${p.name}'s four-week study plan\n\nDirection: ${p.interest}\nStarting point: ${p.level}\nStart: ${p.start}\nWeekly hours: ${p.hours}\nFour-week total: ${p.hours*4} hours\nGoal: ${p.goal}\n\nWeek 1: Discover and choose your resource.\nWeek 2: Prepare materials and a study routine.\nWeek 3: Practise and produce a small piece of work.\nWeek 4: Reflect on your progress and choose a next step.\n\nPreparation estimates only. Confirm provider eligibility, dates and costs.\nYour interactive progress is saved on the Dashboard in your browser.\n`);});
})();
