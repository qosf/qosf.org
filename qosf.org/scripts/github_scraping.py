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

# TODO: use `requests` to get the file content more elegantly
readme = open('README.md', 'r')

# Open Source Quantum Software Projects (OSQSP) dictionary
OSQSP_dict = {}

# iterate of the lines
for line in readme:
    if line[:2] == '##': # extract the heading lines
        heading = reduce(lambda x,y: x + f' {y}', line.split()[1:]) # get the name of the heading
        unneeded = ['Contents', 'Contributing', 'License'] # exclude these sections
        if heading not in unneeded:
            OSQSP_dict[heading] = {} # initialize empty dictionaries

import bpython
bpython.embed(locals_=locals())
