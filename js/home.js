'use strict';
[AFH.opportunities[0],AFH.opportunities[1],AFH.opportunities[2]].forEach(item=>document.getElementById('featured-grid').append(AFH.card(item)));
AFH.refreshSaved();
