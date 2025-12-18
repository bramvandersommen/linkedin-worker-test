# Quick Start Guide: New Client Onboarding

**Purpose:** Complete step-by-step guide to deploy the LinkedIn AI Engagement System for a new client in under 2 hours.

**Time Required:** 90-120 minutes (first time), 45-60 minutes (subsequent clients)

---

## 📋 Pre-Onboarding Checklist

Before starting, collect this information from the client:

### Client Information
- [ ] Full name and LinkedIn profile URL
- [ ] Industry/expertise focus
- [ ] Professional background (1-2 paragraph bio)
- [ ] 3-5 example LinkedIn comments they've written
- [ ] Tone preference (casual, professional, thoughtful, etc.)

### VIP List
- [ ] 5-15 VIP connections they want to engage with
- [ ] LinkedIn URLs for each VIP
- [ ] Relationship context for each VIP (optional but recommended)

### Technical Access
- [ ] OpenAI API key (client-provided or use your own)
- [ ] Google account for Sheets access
- [ ] GitHub account (for hosting worker dashboard)

---

## 🚀 Phase 1: Infrastructure Setup (30-40 min)

### Step 1: GitHub Repository Setup (10 min)

1. **Create new repository:**
   ```bash
   # Option A: Fork existing template
   gh repo fork bramvandersommen/linkedin-worker-test --clone
   cd linkedin-worker-test

   # Option B: Create from scratch
   mkdir linkedin-ai-[clientname]
   cd linkedin-ai-[clientname]
   git init
   ```

2. **Copy template files:**
   ```bash
   # If creating from scratch, copy these files:
   - linkedin_scraper_v4_dual_strategy.user.js
   - linkedin_worker.html
   - n8n-self-learning-workflow.json
   - vip-config.js (template)
   - README.md
   - .claude/ (entire directory)
   ```

3. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save and note the URL: `https://[username].github.io/[repo-name]`

4. **Update CLIENT_CONFIG.md:**
   - Open `.claude/CLIENT_CONFIG.md`
   - Fill in all client variables (see template)
   - Save as both `CLIENT_CONFIG.md` and `CLIENT_CONFIG_[CLIENTNAME].md`

### Step 2: Google Sheets Setup (15 min)

1. **Create new Google Sheet:**
   - Name: "LinkedIn AI - [Client Name]"
   - Share with client (Editor access)

2. **Create required tabs:**

   **Tab 1: "📝 Comment Tracker"**
   ```
   Columns: POST_ID | VIP_NAME | POST_CONTENTS | POST_URL |
            LANGUAGE | RELATIONSHIP_NOTES | DRAFT_1 | DRAFT_2 |
            DRAFT_3 | SELECTED_DRAFT_NUM | FINAL_COMMENT |
            STATUS | SCRAPED_AT | COMMENTED_AT |
            EDIT_DISTANCE_PCT | Learned_From | Learned_At
   ```

   **Tab 2: "⭐ VIP List"**
   ```
   Columns: VIP Name | LinkedIn URL | LinkedIn ID | Active |
            Relationship Notes

   Example row:
   John Doe | https://linkedin.com/in/john-doe | john-doe | YES |
   Former colleague, expert in AI/ML
   ```

   **Tab 3: "⚙️ LinkedIn AI Config"**
   ```
   Row format (2 columns: SETTING | VALUE)

   PERSONA_BIO | [Client's professional background]
   TONE_OF_VOICE_PROFILE | [e.g., "Casual, curious, always ties to real client stories"]
   DO_LIST | • Ask questions\n• Reference client work\n• Keep it concise
   DONT_LIST | • Don't fabricate stories\n• Don't claim expertise you don't have
   LANGUAGE_PRIMARY | EN
   LANGUAGE_SECONDARY | NL
   ```

   **Tab 4: "🧠 Self-Learning KB"**
   ```
   Columns: POST_ID | VIP_NAME | POST_CONTENTS | POST_URL |
            LANGUAGE | SELECTED_DRAFT_NUM | BAD_DRAFT |
            GOOD_COMMENT | EDIT_DISTANCE_PCT | KEYWORDS |
            PROCESSED_DATE | COMMENTED_AT
   ```

3. **Get Sheet ID:**
   - URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy the `SHEET_ID` for N8N configuration

4. **Enable Google Sheets API:**
   - Go to Google Cloud Console
   - Create new project (or use existing)
   - Enable Google Sheets API
   - Create service account credentials
   - Download JSON key file (for N8N)

### Step 3: N8N Workflow Setup (15 min)

1. **Deploy N8N instance:**
   - **Option A:** Railway.app (recommended)
     - Deploy N8N template from Railway
     - Note the public URL
   - **Option B:** Self-hosted
     - Use Docker or npm install
     - Ensure HTTPS and public accessibility

2. **Import workflows:**
   - Open N8N dashboard
   - Settings → Import from file
   - Import `n8n-self-learning-workflow.json`
   - Import draft generation workflow (create from scratch or copy)

3. **Configure credentials:**
   - Add OpenAI credential (API key)
   - Add Google Sheets credential (service account JSON)
   - Test connections

4. **Update workflow URLs:**
   - Webhook URLs → Update in worker dashboard
   - Google Sheets ID → Replace in all nodes
   - Test each workflow manually

5. **Activate workflows:**
   - Enable draft generation webhook
   - Enable comment tracking webhook
   - Schedule self-learning workflow (daily/weekly)

---

## 🎨 Phase 2: Customization (30-40 min)

### Step 4: Update Documentation (20 min)

**Use the templating guide in CLIENT_CONFIG.md**

1. **README.md:**
   ```bash
   # Find/replace these patterns:
   "Patrick Huijs" → [Client Name]
   "Bram van der Sommen" → [Your Name]
   "bramvandersommen.github.io/linkedin-worker-test" → [Your Worker URL]
   "patrick-huijs" → [Client LinkedIn ID]
   ```

2. **FEATURES_AND_VALUE.md:**
   - Update example metrics (time savings, costs)
   - Replace example comments with client's style
   - Update industry-specific terminology

3. **CLIENT_VOICE_TUNING_PLAN.md:**
   - Personalize timeline
   - Update contact instructions
   - Adjust success metrics based on client goals

**Pro tip:** Use VS Code's find/replace with regex:
```regex
Find: Patrick Huijs
Replace: {{CLIENT_NAME}}
```
Then do a second pass to replace placeholders with actual values.

### Step 5: Configure Code Files (15 min)

1. **vip-config.js:**
   ```javascript
   // Update with client's VIP list
   window.VIP_LIST = [
     {
       name: "John Doe",
       profileId: "john-doe",
       profileURL: "https://www.linkedin.com/in/john-doe",
       relationshipNotes: "Former colleague, AI/ML expert"
     },
     // ... add all VIPs
   ];
   ```

2. **linkedin_scraper_v4_dual_strategy.user.js:**
   ```javascript
   // Update metadata:
   // @name         LinkedIn AI Commenter - [Client Name]
   // @version      4.0
   // @description  AI-powered LinkedIn comment drafts for [Client Name]
   // @match        https://www.linkedin.com/*

   // Update worker URL:
   const WORKER_URL = 'https://[username].github.io/[repo-name]/linkedin_worker.html';
   ```

3. **linkedin_worker.html:**
   ```html
   <!-- Update title and branding -->
   <title>LinkedIn AI Worker - [Client Name]</title>

   <!-- Update webhook URLs -->
   const DRAFT_GENERATION_WEBHOOK = 'https://[n8n-url]/webhook/draft-generation';
   const COMMENT_TRACKING_WEBHOOK = 'https://[n8n-url]/webhook/comment-tracking';
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial setup for [Client Name]"
   git push origin main
   ```

### Step 6: Voice & Tone Configuration (10 min)

1. **Analyze client's writing samples:**
   - Look for patterns: question frequency, story usage, length
   - Identify unique phrases or expressions
   - Note topics they reference (industries, tools, concepts)

2. **Update system prompt in Google Sheets:**
   - PERSONA_BIO: Clear, concise professional background
   - TONE_OF_VOICE_PROFILE: 2-3 specific characteristics
   - DO_LIST: 5-7 concrete rules ("Always ask questions", "Reference client work")
   - DONT_LIST: 5-7 concrete avoidances ("Never claim sales expertise")

3. **Test prompt:**
   - Manually trigger draft generation workflow in N8N
   - Review output quality
   - Iterate if needed

---

## 🧪 Phase 3: Testing & Validation (20-30 min)

### Step 7: End-to-End System Test (20 min)

1. **Test VIP scraping:**
   - [ ] Go to LinkedIn (logged in as client or test account)
   - [ ] Navigate to VIP search: `/search/results/content/?fromMember=[VIP_IDS]&sortBy=date_posted`
   - [ ] Click floating button (or Ctrl+Shift+A)
   - [ ] Verify: VIP posts detected, worker opens, posts displayed

2. **Test draft generation:**
   - [ ] Worker sends posts to N8N
   - [ ] N8N processes successfully (check execution logs)
   - [ ] 3 drafts returned per post
   - [ ] Drafts match client's tone
   - [ ] Relationship notes merged correctly

3. **Test comment tracking:**
   - [ ] Select a draft in worker
   - [ ] Click "Comment on LinkedIn"
   - [ ] Post comment on LinkedIn
   - [ ] Verify: Google Sheets updated with tracking data
   - [ ] Verify: POST_ID, VIP_NAME, DRAFT, FINAL_COMMENT all populated

4. **Test self-learning workflow:**
   - [ ] Manually trigger workflow in N8N
   - [ ] Verify: Finds commented posts from tracker
   - [ ] Verify: Calculates edit distance correctly
   - [ ] Verify: Skips posts below 20% threshold
   - [ ] Verify: Extracts keywords for qualifying posts
   - [ ] Verify: Appends to Self-Learning KB

### Step 8: Client Training (10 min)

**Provide client with:**

1. **Quick reference card:**
   ```
   ┌─────────────────────────────────────────┐
   │  LinkedIn AI - Quick Reference           │
   ├─────────────────────────────────────────┤
   │  1. Go to VIP search (bookmark this)     │
   │  2. Scroll to load posts                 │
   │  3. Press Ctrl+Shift+A                   │
   │  4. Review drafts in popup               │
   │  5. Click "Comment on LinkedIn"          │
   │  6. Edit as needed, then post            │
   └─────────────────────────────────────────┘

   Worker URL: [Your GitHub Pages URL]
   Support: [Your Contact Info]
   ```

2. **Troubleshooting checklist:**
   - No VIP posts found → Check VIP list, scroll more
   - Worker shows error → Check browser console
   - Drafts low quality → Review system prompt config
   - Tracking not working → Verify webhook URLs

3. **Video walkthrough (optional but recommended):**
   - Record 3-5 min Loom showing full workflow
   - Share with client for reference

---

## ✅ Post-Launch Checklist

After client starts using the system:

### Week 1: Monitoring
- [ ] Check Google Sheets daily for tracking data
- [ ] Review draft quality (ask client for feedback)
- [ ] Monitor N8N execution logs for errors
- [ ] Verify self-learning workflow runs successfully

### Week 2: Voice Tuning
- [ ] Analyze first 10-20 comments
- [ ] Calculate average edit distance
- [ ] Identify patterns in edits
- [ ] Update system prompt if needed
- [ ] Run voice tuning process (see CLIENT_VOICE_TUNING_PLAN.md)

### Week 4: Success Check
- [ ] Edit distance <20% on average?
- [ ] Client satisfied with draft quality?
- [ ] 30%+ drafts require zero editing?
- [ ] System running reliably without errors?

---

## 🔧 Troubleshooting Common Issues

### Issue: Scraper doesn't find VIP posts

**Causes:**
- VIP IDs don't match LinkedIn URLs
- Client not on correct LinkedIn page
- VIP list not loaded from config

**Solutions:**
1. Verify VIP profileIds match LinkedIn URLs exactly
2. Ensure client is on `/search/results/content/?fromMember=[IDs]`
3. Check browser console for VIP config load errors
4. Test with known VIP post URL

### Issue: Worker shows CORS errors

**Causes:**
- N8N webhook doesn't allow worker origin
- Worker URL changed but N8N not updated

**Solutions:**
1. Update N8N webhook CORS headers: `Access-Control-Allow-Origin: https://[worker-url]`
2. Verify worker URL matches in N8N configuration
3. Test webhook with curl: `curl -X POST [webhook-url] -d '{"test": true}'`

### Issue: Drafts are generic/low quality

**Causes:**
- System prompt too vague
- Missing relationship notes
- Client writing samples not analyzed

**Solutions:**
1. Review PERSONA_BIO - make it specific and detailed
2. Add relationship notes for all VIPs in Google Sheets
3. Update DO_LIST with concrete rules
4. Run voice tuning process earlier

### Issue: Self-learning workflow fails

**Causes:**
- Google Sheets credentials expired
- Sheet ID incorrect
- Edit distance calculation error

**Solutions:**
1. Test Google Sheets credential in N8N
2. Verify Sheet ID in workflow matches actual sheet
3. Check execution logs for specific error
4. Manually test edit distance calculation with sample data

---

## 📊 Success Metrics

Track these KPIs to measure system effectiveness:

### Week 1 Baseline
- Comments posted: __
- Average edit distance: ___%
- Time per comment: ___ min
- Draft quality rating (1-5): ___

### Week 4 Target
- Edit distance: <20%
- Time per comment: <2 min
- Client satisfaction: 4+/5
- System reliability: 95%+

### Month 3 Goals
- Edit distance: <10%
- Perfect drafts (0 edits): 30%+
- Training examples collected: 50-100
- Time savings vs. manual: 85%+

---

## 🎓 Additional Resources

### For Clients
- README.md - Getting started guide
- CLIENT_VOICE_TUNING_PLAN.md - Voice tuning process
- Troubleshooting section in README

### For Developers
- PROJECT_CONTEXT.md - Complete technical documentation
- N8N_WORKFLOW_BUILD_GUIDE.md - Workflow setup details
- SELF_HEALING_TESTS.md - Testing scraper resilience

### For Both
- FEATURES_AND_VALUE.md - Complete feature documentation
- SUCCESS_METRICS_SIMPLE.md - Metrics tracking guide

---

## 🚀 Scaling to Multiple Clients

### Recommended Setup for Agencies

**Single Codebase, Multiple Configs:**
```
linkedin-ai-template/
├── core/                      # Shared code (don't modify)
│   ├── scraper.template.js
│   ├── worker.template.html
│   └── workflows/
├── clients/
│   ├── client-a/
│   │   ├── config.json
│   │   ├── vip-list.js
│   │   └── deployed/          # Built files
│   └── client-b/
│       ├── config.json
│       └── ...
└── scripts/
    └── deploy-client.js       # Automated deployment
```

**Deployment Script:**
```javascript
// deploy-client.js
const clientConfig = require(`./clients/${clientName}/config.json`);

// 1. Replace all {{VARIABLES}} in templates
// 2. Generate client-specific files
// 3. Deploy to GitHub Pages
// 4. Update N8N workflows
// 5. Verify endpoints
```

**Benefits:**
- One template → many clients
- Centralized updates (push to all clients)
- Version control per client
- Easy A/B testing of features

---

## 📝 Checklist: Ready to Launch?

Before handing off to client:

- [ ] GitHub Pages deployed and accessible
- [ ] Google Sheets created with all 4 tabs
- [ ] N8N workflows imported and activated
- [ ] VIP list populated with 5-15 VIPs
- [ ] vip-config.js updated with client VIPs
- [ ] Worker URL updated in scraper script
- [ ] Webhook URLs updated in worker dashboard
- [ ] System prompt configured in Google Sheets
- [ ] End-to-end test completed successfully
- [ ] Client trained on basic usage
- [ ] Troubleshooting guide shared
- [ ] Monitoring plan in place
- [ ] Voice tuning scheduled for Week 2

---

**Estimated Total Time:**
- First client: 90-120 minutes
- Subsequent clients: 45-60 minutes (with templates)

**Last Updated:** December 18, 2025
**Template Version:** 1.0
