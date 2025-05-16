# Contributing to LeadLines GitHub Repository

This document provides guidance on how to contribute changes to the LeadLines GitHub repository safely and effectively.

## Prerequisites

- Git installed on your local machine
- A GitHub account with access to the LeadLines repository
- A GitHub Personal Access Token (PAT) with appropriate permissions

## Setting Up Your Environment

### 1. Clone the Repository

```bash
git clone https://github.com/Bluecraft-AI/LeadLines-Mark-1.git
cd LeadLines-Mark-1
```

### 2. Using the Sync Scripts

This repository includes two convenience scripts to help with syncing changes:

- `sync-from-github.sh` - Pulls the latest changes from GitHub
- `sync-to-github.sh` - Pushes your local changes to GitHub

## Securely Using Your GitHub Token

There are several ways to securely use your GitHub Personal Access Token:

### Method 1: Environment Variable (Recommended)

Set an environment variable before running scripts:

```bash
export GITHUB_TOKEN="your_token_here"
./sync-to-github.sh
```

The environment variable will be used automatically if available.

### Method 2: Respond to Prompt

Our sync scripts will prompt for your token if not provided as an environment variable:

```bash
./sync-to-github.sh
# When prompted, enter your GitHub token
```

### Method 3: Git Credential Helper

Configure Git to remember your credentials:

```bash
git config credential.helper store
# The first time you push, you'll be asked for your token
# Future pushes will use the stored token
```

## IMPORTANT: Security Best Practices

1. **NEVER commit your token to the repository**
2. **DO NOT include your token in shared scripts or config files**
3. **DO NOT share your token with others**
4. **Set an expiration date for your token in GitHub settings**
5. **Use tokens with the minimum required permissions**

## Manual GitHub Operations

If you prefer to perform GitHub operations manually instead of using the sync scripts:

### Pulling Changes

```bash
# Set the remote URL with your token
git remote set-url origin https://your_token@github.com/Bluecraft-AI/LeadLines-Mark-1.git

# Pull changes
git pull origin main
```

### Pushing Changes

```bash
# Add your changes
git add .

# Commit your changes
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main
```

## Help and Support

If you encounter issues with GitHub authentication or have questions about contributing, please contact the repository maintainer. 