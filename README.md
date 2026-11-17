# Afghan Future Hope — Final Project

A six-page, buildless HTML/CSS/JavaScript release of the provided Afghan Future Hope Endterm project. Project owner credited in the supplied work: **Aman Islami, IT-2510**.

## Run the project

1. Extract the ZIP completely. Open the extracted project folder in VS Code.
2. Open a terminal in the folder containing `index.html`.
3. Run `python -m http.server 8000` (on macOS/Linux, use `python3` if needed).
4. Open **http://localhost:8000** in Chrome, Edge or Firefox.
5. Keep that terminal open. Press Ctrl+C when finished.

No installation, database or build is needed to use the website. VS Code Live Server is another option. Directly opening HTML files can display the pages, but file-URL storage behavior differs by browser. Use the same HTTP origin and port for reliable cross-page saving.

## What is included

| Page | Purpose |
| --- | --- |
| `index.html` | Redesigned home, category navigation and featured resources |
| `opportunities.html` | Search, category/access filters, sort, details, save and compare up to three |
| `planner.html` | Validated profile and goal form, four-week calculated plan, saved editing and text download |
| `dashboard.html` | Saved resources, four milestones, study-session log, totals, backup/restore, print and deletion |
| `resources.html` | Three practical guides, saved readiness checklist and animated FAQs |
| `about.html` | Purpose, privacy, AI disclosure, licenses, resource and repository links |

All pages share a responsive navigation bar, current-page indicator, local theme preference, visible focus states and consistent light/dark styles. Bootstrap and jQuery are bundled locally. All photographs and Inter fonts are included.

## How saving works

- `afh-final-v1`: one JSON object containing saved IDs, comparison IDs, plan, milestones, readiness and sessions.
- `afh-theme`: `"light"` or `"dark"`, stored as JSON.
- The site remembers data in the same browser profile and origin. It does not sync to a cloud database or another device.
- Dashboard offers JSON export and validated restore. Import asks before replacing current data.
- Storage failures are shown; an unsuccessful write does not pretend to save.
- Existing Endterm `afh-saved` favorites migrate when the final is served from the **same origin**. The expanded readiness checklist starts fresh because its items differ.
- No passwords, email, phone numbers or sensitive documents are requested. Anyone using the same browser profile can view the data.

## Review before submission

Read `docs/SUBMISSION_CHECKLIST.md` first. The supplied archives point to different Midterm and Endterm GitHub repositories; the teacher requires the same course repository. Confirm which repository is approved. Do not create a new GitHub repository for the final unless the instructor permits it.

Private review copy: https://afghan-future-hope-final-aman.tautbeak2.chatgpt.site

This copy requires the owner's ChatGPT sign-in. It is **not a verified public teacher-facing GitHub Pages deployment**. Publish the package to the approved original course repository and add that working public URL to the report before submission.

## Verification

- `node --test tests/storage.test.cjs`: ten storage/data tests, executed successfully during preparation.
- `python tests/static_check.py`: static local-link and markup checks, executed successfully.
- Optional browser suite: see `docs/TESTING.md`. It covers all six pages at 375, 768 and 1280 pixels, both themes, persistence, forms, comparisons, backup and keyboard behavior. **It still needs to be run locally.**
- A real deployment-generated homepage screenshot is included in `docs/screenshots/homepage-live.png`.

Read `docs/DEFENSE_GUIDE.md` to understand the code. The teacher grades your own explanation and contribution; study and verify the implementation instead of memorizing a script.

## Folder map

- `css/`: custom style sheet, local font definitions and Bootstrap CSS.
- `js/`: one file per page, shared UI helpers, data and storage; local vendor libraries in `js/vendor/`.
- `images/`, `fonts/`: local assets retained from the Endterm.
- `docs/`: report source, screenshot, verification notes, defense and submission guidance.
- `tests/`: reproducible storage checks and optional browser checks.
