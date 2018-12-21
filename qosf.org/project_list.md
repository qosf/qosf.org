---
# Page settings
layout: default
keywords:
comments: false

# Hero section
title: List of Open Quantum Projects
description: Mirror of the curated list of open source developed quantum software projects hosted on [QOSF's GitHub page](https://github.com/qosf/os_quantum_software).
buttons:
    - content: Become a supporter
      url: 'https://mailchi.mp/762c19baab5a/qosf-supporter'
      external_url: true
      icon: home

# Micro navigation
micro_nav: false

---

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
