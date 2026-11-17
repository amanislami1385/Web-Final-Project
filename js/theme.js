/* Runs in the head to prevent a flash of the wrong theme. */
'use strict';
try {
  const stored = JSON.parse(localStorage.getItem('afh-theme'));
  document.documentElement.dataset.theme = stored === 'light' || stored === 'dark'
    ? stored : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch {
  document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
