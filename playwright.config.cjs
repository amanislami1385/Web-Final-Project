// Optional local verification. First install: npm install --save-dev @playwright/test
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', testMatch: 'browser.spec.cjs', workers: 1,
  timeout: 60000, reporter: [['list'], ['html', {open:'never'}]],
  use: {baseURL:'http://127.0.0.1:8000', viewport:{width:1280,height:900}, reducedMotion:'reduce', trace:'retain-on-failure', screenshot:'only-on-failure'},
  // Start a static server separately using the README instructions.
});
