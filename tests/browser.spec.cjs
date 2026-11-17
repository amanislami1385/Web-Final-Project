/* Optional browser suite; prepared for local execution, NOT run in the authoring environment.
   See docs/TESTING.md. These tests also capture the required report screenshots. */
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
const screenshots=path.resolve(__dirname,'../docs/screenshots');
fs.mkdirSync(screenshots,{recursive:true});
const pages=['index','opportunities','planner','dashboard','resources','about'];
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
async function screenshot(page,name){await page.screenshot({path:path.join(screenshots,name+'.png'),fullPage:true});}
async function createPlan(page){
  await page.goto('/planner.html');
  await page.getByLabel('Your name',{exact:true}).fill('Aman');
  await page.getByLabel('Your direction',{exact:true}).selectOption('Digital skills');
  await page.getByLabel('Your starting point',{exact:true}).selectOption('Undergraduate');
  await page.getByLabel('Start date',{exact:true}).fill(today());
  await page.getByLabel('Hours per week',{exact:true}).fill('5');
  await page.getByLabel('What would you like to achieve?',{exact:true}).fill('Build and explain my first accessible portfolio website.');
  await page.getByLabel('I understand this plan is stored on this browser and device.').check();
  await page.getByRole('button',{name:'Save my study plan'}).click();
  await expect(page.locator('#plan-result')).toBeVisible();
}
for(const width of [375,768,1280]) for(const mode of ['light','dark']){
  test(`all pages: ${width}px, ${mode} mode`,async({page})=>{
    await page.setViewportSize({width,height:900});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(theme=>localStorage.setItem('afh-theme',JSON.stringify(theme)),mode);
    for(const slug of pages){
      const response=await page.goto('/'+slug+'.html');expect(response.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('data-theme',mode);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      expect(await page.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
      await screenshot(page,`${slug}-${width}-${mode}`);
    }
    expect(errors).toEqual([]);
  });
}
test('favorites persist across pages and reload; remove and clear work',async({page})=>{
  await page.goto('/opportunities.html');
  await page.getByRole('button',{name:'Save CS50: Computer Science',exact:true}).click();
  await page.getByRole('button',{name:'Save LearnEnglish',exact:true}).click();
  await page.goto('/dashboard.html');await expect(page.locator('#stat-saved')).toHaveText('2');
  await page.reload();await expect(page.locator('#stat-saved')).toHaveText('2');
  await page.getByRole('button',{name:'Remove LearnEnglish from saved',exact:true}).click();
  await expect(page.locator('#stat-saved')).toHaveText('1');
  await page.getByRole('button',{name:'Clear all saved',exact:true}).click();
  await page.getByRole('button',{name:'Confirm',exact:true}).click();
  await expect(page.locator('#stat-saved')).toHaveText('0');
});
test('plan validation, calculated total, milestones and study log',async({page})=>{
  await page.goto('/planner.html');await page.getByRole('button',{name:'Save my study plan'}).click();
  await expect(page.locator('#display-name-error')).not.toBeEmpty();await screenshot(page,'planner-validation');
  await createPlan(page);await expect(page.locator('#preview-hours')).toHaveText('20');await screenshot(page,'planner-saved');
  await page.goto('/dashboard.html');await page.getByRole('checkbox',{name:'Complete week 1: Discover your direction',exact:true}).check();
  await page.getByLabel('Minutes studied',{exact:true}).fill('60');await page.getByLabel('What did you work on?',{exact:true}).fill('Completed the first programming lesson.');
  await page.getByRole('button',{name:'Save this small win'}).click();
  await expect(page.locator('#stat-hours')).toHaveText('1 h');await expect(page.locator('#progress-number')).toHaveText('5%');
  await page.reload();await expect(page.locator('#stat-milestones')).toHaveText('1 / 4');await expect(page.locator('#stat-hours')).toHaveText('1 h');await screenshot(page,'dashboard-progress');
});
test('filter empty state, reset and three-item comparison limit',async({page})=>{
  await page.goto('/opportunities.html');await page.getByLabel('Search opportunities',{exact:true}).fill('no-such-resource-123');await expect(page.locator('#no-results')).toBeVisible();
  await page.getByRole('button',{name:'Show all opportunities',exact:true}).click();await expect(page.locator('#catalog-grid article')).toHaveCount(8);
  for(const name of ['Türkiye Scholarships','CS50: Computer Science','LearnEnglish'])await page.getByRole('checkbox',{name:'Compare '+name,exact:true}).check();
  await page.getByRole('checkbox',{name:'Compare DAAD Scholarship Database',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Compare DAAD Scholarship Database',exact:true})).not.toBeChecked();
  await expect(page.locator('#comparison thead th')).toHaveCount(4);await screenshot(page,'opportunities-comparison');
});
test('theme keyboard toggle persists on navigation; FAQ rapid clicks settle',async({page})=>{
  await page.goto('/index.html');await page.locator('#theme-toggle').focus();await page.keyboard.press('Enter');const theme=await page.locator('html').getAttribute('data-theme');
  await page.goto('/resources.html');await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  const faq=page.getByRole('button',{name:'Where does my saved information go?',exact:false});
  for(let i=0;i<5;i++)await faq.click();await expect(faq).toHaveAttribute('aria-expanded','true');await expect(page.locator('#faq-1')).toBeVisible();
  await page.locator('.readiness-item input').first().check();await page.reload();await expect(page.locator('#readiness-score')).toHaveText('20%');await screenshot(page,'guides-readiness');
});
test('backup download, strict import rejection and valid restore',async({page})=>{
  await createPlan(page);await page.goto('/dashboard.html');
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download backup'}).click();const file=await downloaded;const raw=fs.readFileSync(await file.path(),'utf8');const backup=JSON.parse(raw);expect(backup.data.plan.name).toBe('Aman');
  await page.locator('#import-data').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});await expect(page.locator('#backup-status')).toContainText('not valid JSON');
  backup.data.plan.name='Restored learner';
  await page.locator('#import-data').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.getByRole('button',{name:'Confirm',exact:true}).click();await expect(page.locator('#dashboard-greeting')).toContainText('Restored learner');await expect(page.locator('#backup-status')).toHaveText('Backup restored successfully.');
});
test('details dialog closes with Escape and restores focus',async({page})=>{
  await page.goto('/opportunities.html');const first=page.getByRole('button',{name:'Take a closer look'}).first();await first.click();await expect(page.locator('#detail-dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#detail-dialog')).not.toBeVisible();await expect(first).toBeFocused();
});
