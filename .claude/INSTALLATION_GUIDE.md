# LinkedIn AI Assistant - Installation Guide

**For:** Patrick Huijs - Client Machine Setup
**Date:** January 14, 2026
**System Version:** 4.4 (Worker v10.13)
**Estimated Time:** 20-30 minutes

---

## Pre-Installation Checklist

Before starting, confirm:

- [ ] Patrick has Chrome, Edge, or Brave browser installed
- [ ] Patrick has access to his LinkedIn account
- [ ] Patrick has edit access to Google Sheets (already configured)
- [ ] Production system is live on offhoursai.com ✅
- [ ] You have the installation URLs ready

---

## Installation Steps

### Step 1: Install Tampermonkey (5 minutes)

**1.1 Open Chrome Web Store**

Navigate to:
```
https://chrome.google.com/webstore/category/extensions
```

**1.2 Search for Tampermonkey**

- Type "Tampermonkey" in search box
- Click the extension by Jan Biniok
- **Verify:** 10M+ users, 4+ stars

**1.3 Install Extension**

- Click "Add to Chrome"
- Click "Add extension" in popup
- **Verify:** Tampermonkey icon appears in toolbar (top-right)

**1.4 Pin Tampermonkey (Optional but Recommended)**

- Click puzzle piece icon (Extensions)
- Find Tampermonkey
- Click pin icon to keep it visible

✅ **Checkpoint:** Tampermonkey icon visible in browser toolbar

---

### Step 2: Install LinkedIn AI Userscript (5 minutes)

**2.1 Open Userscript URL**

Navigate Patrick's browser to:
```
https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js
```

**What should happen:**
- Browser displays JavaScript code
- Tampermonkey overlay appears
- Installation dialog pops up

**2.2 Review Installation Dialog**

Check the dialog shows:
- ✅ Name: "OffhoursAI LinkedIn AI Commenter (Dual Strategy)"
- ✅ Version: 4.4
- ✅ Namespace: https://offhoursai.com/
- ✅ Matches: `*://*.linkedin.com/*`

**2.3 Install Script**

- Click **"Install"** button
- Wait for confirmation message

**2.4 Verify Installation**

- Click Tampermonkey icon in toolbar
- Should see: "OffhoursAI LinkedIn AI Commenter" with green checkmark
- **Enabled count: 1**

✅ **Checkpoint:** Script installed and enabled in Tampermonkey

---

### Step 3: Test on LinkedIn (5 minutes)

**3.1 Navigate to LinkedIn VIP Search**

**Have Patrick open this URL** (replace with his VIP IDs):
```
https://www.linkedin.com/search/results/content/?fromMember=["patrick-huijs"]&sortBy=date_posted
```

**Note:** You may need to help Patrick construct his VIP search URL with all his VIPs.

**3.2 Check for Floating Button**

**What should appear:**
- Floating button (bottom-left of page)
- Ghost icon with yellow/green gradient
- Button says "Scan for VIPs" or similar

**If button doesn't appear:**
- Press F12 (open DevTools)
- Go to Console tab
- Look for `[LinkedIn AI]` logs
- Should see: `Page type: VIP_SEARCH`

**3.3 Test Console Output**

Ask Patrick to:
1. Press F12 (opens DevTools)
2. Click "Console" tab
3. Look for green text: `[LinkedIn AI] v4.4 Initialized...`

✅ **Checkpoint:** Floating button visible, console shows script loaded

---

### Step 4: Test Scraping & Worker (10 minutes)

**4.1 Scroll to Load Posts**

- Have Patrick scroll down on VIP search page
- Load at least 5-10 posts
- Posts should be visible before scraping

**4.2 Click Scrape Button**

- Click floating button (bottom-left)
- OR press **Ctrl+Shift+A** (keyboard shortcut)

**What should happen:**
- Button shows "Scanning..." animation
- Progress messages appear
- After 5-10 seconds: Worker window opens

**4.3 Verify Worker Opens**

Worker window should:
- Open in new browser window/tab
- URL: `https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html`
- Show OffHours AI branding
- Display "Processing..." animation

**4.4 Wait for Draft Generation**

- Worker processes posts (8-12 seconds)
- Shows fake progress animation (normal)
- Displays post cards with 3 draft tabs each

**4.5 Review Draft Quality**

Check with Patrick:
- Do drafts sound like his voice?
- Are they contextual to the posts?
- Do they make sense?

**Note:** Early drafts may need editing - AI improves over time.

✅ **Checkpoint:** Worker opens, drafts generated, quality acceptable

---

### Step 5: Test Full Comment Flow (5 minutes)

**5.1 Select a Draft**

In worker window:
- Click through Draft 1, 2, 3 tabs
- Have Patrick pick his favorite

**5.2 Open Post on LinkedIn**

- Click **"Comment on LinkedIn"** button
- LinkedIn post opens in new tab
- Check: Draft is pre-filled in comment box (may take 2-3 seconds)

**5.3 Test Draft Injection**

**If draft appears in comment box:**
✅ Perfect! System working correctly.

**If draft doesn't appear:**
- Check console (F12) for errors
- Manually copy draft from worker and paste
- Note issue for troubleshooting

**5.4 Post Comment (Optional)**

Patrick can:
- Edit draft as needed
- Click "Comment" to post
- Or click "Cancel" (just testing)

✅ **Checkpoint:** Draft opens on LinkedIn, ready to post

---

### Step 6: Verify Google Sheets Access (5 minutes)

**6.1 Open Comment Tracker Sheet**

Navigate to Patrick's Google Sheet:
```
[INSERT GOOGLE SHEETS URL HERE]
```

**6.2 Verify Tabs Exist**

Check these tabs are present:
- [ ] 📝 Comment Tracker
- [ ] ⭐ VIP List
- [ ] ⚙️ LinkedIn AI Config
- [ ] 🧠 Self-Learning KB

**6.3 Test Write Access**

- Have Patrick click into a cell
- Try typing something
- **Confirm:** Patrick has Editor permissions

**6.4 Review VIP List**

Check VIP List tab contains:
- Patrick's VIP names
- LinkedIn URLs
- Profile IDs
- Relationship notes (if available)

✅ **Checkpoint:** Google Sheets accessible with edit permissions

---

## Post-Installation

### Bookmark Important URLs

Have Patrick bookmark these:

**1. VIP Search Page**
```
https://www.linkedin.com/search/results/content/?fromMember=[HIS_VIP_IDS]
```

**2. Worker Page (Backup)**
```
https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html
```

**3. Google Sheets**
```
[INSERT SHEETS URL]
```

### Create Desktop Shortcut (Optional)

For even faster access:
1. Open VIP search page
2. Click ⋮ (three dots) in Chrome
3. More tools → Create shortcut
4. Name: "LinkedIn VIP Comments"
5. Check "Open as window"
6. Click "Create"

---

## Troubleshooting During Installation

### ❌ Tampermonkey extension not found

**Solution:**
- Try direct link: https://www.tampermonkey.net/
- Click "Download" → Choose browser
- Follow installation prompts

---

### ❌ Userscript installation dialog doesn't appear

**Possible causes:**
- Tampermonkey not installed correctly
- Browser blocking popups
- Wrong URL

**Solutions:**
1. Verify Tampermonkey icon in toolbar
2. Check browser allows popups from offhoursai.com
3. Try opening in incognito mode (test clean state)
4. Manually add via Tampermonkey Dashboard:
   - Click Tampermonkey icon → Dashboard
   - Click "+" (New script)
   - Copy-paste entire userscript code
   - Save

---

### ❌ Floating button doesn't appear on LinkedIn

**Possible causes:**
- Wrong LinkedIn page (must be VIP search, not feed)
- Script not enabled in Tampermonkey
- Userscript error

**Solutions:**
1. Verify Patrick is on `/search/results/content/` page
2. Click Tampermonkey icon → Check script is enabled (green)
3. Refresh page (Ctrl+R or Cmd+R)
4. Check console (F12) for error messages
5. If errors found, send screenshot to support

---

### ❌ Worker shows "Connection Error"

**Possible causes:**
- Network/firewall blocking requests
- N8N webhooks down
- CORS issue

**Solutions:**
1. Check Patrick's internet connection
2. Try different network (mobile hotspot test)
3. Disable VPN if active
4. Contact support if persistent

---

### ❌ Drafts are very generic

**Possible causes:**
- Still in training phase (Week 1 expected)
- VIP relationship notes missing
- Voice profile needs tuning

**Solutions:**
1. Confirm this is first-time use (generic is normal initially)
2. Add relationship notes in Google Sheets VIP List
3. Schedule voice tuning session for Week 2-3
4. Have Patrick edit drafts (AI learns from edits)

---

## Training Patrick on Daily Use

### Quick Workflow Demo (5 minutes)

Show Patrick the daily routine:

1. **Open bookmark** (VIP search page)
2. **Scroll** to load posts
3. **Press Ctrl+Shift+A** (or click button)
4. **Review drafts** in worker window
5. **Click "Comment on LinkedIn"**
6. **Edit if needed, then post**

### Set Expectations

**Week 1-2:**
- Drafts will need editing (20-40%)
- This is normal and expected
- Edits teach the AI his voice

**Week 3-4:**
- Drafts improve to 80-85% accuracy
- Less editing needed
- System learns patterns

**Month 2+:**
- 30-50% of drafts need zero editing
- High-quality, authentic voice
- Continuous improvement

### Schedule Follow-Up

Book these sessions with Patrick:

**Week 1 Check-in (Jan 21):**
- 15 minutes
- Review any issues
- Check Google Sheets tracking
- Answer questions

**Week 2 Voice Tuning (Jan 28):**
- 30-45 minutes
- Analyze first 20-30 comments
- Optimize voice profile
- Adjust system prompts

**Week 4 Review (Feb 11):**
- 30 minutes
- Review metrics
- Celebrate improvements
- Plan next steps

---

## Success Criteria

By end of installation session, confirm:

- [ ] Tampermonkey installed and visible
- [ ] Userscript installed (v4.4) and enabled
- [ ] Floating button appears on VIP search page
- [ ] Scraper successfully finds posts
- [ ] Worker opens and displays drafts
- [ ] Draft pre-fills on LinkedIn comment box
- [ ] Patrick understands daily workflow
- [ ] Google Sheets accessible
- [ ] Bookmarks created
- [ ] Follow-up sessions scheduled

---

## Support & Resources

### During Installation

**If you encounter issues:**
- Screenshot the error
- Check console (F12) for messages
- Note exact steps that led to issue
- Contact: bram@offhoursai.com

### After Installation

**For Patrick:**
- [Client User Guide](./CLIENT_USER_GUIDE.md) - Daily usage guide
- [Google Sheets](INSERT_URL) - View tracking data
- Email support: bram@offhoursai.com

**For You:**
- [Technical Docs](./PROJECT_CONTEXT.md) - Full system documentation
- [Features & Value](./FEATURES_AND_VALUE.md) - Complete feature list
- [Deployment Script](../deploy-to-prod.sh) - Push updates to prod

---

## Installation Checklist (Printable)

```
┌─────────────────────────────────────────────────────────────┐
│  LinkedIn AI Assistant - Installation Checklist             │
├─────────────────────────────────────────────────────────────┤
│  □ Install Tampermonkey extension                           │
│  □ Install userscript from offhoursai.com                   │
│  □ Verify script enabled (green checkmark)                  │
│  □ Test on LinkedIn VIP search page                         │
│  □ Verify floating button appears                           │
│  □ Test scraping (Ctrl+Shift+A)                            │
│  □ Verify worker opens with drafts                          │
│  □ Test draft injection on LinkedIn                         │
│  □ Verify Google Sheets access                              │
│  □ Create bookmarks for quick access                        │
│  □ Demo daily workflow with Patrick                         │
│  □ Schedule Week 1 check-in (Jan 21)                       │
│  □ Schedule Week 2 voice tuning (Jan 28)                   │
│  □ Schedule Week 4 review (Feb 11)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference for Patrick

```
Daily Workflow:
1. Open VIP search bookmark
2. Scroll to load posts
3. Press Ctrl+Shift+A
4. Review drafts, click "Comment on LinkedIn"
5. Edit if needed, post

Keyboard Shortcuts:
• Ctrl+Shift+A - Activate scraper
• Tab - Switch between drafts
• F12 - Open console (troubleshooting)

Support:
• Email: bram@offhoursai.com
• Response: Within 24 hours
• User Guide: See CLIENT_USER_GUIDE.md
```

---

**Ready for tomorrow's installation? Print this guide or keep it open during the session with Patrick.**

*Questions? Contact bram@offhoursai.com*
