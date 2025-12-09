# GitHub Configuration

This directory contains GitHub-specific configurations including automated workflows, issue templates, and repository settings.

## Contents

### Workflows (`workflows/`)
Automated CI/CD pipelines and checks:

- **`ci-cd.yml`** - Main build, test, and deployment pipeline
- **`pr-checks.yml`** - Pull request validation and bundle size comparison
- **`dependency-review.yml`** - Reviews dependency changes in PRs
- **`codeql-analysis.yml`** - Security code analysis
- **`env-validation.yml`** - Daily dependency and environment checks

### Configuration Files

- **`labeler.yml`** - Automatic PR labeling based on changed files
- **`CI_CD_DOCUMENTATION.md`** - Comprehensive CI/CD documentation

## Quick Start

### Running Workflows Locally

You can test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
winget install nektos.act

# Run CI/CD workflow
act push

# Run specific job
act -j backend
```

### Workflow Status

Check workflow status:
- Navigate to the "Actions" tab in your GitHub repository
- View recent workflow runs and their results

### Adding Status Badges

Add to your main README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)
![CodeQL](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/codeql-analysis.yml/badge.svg)
```

## Customization

### Modifying Triggers

Edit workflow files to change when they run:

```yaml
on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main]
```

### Adding Jobs

Add new jobs to existing workflows:

```yaml
jobs:
  my-new-job:
    name: My New Job
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Hello World"
```

### Environment Variables

Add repository secrets at:
Settings → Secrets and variables → Actions → New repository secret

## Support

For issues with workflows:
1. Check workflow logs in Actions tab
2. Review CI_CD_DOCUMENTATION.md
3. Consult [GitHub Actions documentation](https://docs.github.com/en/actions)
