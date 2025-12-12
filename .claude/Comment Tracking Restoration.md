# LinkedIn AI Comment Tracking - Feature Restoration Guide

## 🎯 Problem Statement

**Feature that broke:** When user posts a comment on LinkedIn, the system should:
1. Detect the comment was posted
2. Send tracking data to worker page
3. Worker forwards to N8N webhook
4. N8N updates Google Sheets (STATUS = "Commented")
5. Worker UI removes the card from display
6. Show success notification

**Current status:** Feature stopped working or was removed

---

## 🏗️ Architecture Overview

```
LinkedIn Post Page                Worker Page                  N8N Webhook
    (Scraper)                   (GitHub Pages)                (Railway)
        │                            │                            │
        │ 1. User posts comment      │                            │
        │                            │                            │
        │ 2. window.opener.postMessage                           │
        ├───────────────────────────>│                            │
        │    { type: 'COMMENT_POSTED' }                          │
        │                            │                            │
        │                            │ 3. POST /webhook/comment-posted
        │                            ├──────────────────────────>│
        │                            │                            │
        │                            │ 4. Update Sheets          │
        │                            │    STATUS = "Commented"   │
        │                            │<───────────────────────────│
        │                            │                            │
        │                            │ 5. Remove card from UI    │
        │                            │    Show success toast     │
        │                            │                            │
```

---

## 📋 Implementation Checklist

### Part 1: Worker Page Message Listener
**File:** `linkedin_worker.html`

**Location:** In `<script>` section, after initial setup

**Add this code:**

```javascript
// =============================================================================
// COMMENT TRACKING - Listen for comments posted on LinkedIn
// =============================================================================

window.addEventListener('message', async (event) => {
  // Security: Only accept messages from LinkedIn
  const allowedOrigins = ['https://www.linkedin.com', 'https://linkedin.com'];
  const isAllowed = allowedOrigins.some(origin => 
    event.origin === origin || event.origin.startsWith(origin)
  );
  
  if (!isAllowed) {
    console.warn('[Worker] Rejected message from:', event.origin);
    return;
  }
  
  // Handle comment posted event
  if (event.data.type === 'COMMENT_POSTED') {
    console.log('[Worker] 📥 Comment posted!', event.data.data);
    
    const commentData = event.data.data;
    
    try {
      // Send to N8N webhook
      const response = await fetch(N8N_WEBHOOK_COMMENT_POSTED, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add AUTH header if implemented
          // 'Authorization': `Bearer ${N8N_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          postId: commentData.postID,
          selectedDraft: commentData.selectedDraft,
          originalDraft: commentData.originalDraft,
          finalComment: commentData.finalComment,
          commentedAt: commentData.timestamp
        })
      });
      
      if (response.ok) {
        console.log('[Worker] ✅ Comment tracked successfully');
        
        // Remove card from UI
        removeCommentedCard(commentData.postID);
        
        // Show success notification
        showSuccessNotification('Comment tracked! Card removed from queue.');
        
        // Update stats
        updateConnectionStatus(true, 'Comment tracked ✅');
        
      } else {
        console.error('[Worker] ❌ Failed to track comment:', response.status);
        updateConnectionStatus(false, `Failed to track comment (${response.status})`);
      }
      
    } catch (error) {
      console.error('[Worker] ❌ Error tracking comment:', error);
      updateConnectionStatus(false, 'Network error tracking comment');
    }
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Remove card from UI after comment is posted
 * @param {string} postID - The post ID to remove
 */
function removeCommentedCard(postID) {
  const card = document.querySelector(`[data-post-id="${postID}"]`);
  
  if (!card) {
    console.warn('[Worker] Card not found for postID:', postID);
    return;
  }
  
  // Add fade-out animation
  card.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
  card.style.opacity = '0';
  card.style.transform = 'translateX(20px)';
  
  // Remove from DOM after animation
  setTimeout(() => {
    card.remove();
    console.log('[Worker] 🗑️ Removed card:', postID);
    
    // Check if results container is now empty
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer && resultsContainer.children.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #666;">
          <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
          <h2 style="color: #333; margin-bottom: 10px;">All caught up!</h2>
          <p>No pending comments. Great work!</p>
        </div>
      `;
    }
  }, 300);
}

/**
 * Show success notification toast
 * @param {string} message - Message to display
 */
function showSuccessNotification(message) {
  // Remove existing notification if any
  const existing = document.getElementById('successToast');
  if (existing) existing.remove();
  
  // Create toast
  const toast = document.createElement('div');
  toast.id = 'successToast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    ">
      ✅ ${message}
    </div>
  `;
  
  // Add animation styles
  if (!document.getElementById('toastStyles')) {
    const styles = document.createElement('style');
    styles.id = 'toastStyles';
    styles.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(toast);
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

console.log('[Worker] 👂 Listening for comment tracking messages...');
```

**Constants to add at top of script:**

```javascript
const N8N_WEBHOOK_COMMENT_POSTED = 'https://webhook-processor-production-84a9.up.railway.app/webhook/comment-posted';
```

---

### Part 2: LinkedIn Page Comment Detection (Scraper)
**File:** `linkedin_scraper.user.js`

**Add this function to detect when comment is posted:**

```javascript
/**
 * Track when user posts a comment
 * Sends data to worker page via postMessage
 */
function setupCommentTracking() {
  console.log('[LinkedIn AI] Setting up comment tracking...');
  
  // Configuration
  const WORKER_ORIGIN = 'https://bramvandersommen.github.io';
  
  // Check if we have draft data in URL hash
  const hash = window.location.hash.slice(1);
  if (!hash) {
    console.log('[LinkedIn AI] No hash params - not from worker');
    return;
  }
  
  const params = new URLSearchParams(hash);
  const selectedParam = params.get('selected');
  
  if (!selectedParam) {
    console.log('[LinkedIn AI] No draft selected');
    return;
  }
  
  const selectedDraft = parseInt(selectedParam);
  
  // Extract post ID from URL
  const postIDMatch = window.location.href.match(/urn(?:%3A|:)li(?:%3A|:)activity(?:%3A|:)(\d+)/i);
  if (!postIDMatch) {
    console.warn('[LinkedIn AI] Could not extract post ID from URL');
    return;
  }
  
  const postID = postIDMatch[1];
  
  // Get original draft from URL params
  let originalDraft = '';
  try {
    const draftKey = `draft${selectedDraft}`;
    const draftParam = params.get(draftKey);
    if (draftParam) {
      originalDraft = JSON.parse(decodeURIComponent(draftParam));
    }
  } catch (e) {
    console.warn('[LinkedIn AI] Could not parse original draft:', e);
  }
  
  console.log('[LinkedIn AI] ✅ Tracking setup complete for post:', postID);
  
  // Monitor for comment submission
  observeCommentSubmission(postID, selectedDraft, originalDraft, WORKER_ORIGIN);
}

/**
 * Observe when user clicks "Post" button to submit comment
 */
function observeCommentSubmission(postID, selectedDraft, originalDraft, workerOrigin) {
  // Find the comment form
  const commentForm = document.querySelector('form.comments-comment-box__form');
  
  if (!commentForm) {
    console.warn('[LinkedIn AI] Comment form not found');
    return;
  }
  
  // Find submit button
  const submitButton = commentForm.querySelector('button[type="submit"]') ||
                      commentForm.querySelector('button.comments-comment-box__submit-button');
  
  if (!submitButton) {
    console.warn('[LinkedIn AI] Submit button not found');
    return;
  }
  
  console.log('[LinkedIn AI] 👀 Watching for comment submission...');
  
  // Listen for submit button click
  submitButton.addEventListener('click', () => {
    console.log('[LinkedIn AI] Comment submit detected!');
    
    // Get final comment text
    const commentBox = document.querySelector('.ql-editor[contenteditable="true"]') ||
                      document.querySelector('div[role="textbox"][contenteditable="true"]');
    
    if (!commentBox) {
      console.warn('[LinkedIn AI] Comment box not found');
      return;
    }
    
    const finalComment = commentBox.textContent || commentBox.innerText || '';
    
    if (!finalComment.trim()) {
      console.warn('[LinkedIn AI] Comment is empty');
      return;
    }
    
    // Check if user made edits
    const manualEdits = originalDraft ? 
      (normalizeText(finalComment) !== normalizeText(originalDraft)) : 
      false;
    
    console.log('[LinkedIn AI] 📊 Comment data:', {
      postID,
      selectedDraft,
      length: finalComment.length,
      manualEdits
    });
    
    // Send to worker page
    sendCommentDataToWorker(
      postID,
      selectedDraft,
      originalDraft,
      finalComment,
      manualEdits,
      workerOrigin
    );
  });
}

/**
 * Send comment data to worker page
 */
function sendCommentDataToWorker(postID, selectedDraft, originalDraft, finalComment, manualEdits, workerOrigin) {
  const message = {
    type: 'COMMENT_POSTED',
    data: {
      postID: postID,
      selectedDraft: selectedDraft,
      originalDraft: originalDraft,
      finalComment: finalComment,
      manualEdits: manualEdits,
      timestamp: new Date().toISOString()
    }
  };
  
  console.log('[LinkedIn AI] 📤 Sending to worker:', message);
  
  // Try to send to opener window (if opened from worker)
  if (window.opener && !window.opener.closed) {
    try {
      window.opener.postMessage(message, workerOrigin);
      console.log('[LinkedIn AI] ✅ Sent to worker via window.opener');
    } catch (error) {
      console.error('[LinkedIn AI] ❌ Error sending to opener:', error);
    }
  } else {
    console.warn('[LinkedIn AI] ⚠️ No opener window (page not opened from worker)');
  }
}

/**
 * Normalize text for comparison (remove extra whitespace)
 */
function normalizeText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

// Initialize comment tracking when page loads
if (window.location.href.includes('linkedin.com') && 
    window.location.href.includes('highlightedUpdateUrn')) {
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCommentTracking);
  } else {
    setupCommentTracking();
  }
}
```

---

### Part 3: N8N Webhook Configuration
**Webhook:** `/webhook/comment-posted`

**Method:** POST

**Request Body Structure:**
```json
{
  "postId": "7396147763010236419",
  "selectedDraft": 2,
  "originalDraft": "Original AI-generated text...",
  "finalComment": "Final comment with user edits...",
  "commentedAt": "2024-12-10T14:32:00.000Z"
}
```

**N8N Workflow Nodes:**

1. **Webhook Trigger** (`/webhook/comment-posted`)
   - Method: POST
   - Response: Respond to Webhook (at end)

2. **Code Node: Calculate Edit Distance**
```javascript
const body = $json.body;

// Normalize text (remove extra whitespace)
function normalizeText(text) {
  return text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ');
}

const original = normalizeText(body.originalDraft || '');
const final = normalizeText(body.finalComment || '');

// Calculate character difference
const editDistance = Math.abs(final.length - original.length);

return {
  json: {
    postId: body.postId,
    selectedDraft: body.selectedDraft,
    editDistance: editDistance,
    commentedAt: body.commentedAt
  }
};
```

3. **Google Sheets: Update Row**
   - Operation: Update
   - Document: Your tracking sheet
   - Sheet: "💬 Post and Comment Tracker"
   - Columns to update:
     - `STATUS` = "Commented"
     - `SELECTED DRAFT #` = `{{ $json.selectedDraft }}`
     - `POSTED COMMENT` = `{{ $json.body.finalComment }}`
     - `COMMENTED AT` = `{{ $json.commentedAt }}`
     - `EDIT DISTANCE` = `{{ $('Calculate Edit Distance').item.json.editDistance }}`
   - Matching Column: `POST ID`
   - Match Value: `{{ $json.body.postId }}`

4. **Respond to Webhook**
   - Success response

---

## 🧪 Testing Instructions

### Test 1: Message Listener (Worker Page)

**In Worker Console:**
```javascript
// Simulate receiving comment posted message
window.postMessage({
  type: 'COMMENT_POSTED',
  data: {
    postID: 'test-123',
    selectedDraft: 2,
    originalDraft: 'Original text',
    finalComment: 'Final text with edits',
    timestamp: new Date().toISOString()
  }
}, window.location.origin);
```

**Expected:**
- Console shows: "📥 Comment posted!"
- (Will fail N8N call if webhook not set up)

### Test 2: End-to-End Flow

1. **Open worker page** in Tab 1
2. **Click "Comment on LinkedIn"** for a post
3. LinkedIn opens in Tab 2 (with hash params)
4. **Make edits** to draft in comment box
5. **Click "Post" button**
6. **Check Worker console** - should show:
   - "📥 Comment posted!"
   - "✅ Comment tracked successfully"
   - "🗑️ Removed card: [postID]"
7. **Check Worker UI** - card should fade out and disappear
8. **Check Google Sheets** - row should have:
   - STATUS = "Commented"
   - SELECTED DRAFT # = 2
   - POSTED COMMENT = (your edited text)
   - COMMENTED AT = (timestamp)
   - EDIT DISTANCE = (number)

---

## 🐛 Troubleshooting

### Issue: "No opener window"

**Cause:** Post page wasn't opened from worker via `window.open()`

**Fix:** Ensure worker's "Comment on LinkedIn" buttons use:
```javascript
// In worker, when creating card
<a href="${post.ENRICHED_URL}" 
   class="cta-button" 
   target="_blank"    <!-- Opens in new tab, preserves opener -->
   rel="opener">      <!-- Explicitly preserve opener -->
```

### Issue: "Message not received in worker"

**Cause:** Security - wrong origin or CORS blocking

**Fix:** 
1. Check `allowedOrigins` array includes LinkedIn domains
2. Verify worker origin matches `WORKER_ORIGIN` in scraper
3. Check browser console for CORS errors

### Issue: "Card doesn't remove from UI"

**Cause:** `data-post-id` attribute not set on card

**Fix:** In `createResultCard()` function, ensure:
```javascript
card.dataset.postId = post.POST_ID;  // This is critical!
```

### Issue: "N8N webhook fails"

**Cause:** Webhook URL incorrect or N8N workflow not active

**Fix:**
1. Check `N8N_WEBHOOK_COMMENT_POSTED` constant
2. Test webhook directly: `curl -X POST [webhook-url] -d '{"postId":"test"}'`
3. Check N8N workflow is activated

---

## 📝 Code Locations Summary

**Files to modify:**

1. **linkedin_worker.html**
   - Add: Message listener (Part 1)
   - Add: `removeCommentedCard()` function
   - Add: `showSuccessNotification()` function
   - Add: `N8N_WEBHOOK_COMMENT_POSTED` constant

2. **linkedin_scraper.user.js**
   - Add: `setupCommentTracking()` function
   - Add: `observeCommentSubmission()` function
   - Add: `sendCommentDataToWorker()` function
   - Add: `normalizeText()` helper
   - Add: Initialization call at bottom

3. **N8N Workflow** (create new or modify existing)
   - Endpoint: `/webhook/comment-posted`
   - Nodes: Webhook → Calculate Edit Distance → Update Sheets → Respond

---

## ✅ Success Criteria

- [ ] Worker listens for COMMENT_POSTED messages
- [ ] Scraper detects comment submission
- [ ] PostMessage sends data from LinkedIn → Worker
- [ ] Worker receives message (console log confirms)
- [ ] Worker sends POST to N8N successfully
- [ ] N8N updates Google Sheets STATUS column
- [ ] Worker removes card from UI with fade animation
- [ ] Success toast notification appears
- [ ] Empty state shows when all cards cleared

---

**This feature was working in late November 2024. All code patterns are from proven implementation. Focus on restoring these exact patterns.**
