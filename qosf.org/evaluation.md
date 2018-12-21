---
# Page settings
layout: evaluation_template
keywords:
comments: false

# Hero section
title: Quantum software project evaluation
description: Most recent results of our monthly evaluation of curated open quantum software projects.
buttons:
    - content: Become a supporter
      url: 'https://mailchi.mp/762c19baab5a/qosf-supporter'
      external_url: true
      icon: home


# Micro navigation
micro_nav: false

---

<div class="callout callout--danger">
    <p><strong>The evaluation is not completely automated yet.</strong>
    Current evaluation results are identical to the results reported in the PLoS ONE collection review on <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0208561">"Open source software in quantum computing"</a>. We're currently working hard on fully automating the evaluation such that we can publish monthly updates soon.
    </p>
</div>

<h1>Project selection</h1>
We only evaluate a subset of the projects presented in [our exhaustive list of open quantum software repositories](/project_list). The following decision tree outlines the process which is used to select free and open software projects for evaluation. The main goal is to identify projects that have already built a community around their project. The acronym PR stands for [pull request](https://en.wikipedia.org/wiki/Distributed_version_control#Pull_requests) which is a form of code contribution on software hosting websites.
<br>
<center><img src='/assets/img/quantum_project_selection_flow_diagram.png' alt='Flow diagram showing quantum project selection' width="800vh"></center>
<br>

<div class="callout callout--info">
    <p><strong>These rules are not set in stone and we're always open for suggestions.</strong>
    If you have some thoughts, comments or concerns, please open an issue on <a href="https://github.com/qosf/qosf.org">our GitHub page</a>.
    </p>
</div>

<h1>Repository evaluation</h1>
Evaluation results for the static analysis of each project and its source code. We report the version control and issue tracking systems as well as the total number, attention rate and average response time for all open and closed issues and pull requests (PRs). We define attention rate as 1-I where I is the fraction of ignored issues and pull requests with respect to the total number of issues and pull requests. An ideal project never ignores any of its user or developer questions or contributions and would have an attention rate of 1.0. The average response time measures how long it takes a core contributor (or an employee of the company hosting the project) to respond to issues or pull requests. Next, we analyze the existence of a test suite and report the resulting code coverage for most projects. Code complexity is only reported for projects written in Python since other languages do not allow for fast retrieval of this metric (if you know how to do this please let us know through a <a href="https://github.com/qosf/qosf.org">GitHub issue</a> or <a href="mailto:info@qosf.org">email</a>).
<br>
<br>

| Name             | Version control system     | Issue tracking system | Issues/PRs | Attention rate | Average response time (days) | Test suite | Code coverage | Cyclomatic Complexity
|:----------------:|:--------------------------:|:------------:|:-----------:|:------------:|:-----------:|:------------:|:-----------:|:-----------:|
[Cirq](https://github.com/quantumlib/Cirq)                         | Git | GitHub | 448/686 | 0.54 | 2.6   | <span style="font-size:35px;color:green;">&#10003;</span> | 94%   | 2.99
[Cliffords.jl](https://github.com/BBN-Q/Cliffords.jl)              | Git | GitHub | 6/12    | 0.33 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -
[dimod](https://github.com/dwavesystems/dimod)                     | Git | GitHub | 110/201 | 0.30 | 5.3   | <span style="font-size:35px;color:green;">&#10003;</span> | 94%   | 2.96
[dwave-system](https://github.com/dwavesystems/dwave-system)       | Git | GitHub | 54/72   | 0.24 | 8.2   | <span style="font-size:35px;color:green;">&#10003;</span> | 87%   | 3.47
[FermiLib](https://github.com/ProjectQ-Framework/FermiLib)         | Git | GitHub | 24/134  | 0.31 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | 99%   | 2.43
[Forest - Grove](https://github.com/rigetticomputing/grove)        | Git | GitHub | 53/130  | 0.51 | 17.7  | <span style="font-size:35px;color:green;">&#10003;</span> | 72%   | 3.25
[Forest - pyQuil](https://github.com/rigetticomputing/pyquil)      | Git | GitHub | 293/385 | 0.41 | 10.6  | <span style="font-size:35px;color:green;">&#10003;</span> | 88%   | 2.65
[OpenFermion](https://github.com/quantumlib/OpenFermion)           | Git | GitHub | 137/345 | 0.61 | 1.3   | <span style="font-size:35px;color:green;">&#10003;</span> | 100%  | 2.46
[ProjectQ](https://github.com/ProjectQ-Framework/ProjectQ)         | Git | GitHub | 84/198  | 0.75 | 4.0   | <span style="font-size:35px;color:green;">&#10003;</span> | 100%  | 4.02
[PyZX](https://github.com/Quantomatic/pyzx)                        | Git | GitHub | 6/2     | 0.80 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | 51%   | 4.42
[QGL.jl](https://github.com/BBN-Q/QGL.jl)                          | Git | GitHub | 17/13   | 0.75 | 130.6 | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -
[Qbsolv](https://github.com/dwavesystems/qbsolv)                   | Git | GitHub | 50/85   | 0.17 | 22.2  | <span style="font-size:35px;color:green;">&#10003;</span> | 95%   | -
[Qiskit Aqua](https://github.com/Qiskit/aqua)                      | Git | GitHub | 43/141  | 0.20 | 1.8   | <span style="font-size:35px;color:green;">&#10003;</span> | 67%   | 3.04
[Qiskit Terra](https://github.com/Qiskit/qiskit-terra)             | Git | GitHub | 526/713 | 0.11 | 16.0  | <span style="font-size:35px;color:green;">&#10003;</span> | 76%   | 2.56
[Qiskit Tutorials](https://github.com/QISKit/qiskit-tutorial)      | Git | GitHub | 94/274  | 0.40 | 8.6   | <span style="font-size:20px;">&#10060;</span>             | -     | -
[Qiskit.js](https://github.com/Qiskit/qiskit-js)                   | Git | GitHub | 19/8    | 0.33 | 4.4   | <span style="font-size:35px;color:green;">&#10003;</span> | 66%   | -
[Qrack](https://github.com/vm6502q/qrack)                          | Git | GitHub | 7/78    | 0.07 | 8.7   | <span style="font-size:35px;color:green;">&#10003;</span> | 87%   | -
[Quantum Fog](https://github.com/artiste-qb-net/quantum-fog)       | Git | GitHub | 17/1    | 1.00 | <1    | <span style="font-size:20px;">&#10060;</span>             | 0%    | 3.32
[Quantum++](https://github.com/vsoftco/qpp)                        | Git | GitHub | 8/45    | 0.88 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | 72%   | -
[Qubiter](https://github.com/artiste-qb-net/qubiter)               | Git | GitHub | 14/3    | 0.75 | <1    | <span style="font-size:20px;">&#10060;</span>             | 0%    | -
[Quirk](https://github.com/Strilanc/Quirk)                         | Git | GitHub | 286/131 | 0.96 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -
[reference-qvm](https://github.com/rigetticomputing/reference-qvm) | Git | GitHub | 6/14    | 0.44 | 75.6  | <span style="font-size:35px;color:green;">&#10003;</span> | 80%   | 3.99
[ScaffCC](https://github.com/epiqc/ScaffCC)                        | Git | GitHub | 15/11   | 0.18 | 10.1  | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -
[Strawberry Fields](https://github.com/xanaduai/strawberryfields)  | Git | GitHub | 16/20   | 0.73 | 1.2   | <span style="font-size:35px;color:green;">&#10003;</span> | 97%   | 2.70
[XACC](https://github.com/ORNL-QCI/xacc)                           | Git | GitHub | 65/14   | 0.65 | <1    | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -
[XACC VQE](https://github.com/ornl-qci/xacc-vqe)                   | Git | GitHub | 22/4    | 0.33 | 8.8   | <span style="font-size:35px;color:green;">&#10003;</span> | -     | -

<h1>Documentation evaluation</h1>
The image below shows the detailed results of our qualitative documentation analysis in form of a colour coded heatmap with scores ranging from 1 (bad) to 5 (good). We evaluated each project based on the quality of their source code documentation, README files, changelogs, user documentation and tutorials. The detailed rubrik used for scoring each of the five aspects can be found in the Supporting Information of the review paper <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0208561">"Open source software in quantum computing"</a>.
<br>

<center><img src='/assets/img/documentation_results.png' alt='Heatmap' width="800vh"></center>
<br>

<h1>Community evaluation</h1>
Lastly, the following table shows the evaluation results for the community analysis. For each project, we analyse if a public development roadmap exists and if the software is published in form of releases. Additionally, we report the <a href="https://help.github.com/articles/about-community-profiles-for-public-repositories/">GitHub community profile score</a>, the total number of contributors, the type of user- and developer-centric discussion channel and the type of public code review process -- specifically if it applies to internal (I) and/or external (E) contributors.
<br>
<br>

| Project         | Roadmap     | Releases | Contributors | User-discussion channels | Developer-discussion channels | Public review process | Community Profile
|:---------------:|:-----------:|:------------:|:-----------:|:------------:|:-----------:|:------------:|:-----------:|
[Cirq](https://github.com/quantumlib/Cirq)                         | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 28 | Stack Exchange   | -        | E+I  | 4/7
[Cliffords.jl](https://github.com/BBN-Q/Cliffords.jl)              | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 7  | -                | -        | E    | 3/7
[dimod](https://github.com/dwavesystems/dimod)                     | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 11 | Forum            | -        | E+I  | 5/7
[dwave-system](https://github.com/dwavesystems/dwave-system)       | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 6  | Forum            | -        | E+I  | 4/7
[FermiLib](https://github.com/ProjectQ-Framework/FermiLib)         | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 10 | -                | -        | E+I  | 3/7
[Forest - Grove](https://github.com/rigetticomputing/grove)        | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 24 | Slack            | Slack    | E+I  | 3/7
[Forest - pyQuil](https://github.com/rigetticomputing/pyquil)      | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 46 | Slack            | Slack    | E+I  | 3/7
[OpenFermion](https://github.com/quantumlib/OpenFermion)           | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 26 | -                | -        | E+I  | 3/7
[ProjectQ](https://github.com/ProjectQ-Framework/ProjectQ)         | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 10 | -                | -        | E+I  | 3/7
[PyZX](https://github.com/Quantomatic/pyzx)                        | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 3  | -                | -        | -    | 3/7
[QGL.jl](https://github.com/BBN-Q/QGL.jl)                          | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 3  | -                | -        | E+I  | 3/7
[Qbsolv](https://github.com/dwavesystems/qbsolv)                   | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 18 | Forum            | -        | E+I  | 5/7
[Qiskit Aqua](https://github.com/Qiskit/aqua)                      | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 14 | Forum            | -        | E+I  | 7/7
[Qiskit Terra](https://github.com/Qiskit/qiskit-terra)             | <span style="font-size:35px;color:green;">&#10003;</span> | <span style="font-size:35px;color:green;">&#10003;</span> | 67 | Forum, Slack     | Slack    | E+I  | 7/7
[Qiskit Tutorials](https://github.com/QISKit/qiskit-tutorial)      | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 37 | -                | -        | E+I  | 3/7
[Qiskit.js](https://github.com/Qiskit/qiskit-js)                   | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 4  | Forum            | -        | E    | 7/7
[Qrack](https://github.com/vm6502q/qrack)                          | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 2  | -                | -        | E+I  | 3/7
[Quantum Fog](https://github.com/artiste-qb-net/quantum-fog)       | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 2  | -                | -        | E    | 3/7
[Quantum++](https://github.com/vsoftco/qpp)                        | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 3  | Gitter           | -        | E    | 5/7
[Qubiter](https://github.com/artiste-qb-net/qubiter)               | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 2  | -                | -        | E    | 3/7
[Quirk](https://github.com/Strilanc/Quirk)                         | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 3  | -                | -        | E    | 4/7
[reference-qvm](https://github.com/rigetticomputing/reference-qvm) | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 8  | -                | -        | E+I  | 3/7
[ScaffCC](https://github.com/epiqc/ScaffCC)                        | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 7  | -                | -        | E    | 3/7
[Strawberry Fields](https://github.com/xanaduai/strawberryfields)  | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:35px;color:green;">&#10003;</span> | 5  | Slack            | Slack    | E+I  | 7/7
[XACC](https://github.com/ORNL-QCI/xacc)                           | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 6  | -                | -        | E    | 4/7
[XACC VQE](https://github.com/ornl-qci/xacc-vqe)                   | <span style="font-size:20px;">&#10060;</span>             | <span style="font-size:20px;">&#10060;</span>             | 2  | -                | -        | E    | 3/7

<div class="callout callout--info">
    <p><strong>Let us know if you disagree with some of these results.</strong>
    If you're maintaining one of the projects above and you think that we did a mistake in our evaluation then we want to hear from you! Please open an issue on <a href="https://github.com/qosf/qosf.org">our GitHub page</a>.
    </p>
</div>

