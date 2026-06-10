# QOSF Mentorship Cohort Platform

A Jekyll-native workspace for running the Quantum Computing Mentorship Program:
application intake, mentor-mentee matching, and cohort execution. Everything
lives inside the existing qosf.org site - there is no separate app to host.

## How it works

```
Visitor -> Jekyll form page -> POST -> Google Apps Script -> Google Sheet (private)
                                                                  |
                                                       export CSV |
                                                                  v
                              match_mentors.py  ->  ranked match suggestions
                                                                  |
                                          organizer publishes safe data
                                                                  v
                              _data/cohort.yml  ->  /cohort_dashboard (public)
```

- **Public pages** stay static and fast (standard Jekyll).
- **Applicant records** go only to the organizers' Google Sheet - never to this repo.
- **Matching** is an auditable Python script, not a black box.
- **The dashboard** is driven by one YAML file that non-developers can edit via PR.

## Files

### Website (served by Jekyll, in their conventional locations)
| Path | Purpose |
|------|---------|
| `../mentorship_platform.md` | Landing page / overview |
| `../mentorship_apply_mentee.md` | Mentee application form |
| `../mentorship_apply_mentor.md` | Mentor application form |
| `../cohort_dashboard.md` | Timeline + project status board |
| `../_data/cohort.yml` | Dashboard data (organizer-editable) |
| `../doks-theme/_layouts/mentorship_form.html` | Shared layout |
| `../assets/css/mentorship.css` | Styling |
| `../assets/js/mentorship_form.js` | Form validation + submission |
| `../_config.yml` | Nav link + `mentorship.form_endpoint` |

### Tooling (this folder, not served by Jekyll)
| Path | Purpose |
|------|---------|
| `match_mentors.py` | Mentor-mentee matching engine |
| `apps_script_Code.gs` | Google Apps Script form backend |
| `sample_applicants.csv` | Sample data so the matcher runs out of the box |
| `README.md` | This file |

## Setup

### 1. Form backend (one time)
Follow the deployment steps at the top of `apps_script_Code.gs`. You will get a
web-app URL ending in `/exec`. Paste it into `_config.yml`:

```yaml
mentorship:
    form_endpoint: 'https://script.google.com/macros/s/AKfy.../exec'
```

Leaving it blank runs the forms in preview mode (validation works, nothing is sent).

### 2. Run the matcher
Export the applications sheet as CSV (`File > Download > CSV`), then:

```bash
python match_mentors.py applicants.csv --top 3 --out matches.csv
```

Try it immediately with the bundled sample:

```bash
python match_mentors.py sample_applicants.csv
```

The script needs only the Python standard library (3.6+).

### 3. Update the dashboard
Edit `../_data/cohort.yml` (milestones, deadlines, project statuses) and open a
pull request. The `/cohort_dashboard` page reflects the change on the next build.

## Matching factors

| Factor | Weight | How it is scored |
|--------|:------:|------------------|
| Research interests | 40% | Jaccard similarity of interest tags |
| Timezone | 30% | `1 - |dt| / 12`, clamped at 0 |
| Level fit | 20% | Mentor at or modestly above mentee level |
| Availability | 10% | Shared weekly hours, full marks at 6+ |

The matcher produces **ranked suggestions for human review** - it never assigns
pairs automatically. Organizers make the final call, handling conflicts of
interest, capacity, and equitable distribution of opportunities.

## Privacy

Personal data is stored only in the organizers' Google Sheet. This repository
contains the schema, the matching logic, and non-sensitive operational data for
the public dashboard - never applicant records.
