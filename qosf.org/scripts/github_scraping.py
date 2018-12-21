#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Distributed under terms of the CC0 license.

"""
Python script that downloads the README file associated with the os_quantum_software repo. The README file contains the most up-to-date list of open source quantum software projects and this script converts the formatting into a YAML file from which we render the list of quantum software projects on qosf.org

Usage:

    $ python3 github_scraping.py
"""

from functools import reduce

import re
import yaml
import requests

readme = requests.get('https://raw.githubusercontent.com/qosf/os_quantum_software/master/README.md')

# Open Source Quantum Software Projects (OSQSP) dictionary
OSQSP_list = []
heading = None
projects = {}
unneeded_sections = ['Contents', 'Contributing', 'License'] # exclude these sections

# iterate of the lines
for line in readme.content.decode().splitlines():

    if line[:2] == '##': # extract the heading lines

        heading = reduce(lambda x,y: x + f' {y}', line.split()[1:]) # get the name of the heading

        if heading not in unneeded_sections:
            category_dict = {
                    'name': heading,
                    'projects': []
            }
            OSQSP_list.append(category_dict)

    else: # these must be projects
        if heading and heading not in unneeded_sections:
            if heading not in projects.keys():
                projects[heading] = [line]
            else:
                projects[heading].append(line)

for heading, lines in projects.items():
    for line in lines:

        if line[:2] == '- ':
            project_name = re.search(r'\[(.*?)\]', line).group(1)
            project_description = re.search(r'^.*-.*- (.*)$', line).group(1)#.strip('\'')
            project_url = re.search(r'\((.*?)\)', line).group(1)
            heading_index = OSQSP_list.index(list(filter(lambda x: x['name'] == heading, OSQSP_list))[0])
            OSQSP_list[heading_index]['projects'].append({
                'name': project_name,
                'description': project_description,
                'url': project_url
            })

# sort all projects alphabetically
for heading_dict in OSQSP_list:
    heading_dict['projects'].sort(key=lambda x: x['name'])

# finally dump it into a YAML file
yaml_output = yaml.dump(OSQSP_list, default_flow_style=False)

with open('../_data/yaml_project_list.yml', '+w') as output:
    output.write(yaml_output)
