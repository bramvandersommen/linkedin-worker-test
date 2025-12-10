# LinkedIn AI Comment Automation - Project Context

## Overview
Single-user LinkedIn comment automation system for Patrick (OffhoursAI client).
Stack: Tampermonkey scraper → GitHub Pages worker → N8N workflows → Google Sheets

## Current Architecture

### Components
1. **Tampermonkey Scraper** (`linkedin_scraper.user.js`)
   - Runs on linkedin.com/notifications
   - Scrapes VIP posts from feed
   - Extracts: postID, nameOfVIP, profileURL, profileId, postContent
   - Sends to worker via BroadcastChannel

2. **GitHub Pages Worker** (`linkedin_worker.html`)
   - Hosted at: https://bramvandersommen.github.io/linkedin-worker-test/
   - Receives posts from scraper
   - Batches posts (10 per batch)
   - Sends to N8N for AI processing
   - Displays generated comment drafts

3. **N8N Workflows** (Railway hosted)
   - Webhook: `/webhook/linkedin-ai-comments`
   - Fetches VIP config from Google Sheets
   - Enriches posts with relationship notes
   - Calls OpenAI API (batched) for comment generation
   - Returns drafts to worker

4. **Google Sheets**
   - VIP Config: Names, LinkedIn IDs, relationship notes
   - Comment Tracking: Posted comments, engagement data

## Current Status

### ✅ Working
- VIP matching with profileId/profileURL extraction
- N8N VIP enrichment with relationship notes
- Batched AI comment generation (85-90% token savings)
- Comment tracking with BroadcastChannel sync
- CORS + Origin validation security
- **Self-healing scraper with pattern-based detection (NEW)**
- **Multi-strategy profile extraction with 6 fallback methods (NEW)**
- **Automatic retry with exponential backoff (NEW)**
- **Graceful degradation for partial data (NEW)**

### ⚠️ Current Issues
- 🔴 **N8N error response configuration** (IN PROGRESS - see `.claude/N8N_DEBUG.md`)
  - N8N generates correct error JSON but worker receives empty response
  - Need to configure "Respond to Webhook" node properly
- Worker needs network resilience (retry logic for N8N calls)
- End-to-end testing needed

### ✅ Recently Fixed (2024-12-10)
**Scraper (v3.1):**
- ~~Scraper relies on exact DOM structure~~ → Pattern-based detection added
- ~~No fallback strategies for profile extraction~~ → 6 strategies implemented
- ~~Limited error recovery~~ → Retry logic with backoff added

**Worker (v10.0-10.4):**
- ~~postID vs POST_ID case mismatch~~ → v10.0: Normalized field access
- ~~Preloaded drafts filtered out~~ → v10.1: Skip dedupe for preloaded
- ~~Race condition (scraper faster than fetch)~~ → v10.2: Queue messages until ready
- ~~Generic error messages~~ → v10.3-10.4: Enhanced error handling with actionable steps

## Security Implementation
- ✅ CORS headers in N8N webhooks
- ✅ Origin validation code nodes
- ⚪ Obscure worker URL (pending rename)
- ⚪ VIP config moved to Lovable (pending)

## Tech Stack
- Frontend: Vanilla JS (Tampermonkey + GitHub Pages)
- Backend: N8N on Railway
- AI: OpenAI GPT-4o-mini (batched API)
- Storage: Google Sheets (via N8N)
- VCS: GitHub (public repo)

## File Structure
```
linkedin-worker-test/
├── linkedin_worker.html          # Main worker app
├── linkedin_scraper.user.js      # Tampermonkey script
├── vip-config.js                 # VIP list (to be deprecated)
└── .claude/                      # Context for Claude Code
    ├── PROJECT_CONTEXT.md
    ├── ENHANCEMENT_PLAN.md
    └── RECENT_CHANGES.md
```
