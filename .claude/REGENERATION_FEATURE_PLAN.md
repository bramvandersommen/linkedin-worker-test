# Regeneration Feature - Implementation Plan

**Created:** 2026-01-24
**Status:** Planning → Implementation
**Complexity:** Medium-Low (⭐⭐ out of 5)

---

## 🎯 **Feature Requirements**

**A) View Post Button**
- Simple link using clean `POST_URL` (no query params with drafts)
- Opens LinkedIn post in new tab
- 30 min implementation

**B) Request New Drafts with Feedback**
- Unlimited regenerations (track for quality monitoring)
- UI: Complete overwrite of drafts (no history clutter)
- Optional 2-line textarea feedback via modal
- Track all regenerations for analytics

---

## 📋 **Key Decisions**

### **Architecture: Extend Main Workflow** ✅
- New webhook in SAME workflow: `/webhook/regenerate-drafts`
- Reuse existing nodes: Config, VIPs, KB, Few-Shot, Parse, Respond
- Duplicate only: OpenAI node (with feedback-aware prompt)
- **Why:** Low maintenance, shared logic, easy to see full picture

### **Regeneration Tracking: Simplified** ✅
- **NEW Sheet:** `🗑️ Rejected Drafts Archive`
- Before regeneration: Append old drafts to archive sheet
- No increment counters in tracker
- Archive provides full history + analytics

**Archive Sheet Structure:**
```
POST_ID | VIP_NAME | POST_CONTENTS | POST_URL | REJECTED_DRAFT_1 |
REJECTED_DRAFT_2 | REJECTED_DRAFT_3 | USER_FEEDBACK |
REJECTED_AT | REGENERATION_NUMBER
```

### **Benefits:**
- ✅ Cleaner tracker (no increment logic)
- ✅ Full history preserved (can analyze patterns)
- ✅ Simpler N8N logic (append vs update)
- ✅ Easy analytics (all rejections in one place)

---

## 🗂️ **Google Sheets Changes**

### **New Sheet:** `🗑️ Rejected Drafts Archive`
All drafts before regeneration appended here

### **Tracker:** No changes needed
Drafts get overwritten, no tracking columns needed

---

## 🔧 **N8N Workflow**

### **New Webhook**
- Path: `/webhook/regenerate-drafts`
- Method: POST
- Origins: `offhoursai.com`, `bramvandersommen.github.io`

### **Flow (8 nodes, 6 reused)**
```
[Regenerate Webhook]
  ↓
[Validate Origin] ← REUSE
  ↓
[Parse Regen Request] ← NEW (extract postId, feedback, originalPost)
  ↓
[Archive Old Drafts] ← NEW (append to 🗑️ sheet)
  ↓
[Get Cached Config] ← REUSE
  ↓
[Get Cached VIPs] ← REUSE
  ↓
[Enrich for Regen] ← NEW (merge feedback into post)
  ↓
[Read KB] ← REUSE
  ↓
[Load Few-Shot] ← REUSE
  ↓
[OpenAI Regen] ← NEW (duplicate with feedback prompt)
  ↓
[Parse Drafts] ← REUSE
  ↓
[Update Tracker] ← NEW (overwrite drafts)
  ↓
[Respond] ← REUSE
```

---

## 🖥️ **Worker UI Changes**

### **View Post Button** (Feature A)
```html
<a href="${post.POST_URL}" target="_blank">View on LinkedIn →</a>
```

### **Regenerate Modal** (Feature B)
- Button: "🔄 Request New Drafts"
- Modal: 2-line textarea (optional feedback)
- Overwrite drafts on success
- Flash animation to show update

---

## 📊 **Analytics & Tracking**

### **Archive Sheet Queries**
- Total regenerations: `=COUNTA(POST_ID)`
- By VIP: `=COUNTIF(VIP_NAME, "Marina Brühl")`
- Common feedback themes: Manual review of `USER_FEEDBACK`
- Avg regens per post: `=COUNTA(POST_ID) / [unique post count]`

### **Quality Indicators**
- Posts with 3+ regenerations = AI quality issues
- Common feedback = prompt tuning opportunities

---

## 💰 **Cost Impact**

- Current: ~$0.36/month (240 posts)
- With 20% regen rate: ~$0.43/month (+19%)
- Realistic: ~$0.42/month (+17%)

**Negligible increase**

---

## ⏱️ **Implementation Timeline**

| Task | Duration | Status |
|------|----------|--------|
| **Phase 1: View Post Button** | 30 min | ⏳ Next |
| Create test payload for N8N | 15 min | ⏳ Next |
| **Phase 2: N8N Backend** | | |
| - Create archive sheet | 15 min | ⏳ Pending |
| - New webhook | 30 min | ⏳ Pending |
| - Archive node | 30 min | ⏳ Pending |
| - Parse/Enrich nodes | 45 min | ⏳ Pending |
| - OpenAI regen node | 1 hour | ⏳ Pending |
| - Update tracker node | 30 min | ⏳ Pending |
| - Test with dummy payload | 30 min | ⏳ Pending |
| **Phase 3: Worker UI** | | |
| - Regenerate modal | 1.5 hours | ⏳ Pending |
| - Integration + testing | 1 hour | ⏳ Pending |

**Total: 5-6 hours**

---

## 🎯 **Implementation Order**

1. ✅ **Planning complete** (this doc)
2. ⏳ **View Post button** (quick win, test deployment)
3. ⏳ **Create test payload** (for N8N testing)
4. ⏳ **N8N backend** (build + test with payload)
5. ⏳ **Worker UI** (modal + integration)
6. ⏳ **End-to-end testing**

---

## 🚨 **Risk Assessment**

| Risk Level | Count | Mitigation |
|------------|-------|------------|
| HIGH | 0 | N/A |
| MEDIUM | 1 | Use separate OpenAI node |
| LOW | 3 | Isolated webhook, append-only sheet, self-contained modal |

**Overall Risk: LOW** ✅

---

## 📝 **Notes & Context**

- Original plan had increment tracking in tracker → Too complex
- Simplified to archive sheet → Cleaner, full history
- Unlimited regens → Trust quality monitoring over hard limits
- Feedback optional → Allow "just give me different ones"

---

## 🔗 **Related Files**

- Main workflow: `[Huys] LinkedIn Post Draft Agent (1).json`
- Worker UI: `linkedin_worker.html` (offhours-oasis-landing repo)
- Self-Learning KB: Already integrated in main workflow
- Project context: `.claude/PROJECT_CONTEXT.md`

---

**Last Updated:** 2026-01-24
**Next Action:** Implement view post button + create test payload
