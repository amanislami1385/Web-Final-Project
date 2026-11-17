'use strict';
AFH.opportunities.forEach(item=>{const li=AFH.el('li');const a=AFH.el('a','',`${item.provider} — ${item.title} ↗`);a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);document.getElementById('source-list').append(li);});
