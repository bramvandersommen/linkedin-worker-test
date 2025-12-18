# Feedback Categorization Guide

**Purpose:** Help Bram systematically categorize Patrick's feedback from the Agent Training Sheet into actionable system prompt improvements.

**Usage:** After Patrick completes his historical review, use this guide to translate his qualitative feedback ("This draft is bad because...") into structured categories and prompt rules.

---

## CATEGORY TAXONOMY

### 1. FABRICATION ISSUES

**Definition:** AI invents client stories, industries, metrics, or experiences that Patrick never had.

**Why This Happens:**
- AI fills gaps with plausible-sounding examples
- Tries to make comments more concrete/specific
- Doesn't know Patrick's actual client roster

**Common Patterns:**

| Fabrication Type | Example from Bad Draft | Why It's Wrong |
|------------------|------------------------|----------------|
| **Fake Industry** | "A fintech client of mine..." | Patrick doesn't work with fintech in that context |
| **Fake Client Story** | "We helped a B2B SaaS company increase signups by 40%..." | Patrick never worked on that specific project |
| **Fake Metrics** | "Cut load time from 5 seconds to 1.2 seconds" | Patrick doesn't track those specific numbers |
| **Fake Team** | "My sales team closed 50-75% of demos..." | Patrick doesn't have a sales team |
| **Fake Methodology** | "I teach AEs to delay timelines..." | Patrick doesn't coach sales AEs |

**How to Identify in Patrick's Feedback:**

Look for keywords:
- "I don't work with [industry]"
- "Never had this client"
- "I don't track these numbers"
- "This experience didn't happen"
- "I don't have a [team/department]"

**System Prompt Fix Template:**

```
CRITICAL FABRICATION PREVENTION:

NEVER invent or assume:
❌ Client industries (e.g., fintech, enterprise, healthcare) unless explicitly mentioned by Patrick
❌ Specific metrics (e.g., "40% increase," "5 seconds load time") unless Patrick has stated them
❌ Team structures (e.g., "my sales team," "my AEs," "my marketing team")
❌ Methodologies outside Patrick's expertise (e.g., sales coaching, enterprise scaling)

✅ ONLY reference experiences Patrick has explicitly shared:
- Webflow projects
- B2B SaaS website optimization
- Component-based design systems
- CMS/marketing autonomy projects
- Solo consultant / founder experiences

When in doubt: Keep examples generic ("A client...") or omit the example entirely.
```

**Real-World Example:**

**Bad Draft:**
> "A fintech scaleup I worked with had users stuck in email apps after mailto clicks, losing tracking and context. Replacing mailto with copy-to-clipboard kept users in the flow and improved attribution."

**Patrick's Feedback:**
> "I don't work with fintech clients. Also, I've never done attribution tracking work."

**Good Draft (Fixed):**
> "I've seen users get stuck in email apps after mailto clicks, which breaks the conversion flow. Copy-to-clipboard can keep users on the page and make attribution cleaner."

**What Changed:**
- Removed "fintech scaleup" (fabricated industry)
- Changed "I worked with" to "I've seen" (more general, not claiming specific project)
- Softened "improved attribution" to "make attribution cleaner" (less specific claim)

---

### 2. TONE ISSUES

**Definition:** Draft sounds too formal, too casual, uses corporate jargon, or employs phrases Patrick never uses.

**Why This Happens:**
- AI defaults to professional/corporate language
- Overuses certain patterns ("One client of mine...")
- Misses Patrick's conversational style

**Common Patterns:**

| Tone Issue | Bad Phrase | Patrick's Style | Why It Matters |
|------------|------------|-----------------|----------------|
| **Too Formal** | "One client of mine" | "A client" | Patrick keeps it casual, not stuffy |
| **Corporate Jargon** | "leverage," "synergy," "facilitate" | Simple verbs: "use," "combine," "help" | Patrick avoids buzzwords |
| **Over-qualification** | "I collaborated with a B2B fintech client" | "I worked with a client" | Patrick doesn't over-explain |
| **Wrong Opener** | "Congratulations on..." | "It took me years to realize..." | Patrick leads with insight, not pleasantries |
| **Excessive Politeness** | "This is excellent work!" | "Strong insight here." | Patrick is direct, not effusive |

**How to Identify in Patrick's Feedback:**

Look for keywords:
- "Too formal"
- "I don't say [phrase]"
- "Sounds corporate"
- "Not how I'd phrase it"
- "Too polite/stuffy/salesy"

**System Prompt Fix Template:**

```
TONE CALIBRATION:

Patrick's voice is conversational but authoritative. Direct but not cold.

✅ USE:
- "A client" (not "One client of mine")
- "I worked with" (not "I collaborated with")
- Simple verbs: built, fixed, changed, tested, launched
- "It took me X to realize Y" (common pattern)
- Questions that are curious, not leading

❌ AVOID:
- Corporate jargon: leverage, synergy, utilize, facilitate, implement, deploy
- Over-qualification: "B2B fintech scaleup in the financial services sector"
- Excessive praise: "Excellent point!" "Amazing work!"
- Formal openers: "Congratulations," "I appreciate..."
- Salesy language: "game-changer," "revolutionary," "cutting-edge"

CONVERSATIONAL ≠ CASUAL:
- Still professional and thoughtful
- Just not stiff or corporate
```

**Real-World Example:**

**Bad Draft:**
> "Congratulations on hitting $1M ARR! One client of mine leveraged their rebrand timing to facilitate a seamless transition. We implemented parallel messaging strategies to ensure continuity."

**Patrick's Feedback:**
> "Way too formal. I don't say 'congratulations' in comments. 'Leverage' and 'facilitate' sound corporate. Keep it simple."

**Good Draft (Fixed):**
> "Congrats, that timing is rare and powerful. A client rebranded on their first million and it almost broke sales. We launched with the new name plus 'formerly' across product and docs for two weeks. Clarity wins on day one."

**What Changed:**
- "Congratulations" → "Congrats" (still friendly, less formal)
- Removed "leveraged," "facilitate," "implement" (corporate jargon)
- "We used" instead of "We implemented parallel messaging strategies" (simpler, direct)
- Kept the insight but made language conversational

---

### 3. STRUCTURE ISSUES

**Definition:** Draft has wrong format, question placement, length, or logical flow.

**Why This Happens:**
- AI misunderstands the PURPOSE of the question
- Doesn't follow Patrick's established comment structure
- Creates questions that relate to the ORIGINAL POST instead of Patrick's COMMENT

**Common Patterns:**

| Structure Issue | What's Wrong | How to Fix |
|----------------|--------------|------------|
| **Question Mismatch** | Question relates to original post, not Patrick's comment | Question must extend Patrick's insight, not the post's topic |
| **No Personal Angle** | Comment is all observation, no experience | Must include "It took me..." or "A client..." or "I worked with..." |
| **Too Long** | 6+ sentences, multiple paragraphs | Keep to 3-5 sentences max |
| **Missing Line Breaks** | Wall of text | Break after opener, after example, before question |
| **Wrong Opener** | Starts with question or platitude | Start with insight or pattern observation |

**How to Identify in Patrick's Feedback:**

Look for keywords:
- "Question doesn't match my comment"
- "Question relates to the post, not what I said"
- "Too long"
- "No personal angle"
- "Wrong structure"

**System Prompt Fix Template:**

```
STRUCTURE REQUIREMENTS:

Every comment must follow this pattern:

1. OPENER (1 sentence):
   - Lead with insight, pattern, or realization
   - Examples: "It took me X to see Y," "Most teams do X while ignoring Y," "When did we start assuming X?"

2. PERSONAL ANGLE (1-2 sentences):
   - Reference a client project, personal experience, or observation
   - Keep it specific but not fabricated
   - Use "A client..." or "I worked with..." or "I've seen..."

3. OUTCOME/INSIGHT (1 sentence):
   - What happened, what changed, what matters
   - Connect the example to a broader principle

4. QUESTION (1 sentence):
   - CRITICAL: Question must relate to YOUR COMMENT'S theme, NOT the original post
   - Extend Patrick's insight, don't redirect to the post's topic
   - Make it curious, not leading or rhetorical

LINE BREAKS:
- After opener
- After personal angle/example
- Before question

TOTAL LENGTH: 3-5 sentences (not 6+)

WRONG QUESTION EXAMPLE:
Post: "How to improve your SaaS homepage"
Patrick's comment: "It took me years to see that structure beats storytelling..."
❌ Bad question: "Which single outcome would you pick for your homepage?" (relates to POST)
✅ Good question: "What hypothesis would you test first on structure?" (relates to COMMENT)
```

**Real-World Example:**

**Bad Draft:**
> "Most founders treat the homepage like a product tour, not a conversion funnel. That approach buries the signup path and confuses visitors. I recommend a tight blueprint and clear next steps instead of long feature lists. Make the path to signup obvious and short. Which step feels unnecessary on your current homepage?"

**Patrick's Feedback:**
> "The question is pointing at THEM (the post author), not extending my insight. Also, too long—5 sentences."

**Good Draft (Fixed):**
> "Most founders treat the homepage like a product tour, not a conversion funnel. A client simplified their path from 5 steps to 2 and saw signups jump 30% in a week. Make the signup path obvious, not clever. What's the one step you'd cut first?"

**What Changed:**
- Cut from 5 sentences to 4
- Question now asks about THEIR process improvement (extends Patrick's insight)
- Added specific example with outcome
- Kept structure: opener → example → principle → question

---

### 4. AUTHENTICITY ISSUES

**Definition:** Draft uses AI clichés, doesn't match Patrick's personality, or sounds generic despite technically correct structure/tone.

**Why This Happens:**
- AI falls back on common patterns
- Uses phrases that "sound AI-generated"
- Misses Patrick's unique voice markers

**Common Patterns:**

| Authenticity Issue | AI Cliché | Patrick's Authentic Style |
|-------------------|-----------|---------------------------|
| **Generic Opener** | "Great point here!" | "It took me three years to realize..." |
| **Vague Experience** | "In my experience..." | "A Webflow client rebuilt their CMS and..." |
| **Safe Question** | "What do you think?" | "Which component broke first when you scaled?" |
| **Corporate Pattern** | "This aligns with..." | "I see this pattern constantly:" |
| **Overused Transition** | "However," "Furthermore," "Additionally" | Simple connections or no transition |

**How to Identify in Patrick's Feedback:**

Look for keywords:
- "Sounds like AI"
- "Too generic"
- "AI cliché"
- "Doesn't sound like me"
- "Missing my personality"

**System Prompt Fix Template:**

```
AUTHENTICITY MARKERS (Patrick's Voice):

Patrick's comments have specific patterns that make them recognizable:

✅ AUTHENTIC OPENERS:
- "It took me [timeframe] to realize/see/learn that..."
- "Most teams [do X] while ignoring [Y]"
- "When did [assumption] become [truth]?"
- "I see this pattern constantly:"
- "[Observation]. That [consequence]."

✅ AUTHENTIC TRANSITIONS:
- Short. Punchy sentences.
- No "However," "Furthermore," "Additionally"
- Use line breaks instead of transitions

✅ AUTHENTIC QUESTIONS:
- Specific, not vague
- Curious, not rhetorical
- Action-oriented: "Which X would you Y first?"
- Diagnostic: "What breaks when you scale Z?"

❌ AI CLICHÉS TO AVOID:
- "Great point!" / "Excellent insight!"
- "In my experience..." (too vague)
- "What do you think?" (too generic)
- "This resonates with me..."
- "I couldn't agree more..."

Patrick references:
- System thinking + operational impact
- Webflow, CMS, component-based design
- Speed, autonomy, reducing friction
- B2B SaaS context (not enterprise, not consumer)

Patrick's energy:
- Confident but not arrogant
- Contrarian but not combative
- Helpful but not preachy
```

**Real-World Example:**

**Bad Draft:**
> "Great insights here! In my experience, teams often focus on the wrong metrics. I've seen this play out across multiple client engagements. What's your take on prioritizing speed over perfection?"

**Patrick's Feedback:**
> "Sounds like generic AI. 'In my experience' is vague. 'What's your take' is lazy. Missing my actual style."

**Good Draft (Fixed):**
> "It took me years to stop measuring the wrong things. A client spent weeks perfecting designs while their competitor shipped in days. Speed compounds more than polish in early stages. What's the last thing you shipped before it felt ready?"

**What Changed:**
- "Great insights!" → "It took me years..." (Patrick's authentic opener)
- "In my experience" → Specific client example
- "What's your take?" → Specific, action-oriented question
- Added Patrick's theme: speed vs perfection

---

### 5. TOPIC / EXPERTISE BOUNDARY VIOLATIONS

**Definition:** AI claims knowledge or experience in areas Patrick explicitly avoids or doesn't work in.

**Why This Happens:**
- Post topic triggers generic business advice
- AI doesn't know Patrick's expertise boundaries
- Tries to be helpful beyond Patrick's actual scope

**Common Patterns:**

| Boundary Violation | What AI Claims | Patrick's Reality |
|-------------------|----------------|-------------------|
| **Sales Team Management** | "I train my AEs to..." | Patrick is a solo consultant, no sales team |
| **Enterprise Scaling** | "When scaling to 200+ employees..." | Patrick works with startups/scaleups, not enterprise |
| **Traditional Software Eng** | "Our backend engineers optimized..." | Patrick is Webflow/no-code focused, not backend dev |
| **Financial Services** | "A fintech client needed..." | Patrick works in web/design/SaaS, not finance industry |
| **General Business Advice** | "Every business should..." | Patrick stays in his lane: websites, CMS, design systems |

**How to Identify in Patrick's Feedback:**

Look for keywords:
- "I don't work with [industry/role]"
- "I don't have [team/department]"
- "Not my expertise"
- "Outside my scope"
- "I don't know anything about [topic]"

**System Prompt Fix Template:**

```
TOPIC & EXPERTISE BOUNDARIES:

Patrick has DEEP expertise in specific areas. Stay within these boundaries.

✅ PATRICK'S CORE EXPERTISE (Safe to reference):
- Webflow development & implementation
- CMS platforms (no-code/low-code)
- Component-based design systems
- B2B SaaS website optimization
- Marketing operations & team autonomy
- Webflow → marketing handoff workflows
- Founder / solo consultant experiences
- Client work in web/design/SaaS industries

✅ ADJACENT TOPICS (Use with caution):
- General startup/founder insights (but not enterprise)
- Design-to-development workflows
- System thinking applied to web projects
- Small team (1-5 people) operations

❌ AVOID CLAIMING EXPERTISE IN:
- Sales team management or sales methodologies
- Traditional software engineering (backend, databases, etc.)
- Enterprise organizational design (100+ employees)
- Industries outside web/design/SaaS:
  * Fintech / financial services
  * Healthcare
  * Manufacturing
  * Government
- Topics unrelated to websites/CMS/design:
  * Product management
  * Data science / ML
  * DevOps / infrastructure
  * Mobile app development

WHEN POST IS OUTSIDE PATRICK'S EXPERTISE:
- Comment on ADJACENT aspects (e.g., if post is about sales, comment on website/marketing angle)
- Or: Skip commenting entirely (system can filter these)
- NEVER fake expertise to seem helpful
```

**Real-World Example:**

**Bad Draft:**
> "I teach my AEs to use these unselling techniques in demos. The key is creating space, not pressure. Prospects need to convince themselves, not be pushed. Which unselling tactic works best for your team?"

**Patrick's Feedback:**
> "I don't have AEs. I don't teach sales. I don't know anything about sales teams. This is completely outside my work."

**Good Draft (Fixed):**
> "This connects to how I design booking flows. When I removed pressure language from a client's demo page and added qualifying questions, their show-up rate increased 18%. The page did the unselling before the call started. What qualifier would you add to filter better leads?"

**What Changed:**
- Removed sales team reference entirely
- Connected to Patrick's ACTUAL expertise: website/booking page design
- Made it about web UX, not sales methodology
- Question now relates to web design, not sales tactics

---

## CATEGORIZATION WORKFLOW

**Step 1: Read Patrick's Feedback**

For each rated draft, look at the EVAL column note.

Example:
> "Draft fabricated 'fintech scaleup' story. Question doesn't relate to my comment. Too formal."

**Step 2: Identify Categories**

Tag each issue:
- **[FABRICATION]** "fintech scaleup story"
- **[STRUCTURE]** "Question doesn't relate to my comment"
- **[TONE]** "Too formal"

**Step 3: Log in Analysis Sheet**

Create simple tracking table:

| Post # | Rating | Fabrication | Tone | Structure | Authenticity | Topic Boundary |
|--------|--------|-------------|------|-----------|--------------|----------------|
| 1 | Bad | ✓ (fintech) | ✓ (formal) | ✓ (question mismatch) | | |
| 2 | Neutral | | ✓ (jargon) | | | |
| 3 | Bad | ✓ (sales team) | | | | ✓ (sales expertise) |

**Step 4: Count Frequency**

| Category | # of Issues | % of Bad/Neutral Drafts |
|----------|-------------|-------------------------|
| Fabrication | 8 | 53% |
| Tone | 6 | 40% |
| Structure | 5 | 33% |
| Authenticity | 3 | 20% |
| Topic Boundary | 4 | 27% |

**Step 5: Prioritize Fixes**

Address categories with highest frequency first:
1. Fabrication (53%) → Add strict NEVER rules
2. Tone (40%) → Add phrase dictionary
3. Structure (33%) → Clarify question logic
4. Topic Boundary (27%) → Define expertise boundaries
5. Authenticity (20%) → Add voice markers

**Step 6: Draft System Prompt Rules**

Use templates from this guide for each category.

---

## QUICK REFERENCE CHEAT SHEET

| Patrick Says... | Category | Likely Fix |
|----------------|----------|------------|
| "I don't work with [industry]" | Fabrication | Add industry to NEVER list |
| "I don't have [team/role]" | Fabrication + Topic Boundary | Remove team references |
| "Too formal" | Tone | Simplify language |
| "I don't say [phrase]" | Tone | Add to phrase avoid list |
| "Question relates to post, not my comment" | Structure | Fix question logic rule |
| "Too long" | Structure | Enforce sentence limit |
| "Sounds like AI" | Authenticity | Add Patrick's authentic patterns |
| "Missing my personality" | Authenticity | Add voice markers |
| "Not my expertise" | Topic Boundary | Define safe/unsafe topics |
| "This didn't happen" | Fabrication | Verify client stories |

---

## EXAMPLE: FULL CATEGORIZATION PROCESS

**Patrick's Feedback on Draft:**

> "The question is unrelated here. Match the question with the comment, not with the post. Also, I don't help clients with sales calls or scripts. That's not my work."

**Step 1: Identify Issues**

1. **[STRUCTURE]** "Question is unrelated... match with comment, not post"
2. **[TOPIC BOUNDARY]** "I don't help clients with sales calls or scripts"

**Step 2: Extract Rules**

**For STRUCTURE:**
```
CRITICAL: Question must relate to YOUR COMMENT's theme, not the original post.

Bad: Post about sales → Patrick comments on web design → Question asks about sales
Good: Post about sales → Patrick comments on web design → Question asks about web design
```

**For TOPIC BOUNDARY:**
```
NEVER reference:
- Helping clients with sales calls
- Writing sales scripts
- Sales coaching or methodology

Patrick's work = websites, CMS, design systems (not sales)
```

**Step 3: Add to V2 Prompt**

These rules go into the V2 system prompt under respective sections.

---

**END OF CATEGORIZATION GUIDE**

Use this guide alongside `INTERNAL_VOICE_TUNING_METHODOLOGY.md` Phase 2 for systematic analysis.
