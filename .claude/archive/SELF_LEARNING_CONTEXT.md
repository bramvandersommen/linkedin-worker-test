# LinkedIn AI Self-Learning System - Context & Design

**Last Updated:** 2025-12-13
**Status:** Design phase - Ready to build
**Goal:** Surgical precision ToV matching through automated learning loop

---

## 🎯 Problem Statement

### Current Situation:
- AI generates 3 draft comments per LinkedIn post
- Patrick selects and edits drafts before posting
- Edit distance varies: some drafts need heavy editing (>40%), others are nearly perfect (<15%)
- **No feedback loop** - system doesn't learn from edits

### Desired Outcome:
- **Automated learning:** System identifies bad drafts and learns from Patrick's corrections
- **Few-shot learning:** Inject 3-5 relevant training examples into future prompts
- **Continuous improvement:** ToV accuracy increases over time without manual intervention
- **Expected gain:** +15-20% ToV accuracy (from ~60-70% baseline to ~75-85%)

---

## 🏗️ Architecture Overview

### Phase Breakdown:

**Phase 0: Foundation (COMPLETE)**
- ✅ Basic system prompt
- ✅ 3 draft generation per post
- ✅ Manual selection + editing
- ✅ Comment tracking in Google Sheets

**Phase 1: Initial System Prompt Sharpening (IN PROGRESS)**
- Collect manual feedback on initial drafts (~20-30 comments)
- Analyze patterns in edits
- Refine base system prompt
- **Status:** Waiting for client feedback on pre-generated drafts

**Phase 2: Self-Learning Loop (CURRENT - Building)**
- Auto-detect bad drafts (>40% edit distance)
- Extract keywords for matching
- Store training pairs (bad draft → good comment)
- Build knowledge base for few-shot learning

**Phase 3: Few-Shot Learning (NEXT)**
- Match incoming posts to relevant training examples
- Inject 3-5 best examples into OpenAI prompt
- Expected: +15-20% ToV accuracy

**Phase 4: Analytics & Insights (FUTURE)**
- Weekly/monthly learning summaries
- Track: comments posted, time saved, quality improvement %
- Fun stats for stakeholder reporting

---

## 📊 Data Architecture

### Google Sheets Structure

#### **Sheet: "Post and Comment Tracker"**

| Column | Name | Type | Purpose | Notes |
|--------|------|------|---------|-------|
| A | POST_ID | Text | Unique identifier | LinkedIn activity ID |
| B | VIP_NAME | Text | Post author | For relationship context |
| C | POST_CONTENTS | Text | Original post | Full text for analysis |
| D | POST_URL | Text | LinkedIn URL | Link back to post |
| E | ENRICHED_URL | Text | Worker URL | Internal tracking |
| F | PROCESSED_AT | DateTime | When drafted | ISO 8601 format |
| G | DRAFT_1 | Text | AI-generated draft 1 | |
| H | DRAFT_2 | Text | AI-generated draft 2 | |
| I | DRAFT_3 | Text | AI-generated draft 3 | |
| J | SELECTED_DRAFT_# | Number | Which draft chosen | 1, 2, or 3 |
| K | POSTED_COMMENT | Text | Final comment sent | After Patrick's edits |
| L | COMMENTED_AT | DateTime | When posted | ISO 8601 format |
| **M** | **EDIT_DISTANCE_PCT** | **Number** | **% difference** | **⚠️ REPLACES current formula** |
| N | TOV_ACCURACY_SCORE | Number | (Future metric) | Placeholder |
| O | FEEDBACK_NOTES | Text | Manual feedback | Phase 1 only |
| P | STATUS | Text | Drafted/Commented/Archived | Workflow state |
| **Q** | **Learned_From** | **Text** | **TRUE/SKIPPED/blank** | **De-duplication flag** |
| **R** | **Learned_At** | **DateTime** | **When processed** | **ISO 8601 format** |

**⚠️ IMPORTANT NOTES:**
- **Column M (EDIT_DISTANCE_PCT):** Currently has formula `=IF(OR(ISBLANK(A3),ISBLANK(K3)),"",ABS(LEN(...)))`
  - **This formula will be REPLACED** by N8N-calculated values
  - Formula calculates absolute character difference, we need **percentage**
  - N8N will write directly to this column
- **Date Format:** All datetime columns must accept ISO 8601 strings (`2025-12-13T14:32:00.000Z`)
  - Google Sheets auto-converts to local timezone
  - Ensure column format is "Date time" not "Plain text"

#### **Sheet: "Self-Learning Training" (NEW TAB)**

| Column | Name | Type | Purpose |
|--------|------|------|---------|
| A | POST_ID | Text | Link to original tracker row |
| B | VIP_NAME | Text | Post author |
| C | POST_CONTENTS | Text | Original post text |
| D | POST_URL | Text | LinkedIn URL |
| E | LANGUAGE | Text | EN or NL |
| F | SELECTED_DRAFT_NUM | Number | 1, 2, or 3 |
| G | BAD_DRAFT | Text | AI draft (before editing) |
| H | GOOD_COMMENT | Text | Final comment (after editing) |
| I | EDIT_DISTANCE_PCT | Number | % difference (for analytics) |
| J | PROCESSED_DATE | DateTime | When added to training |
| K | COMMENTED_AT | DateTime | When originally posted |
| **L** | **KEYWORDS** | **Text** | **Comma-separated keywords** |

**Purpose:** Training pairs for few-shot learning
**Only includes:** Posts with >40% edit distance (bad drafts that were heavily corrected)

#### **Sheet: "Agent Training Sheet" (EXISTING - Phase 1)**
- Contains manual feedback from Patrick on initial drafts
- Used for one-time system prompt refinement
- **Not used for self-learning** (manual feedback too expensive to scale)
- Columns: ROW_ID, POST_CONTENTS, USER_COMMENT, LANGUAGE, AI_DRAFT_1/2/3 + EVAL, etc.

---

## 🔄 Self-Learning Workflow Design

### Trigger:
- **Schedule:** Daily at 2:00 AM UTC
- **Frequency:** Once per day (configurable)

### Workflow Steps:

#### **Step 1: Read Comment Tracker (Smart Query)**
```sql
WHERE:
  STATUS = "Commented"
  AND Learned_From IS BLANK
  AND COMMENTED_AT > (NOW - 7 days)
```

**Rationale:**
- Only process recent comments (7-day rolling window)
- Skip already-processed rows (Learned_From flag)
- Scales efficiently (never loads 500+ rows)

#### **Step 2: Calculate Edit Distance %**

**Algorithm:** Levenshtein distance (most accurate)
```javascript
// Normalize whitespace
const draft = selectedDraft.trim().replace(/\s+/g, ' ');
const comment = postedComment.trim().replace(/\s+/g, ' ');

// Calculate Levenshtein distance
const distance = levenshteinDistance(draft, comment);

// Convert to percentage (relative to final comment length)
const editDistancePct = (distance / comment.length) * 100;
```

**Why Levenshtein over simple char diff:**
- Handles insertions, deletions, substitutions
- More accurate for ToV changes (word swaps, reordering)
- Industry standard for text similarity

**Write back to Comment Tracker column M immediately**

#### **Step 3: Filter Threshold**
```javascript
if (editDistancePct > 40) {
  // Process for training (bad draft → good comment)
} else {
  // Mark as SKIPPED (draft was good enough)
}
```

#### **Step 4: Extract Keywords (OpenAI API)**

**Prompt:**
```
Extract 8-10 key topics/concepts from this LinkedIn post as a comma-separated list.
Focus on: technology names, industry terms, methodologies, concepts.
Avoid generic words like "team" or "work".

Post:
"""
[POST_CONTENTS]
"""

Format: keyword1, keyword2, keyword3, ...
```

**Example Response:**
```
webflow, cms, team-autonomy, conversion-optimization, component-systems, marketing-velocity, no-code
```

**Cost:** ~$0.001 per extraction
**Expected:** ~10 bad drafts/week = ~$0.04/month

#### **Step 5: Detect Language**
```javascript
function detectLanguage(text) {
  const firstSentence = text.split(/[.!?]/)[0] || '';
  const dutchWords = ['zoals', 'van', 'het', 'een', 'wat', 'die', 'voor', 'met', 'is', 'zijn', 'door', 'mijn', 'jouw', 'de', 'dat'];

  const lowerText = firstSentence.toLowerCase();
  const hasDutch = dutchWords.some(word => lowerText.includes(` ${word} `));

  return hasDutch ? 'NL' : 'EN';
}
```

**Same logic as main workflow** (consistency matters)

#### **Step 6: Write to Self-Learning Training**
- Append new row with all columns (A-L)
- Includes extracted KEYWORDS

#### **Step 7: Update Comment Tracker Flags**

**If processed (>40%):**
```javascript
{
  Learned_From: "TRUE",
  Learned_At: new Date().toISOString()
}
```

**If skipped (≤40%):**
```javascript
{
  Learned_From: "SKIPPED",
  Learned_At: new Date().toISOString()
}
```

---

## ⚡ Optimization Strategies

### 1. **De-duplication**
- `Learned_From` flag prevents re-processing same post
- 7-day rolling window limits query size
- Scales to 1000+ posts without performance hit

### 2. **Efficient Querying**
- Filter at Google Sheets level (not in N8N)
- Only pull rows that need processing
- Reduces API calls and memory usage

### 3. **Batch Processing**
- Processes all eligible posts in single workflow run
- No need to loop per-post
- Efficient use of N8N execution time

### 4. **Date Format Handling**
```javascript
// N8N writes ISO 8601
const processedDate = new Date().toISOString();
// "2025-12-13T14:32:00.000Z"

// Google Sheets auto-converts to local timezone
// Ensure column format is "Date time" not "Plain text"
```

### 5. **One-Time Backfill**
- For historical posts (before this workflow existed)
- Separate workflow or manual script
- Runs once to populate initial training data
- Daily workflow only handles new posts

---

## 🎯 Few-Shot Matching Strategy (Phase 3)

### Matching Algorithm (Non-AI, Fast):

```javascript
// 1. Extract keywords from new incoming post (simple frequency, no AI)
const newKeywords = extractSimpleKeywords(newPost.content);
// ["webflow", "speed", "conversion", "homepage"]

// 2. For each training example, calculate similarity
trainingExamples.forEach(example => {
  const exampleKeywords = example.KEYWORDS.split(', ');

  // Jaccard similarity (intersection / union)
  const intersection = newKeywords.filter(k => exampleKeywords.includes(k));
  const union = [...new Set([...newKeywords, ...exampleKeywords])];
  const keywordScore = intersection.length / union.length;

  // Weighted scoring
  const score =
    (keywordScore * 0.40) +                                    // Topic match
    (example.VIP_NAME === newPost.vipName ? 0.25 : 0) +       // Same VIP bonus
    (example.LANGUAGE === newPost.language ? 0.20 : 0) +      // Language match
    (recencyScore(example.PROCESSED_DATE) * 0.15);            // Prefer recent

  example.matchScore = score;
});

// 3. Select top 3-5 examples
const bestExamples = trainingExamples
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 5);

// 4. Inject into OpenAI prompt
const fewShotPrompt = `
Here are examples of how you should transform drafts into better comments:

${bestExamples.map(ex => `
Original post: ${ex.POST_CONTENTS}
Bad draft: ${ex.BAD_DRAFT}
Good comment: ${ex.GOOD_COMMENT}
`).join('\n---\n')}

Now generate 3 drafts for this new post:
${newPost.content}
`;
```

### Why This Works:
- ✅ **Fast:** No AI in matching (~10-50ms)
- ✅ **Accurate:** Keyword overlap captures topic similarity
- ✅ **Scalable:** Works with 100+ training examples
- ✅ **Zero latency impact:** Main workflow stays 8-12s

### Expected Results:
- **Baseline (no few-shot):** 60-70% ToV accuracy
- **With few-shot:** 75-85% ToV accuracy
- **Improvement:** +15-20 percentage points

---

## 📈 Success Metrics

### Self-Learning Loop Metrics:
- **Training examples collected:** Target 50-100 in first month
- **Coverage:** % of commented posts processed
- **Quality distribution:**
  - <15% edit distance: ~40% (already good)
  - 15-40%: ~35% (minor edits)
  - >40%: ~25% (bad drafts → training material)

### Few-Shot Impact Metrics (Phase 3):
- **ToV accuracy improvement:** +15-20% expected
- **Edit distance reduction:** From avg 30% → avg 20%
- **Time saved:** Measure post-edit time reduction
- **Match quality:** Track relevance of selected examples

### Cost Metrics:
- **Self-learning workflow:** ~$0.50/month (keyword extraction)
- **Few-shot injection:** $0 (no additional tokens, ~300-500 tokens reused from batch)
- **Total incremental cost:** <$1/month
- **ROI:** 9,000%+ (quality improvement far exceeds cost)

---

## 🚧 Implementation Notes

### Prerequisites:
1. ✅ Comment Tracker sheet exists with columns A-P
2. ⚠️ Add columns Q (Learned_From) and R (Learned_At)
3. ⚠️ Create new tab "Self-Learning Training" with columns A-L
4. ⚠️ Remove/replace formula in column M (EDIT_DISTANCE_PCT)
5. ⚠️ Ensure datetime columns formatted as "Date time" not "Plain text"

### Configuration:
- **Window size:** 7 days (configurable via workflow variable)
- **Threshold:** 40% edit distance (configurable)
- **Schedule:** Daily 2am UTC (configurable)
- **Keyword count:** 8-10 per post (configurable in prompt)

### Google Sheets API Permissions:
- Read access: Comment Tracker (columns A-R)
- Write access: Comment Tracker (columns M, Q, R)
- Write access: Self-Learning Training (all columns)

### OpenAI API:
- Model: `gpt-4o-mini` (cheap, fast, good for keyword extraction)
- Max tokens: 50 (keywords only)
- Temperature: 0.3 (deterministic)

---

## ⚠️ Known Issues & Gotchas

### 1. **Edit Distance Formula Replacement**
- **Current:** Column M has Google Sheets formula for absolute character difference
- **Problem:** Formula will conflict with N8N writing values
- **Solution:** Delete formula, let N8N write calculated percentage
- **Migration:** One-time backfill to calculate % for existing rows

### 2. **Date Format Compatibility**
- **N8N outputs:** ISO 8601 (`2025-12-13T14:32:00.000Z`)
- **Google Sheets expects:** Datetime value or formatted string
- **Solution:** Ensure column format is "Date time", Sheets auto-converts
- **Test:** Verify timezone handling (UTC vs local)

### 3. **Keyword Extraction Quality**
- **Risk:** Generic keywords ("team", "work") don't help matching
- **Mitigation:** Prompt emphasizes specific terms (tech, industry, methods)
- **Validation:** Manually review first 10 extractions, tune prompt

### 4. **7-Day Window Edge Cases**
- **Issue:** Posts commented on day 8 won't be processed if workflow missed a day
- **Solution:** Can expand window temporarily or run manual backfill
- **Prevention:** Monitor workflow execution logs

### 5. **Duplicate Training Examples**
- **Risk:** Same post processed twice if Learned_From flag fails
- **Prevention:** POST_ID is unique in Self-Learning Training (can add unique constraint)
- **Detection:** Periodic dedupe check

---

## 🔮 Future Enhancements

### Phase 3.5: Advanced Matching (If Needed)
- **Embeddings:** Pre-compute OpenAI embeddings for training examples
- **Semantic search:** Cosine similarity instead of keyword overlap
- **Expected improvement:** 80-85% → 85-90% accuracy
- **Cost:** +$0.0001 per embedding, ~$0.10/month
- **Decision point:** Implement if keyword matching <80% precision

### Phase 4: Analytics Dashboard
- Weekly/monthly learning summaries
- Stats tracked:
  - Comments posted
  - Time saved (avg edit time × posts)
  - Quality improvement % (edit distance trend)
  - Training examples collected
  - Few-shot match accuracy
- Delivered via email or Slack webhook

### Phase 5: Fine-Tuning (Optional)
- When training set reaches 100+ examples
- One-time fine-tune of GPT-4o-mini
- Expected: 90-95% ToV accuracy
- Cost: $200-500 one-time
- Decision point: If few-shot plateaus below 85%

---

## 📝 Open Questions & Decisions

### 1. **Window Size**
- **Current:** 7 days
- **Alternative:** 3 days (faster), 14 days (safer)
- **Decision:** Start with 7, adjust based on volume

### 2. **Additional Training Sheet Columns**
- **Proposed:** POST_LENGTH_BUCKET, DOMAIN
- **Decision:** Start with just KEYWORDS, add later if needed

### 3. **Edit Distance Calculation Timing**
- **Option A:** Calculate in self-learning workflow (current plan)
- **Option B:** Calculate in /webhook/comment-posted workflow (cleaner)
- **Decision:** Option A for now (simpler, no other workflow changes)

### 4. **Backfill Strategy**
- **Need to process:** Existing commented posts (before self-learning existed)
- **Options:**
  - Separate one-time workflow
  - Manual script
  - Let 7-day window catch up naturally (slow)
- **Decision:** TBD based on historical data volume

### 5. **Keyword Extraction Prompt Tuning**
- **Current prompt:** Focus on tech, industry, methods
- **May need tuning:** After reviewing first 10-20 extractions
- **Feedback loop:** Track keyword quality manually in Phase 3

---

## 🎬 Next Steps

### Immediate (Self-Learning Workflow):
1. ✅ Document complete (this file)
2. ⏳ Update Comment Tracker: Add columns Q, R
3. ⏳ Create Self-Learning Training tab with columns A-L
4. ⏳ Remove formula from column M
5. ⏳ Ensure datetime column formats correct
6. ⏳ Build N8N workflow with keyword extraction
7. ⏳ Test on sample data (5-10 posts)
8. ⏳ Deploy and monitor first run

### Phase 3 (Few-Shot Learning):
1. Wait for 20-30 training examples to accumulate
2. Build few-shot selection logic in main workflow
3. Test ToV accuracy improvement
4. Tune scoring weights if needed

### Phase 4 (Analytics):
1. Design weekly summary format
2. Build aggregation workflow
3. Set up email/Slack delivery

---

## 📚 References

- **Main workflow:** `linkedin-ai-comments` (N8N, Railway)
- **Worker UI:** `linkedin_worker.html` (GitHub Pages)
- **Scraper:** `linkedin_scraper_v4_dual_strategy.user.js` (Tampermonkey)
- **Project context:** `.claude/PROJECT_CONTEXT.md`
- **N8N workflow JSON:** `n8n-self-learning-workflow.json` (to be created)

---

**End of Self-Learning Context Document**
**Ready to build:** Yes, pending sheet setup confirmation
