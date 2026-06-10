---
layout: mentorship_form
custom_css: mentorship.css
keywords: QOSF mentorship mentor application, become a mentor, quantum computing mentor
comments: false
eyebrow: Mentor application
title: Apply as a mentor
description: Share your expertise and availability so we can pair you with mentees whose interests and timezone align with yours.
buttons:
  - content: Back to apply options
    url: '/mentorship_apply'
    icon: fa-arrow-left
---

Fields marked <span style="color:#c0341d">*</span> are required. Your details are shared only with the QOSF mentorship organizers to review and match your application. See our [privacy policy]({{ 'privacy_policy' | absolute_url }}).

{% if site.mentorship.form_endpoint == '' %}
<div class="offline-note">
  <strong>Preview mode.</strong> No form endpoint is configured yet, so submissions are disabled. Set <code>mentorship.form_endpoint</code> in <code>_config.yml</code> to activate live submissions.
</div>
{% endif %}

<form id="mentorship-form" class="mentorship-form" novalidate>
  <input type="hidden" name="role" value="mentor">

  <div class="form-row">
    <label for="name">Full name <span class="req">*</span></label>
    <input type="text" id="name" name="name" required>
  </div>

  <div class="form-row">
    <label for="email">Email <span class="req">*</span></label>
    <input type="email" id="email" name="email" required>
  </div>

  <div class="form-row">
    <label for="affiliation">Affiliation / organization <span class="req">*</span></label>
    <input type="text" id="affiliation" name="affiliation" required placeholder="University, company, or independent">
  </div>

  <div class="form-row">
    <label for="country">Country <span class="req">*</span></label>
    <input type="text" id="country" name="country" required placeholder="Country of residence">
  </div>

  <div class="form-row">
    <label for="timezone">Timezone (UTC offset) <span class="req">*</span></label>
    <select id="timezone" name="timezone" required>
      <option value="">Select your UTC offset...</option>
      <option value="-12">UTC-12</option><option value="-11">UTC-11</option>
      <option value="-10">UTC-10</option><option value="-9">UTC-9</option>
      <option value="-8">UTC-8 (PST)</option><option value="-7">UTC-7 (MST)</option>
      <option value="-6">UTC-6 (CST)</option><option value="-5">UTC-5 (EST)</option>
      <option value="-4">UTC-4</option><option value="-3">UTC-3</option>
      <option value="-2">UTC-2</option><option value="-1">UTC-1</option>
      <option value="0">UTC+0 (GMT)</option><option value="1">UTC+1 (CET)</option>
      <option value="2">UTC+2</option><option value="3">UTC+3</option>
      <option value="4">UTC+4</option><option value="5">UTC+5</option>
      <option value="5.5">UTC+5:30 (IST)</option><option value="6">UTC+6</option>
      <option value="7">UTC+7</option><option value="8">UTC+8</option>
      <option value="9">UTC+9 (JST)</option><option value="10">UTC+10</option>
      <option value="11">UTC+11</option><option value="12">UTC+12</option>
    </select>
  </div>

  <div class="form-row">
    <label for="level">Seniority level <span class="req">*</span></label>
    <select id="level" name="level" required>
      <option value="">Select...</option>
      <option value="3">Graduate student (MSc)</option>
      <option value="4">PhD student / postdoc</option>
      <option value="5">Industry professional</option>
      <option value="6">Senior researcher / faculty / lead</option>
    </select>
  </div>

  <div class="form-row">
    <label>Areas of expertise <span class="req">*</span></label>
    <div class="hint">Select all that apply - used to match you with mentees.</div>
    <div class="checkbox-grid">
      <label><input type="checkbox" name="interests" value="algorithms"> Quantum algorithms</label>
      <label><input type="checkbox" name="interests" value="error-correction"> Error correction</label>
      <label><input type="checkbox" name="interests" value="chemistry"> Quantum chemistry</label>
      <label><input type="checkbox" name="interests" value="qml"> Quantum machine learning</label>
      <label><input type="checkbox" name="interests" value="hardware"> Hardware / control</label>
      <label><input type="checkbox" name="interests" value="compilers"> Compilers / tooling</label>
      <label><input type="checkbox" name="interests" value="simulation"> Simulation</label>
      <label><input type="checkbox" name="interests" value="cryptography"> Cryptography</label>
      <label><input type="checkbox" name="interests" value="optimization"> Optimization</label>
    </div>
  </div>

  <div class="form-row">
    <label for="capacity">How many mentees can you take? <span class="req">*</span></label>
    <input type="number" id="capacity" name="capacity" min="1" max="5" required>
  </div>

  <div class="form-row">
    <label for="availability">Availability (hours per week) <span class="req">*</span></label>
    <input type="number" id="availability" name="availability" min="1" max="20" required>
  </div>

  <div class="form-row">
    <label for="bio">Short bio / project ideas <span class="req">*</span></label>
    <textarea id="bio" name="bio" required placeholder="Your background and the kinds of projects you'd like to mentor."></textarea>
  </div>

  <div class="form-row">
    <label>
      <input type="checkbox" id="consent" name="consent" value="yes" required>
      I consent to QOSF storing this information to process my application. <span class="req">*</span>
    </label>
  </div>

  <button type="submit" class="btn btn--dark btn--rounded" id="submit-btn">Submit application</button>
  <div id="form-status" class="form-status"></div>
</form>

<script>
  window.MENTORSHIP_ENDPOINT = "{{ site.mentorship.form_endpoint }}";
</script>
<script src="{% if jekyll.environment == 'production' %}{{ site.doks.baseurl }}{% endif %}/assets/js/mentorship_form.js"></script>
