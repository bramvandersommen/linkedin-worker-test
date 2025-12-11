# Self-Healing Scraper Testing Guide

## Overview

This guide helps you test the scraper's robustness improvements in a real LinkedIn environment using browser DevTools to simulate DOM changes and trigger fallback strategies.

---

## Prerequisites

1. Open LinkedIn notifications page in Chrome/Firefox
2. Enable Tampermonkey and load the scraper
3. Open browser DevTools (F12) → Console tab
4. Keep this guide open in another window

---

## Test 1: Pattern-Based Post Detection

**What it tests:** Scraper can find posts even when CSS selectors fail.

### Steps:

1. **Baseline run:**
   ```javascript
   // In console, run the scraper normally
   window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
   ```
   - Look for: `[LinkedIn AI] Found X posts via selector`

2. **Break the CSS selectors:**
   ```javascript
   // Remove the class names from post cards
   document.querySelectorAll('[class*="feed-shared"]').forEach(el => {
     el.className = 'test-broken-class';
   });
   ```

3. **Re-run scraper:**
   ```javascript
   window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
   ```
   - **Expected:** Scraper still finds posts via text patterns
   - Look for: `[LinkedIn AI] Found X posts via pattern matching`

### Success Indicators:
- ✅ Same number of posts found in both runs
- ✅ Console shows fallback to pattern matching
- ✅ No "Found 0 posts" error

---

## Test 2: Multi-Strategy Profile Extraction

**What it tests:** 6 fallback strategies for extracting profile data.

### Strategy 1: Standard Link (Baseline)
```javascript
// This should work normally - just verify
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via standard-link`

### Strategy 2: Permissive Link Search
```javascript
// Break standard selector, keep href intact
document.querySelectorAll('a[href*="/in/"]').forEach(link => {
  link.removeAttribute('data-control-name'); // Breaks Strategy 1
});
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via permissive-link`

### Strategy 3: Tracking Attributes
```javascript
// Remove href but keep tracking IDs
document.querySelectorAll('a[data-tracking-control-name*="actor"]').forEach(link => {
  const trackingId = link.getAttribute('data-tracking-control-name');
  link.removeAttribute('href');
  link.setAttribute('data-test-tracking', trackingId);
});
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via tracking-id`

### Strategy 4: Parent DOM Walk
```javascript
// Move profile link outside the post card
const firstPost = document.querySelector('[class*="feed-shared"]');
const profileLink = firstPost.querySelector('a[href*="/in/"]');
if (profileLink) {
  const parent = profileLink.closest('.feed-shared-update-v2');
  parent.prepend(profileLink.cloneNode(true));
  profileLink.remove();
}
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via parent-walk`

### Strategy 5: Text-Based Name
```javascript
// Remove all profile links, keep text
document.querySelectorAll('a[href*="/in/"]').forEach(link => {
  const name = link.textContent.trim();
  link.outerHTML = `<strong>${name}</strong>`;
});
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via text-name`
- **Note:** Posts will have `partialData: true` (missing profileId/URL)

### Strategy 6: ARIA Labels
```javascript
// Remove all profile info except aria-label
document.querySelectorAll('[aria-label*="View"]').forEach(el => {
  const label = el.getAttribute('aria-label');
  el.removeAttribute('href');
  el.setAttribute('data-test-aria', label);
});
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```
- Look for: `Profile extracted via aria-label`

### Success Indicators:
- ✅ Each test logs the correct extraction source
- ✅ Partial data warnings appear when appropriate
- ✅ Scraper status shows: "X matches, Y partial"

---

## Test 3: Retry Logic with Exponential Backoff

**What it tests:** Scraper retries on failure with 2s, 4s, 8s delays.

### Simulate Temporary Failure:

```javascript
// Override the scraper to fail twice, succeed on third attempt
let attemptCount = 0;
const originalScrape = window.scrapeNotifications;

window.scrapeNotifications = async function() {
  attemptCount++;
  if (attemptCount < 3) {
    console.log(`[Test] Simulating failure (attempt ${attemptCount})`);
    throw new Error('Simulated scraping failure');
  }
  console.log('[Test] Success on attempt 3');
  return originalScrape.call(this);
};

// Trigger scraper
window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```

### Success Indicators:
- ✅ Console shows: "Retry attempt 1 in 2 seconds"
- ✅ Console shows: "Retry attempt 2 in 4 seconds"
- ✅ Scraper succeeds on third attempt
- ✅ User feedback updates with retry status

---

## Test 4: Graceful Degradation

**What it tests:** Scraper accepts partial data with warnings.

### Create Partial Data Scenario:

```javascript
// Remove profile IDs but keep names
document.querySelectorAll('a[href*="/in/"]').forEach(link => {
  const name = link.textContent.trim();
  link.href = '#'; // Invalid profile URL
  link.removeAttribute('data-tracking-control-name');
  link.textContent = name; // Keep name only
});

window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```

### Success Indicators:
- ✅ Scraper completes successfully (doesn't fail)
- ✅ Console logs: "Missing profileId, profileURL for post"
- ✅ Status message: "X matches, Y partial"
- ✅ Diagnostics show `partialDataCount: Y`
- ✅ Warning array populated in metadata

---

## Test 5: Container Finding Fallback

**What it tests:** `findNotificationContainer()` finds posts even when main container classes change.

### Break Container Selectors:

```javascript
// Rename all container classes
const container = document.querySelector('.scaffold-finite-scroll__content');
if (container) {
  container.className = 'totally-different-class-name';
}

window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```

### Success Indicators:
- ✅ Scraper finds container via pattern matching
- ✅ Console: "Found X 'posted:' occurrences - best match has Y"
- ✅ Posts still scraped successfully

---

## Test 6: End-to-End Resilience Test

**The nuclear option:** Break everything at once.

```javascript
// Simulate LinkedIn major redesign
document.querySelectorAll('[class*="feed"], [class*="notification"]').forEach(el => {
  el.className = 'new-design-v2-' + Math.random().toString(36).substring(7);
});

document.querySelectorAll('a[href*="/in/"]').forEach(link => {
  const name = link.textContent.trim();
  link.href = '#broken';
  link.outerHTML = `<div>${name}</div>`;
});

window.dispatchEvent(new CustomEvent('linkedin-scrape-trigger'));
```

### Success Indicators:
- ✅ Scraper completes (may take longer due to retries)
- ✅ Finds posts via text patterns
- ✅ Extracts names via text-based strategy
- ✅ Produces partial data with warnings
- ✅ Status: "X matches, Y partial, Z warnings"

---

## Interpreting Console Logs

### Normal Operation:
```
[LinkedIn AI] Found 8 posts via selector
[LinkedIn AI] Profile extracted via standard-link
[LinkedIn AI] ✅ Scraped 8 posts (0 partial) with 0 warnings in 245ms
```

### Fallback Activated:
```
[LinkedIn AI] Found 8 posts via pattern matching
[LinkedIn AI] Profile extracted via text-name
[LinkedIn AI] ⚠️ Missing profileId, profileURL for post: "John Doe"
[LinkedIn AI] ✅ Scraped 8 posts (3 partial) with 5 warnings in 1.2s
```

### Retry Triggered:
```
[LinkedIn AI] ❌ Scraping failed: Network error
[LinkedIn AI] 🔄 Retry attempt 1 in 2 seconds...
[LinkedIn AI] 🔄 Retry attempt 2 in 4 seconds...
[LinkedIn AI] ✅ Scraped 8 posts in 6.5s (after 3 attempts)
```

---

## Resetting Test Environment

After each test, refresh the page to restore normal LinkedIn DOM:

```javascript
location.reload();
```

Or revert specific changes:

```javascript
// Restore class names
location.reload(); // Easiest way

// Or manually restore if needed
document.querySelectorAll('[class*="test-broken"]').forEach(el => {
  // Restore original classes (if you saved them)
});
```

---

## Real-World Testing Checklist

- [ ] Run scraper on 10+ different notification pages
- [ ] Test with different post types (text, image, video, shared posts)
- [ ] Test with profiles that have special characters (Patrick-Huijs, María García)
- [ ] Test with profiles that have no profile URL (anonymous/deleted)
- [ ] Simulate slow network (DevTools → Network → Slow 3G)
- [ ] Test during LinkedIn A/B tests (when UI looks different)
- [ ] Monitor for several weeks to catch organic LinkedIn changes

---

## Success Metrics

**Before Self-Healing (v3.0):**
- ~40% resilience
- Single extraction strategy
- No retry logic
- Hard failures on missing data

**After Self-Healing (v3.1+):**
- ~90% resilience
- 6 extraction strategies
- 3 retry attempts with backoff
- Graceful degradation with warnings
- Pattern-based fallback detection

**Goal:** Scraper continues working even when:
- LinkedIn changes CSS class names
- Profile links are restructured
- Temporary network issues occur
- Partial data is available

---

## Troubleshooting

**"Found 0 posts" despite visible posts:**
- Check if notification container exists
- Manually inspect DOM for "posted:" text
- Verify pattern matching is enabled

**"Profile extracted via none":**
- All 6 strategies failed
- Check if profile data exists in DOM at all
- May be anonymous post or deleted user

**Retry loop continues indefinitely:**
- Check network tab for actual errors
- Verify LinkedIn isn't rate-limiting
- Ensure scraper isn't blocked by LinkedIn

---

## Next Steps

After confirming self-healing works:
1. Monitor production usage for 1-2 weeks
2. Track `partialDataCount` and `warnings` in Google Sheets
3. If partial data rate > 20%, investigate new LinkedIn changes
4. Update pattern matching rules as needed

---

**Last Updated:** 2024-12-10
**Scraper Version:** v3.1+
**Worker Version:** v10.5
