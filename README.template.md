# LinkedIn AI Engagement System

**Autonomous LinkedIn comment automation with self-learning AI**

![OffhoursAI](logo.png)

Reduce LinkedIn commenting time from 5-10 minutes to under 30 seconds per post with AI-powered draft generation that learns from your edits and continuously improves.

**Status:** Production-ready | Self-Learning System Complete ✅ | Analytics In Planning 🎯
**Last Updated:** December 16, 2025

---

## 🎯 Overview

An intelligent LinkedIn engagement system that:
1. **Generates** 3 personalized comment drafts for VIP posts in your authentic voice
2. **Learns** from your edits to continuously improve accuracy
3. **Scales** LinkedIn engagement without sacrificing authenticity
4. **Tracks** all activity with comprehensive analytics (coming soon)

### Key Benefits

- **85% Time Savings:** 20-33 hours → 2-3.5 hours/month (240 posts)
- **Cost Efficient:** $0.35/month for AI processing (vs $2.16 without batching)
- **Self-Learning:** System improves autonomously from your edits
- **90%+ Reliable:** Self-healing scrapers survive LinkedIn UI changes
- **ROI:** 19,200% (time value vs. cost)

---

## 🏗️ System Architecture

### Three Core Systems

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM 1: DRAFT GENERATION (Production ✅)             │
│  • Dual-strategy scraper (VIP Feed + Notifications)    │
│  • Batched AI processing (3 drafts per post)           │
│  • Relationship-aware personalization                  │
│  • Bilingual support (EN/NL)                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  SYSTEM 2: SELF-LEARNING (Complete ✅)                  │
│  • Monitors your edits (Levenshtein distance)          │
│  • Extracts keywords for topic matching                │
│  • Builds training knowledge base                      │
│  • Future: Few-shot learning integration               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  SYSTEM 3: ANALYTICS & INSIGHTS (In Planning 🎯)        │
│  • Learning progress metrics                           │
│  • Engagement analytics                                │
│  • Weekly email digests                                │
│  • Voice match score gamification                      │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Draft Generation (System 1)

- **Smart VIP Scraping** - Dual-strategy scraper (VIP search + notifications fallback)
- **Self-Healing** - 6 extraction strategies survive LinkedIn DOM changes
- **AI Comment Drafts** - 3 personalized variations per post (GPT-4o-mini)
- **Relationship Context** - Automatically merges VIP relationship notes
- **Batched Processing** - 85% token savings with YAML format
- **Bilingual Support** - Auto-detects English or Dutch
- **Draft Selection** - Visual dashboard with tab switching
- **Comment Tracking** - All activity logged to Google Sheets

### Self-Learning (System 2)

- **Edit Distance Tracking** - Measures how much you edit each draft (Levenshtein algorithm)
- **Smart Threshold** - Only learns from meaningful edits (>20% change)
- **Keyword Extraction** - Automatically identifies topics for pattern matching
- **Training Knowledge Base** - Stores high-quality examples for future improvement
- **7-Day Rolling Window** - Efficient processing of recent comments
- **Deduplication** - Never processes the same post twice

### Analytics (System 3) - Coming Soon

- **Learning Metrics** - Track AI accuracy improvement over time
- **Engagement Stats** - Comments posted, time saved, VIP coverage
- **Email Digests** - Weekly/bi-weekly automated reports
- **Fun Metrics** - Voice match score, streaks, milestones
- **Predictive Insights** - "At this rate, AI will draft 90% by March"

---

## 🚀 Installation

### Step 1: Install Tampermonkey

**Chrome/Edge:**
1. Install [Tampermonkey extension](https://chrome.google.com/webstore/detail/tampermonkey)

**Firefox:**
1. Install [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)

### Step 2: Install Scraper Script

1. Open Tampermonkey dashboard (click extension icon → Dashboard)
2. Click **"+"** (Create new script)
3. Replace contents with `linkedin_scraper_v4_dual_strategy.user.js`
4. Click **File → Save** (or Ctrl+S)

### Step 3: Configure VIP List

The script automatically loads your VIP list from `vip-config.js` (hosted on GitHub Pages).

**To update VIPs:** Edit the Google Sheets VIP List tab (auto-syncs hourly)

### Step 4: Open Worker Dashboard

Navigate to: `https://{{GITHUB_USERNAME}}.github.io/{{REPO_NAME}}/linkedin_worker.html`

Bookmark this page for quick access.

---

## 📖 How to Use

### Quick Start

1. **Go to LinkedIn VIP search:**
   `https://www.linkedin.com/search/results/content/?fromMember=[YOUR_VIP_IDS]&sortBy=date_posted`

2. **Scroll to load posts** (scraper uses static extraction)

3. **Click the floating button** (bottom-right, ghost robot icon)
   Or press: **Ctrl+Shift+A**

4. **Worker window opens** with matched posts

5. **AI generates 3 drafts** per post (~10 seconds)

6. **Review and select** your preferred draft

7. **Click "Comment on LinkedIn"** - opens post with draft pre-filled

8. **Post comment** - automatically tracked in Google Sheets

### Alternative: Notifications Page

The scraper also works on `/notifications` (fallback strategy):

1. Go to `https://www.linkedin.com/notifications/`
2. Scroll to load notifications
3. Click floating button (Ctrl+Shift+A)
4. Only VIP posts are scraped

### Draft Selection Tips

- **Draft 1:** Leads with personal experience or client story
- **Draft 2:** Leads with contrarian insight or pattern observation
- **Draft 3:** Leads with reflective question or realization

Try all three to see which resonates best with the post!

---

## ⚙️ Configuration

### VIP List Management

VIPs are stored in **Google Sheets** (auto-syncs hourly):

**Sheet: "⭐ VIP List"**

| VIP Name | LinkedIn URL | LinkedIn ID | Active | Relationship Notes |
|----------|--------------|-------------|--------|--------------------|
| {{VIP_EXAMPLE_NAME}} | {{VIP_EXAMPLE_URL}} | {{VIP_EXAMPLE_ID}} | YES | {{VIP_EXAMPLE_RELATIONSHIP}} |

**Relationship Notes** are automatically merged into AI context for personalized comments.

### System Prompt Configuration

Edit the **"⚙️ LinkedIn AI Config"** sheet to customize:

- **PERSONA_BIO** - Your professional background
- **TONE_OF_VOICE_PROFILE** - Casual, professional, thoughtful, etc.
- **DO_LIST** - What to include in comments
- **DONT_LIST** - What to avoid

The AI uses these settings to match your authentic voice.

---

## 🧠 Self-Learning System

### How It Works

1. **You post a comment** using an AI draft
2. **Edit distance is calculated** (compares draft vs. final)
3. **If edits >20%** → AI learns from this example
4. **Keywords are extracted** for topic matching
5. **Training example stored** in Knowledge Base

### What Gets Learned

**Example:**
- **AI Draft:** "When brand work meets system thinking..."
- **Your Edit:** "When digital branding meets system thinking..."
- **Edit Distance:** 14.33%
- **Action:** ❌ Skipped (below 20% threshold - just a small refinement)

**Example 2:**
- **AI Draft:** "This is interesting..."
- **Your Edit:** "Love how this connects to the B2B SaaS space. I've seen this pattern with 3 clients recently where..."
- **Edit Distance:** 67%
- **Action:** ✅ **LEARNED** (major rewrite - AI was way off)

### Training Knowledge Base

Located in **"🧠 Self-Learning KB"** sheet:

- Stores bad drafts + good final comments
- Includes extracted keywords for matching
- Used for future few-shot learning (Phase 3)
- Target: 50-100 examples in first month

---

## 📊 Analytics (Coming Soon)

### Weekly Email Digest (Phase 1)

Example report:

```
📊 THIS WEEK'S STATS
━━━━━━━━━━━━━━━━━━━━━━━━━
• Comments posted: 12
• Time saved: ~1.2 hours
• AI accuracy: 82% (↑3% from last week)

🧠 LEARNING PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━
• Training examples: 47 → 52 (+5)
• Avg edit distance: 18% (↓4%)
• Voice match: 87% You 🎭

🎯 HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Nailed a Webflow comment (0 edits!)
📈 Most active VIP: [Name] (4 comments)
🔥 7-day engagement streak!
```

### Dashboard (Phase 3)

Interactive stats page with:
- Learning progress charts
- Topic expertise heatmap
- VIP coverage map
- Before/after comparisons

---

## 🛡️ Security & Privacy

### What's Protected

- ✅ **Origin validation** - N8N only accepts requests from authorized domains
- ✅ **No hardcoded secrets** - API keys stored securely in N8N
- ✅ **CORS headers** - Prevents unauthorized API usage
- ✅ **External config** - VIP list not exposed in script

### What's Public

- ⚠️ Worker URL (GitHub Pages) - obscured but discoverable
- ⚠️ Webhook endpoints - protected by origin validation only

**Acceptable Risk:** Single-user tool, worst case is unauthorized comment generation using your OpenAI credits (monitored).

### LinkedIn ToS Compliance

**Low-Risk Design:**
- Human reviews/edits/posts every comment (no automation)
- Natural commenting cadence (~10-20 posts/week)
- High-quality, relevant comments
- Single-user tool (not SaaS platform)
- Browser-based activity (real Chrome, not automation)

---

## 🐛 Troubleshooting

### No VIP Posts Found

**Causes:**
- VIP list not loaded (check `vip-config.js`)
- No VIP posts on current page (scroll to load more)
- VIP IDs don't match (check Google Sheets)

**Solutions:**
1. Check console for "[LinkedIn AI]" logs
2. Verify VIP profileIds match LinkedIn URLs
3. Try scrolling to load more posts before scraping

### Worker Shows Connection Error

**Causes:**
- N8N webhook unreachable
- Origin validation blocking request

**Solutions:**
1. Test webhook: `curl https://your-n8n-url/webhook/linkedin-ai-comments`
2. Check N8N execution logs for "FORBIDDEN" errors
3. Verify worker URL matches allowed origin

### Drafts Are Low Quality

**Causes:**
- System prompt needs tuning
- VIP relationship notes missing
- Language detection incorrect

**Solutions:**
1. Review system prompt in Google Sheets Config tab
2. Add relationship notes for VIPs
3. Check first sentence of post for language detection

### Scraper Crashes on LinkedIn

**Causes:**
- LinkedIn changed DOM structure
- Page didn't fully load

**Solutions:**
1. Refresh page and wait for full load
2. Try fallback scraper (notifications page)
3. Check console for specific error messages
4. Self-healing usually recovers automatically

---

## 📁 Project Structure

```
linkedin-worker-test/
├── README.md                                  # This file
├── linkedin_scraper_v4_dual_strategy.user.js # Tampermonkey script (v4.0)
├── linkedin_worker.html                       # Dashboard (v10.5)
├── n8n-self-learning-workflow.json           # Self-learning workflow
├── vip-config.js                              # VIP list (auto-generated)
└── .claude/
    ├── PROJECT_CONTEXT.md                     # Master technical docs
    ├── N8N_WORKFLOW_BUILD_GUIDE.md           # Workflow setup guide
    └── archive/                               # Historical docs
```

---

## 💰 Cost Breakdown

### Monthly Costs (240 posts)

| Component | Cost | Notes |
|-----------|------|-------|
| **Draft Generation** | $0.31 | GPT-4o-mini, batched (85% savings) |
| **Keyword Extraction** | $0.04 | ~10 training examples/week |
| **Railway (N8N)** | $5.00 | Fixed cost (handles 10K+ posts) |
| **GitHub Pages** | Free | Static hosting |
| **Google Sheets** | Free | API usage within free tier |
| **Total** | **$5.35/month** | |

### ROI Calculation

**Time Saved:**
- Before: 10 min/post × 10 posts/week = 433 min/month
- After: 30 sec/post × 10 posts/week = 22 min/month
- **Savings: 411 min/month (6.85 hours)**

**Monetary Value:**
- 6.85 hours × $150/hour = $1,027.50/month
- Cost: $5.35/month
- **ROI: 19,200%**

---

## 🗺️ Roadmap

### ✅ Completed (Dec 2025)

- ✅ Dual-strategy scraper (VIP search + notifications)
- ✅ Self-healing extraction (6 strategies)
- ✅ Batched AI processing (85% cost savings)
- ✅ Relationship-aware personalization
- ✅ Comment tracking with edit history
- ✅ Self-learning system (edit distance + keywords)
- ✅ Training knowledge base
- ✅ Deduplication (multi-layer)
- ✅ Bilingual support (EN/NL)

### 🔄 In Progress (Q1 2025)

- 🔄 Analytics email digest (weekly/bi-weekly)
- 🔄 Few-shot learning integration (use training KB)
- 🔄 Milestone notifications (perfect draft, streaks)

### 📋 Planned (Q2 2025)

- 📋 Interactive analytics dashboard
- 📋 Fine-tuned model (once 200+ training examples)
- 📋 VIP relationship scoring
- 📋 A/B testing system (prompt variations)
- 📋 Mobile PWA (iOS/Android)

### 🔮 Future Ideas

- Multi-user support (agencies)
- Twitter/X integration
- Engagement impact tracking (likes on your comments)
- Voice recording → AI transcription → comment

---

## 🤝 Contributing

### Development Setup

1. Clone repo: `git clone https://github.com/bramvandersommen/linkedin-worker-test.git`
2. Install Tampermonkey and load scraper script
3. Set up N8N workflows (import JSON)
4. Configure Google Sheets (see PROJECT_CONTEXT.md)
5. Update `vip-config.js` with test VIPs

### Testing Checklist

- [ ] Scraper finds VIP posts on real LinkedIn
- [ ] Dual-strategy fallback works
- [ ] Worker displays 3 drafts correctly
- [ ] Comment tracking updates Google Sheets
- [ ] Self-learning workflow processes edits
- [ ] Edit distance calculated accurately
- [ ] Keywords extracted correctly

### Commit Convention

```
<type>: <description>

Types: feat, fix, docs, style, refactor, test, chore

Examples:
feat: Add email digest workflow
fix: Handle empty VIP relationship notes
docs: Update README with self-learning details
```

---

## 📚 Documentation

### For Users
- **README.md** (this file) - Getting started guide
- **FEATURES_AND_VALUE.md** - Detailed feature documentation

### For Developers
- **.claude/PROJECT_CONTEXT.md** - Master technical documentation (1,894 lines)
- **.claude/N8N_WORKFLOW_BUILD_GUIDE.md** - N8N setup instructions
- **.claude/SELF_HEALING_TESTS.md** - Testing guide for scraper resilience

---

## 📞 Support

**Developer:** Bram van der Sommen (OffhoursAI)
**Client:** Patrick Huijs
**Repository:** https://github.com/bramvandersommen/linkedin-worker-test

For issues or questions, check the troubleshooting section above or review the technical documentation in `.claude/PROJECT_CONTEXT.md`.

---

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ⚡ by [OffhoursAI](https://offhoursai.com)**

*Autonomous AI agents that work while you sleep*
