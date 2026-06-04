# QOSF Mentorship Programme — Web Application

A modern web application to manage the application process and smooth execution of cohorts within the [Quantum Open Source Foundation](https://qosf.org) mentorship program.

## Tech Stack

| Layer        | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | [Next.js](https://nextjs.org/) (App Router)   |
| Language    | TypeScript                                    |
| Styling     | [Tailwind CSS](https://tailwindcss.com/) v4   |
| Icons       | [Lucide React](https://lucide.dev/) + [FontAwesome](https://fontawesome.com/) |
| Auth/Database | [Supabase](https://supabase.com/)           |
| Forms       | [Survey.js](https://surveyjs.io/) (`survey-react-ui`) |
| Markdown    | [react-markdown](https://github.com/remarkjs/react-markdown) + GFM |

## Architecture

```
mentorship_programme/
├── migrations/            # SQL database schema (Supabase)
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin panel (mentors, mentees, cohorts, matches)
│   │   ├── apply/         # Application form (Survey.js)
│   │   ├── cohort/[id]/   # Cohort detail page
│   │   ├── dashboard/     # Logged-in user dashboard
│   │   ├── login/         # Sign in with email/password or magic link
│   │   ├── signup/        # Create account (mentee/mentor)
│   │   ├── about/         # About the mentorship programme
│   │   ├── terms/         # Terms & Conditions
│   │   └── privacy/       # Privacy Policy
│   ├── components/        # Shared UI components
│   │   ├── Header.tsx     # Site header with auth-aware nav
│   │   ├── Footer.tsx     # Site footer with social links
│   │   ├── MarkdownRenderer.tsx  # Markdown + Jekyll front-matter support
│   │   └── SurveyForm.tsx # Survey.js wrapper component
│   ├── lib/
│   │   ├── supabase/      # Supabase client (browser, server, middleware)
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── utils.ts       # Utility functions
│   └── middleware.ts      # Next.js middleware for session refresh
└── .env.example           # Environment variable template
```

### Key Design Decisions

- **App Router**: File-based routing with server components where possible
- **Static Export**: Configured for `output: "export"` for deployment to Netlify
- **Jekyll Interoperability**: Markdown content is rendered at runtime via `react-markdown`. Jekyll front matter is parsed and stripped — metadata (title, description, buttons) can be extracted for use in React components
- **Survey.js**: Application forms use Survey.js JSON format, making them easy to modify without touching React code
- **Supabase RLS**: All database tables have Row Level Security policies enforcing role-based access

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1
- A Supabase project (free tier works)

## Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials
#    - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
#    - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

# 4. Apply the database schema
#    Run the SQL in migrations/001_schema.sql in your Supabase SQL editor

# 5. Seed the first admin user
#    Create a user via the auth API, then add their row to profiles:
#    INSERT INTO profiles (user_id, role, full_name, email, status)
#    VALUES ('<USER_ID>', 'admin', 'Admin Name', 'admin@qosf.org', 'approved');
```

## Development

```bash
bun dev          # Start dev server on http://localhost:3000
bun run build    # Production build (static export)
bun run start    # Serve the static export locally
```

## Pages Overview

| Route              | Description                                      | Auth Required |
|--------------------|--------------------------------------------------|---------------|
| `/`                | Homepage with hero, features, CTA                | No            |
| `/login`           | Sign in with email/password or magic link        | No            |
| `/signup`          | Create account (select mentee/mentor role)       | No            |
| `/dashboard`       | User dashboard — cohorts, matches, profile       | Yes           |
| `/apply`           | Application form (Survey.js)                     | Yes           |
| `/cohort/[id]`     | Cohort detail — dates, description, timeline, matches | No      |
| `/admin/mentors`   | List/manage mentors                              | Admin         |
| `/admin/mentees`   | List/manage mentees                              | Admin         |
| `/admin/cohorts`   | List/create/edit cohorts                         | Admin         |
| `/admin/cohorts/new` | Create a new cohort                           | Admin         |
| `/admin/matches`   | Create and manage mentor-mentee matches          | Admin         |
| `/about`           | About the mentorship programme                   | No            |
| `/terms`           | Terms & Conditions                               | No            |
| `/privacy`         | Privacy Policy                                   | No            |

## Data Model

```
profiles        — Users (mentees, mentors, admins) with profile info
cohorts         — Mentorship program cohorts with dates and status
applications    — Form submissions linked to a user and cohort
matches         — Mentor-mentee pairings within a cohort
timeline_events — Milestones and deadlines for a cohort
```

See `migrations/001_schema.sql` for the full schema with indexes and RLS policies.

## Deployment

This app is configured for static export and can be deployed to Netlify:

```bash
bun run build
# The out/ directory contains the static site

# For Netlify: set the publish directory to "out"
# Environment variables must be set at build time for static generation
```

## Markdown & Jekyll Compatibility

The `MarkdownRenderer` component strips Jekyll front matter (`--- ... ---`) before rendering markdown. If you copy `.md` files from the Jekyll site, their front matter metadata (title, description, buttons) is parsed and available for use in React components via the `parseFrontMatter()` utility.
