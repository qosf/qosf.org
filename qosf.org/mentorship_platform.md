---
layout: mentorship_form
custom_css: mentorship.css
keywords: quantum computing mentorship, QOSF mentorship, mentor matching, quantum open source
comments: false
eyebrow: Applications open
title: Quantum Computing Mentorship Program
description: Work on a real open-source quantum project with the guidance of an expert mentor - or share your expertise by mentoring the next generation.
buttons:
  - content: Apply now
    url: '/mentorship_apply'
    icon: fa-file-import
  - content: View cohort dashboard
    url: '/cohort_dashboard'
    icon: fa-tasks
---

{% assign cohort = site.data.cohort.cohort %}

The Quantum Computing Mentorship Program pairs people who want to grow in quantum computing with mentors from academia and industry. Over a single cohort you'll build an open-source project - on your own or in a small team - with regular guidance from someone who works in the field.

<div class="metrics-grid">
{% for metric in site.data.cohort.metrics %}
  <div class="metric-card">
    <strong>{{ metric.value }}</strong>
    <span>{{ metric.label }}</span>
  </div>
{% endfor %}
</div>

## Why join

<div class="platform-grid">
  <div class="platform-card">
    <h3>As a mentee</h3>
    <p>Learn by building. You'll complete a real open-source contribution, get hands-on feedback from an expert, and come away with a project you can show the world - plus a foot in the door of the quantum community.</p>
  </div>
  <div class="platform-card">
    <h3>As a mentor</h3>
    <p>Give back and shape the field. Guide motivated mentees through a focused project, grow your own leadership and supervision experience, and help expand the open-source quantum ecosystem.</p>
  </div>
</div>

## How matching works

When you apply, you tell us three things that matter most for a good pairing:

- **Research interests** - the quantum topics you want to work on
- **Time zone** - so your mentor and you can actually meet
- **Experience level** - so your mentor is well placed to guide you

We use these to suggest, for every mentee, the mentors whose expertise overlaps your interests, who work in a compatible time zone, and who are at the right level to support you. Every suggested pairing is reviewed by our organizers before it's finalized - so you get a match that's both a strong fit and a fair one.

## What to expect

1. **Apply** - fill in a short application as a mentee or mentor.
2. **Assessment** - shortlisted mentees complete a screening task.
3. **Matching** - we pair mentees and mentors and scope the projects together.
4. **Project** - work with your mentor over the cohort, with regular check-ins.
5. **Showcase** - wrap up and share your project with the community.

## Timeline at a glance

**Applications:** {{ cohort.application_window }} &middot; **Decisions:** {{ cohort.decision_release }} &middot; **Program:** {{ cohort.program_window }}

See the full [cohort dashboard](/cohort_dashboard) for milestones and project status, or read more about the program on the [mentorship page](/qc_mentorship).

Ready to take part? [Apply now](/mentorship_apply).
