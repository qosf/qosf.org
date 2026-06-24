# QOSF Mentorship Platform

A Python Flask web application for managing the Quantum Open Source Foundation mentorship program application, matching, and cohort execution process while keeping the visual language aligned with the QOSF Doks blue theme.

## Features

- Mentee and mentor application forms protected by CSRF tokens.
- Secure database-backed storage with SQLAlchemy and configurable `DATABASE_URL`.
- Administrator login controlled by the `ADMIN_PASSWORD` environment variable.
- Automatic and manual mentor matching based on closest timezone, closest weekly availability, case-insensitive character similarity for research interests and skills, and mentor capacity.
- Deterministic demo data seeding creates 11 mentees and 8 mentors with randomized timezone, weekly availability, quantum interests, and quantum skills.
- Project status board with deadlines, blockers, and cohort milestones.
- Admin maintenance actions for removing individual mentees, mentors, or projects/pairings from the SQLite database.

## Run locally

```bash
uv sync
ADMIN_PASSWORD='change-me' SECRET_KEY='change-me-too' uv run flask --app app run --debug
```

## Deploy with Gunicorn

```bash
ADMIN_PASSWORD='change-me' SECRET_KEY='change-me-too' uv run gunicorn 'app:app'
```

The default SQLite database is created under `instance/qosf_mentorship.sqlite`. Demo applicants are seeded by default when the applicant table is empty; set `SEED_DEMO_DATA=false` to disable this. For production deployments, set `SECRET_KEY`, `ADMIN_PASSWORD`, and `DATABASE_URL` to secure values.
