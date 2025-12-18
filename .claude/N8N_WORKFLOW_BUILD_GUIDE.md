# N8N Self-Learning Workflow - Build Guide for Claude Web

**Created:** 2025-12-13
**Purpose:** Continue N8N workflow setup in Claude.ai (web) with screenshot support
**Status:** Sheet setup COMPLETE ✅ | N8N workflow updates IN PROGRESS ⏳

---

## 📍 Where We Are

### ✅ COMPLETED:
1. **Google Sheets setup:**
   - ✅ Column M (`EDIT_DISTANCE_PCT`) - Formula removed, empty, Number format
   - ✅ Column Q (`Learned_From`) - Empty, will store TRUE/SKIPPED
   - ✅ Column R (`Learned_At`) - Empty, Date time format
   - ✅ Columns F, L - Date time format verified
   - ✅ New tab created: `🧠 Self-Learning KB` (12 columns A-L)
   - ✅ All date columns formatted correctly

2. **N8N workflow imported:**
   - ✅ File: `n8n-self-learning-workflow.json`
   - ✅ Current workflow has 8 nodes (basic structure)
   - ✅ Connected to Google Sheets (credential ID: `3ufruIOhHou2w8Za`)

### ⏳ IN PROGRESS:
- Updating N8N workflow nodes to add missing functionality

### 🎯 GOAL:
Complete self-learning workflow that:
1. Reads commented posts from tracker (last 7 days)
2. Calculates edit distance % (Levenshtein)
3. Writes edit distance back to Comment Tracker column M
4. Extracts keywords (OpenAI) for posts >40% edit distance
5. Stores training pairs in `🧠 Self-Learning KB` sheet
6. Marks posts as processed (Learned_From flag)

---

## 🔍 Current N8N Workflow State

**File:** `n8n-self-learning-workflow.json`

**Existing Nodes:**
1. **"Schedule (Weekly)"** - Trigger (runs every 7 days)
2. **"When clicking 'Execute workflow'"** - Manual trigger
3. **"Read Comment Tracker"** - Google Sheets READ
4. **"Filter: Commented"** - Filter node (2 conditions currently)
5. **"Calculate Edit Distance %"** - Code node (Levenshtein distance)
6. **"IF Edit Distance > 40%"** - IF node (threshold check)
7. **"Append to Self-Learning Training"** - Google Sheets APPEND
8. **"Update Comment Tracker"** - Google Sheets UPDATE (TRUE branch)
9. **"Mark as Skipped (< 40%)"** - Google Sheets UPDATE (FALSE branch)

**Current Flow:**
```
Trigger → Read Tracker → Filter → Calculate Distance → IF >40%
                                                          ├─ TRUE → Append → Update
                                                          └─ FALSE → Mark Skipped
```

**Sheet References:**
- Document ID: `1ne21dfVWKu_mMxFAkXzHj92LXks5XSj6-tS1EmcNYLQ`
- Sheet name (tracker): `💬 Post and Comment Tracker` (gid: 66421665)
- Sheet name (training): Currently blank in "Append" node, needs: `🧠 Self-Learning KB`

---

## 🛠️ What Needs to Be Added/Updated

### Summary of Required Changes:

| Node Name | Action | Priority | Complexity |
|-----------|--------|----------|------------|
| "Filter: Commented" | **UPDATE** - Add 3rd condition (7-day window) | HIGH | Easy |
| "Write Edit Distance to Tracker" | **NEW** - Google Sheets UPDATE node | HIGH | Medium |
| "Extract Keywords" | **NEW** - OpenAI API node | HIGH | Medium |
| "Append to Self-Learning Training" | **UPDATE** - Add KEYWORDS column + sheet name | HIGH | Easy |
| "Update Comment Tracker" | **UPDATE** - Add EDIT_DISTANCE_PCT column | MEDIUM | Easy |
| "Mark as Skipped (< 40%)" | **UPDATE** - Add EDIT_DISTANCE_PCT column | MEDIUM | Easy |

**Total:** 2 new nodes, 4 updated nodes

---

## 📋 Detailed Instructions for Each Change

### **CHANGE 1: Update "Filter: Commented" Node**

**Goal:** Add 7-day window filter to only process recent posts

**Current State:**
- Has 2 conditions:
  1. `{{ $json.STATUS }}` equals `Commented`
  2. `{{ $json['Learned_From'] }}` is empty

**What to Add:**
- **Condition 3:** Filter by date (COMMENTED_AT within last 7 days)

**Steps:**
1. **Open node:** Click "Filter: Commented" in N8N canvas
2. **Locate Conditions section:** Should show 2 existing conditions
3. **Add new condition:**
   - Click **"Add Condition"** button
   - Configure as follows:

**Condition 3 Configuration:**

| Field | Value | Notes |
|-------|-------|-------|
| **Left Value (Value 1)** | `{{ $json['COMMENTED_AT'] }}` | References COMMENTED_AT column |
| **Operator** | `is after` or `later than` | Date comparison operator |
| **Right Value (Value 2)** | `{{ $now.minus({days: 7}).toISO() }}` | 7 days ago in ISO format |

4. **Verify Combinator:**
   - At top of Conditions section
   - Should be: **"AND"** (not "OR")

5. **Save node**

**Expected Result:**
- Filter now has 3 conditions (all must be true)
- Only processes posts from last 7 days

**Troubleshooting:**
- If "is after" operator not visible → ensure you're in Expression mode
- Alternative date expression: `{{ $today.minus(7, 'days') }}`
- Test by clicking "Test step" - should return fewer rows

**📸 Screenshot Reference Points:**
- Filter node with 2 conditions (current state)
- Add condition button location
- Operator dropdown showing date operators
- Final state with 3 conditions

---

### **CHANGE 2: Add "Write Edit Distance to Tracker" Node**

**Goal:** Write calculated EDIT_DISTANCE_PCT back to Comment Tracker column M

**Node Type:** Google Sheets

**Position:** Between "Calculate Edit Distance %" and "IF Edit Distance > 40%"

**Steps:**

1. **Add node:**
   - Click **"+"** button on connection between "Calculate Edit Distance %" and "IF Edit Distance > 40%"
   - Search: `Google Sheets`
   - Select: **"Google Sheets"** node

2. **Configure node settings:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Credential** | `Google Sheets account` (existing) | Should auto-select |
| **Operation** | `Update` | NOT "Append" |
| **Document** | Same as "Read Comment Tracker" | Select from dropdown |
| **Sheet** | `💬 Post and Comment Tracker` | Select from dropdown |
| **Column to Match On** | `POST_ID` | Primary key for matching |

3. **Add columns to update:**
   - Click **"Add Column"** button
   - Configure:

| Column Name | Value | Expression Mode |
|-------------|-------|-----------------|
| `EDIT_DISTANCE_PCT` | `{{ $json.EDIT_DISTANCE_PCT }}` | Yes (use Expression) |

4. **Name the node:**
   - Click node name at top
   - Rename to: `Write Edit Distance to Tracker`

5. **Connect nodes:**
   - Input: "Calculate Edit Distance %"
   - Output: "IF Edit Distance > 40%"

6. **Test:**
   - Click "Test step"
   - Verify it updates column M in Comment Tracker

**Expected Behavior:**
- Updates ALL processed posts with edit distance %
- Writes to column M (EDIT_DISTANCE_PCT)
- Happens BEFORE the 40% threshold check

**📸 Screenshot Reference Points:**
- Node insertion point
- Google Sheets UPDATE configuration
- Column mapping configuration
- Connection flow diagram

---

### **CHANGE 3: Add "Extract Keywords" Node**

**Goal:** Use OpenAI API to extract keywords from POST_CONTENTS for matching

**Node Type:** OpenAI

**Position:** After "IF Edit Distance > 40%" TRUE branch, before "Append to Self-Learning Training"

**Prerequisites:**
- OpenAI API key (get from https://platform.openai.com/api-keys)
- Cost: ~$0.001 per extraction (~$0.50/month for 30 posts)

**Steps:**

1. **Add node:**
   - Click **"+"** on TRUE output of "IF Edit Distance > 40%"
   - Search: `OpenAI`
   - Select: **"OpenAI"** node

2. **Configure credential:**
   - Click "Select Credential" dropdown
   - If no credential exists:
     - Click **"Create New Credential"**
     - Name: `OpenAI Account`
     - API Key: [paste your OpenAI API key]
     - Save

3. **Configure node settings:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Resource** | `Text` | For chat completions |
| **Operation** | `Message a Model` | Standard chat completion |
| **Model** | `gpt-4o-mini` | Cheapest, fast, good for this task |
| **Prompt** | See below | Multi-line prompt |

**Prompt (copy exactly):**
```
Extract 8-10 key topics/concepts from this LinkedIn post as a comma-separated list.
Focus on: technology names, industry terms, methodologies, concepts.
Avoid generic words like "team" or "work".

Post:
"""
{{ $json.POST_CONTENTS }}
"""

Format: keyword1, keyword2, keyword3, ...
Only return the keywords, nothing else.
```

4. **Configure options (expand "Options" section):**

| Option | Value | Purpose |
|--------|-------|---------|
| **Temperature** | `0.3` | Low = more consistent/deterministic |
| **Max Tokens** | `50` | Limit response length (keywords only) |

5. **Name the node:**
   - Rename to: `Extract Keywords`

6. **Connect nodes:**
   - Input: "IF Edit Distance > 40%" (TRUE output)
   - Output: "Append to Self-Learning Training"

7. **Test:**
   - Click "Test step"
   - Should return keywords like: "webflow, cms, conversion, autonomy, speed"

**Expected Output Format:**
```json
{
  "choices": [
    {
      "message": {
        "content": "webflow, cms, team-autonomy, conversion-rate, component-systems, marketing-velocity"
      }
    }
  ]
}
```

**Access Keywords in Next Node:**
- Expression: `{{ $('Extract Keywords').item.json.choices[0].message.content }}`

**Troubleshooting:**
- If API key invalid → verify key at OpenAI dashboard
- If response too long → reduce Max Tokens
- If keywords too generic → tune prompt (add more "avoid" examples)

**📸 Screenshot Reference Points:**
- OpenAI node configuration
- Credential setup screen
- Prompt configuration
- Options section (Temperature, Max Tokens)
- Test output showing keywords

---

### **CHANGE 4: Update "Append to Self-Learning Training" Node**

**Goal:** Add KEYWORDS column and update sheet name

**Current State:**
- Appends 11 columns (A-K)
- Sheet name is blank or wrong

**What to Update:**
1. Sheet name → `🧠 Self-Learning KB`
2. Add KEYWORDS column (column L)

**Steps:**

1. **Open node:** Click "Append to Self-Learning Training"

2. **Update sheet name:**
   - Find **"Sheet"** dropdown
   - Click dropdown
   - Select: `🧠 Self-Learning KB`
   - (Should appear in list if sheet was created correctly)

3. **Add KEYWORDS column:**
   - Scroll to **"Columns"** section
   - Click **"Add Column"** button (at bottom)
   - Configure new column:

| Field | Value | Notes |
|-------|-------|-------|
| **Column** | `KEYWORDS` | Must match header in sheet (column L) |
| **Value** | `{{ $('Extract Keywords').item.json.choices[0].message.content }}` | References OpenAI output |

4. **Verify all 12 columns present:**
   - POST_ID
   - VIP_NAME
   - POST_CONTENTS
   - POST_URL
   - LANGUAGE
   - SELECTED_DRAFT_NUM
   - BAD_DRAFT
   - GOOD_COMMENT
   - EDIT_DISTANCE_PCT
   - PROCESSED_DATE
   - COMMENTED_AT
   - KEYWORDS ← NEW

5. **Save node**

**Expected Behavior:**
- Writes full row to `🧠 Self-Learning KB` tab
- Includes extracted keywords in column L

**Troubleshooting:**
- If KEYWORDS shows as empty → check "Extract Keywords" node executed first
- If sheet name not in dropdown → verify tab name is exactly `🧠 Self-Learning KB` (with emoji)

**📸 Screenshot Reference Points:**
- Sheet dropdown showing correct sheet
- Column list showing all 12 columns
- KEYWORDS column configuration with expression

---

### **CHANGE 5: Update "Update Comment Tracker" Node**

**Goal:** Also write EDIT_DISTANCE_PCT when marking Learned_From = TRUE

**Current State:**
- Updates 2 columns: Learned_From, Learned_At

**What to Add:**
- EDIT_DISTANCE_PCT column

**Steps:**

1. **Open node:** Click "Update Comment Tracker"

2. **Add column:**
   - Scroll to **"Columns"** section
   - Click **"Add Column"** button
   - Configure:

| Field | Value |
|-------|-------|
| **Column** | `EDIT_DISTANCE_PCT` |
| **Value** | `{{ $json.EDIT_DISTANCE_PCT }}` |

3. **Verify 3 columns total:**
   - Learned_From = TRUE
   - Learned_At = {{ $json.PROCESSED_DATE }}
   - EDIT_DISTANCE_PCT = {{ $json.EDIT_DISTANCE_PCT }} ← NEW

4. **Save node**

**Why This Matters:**
- Redundant storage (also in "Write Edit Distance to Tracker" node)
- But ensures data consistency
- Useful if "Write Edit Distance" step fails

---

### **CHANGE 6: Update "Mark as Skipped (< 40%)" Node**

**Goal:** Also write EDIT_DISTANCE_PCT when marking Learned_From = SKIPPED

**Current State:**
- Updates 2 columns: Learned_From, Learned_At

**What to Add:**
- EDIT_DISTANCE_PCT column

**Steps:**

1. **Open node:** Click "Mark as Skipped (< 40%)"

2. **Add column:**
   - Scroll to **"Columns"** section
   - Click **"Add Column"** button
   - Configure:

| Field | Value |
|-------|-------|
| **Column** | `EDIT_DISTANCE_PCT` |
| **Value** | `{{ $json.EDIT_DISTANCE_PCT }}` |

3. **Verify 3 columns total:**
   - Learned_From = SKIPPED
   - Learned_At = {{ $now.toISO() }}
   - EDIT_DISTANCE_PCT = {{ $json.EDIT_DISTANCE_PCT }} ← NEW

4. **Save node**

---

## 🎯 Final Workflow Architecture

After all changes, workflow should look like this:

```
┌─────────────────────────────────────────┐
│ Trigger: Schedule (Weekly) OR Manual    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Read Comment Tracker                    │
│ (All rows, no filter yet)               │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Filter: Commented                       │
│ 1. STATUS = "Commented"                 │
│ 2. Learned_From IS BLANK                │
│ 3. COMMENTED_AT > 7 days ago ← NEW      │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Calculate Edit Distance %               │
│ (Code node - Levenshtein)               │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Write Edit Distance to Tracker ← NEW    │
│ (UPDATE column M in tracker)            │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ IF Edit Distance > 40%                  │
└──────────┬────────────────┬─────────────┘
           │ TRUE           │ FALSE
           ▼                ▼
┌──────────────────┐  ┌────────────────────┐
│ Extract Keywords │  │ Mark as Skipped    │
│ (OpenAI) ← NEW   │  │ + Edit Distance    │
└─────────┬────────┘  └────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Append to Self-Learning KB     │
│ + KEYWORDS ← UPDATED           │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│ Update Comment Tracker         │
│ + Edit Distance ← UPDATED      │
└────────────────────────────────┘
```

---

## ✅ Testing Checklist

After making all changes, test the workflow:

### **Test 1: Manual Execution**
1. Click "Execute Workflow" button
2. Check execution log - should process recent commented posts
3. Verify:
   - ✅ Column M populated in Comment Tracker
   - ✅ Learned_From = TRUE or SKIPPED
   - ✅ New rows in `🧠 Self-Learning KB` (only for >40% posts)
   - ✅ KEYWORDS column populated

### **Test 2: Validate Data Quality**
1. Open `🧠 Self-Learning KB` sheet
2. Check first row:
   - ✅ POST_ID matches tracker
   - ✅ KEYWORDS are relevant (not generic)
   - ✅ BAD_DRAFT and GOOD_COMMENT are different
   - ✅ EDIT_DISTANCE_PCT > 40%

### **Test 3: De-duplication**
1. Run workflow twice
2. Verify:
   - ✅ No duplicate rows in training sheet
   - ✅ Learned_From flag prevents re-processing

### **Test 4: 7-Day Window**
1. Add test comment with COMMENTED_AT = 10 days ago
2. Run workflow
3. Verify:
   - ✅ Old post NOT processed
   - ✅ Only recent posts (last 7 days) processed

---

## 🚨 Common Issues & Fixes

### **Issue 1: "Filter: Commented" has only 1 condition**
**Symptom:** Current workflow shows only 1 condition instead of 2
**Cause:** Workflow file may have been simplified or edited
**Fix:**
1. Add missing conditions manually:
   - Condition 1: `{{ $json.STATUS }}` equals `Commented`
   - Condition 2: `{{ $json['Learned_From'] }}` is empty
   - Condition 3: `{{ $json['COMMENTED_AT'] }}` is after `{{ $now.minus({days: 7}).toISO() }}`

### **Issue 2: OpenAI node returns error**
**Symptom:** "Invalid API key" or "Authentication failed"
**Fix:**
1. Verify API key at https://platform.openai.com/api-keys
2. Ensure key has credits available
3. Recreate credential in N8N

### **Issue 3: Keywords column is empty**
**Symptom:** Training sheet has blank KEYWORDS
**Cause:** Expression referencing wrong node or path
**Fix:**
1. Verify "Extract Keywords" node executed
2. Check expression: `{{ $('Extract Keywords').item.json.choices[0].message.content }}`
3. Test "Extract Keywords" node output first

### **Issue 4: Sheet name not found**
**Symptom:** "Sheet '🧠 Self-Learning KB' not found"
**Cause:** Sheet name mismatch (emoji, spacing)
**Fix:**
1. Verify exact sheet name in Google Sheets (copy-paste)
2. Update N8N node with exact name

### **Issue 5: Edit distance always 0 or 100**
**Symptom:** EDIT_DISTANCE_PCT shows unrealistic values
**Cause:** Code node issue or empty fields
**Fix:**
1. Check "Calculate Edit Distance %" node output
2. Verify DRAFT and POSTED COMMENT fields are not empty
3. Test Levenshtein function with sample data

---

## 🔗 Related Documentation

- **Master project documentation:** `.claude/PROJECT_CONTEXT.md` (consolidated - all 3 systems)
- **Current workflow JSON:** `n8n-self-learning-workflow.json`
- **Archived (reference only):** `.claude/archive/SELF_LEARNING_CONTEXT.md`
- **Google Sheets:**
  - Document ID: `1ne21dfVWKu_mMxFAkXzHj92LXks5XSj6-tS1EmcNYLQ`
  - Tab 1: `💬 Post and Comment Tracker` (gid: 66421665)
  - Tab 2: `🧠 Self-Learning KB` (new)

---

## 📸 Screenshots to Share in Claude Web

When continuing in Claude web, share screenshots of:

1. **Current "Filter: Commented" node** (showing existing conditions)
2. **Node canvas overview** (showing all current nodes)
3. **"Calculate Edit Distance %" output** (sample data)
4. **Google Sheets tabs** (showing tracker + KB tabs)
5. **Any error messages** encountered

---

## 🎬 Next Steps

### **In Claude Web:**
1. Upload this markdown file as reference
2. Share screenshot of current N8N workflow
3. Start with **CHANGE 1** (update Filter node)
4. Work through changes 1-6 sequentially
5. Share screenshots at each step for verification

### **Order of Implementation:**
1. ✅ CHANGE 1: Filter node (easiest, no new nodes)
2. ✅ CHANGE 5 & 6: Update existing nodes (easy)
3. ✅ CHANGE 2: Add "Write Edit Distance" node (medium)
4. ✅ CHANGE 3: Add "Extract Keywords" node (requires OpenAI key)
5. ✅ CHANGE 4: Update "Append" node (easy, depends on #3)

---

## 💡 Tips for Claude Web Session

**What to mention:**
- "I'm continuing the LinkedIn AI self-learning workflow setup"
- "I have the build guide from Claude Code (N8N_WORKFLOW_BUILD_GUIDE.md)"
- "Sheet setup is complete, now updating N8N nodes"
- Attach screenshot of current workflow canvas

**What NOT to repeat:**
- Sheet setup instructions (already done)
- Architecture explanations (see PROJECT_CONTEXT.md - System 2)
- Background context (see PROJECT_CONTEXT.md for complete overview)

**Focus on:**
- Step-by-step N8N node configurations
- Troubleshooting specific errors
- Validation of each change

---

**End of Build Guide**

**Status:** Ready to continue in Claude.ai web with screenshot support
**Next Action:** Start with CHANGE 1 (Filter node update)
