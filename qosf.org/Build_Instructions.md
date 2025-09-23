
# Build Instructions

This document provides detailed instructions on how to build and run the Jekyll website from this repository.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Ruby (2.7 or higher)
- RubyGems
- Bundler

You can check your Ruby and RubyGems installation by running:

```bash
ruby -v
gem -v
```

If you need to install Ruby, please follow the instructions on the [official Ruby website](https://www.ruby-lang.org/en/documentation/installation/).

## Setup

### 1. Clone the Repository

First, clone the repository to your local machine using the following command:

```bash
git clone https://github.com/qosf/qosf.org.git
cd qosf.org/qosf.org
```

### 2. Install Dependencies

Install the necessary Ruby gems (including Jekyll) using Bundler:

```bash
bundle install
```

This command reads the `Gemfile` and installs all the required gems.

## Build the Site

To build your static site, run:

```bash
bundle exec jekyll build
```

This command generates the static site output in the `_site` directory.

## Serve the Site Locally

To serve your website locally and see it in action, run:

```bash
bundle exec jekyll serve
```

This will start a local web server. You can view your website by navigating to `http://localhost:4000` in your web browser. The server will automatically rebuild the site as you make changes to the files.
