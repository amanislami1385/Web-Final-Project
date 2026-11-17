/* Shared UI helpers. User text is inserted with textContent, never as HTML. */
'use strict';
(() => {
  AFH.el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  AFH.duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  AFH.localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  AFH.formatDate = value => new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  AFH.hours = minutes => Number((minutes / 60).toFixed(1));
  AFH.download = (filename, content, type = 'text/plain;charset=utf-8') => {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const a = AFH.el('a'); a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  let toastTimer;
  AFH.toast = message => {
    clearTimeout(toastTimer);
    const toast = $('#site-toast');
    // jQuery effect 1: fade status messages; stop prevents animation queues.
    toast.stop(true,true).text(message).prop('hidden',false).hide().fadeIn(AFH.duration());
    toastTimer = setTimeout(() => toast.stop(true,true).fadeOut(AFH.duration(), () => toast.prop('hidden',true)), 3500);
  };
  AFH.confirm = (title, message) => new Promise(resolve => {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-text').textContent = message;
    let answer = false;
    document.getElementById('confirm-yes').onclick = () => { answer = true; dialog.close(); };
    document.getElementById('confirm-no').onclick = () => dialog.close();
    dialog.addEventListener('close', () => resolve(answer), {once:true});
    dialog.showModal(); document.getElementById('confirm-no').focus();
  });
  AFH.error = (input, message) => {
    document.getElementById(input.id + '-error').textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };
  AFH.bindValidation = (form, rules) => {
    const touched = new Set(); let submitted = false;
    const fields = Object.keys(rules).map(id => document.getElementById(id));
    const check = field => AFH.error(field, rules[field.id](field));
    fields.forEach(field => {
      field.addEventListener('blur', () => { touched.add(field.id); check(field); });
      ['input','change'].forEach(type => field.addEventListener(type, () => { if (submitted || touched.has(field.id)) check(field); }));
    });
    return {
      validate() {
        submitted = true;
        const results = fields.map(check);
        const first = fields[results.indexOf(false)];
        if (first) first.focus();
        return results.every(Boolean);
      },
      clear() { submitted = false; touched.clear(); fields.forEach(field => AFH.error(field, '')); }
    };
  };
  AFH.empty = (title, description, link, label) => {
    const box = AFH.el('div','empty-state');
    const icon = AFH.el('span','','↗'); icon.setAttribute('aria-hidden','true');
    box.append(icon, AFH.el('h3','',title), AFH.el('p','',description));
    if (link) { const a = AFH.el('a','btn btn-outline',label); a.href = link; box.append(a); }
    return box;
  };
  AFH.saveButton = item => {
    const button = AFH.el('button','save-button'); button.type = 'button'; button.dataset.saveId = item.id;
    button.setAttribute('aria-label',`Save ${item.title}`);
    button.addEventListener('click', () => {
      const already = AFH.store.get().saved.includes(item.id);
      if (AFH.store.update(s => { s.saved = already ? s.saved.filter(id => id !== item.id) : [...s.saved,item.id]; }))
        AFH.toast(already ? 'Removed from your saved opportunities.' : 'Saved. Find it on your Dashboard.');
    });
    return button;
  };
  AFH.card = (item, compare = false) => {
    const card = AFH.el('article','resource-card');
    const imgWrap = AFH.el('div','resource-image-wrap');
    const img = AFH.el('img','resource-image'); img.src = `images/learning-${item.image}.jpg`; img.alt = item.alt; img.loading='lazy'; img.width=480; img.height=260;
    imgWrap.append(img, AFH.el('span','badge-soft',item.category));
    const body = AFH.el('div','resource-body');
    body.append(AFH.el('p','provider',item.provider), AFH.el('h3','',item.title), AFH.el('p','resource-description',item.description));
    const meta = AFH.el('div','resource-meta'); meta.append(AFH.el('span','',item.accessLabel), AFH.el('span','',`${item.prepHours} h / week`)); body.append(meta);
    const actions = AFH.el('div','card-actions');
    let details;
    if (document.getElementById('detail-dialog')) { details = AFH.el('button','text-button','Take a closer look ↗'); details.type='button'; details.addEventListener('click', () => AFH.openDetails(item)); }
    else { details = AFH.el('a','text-link','Take a closer look ↗'); details.href = `opportunities.html?resource=${encodeURIComponent(item.id)}`; }
    actions.append(details, AFH.saveButton(item)); body.append(actions);
    if (compare) {
      const label = AFH.el('label','compare-check'); const checkbox = AFH.el('input'); checkbox.type='checkbox'; checkbox.dataset.compareId=item.id; checkbox.checked=AFH.store.get().compare.includes(item.id);
      checkbox.setAttribute('aria-label',`Compare ${item.title}`);
      checkbox.addEventListener('change', () => {
        const checked = checkbox.checked;
        if (checked && AFH.store.get().compare.length >= 3) { checkbox.checked=false; AFH.toast('Compare up to three. Remove an option first.'); return; }
        if (!AFH.store.update(s => { s.compare = checked ? [...s.compare,item.id] : s.compare.filter(id => id !== item.id); })) checkbox.checked=!checked;
      });
      label.append(checkbox, document.createTextNode('Compare')); body.append(label);
    }
    card.append(imgWrap,body); return card;
  };
  AFH.refreshSaved = () => {
    const s=AFH.store.get();
    document.querySelectorAll('.saved-count').forEach(n => n.textContent=s.saved.length);
    document.querySelectorAll('[data-save-id]').forEach(button => {
      const saved=s.saved.includes(button.dataset.saveId); const item=AFH.opportunities.find(i=>i.id===button.dataset.saveId);
      button.setAttribute('aria-pressed',String(saved)); button.textContent=saved?'✓ Saved':'+ Save'; button.setAttribute('aria-label',`${saved?'Remove':'Save'} ${item.title}`);
    });
    document.querySelectorAll('[data-compare-id]').forEach(input => input.checked=s.compare.includes(input.dataset.compareId));
  };
  window.addEventListener('afh:change',AFH.refreshSaved); AFH.refreshSaved(); AFH.store.showProblem();
  const themeButton=document.getElementById('theme-toggle');
  const reflectTheme=()=>{const dark=document.documentElement.dataset.theme==='dark';themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);document.getElementById('theme-label').textContent=dark?'Light':'Dark';};
  themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('afh-theme',JSON.stringify(theme));}catch{AFH.toast('Theme changed for this page. Browser storage is unavailable.');}reflectTheme();});
  window.addEventListener('storage',e=>{if(e.key==='afh-theme'){try{const theme=JSON.parse(e.newValue);if(['light','dark'].includes(theme)){document.documentElement.dataset.theme=theme;reflectTheme();}}catch{/* Ignore invalid theme only. */}}});
  reflectTheme(); document.getElementById('year').textContent=new Date().getFullYear();
  // jQuery effect 2: accessible FAQ disclosure with interrupted queues cleared.
  $('.faq-toggle').on('click',function(){const open=this.getAttribute('aria-expanded')==='true';const panel=$('#'+this.getAttribute('aria-controls'));panel.stop(true,true);this.setAttribute('aria-expanded',String(!open));this.querySelector('span').textContent=open?'+':'−';if(open)panel.slideUp(AFH.duration(),()=>panel.prop('hidden',true));else panel.prop('hidden',false).hide().slideDown(AFH.duration());});
  // jQuery effect 3: animated scrolling plus keyboard focus transfer.
  function scrollToTarget(target){$('html, body').stop(true).animate({scrollTop:Math.max(0,target.getBoundingClientRect().top+scrollY-105)},AFH.duration());if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{const target=document.querySelector(a.getAttribute('href'));if(target){event.preventDefault();scrollToTarget(target);}}));
  const top=document.getElementById('back-top'); const updateScroll=()=>top.hidden=scrollY<600;window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();top.addEventListener('click',()=>scrollToTarget(document.querySelector('.brand')));
  const navigation=document.getElementById('navigation');navigation.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('show')){bootstrap.Collapse.getOrCreateInstance(navigation).hide();document.querySelector('.menu-button').focus();}});
})();
