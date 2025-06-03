# Contributing to QOSF.org

Thank you for your interest in contributing to QOSF! Whether you’re fixing a typo, adding a new page, or sprucing up content, your contributions make quantum computing more accessible to everyone. This guide is here to help you submit awesome pull requests (PRs) to the QOSF website, even if you’re new to open-source.

## Getting Started

You’ll need a [GitHub account](https://github.com) to get started. If you don’t have one, signing up is free and quick.

### Step 1: Fork the Repository
- Head to the [QOSF.org repository](https://github.com/qosf/qosf.org).
- Click the **Fork** button in the top-right corner to create your own copy of the repository.

### Step 2: Clone Your Fork
- Download your forked repository to your computer:
  ```bash
  git clone https://github.com/your-username/qosf.org.git
  ```
  Replace `your-username` with your GitHub username.

### Step 3: Set Up Your Environment
The QOSF website uses [Jekyll](https://jekyllrb.com), a tool that turns Markdown files into web pages. To see your changes locally, set up Jekyll:

- **Install Ruby**: Install it from [ruby-lang.org](https://www.ruby-lang.org/en/downloads/). On macOS, try:
  ```bash
  brew install ruby
  ```
  On Ubuntu:
  ```bash
  sudo apt-get install ruby
  ```
- **Install Jekyll and Bundler**:
  ```bash
  gem install jekyll bundler
  ```
- Navigate to the repository folder:
  ```bash
  cd qosf.org
  ```
- Install dependencies:
  ```bash
  bundle install
  ```

### Step 4: Create a Branch
- Make a new branch for your changes:
  ```bash
  git checkout -b your-branch-name
  ```
  Pick a clear name, like `fix-typo-about` or `add-new-guide`.

### Step 5: Make Your Changes
- Edit files in the repository. Most content lives in Markdown (`.md`) files in the root directory, like `about.md` or `learn_quantum.md`.
- To preview your changes, run:
  ```bash
  bundle exec jekyll serve
  ```
- Open [http://localhost:4000](http://localhost:4000) in your browser to see the updated site.

### Step 6: Commit Your Changes
- Save your changes:
  ```bash
  git add .
  ```
- Commit with a clear message:
  ```bash
  git commit -m "Fixed typo in Learn Quantum page"
  ```

### Step 7: Push to Your Fork
- Upload your changes to your GitHub fork:
  ```bash
  git push origin your-branch-name
  ```

### Step 8: Submit a Pull Request
- Go to your forked repository on GitHub.
- Click **Pull requests** > **New pull request**.
- Select your branch and the main repository’s `main` branch.
- Add a clear title (e.g., “Add contributing guide”) and describe what you changed and why.
- Click **Create pull request**.

## Tips for Great Pull Requests
- **Keep it Focused**: Stick to one change per PR, like fixing a typo or adding a section.
- **Clear Descriptions**: Explain what you did and why it matters. If it fixes an issue, mention it (e.g., “Fixes #123”).
- **Test Locally**: Use `jekyll serve` to check your changes before submitting.
- **Be Patient**: Maintainers will review your PR and may suggest tweaks.

## Adding to the Quantum Software Project List

The list of open-source quantum software projects, found at [/project_list](https://qosf.org/project_list/), is maintained in a separate repository: [qosf/awesome-quantum-software](https://github.com/qosf/awesome-quantum-software). To add a new project, contribute to that repository by following its [CONTRIBUTING.md](https://github.com/qosf/awesome-quantum-software/blob/master/CONTRIBUTING.md) guidelines. Here’s a quick overview:

- **Check for Duplicates**: Look at the [project list](https://qosf.org/project_list/) and open PRs to avoid repeats.
- **Ensure Open-Source**: The project must have an open-source license (e.g., MIT, Apache).
- **Choose the Right Category**: Place it under categories like “Quantum simulators” or “Quantum algorithms.”
- **Follow Alphabetical Order**: Add the project in the correct spot within its category.
- **Use the Correct Format**: List projects as `[Project Name](URL) - Short description.` For example:
  ```markdown
  [QuantumSim](https://github.com/example/quantumsim) - Python-based quantum simulator for education.
  ```
- **Keep Descriptions Short**: One line, starting with a capital, ending with a period, and avoiding “A” or “An.”
- **Check Spelling and Grammar**: Double-check for errors.
- **Propose New Categories**: Suggest new categories if needed, explaining why in your PR.
- **Add Related Links**: Include extra resources at the end if relevant.

For full details, check the [awesome-quantum-software contributing guide](https://github.com/qosf/awesome-quantum-software/blob/master/CONTRIBUTING.md).

## Need Help?
Got questions? Open an issue in the [QOSF.org repository](https://github.com/qosf/qosf.org/issues) or reach out to the maintainers in [slack](https://join.slack.com/t/qosf/shared_invite/zt-2nq2n0t9i-PyiiCKg1bAzRpNzLMM7pWg). We’re here to help!

Thank you for joining us in advancing open-source quantum computing! 💜