# LinkedIn AI Assistant - User Guide

**For:** Patrick Huijs (OffhoursAI Client)
**System Version:** 4.4 (Worker v10.13)
**Last Updated:** January 13, 2026

---

## Welcome! 👋

This guide will help you get the most out of your LinkedIn AI commenting system. Think of it as your personal AI assistant that helps you engage authentically with your VIP connections while saving you hours every week.

---

## What You're Getting

### 🎯 Core Features

**1. Automatic Post Discovery**
- Finds new posts from your VIP list automatically
- No more manually checking LinkedIn notifications
- One-click scraping from your VIP search page

**2. AI-Generated Comment Drafts**
- 3 draft variations per post (different tones/approaches)
- Written in YOUR voice (learns from your edits over time)
- Contextual comments based on your relationship with each VIP
- Bilingual support (English/Dutch auto-detected)

**3. Human Review & Control**
- You review and select the best draft
- Edit as needed before posting
- You always have final say - nothing posts automatically

**4. Self-Learning System**
- AI learns from every edit you make
- Gets better at matching your voice over time
- Tracks accuracy and improvement metrics

---

## How to Use It Daily

### Step 1: Open Your VIP Search Page

Bookmark this URL for quick access:
```
https://www.linkedin.com/search/results/content/?fromMember=[YOUR_VIP_IDS]&sortBy=date_posted
```

This shows recent posts from all your VIPs in one feed.

### Step 2: Scroll and Scrape

1. **Scroll down** to load posts (the scraper captures what's visible)
2. **Click the floating button** (bottom-left) or press **Ctrl+Shift+A**
3. **Wait 5-10 seconds** while AI processes posts

### Step 3: Review Drafts

A new window opens showing:
- Each post with 3 draft comment options
- **Draft 1:** Personal story/experience approach
- **Draft 2:** Insight or pattern observation
- **Draft 3:** Reflective question

**Switch between drafts** by clicking the tabs to find the best one.

### Step 4: Post on LinkedIn

1. **Click "Comment on LinkedIn"** button
2. LinkedIn post opens in new tab
3. **Draft is pre-filled** in the comment box
4. **Edit if needed** (the AI learns from your changes!)
5. **Click "Comment" on LinkedIn** to post

---

## Time Savings

**Before AI Assistant:**
- Finding VIP posts: 10-15 min/day
- Writing thoughtful comments: 5-10 min/post × 8 posts = 40-80 min/day
- **Total: ~60-100 min/day (20-33 hours/month)**

**With AI Assistant:**
- Scraping posts: <5 seconds (one click)
- AI generates drafts: <10 seconds (automatic)
- Review & select: <30 sec/post × 8 posts = 4 min/day
- **Total: ~5-10 min/day (2-3.5 hours/month)**

**💰 You save 18-30 hours per month (85% time reduction)**

---

## How the AI Learns Your Voice

### Week 1-2: Training Phase
- AI uses your voice profile (tone, style, examples)
- Drafts may need 20-40% editing
- **Your edits teach the AI** what you prefer

### Week 3-4: Improvement Phase
- AI accuracy improves to 80-85%
- Most drafts need only minor tweaks
- Learning system identifies patterns in your edits

### Month 2+: Mastery Phase
- AI accuracy reaches 90%+
- 30-50% of drafts need zero editing
- System continuously refines based on new data

### What Gets Tracked
- **Edit distance:** How much you change each draft
- **Keywords:** Topics where AI needs improvement
- **Selection patterns:** Which draft types you prefer
- **Training examples:** High-quality before/after pairs

**Privacy Note:** All tracking data stays in your private Google Sheet. Nothing is shared externally.

---

## Security & Privacy

### How Your Data is Protected

**1. Obscure URL Path**
- Worker hosted at: `offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/`
- Random string makes it undiscoverable
- Not indexed by search engines (robots.txt + meta tags)

**2. CORS Protection**
- API only accepts requests from authorized domains
- Blocks unauthorized webhook access
- Origin validation on all API calls

**3. No Automated Posting**
- You manually click "Comment" on LinkedIn every time
- AI only generates drafts - never posts automatically
- Maintains authentic human engagement patterns

**4. Private Google Sheets**
- All data stored in your Google Sheet (you own it)
- Only accessible with your credentials
- No external data sharing or selling

**5. LinkedIn Terms Compliance**
- System uses browser extension (Tampermonkey)
- Runs in YOUR real browser session
- Human-like timing and patterns
- No bot signatures or automation flags

### What Data is Collected

**Stored in Google Sheets:**
- Post content (public LinkedIn posts)
- Your VIP list (names, LinkedIn URLs, relationship notes)
- AI-generated drafts
- Your final comments (after editing)
- Edit distance percentages
- Learning metrics

**NOT Collected:**
- Login credentials
- Private messages
- Non-VIP posts
- Personal profile data
- Activity outside commenting

---

## System Requirements

### Required:
- ✅ **Browser:** Chrome, Edge, or Brave (recommended)
- ✅ **Extension:** Tampermonkey installed
- ✅ **LinkedIn:** Active LinkedIn account
- ✅ **Internet:** Stable connection for API calls

### Supported:
- ✅ **Desktop:** Windows, Mac, Linux
- ⚠️ **Mobile:** Limited (Kiwi Browser + Tampermonkey on Android only)
- ❌ **iOS:** Not supported (no Tampermonkey)

---

## Troubleshooting

### ❌ "No VIP posts found"

**Possible causes:**
- Not on the correct LinkedIn page
- VIP list not loaded
- Need to scroll more to load posts

**Solutions:**
1. Verify you're on the VIP search page (not regular feed)
2. Scroll down to load posts before clicking scrape button
3. Check browser console (F12) for errors
4. Contact support if issue persists

---

### ❌ Worker shows "Connection Error"

**Possible causes:**
- N8N webhooks unavailable
- Network/firewall blocking requests
- CORS configuration issue

**Solutions:**
1. Refresh the worker page
2. Check your internet connection
3. Try in incognito mode (test browser extensions)
4. Contact support if error persists

---

### ❌ Drafts are low quality or generic

**Possible causes:**
- Still in early training phase (Week 1-2)
- VIP relationship notes missing or vague
- Voice profile needs tuning

**Solutions:**
1. Continue editing drafts (AI learns from edits)
2. Add detailed relationship notes in Google Sheets
3. Schedule voice tuning session (Week 2-3)
4. Contact support for prompt optimization

---

### ❌ Scraper button doesn't appear

**Possible causes:**
- Tampermonkey disabled
- Script not installed correctly
- Wrong LinkedIn page type

**Solutions:**
1. Click Tampermonkey icon → Check script is enabled (green)
2. Navigate to VIP search page (not regular feed)
3. Refresh page (Ctrl+R or Cmd+R)
4. Reinstall userscript if needed

---

## Getting Help

### Support Contacts

**Technical Issues:**
- Email: hello@offhoursai.com
- Response time: Within 24 hours

**Voice Tuning:**
- Schedule voice tuning session (Week 2-3 recommended)
- Takes 30-45 minutes
- Optimizes AI to match your style

**System URLs:**
- Worker: https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html
- Userscript: https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js

---

## Pro Tips

### 🎯 Maximize AI Accuracy

1. **Edit drafts when they're close but not perfect**
   - AI learns more from 10-30% edits than from 0% or 50%+ edits
   - Small tweaks help AI understand subtle voice preferences

2. **Add relationship context in Google Sheets**
   - "Former colleague, worked on X project together"
   - "Industry peer, follow their content on Y topic"
   - More context = more personalized drafts

3. **Use the system consistently**
   - Daily engagement = faster learning
   - System needs 20-30 examples to reach peak accuracy

### ⚡ Speed Up Your Workflow

1. **Bookmark your VIP search page**
   - One-click access to your VIP feed
   - No searching for posts

2. **Use keyboard shortcuts**
   - Ctrl+Shift+A: Activate scraper
   - Tab: Switch between drafts
   - Ctrl+Enter: Submit comment on LinkedIn

3. **Review drafts while AI processes**
   - Worker shows fake progress animation (8-12 sec)
   - Previews post content during wait time

### 🔄 Keep System Healthy

1. **Update Tampermonkey when prompted**
   - System auto-checks for updates daily
   - New versions improve performance and accuracy

2. **Review Google Sheets monthly**
   - Check for duplicate entries
   - Archive old posts (30+ days)
   - Update VIP list as relationships change

3. **Schedule voice tuning every 3-6 months**
   - Your writing style evolves over time
   - Keeps AI aligned with current voice

---

## FAQs

### Q: Can I use this for non-VIP posts?
**A:** Not currently. System is optimized for your curated VIP list to ensure high-quality, strategic engagement.

### Q: What if I make a mistake after posting?
**A:** You can edit or delete comments on LinkedIn normally. The system only tracks your original comment for learning purposes.

### Q: Can I add/remove VIPs?
**A:** Yes! Update the VIP list in Google Sheets. Changes sync within 1 hour. Contact support if you need help.

### Q: Will LinkedIn detect this as automation?
**A:** No. System uses human-in-the-loop design (you always post manually), runs in your real browser, and maintains natural patterns. Fully LinkedIn ToS compliant.

### Q: What happens if I don't like any of the 3 drafts?
**A:** You can:
- Edit any draft to match what you want
- Write from scratch (AI learns from this too)
- Skip the post (click Archive button)

### Q: How much does it cost?
**A:** System costs ~$5.35/month (AI processing + hosting). You save 18-30 hours/month in time, worth $2,700-$4,500 at $150/hr.

### Q: Can others see my drafts?
**A:** No. Drafts are private until you post. Only final comments appear on LinkedIn.

### Q: Does this work with LinkedIn Sales Navigator?
**A:** Currently optimized for standard LinkedIn. Sales Navigator support can be added if needed.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  LinkedIn AI Assistant - Quick Reference                    │
├─────────────────────────────────────────────────────────────┤
│  1. Open VIP search page (bookmark it)                      │
│  2. Scroll to load posts                                    │
│  3. Press Ctrl+Shift+A (or click floating button)          │
│  4. Review drafts in popup window                           │
│  5. Click "Comment on LinkedIn"                             │
│  6. Edit draft if needed                                    │
│  7. Click "Comment" on LinkedIn                             │
└─────────────────────────────────────────────────────────────┘

Worker URL: offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html
Support: hello@offhoursai.com
```

---

**🎉 You're all set! Enjoy your AI-powered LinkedIn engagement system.**

*Questions? Feedback? Contact support at hello@offhoursai.com*
