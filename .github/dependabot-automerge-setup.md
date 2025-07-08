# Dependabot Auto-Merge Setup

This repository is configured to automatically merge Dependabot pull requests when CI passes.

## How it works

1. **Dependabot Configuration** (`.github/dependabot.yml`):
   - Configured to check for updates weekly on Mondays
   - Groups related dependencies together
   - Ignores major version updates for critical packages (React, TypeScript, Sequelize, etc.)
   - Adds "automerge" label to all PRs

2. **Auto-Merge Workflow** (`.github/workflows/dependabot-automerge.yml`):
   - Automatically approves Dependabot PRs
   - Enables GitHub's auto-merge feature for patch and minor updates
   - Major updates require manual review

3. **CI Integration**:
   - Auto-merge only happens after all CI checks pass:
     - Linting
     - Type checking
     - Tests (frontend and backend)
     - Bundle size checks
   - GitHub's branch protection rules ensure CI must pass before merging

## Requirements

To enable this feature, ensure the following GitHub repository settings:

1. **Enable Auto-Merge**:
   - Go to Settings → General
   - Under "Pull Requests", enable "Allow auto-merge"

2. **Branch Protection Rules** for `main`:
   - Require pull request reviews before merging
   - Dismiss stale pull request approvals when new commits are pushed
   - Require status checks to pass before merging:
     - `lint`
     - `types`
     - `test`
     - `test-server`
   - Include administrators in these restrictions

3. **Dependabot Security**:
   - Go to Settings → Code security and analysis
   - Enable Dependabot security updates

## Manual Intervention

The following updates require manual review:
- Major version updates
- Updates to critical packages (React, TypeScript, Sequelize, ProseMirror)
- Any PR where CI fails

## Monitoring

- Check the Actions tab for workflow runs
- Failed auto-merge attempts will be logged but won't fail the workflow
- Major updates will have a comment explaining why manual review is needed