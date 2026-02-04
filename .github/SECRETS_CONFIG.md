# GitHub Secrets Configuration Guide

**Purpose:** Set up GitHub Secrets for automated CI/CD deployment

**Location:** Repository Settings > Secrets and variables > Actions

---

## Required Secrets for Production Deployment

### 1. Vercel Deployment Secrets

Add these secrets to enable Vercel deployment:

```
VERCEL_TOKEN
├─ Value: Your Vercel API token
├─ Get from: https://vercel.com/account/tokens
├─ Scope: Full access
└─ Required: YES

VERCEL_ORG_ID
├─ Value: Your Vercel organization ID
├─ Get from: Vercel dashboard > Settings > General
├─ Example: team_xxxxx
└─ Required: YES

VERCEL_SCOPE
├─ Value: Your Vercel scope (team or username)
├─ Get from: Vercel dashboard
├─ Example: cubepay-team
└─ Required: YES
```

### 2. Vercel Project IDs

```
VERCEL_PROJECT_ID_VIEWER
├─ Value: Project ID for cube-viewer app
├─ Get from: Vercel > Settings > General
└─ Required: YES

VERCEL_PROJECT_ID_DEPLOY
├─ Value: Project ID for deploy-cube app
└─ Required: YES

VERCEL_PROJECT_ID_API
├─ Value: Project ID for api-server
└─ Required: YES
```

### 3. Supabase Production Secrets

```
SUPABASE_PROJECT_URL
├─ Value: https://your-project-id.supabase.co
├─ Get from: Supabase > Project Settings > API
└─ Required: YES (if using in CI/CD)

SUPABASE_ANON_KEY
├─ Value: Production anon/public key
├─ Get from: Supabase > Project Settings > API
└─ Required: YES (if using in CI/CD)

SUPABASE_SERVICE_ROLE_KEY
├─ Value: Production service role key
├─ Get from: Supabase > Project Settings > API
├─ ⚠️  HIGHLY SENSITIVE - server-side only
└─ Required: NO (for deployment only)
```

### 4. Notification Secrets (Optional)

```
SLACK_WEBHOOK_URL
├─ Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
├─ Get from: Slack > Create Incoming Webhook
├─ Purpose: Deployment notifications
└─ Required: NO (but recommended)

GITHUB_TOKEN
├─ Value: Auto-provided by GitHub (no setup needed)
├─ Used for: Creating releases, managing PRs
└─ Always available: YES
```

---

## Step-by-Step Setup

### 1. Generate Vercel Token

```bash
# Go to https://vercel.com/account/tokens
# Click "Create Token"
# Name: "CubePay CI/CD"
# Scopes: Full access (or custom: read, create, delete)
# Copy token
```

### 2. Get Vercel Project IDs

For each project (cube-viewer, deploy-cube, api-server):

```bash
# Option A: CLI
vercel projects --token YOUR_TOKEN

# Option B: Dashboard
# Go to https://vercel.com/dashboard
# Click project
# Settings > General
# Copy "Project ID" value
```

### 3. Get Supabase Keys

```bash
# Log into Supabase > Select Project
# Go to Settings (⚙️) > API
# Under "Project API keys":
# - Copy: Project URL
# - Copy: anon/public key (VITE_SUPABASE_ANON_KEY)
# - Copy: service_role key (SUPABASE_SERVICE_ROLE_KEY) - KEEP SECRET
```

### 4. Create Slack Webhook (Optional)

```bash
# Go to https://api.slack.com/apps
# Click "Create New App" > "From scratch"
# Name: "CubePay Deployments"
# Choose your workspace
# Click "Incoming Webhooks"
# Toggle "Activate Incoming Webhooks"
# Click "Add New Webhook to Workspace"
# Select channel: #deployments
# Authorize
# Copy Webhook URL
```

### 5. Add to GitHub Secrets

```bash
# Navigate to: https://github.com/YourOrg/cube-pay-hacks/settings/secrets/actions
# Click "New repository secret"
# Add each secret one by one:

Name: VERCEL_TOKEN
Value: (paste Vercel token)
[Add secret]

Name: VERCEL_ORG_ID
Value: (paste org ID)
[Add secret]

# Continue for all secrets...
```

---

## Secure Storage Best Practices

### ✅ DO

- [x] Use GitHub Secrets for all sensitive values
- [x] Use different secrets for dev/staging/prod
- [x] Rotate secrets every 3-6 months
- [x] Use minimal scopes for tokens (principle of least privilege)
- [x] Enable branch protection requiring status checks
- [x] Review CI/CD logs for secrets exposure

### ❌ DON'T

- [ ] Commit `.env.production` to repository
- [ ] Hardcode API keys in workflow files
- [ ] Share secrets in chat or email
- [ ] Use personal tokens for CI/CD (use service accounts)
- [ ] Print secrets in CI/CD logs
- [ ] Leave tokens visible in browser history

---

## Verification

### Test Secret Access

Create a test workflow:

```yaml
name: Test Secrets
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check Secrets Exist
        run: |
          [ -n "${{ secrets.VERCEL_TOKEN }}" ] && echo "✓ VERCEL_TOKEN found"
          [ -n "${{ secrets.VERCEL_ORG_ID }}" ] && echo "✓ VERCEL_ORG_ID found"
          [ -n "${{ secrets.SUPABASE_PROJECT_URL }}" ] && echo "✓ SUPABASE_PROJECT_URL found"
```

### Required Check

Before deployment, GitHub will verify:
- All referenced secrets exist
- Secrets are not empty
- Workflow has proper permissions

---

## Troubleshooting

### "Resource not found" during deployment

**Cause:** Missing or incorrect Vercel project ID

**Solution:**
```bash
# Verify project IDs
vercel projects --token YOUR_TOKEN

# Update GitHub Secrets with correct IDs
```

### "Authentication failed"

**Cause:** Token is expired or invalid

**Solution:**
```bash
# Generate new token
# Go to https://vercel.com/account/tokens
# Delete old token if still there
# Create new token
# Update VERCEL_TOKEN secret in GitHub
```

### "Permission denied"

**Cause:** Token has insufficient scopes

**Solution:**
```bash
# Create new token with full access
# Or enable needed scopes:
# - read (projects, configurations)
# - create (deployments)
# - delete (deployments)
```

### Secrets not accessible in workflow

**Cause:** Wrong branch protection rules

**Solution:**
```bash
# Go to Repository > Settings > Branches
# Ensure CI/CD checks are configured
# Allow deployment without branch protection for main
```

---

## Reference

| Secret | Type | Required | Expires | Scope |
|--------|------|----------|---------|-------|
| VERCEL_TOKEN | API Key | YES | N/A | Full |
| VERCEL_ORG_ID | ID | YES | N/A | Read |
| VERCEL_PROJECT_ID_* | ID | YES | N/A | Read |
| SUPABASE_PROJECT_URL | URL | NO | N/A | Read |
| SUPABASE_ANON_KEY | API Key | NO | N/A | Read |
| SLACK_WEBHOOK_URL | URL | NO | N/A | Post |

---

## Security Audit Checklist

Before going live:

- [ ] All secrets are in GitHub Secrets (not .env files)
- [ ] No secrets visible in workflow logs
- [ ] Tokens have minimal required scopes
- [ ] Branch protection enabled for main
- [ ] Only authorized users can modify secrets
- [ ] Secret rotation scheduled quarterly
- [ ] Audit log enabled for secret access
- [ ] Deployment only from protected branches

---

**Last Updated:** February 4, 2026  
**Next Review:** May 4, 2026
