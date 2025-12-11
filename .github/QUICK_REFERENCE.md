# CI/CD Quick Reference Guide

## 🚀 Getting Started

Your project now has a fully automated CI/CD pipeline using GitHub Actions!

## 📋 What's Automated

### ✅ On Every Push & Pull Request:
- **Backend Build** - TypeScript compilation and Prisma generation
- **Frontend Build** - Vite production build with type checking
- **Linting** - ESLint checks for code quality
- **Security Audits** - Dependency vulnerability scanning
- **Type Checking** - TypeScript validation

### 🔒 Security Features:
- **CodeQL Analysis** - Automated security scanning
- **Dependency Review** - Checks for vulnerable dependencies
- **License Compliance** - Blocks incompatible licenses

### 📦 On Main Branch Merges:
- **Artifact Storage** - Build outputs saved for 7 days
- **Deployment Ready** - Prepared for automatic deployment

## 🏃 Quick Commands

### View Workflow Status
```bash
# Open GitHub Actions in browser
start https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### Test Locally Before Pushing
```bash
# Backend
cd backend
npm run build
npm run lint # (add if needed)

# Frontend
cd frontend
npm run build
npm run lint
```

### Manual Workflow Trigger
Go to: Actions → Select Workflow → Run workflow

## 🎯 Workflow Files

| File | Purpose | Trigger |
|------|---------|---------|
| `ci-cd.yml` | Main build & test pipeline | Push/PR to main/develop |
| `pr-checks.yml` | PR validation & size check | PR opened/updated |
| `dependency-review.yml` | Dependency security | PR to main |
| `codeql-analysis.yml` | Security scanning | Push/PR/Weekly |
| `env-validation.yml` | Environment check | Daily/Manual |

## 🔧 Common Tasks

### Add a Test Script

**Backend** (`backend/package.json`):
```json
{
  "scripts": {
    "test": "jest"
  }
}
```

**Frontend** (`frontend/package.json`):
```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

### Configure Deployment

Edit `.github/workflows/ci-cd.yml` deploy job:

```yaml
deploy:
  steps:
    - name: Deploy to Production
      run: |
        # Add your deployment commands
        # Example: vercel --prod
      env:
        DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Add Secrets

1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add name and value
4. Use in workflows: `${{ secrets.SECRET_NAME }}`

## 📊 Status Badges

Add to your `README.md`:

```markdown
![Build Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

## 🐛 Troubleshooting

### Build Fails on GitHub but Works Locally?

1. **Check Node version**: Workflow uses Node 20.x
2. **Environment variables**: Add missing secrets
3. **Dependencies**: Ensure `package-lock.json` is committed

### Tests Timing Out?

1. Increase timeout in workflow:
   ```yaml
   - name: Run tests
     run: npm test
     timeout-minutes: 10
   ```

### Database Connection Issues?

Service containers need proper health checks. Already configured in `ci-cd.yml`:
- PostgreSQL on port 5432
- Redis on port 6379

## 📈 Best Practices

### Before Creating PR:
1. ✅ Run `npm run build` locally
2. ✅ Run `npm run lint` locally
3. ✅ Commit `package-lock.json` changes
4. ✅ Write descriptive commit messages

### PR Title Format:
```
feat: add new feature
fix: resolve bug
docs: update documentation
chore: update dependencies
```

### Branch Strategy:
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches

## 🔄 Workflow Process

```
1. Create Feature Branch
   ↓
2. Make Changes & Commit
   ↓
3. Push to GitHub
   ↓
4. CI Runs Automatically
   ├─ Build Backend ✓
   ├─ Build Frontend ✓
   └─ Security Checks ✓
   ↓
5. Create Pull Request
   ↓
6. PR Checks Run
   ├─ Bundle Size Check ✓
   ├─ Dependency Review ✓
   └─ Code Quality ✓
   ↓
7. Merge to Main
   ↓
8. Deploy Job Runs
   └─ Ready for Production! 🚀
```

## 📚 Resources

- [Full Documentation](./CI_CD_DOCUMENTATION.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## 💡 Tips

- **Cache is your friend**: Workflows cache `node_modules` for speed
- **Parallel jobs**: Backend and frontend build simultaneously
- **Fail fast**: Pipeline stops on critical errors to save time
- **Artifacts**: Build outputs available for 7 days after run

## 🎉 Next Steps

1. **Push these workflow files** to your repository
2. **Add repository secrets** for deployment (if needed)
3. **Configure branch protection** rules
4. **Add status badges** to your README
5. **Set up deployment** platform integration

---

**Questions?** Check the [full documentation](./CI_CD_DOCUMENTATION.md) or open an issue!
