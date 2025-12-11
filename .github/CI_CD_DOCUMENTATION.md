# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. The pipeline automates building, testing, and deploying both the backend and frontend applications.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Backend Job
- Sets up Node.js environment
- Spins up PostgreSQL and Redis test databases
- Installs dependencies
- Generates Prisma client
- Runs database migrations
- Performs TypeScript type checking
- Builds the backend application
- Runs tests (if configured)
- Uploads build artifacts

#### Frontend Job
- Sets up Node.js environment
- Installs dependencies
- Runs ESLint for code quality
- Performs TypeScript type checking
- Builds the frontend application
- Runs tests (if configured)
- Uploads build artifacts

#### Code Quality Job
- Runs security audits on both backend and frontend
- Checks code formatting (optional)

#### Deploy Job
- Only runs on `main` branch pushes
- Downloads build artifacts
- Ready for deployment configuration

#### Notify Job
- Provides build status summary
- Runs regardless of previous job outcomes

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Features:**
- Validates PR titles
- Checks for large files
- Auto-labels PRs based on changed files
- Compares bundle sizes between base and PR branches

### 3. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` branch

**Features:**
- Reviews dependency changes
- Fails on moderate or higher severity vulnerabilities
- Blocks GPL-2.0 and GPL-3.0 licenses
- Comments summary in PR

### 4. CodeQL Security Analysis (`codeql-analysis.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Weekly schedule (Sundays at 00:00 UTC)

**Features:**
- Analyzes JavaScript and TypeScript code
- Runs security and quality queries
- Reports findings to GitHub Security tab

## Environment Variables

### Required for Backend Tests
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment mode (test, development, production)

### Optional for Frontend Build
- `NODE_ENV`: Set to production for optimized builds

## Setup Instructions

### 1. Enable GitHub Actions
GitHub Actions is enabled by default. Push these workflow files to activate them.

### 2. Configure Secrets (for deployment)
Go to your repository settings → Secrets and variables → Actions:

```
# Example secrets you might need
DEPLOY_KEY
API_TOKEN
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
HEROKU_API_KEY
VERCEL_TOKEN
```

### 3. Update Deployment Configuration
Edit the `deploy` job in `ci-cd.yml` to match your hosting platform:

#### For Heroku:
```yaml
- name: Deploy to Heroku
  run: |
    git remote add heroku https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/your-app.git
    git push heroku main
```

#### For Vercel:
```yaml
- name: Deploy to Vercel
  run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  working-directory: ./frontend
```

#### For AWS S3 + CloudFront:
```yaml
- name: Deploy Frontend to S3
  run: |
    aws s3 sync frontend/dist s3://your-bucket --delete
    aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

#### For Railway:
```yaml
- name: Deploy to Railway
  run: railway up
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 4. Configure Branch Protection Rules
Go to Settings → Branches → Add rule:

1. **Branch name pattern:** `main`
2. **Enable:**
   - Require a pull request before merging
   - Require status checks to pass before merging
   - Select status checks:
     - Backend Build & Test
     - Frontend Build & Test
     - Code Quality Checks
   - Require branches to be up to date before merging

## Adding Tests

### Backend Tests
Create a test script in `backend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Install testing dependencies:
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Frontend Tests
Create a test script in `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Install testing dependencies:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Monitoring Pipeline Status

### Workflow Status
- View workflow runs: Repository → Actions tab
- Click on any workflow run to see detailed logs
- Check job summaries for build reports

### Status Badges
Add badges to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/your-username/your-repo/actions/workflows/ci-cd.yml/badge.svg)
![CodeQL](https://github.com/your-username/your-repo/actions/workflows/codeql-analysis.yml/badge.svg)
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failures
- Ensure service containers are properly configured
- Check DATABASE_URL format
- Verify migrations are up to date

#### 2. Build Failures
- Clear npm cache: `npm ci --cache .npm --prefer-offline`
- Check Node.js version compatibility
- Verify all dependencies are in package.json

#### 3. Test Timeouts
- Increase timeout in test configuration
- Check for hanging promises or connections

#### 4. Deployment Failures
- Verify all required secrets are set
- Check deployment platform credentials
- Ensure build artifacts are correctly generated

## Performance Optimization

### Caching
The pipeline uses GitHub Actions caching for:
- Node modules
- Build outputs

This significantly speeds up subsequent runs.

### Parallelization
Jobs run in parallel when possible:
- Backend and Frontend build independently
- Code quality checks run separately

## Best Practices

1. **Keep workflows focused:** Each workflow has a specific purpose
2. **Use matrix builds:** Test against multiple Node.js versions if needed
3. **Cache dependencies:** Reduces build time significantly
4. **Fail fast:** Stop on first critical error to save resources
5. **Secure secrets:** Never expose secrets in logs
6. **Monitor costs:** GitHub Actions has usage limits on free tier

## Maintenance

### Regular Updates
- Update action versions quarterly
- Review and update dependencies
- Monitor security advisories

### Workflow Optimization
- Review workflow duration
- Identify bottlenecks
- Optimize slow jobs

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
