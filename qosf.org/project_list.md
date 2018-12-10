---
# Page settings
layout: default
keywords:
comments: false

# Hero section
title: List of Open Quantum Projects
description: Curated list of open-source developed quantum software projects found on GitHub and GitLab.

# Micro navigation
micro_nav: false

---

<p>
{% for category in site.data.yaml_project_list %}
    <h1>{{ category.name }}</h1>
    {% for project in category.projects %}
        <h4><a href="{{ project.url }}">{{ project.name }}</a></h4>
        <p>{{ project.description | markdownify }}</p>
    {% endfor %}
{% endfor %}
</p>
