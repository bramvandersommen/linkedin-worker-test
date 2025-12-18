# Success Metrics (Pragmatic Version)

**Purpose:** Define exactly how to measure voice tuning progress WITHOUT building a dashboard.

**Philosophy:** Use existing Google Sheets data + simple manual checks. No complex analytics, no new infrastructure.

---

## PRIMARY METRIC: Edit Distance Reduction

**What It Measures:** How much Patrick changes AI drafts before posting.

**Why It Matters:** Lower edit distance = AI is closer to Patrick's voice.

**Target:** <10% average edit distance (currently ~35-40% baseline)

### How to Measure

**Data Source:** Google Sheets → "Post and Comment Tracker" → Column M (`EDIT_DISTANCE_PCT`)

**Calculation Method (Manual):**

1. Open "Post and Comment Tracker" sheet
2. Filter for:
   - `STATUS` = "Commented"
   - `COMMENTED_AT` within desired time range (e.g., last 20 posts)
3. Note values in Column M (`EDIT_DISTANCE_PCT`)
4. Calculate average:
   ```
   =AVERAGE(M2:M21)  // Adjust range as needed
   ```
5. Log result in tracking table below

**Calculation Method (Formula, if preferred):**

Add this to a new "Metrics Tracking" sheet tab:

```
=AVERAGE(
  FILTER(
    'Post and Comment Tracker'!M:M,
    'Post and Comment Tracker'!P:P = "Commented",
    'Post and Comment Tracker'!L:L >= DATE(2025,12,10)  // V2 deploy date
  )
)
```

### Baseline vs Target

| Phase | Time Period | Avg Edit Distance | Goal |
|-------|-------------|-------------------|------|
| **V1 Baseline** | Before voice tuning | 35-40% | Establish baseline |
| **Week 1** | First 5-10 V2 comments | 25-30% | 25% improvement |
| **Week 2** | Next 10 comments | 18-25% | 40% improvement |
| **Week 3** | Next 10 comments | 12-18% | 60% improvement |
| **Week 4 (Target)** | Last 10 comments | <10% | **SUCCESS** |

**How to Track (Simple Table):**

Create a new Google Sheet tab called "Voice Tuning Progress":

| Week | Version | Date Range | # Comments | Avg Edit Dist % | # Perfect Drafts | # High-Edit Posts | Notes |
|------|---------|------------|------------|-----------------|------------------|-------------------|-------|
| 0 | V1 (baseline) | Nov 1 - Dec 10 | 20 | 38% | 2 | 7 | Before tuning |
| 1 | V2 | Dec 11 - Dec 17 | 5 | ??% | ?? | ?? | First test |
| 2 | V2 | Dec 18 - Dec 24 | 10 | ??% | ?? | ?? | |
| 3 | V2 / V2.1 | Dec 25 - Dec 31 | 10 | ??% | ?? | ?? | |
| 4 | V2.1 | Jan 1 - Jan 7 | 10 | ??% | ?? | ?? | Target: <10% |

**Update weekly:** Spend 5 minutes every Friday filling in one row.

---

## SECONDARY METRIC: Perfect Drafts

**What It Measures:** Number of drafts Patrick uses with zero or minimal editing.

**Why It Matters:** Perfect drafts = AI nailed the voice, Patrick saves maximum time.

**Target:** 30%+ of drafts are perfect (currently ~10-20% baseline)

### How to Measure

**Definition of "Perfect Draft":**
- Edit distance ≤ 2% (basically copy-paste)
- OR Patrick explicitly marks it as "used as-is"

**Counting Method:**

1. Filter "Post and Comment Tracker" for desired time range
2. Count rows where `EDIT_DISTANCE_PCT` ≤ 2%
3. Calculate:
   ```
   Perfect Drafts = COUNT(posts with edit distance ≤ 2%)
   Total Drafts = COUNT(all commented posts)
   Perfect Draft Rate = (Perfect / Total) × 100
   ```

**Formula (if using Google Sheets):**

```
Perfect Drafts:
=COUNTIF('Post and Comment Tracker'!M:M, "<=2")

Perfect Draft Rate:
=COUNTIF('Post and Comment Tracker'!M:M, "<=2") / COUNTA('Post and Comment Tracker'!M:M) * 100
```

### Baseline vs Target

| Phase | Perfect Draft Rate | Interpretation |
|-------|-------------------|----------------|
| **V1 Baseline** | 10-20% | 1-2 out of 10 posts |
| **Week 2** | 20-25% | 2-3 out of 10 posts |
| **Week 4 Target** | 30%+ | **3-4 out of 10 posts** |
| **Stretch Goal** | 50%+ | 5 out of 10 posts |

**Weekly Tracking:**

Add to the "Voice Tuning Progress" table:

- Column: `# Perfect Drafts` (count of drafts with ≤2% edit distance)
- Column: `Perfect Draft %` (percentage)

---

## TERTIARY METRIC: High-Edit Posts

**What It Measures:** Number of posts where Patrick makes major rewrites (>30% edit distance).

**Why It Matters:** High-edit posts = AI missed the mark badly. Should decrease over time.

**Target:** <20% of posts are high-edit (currently ~40-50% baseline)

### How to Measure

**Definition of "High-Edit Post":**
- Edit distance > 30%
- Patrick rewrote more than 1/3 of the draft

**Counting Method:**

1. Filter "Post and Comment Tracker" for desired time range
2. Count rows where `EDIT_DISTANCE_PCT` > 30%
3. Calculate rate:
   ```
   High-Edit Posts = COUNT(posts with edit distance > 30%)
   Total Posts = COUNT(all commented posts)
   High-Edit Rate = (High-Edit / Total) × 100
   ```

**Formula:**

```
High-Edit Count:
=COUNTIF('Post and Comment Tracker'!M:M, ">30")

High-Edit Rate:
=COUNTIF('Post and Comment Tracker'!M:M, ">30") / COUNTA('Post and Comment Tracker'!M:M) * 100
```

### Baseline vs Target

| Phase | High-Edit Rate | Interpretation |
|-------|---------------|----------------|
| **V1 Baseline** | 40-50% | 4-5 out of 10 need major rewrites |
| **Week 2** | 25-30% | 2-3 out of 10 |
| **Week 4 Target** | <20% | **<2 out of 10** |
| **Stretch Goal** | <10% | Rare exceptions only |

---

## QUALITATIVE INDICATORS

**Not everything is quantifiable.** These subjective checks matter too.

### 1. Patrick's Gut Feel

**Measurement:** Ask Patrick directly every week.

**Questions:**
1. "Are drafts getting better, worse, or staying the same?"
2. "Am I editing less than before?"
3. "Do drafts sound more like me?"

**How to Track:**

Add to weekly check-in email:

```
Quick gut check (Yes/No):
- Drafts feel better than last week? ___
- Spending less time editing? ___
- Sound more like your voice? ___
```

Log answers in "Voice Tuning Progress" table under "Notes" column.

### 2. Draft Selection Pattern

**What to Watch:** Which draft (1, 2, or 3) does Patrick select most often?

**Why It Matters:**
- If Patrick always picks Draft 1 → AI is consistent
- If Patrick picks randomly → AI hasn't found the pattern yet

**How to Track:**

Occasionally check "Post and Comment Tracker" Column J (`SELECTED_DRAFT_#`):

```
=COUNTIF('Post and Comment Tracker'!J:J, "1")  // Count Draft 1 selections
=COUNTIF('Post and Comment Tracker'!J:J, "2")  // Count Draft 2 selections
=COUNTIF('Post and Comment Tracker'!J:J, "3")  // Count Draft 3 selections
```

**Ideal Pattern:**
- Draft 1 selected 50%+ of the time (AI's first try is usually best)
- Drafts 2 and 3 provide useful alternatives but not always needed

### 3. Review Time

**What to Watch:** Is Patrick spending less time reviewing drafts?

**Why It Matters:** If AI improves, Patrick should review faster (less editing needed).

**How to Measure:**

Ask Patrick:
> "Roughly, how long does it take you to review a draft now vs before?"

**Baseline:** 2-3 minutes per post (reading, editing, posting)
**Target:** 30-60 seconds per post (quick scan, minor tweak, post)

**Tracking:** Qualitative note in weekly check-in.

### 4. Repeat Issues

**What to Watch:** Are the SAME problems showing up repeatedly?

**Why It Matters:** If AI keeps making the same mistake, the prompt rule isn't working.

**How to Track:**

Bram manually reviews Patrick's edits every 2 weeks:

1. Pick 5 recent comments
2. Compare AI draft vs Patrick's final comment
3. Note patterns:
   - Still fabricating client industries?
   - Still getting question placement wrong?
   - Still using corporate jargon?

**Log in "Issue Tracker" (simple doc):**

| Issue | Week 1 | Week 2 | Week 3 | Week 4 | Status |
|-------|--------|--------|--------|--------|--------|
| Fabricating fintech clients | 3 instances | 1 instance | 0 instances | 0 instances | ✅ FIXED |
| Question mismatch | 2 instances | 2 instances | 1 instance | 0 instances | ✅ FIXED |
| Too formal tone | 1 instance | 0 instances | 0 instances | 0 instances | ✅ FIXED |

---

## SUCCESS CRITERIA (WEEK 4 CHECKLIST)

**Use this checklist at the end of Week 4 to determine if voice tuning succeeded.**

Patrick should answer YES to these questions:

- [ ] **I edit fewer than 10% of words in MOST drafts**
  - Check: Avg edit distance <10%

- [ ] **At least 30% of drafts need zero editing**
  - Check: Perfect draft rate ≥30%

- [ ] **Drafts consistently sound like my voice**
  - Check: Patrick's gut feel = "Yes"

- [ ] **I spend <1 minute reviewing most drafts**
  - Check: Patrick reports faster review time

- [ ] **I trust the AI to generate quality drafts**
  - Check: Patrick uses drafts without major rewrites

**Decision Matrix:**

| YES Count | Verdict | Action |
|-----------|---------|--------|
| **5/5** | ✅ **SUCCESS** | Document learnings, close project |
| **4/5** | ✅ **SUCCESS** | Minor tweaks, then close |
| **3/5** | ⚠️ **ITERATE** | One more round of adjustments (Phase 4) |
| **2/5** | ⚠️ **DIAGNOSE** | Deep dive into what's still broken |
| **0-1/5** | 🔴 **RESET** | V2 didn't work, need new approach |

---

## TRACKING WORKFLOW (FOR BRAM)

**Weekly Routine (5-10 minutes every Friday):**

### Step 1: Calculate Metrics

1. Open "Post and Comment Tracker"
2. Filter for current week's comments
3. Calculate:
   - Avg edit distance (manually or formula)
   - # perfect drafts (edit distance ≤2%)
   - # high-edit posts (edit distance >30%)

### Step 2: Update Tracking Table

1. Open "Voice Tuning Progress" sheet
2. Add new row:
   ```
   Week: [number]
   Version: V2 or V2.1
   Date Range: [start - end]
   # Comments: [count]
   Avg Edit Dist %: [calculated]
   # Perfect Drafts: [count]
   # High-Edit Posts: [count]
   Notes: [Patrick's gut feel or observations]
   ```

### Step 3: Send Update to Patrick

Email template:

```
Subject: Voice Tuning Update - Week [X]

Hey Patrick,

Quick update on AI voice tuning:

THIS WEEK ([date range], [#] comments):
• Avg edit distance: [X]% (baseline was 38%)
• Perfect drafts: [X]/[total] ([X]%)
• High edits (>30%): [X]/[total]

TREND: [✅ Improving / ⚠️ Plateauing / 🔴 Regressing]

[If improving:]
Nice progress! Drafts are getting closer to your voice.

[If plateauing:]
Edits stabilized around [X]%. Want to push for another iteration?

[If regressing:]
Edit distance went up this week. Did drafts feel worse?
Let's diagnose what changed.

Any issues on your end?

- Bram
```

### Step 4: Log Issues (If Any)

If Patrick reports problems:
1. Note them in "Issue Tracker" doc
2. Categorize using FEEDBACK_CATEGORIES.md
3. Schedule fix for next week

---

## SIMPLE VISUALIZATION (OPTIONAL)

**If Patrick wants to SEE progress visually:**

Create a simple line chart in Google Sheets:

**Data:**
- X-axis: Week number (0, 1, 2, 3, 4)
- Y-axis: Avg edit distance %
- Line: Trend over time

**Chart Setup:**

1. Select data from "Voice Tuning Progress" table (columns A and E)
2. Insert → Chart → Line chart
3. Customize:
   - Title: "Voice Tuning Progress: Edit Distance Over Time"
   - Y-axis: 0% to 50%
   - Add target line at 10%

**Example:**

```
Week 0: 38%  ●
Week 1: 28%    ●
Week 2: 19%       ●
Week 3: 13%          ●
Week 4: 9%             ● ✅ Target reached
         └─────────────────────┘
         0%                   50%
```

---

## WHAT SUCCESS LOOKS LIKE (REAL NUMBERS)

**Baseline (V1):**
- Avg edit distance: 38%
- Perfect drafts: 2/10 (20%)
- High-edit posts: 5/10 (50%)
- Patrick: "Drafts are okay but I rewrite a lot."

**Target (V2, Week 4):**
- Avg edit distance: 9%
- Perfect drafts: 4/10 (40%)
- High-edit posts: 1/10 (10%)
- Patrick: "Drafts are 90% ready. I barely touch them."

**The Difference:**
- Patrick saves 4 minutes per post
- Over 10 posts/week = 40 min/week saved
- Over 1 month (40 posts) = 160 min (2.7 hours) saved
- **ROI:** Patrick invests 55 minutes upfront, saves 160+ minutes/month ongoing

---

## TROUBLESHOOTING: WHEN METRICS DON'T IMPROVE

**Scenario 1: Edit distance stuck around 25-30%**

**Diagnosis:**
- AI improved but plateaued
- Rules are working but not specific enough

**Action:**
- Review 5 recent high-edit posts
- Identify new patterns Patrick is fixing
- Add more specific rules to V2.1

**Scenario 2: Edit distance goes UP after V2**

**Diagnosis:**
- V2 prompt caused regression
- Rules made drafts too generic or introduced new issues

**Action:**
- Immediate rollback to V1
- Ask Patrick: "What got worse?"
- Adjust V2, re-deploy as V2.1

**Scenario 3: Metrics improve but Patrick says "still not good enough"**

**Diagnosis:**
- Numbers look good but subjective quality is off
- Edit distance measures QUANTITY of edits, not QUALITY of voice

**Action:**
- Focus on qualitative feedback
- Ask: "What specifically still sounds wrong?"
- Adjust for tone/authenticity, not just structure

---

## FINAL NOTE: SIMPLICITY IS THE GOAL

**This is NOT a dashboard project.**

You don't need:
- ❌ Automated graphs
- ❌ Real-time metrics
- ❌ Fancy visualizations
- ❌ Email alerts
- ❌ API integrations

You DO need:
- ✅ Weekly manual check (5 min)
- ✅ Simple tracking table
- ✅ Patrick's gut feel
- ✅ Trend awareness (better/worse/same)

**If metrics improve AND Patrick says "drafts feel right" → SUCCESS.**

**If one is true but not the other → Keep iterating.**

---

**END OF SUCCESS METRICS GUIDE**

Use this alongside `INTERNAL_VOICE_TUNING_METHODOLOGY.md` Phase 5 for monitoring and validation.
