---
layout: mentorship_form
custom_css: mentorship.css
keywords: QOSF mentorship application, apply quantum mentorship, mentee, mentor
comments: false
eyebrow: Applications open
title: Apply to the mentorship program
description: Choose how you'd like to take part in the current cohort.
buttons:
  - content: Cohort dashboard
    url: '/cohort_dashboard'
    icon: fa-tasks
---

<div class="platform-grid">
  <div class="platform-card">
    <h3>Apply as a mentee</h3>
    <p>Work on an open-source quantum project with the support of an expert mentor. Tell us your timezone, level, and research interests, and we'll match you with a mentor who fits.</p>
    <a href="{% if jekyll.environment == 'production' %}{{ site.doks.baseurl }}{% endif %}/mentorship_apply_mentee" class="btn btn--dark btn--rounded btn--w-icon">
      Apply as a mentee&nbsp;&nbsp;<i class="fas fa-icon fa-user-graduate fa-lg"></i>
    </a>
  </div>
  <div class="platform-card">
    <h3>Apply as a mentor</h3>
    <p>Share your expertise and guide one to a few mentees through a focused project. Tell us your areas, availability, and capacity, and we'll pair you with mentees who match.</p>
    <a href="{% if jekyll.environment == 'production' %}{{ site.doks.baseurl }}{% endif %}/mentorship_apply_mentor" class="btn btn--dark btn--rounded btn--w-icon">
      Apply as a mentor&nbsp;&nbsp;<i class="fas fa-icon fa-chalkboard-teacher fa-lg"></i>
    </a>
  </div>
</div>

New here? Read the [program overview](/mentorship_platform) first, or see the full [timeline and project status](/cohort_dashboard).
