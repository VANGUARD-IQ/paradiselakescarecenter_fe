export const claudeSetupContent = `# How to Install and Set Up Claude Code on Your Mac

## Overview
Claude Code is an AI-powered coding assistant that integrates directly with Visual Studio Code, helping you write, debug, and understand code faster. This guide will walk you through the complete installation and setup process on macOS.

## Prerequisites
- macOS 10.15 (Catalina) or later
- Visual Studio Code installed
- Anthropic API key (obtain from [Anthropic Console](https://console.anthropic.com))
- Active Claude subscription (~$20/month for Pro plan)

## Step 1: Install Visual Studio Code

### 1.1 Download VS Code
1. Visit [code.visualstudio.com](https://code.visualstudio.com)
2. Click **"Download for Mac"**
3. Wait for the download to complete

### 1.2 Install VS Code
1. Open the downloaded \`.zip\` file
2. Drag **Visual Studio Code.app** to your **Applications** folder
3. Launch VS Code from Applications or Spotlight

### 1.3 Add VS Code to PATH (Optional but Recommended)
1. Open VS Code
2. Press \`Cmd + Shift + P\` to open Command Palette
3. Type "shell command" and select **"Shell Command: Install 'code' command in PATH"**
4. Now you can open VS Code from Terminal with \`code .\`

## Step 2: Install Claude Code Extension

### 2.1 Open Extensions Marketplace
1. In VS Code, click the Extensions icon in the sidebar (or press \`Cmd + Shift + X\`)
2. Search for **"Claude Code"** or **"Claude Dev"**

### 2.2 Install the Extension
1. Find the official Claude extension by Anthropic
2. Click **"Install"**
3. Wait for installation to complete
4. Reload VS Code if prompted

## Step 3: Obtain Your Anthropic API Key

### 3.1 Create Anthropic Account
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your account
3. Complete account verification if required

### 3.2 Generate API Key
1. Navigate to **"API Keys"** section
2. Click **"Create Key"**
3. Give your key a descriptive name (e.g., "Claude Code Mac")
4. Copy the API key immediately (you won't be able to see it again)
5. Store it securely in a password manager

### 3.3 Add Billing Information
1. Go to **"Billing"** section
2. Add your payment method
3. Choose your plan (Claude Pro recommended for development)
4. Enable auto-recharge if desired

## Step 4: Configure Claude Code Extension

### 4.1 Open Extension Settings
1. In VS Code, press \`Cmd + ,\` to open Settings
2. Search for **"Claude"** in the search bar
3. Or click the gear icon on the Claude extension

### 4.2 Add Your API Key
Method 1: Through Settings UI
1. Find **"Claude: API Key"** setting
2. Enter your API key
3. Save settings

Method 2: Through settings.json
1. Press \`Cmd + Shift + P\`
2. Type "Preferences: Open Settings (JSON)"
3. Add:
\`\`\`json
{
  "claude.apiKey": "your-api-key-here",
  "claude.model": "claude-3-opus-20240229",
  "claude.maxTokens": 4096,
  "claude.temperature": 0.7
}
\`\`\`

### 4.3 Configure Model Preferences
Available models:
- \`claude-3-opus-20240229\` - Most capable, best for complex tasks
- \`claude-3-sonnet-20240229\` - Balanced performance and cost
- \`claude-3-haiku-20240307\` - Fastest, most economical

## Step 5: Using Claude Code

### 5.1 Open Claude Chat
- Click the Claude icon in the Activity Bar (left sidebar)
- Or press \`Cmd + Shift + C\` (if configured)
- The Claude panel will open on the side

### 5.2 Basic Commands
**Ask Questions:**
\`\`\`
"Explain this function"
"What does this error mean?"
"How can I optimize this code?"
\`\`\`

**Generate Code:**
\`\`\`
"Write a function to validate email addresses"
"Create a React component for a user profile card"
"Generate unit tests for this class"
\`\`\`

**Refactor Code:**
\`\`\`
"Refactor this to use async/await"
"Convert this to TypeScript"
"Make this code more efficient"
\`\`\`

### 5.3 Context Selection
- Highlight code to include it in your question
- Claude automatically considers the current file
- Use @workspace to include entire project context
- Use @file to reference specific files

### 5.4 Keyboard Shortcuts
Configure custom shortcuts:
1. Press \`Cmd + K\` then \`Cmd + S\`
2. Search for "Claude"
3. Add shortcuts for common actions:
   - Open Claude Chat
   - Send to Claude
   - Apply Suggestion

## Step 6: Advanced Configuration

### 6.1 Workspace Settings
Create \`.vscode/settings.json\` in your project:
\`\`\`json
{
  "claude.contextWindow": 100000,
  "claude.includeOpenTabs": true,
  "claude.autoSuggest": true,
  "claude.codeActions": {
    "enabled": true,
    "showInline": true
  }
}
\`\`\`

### 6.2 Custom Prompts
Create \`.claude/prompts.json\`:
\`\`\`json
{
  "prompts": {
    "review": "Review this code for bugs, performance issues, and best practices",
    "document": "Add comprehensive JSDoc comments to this code",
    "test": "Generate comprehensive unit tests using Jest",
    "security": "Analyze this code for security vulnerabilities"
  }
}
\`\`\`

### 6.3 Ignore Files
Create \`.claudeignore\` to exclude files:
\`\`\`
node_modules/
dist/
build/
*.log
.env*
coverage/
\`\`\`

## Step 7: Troubleshooting

### Common Issues and Solutions

#### API Key Not Working
\`\`\`bash
# Verify API key is correct
curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"claude-3-haiku-20240307","messages":[{"role":"user","content":"Hello"}],"max_tokens":10}'
\`\`\`

#### Extension Not Loading
1. Check VS Code version (must be 1.74.0 or later)
2. Disable conflicting extensions
3. Clear VS Code cache:
\`\`\`bash
rm -rf ~/Library/Application\\ Support/Code/Cache
rm -rf ~/Library/Application\\ Support/Code/CachedData
\`\`\`

#### Rate Limiting
- Check your API usage in Anthropic Console
- Upgrade your plan if needed
- Implement request throttling in settings

#### Connection Issues
1. Check internet connection
2. Verify firewall settings
3. Test with different network
4. Check proxy settings if applicable

## Step 8: Best Practices

### 8.1 Security
- **Never commit API keys** to version control
- Store keys in environment variables
- Use \`.env\` files with \`.gitignore\`
- Rotate API keys regularly

### 8.2 Cost Optimization
- Monitor usage in Anthropic Console
- Use appropriate models for tasks
- Set token limits in settings
- Enable caching for repeated queries

### 8.3 Productivity Tips
1. **Learn the shortcuts** - Save time with keyboard commands
2. **Use templates** - Create reusable prompt templates
3. **Batch similar tasks** - Group related questions
4. **Provide context** - Include relevant code and requirements
5. **Be specific** - Clear instructions yield better results

## Step 9: Integrations

### 9.1 Git Integration
Claude can help with:
- Writing commit messages
- Creating pull request descriptions
- Reviewing code changes
- Explaining git history

### 9.2 Terminal Integration
Use Claude from terminal:
\`\`\`bash
# Install Claude CLI
npm install -g @anthropic/claude-cli

# Configure
claude config set api-key YOUR_API_KEY

# Use
claude "explain this error: ..." 
\`\`\`

### 9.3 Other Tools
- **Prettier** - Format code automatically
- **ESLint** - Catch errors early
- **GitLens** - Enhance git capabilities
- **Thunder Client** - API testing

## Step 10: Updates and Maintenance

### 10.1 Update Extension
1. VS Code will notify you of updates
2. Or manually check in Extensions panel
3. Review changelog before updating

### 10.2 Stay Informed
- Follow [Anthropic's blog](https://www.anthropic.com/blog)
- Join Claude community forums
- Check documentation regularly
- Subscribe to update notifications

## Useful Resources

### Official Documentation
- [Claude Documentation](https://docs.anthropic.com)
- [API Reference](https://docs.anthropic.com/claude/reference)
- [Model Comparison](https://docs.anthropic.com/claude/docs/models-overview)

### Community Resources
- [VS Code Marketplace Reviews](https://marketplace.visualstudio.com)
- [GitHub Issues](https://github.com/anthropics/claude-vscode)
- [Discord Community](https://discord.gg/anthropic)
- [Reddit r/ClaudeAI](https://reddit.com/r/ClaudeAI)

### Learning Materials
- Video tutorials on YouTube
- Example projects on GitHub
- Blog posts and articles
- Online courses

## Quick Reference Card

### Essential Commands
| Action | Command |
|--------|---------|
| Open Claude | \`Cmd + Shift + C\` |
| Send to Claude | Select code + right-click |
| Apply suggestion | Click "Apply" button |
| Clear chat | Click trash icon |
| Stop generation | Click stop button |

### Model Selection Guide
| Task | Recommended Model |
|------|-------------------|
| Complex coding | Claude 3 Opus |
| General development | Claude 3 Sonnet |
| Quick questions | Claude 3 Haiku |
| Code review | Claude 3 Opus |
| Documentation | Claude 3 Sonnet |

### Token Limits
- Opus: 200k context window
- Sonnet: 200k context window  
- Haiku: 200k context window
- Response: Up to 4096 tokens

## Conclusion

You're now ready to supercharge your development workflow with Claude Code! Remember to:
- ✅ Keep your API key secure
- ✅ Monitor your usage
- ✅ Experiment with different models
- ✅ Customize settings for your workflow
- ✅ Stay updated with new features

Happy coding with Claude! 🚀`;