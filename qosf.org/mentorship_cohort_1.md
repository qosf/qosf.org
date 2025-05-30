---

# Page settings
layout: default
keywords:
comments: false

# Hero section
title: "ARCHIVED: Quantum Computing Mentorship Program Cohort One Showcase"
description: "Showcase of projects from the first cohort of our Quantum Computing Mentorship program. (Cohort concluded)"
buttons:
    - content: Learn about current Mentorship Programs
      url: '/qc_mentorship'
      external_url: false
      icon: fa-file-import
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

permalink: /mentorship_cohort_1/

---

<div style="background-color: #ffcccb; padding: 15px; border: 1px solid #ff726f; border-radius: 5px; margin-bottom: 20px;">
  <strong>ARCHIVED CONTENT:</strong> This page describes projects from Cohort 1 of the Mentorship Program, which has concluded. The information below is for historical purposes. For information on current mentorship opportunities, please visit our <a href="/qc_mentorship">main mentorship page</a>.
</div>

## Quantum Mentorship Program Cohort 1 Project Showcase 

This is a showcase of all the projects created during the first cohort of our Quantum Computing Mentorship program. Mentees and mentors worked on a open-source project, with the support of a community of like-minded people from all around the world. In total, there were 9 projects completed! 

---

##### **QML Contribution to Pennylane**  
  
*Project description*: I see the interaction between machine learning and quantum computing as a very exciting field, so my project revolved around lowering the barrier for hybrid classical-quantum ML. My main contribution has been the addition of a "cost" module with a loss function to the Pennylane library, so that circuits with trainable parameters can be trained more easily. I am already working together with the Pennylane team to develop more utilities and ML-related features.    
    
*Mentee*: **[Nicola Vitucci](https://twitter.com/nvitucci)** - I currently work as a Big Data engineer in London, and most of my professional life after my PhD revolved around "all things data". I am in love with QC because I am a programming, graph, ML, linear algebra, and Open Source professional geek! 

*Mentors*: Big thanks go to **[Tom Lubowe](https://twitter.com/TomLubowe)** from Xanadu for supporting the project, and to [Josh Izaac](https://twitter.com/3rdquantization) and [Tom Bromley](https://www.linkedin.com/in/thomas-r-bromley-a53a28130/) from Xanadu for discussing and reviewing my code! 

*Links*: [Contribution](https://github.com/XanaduAI/pennylane/pull/642), [Notebook with Examples](https://github.com/nvitucci/notebook_qc/tree/dev).

---
   
##### **Applying Quantum Natural Gradient to Accelerate VQE**  
  
*Project description*: Recently, several works have proposed and benchmarked quantum natural gradients which have the potential to accelerate the classical optimization loop in variational quantum algorithms. For our QOSF project, we contributed to the open-source quantum machine learning framework PennyLane to enable quantum natural gradients for VQE/VQE-like problems. We additionally provide notebooks that demonstrate VQE calculations of small molecules that leverage quantum natural gradients. 
    
*Mentees*: 
- **[Lana Bozanic](https://twitter.com/lanabozanic)** is a 17-year-old passionate about all things quantum! This year, she took a deep dive into the world of quantum computing, and did a ton of cool projects + research within the field! Check out more of her work on her [personal website](https://lanabozanic.com/).
- **[Maggie Li](https://twitter.com/maggie_1i)** is a 17 year old open source and design junkie passionate about all things quantum computing and biology - she hopes to leverage emerging technologies to disrupt biotech in the future! Check out more of her work on her [personal website](http://lzylili.com/).

*Mentor*: **[Sukin (Hannah) Sim](https://twitter.com/sukin_sim)** is a PhD student in Professor Alan Aspuru-Guzik’s research group interested in developing ways to make the best use of current and near-term quantum computers

*Links*: [Notebook with Examples](https://github.com/hsim13372/quantum_natural_gradient), [Contribution](https://github.com/XanaduAI/pennylane/pull/618).

---
  
##### **Financial Portfolio Rebalancing Using Variational Algorithms**  
  
*Project description*: For my project I implemented the algorithm from *[M. Hodson et. al., 2019](https://arxiv.org/abs/1911.05296)*. that solves the financial portfolio rebalancing problem using variational quantum algorithms. Following the paper, I implemented the algorithm with both soft and with hard constraints and used different optimization algorithms to compare the results.  The project was carried out by myself under the mentorship of Guoming Wang. 
    
*Mentee*: **[Oscar Javier Hernandez](https://www.linkedin.com/in/oscar-javier-hernandez/)**. Check out his [company website](https://www.zorc-technology.com).

*Mentor*: **[Guoming Wang](https://www.linkedin.com/in/guoming-wang-cs/)** is a Quantum Research Scientist at [Zapata Computing](https://www.zapatacomputing.com/).

*Links*: [Notebook with Examples and Tutorial](https://github.com/OscarJHernandez/qc_mentorship_project).

---
  
##### **Cost-Function-Dependent Barren Plateuas in Shallow Quantum Neural Networks**  
  
*Project description*: In this tutorial, we’ve implemented the work presented by *[Cerezo et al., 2020](https://arxiv.org/abs/2001.00550) in Cost-Function-Dependent Barren Plateaus in Shallow Quantum Neural Networks* and expanded upon it to create a cost-aware optimization strategy to optimize quantum neural networks while avoiding barren plateaus.
    
*Mentee*: **[Thomas Storwick](https://www.linkedin.com/in/thomasstorwick/)** is a graduate student at the University of Waterloo in the Waterloo Institute for Nanotechnology. His research interests range from 2D materials and interfaces, electronic devices, and of course, quantum computing. 

*Mentor*: **[Josh Izaac](https://twitter.com/3rdquantization)** is a quantum physicist, experienced quantum software developer, and prolific science writer. He currently works for quantum computing company [Xanadu](https://www.xanadu.ai/) as a theoretical physicist, using his background in quantum computation and software development to perform research and drive forward the field of quantum software. 

*Links*: [Tutorial](https://github.com/XanaduAI/qml/pull/94)

---
  
##### **Quantum Computer Simulator with Ability to Simulate Noise via Kraus Operators**  
  
*Project description*: My project is a quantum computer simulator with the ability to simulate noise via Kraus operators. The project is written in programming language Julia.
    
*Mentee*: **[Eduard Smetanin](https://www.linkedin.com/in/eduard-smetanin-211b9972/)** is a Software Engineer with 15 years of experience with experience in various programming languages.

*Mentor*: **[Ntwali Bashige](https://twitter.com/nbashige)** is a Quantum Software Engineer at [Zapata Computing](https://www.zapatacomputing.com/). 

*Links*: [Notebook with Examples and Tutorial](https://github.com/eduardsmetanin/NoisyQuantumComputerSimulator).

---
  
##### **VQE Algorithm on Quantum Mechanical Solids**  
  
*Project description*: This project is a deep dive into the question: what will quantum computers be useful for? We focus on the VQE algorithm on quantum mechanical solids, making simplifications until we arrive at a cornerstone of condensed matter physics: the Hubbard model. One property we zero in on is magnetism and its close connection with spin; by the end, we discover the ground state and then predict its magnetic properties.
    
*Mentee*: **[Warren Alphonso](https://www.linkedin.com/in/warrenalphonso/)** is an undergraduate at UC Berkeley. 

*Mentor*: **[Ntwali Bashige](https://twitter.com/nbashige)** is a Quantum Software Engineer at [Zapata Computing](https://www.zapatacomputing.com/). 

*Links*: [Project Webpage and Tutorial](https://warrenalphonso.github.io/qc/hubbard), [Github Repo](https://github.com/warrenalphonso/qc-mentorship).

---
  
##### **Implementing a SWAP-based BidiREctional Heuristic Search algorithm (SABRE)**  
  
*Project description*: Due to limited connections between physical qubits, most two-qubit gates cannot be directly implemented on Noisy Intermediate-Scale Quantum (NISQ) devices. A dynamic remapping of logical to physical qubits is needed to enable execution of two qubit gates in a quantum algorithm on a NISQ device. In this project, we have implemented a SWAP-based BidiREctional heuristic search algorithm (SABRE), proposed in the paper *[Tackling the Qubit Mapping Problem for NISQ-Era Quantum Devices](https://arxiv.org/pdf/1809.02573.pdf)* by Gushu Li, Yufei Ding, and Yuan Xie that is applicable to NISQ devices with arbitrary qubit connections. Our goal with this implementation is to be able to provide a tool that can be used by quantum programmers to explore the qubit mapping problem on their own physical qubit connections or predefined chip architectures.
    
*Mentee*: **[Kaustuvi Basu](https://www.linkedin.com/in/kaustuvibasu/)** - I am a full stack software developer with over 3.5 years of experience in Python, Angular and DevOps and have been contributing to Quantum Programming Studio and quantum-circuit tools for Quantastica for the past 1 year.

*Mentor*: **[Petar Korponaić](https://www.linkedin.com/in/petar-korponaic/)** is a software engineer and entrepreneur, founder at Quantastica, and quantum computing enthusiast with 25+ years of experience in information technology, he is author and contributor in many projects including "[quantum-circuit](https://quantum-circuit.com)" - open source quantum circuit simulator and automatic converter between quantum programming languages.

*Links*: [Notebook with Examples and Tutorial](https://github.com/Kaustuvi/quantum-qubit-mapping), [Project Webpage](https://pypi.org/project/quantum-qubit-mapping/).

---

##### **Quantum Algorithms for Simulating Ground State of Quantum Many Body Systems** 

*Project description*: I studied how quantum algorithms can help in simulating the ground state  of quantum many body systems. Most of the algorithms currently at disposal (in the so-called NISQ era) to simulate the ground state of a given quantum Hamiltonian are based on variational approaches. While simple in principle, this class of methods require a good physical understanding of the system at hand, in order to make a reasonable (and reasonably simple) Ansatz for the target state.

On the other hand, the so-called imaginary time evolution algorithm ensures the convergence to the ground state, provided that the initial Ansatz had a non-vanishing overlap with the desired state. However, since based on the imaginary time evolution, this algorithm makes use of non-unitary operators, thus making it not particularly suitable to be implemented in a NISQ machine. It has been recently proposed by [Motto et al., 2019](https://arxiv.org/abs/1901.07653). 

*Mentee*: **Dario Rosa** - I am a physicist working on quantum many body problems who wants to see how quantum computing can boost my research towards more ambitious problems.

*Mentor*: **[Maria Kieferova](https://twitter.com/mkieferova)** is a Postdoctoral Fellow at University of Technology in Sydney. Her areas of interest are quantum algorithms, adiabatic quantum computation, and quantum machine learning.

*Links*: [Repository](https://github.com/Dario-Rosa85/QuantumManyBody).

---

##### **Exploring Different Designs and Computational Analysis of Grover's Algorithm** 

*Project description*: The project is the exploration of the designs of Grover's algorithm (ancilla and non-ancilla qubits). Also, we have done complexity analysis of each design on different qubit-number designs to see how the complexity changes by increasing the number of qubits of the length code of the element to be searched for.

*Mentees*: 
- **[Moustafa Elsayed](https://twitter.com/melsayed777)** A Deep learning engineering student, with passion for physics and computer science.
- **Omar Hussein**: A physics student in his final year, who is mainly interested in the experimental side of quantum info. 
- **[Walid](https://twitter.com/Walid_Mk99)**: A physics student in his final year and planning for a master's program in quantum computing and computer, interested in quantum information theory and its application, also an enthusiast about quantum machine learning.

*Mentor*: **[Yuval Sanders](https://researchers.mq.edu.au/en/persons/yuval-sanders)** A Research Fellow, Department of Physics and Astronomy at Macquarie University. Yuval's research is focused on assessing and applying quantum technologies through quantum algorithms, quantum characterization and quantum information theory. The work Yuval does seeks to deliver rigorous assessment procedures and clear use cases for quantum technology.

*Links*: [Repository](https://github.com/moustafa-7/Grover-s-Algorithm-QOSF).

---
