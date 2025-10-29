# How to Install and Set Up Claude Code on Your Mac

## Overview
Claude Code is Anthropic's powerful AI coding assistant that integrates directly into your development workflow. This guide will walk you through installing and configuring Claude Code on your Mac computer.

## What is Claude Code?
Claude Code (formerly Claude Dev) is an AI-powered coding assistant that helps you write, debug, and understand code. It can read your files, execute commands, and help with complex programming tasks while maintaining context across your entire project.

## System Requirements
- **macOS**: 12.0 (Monterey) or later
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 2GB free space
- **Internet**: Stable connection required
- **VS Code**: Version 1.85.0 or later

## Step 1: Prerequisites

### 1.1 Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.2 Install Node.js
```bash
brew install node
# Verify installation
node --version
npm --version
```

### 1.3 Install Git
```bash
brew install git
# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Install VS Code

### 2.1 Download VS Code
1. Visit [code.visualstudio.com](https://code.visualstudio.com/)
2. Click "Download for Mac"
3. Choose Apple Silicon or Intel chip version

### 2.2 Install VS Code
1. Open the downloaded `.zip` file
2. Drag Visual Studio Code to Applications folder
3. Open VS Code from Applications

### 2.3 Add VS Code to PATH
```bash
# Open VS Code
# Press Cmd+Shift+P
# Type: Shell Command: Install 'code' command in PATH
# Select and press Enter
```

## Step 3: Install Claude Code Extension

### Method 1: VS Code Marketplace
1. Open VS Code
2. Click Extensions icon (⌘⇧X)
3. Search for "Claude Code" or "Claude Dev"
4. Click "Install" on the official Anthropic extension
5. Reload VS Code when prompted

### Method 2: Command Line
```bash
code --install-extension anthropic.claude-code
```

### Method 3: Manual Installation
```bash
# Download the VSIX file
curl -L https://marketplace.visualstudio.com/_apis/public/gallery/publishers/anthropic/vsextensions/claude-code/latest/vspackage -o claude-code.vsix

# Install via VS Code
code --install-extension claude-code.vsix
```

## Step 4: Configure Claude Code

### 4.1 Get API Key
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign in or create account
3. Navigate to API Keys
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### 4.2 Set Up API Key in VS Code
1. Open VS Code Settings (⌘,)
2. Search for "Claude"
3. Find "Claude Code: API Key"
4. Enter your API key
5. Save settings

### 4.3 Alternative: Environment Variable
```bash
# Add to ~/.zshrc or ~/.bash_profile
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

## Step 5: Initial Configuration

### 5.1 Open Claude Code Panel
1. Click Claude icon in Activity Bar (left sidebar)
2. Or use keyboard shortcut: ⌘⇧C

### 5.2 Configure Preferences
```json
{
  "claude-code.apiKey": "sk-ant-your-key-here",
  "claude-code.model": "claude-3-opus-20240229",
  "claude-code.maxTokens": 4096,
  "claude-code.temperature": 0.2,
  "claude-code.autoSave": true,
  "claude-code.contextWindow": "large",
  "claude-code.streamResponses": true
}
```

### 5.3 Set Up Workspace Settings
Create `.vscode/settings.json` in your project:
```json
{
  "claude-code.includeFiles": [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.md",
    "**/*.json"
  ],
  "claude-code.excludeFiles": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ],
  "claude-code.projectContext": true
}
```

## Step 6: Create CLAUDE.md Files

### 6.1 Global Instructions
Create `~/.claude/CLAUDE.md`:
```bash
mkdir -p ~/.claude
nano ~/.claude/CLAUDE.md
```

Example content:
```markdown
# Global Claude Instructions

- Always use TypeScript for new files
- Follow ESLint rules strictly
- Write comprehensive tests
- Add JSDoc comments for functions
- Prefer functional programming patterns
```

### 6.2 Project-Specific Instructions
Create `CLAUDE.md` in project root:
```markdown
# Project Instructions for Claude Code

## Architecture
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: MongoDB

## Coding Standards
- Use async/await over promises
- Implement error boundaries
- Follow REST API conventions

## Testing Requirements
- Minimum 80% code coverage
- Test all API endpoints
- Include integration tests
```

## Step 7: Essential Commands & Shortcuts

### Keyboard Shortcuts
- **Open Claude**: ⌘⇧C
- **New Chat**: ⌘⇧N
- **Clear Chat**: ⌘⇧K
- **Stop Generation**: ESC
- **Copy Code**: ⌘C (when hovering over code block)

### Claude Commands in VS Code
```bash
# Command Palette (⌘⇧P)
> Claude: New Chat
> Claude: Clear History
> Claude: Set API Key
> Claude: Toggle Auto-Save
> Claude: Export Chat
```

## Step 8: Optimize Performance

### 8.1 Configure Memory Usage
```bash
# Increase VS Code memory limit
# Edit: /Applications/Visual Studio Code.app/Contents/Info.plist
# Add under <dict>:
<key>LSEnvironment</key>
<dict>
  <key>NODE_OPTIONS</key>
  <string>--max-old-space-size=8192</string>
</dict>
```

### 8.2 Optimize Extensions
```bash
# Disable unnecessary extensions for better performance
code --list-extensions
code --disable-extension <extension-id>
```

### 8.3 Cache Settings
```json
{
  "claude-code.cacheResponses": true,
  "claude-code.cacheDuration": 3600,
  "claude-code.clearCacheOnRestart": false
}
```

## Step 9: Advanced Features

### 9.1 Custom Prompts
Create `.claude/prompts.json`:
```json
{
  "prompts": {
    "review": "Review this code for security vulnerabilities and performance issues",
    "refactor": "Refactor this code following SOLID principles",
    "test": "Write comprehensive tests for this code",
    "document": "Add JSDoc comments and update README"
  }
}
```

### 9.2 Workspace Integration
```json
{
  "claude-code.workspaceIntegration": {
    "gitIntegration": true,
    "autoCommitMessages": true,
    "branchNaming": "feature/claude-{timestamp}",
    "pullRequestTemplate": true
  }
}
```

### 9.3 Tool Integration
```bash
# Install Claude CLI tool
npm install -g @anthropic/claude-cli

# Use from terminal
claude ask "How do I implement authentication in Express?"
claude review ./src/auth.js
claude test ./src/utils.js
```

## Step 10: Troubleshooting

### Common Issues & Solutions

#### 1. API Key Not Working
```bash
# Verify API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-opus-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "Hi"}]}'
```

#### 2. Extension Not Loading
```bash
# Reinstall extension
code --uninstall-extension anthropic.claude-code
code --install-extension anthropic.claude-code

# Clear VS Code cache
rm -rf ~/Library/Application\ Support/Code/Cache/*
rm -rf ~/Library/Application\ Support/Code/CachedData/*
```

#### 3. Slow Response Times
- Check internet connection
- Reduce context window size
- Clear conversation history
- Disable streaming if unstable connection

#### 4. Context Limit Exceeded
```json
{
  "claude-code.contextLimit": 100000,
  "claude-code.smartContext": true,
  "claude-code.contextPruning": "automatic"
}
```

## Step 11: Best Practices

### 11.1 Security
1. **Never commit API keys** - Use environment variables
2. **Review generated code** - Always audit before running
3. **Limit file access** - Configure exclude patterns
4. **Use read-only mode** - When reviewing sensitive code

### 11.2 Efficiency Tips
1. **Clear context regularly** - Prevents confusion
2. **Use specific prompts** - Better results
3. **Provide examples** - Helps Claude understand patterns
4. **Break complex tasks** - Into smaller requests

### 11.3 Collaboration
1. **Share CLAUDE.md** - Team consistency
2. **Document patterns** - In project README
3. **Create templates** - For common tasks
4. **Version control prompts** - Track what works

## Step 12: Useful Workflows

### 12.1 Code Review Workflow
```bash
# 1. Stage changes
git add .

# 2. Ask Claude to review
"Review my staged changes for bugs and improvements"

# 3. Apply suggestions
# 4. Commit with Claude-generated message
```

### 12.2 Test Generation
```bash
# 1. Select function/class
# 2. Ask Claude
"Generate comprehensive tests for this code including edge cases"

# 3. Review and run tests
npm test
```

### 12.3 Documentation
```bash
# Ask Claude
"Generate API documentation for this module in OpenAPI format"
"Create a README with examples for this library"
"Add JSDoc comments to all public methods"
```

## Step 13: Integration with Tom Miller Services

### Project Setup
```bash
# Clone repository
git clone https://github.com/yourusername/tommillerservices.git
cd tommillerservices

# Install dependencies
cd business-builder-backend && yarn install
cd ../business-builder-master-frontend && yarn install

# Create CLAUDE.md
echo "# Tom Miller Services Project Instructions" > CLAUDE.md
echo "Backend: Node.js, TypeScript, GraphQL, MongoDB" >> CLAUDE.md
echo "Frontend: React, TypeScript, Chakra UI, Apollo" >> CLAUDE.md
```

### Useful Prompts for Tom Miller Services
1. "Create a new GraphQL resolver for [module]"
2. "Add TypeGraphQL decorators to this model"
3. "Generate a Chakra UI component with dark theme"
4. "Create tenant-aware middleware for this endpoint"
5. "Add subscription tier checks to this module"

## Step 14: Productivity Shortcuts

### Mac-Specific Optimizations
```bash
# Create alias for quick access
echo 'alias claude="code . && code --command claude.open"' >> ~/.zshrc

# Quick project starter
echo 'function claude-project() {
  mkdir -p "$1"
  cd "$1"
  git init
  echo "# $1" > README.md
  echo "# Claude Instructions for $1" > CLAUDE.md
  code .
}' >> ~/.zshrc

source ~/.zshrc
```

### Raycast Integration (Optional)
1. Install Raycast from [raycast.com](https://raycast.com)
2. Install Claude extension
3. Set up quick commands

## Step 15: Updates & Maintenance

### Keep Claude Code Updated
```bash
# Check for updates
code --list-extensions --show-versions | grep claude

# Update extension
code --update-extension anthropic.claude-code

# Auto-update setting
{
  "extensions.autoUpdate": true,
  "extensions.autoCheckUpdates": true
}
```

### Monitor Usage
1. Check API usage at [console.anthropic.com](https://console.anthropic.com)
2. Set up billing alerts
3. Monitor token consumption
4. Optimize prompts for efficiency

## Resources & Support

### Official Resources
- [Claude Documentation](https://docs.anthropic.com)
- [VS Code Claude Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- [Anthropic Console](https://console.anthropic.com)

### Community
- [Claude Discord](https://discord.gg/anthropic)
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/claude-ai)

### Learning Resources
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Claude Best Practices](https://docs.anthropic.com/claude/docs/best-practices)
- [VS Code Tips](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)

## Troubleshooting Checklist

- [ ] API key is valid and has credits
- [ ] VS Code is up to date
- [ ] Extension is latest version
- [ ] Internet connection is stable
- [ ] Firewall allows API calls
- [ ] No proxy blocking connections
- [ ] Sufficient disk space
- [ ] Correct file permissions

## Quick Start Commands

```bash
# Complete setup in one script
curl -fsSL https://raw.githubusercontent.com/anthropics/claude-code/main/install.sh | bash

# Or manual quick setup
brew install --cask visual-studio-code
code --install-extension anthropic.claude-code
echo 'export ANTHROPIC_API_KEY="your-key-here"' >> ~/.zshrc
source ~/.zshrc
code .
```

---

**Created**: August 2025  
**Author**: Tom Miller Services Knowledge Base  
**Category**: Internal Company Training  
**Difficulty**: Beginner  
**Time Required**: 30 minutes  
**Cost**: API usage-based (~$20/month typical)