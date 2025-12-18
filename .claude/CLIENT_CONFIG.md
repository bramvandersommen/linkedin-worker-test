# Client Configuration Template

**Purpose:** This file defines all client-specific variables used throughout the system. Update these values when onboarding new clients to automatically customize all documentation and code.

---

## 🔧 Configuration Variables

### Client Information

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `{{CLIENT_NAME}}` | Patrick Huijs | Full client name |
| `{{CLIENT_FIRST_NAME}}` | Patrick | Client's first name |
| `{{CLIENT_LAST_NAME}}` | Huijs | Client's last name |
| `{{CLIENT_COMPANY}}` | [Not specified] | Client's company name (if applicable) |
| `{{CLIENT_INDUSTRY}}` | Webflow/CMS consulting | Client's primary industry |
| `{{CLIENT_LINKEDIN_URL}}` | https://linkedin.com/in/patrick-huijs | Client's LinkedIn profile |
| `{{CLIENT_LINKEDIN_ID}}` | patrick-huijs | Client's LinkedIn profile ID |

### Developer/Agency Information

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `{{DEVELOPER_NAME}}` | Bram van der Sommen | Full developer/agency name |
| `{{DEVELOPER_FIRST_NAME}}` | Bram | Developer's first name |
| `{{DEVELOPER_LAST_NAME}}` | van der Sommen | Developer's last name |
| `{{COMPANY_NAME}}` | OffhoursAI | Agency/company name |
| `{{COMPANY_WEBSITE}}` | https://offhoursai.com | Company website |
| `{{COMPANY_TAGLINE}}` | Autonomous AI agents that work while you sleep | Company tagline |

### Technical Configuration

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `{{GITHUB_USERNAME}}` | bramvandersommen | GitHub username for hosting |
| `{{REPO_NAME}}` | linkedin-worker-test | GitHub repository name |
| `{{WORKER_URL}}` | bramvandersommen.github.io/linkedin-worker-test | Full GitHub Pages URL |
| `{{N8N_INSTANCE}}` | [Your N8N URL] | N8N instance URL |
| `{{GOOGLE_SHEETS_ID}}` | [Your Sheet ID] | Google Sheets tracking ID |

### Example VIP Data (for documentation)

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `{{VIP_EXAMPLE_NAME}}` | Patrick Huijs | Example VIP name used in docs |
| `{{VIP_EXAMPLE_URL}}` | https://linkedin.com/in/patrick-huijs | Example VIP LinkedIn URL |
| `{{VIP_EXAMPLE_ID}}` | patrick-huijs | Example VIP profile ID |
| `{{VIP_EXAMPLE_RELATIONSHIP}}` | Close colleague, AI projects | Example relationship notes |

### System Metrics (for examples in documentation)

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `{{MONTHLY_POST_TARGET}}` | 240 | Target posts per month |
| `{{WEEKLY_POST_TARGET}}` | 10 | Target posts per week |
| `{{MONTHLY_COST}}` | $5.35 | Total monthly system cost |
| `{{HOURLY_RATE}}` | $150 | Hourly rate for ROI calculations |
| `{{TIME_SAVINGS_HOURS}}` | 18-30 | Hours saved per month |

---

## 📝 How to Use This Template

### For New Client Onboarding

1. **Copy this file** to create a client-specific version (e.g., `CLIENT_CONFIG_PATRICK.md`)
2. **Update all values** in the table above with new client details
3. **Run the templating script** (when available) or manually find/replace in all docs
4. **Update code files:**
   - `vip-config.js` - Update VIP list and URLs
   - `linkedin_scraper_v4_dual_strategy.user.js` - Update @match patterns if needed
   - `linkedin_worker.html` - Update title and branding
5. **Test the system** with new client's LinkedIn account

### Files That Use These Variables

**Core Documentation:**
- `README.md` - All client/developer references
- `.claude/FEATURES_AND_VALUE.md` - Examples and case studies
- `.claude/PROJECT_CONTEXT.md` - Technical documentation

**Planning/Methodology:**
- `.claude/CLIENT_VOICE_TUNING_PLAN.md` - Voice tuning process
- `.claude/INTERNAL_VOICE_TUNING_METHODOLOGY.md` - Detailed methodology
- `.claude/FEEDBACK_CATEGORIES.md` - Feedback examples
- `.claude/SUCCESS_METRICS_SIMPLE.md` - Metrics tracking

**Code Files:**
- `vip-config.js` - VIP list and relationship notes
- `linkedin_scraper_v4_dual_strategy.user.js` - Scraper script metadata
- `linkedin_worker.html` - Worker dashboard branding

**Workflows:**
- `n8n-self-learning-workflow.json` - N8N workflow configuration

---

## 🔄 Find/Replace Guide

### Quick Find/Replace Commands

Use these patterns to update documentation quickly:

```bash
# Client name references
"Patrick Huijs" → "{{CLIENT_NAME}}"
"Patrick" → "{{CLIENT_FIRST_NAME}}" (context-dependent)

# Developer references
"Bram van der Sommen" → "{{DEVELOPER_NAME}}"
"Bram" → "{{DEVELOPER_FIRST_NAME}}"

# Technical URLs
"bramvandersommen.github.io/linkedin-worker-test" → "{{WORKER_URL}}"
"bramvandersommen" → "{{GITHUB_USERNAME}}"
"linkedin-worker-test" → "{{REPO_NAME}}"

# Example VIP data
"patrick-huijs" → "{{VIP_EXAMPLE_ID}}"
"linkedin.com/in/patrick-huijs" → "{{VIP_EXAMPLE_URL}}"
```

### Context-Aware Replacements

Some words need context checking:

| Text | Replace With | Check Context |
|------|--------------|---------------|
| "Patrick" | `{{CLIENT_FIRST_NAME}}` | Only if referring to the client |
| "VIP" | Keep as-is | Generic term for target accounts |
| "Bram" | `{{DEVELOPER_FIRST_NAME}}` | Only in support/contact sections |

---

## 🎯 Templating Strategy

### Approach 1: Manual Find/Replace (Current)

**Best for:** Initial conversion, small number of files

**Process:**
1. Open each file in editor
2. Use find/replace with patterns above
3. Manually verify context-sensitive replacements
4. Test documentation for readability

### Approach 2: Automated Script (Future)

**Best for:** Scaling to multiple clients, frequent updates

**Concept:**
```javascript
// template-engine.js
const config = require('./CLIENT_CONFIG.json');
const templates = getTemplateFiles();

templates.forEach(file => {
  let content = readFile(file);
  Object.keys(config).forEach(key => {
    content = content.replaceAll(`{{${key}}}`, config[key]);
  });
  writeFile(file.replace('.template', ''), content);
});
```

**Benefits:**
- One config file update → entire system updated
- Version control for client configs
- Easy client switching (dev/staging/prod)

---

## ✅ Validation Checklist

After updating configuration:

- [ ] All `{{VARIABLE}}` placeholders replaced with actual values
- [ ] No hardcoded client names in user-facing docs
- [ ] GitHub Pages URL updated (if changed)
- [ ] VIP list updated in Google Sheets
- [ ] N8N webhook URLs updated
- [ ] Worker dashboard tested with new branding
- [ ] Scraper tested on client's LinkedIn account
- [ ] Documentation examples make sense for new client context

---

## 📋 Client-Specific Customization Notes

### Voice & Tone

Beyond variable replacement, customize these aspects per client:

1. **System Prompt** (Google Sheets: "⚙️ LinkedIn AI Config")
   - PERSONA_BIO - Client's professional background
   - TONE_OF_VOICE_PROFILE - Client's communication style
   - DO_LIST - Client-specific preferences
   - DONT_LIST - Client-specific avoidances

2. **Example Comments** (in documentation)
   - Replace example drafts with client's actual style
   - Update industry-specific terminology
   - Adjust formality level

3. **VIP Relationship Notes**
   - Customize relationship context per client's network
   - Update industry focus keywords
   - Adjust relationship depth descriptions

---

## 🚀 Quick Start: New Client Setup

**Time Required:** 30-45 minutes

1. **Collect Client Information** (10 min)
   - [ ] Full name, LinkedIn URL, industry
   - [ ] List of 5-10 VIP connections
   - [ ] Voice/tone examples (3-5 past comments)

2. **Update Configuration** (5 min)
   - [ ] Fill out table above with client details
   - [ ] Save as `CLIENT_CONFIG_[CLIENTNAME].md`

3. **Customize Documentation** (15 min)
   - [ ] Find/replace in README.md
   - [ ] Update FEATURES_AND_VALUE.md examples
   - [ ] Customize voice tuning plan

4. **Update Code** (10 min)
   - [ ] Generate vip-config.js with client VIPs
   - [ ] Update worker dashboard branding
   - [ ] Configure Google Sheets

5. **Test System** (10 min)
   - [ ] Scraper finds client's VIP posts
   - [ ] Worker displays correctly
   - [ ] AI generates relevant drafts
   - [ ] Tracking logs to Google Sheets

---

**Last Updated:** December 18, 2025
**Template Version:** 1.0
