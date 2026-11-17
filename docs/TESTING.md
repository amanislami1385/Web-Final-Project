# Verification record and local browser checks

## Completed during preparation

- 10/10 Node storage tests passed: empty state; persistence across reload; Endterm favorite migration; malformed/wrong-shaped data; quota failure; immutable snapshots; invalid import rejection; valid backup round-trip; date/range rules; deletion and cross-tab updates.
- Custom JavaScript syntax checks passed.
- Six HTML pages passed local file/anchor, duplicate ID, image alt and form-label checks.
- Semantic text color pairs passed a calculated 4.5:1 contrast threshold in both themes. This checks declared color tokens, not every rendered state.
- Native deployment succeeded. A real service-generated screenshot of the light homepage was inspected.

## Not claimed as completed

Full live browser interaction, all 36 page/size/theme layouts, focus order and W3C validation remain to be verified locally. The authoring preview service was unavailable, the hosted copy required owner sign-in, and the review browser did not permit local file pages. No test results or screenshots are fabricated.

## Run basic checks

From the project root:

```
node --test tests/storage.test.cjs
python tests/static_check.py
```

## Run optional automated browser checks

Requires a current supported Node.js installation and a local browser runtime. These commands install test tools only; the website itself needs no npm packages.

```
npm install --save-dev @playwright/test
npx playwright install chromium
```

In one terminal, run `python -m http.server 8000` (or `python3 -m http.server 8000`). In another terminal:

```
npm run test:browser
npm run test:report
```

The script saves full-page PNGs to `docs/screenshots/`. Review screenshots for overlaps, clipping, horizontal scroll and readability. The suite uses a clean browser context for each test. It does not touch your everyday browser data.

Add the saved planner, dashboard, comparison, validation, guide and mobile/dark-mode screenshots to the editable report. Run the tests again after any bug fix. Do not mark a test as passed unless you actually ran it successfully.

## Manual acceptance checks

1. Open every page in a normal browser, at 375, 768 and 1280 pixels, in both modes.
2. Use only Tab, Shift+Tab, Enter, Space and Escape. Check the menu, theme, forms, checkboxes and dialogs.
3. Save two resources, navigate to Dashboard and reload. Remove one, then clear all.
4. Create a valid plan, edit it, reload, complete a milestone and log 60 minutes. At five hours/week, the four-week target is 20 hours and logged progress is 5%.
5. Submit blank and invalid forms; errors must appear under fields with no alert boxes.
6. Test no search results; reset; compare three resources; try adding a fourth.
7. Download a backup. Change the plan. Restore the backup. Verify the earlier values return.
8. Test malformed JSON and a non-project backup. Existing data must remain unchanged.
9. In a disposable test browser profile, test storage disabled or full. Check the warning and absence of a false save-success message.
10. Open DevTools Console on each page; resolve any application errors.
11. Use https://validator.w3.org/nu/ with each HTML file or deployed URL. Fix any reported errors.
12. Open the teacher-facing deployment in a private window without your account; verify links and assets.

## Sources for the optional test tooling

- https://playwright.dev/docs/test-assertions
- https://playwright.dev/docs/test-webserver
- https://playwright.dev/docs/test-snapshots
