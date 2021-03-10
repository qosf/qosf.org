---

# Page settings
layout: default
keywords:
comments: false

# Hero section
title: Quantum Computing Mentorship Program Cohort Two Showcase 
description: Connecting quantum enthusiasts with mentors from academia & industry.
buttons:
    - content: Apply for mentorship
      url: 'https://forms.gle/rPBAQLfnU5acAV2j8'
      external_url: true
      icon: stackoverflow

# Micro navigation
micro_nav: false

permalink: /mentorship_cohort_2/

---

## Quantum Mentorship Program Cohort 2 Project Showcase 

This is a showcase of all the projects created during the second cohort of our Quantum Computing Mentorship Program. Mentees and mentors worked on a open-source project, with the support of a community of like-minded people from all around the world. In total, there were 24 projects completed!

---

##### **Using RNNs to assist Variational Quantum Algorithms**  
  
*Project description*: Variational Quantum Algorithms (VQAs) are powerful tools which promise to take full advantage of near term quantum computers. However, these algorithms suffer from optimization issues related to random initialization of the parameters. Using PennyLane and Tensorflow, I implemented the architecture proposed by Verdon et al. in "Learning to learn with quantum neural networks via classical neural networks", which leverage a classical Recurrent Neural Network to assist the optimization of variational quantum algorithms by learning an efficient parameter initialization heuristics to ensure rapid training and convergence.    
    
*Mentee*: **[Stefano Mangini](https://twitter.com/stfn_mangini)** is a PhD student on Quantum Computing willing to contribute to the development of open-source codes and learning resources for the quantum computing community. Check out his [personal website](https://www.stefanomangini.com/). 

*Mentor*: **[Antal Száva](https://twitter.com/antalszava)** is a computer scientist working as a Quantum Software Developer at Xanadu. 

*Links*: [Repository](https://github.com/stfnmangini/Learning2learn).

---
  
##### **Implementing Quantum Machine Learning on Real Data**  
      
*Mentee*: **[Rodney Osodo](https://twitter.com/b1ackd0t)** is an undergrad at Jomo Kenyatta University of Agriculture and Technology, class of 2023. Rodney is an Enthusiastic Quantum computing engineer with a clear understanding of Quantum computing and Machine learning and currently training in Mechatronics engineering. He is a part time AI engineer at qualislabs. Check out his [personal website](http://rodneyosodo.com/).

*Mentor*: **[Amira Abbas](https://twitter.com/AmiraMorphism)** is a predoc researcher in the Quantum Research Group at the University of KwaZulu-Natal and part of the IBM Quantum Computing Research team in Zurich, as well as the IBM Quantum Education team in South Africa. Amira holds an undergraduate degree in actuarial science, an honours degree in quantitative finance, a masters degree in physics and is a recipient of Google's PhD Fellowship. She is an active member of numerous community driven initiatives centred around strengthening science and technology in Africa.

*Links*: [Repository](https://github.com/0x6f736f646f/variational-quantum-classifier-on-heartattack), [Blog post](https://rodneyosodo.medium.com/qa1-my-quantum-open-source-foundation-project-402d4f1df1a5?source=friends_link&sk=b78cb74bfa284b290e512dea82fb7d75).

---
  
##### **Tensorflow and Tequila Integration**  
  
*Project description*: The existing Tequila package created by the Alán Aspuru-Guzik Group is a great tool for exploring new quantum algorithms. However, machine learning can greatly expand our options for exploration, and so we created an interface with Tensorflow that allows us to do just that.
    
*Mentee*: **[Brandon Solo](https://www.linkedin.com/in/brandon-solo)** is a computer engineering student who is fascinated with pushing the boundaries of computation and peering into the bleeding edge of technology. 

*Mentor*: **Sumner Alperin-Lea** is a graduate student in the Aspuru-Guzik group at the University of Toronto, and one of the principal developers of Tequila. 

*Links*: [Repository](https://github.com/aspuru-guzik-group/tequila/tree/devel), [Tutorial](https://github.com/aspuru-guzik-group/tequila-tutorials/blob/main/Tensorflow_Interface.ipynb)

---
  
##### **Solovay-Kitaev Algorithm and Fault-Tolerance**  
  
*Project description*: This project consists of an implementation of the Solovay-Kitaev algorithm from a paper by [C. Dawson and M. Nielsen](https://arxiv.org/abs/quant-ph/0505030) for the open source framework Qiskit. The Solovay-Kitaev theorem states that any single qubit gate can be approximated to arbitrary precision by a set of fixed single-qubit gates, if the set generates a dense subset in SU(2). This is an important result, since it means that any single-qubit gate can be expressed in terms of a discrete, universal gate set that we know how to implement fault-tolerantly. Therefore, the Solovay-Kitaev algorithm allows us to take any non-fault tolerant circuit and rephrase it in a fault-tolerant manner.
    
*Mentee*: **[Lisa Noorlander](https://github.com/LNoorl)** is a software engineer with a background in physics and mathematics. 

*Mentor*: **[Julien Gacon](https://www.linkedin.com/in/julien-gacon/)** is a predoctoral researcher at IBM Quantum in Stefan Woerner’s group in Zurich. He’s currently working on application-aware circuit compilation and develops the open-source framework Qiskit. 

*Links*: [Qiskit Contribution](https://github.com/Qiskit/qiskit-terra/pull/5657).

---
  
##### **QuEST Open Source Simulator Benchmark**  
  
*Project description*: As part of my project, I contributed to the Quantum Benchmarks repository. I benchmarked the QuEST open source simulator. I also benchmarked the existing simulators in the repository against the Quantum Fourier Transform algorithm. Additionally, I built a web application to present the result of both the new and existing benchmarks. 
    
*Mentee*: **[Saravanakumar](https://twitter.com/i__am__sk)** is a software engineer at Amazon Braket. His interests lie at the intersection of High Performance Computing and Graph Theory. When he is not lurking Reddit or Twitter, he usually reading about QC, percussion instruments or entrepreneurship. 

*Mentor*: **[Roger Luo](https://twitter.com/rogerluorl18)** is a graduate student at University of Waterloo, Perimeter Institute and a core member of JuliaCN - the Julia language localization organization for Chinese. He's interested in exploring quantum many body physics with machine learning and modern methods of programming. He is one of the creators of QuantumBFS/Yao.jl and many other open source packages in JuliaLang. He regularly contributes to various projects including FluxML/Zygote.jl, FluxML/Flux.jl and PyTorch. 

*Links*: [Web Application](http://quantum-benchmark-app.s3-website-us-west-1.amazonaws.com/), [Contribution](https://github.com/codewithsk/quantum-benchmarks/tree/quest).

---
  
##### **PyZX and Tequila Integration**  
  
*Project description*: This project implemented support for the PyZX package into Tequila platform. Also, an introductory tutorial was created to show what you can do with the ZX-calculus. Additionally, basic import/export for OpenQASM code was included, and made a small tutorial on it.
    
*Mentee*: **[Claudia Zendejas-Morales](https://twitter.com/clausia)** is a physicist and a software engineer with experience in different programming languages who pursues to continue her path on graduate studies on quantum computation and quantum information to become a researcher in this area. She has been collaborating with some communities around the world involved in these topics.

*Mentor*: **[Jakob Kottmann](https://twitter.com/JakobKottmann)** is currently a postdoctoral fellow at The Matter Lab at the University of Toronto.

*Links*: [Tequila Contribution](https://github.com/aspuru-guzik-group/tequila/pull/112), [OpenQASM Conversions Tutorial](https://github.com/aspuru-guzik-group/tequila-tutorials/blob/main/OpenQASMConversions.ipynb), [PyZX Tequila Tutorial](https://github.com/aspuru-guzik-group/tequila-tutorials/blob/main/PyZXwithTequila.ipynb).

---

##### **Layerwise Learning for Quantum Neural Networks** 

*Project description*: In this project we've implemented a strategy presented by [Skolik et al., 2020](https://arxiv.org/pdf/2006.14904.pdf) for effectively quantum neural networks. In layerwise learning the strategy is to gradually increase the number of parameters by adding a few layers and training them while freezing the parameters of previous layers already trained. An easy way for understanding this technique is to think that we're dividing the problem into smaller circuits to successfully avoid to fall into Barren Plateaus. Here, we provide a proof-of-concept for the implementation of this technique in Pennylane's Pytorch interface. 

*Mentee*: **[Felipe Oyarce](https://www.linkedin.com/in/fioyarce/)** is a Machine Learning Developer at NotCo. Master in Quantum Optics and a Quantum Computing Enthusiast. Inspired in technological solutions to real-world problems. 

*Mentor*: **[Theodor Isacsson](https://twitter.com/thisacs)** is a Quantum Software Developer at Xanadu, enthusiastic about pushing the limits of quantum computing software and expanding its usability and usefulness in the field. Outside of work he’s an avid traveller, enjoying adventurous trips, hiking and exploring the world.

*Links*: [Repository](https://github.com/felipeoyarce/layerwise-learning).

---

##### **Effect of Entanglement on Model Training in Quantum Machine Learning** 

*Project description*: Classical neural networks encode higher dimensional vectors(inputs) to lower dimensional vectors(outputs), but the reverse is not possible. Recent research has shown us that scrambling of information from a small subsystem to a larger one is feasible. In our QOSF project, we analyse the effect of entanglement as a variational circuit trains and also study the role of various entropies to characterize entanglement.

*Mentee*: **[Syed Farhan Ahmad](https://twitter.com/melsayed777)** is an Undergraduate Quantum Researcher completing his Bachelor of Engineering in Electronics and Communication from RVCE, Bangalore, India. He is also an IBM GRM intern and loves to work on QC and AI projects. You can learn more about his work on his [personal website](https://born-2learn.github.io/).

*Mentor*: **[Amira Abbas](https://twitter.com/AmiraMorphism)** is a predoc researcher in the Quantum Research Group at the University of KwaZulu-Natal and part of the IBM Quantum Computing Research team in Zurich, as well as the IBM Quantum Education team in South Africa. Amira holds an undergraduate degree in actuarial science, an honours degree in quantitative finance, a masters degree in physics and is a recipient of Google's PhD Fellowship. She is an active member of numerous community driven initiatives centred around strengthening science and technology in Africa.

*Links*: [Repository](https://github.com/born-2learn/Entanglement_in_QML), [Blog Post](https://born-2learn.github.io/posts/2021/01/effect-of-entanglement-on-model-training/).

---

##### **Applying the Variational Quantum Eigensolver to the FeMo Cofactor of Nitrogenase** 

*Project description*: Our project investigates the feasibility of using VQE on complex molecules by applying it to the FeMo cofactor of nitrogenase. Most of the experimental work on VQE has been for relatively small molecules, such as BeH2. We attempt to perform the same experiments on the ~200 electron FeMo cofactor, with the aim of identifying roadblocks one may encounter with larger molecules. The project is firstly a pedagogical exercise for ourselves, as we were both interested in immediate applications of NISQ computers for real-world quantum chemistry calculations. The secondary goal was to identify difficulties that may exist for VQE at larger scales, so that software stacks may be more equipped to handle these molecules as quantum devices mature.

*Mentees*: 
- **[Minsik Cho](http://linkedin.com/in/chominsik)** is an undergraduate student concentrating in chemical physics at Brown University. His main research interests are in computational chemistry.
- **[Roy Tu](https://royktu.com/)** is a cybersecurity consultant based in Seattle. He previously worked with a startup on building plasmonic mercury sensors, and is interested in the applications of quantum computers for problems in computational chemistry.

*Mentor*: **[Vesselin G. Gueorguiev](https://www.linkedin.com/in/vgg-consulting/)** is a physics researcher affiliated with the Ronin Institute for Independent Scholarship and the Institute for Advanced Physical Studies.

*Links*: [Repository](https://github.com/roytu/QOSF-FeMoco2020/), [Blog Post](https://roytu.github.io/QOSF-FeMoco2020/).

---

##### **Finding a Common Algorithm for Calculating Eigenvalue and Eigenvector of a Hermitian Matrix**

*Project description*: The traditional way of finding the minimum eigenvalue of a hermitian matrix consists of the Semi-Classical method where we use Classical Optimization and variational principles to find the lowest eigenvalue of a matrix. This project tries to find a new method to find the lowest eigenvalue without optimization. The Project focuses on finding the eigenvector for 2x2 Hermitian Matrics.

*Mentee*: **[Rohit Prasad](https://www.linkedin.com/in/rohit-prasad-codie-5845b11a9/)** is a physics major student from the Indian Institute of Science Education and Research, Kolkata currently completing his masters degree. 

*Mentor*: **[Petar Korponaić](https://twitter.com/perhane)** is a software engineer and entrepreneur, founder at Quantastica, and quantum computing enthusiast with 25+ years of experience in information technology, he is author and contributor in many projects including “quantum-circuit” - open source quantum circuit simulator and automatic converter between quantum programming languages.

*Links*: [Repository](https://github.com/CodieKev/Quantum_Eigen_Sweat.git), [Tutorial](https://youtu.be/D4DyquIWlh8).

---

##### **Zero Noise Extrapolation for VQE Algorithms**

*Project description*: Quantum error mitigation techniques provide a promising way to deal with noise problems in today’s Noisy Intermediate Scale Quantum Computing (NISQ). These techniques have been reported and used in literature to improve results running on current devices. Thus, the goal of the project was to reproduce the results from [N. Klco et al., 2018](https://arxiv.org/abs/1803.03326) using the [Mitiq](https://mitiq.readthedocs.io/en/latest/README.html) python toolkit to implement zero noise extrapolation of VQE results with a custom folding function and to create a Jupyter Notebook tutorial illustrating the use of the tool.

*Mentee*: **[Javier Naya Hernandez](https://twitter.com/HdezNay)** is a first year MSc Physics student at ETH Zürich. His interested in quantum optics and quantum information. 

*Mentor*: **[Matthias Degroote](https://twitter.com/whynotquantum)** is a quantum computing scientist at Boehringer Ingelheim. He is interested in solving quantum many-body systems in the best possible way.

*Links*: [Repository](https://github.com/JavierNaya/QOSF_Mentorship)

--- 

##### **Python Library for Higher Spin States and Symmetrized Quantum Circuits**

*Project description*: Spheres is an open source python library which provides a set of tools for working with and visualizing higher spin states. Using Majorana's "stellar representation" (of a spin-j state as a constellation of 2j points or "stars" on the sphere), spheres allows you to easily generate circuits preparing spin-j states on qubit-based quantum computers (in the form of permutation symmetric multiqubit states), as well as on photonic quantum computers (in the guise of double harmonic oscillator states). Interfaces with qutip, qiskit, strawberryfields, and pytket. Explore the stabilization of quantum computations via symmetrization, examine the structure of structured Gaussian beams, and harness vpython and matplotlib to bring the geometry of quantum states to life!

*Mentee*: **[Matthew Weiss](https://www.linkedin.com/in/heyredhat/)** is a writer and computer programmer who spends most of his time thinking about quantum computation and the philosophy of quantum mechanics. BA from Brown University, MFA from the Iowa Writers Workshop. He leads the Brooklyn Quantum Meetup. 

*Mentor*: **[Vesselin G. Gueorguiev](https://www.linkedin.com/in/vgg-consulting/)** is a physics researcher affiliated with the Ronin Institute for Independent Scholarship and the Institute for Advanced Physical Studies.

*Links*: [Repository](https://github.com/heyredhat/spheres)

--- 

##### **Python Libraries for Quantum Computing Visualizations and Workflows**

*Project description*: A trio of projects including qonduit, pulseMaker and pyQuirk - a visualization library, tools, and workflow utilizing the best of what’s available, introducing a novel UI for pulse-level control, and currently supports Qiskit and Cirq with more quantum computing integrations planned.

*Mentees*: 
- **[Diego Serrano](https://twitter.com/diemilioser)** obtained the BSc in EE from the Pontificia Universidad Javeriana, and an MSc & PhD in EE from Georgia Tech. He is currently a Director of Engineering at Panasonic, he dedicates his spare time to learn about quantum computing with hopes of someday contributing to the field.
- **[Amir Ebrahimi](https://twitter.com/amir_e)** currently resides in the Bay Area, CA and is working at Unity in ML/DL on Barracuda. He received his BSc in CS from Georgia Tech and is pursuing a MSc in CS from UT Austin. He is bootstrapping in quantum computing until he can perform active research in the field.
- **[Aditya Giridharan](https://twitter.com/_aditya_giri)** graduated with a Bachelor’s degree in Computer Science in 2019, and currently works as a Software Engineer at Citrix R&D in Bangalore. His interests are primarily in Theoretical Computer Science and Mathematics, with a focus on Quantum Algorithms and Complexity.

*Mentor*: **[Tushar Mittal](https://www.linkedin.com/in/tushar-mittal/)** received his B.S. in Chemical Biology from the UC Berkeley. He is a product leader in the quantum computing space working for companies like Rigetti Computing and IBM to deliver developer, cloud and business service offerings for early adopters. He is currently based in the Bay Area.

*Links*: [qonduit](https://github.com/adgt/qonduit), [pulseMaker](https://github.com/adgt/pulseMaker), [pyQuirk](https://github.com/adgt/pyQuirk)

---

##### **Interlin-q: a Distributed Quantum Enabled Simulator**

*Project description*: Interlin-q is a distributed quantum-enabled simulator which imitates the master-slave centralised-control distributed quantum computing system with interconnect communication between the nodes. This open source framework performs the mapping of quantum algorithms designed for monolithic systems to arbitrary distributed quantum computing architectures and moreover simulates the communication and scheduling protocols and finally executes the final distributed quantum circuits over the different nodes. Interlin-q can be used for designing and analysing novel distributed quantum algorithms for various distributed quantum computing architectures. We also demonstrate how algorithms such as quantum phase estimation can be executed over various distributed topologies using Interlin-q. The method used to accomplish this is based on the paper [Distributed Quantum Computing and Network Control for Accelerated VQE](https://arxiv.org/abs/2101.02504).

*Mentee*: **[Rhea Parekh](https://www.linkedin.com/in/rheaparekh12/)** is a physics undergraduate student from the Indian institute of Technology Roorkee. She is really passionate about quantum cryptography, quantum networks, quantum algorithms as well as software engineering. She is also one of the contributors and maintainers of the Quantum Protocol Zoo.

*Mentor*: **[Stephen DiAdamo](https://www.linkedin.com/in/stephendiadamo/)** is a PhD student from the Technical University of Munich where his research focus is designing quantum communication systems. His work involves simulation and protocol design for quantum networks, distributed quantum computing, and quantum information theory. He developed and currently maintains QuNetSim, a quantum network simulation framework.

*Links*: [Repository](https://github.com/Interlin-q/Interlin-q/), [Documentation](https://interlin-q.github.io/Interlin-q/) [Tutorial](https://github.com/Interlin-q/Interlin-q/blob/master/examples/distributed_quantum_phase_estimation_notebook.ipynb)

---

##### **VQE for Quadratic Hamiltonians in Compressed Space**

*Project description*: We have used the fact that matchgate circuits can be simulated in a quantum computer using a logarithmic number of qubits to implement Variational Quantum Eigensolvers for quadratic Hamiltonians in compressed space. We have found an algorithm to compress a 1D homogeneous quadratic Hamiltonian and an appropriate ansatz for the VQE algorithm, and we plan to keep working on the problem. The result is a Python package with classes ready to be used with Qiskit's variational eigensolvers.

*Mentee*: **[Guillermo Blázquez-Cruz](https://twitter.com/gblzq)** has been working as a Data Engineer for +3 years after earning an MsC in Particle Physics. 

*Mentor*: **[Pierre-Luc Dallaire-Demers](https://twitter.com/dallairedemers)** is a Quantum Research Scientist at Zapata Computing.

*Links*: [Repository](https://github.com/gblazq/cVQE)

--- 

##### **Quantum Intermediate Representation**

*Project description*: In this project we study the potential of Quantum Intermediate Representation, an Intermediate Representation for quantum computing programming languages developed by Microsoft. Even if it only supports Q# and QKD for the moment, it has the potential of being used as a toolchain together with any other language. More precisely, we have been investigating how to program a full workflow that translates a Q# program to QIR and back to a quantum simulator – with the idea of running it on real quantum hardware on the future. 

*Mentee*: **[Esther Cruz Rico](https://twitter.com/esthercrrico)** is a PhD candidate in Quantum Computing, working at Max-Planck Institute for Quantum Computing and BMW group. 

*Mentor*: **[Sarah Kaiser](https://twitter.com/crazy4pi314)** is an experimental quantum physicist who excels at building partnerships and communities. She has over 10 years experience specializing in quantum technology, experimental design, and science communication. Working with Python, lasers, and lathes is her jam.

*Links*: [Repository](https://github.com/esthercruz/qosf_mentorship_project), [Blog Post](https://qsharp.community/blog/intermediate-representation-for-quantum-computing/)

--- 

##### **Improving the Compilation Process in Tequila**

*Project description*: Tequila is an open source framework for developing quantum variational algorithms. The project focused on simplifications and optimizations in Tequila's native compiler as well as integrating tket, a state of the art compiler by Cambridge Quantum Computing, for circuit optimization. 

*Mentee*: **[Georgios Tsilimigkounakis](https://twitter.com/tsgeorgios)** is an undergraduate computer science student interested in quantum software.

*Mentor*: **[Jakob Kottmann](https://twitter.com/JakobKottmann)** is a postdoctoral fellow at The Matter Lab at the University of Toronto.

*Links*: [Tequila Contribution](https://github.com/aspuru-guzik-group/tequila/pull/112), [Tutorial](https://github.com/georgios-ts/tequila-tutorials/blob/qsof/Compiler_Tutorial.ipynb)

--- 

##### **Exact Quantum Simulation of Quantum Many Body Systems with Tequila**

*Project description*: Quantum many-body systems are generally hard to solve both analytically and numerically. The computational complexity grows exponentially along with the systems’ size when it comes to simulating quantum many-body systems on a classical computer. Nonetheless, we can construct quantum simulation algorithms to simulate exactly solvable models exactly. An exact quantum simulation will allow us to access not only the ground state but also the full spectrum of many-body systems. In this project, we use Tequila, an open-source package for quantum algorithms, to build quantum circuits that simulate quantum many-body systems exactly. We perform the quantum simulations on both simulators and real IBMQ devices. 

*Mentee*: **[Meng Hua](https://www.linkedin.com/in/meng-hua-715a627b/)** is a physics Ph.D. student in Prof. Jeffrey Teo's group at the University of Virginia. Her research focus on topological quantum matter and topological phases. She is a quantum computing enthusiast and an amateur Go player.

*Mentor*: **[Alba Cervera Lierta](https://twitter.com/albaclierta)** is a postdoctoral researcher at the Alán Aspuru-Guzik group at the University of Toronto. She obtained her PhD in quantum information at the University of Barcelona. Her backgroud includes particle physics, multipartite entanglement and quantum computation. She is currently working on near-term quantum algorithms suited for the NISQ era.

*Links*: [Repository](https://github.com/AnnaMHua/QOSF_Tequila)

--- 

##### **Quantum Computing for Vehicle Routing Problems**

*Project description*: In the logistics industry there is a huge challenge to optimize distribution. This includes choosing how to route a fleet of vehicles to pick up goods at several central depots and distribute them to a number of clients. If we’re now talking about vaccine distribution the stakes are even higher. This project aims to apply a quantum solution to the problem of optimal vaccine distribution. Using actual vaccination locations in Colombia, this project uses a combination of classical k-means clustering and a quantum solution to the Travelling Salesman Problem (TSP) to find a valid solution to the vaccine distribution problem. The project is available both in spanish and english. 

*Mentee*: **[Catalina Albornoz](https://www.linkedin.com/in/catalinaalbornoz/)** is passionate about quantum computing and sustainability. Currently as an IBM Quantum ambassador, she works on developing the Latin American quantum ecosystem. Catalina is an Electronics and Mechanical Engineer and MSc. in Electronics from Los Andes University and has a Diplôme d’Ingénieur from IMT Atlantique.

*Mentor*: **[Vesselin G. Gueorguiev](https://www.linkedin.com/in/vgg-consulting/)** is a physics researcher affiliated with the Ronin Institute for Independent Scholarship and the Institute for Advanced Physical Studies.

*Links*: [Repository](https://github.com/CatalinaAlbornoz/Quantum_Vehicle_Routing)

--- 

##### **Hybrid Quantum-Classical Machine Learning Algorithm for K-means Clustering***

*Project description*: This project is an implementation of Grover's search algorithm for finding the minimum (Durr-Hoyer) and k-means clustering using coresets. It is inspired by [this paper](https://arxiv.org/abs/2004.00026).

*Mentees*: 
- **[Anton Simen](https://www.linkedin.com/in/anton-simen-227059114/)** is pursuing a bachelor's degree in Engineering Physics at the Federal University of Latin American Integration. Anton has also been an undergraduate researcher in the field of quantum algorithm development for the past two years.
- **[Mauro Nooblath](https://www.linkedin.com/in/mauro-nooblath-503526150/)** is an undergraduate student of  Engineering Physics from the Federal University of Latin American Integration (UNILA) since 2016. His research interests are in quantum machine learning and quantum cryptography.

*Mentor*: **[Ethan Hansen](https://twitter.com/1ethanhansen)** is a Product Marketing Specialist at Zapata Computing and the host of the podcast Quantum Computing Now. He is a quantum computing enthusiast and is self-taught (for now!) Within the field of QC. He also enjoys exploring the intersection with machine learning and cybersecurity.

*Links*: [Repository](https://github.com/AntonSimen06/QOSF_project)

--- 

##### **Variational Embeddings in Quantum Machine Learning**

*Project description*: Machine Learning is a potential application for near-term intermediate scale quantum computers with possible speed-ups over their classical counterparts. Quantum classifiers are quantum circuits that can be trained to classify data in two stages; 1) Embedding: the input data is encoded into quantum states, embedding it to a high-dimensional Hilbert space. 2) Measurement: A quantum measurement of the circuit to discriminate between classes. Usually, the measurement part of the circuit is trained but in a [recent paper](https://arxiv.org/abs/2001.03622) an alternate approach has been adopted where the embedding part of the circuit is trained instead, freeing up more precious resources. In this work, we benchmark various embeddings and cost functions and propose improvements.

*Mentees*: 
- **[Narges Alavi Samani](https://www.linkedin.com/in/narges-alavi-samani/)** received her M.Sc. in Computer Science at Université Paris Diderot joint with École Normale Supérieure and École Polytechnique, France. Narges did her Master’s thesis at Sorbonne University with a focus on Quantum Machine Learning. Her research interests lie at the intersection of Quantum Computing and Machine Learning.
- **[Mudassir Moosa](https://www.linkedin.com/in/mudassir-moosa/)** is currently a postdoc in physics at Cornell University. Mudassir's research interests are in applications of quantum information in high energy theory.
- **[Syed Raza](https://www.linkedin.com/in/syedraza22/)** is a Senior Data Scientist at a credit risk consulting firm based in Washington DC. He recently graduated with a PhD in Physics from University of Virginia with a focus on Topological Quantum Computation. Syed is interested in Quantum Machine Learning and its applications.

*Mentor*: **[Aroosa Ijaz](https://www.linkedin.com/in/aroosaijaz/)** a graduate student in QML at the Vector Institute. Aroosa has previously worked at Xanadu as a quantum machine learning scientist. Her education specializes in quantum information, quantum computing and quantum optics.

*Links*: [Repository](https://github.com/mudassirmoosa/variational_embedding_circuits), [Report](https://github.com/mudassirmoosa/variational_embedding_circuits/tree/master/Report)

--- 

##### **The Schwinger Model and Quantum Computing**

*Project description*: Quantum field theories are the mathematical description of the physical world and underlie the Standard Model of Particle Physics (SM). Quantum computers bear the possibility of contributing to progress in fundamental particle physics. With this project, the Lattice Schwinger model is chosen to explain the fundamental steps underlying QFT theories. The goal is to show, using the Schwinger model, how quantum field theories can be simulated on a quantum device with using descriptions and language suitable for those without a background in particle physics and quantum field theories.

*Mentee*: **[Annabel Kropf](https://www.linkedin.com/in/annabel-kropf-83a919204/)** is a graduate student from the Technical University of Munich. She wrote her master thesis in experimental particle physics, where she worked at the Institut Laue-Langevin in Grenoble assisting a year-long measurement campaign aimed at measuring the decay spectrum of nuclear beta decay to identify novel terms beyond the Standard Model. Her background includes particle physics and statistical physics. 

*Mentor*: **[Alba Cervera Lierta](https://twitter.com/albaclierta)** is a postdoctoral researcher at the Alán Aspuru-Guzik group at the University of Toronto. She obtained her PhD in quantum information at the University of Barcelona. Her backgroud includes particle physics, multipartite entanglement and quantum computation. She is currently working on near-term quantum algorithms suited for the NISQ era.

*Links*: [Repository](https://github.com/mudassirmoosa/variational_embedding_circuits), [Report](https://github.com/mudassirmoosa/variational_embedding_circuits/tree/master/Report)

---

##### **Pennylane and pytket Integration**  
  
*Project description*: The aim is to develop an open source package in Python which uses the Tket framework to compile quantum circuits and which takes advantage of the automatic differentiation ability of PennyLane. 
    
*Mentee*: **[Kimara Naicker](https://twitter.com/kimara31)** is a PhD researcher at the University of KwaZulu-Natal and a member of the Centre for Quantum Technology Research Group. Her research focuses on applications of machine learning techniques to the description of open quantum system dynamics. 

*Mentor*: **[Seyon Sivarajah](https://twitter.com/SeyonSivarajah)** is technical product lead Cambridge Quantum Computing's quantum software development platform tket. His work involves researching, designing and developing state of the art solutions for maximising the use of near term quantum computers.

*Links*: [Repository](https://github.com/kimaranaicker/pytket-pennylane).

---
