# Internal Voice Tuning Methodology

**Purpose:** Detailed execution guide for Bram to achieve 95%+ ToV accuracy with Patrick's AI comment system.

**Timeline:** 4 weeks
**Patrick's Time:** 55 minutes total
**Bram's Time:** 4-5 hours total

---

## TABLE OF CONTENTS

1. [Phase 0: Preparation (Before Patrick's Involvement)](#phase-0-preparation)
2. [Phase 1: Historical Review (Patrick - 30 min)](#phase-1-historical-review)
3. [Phase 2: Analysis & Tuning (Bram + Claude Web - 2-3 hours)](#phase-2-analysis--tuning)
4. [Phase 3: Validation Testing (Patrick - 15 min)](#phase-3-validation-testing)
5. [Phase 4: Fine-Tuning (Bram - 1 hour)](#phase-4-fine-tuning)
6. [Phase 5: Monitoring (Patrick - 10 min + ongoing)](#phase-5-monitoring)
7. [Appendices](#appendices)

---

## PHASE 0: PREPARATION

**Goal:** Prepare Agent Training Sheet with historical examples for Patrick to review.

**Bram's Tasks:**

- [x] **Agent Training Sheet structure exists** (already in Google Sheets)
- [ ] **Export 15-20 historical posts from Comment Tracker**
  - Criteria: Posts with STATUS = "Commented"
  - Must have: AI drafts (DRAFT 1/2/3) + Patrick's POSTED_COMMENT
  - Prioritize: Recent posts (last 30-60 days)
  - Variety: Mix of topics, VIPs, languages (EN + NL if applicable)

- [ ] **Populate Agent Training Sheet with selected posts**
  - Copy from Comment Tracker to Agent Training Sheet:
    - POST CONTENTS
    - VIP NAME
    - AI DRAFT 1, 2, 3
    - USER COMMENT (Patrick's actual posted comment)
    - LANGUAGE (EN/NL)
    - DATE
    - POST URL

- [ ] **Add missing columns if needed**
  - Ensure these columns exist:
    - `QUALITY RATING` (for Patrick to fill: Good/Bad/Neutral)
    - `AI DRAFT 1 EVAL` (for Patrick's notes on Draft 1)
    - `AI DRAFT 2 EVAL` (for Patrick's notes on Draft 2)
    - `AI DRAFT 3 EVAL` (for Patrick's notes on Draft 3)
    - `BEST DRAFT` (which draft was closest to his final comment)

- [ ] **Prepare prioritization logic**

**How to prioritize which posts Patrick should review:**

1. **Variety in topics** - Cover Patrick's main themes:
   - Webflow/CMS/website development (core expertise)
   - Design systems & component-based design
   - Marketing operations & autonomy
   - B2B SaaS website optimization
   - Founder/entrepreneurship insights
   - Avoid: Sales methodology, team management (topics he explicitly avoids)

2. **Clear good/bad examples:**
   - Include 3-5 posts where edit distance was LOW (<15%) - these are "good" examples
   - Include 5-8 posts where edit distance was HIGH (>30%) - these show problems
   - Include 4-7 posts in the middle (15-30%) - these show partial success

3. **VIP diversity:**
   - Mix of different VIPs (not all from one person)
   - Include both close connections and industry peers

4. **Language balance:**
   - If Patrick posts in both EN and NL, include examples of both
   - Based on PROJECT_CONTEXT, he posts bilingually

5. **Recency:**
   - Prioritize last 30-60 days (fresher in Patrick's memory)
   - But include 2-3 older posts if they're exceptional examples

**Sheet Preparation Checklist:**

- [ ] 15-20 posts selected and copied to Agent Training Sheet
- [ ] All required columns populated (except Patrick's ratings/feedback)
- [ ] Posts sorted by DATE (most recent first)
- [ ] Sheet shared with Patrick (edit access)
- [ ] Brief instructions added at top of sheet:
  ```
  INSTRUCTIONS FOR PATRICK:
  1. Review each AI draft (columns H, J, L)
  2. Compare to your actual comment (column C)
  3. Rate each draft: Good / Bad / Neutral (columns I, K, M)
  4. Add 1-2 sentence note on WHY in EVAL columns
  5. Mark BEST DRAFT (which one was closest to your final comment)

  TIME: 20-30 minutes total
  ```

---

## PHASE 1: HISTORICAL REVIEW

**Goal:** Patrick reviews AI drafts, rates them, and provides qualitative feedback.

**Timeline:** Week 1
**Patrick's Time:** 30 minutes

### Patrick's Tasks

- [ ] Review 15-20 AI drafts in Agent Training Sheet
- [ ] Rate each draft (Good/Bad/Neutral) in columns I, K, M
- [ ] Provide 1-2 sentence rationale in EVAL columns
- [ ] Mark which draft was "best" (closest to final comment)

### Review Protocol for Patrick

**Rating Scale:**

- **GOOD** = Draft was 80%+ ready. Needed minor edits or copy-paste ready.
- **NEUTRAL** = Draft had the right structure/idea but needed significant rewording.
- **BAD** = Draft was off-topic, wrong tone, fabricated info, or completely unusable.

**Feedback Template (for EVAL columns):**

Keep it short. Focus on:
- **What was wrong?** (e.g., "Claimed client experience I don't have")
- **What was right?** (e.g., "Good structure, question matched my comment")

**Examples of good feedback:**

✅ "Draft fabricated 'fintech client' story. I don't work with fintech in this context."
✅ "Question doesn't relate to my comment, it relates to the original post."
✅ "Too formal. I don't say 'One client of mine,' I say 'A client.'"
✅ "Perfect. Used it as-is."
✅ "Good story but wrong numbers—I don't track those metrics."

**Examples of not-useful feedback:**

❌ "Bad"
❌ "Doesn't sound like me"
❌ "Wrong"

### Bram's Support During This Phase

**How to prime the review session:**

1. **Send Patrick the sheet link** with clear subject: "Voice Tuning Step 1: Review 20 AI Drafts (30 min)"
2. **Include context in email:**
   ```
   Hey Patrick,

   Step 1 of voice tuning: Review these 20 historical AI drafts.

   WHAT TO DO:
   - Rate each draft: Good / Bad / Neutral
   - Add 1-2 sentences on WHY in the "EVAL" columns
   - Mark which draft was closest to your final comment

   TIME: 30 minutes (set a timer!)

   WHY THIS MATTERS:
   Your feedback teaches the AI what NOT to do. Every "bad" rating
   with a reason = one less mistake in future drafts.

   Let me know when done. I'll hand it to Claude for analysis.

   - Bram
   ```

3. **Set deadline:** "Please complete by [Friday this week]"

**What to do if Patrick gets stuck:**

- **If he's spending too long:** "Aim for 1-2 sentences max per draft. Speed over perfection."
- **If ratings are unclear:** "When in doubt, mark Neutral and explain why it wasn't great."
- **If he asks 'how detailed?':** "Just enough for me to understand the pattern. 'Fabricated client story' is enough."

**How to capture feedback efficiently:**

- Patrick fills the sheet directly (no need for separate doc)
- Bram can review in real-time (Google Sheets shared)
- If Patrick prefers voice notes, Bram transcribes them into the EVAL columns

---

## PHASE 2: ANALYSIS & TUNING

**Goal:** Extract patterns from Patrick's feedback and translate into system prompt improvements.

**Timeline:** Week 1-2 (after Patrick completes review)
**Bram's Time:** 2-3 hours
**Tools:** Claude Web (claude.ai)

### Bram's Tasks

- [ ] Download completed Agent Training Sheet as CSV
- [ ] Upload CSV to Claude Web for analysis
- [ ] Ask Claude to analyze Patrick's feedback patterns
- [ ] Extract "good examples" for potential KB population
- [ ] Get Claude's recommendations for system prompt adjustments
- [ ] Draft V2 system prompt with guardrails
- [ ] Validate with Claude before deploying

### Analysis Framework

**Step 1: Upload Sheet to Claude Web**

Use this prompt:

```
I'm analyzing feedback from a client (Patrick) on AI-generated LinkedIn comment drafts.

CONTEXT:
- Patrick reviews VIP LinkedIn posts and comments on them
- AI generates 3 draft comments in his voice
- Patrick edits/posts one, and we track the difference
- Goal: Reduce edit distance from ~35% to <10%

ATTACHED:
- Agent Training Sheet with 20 posts
- Columns: POST CONTENTS, USER COMMENT (Patrick's actual), AI DRAFT 1/2/3, EVAL notes

YOUR TASK:
1. Analyze Patrick's feedback in the EVAL columns
2. Identify patterns in what he marks as "BAD" or "NEUTRAL"
3. Categorize issues (tone, fabrication, structure, authenticity)
4. Extract rules for system prompt (e.g., "Never claim sales team experience")
5. Identify 3-5 "GOOD" examples to add to Self-Learning KB

Be specific. I need actionable rules, not vague observations.
```

**Step 2: Pattern Extraction**

Claude will categorize feedback. Bram should organize into:

### FABRICATION ISSUES

**Definition:** AI invents client stories, industries, or experiences Patrick never had.

**Examples to look for in feedback:**
- "I don't work with fintech clients in this context"
- "Never had a sales team"
- "I don't track these metrics"
- "This client doesn't exist"

**System Prompt Rule Template:**
```
CRITICAL: NEVER fabricate client details. Only reference:
- Webflow projects
- B2B SaaS website work
- Design system/component builds
- CMS autonomy projects

NEVER claim:
- Sales team management experience
- Fintech/finance industry clients (unless verified)
- Specific metrics unless Patrick has mentioned them
- Enterprise team scaling experience
```

### TONE ISSUES

**Definition:** Draft sounds too formal, too casual, or uses phrases Patrick never uses.

**Examples to look for:**
- "Too formal. I don't say 'One client of mine'"
- "I don't use corporate jargon"
- "Sounds like AI, not like me"

**System Prompt Rule Template:**
```
TONE CALIBRATION:
- Use "A client" NOT "One client of mine"
- Use "I worked with" NOT "I collaborated with"
- Keep it conversational, not corporate
- Avoid: "leverage," "synergy," "utilize," "facilitate"
- Prefer: simple verbs (built, fixed, changed, tested)
```

### STRUCTURE ISSUES

**Definition:** Draft has wrong format, question placement, or length.

**Examples to look for:**
- "Question doesn't match my comment"
- "Too long"
- "Question relates to original post, not my comment"
- "No personal angle"

**System Prompt Rule Template:**
```
STRUCTURE RULES:
- Question must relate to YOUR COMMENT, not the original post
- Keep comments 3-5 sentences (not 6+)
- Always include: personal insight + client example + question
- Line breaks: After opening, after example, before question
```

### AUTHENTICITY ISSUES

**Definition:** AI uses patterns/phrases that don't match Patrick's established voice.

**Examples to look for:**
- "I never say this"
- "Wrong personality"
- "Not how I'd phrase it"

**System Prompt Rule Template:**
```
AUTHENTICITY MARKERS:
- Patrick leads with insight/observation, not story
- He uses "It took me X to realize Y" pattern
- Questions are curious, not leading
- He references system thinking + operational impact
```

### TOPIC/EXPERTISE BOUNDARIES

**Definition:** AI claims knowledge in areas Patrick explicitly avoids.

**Examples to look for:**
- "I don't know anything about sales teams"
- "Not my expertise"
- "This topic is outside my work"

**System Prompt Rule Template:**
```
TOPIC BOUNDARIES:
PATRICK'S EXPERTISE (safe to reference):
- Webflow, CMS, no-code tools
- Component-based design systems
- Marketing operations & autonomy
- B2B SaaS website optimization
- Founder/solo consultant experience

AVOID CLAIMING EXPERTISE IN:
- Sales team management
- Enterprise org design
- Traditional software engineering
- Industries outside web/design/SaaS
```

**Step 3: KB Population Criteria**

Select 3-5 "GOOD" examples (rated GOOD with low edit distance) to add to Self-Learning KB.

**Criteria:**
- Patrick rated it "GOOD"
- Edit distance <15% (if available in Comment Tracker)
- Covers a core topic (Webflow, CMS, design systems)
- Demonstrates authentic voice
- Good structure (insight + example + question)

**For each good example, prepare:**
- POST_CONTENTS (original post)
- GOOD_COMMENT (Patrick's actual comment)
- KEYWORDS (extract 5-8 topic keywords using Claude)
- LANGUAGE (EN or NL)

These will go into the 🧠 Self-Learning KB sheet later (see PROJECT_CONTEXT.md for schema).

**Step 4: Prompt Tuning Approach**

**Current System Prompt Location:** Google Sheets → Config tab → PERSONA_BIO + TONE_OF_VOICE_PROFILE + DO_LIST + DONT_LIST

**V2 Prompt Structure:**

```
[EXISTING PROMPT - keep Patrick's voice description]

---

CRITICAL GUARDRAILS (Added [DATE]):

1. FABRICATION PREVENTION:
   [Insert rules from analysis]

2. TONE CALIBRATION:
   [Insert rules from analysis]

3. STRUCTURE REQUIREMENTS:
   [Insert rules from analysis]

4. TOPIC BOUNDARIES:
   [Insert rules from analysis]

5. AUTHENTICITY CHECKS:
   Before finalizing ANY draft, verify:
   - No fabricated client industries
   - No claimed expertise outside core areas
   - Question relates to YOUR comment, not original post
   - Tone matches conversational, not corporate style
```

**Step 5: Validation with Claude**

Before deploying V2, ask Claude Web:

```
I've drafted V2 system prompt with these new guardrails:

[paste V2 prompt]

VALIDATION QUESTIONS:
1. Are these rules specific enough to prevent repeat mistakes?
2. Do any rules contradict each other?
3. Are there gaps based on Patrick's feedback?
4. Is this too restrictive (will it make drafts generic)?
5. Suggest 2-3 test scenarios to validate these rules.
```

---

## PHASE 3: VALIDATION TESTING

**Goal:** Patrick tests 5 NEW posts with V2 system prompt to confirm improvements.

**Timeline:** Week 2
**Patrick's Time:** 15 minutes

### Patrick's Tasks

- [ ] Comment on 5 NEW VIP posts using V2 AI drafts
- [ ] Compare quality vs V1 baseline (gut feel)
- [ ] Flag any regressions (e.g., drafts got MORE generic, LESS accurate, or NEW problems emerged)

### Testing Protocol

**How Bram generates V2 test drafts:**

1. **Deploy V2 prompt to Google Sheets Config tab**
2. **Wait for 5 new VIP posts to appear** (don't force old posts through new system)
3. **Normal flow:** Scraper → Worker → N8N → OpenAI (now using V2 prompt) → Drafts
4. **Patrick comments as usual** via Worker UI
5. **Track edit distance** in Comment Tracker (column M)

**How to present comparisons to Patrick:**

Option A: **Simple Email Check-In**
```
Hey Patrick,

You've commented on 5 posts using V2 drafts.

Quick gut check:
1. Are drafts better, worse, or same quality vs before?
2. Any new problems that didn't exist before?
3. Are edits getting smaller?

Just 2-3 sentences is fine.

- Bram
```

Option B: **Side-by-Side Comparison** (if Patrick wants data)

Create simple table:

| Metric | V1 (Baseline) | V2 (Current) |
|--------|---------------|--------------|
| Avg edit distance | 35% | ??% |
| Perfect drafts (0 edits) | 2/10 | ?/5 |
| Fabrication issues | 3/10 posts | ?/5 posts |
| Patrick's gut feel | "Sounds like AI" | "???" |

**What constitutes "better":**

✅ **Improvement signals:**
- Edit distance drops (35% → 20-25% is good progress)
- Fewer fabrication issues
- Questions match Patrick's comment more often
- Patrick says "feels closer to my voice"
- Faster review time (he's not rewriting as much)

❌ **Regression signals:**
- Drafts became MORE generic (lost personality)
- New types of errors emerged
- Edit distance stayed same or increased
- Patrick says "these are worse than before"

**How to capture this feedback:**

- Simple email reply from Patrick
- Bram notes it in a "V2 Testing Log" doc
- No need for formal structure—just capture observations

---

## PHASE 4: FINE-TUNING

**Goal:** Address any regressions and finalize V2 prompt.

**Timeline:** Week 2-3
**Bram's Time:** 1 hour

### Bram's Tasks

- [ ] Review Patrick's V2 test feedback
- [ ] Identify any regression issues
- [ ] Adjust V2 prompt with Claude Web if needed
- [ ] Update system prompt in Google Sheets Config tab
- [ ] Deploy V2.1 (if changes made)
- [ ] Confirm deployment with Patrick

### Addressing Regressions

**Common Regression Scenarios:**

**Scenario 1: Drafts became too generic**

**Symptom:** Patrick says "drafts lost personality" or "too safe, too bland"

**Fix:**
- Guardrails were too restrictive
- Add clause: "While following these rules, maintain contrarian insights and strong opinions"
- Re-enable specific authentic phrases Patrick uses
- Ask Claude: "How can we prevent fabrication WITHOUT making drafts generic?"

**Scenario 2: New error types emerged**

**Symptom:** Patrick flags issues that didn't exist in V1

**Fix:**
- Add new guardrail for that specific issue
- Ask Claude: "Why might [new issue] be happening after these changes?"
- Test one post manually with Claude before deploying fix

**Scenario 3: Edit distance didn't improve**

**Symptom:** V2 edit distance still ~35% (same as V1)

**Fix:**
- Rules weren't specific enough or AI is ignoring them
- Make rules more explicit (use NEVER, ALWAYS, CRITICAL)
- Move rules higher in prompt (closer to top = higher priority)
- Add examples of good vs bad in the prompt itself

**Scenario 4: Language detection broke**

**Symptom:** Dutch posts getting English drafts or vice versa

**Fix:**
- Check if V2 changes affected LANGUAGE RULE (see PROJECT_CONTEXT.md section 1.7)
- Ensure this rule is FIRST in the prompt:
  ```
  CRITICAL LANGUAGE RULE - READ CAREFULLY:
  - Before generating ANY drafts, detect the post language by checking the FIRST sentence.
  - If first sentence is Dutch → ALL 3 DRAFTS MUST BE IN DUTCH
  - If first sentence is English → ALL 3 DRAFTS MUST BE IN ENGLISH
  - NEVER mix languages.
  ```

### Final Prompt Adjustment Process

1. **Bram identifies issue** from Patrick's feedback
2. **Bram asks Claude Web:**
   ```
   Patrick tested V2 and said: "[Patrick's feedback]"

   Current V2 prompt:
   [paste prompt]

   PROBLEM:
   [describe issue]

   How should I adjust the prompt to fix this without breaking other improvements?
   ```

3. **Claude suggests fix** → Bram validates it makes sense
4. **Bram updates Google Sheets Config** → deploys V2.1
5. **Bram tests 1-2 posts manually** (run through Worker UI, check drafts)
6. **Bram notifies Patrick:** "Deployed V2.1 fix. Try next 2-3 posts and let me know."

### Deployment Checklist

- [ ] V2 (or V2.1) prompt finalized in Google Sheets Config tab
- [ ] N8N cache refreshed (hourly scheduled job should pick it up, or trigger manual refresh)
- [ ] Test: Scrape 1 post, verify drafts reflect new rules
- [ ] Patrick notified: "V2 is live. Comment on next 5-10 posts as normal."

---

## PHASE 5: MONITORING

**Goal:** Passive observation of edit distance over 10-20 comments to confirm sustained improvement.

**Timeline:** Week 3-4
**Patrick's Time:** 10 min initial + passive ongoing
**Bram's Time:** 15 min/week check-ins

### Patrick's Tasks

- [ ] Comment on 10-20 posts using V2 drafts (just work normally)
- [ ] Report any issues as they come up (ad hoc)
- [ ] Week 4: Answer final success check questions (5 min)

### Bram's Monitoring Plan

**What metrics to watch in Google Sheets:**

**Primary Metric: Edit Distance (Column M in Comment Tracker)**

- Check AVERAGE(EDIT_DISTANCE_PCT) for last 10-20 comments
- Compare to V1 baseline (~35%)
- Target: <15% by Week 4

**How to calculate (simple method):**

1. Open Comment Tracker
2. Filter: STATUS = "Commented", COMMENTED_AT > [V2 deploy date]
3. Copy column M (EDIT_DISTANCE_PCT) for last 20 rows
4. Calculate: `=AVERAGE(M[range])`
5. Log in tracking sheet (see SUCCESS_METRICS_SIMPLE.md)

**Secondary Indicators:**

- **Perfect drafts (0% edit distance):** Count how many
  - V1 baseline: ~2/10
  - V2 target: ~5/10 or more

- **High-edit posts (>30% distance):** Count how many
  - V1 baseline: ~5/10
  - V2 target: <2/10

- **Repeat issues:** Are same problems recurring?
  - Check Patrick's edits for patterns
  - If he's still removing "fintech client" references → rule isn't working

**When to intervene:**

❗ **Immediate intervention triggers:**
- Edit distance INCREASES vs V1 (regression)
- Patrick reports "drafts got worse"
- Same fabrication issue appears 3+ times

⚠️ **Monitor closely triggers:**
- Edit distance improves but plateaus above 20%
- Patrick says "better but not there yet"
- Improvement is inconsistent (some posts great, others terrible)

✅ **Success signals (no intervention needed):**
- Edit distance trending down week over week
- Patrick says "drafts feel right"
- Perfect drafts increasing
- Patrick's review time decreasing

**Weekly Check-In Protocol:**

**Every Friday (Weeks 3-4):**

1. **Bram calculates metrics** (5 min)
   - Avg edit distance for week
   - # perfect drafts
   - # high-edit posts

2. **Bram sends update to Patrick** (simple Slack/email):
   ```
   Weekly Voice Tuning Update:

   This week (10 comments):
   • Avg edit distance: 18% (down from 35% baseline)
   • Perfect drafts: 4/10 (up from 2/10 baseline)
   • High edits (>30%): 1/10 (down from 5/10 baseline)

   Trending: ✅ Improving

   Any issues on your end?
   ```

3. **Patrick responds** (2 min): Quick yes/no + any issues

### Final Success Check (Week 4)

**Bram sends Patrick these questions:**

```
We're at Week 4 of voice tuning. Quick success check:

1. Are you editing fewer than 10% of words in MOST drafts? (Yes/No)
2. Do at least 30% of drafts need zero editing? (Yes/No)
3. Do drafts consistently sound like your voice? (Yes/No)
4. Do you spend <1 minute reviewing most drafts? (Yes/No)
5. Do you trust the AI to generate quality drafts? (Yes/No)

If 4/5 are YES → Success. We're done.
If 2-3 are YES → Good progress. One more iteration.
If <2 are YES → Let's diagnose what's not working.
```

**Decision Matrix:**

| YES Count | Action |
|-----------|--------|
| 5/5 | ✅ **SUCCESS** - Document learnings, close project |
| 4/5 | ✅ **SUCCESS** - Minor tweaks, then close |
| 3/5 | ⚠️ **ITERATE** - One more round of adjustments (Phase 4 again) |
| 2/5 | ⚠️ **DIAGNOSE** - Deep dive into what's still broken |
| 0-1/5 | 🔴 **RESET** - V2 didn't work, need new approach |

---

## APPENDICES

### Appendix A: Success Metric Formulas (Simple Version)

See `SUCCESS_METRICS_SIMPLE.md` for full details.

**Quick Reference:**

```
Edit Distance % = (Levenshtein distance / Final comment length) × 100

Perfect Draft = Edit distance 0% (or <2%)

High-Edit Post = Edit distance >30%

Average Edit Distance = AVERAGE(last 20 edit distance values)
```

### Appendix B: Feedback Categorization Guide

See `FEEDBACK_CATEGORIES.md` for full taxonomy.

**Quick Reference:**

| Category | Example | Fix |
|----------|---------|-----|
| Fabrication | "Claimed fintech client I don't have" | Add NEVER rule for that industry |
| Tone | "Too formal, I don't say 'One client of mine'" | Update phrase dictionary |
| Structure | "Question relates to post, not my comment" | Add explicit structure rule |
| Authenticity | "AI cliché, doesn't sound like me" | Add authentic phrase examples |
| Topic Boundary | "I don't have sales team experience" | Add expertise boundary rule |

### Appendix C: Prompt Evolution Tracker

Track changes to system prompt over time.

**Template:**

| Version | Date | Changes Made | Reason | Result |
|---------|------|--------------|--------|--------|
| V1 | [original] | Baseline prompt | N/A | ~35% edit distance |
| V2 | [Week 2] | Added fabrication rules, tone calibration, topic boundaries | Patrick's feedback analysis | [TBD after testing] |
| V2.1 | [Week 3] | [if needed] | [regression fix] | [TBD] |

**Store this in:** Google Doc or simple Google Sheet tab

### Appendix D: Contingency Plans

**Contingency 1: Patrick doesn't complete historical review**

**Trigger:** Week 1 ends, Patrick hasn't rated drafts

**Action:**
1. Bram sends reminder email (friendly nudge)
2. If still no response after 3 days:
   - Ask: "Is 20 posts too many? Want me to cut it to 10?"
   - Offer: "Can we do a 15-min call where you talk and I fill the sheet?"
3. Last resort: Bram does lightweight analysis based on edit distance data alone (not ideal, but workable)

**Contingency 2: V2 makes drafts WORSE**

**Trigger:** Patrick reports drafts got worse, or edit distance increases

**Action:**
1. **Immediate rollback** to V1 prompt (stop the bleeding)
2. **Root cause analysis** with Claude:
   - What rule caused the regression?
   - Did we over-correct?
3. **Selective revert:** Remove problematic rule, keep others
4. **Re-test** with 3 posts before deploying again

**Contingency 3: Edit distance doesn't improve after 4 weeks**

**Trigger:** Week 4 check shows edit distance still >25%

**Action:**
1. **Diagnose root cause:**
   - Are rules being ignored by AI? (make them more explicit)
   - Are we solving the wrong problems? (re-review Patrick's feedback)
   - Is the baseline prompt fundamentally wrong? (might need full rewrite)

2. **Escalation options:**
   - Add few-shot examples to prompt (pull from good drafts)
   - Switch to more explicit format (e.g., checklist-style prompt)
   - Consider fine-tuning GPT-4o-mini (expensive, 200+ examples needed)

3. **Set expectations with Patrick:**
   - "We made progress but not enough. Here's the next approach..."
   - Give him option to pause or continue

**Contingency 4: Patrick loses trust in the system**

**Trigger:** Patrick stops using AI drafts, reverts to writing from scratch

**Action:**
1. **Understand why:** Schedule 10-min call
   - Is it taking longer to review than to write?
   - Did a bad draft go out publicly?
   - Does he feel it's not worth the effort?

2. **Adjust expectations:**
   - Maybe 95% is unrealistic for his voice
   - Maybe 80% accuracy (20% edit) is the real target
   - Reset success criteria

3. **Offer pause:**
   - "Want to pause for a month and revisit?"
   - System keeps learning in background (self-learning workflow still runs)

### Appendix E: Claude Web Prompt Templates

**Template 1: Initial Analysis**

```
I'm analyzing feedback from Patrick on AI-generated LinkedIn comment drafts.

CONTEXT:
[paste context from Phase 2, Step 1]

ATTACHED:
[upload Agent Training Sheet CSV]

YOUR TASK:
1. Analyze Patrick's feedback in EVAL columns
2. Identify patterns in BAD/NEUTRAL ratings
3. Categorize issues: Fabrication, Tone, Structure, Authenticity, Topic Boundaries
4. Extract 5-10 specific rules for system prompt
5. Identify 3-5 GOOD examples for KB

OUTPUT FORMAT:
## FABRICATION PATTERNS
[list issues + suggested rules]

## TONE PATTERNS
[list issues + suggested rules]

## STRUCTURE PATTERNS
[list issues + suggested rules]

## AUTHENTICITY PATTERNS
[list issues + suggested rules]

## TOPIC BOUNDARY VIOLATIONS
[list issues + suggested rules]

## GOOD EXAMPLES FOR KB
[list 3-5 with reasons]

## RECOMMENDED V2 PROMPT ADDITIONS
[draft new guardrail section]
```

**Template 2: Regression Diagnosis**

```
Patrick tested V2 prompt and reported: "[paste Patrick's feedback]"

CURRENT V2 PROMPT:
[paste full V2 prompt]

PROBLEM:
[describe specific issue]

QUESTION:
How should I adjust the prompt to fix this regression without breaking other improvements?

CONSTRAINTS:
- Must maintain fabrication prevention rules
- Can't make drafts generic/bland
- Must keep authentic voice
```

**Template 3: Validation Check**

```
I've drafted V2 system prompt. Please validate before I deploy.

V2 PROMPT:
[paste full prompt]

VALIDATION QUESTIONS:
1. Are guardrails specific enough to prevent repeat mistakes?
2. Do any rules contradict each other?
3. Are there gaps based on Patrick's feedback patterns?
4. Is this too restrictive (will it make drafts generic)?
5. Suggest 2-3 test scenarios to validate these rules work.

Patrick's original feedback themes:
- [summarize key patterns from Phase 2]
```

---

## Summary Checklist (For Bram)

**Week 1:**
- [ ] Prepare Agent Training Sheet with 15-20 historical posts
- [ ] Send to Patrick for review
- [ ] Patrick completes ratings + feedback (30 min)
- [ ] Analyze feedback with Claude Web
- [ ] Draft V2 system prompt
- [ ] Validate V2 with Claude
- [ ] Deploy V2 to Google Sheets Config

**Week 2:**
- [ ] Patrick tests 5 posts with V2 drafts
- [ ] Patrick reports on quality (better/worse/same)
- [ ] Make adjustments if needed (V2.1)
- [ ] Confirm deployment

**Week 3-4:**
- [ ] Monitor edit distance for 10-20 comments
- [ ] Weekly check-ins with Patrick
- [ ] Week 4: Final success check
- [ ] Document learnings
- [ ] Close project OR iterate

**Success = 4/5 YES answers to final check questions**

---

**END OF INTERNAL METHODOLOGY**
