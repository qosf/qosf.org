---
layout: mentorship_form
custom_css: mentorship.css
keywords: QOSF mentorship cohort dashboard, program timeline, project status
comments: false
eyebrow: Current cohort
title: Cohort dashboard
description: Follow the program timeline, key deadlines, and how this cohort's projects are progressing.
buttons:
  - content: Back to platform
    url: '/mentorship_platform'
    icon: fa-arrow-left
---

{% assign cohort = site.data.cohort.cohort %}

## {{ cohort.label }} &middot; {{ cohort.name }}

**Applications:** {{ cohort.application_window }} &middot; **Decisions:** {{ cohort.decision_release }} &middot; **Program:** {{ cohort.program_window }}

<div class="metrics-grid">
{% for metric in site.data.cohort.metrics %}
  <div class="metric-card">
    <strong>{{ metric.value }}</strong>
    <span>{{ metric.label }}</span>
  </div>
{% endfor %}
</div>

## Program timeline

<div class="timeline">
{% for item in site.data.cohort.timeline %}
  <div class="timeline-item is-{{ item.status }}">
    <span class="when">{{ item.dates }} &middot; {{ item.owner }}</span>
    <h4>{{ item.phase }}</h4>
  </div>
{% endfor %}
</div>

## Project status board

<div class="status-grid">
{% for project in site.data.cohort.projects %}
  <div class="project-card">
    <span class="health-pill health-{{ project.health }}">{{ project.status }}</span>
    <h4>{{ project.title }}</h4>
    <p><strong>Mentor:</strong> {{ project.mentor }} &middot; <strong>Mentees:</strong> {{ project.mentees }}</p>
    <p><strong>Next milestone:</strong> {{ project.milestone }}</p>
    <p><strong>Due:</strong> {{ project.due }}</p>
  </div>
{% endfor %}
</div>

---

Thinking of taking part in the next cohort? [Apply now](/mentorship_apply) or read more on the [program overview](/mentorship_platform).
