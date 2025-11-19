# LinkedIn AI Assistant

Automate LinkedIn engagement with AI-powered comment drafts for your VIP connections.

![OffhoursAI](logo.png)

## Features

- **Smart VIP Scraping** - Scrape notifications for posts from your VIP contacts (by name or profile URL)
- **AI Comment Drafts** - Generate 3 personalized comment variations per post via N8N + OpenAI
- **Draft Cycling** - Cycle through drafts before posting with one-click switching
- **Comment Tracking** - Track all comments in Google Sheets with edit history
- **Branded UI** - Glassmorphism design with volt yellow (#D7FF56) accents and particle effects

## How It Works

1. **Inject scraper** into LinkedIn notifications page
2. **Click FAB button** (ghost robot) to scan for VIP posts
3. **Worker window opens** displaying matched posts
4. **AI generates 3 drafts** per post via N8N webhook
5. **Click to comment** - opens post with draft pre-filled
6. **Cycle drafts** with 🔄 button until satisfied
7. **Submit** - comment is tracked automatically

## Installation

### Option 1: Browser Console (Development)

1. Open LinkedIn notifications: `https://www.linkedin.com/notifications/`
2. Open DevTools (F12 or Cmd+Option+I)
3. Paste the contents of `linkedin-scraper.js` into the Console
4. Press Enter

### Option 2: Bookmarklet (Recommended)

Create a new bookmark with this URL:

```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://bramvandersommen.github.io/linkedin-worker-test/linkedin-scraper.js';document.body.appendChild(s);})()
```

Then click the bookmark when on LinkedIn.

### Option 3: Browser Extension (Coming Soon)

Tampermonkey/Greasemonkey script for automatic injection.

## Configuration

Edit the `CONFIG` object in `linkedin-scraper.js`:

```javascript
const CONFIG = {
  // Worker page URL
  WORKER_URL: 'https://bramvandersommen.github.io/linkedin-worker-test/linkedin_worker.html',

  // N8N webhook for tracking comments
  N8N_TRACKER_WEBHOOK: 'https://your-n8n-instance.com/webhook/comment-tracker',

  // Your VIP contacts (names or profile URLs)
  VIP_LIST: [
    'Patrick Huijs',
    'Joshua van den Hemel',
    'https://www.linkedin.com/in/some-profile/'
  ]
};
```

### VIP List Format

Mix names and URLs freely:

```javascript
VIP_LIST: [
  'John Smith',                                    // Name (case-insensitive)
  'Jane Doe',                                      // Name
  'https://www.linkedin.com/in/jane-doe-123/'      // Profile URL
]
```

**Matching logic:**
- Names: Case-insensitive, trimmed
- URLs: Normalized (protocol, www, trailing slashes removed)

## Usage

### On Notifications Page

1. Navigate to `linkedin.com/notifications`
2. Click the **FAB button** (bottom-right, ghost robot icon)
3. Watch as:
   - Page scrolls and expands notifications
   - VIP posts are highlighted in volt yellow
   - Worker window opens with matched posts
4. In the worker, click **"Comment on LinkedIn"** for any post

### On Post Page

When opening a post with draft parameters:

1. Comment box auto-fills with Draft 1
2. Click **🔄 cycle button** (bottom-right) to switch drafts
3. Edit if needed
4. Submit - tracking webhook fires automatically

### URL Parameters

Posts open with these parameters:
```
?draft1=encoded_text&draft2=encoded_text&draft3=encoded_text
```

## Architecture

```
┌─────────────────┐     postMessage      ┌─────────────────┐
│  LinkedIn Page  │ ──────────────────▶  │  Worker Page    │
│  (Scraper JS)   │                      │  (HTML/JS)      │
└─────────────────┘                      └────────┬────────┘
                                                  │
                                                  │ webhook
                                                  ▼
                                         ┌─────────────────┐
                                         │  N8N Workflow   │
                                         │  (AI + Track)   │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Google Sheet   │
                                         │  (Tracker)      │
                                         └─────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `linkedin-scraper.js` | Browser injection | Scrape, inject comments, track |
| `linkedin_worker.html` | GitHub Pages | Display posts, call N8N, generate links |
| N8N Workflow | Self-hosted/cloud | AI generation, sheet integration |
| Google Sheet | Google Drive | Source of truth for all activity |

### PostMessage Contract

**Scraper → Worker:**
```javascript
{
  type: 'VIP_QUEUE',
  posts: [{
    postID: '7394335779629461504',
    nameOfVIP: 'Patrick Huijs',
    urlToPost: 'https://www.linkedin.com/feed/update/...',
    postContent: 'Just shipped our new feature...'
  }],
  timestamp: 1700000000000
}
```

**Worker → Scraper:**
```javascript
{ type: 'WORKER_READY' }
```

## Google Sheet Tracker

### Columns

| Column | Description |
|--------|-------------|
| Post ID | Unique LinkedIn activity ID |
| VIP Name | Contact name |
| VIP Profile URL | LinkedIn profile |
| Post URL | Direct link to post |
| Post Content | Preview text |
| Scraped At | Timestamp |
| Draft 1, 2, 3 | AI-generated options |
| Selected Draft | Which draft was used (1/2/3) |
| Final Comment | Actual submitted text |
| Manual Edits | Boolean - was draft modified? |
| Comment Posted At | Submission timestamp |
| Status | scraped \| drafted \| commented |

### Benefits

- **Deduplication** - Don't re-scrape already commented posts
- **Two-stage workflow** - Scrape now, comment later
- **Analytics** - Track engagement patterns
- **Self-learning** - AI learns from manual edits

## Design System

### Brand Colors

```css
--primary-dark: hsl(0 0% 10%);          /* Near-black */
--secondary-volt: hsl(68 98% 66%);      /* #D7FF56 */
--accent-green: hsl(68 90% 50%);        /* #97b500 */
--glass-bg: rgba(0, 0, 0, 0.6);         /* Glassmorphism */
```

### Typography

- **Headers:** Outfit, 600 weight
- **Body:** Outfit, 400-500 weight
- **Code/Meta:** JetBrains Mono, 300 weight

### Visual Effects

- Glassmorphism backgrounds with blur
- 3D transforms with perspective
- Volt yellow particle bursts (⚡︎)
- Glow effects on highlights

## Development

### Local Testing

1. Clone the repo
2. Edit `linkedin-scraper.js` with your CONFIG
3. Paste into LinkedIn console
4. Check DevTools console for `[LinkedIn AI]` logs

### File Structure

```
linkedin-worker-test/
├── README.md
├── logo.png
├── linkedin_worker.html
├── linkedin-scraper.js (to be added)
└── n8n/
    └── workflow-export.json (future)
```

### Commit Convention

```
<type>: <description>

Types: feat, fix, docs, style, refactor, test, chore

Examples:
feat: Add particle burst animation
fix: Resolve worker timing race condition
docs: Update installation instructions
```

## Roadmap

### In Progress
- [ ] N8N workflow for AI draft generation
- [ ] Google Sheet integration
- [ ] Dedupe logic (check sheet before scraping)

### Planned
- [ ] 30-day lookback window
- [ ] Browser extension packaging
- [ ] Dynamic VIP list (fetch from sheet)
- [ ] Tone of Voice training from past comments
- [ ] Analytics dashboard

## Troubleshooting

### Popup Blocked
Allow popups for linkedin.com in browser settings.

### Worker Not Receiving Data
Check console for `WORKER_READY` message. The scraper waits up to 10s for this.

### Comments Not Auto-filling
Ensure URL has `draft1`, `draft2`, `draft3` parameters. Check console for injection logs.

### VIP Not Matching
- Check spelling (names are case-insensitive)
- For URLs, ensure exact profile URL match
- Check console for `[LinkedIn AI] Checking VIP:` logs

## License

MIT

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with ⚡ by [OffhoursAI](https://offhoursai.com)
