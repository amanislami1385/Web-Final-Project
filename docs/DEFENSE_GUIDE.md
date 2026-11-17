# Two-minute defense practice

Use this as preparation, not a text to read aloud. Explain the code in your own words and show only what you understand.

## A 90-second demonstration

| Time | Show | Explain |
| --- | --- | --- |
| 0–10 s | Home | “Afghan Future Hope helps Afghan learners discover resources, plan their study and track progress.” |
| 10–20 s | Theme toggle, then another page | A CSS data attribute selects theme variables; localStorage remembers the choice across pages. |
| 20–35 s | Explore: filter and save two items | Cards come from an array of objects. Filtering uses conditions; saving stores IDs rather than duplicating resource details. |
| 35–55 s | My plan: submit blank, then a prepared valid example | Inline validation checks the fields. Weekly hours × 4 gives the plan total. Save before navigating away. |
| 55–75 s | Dashboard: reload, complete one week, record a session | JSON state is loaded again; the dashboard derives totals from the stored records. |
| 75–90 s | Mobile view and Guides FAQ | The Bootstrap grid and custom breakpoints adapt the layout. jQuery adds useful slide, fade and scroll effects. |

For the final 30 seconds, open the relevant JavaScript file and explain one function. Keep the website and VS Code open before being called.

## Code you should be able to explain

| File | Main responsibility | Questions to practise |
| --- | --- | --- |
| `js/data.js` | Eight resource objects | Why is a data array easier to maintain than eight repeated cards? |
| `js/store.js` | Load, validate, clone, save, restore and reset one JSON state | Why use JSON.stringify/parse? What happens when storage is full? Why validate imported data? |
| `js/common.js` | Shared rendering, saved buttons, dialogs, validation and jQuery effects | Why use textContent for user input? What does stop(true,true) prevent? |
| `js/explore.js` | Search/filter/sort, comparison and details | How do multiple filters combine? How is an empty result handled? |
| `js/planner.js` | Field rules, live preview and saved plan | Why is a decimal weekly-hours input rejected? How is the total calculated? |
| `js/dashboard.js` | Milestones, sessions, derived totals, backup and restore | How does reduce calculate total minutes? Why is displayed progress capped at 100%? |
| `js/guides.js` | Saved readiness checklist | Why is readiness calculated from completed items? |
| `js/theme.js` + `css/style.css` | Early theme initialization and visual tokens | Why load the theme before the page styles? Why use CSS variables? |

## Key calculations

- Four-week target = weekly hours × 4.
- Logged study hours = sum of session minutes ÷ 60, rounded to one decimal place.
- Study progress = min(100, round(total minutes ÷ (weekly hours × 4 × 60) × 100)).
- Readiness = completed preparation steps ÷ 5 × 100.
- Suggested saved-resource workload = sum of each saved resource's prepHours. This is an estimate, not an official course duration.

## Data flow in plain language

1. The page loads the resource array, then the storage module.
2. The storage module reads `afh-final-v1` and validates its shape.
3. The page renders the current data and calculated values.
4. A user action edits a copy of the state.
5. The code tries to save the new JSON to localStorage.
6. Only after saving succeeds does the new state become active and notify the page to update.
7. If saving fails, the site shows a warning rather than claiming success.

## Debugging answer

Reproduce the problem. Read the Console error and its file/line. Check the relevant input or state. Use Application → Local Storage to inspect the JSON. Add a breakpoint before the change, inspect the value, fix the cause, and repeat the original steps. Do not erase somebody's real data just to make an error disappear; use a test profile or an exported backup.

## Honest limitations to explain

This is a front-end project, as required. localStorage is per browser profile and origin; it is not a cloud account or encrypted database. Backup moves progress manually. Official provider links decide actual eligibility, fees and deadlines. AI assistance and third-party resources are credited on About and in the report.
