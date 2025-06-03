---
# Page settings
layout: default
left_illustration: illustrations/project_list_left_side.png
right_illustration: illustrations/project_list_right_side.png
custom_css: project_list.css
keywords:
comments: false

# Hero section
title: List of Open Quantum Projects
description: Mirror of the curated list of open source developed quantum software projects hosted on [QOSF's GitHub page](https://github.com/qosf/os_quantum_software).
buttons:
    - content: Sign up for the newsletter
      url: 'https://mailchi.mp/762c19baab5a/qosf-supporter'
      external_url: true
      icon: home
    - icon: slack
      content: Join our Slack
      url: 'https://join.slack.com/t/qosf/shared_invite/zt-2nq2n0t9i-PyiiCKg1bAzRpNzLMM7pWg'
      external_url: true
    - icon: fa-hand-holding-heart
      content: Donate to QOSF
      url: 'https://qosf.org/donate'

# Micro navigation
micro_nav: false

---

## How to Add Your Project
Please read our [Contribution Guide](/CONTRIBUTING) before submitting new projects

<p>
{% for category in site.data.yaml_project_list %}
    <h1 id="{{ category.name | downcase | replace: ' ', '-' }}">{{ category.name }}</h1>
    {% for project in category.projects %}
        {% if project.name == 'Q#' %}
            <h4  id="qsharp"><a href="{{ project.url }}">{{ project.name }}</a></h4>
        {% elsif project.name == 'Liqui|>' %}
            <h4  id="liquid"><a href="{{ project.url }}">{{ project.name }}</a></h4>
        {% else %}
            <h4  id="{{ project.name | downcase | replace: ' ', '-' }}"><a href="{{ project.url }}">{{ project.name }}</a></h4>
        {% endif %}
        {{ project.description | markdownify }}
    {% endfor %}
{% endfor %}
</p>
