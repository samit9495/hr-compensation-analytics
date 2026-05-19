---
name: llm-council
description: "Run any question, idea, or decision through a council of 5 AI advisors who independently analyze it, peer-review each other anonymously, and synthesize a final verdict. Based on Karpathy's LLM Council methodology. MANDATORY TRIGGERS: 'council this', 'run the council', 'war room this', 'pressure-test this', 'stress-test this', 'debate this'. STRONG TRIGGERS (use when combined with a real decision or tradeoff): 'should I X or Y', 'which option', 'what would you do', 'is this the right move', 'validate this', 'get multiple perspectives', 'I can't decide', 'I'm torn between'. Do NOT trigger on simple yes/no questions, factual lookups, or casual 'should I' without a meaningful tradeoff."
---

# LLM Council

One perspective gives one answer. It might be great; it might be mid. The council fixes this by running a question through 5 independent advisors with fundamentally different thinking angles, peer-reviewing each other anonymously, then synthesizing a final verdict.

Adapted from Andrej Karpathy's LLM Council. We dispatch to multiple sub-agents with different thinking lenses, have them peer-review anonymously, then a chairman produces the final answer.

---

## When to Run the Council

The council is for questions where being wrong is expensive.

**Good council questions:**
- "Should I use raw SQL or the ORM for the average-by-country aggregation if the data grows to 1M rows?"
- "Should I store currency on the Employee or model it as a separate Salary entity over time?"
- "Should I generate the seed via `bulk_insert_mappings` or `insert(Model), [...]`? Both are fast — which is more maintainable?"
- "Should I store country as a free-text 2-letter code, or an ISO-3166 enum table, given the assessment scope?"
- "Is the right insight set min/max/avg by country and by job title, or should I include median and total headcount?"

**Bad council questions:**
- "What does `Session.scalar` do?" (factual lookup)
- "Write me an EmployeeForm" (creation task, not a decision)
- "Run the tests" (execution task, not judgment)

The council shines when there's genuine uncertainty and the cost of a bad call is high.

---

## The Five Advisors

Each advisor thinks from a different angle. They are thinking styles, not personas.

### 1. The Contrarian
Actively looks for what's wrong, what's missing, what will fail. Assumes the idea has a fatal flaw and tries to find it. Not a pessimist — the friend who saves you from a bad deal by asking the questions you're avoiding.

### 2. The First Principles Thinker
Ignores the surface-level question and asks "what are we actually trying to solve?" Strips away assumptions. Rebuilds the problem from the ground up. Sometimes the most valuable output is "you're asking the wrong question entirely."

### 3. The Expansionist
Looks for upside everyone else is missing. What could be bigger? What adjacent opportunity is hiding? Doesn't care about risk (that's the Contrarian's job). Cares about what happens if this works even better than expected.

### 4. The Outsider
Has zero context about the project, the domain, or the history. Responds purely to what's in front of them. Catches the curse of knowledge: things obvious to insiders but confusing to everyone else.

### 5. The Executor
Only cares about one thing: can this actually be done, and what's the fastest path? Ignores theory, strategy, and big-picture thinking. Looks at every idea through the lens of "what do you do Monday morning?" If an idea sounds brilliant but has no clear first step, the Executor will say so.

**Why these five:** They create three natural tensions. Contrarian vs Expansionist (downside vs upside). First Principles vs Executor (rethink everything vs just do it). The Outsider sits in the middle keeping everyone honest by seeing what fresh eyes see.

---

## How a Council Session Works

### Step 1: Frame the Question (with Incubyte Context Enrichment)

When the user triggers the council, do two things before framing:

**A. Scan the workspace for context.** Before framing, quickly read relevant context files:

- `AGENTS.md` — project overview, stack, conventions
- `tasks/lessons.md` — past mistakes and gotchas relevant to the decision
- `.cursor/rules/incubyte-project-map.mdc` — app anatomy (which modules, services, key files)
- `.cursor/rules/incubyte-fastapi-core.mdc` — architecture direction (layered, single-tenant, SQLite)
- `.cursor/rules/incubyte-craftsmanship.mdc` — the values the project optimizes for
- Any domain-specific rules/skills if the question targets a specific area (e.g., `incubyte-sql-safety.mdc` for DB decisions, `incubyte-testing.mdc` for test strategy decisions)
- Any files the user explicitly referenced or attached
- Previous council transcripts in `council/` directory (to avoid re-counciling the same ground)
- `artifacts/tradeoffs.md` — previous decisions already made

Use `Glob` and quick `Read` calls to find these. Don't spend more than 30 seconds. You're looking for the 2–3 files that would give advisors the context they need to give specific, grounded advice instead of generic takes.

**B. Frame the question.** Take the user's raw question AND the enriched context and reframe as a clear, neutral prompt that all five advisors will receive. The framed question should include:

1. The core decision or question
2. Key context from the user's message
3. Key context from workspace files (stack: FastAPI + SQLAlchemy 2 + Pydantic v2 + SQLite + React/Vite, single-tenant, architectural direction, relevant module structure, past lessons)
4. What's at stake (why this decision matters)

Don't add your own opinion. Don't steer it. But DO make sure each advisor has enough context to give a specific, grounded answer.

If the question is too vague, ask one clarifying question. Just one. Then proceed.

Save the framed question for the transcript.

### Step 2: Convene the Council (5 Sub-Agents in Parallel)

Spawn all 5 advisors simultaneously using 5 parallel `Task` tool calls with `subagent_type: "generalPurpose"`. Each gets:

1. Their advisor identity and thinking style (from the descriptions above)
2. The framed question
3. A clear instruction: respond independently. Do not hedge. Do not try to be balanced. Lean fully into your assigned perspective.

Each advisor should produce a response of 150–300 words.

**Sub-agent prompt template:**

```
You are [Advisor Name] on an LLM Council.

Your thinking style: [advisor description from above]

A user has brought this question to the council:

---
[framed question]
---

Respond from your perspective. Be direct and specific. Don't hedge or try to be balanced. Lean fully into your assigned angle. The other advisors will cover the angles you're not covering.

Keep your response between 150-300 words. No preamble. Go straight into your analysis.
```

### Step 3: Peer Review (5 Sub-Agents in Parallel)

This step makes the council more than "ask 5 times." It's the core of Karpathy's insight.

Collect all 5 advisor responses. Anonymize them as Response A through E (randomize which advisor maps to which letter so there's no positional bias).

Spawn 5 new sub-agents (parallel `Task` calls, `subagent_type: "generalPurpose"`). Each reviewer sees all 5 anonymized responses and answers three questions:

1. Which response is the strongest and why? (pick one)
2. Which response has the biggest blind spot and what is it?
3. What did ALL responses miss that the council should consider?

**Reviewer prompt template:**

```
You are reviewing the outputs of an LLM Council. Five advisors independently answered this question:

---
[framed question]
---

Here are their anonymized responses:

**Response A:**
[response]

**Response B:**
[response]

**Response C:**
[response]

**Response D:**
[response]

**Response E:**
[response]

Answer these three questions. Be specific. Reference responses by letter.

1. Which response is the strongest? Why?
2. Which response has the biggest blind spot? What is it missing?
3. What did ALL five responses miss that the council should consider?

Keep your review under 200 words. Be direct.
```

### Step 4: Chairman Synthesis

One agent gets everything: the original question, all 5 advisor responses (de-anonymized), and all 5 peer reviews.

Spawn 1 `Task` call with `subagent_type: "generalPurpose"`.

The chairman produces the final council output following this structure:

**COUNCIL VERDICT**

1. **Where the council agrees** — points multiple advisors converged on independently. High-confidence signals.
2. **Where the council clashes** — genuine disagreements. Don't smooth over. Present both sides and explain why reasonable advisors disagree.
3. **Blind spots the council caught** — things that only emerged through peer review. Things individual advisors missed that others flagged.
4. **The recommendation** — a clear, actionable recommendation. Not "it depends." A real answer. The chairman can disagree with the majority if reasoning supports it.
5. **The one thing you should do first** — a single concrete next step. Not a list of 10 things. One thing.

**Chairman prompt template:**

```
You are the Chairman of an LLM Council. Your job is to synthesize the work of 5 advisors and their peer reviews into a final verdict.

The question brought to the council:

---
[framed question]
---

ADVISOR RESPONSES:

**The Contrarian:**
[response]

**The First Principles Thinker:**
[response]

**The Expansionist:**
[response]

**The Outsider:**
[response]

**The Executor:**
[response]

PEER REVIEWS:

[all 5 peer reviews]

Produce the council verdict using this exact structure:

## Where the Council Agrees
[Points multiple advisors converged on independently. These are high-confidence signals.]

## Where the Council Clashes
[Genuine disagreements. Present both sides. Explain why reasonable advisors disagree.]

## Blind Spots the Council Caught
[Things that only emerged through peer review. Things individual advisors missed that others flagged.]

## The Recommendation
[A clear, direct recommendation. Not "it depends." A real answer with reasoning.]

## The One Thing to Do First
[A single concrete next step. Not a list. One thing.]

Be direct. Don't hedge. The whole point of the council is to give the user clarity they couldn't get from a single perspective.
```

### Step 5: Generate the Council Report

After the chairman synthesis is complete, generate a visual HTML report and save it to the workspace.

**File:** `council/council-report-[timestamp].html`

The report should be a single self-contained HTML file with inline CSS. Clean design, easy to scan. It should contain:

1. **The question** at the top
2. **The chairman's verdict** prominently displayed (this is what most people will read)
3. **An agreement/disagreement visual** — a simple visual showing which advisors aligned and which diverged (a grid, a spectrum, or a breakdown showing advisor positions). Keep it clean and scannable.
4. **Collapsible sections** for each advisor's full response (collapsed by default)
5. **Collapsible section** for the peer review highlights
6. **A footer** showing the timestamp and what was counciled

Use clean styling: white background, subtle borders, readable sans-serif font (system font stack), soft accent colors to distinguish advisor sections. Nothing flashy — professional briefing document.

Open the HTML file after generating it so the user can see it immediately.

### Step 6: Save the Full Transcript

Save the complete council transcript as `council/council-transcript-[timestamp].md` in the same location. This includes:

- The original question
- The framed question
- All 5 advisor responses
- All 5 peer reviews (with anonymization mapping revealed)
- The chairman's full synthesis

This transcript is the artifact. If the user wants to re-council after making changes, having the previous transcript lets them see how the thinking evolved.

---

## Output Files

Every council session produces two files:

```
council/council-report-[timestamp].html   # visual report for scanning
council/council-transcript-[timestamp].md  # full transcript for reference
```

The user sees the HTML report. The transcript is there if they want to dig deeper or reference specific advisor arguments later.

---

## Important Notes

- **Always spawn all 5 advisors in parallel.** Sequential spawning wastes time and lets earlier responses bleed into later ones.
- **Always anonymize for peer review.** If reviewers know which advisor said what, they'll defer to certain thinking styles instead of evaluating on merit.
- **The chairman can disagree with the majority.** If 4 out of 5 advisors say "do it" but the reasoning of the 1 dissenter is strongest, the chairman should side with the dissenter and explain why.
- **Don't council trivial questions.** If the user asks something with one right answer, just answer it. The council is for genuine uncertainty where multiple perspectives add value.
- **The visual report matters.** Most users will scan the report, not read the full transcript. Make the HTML output clean and scannable.

## See Also
- `AGENTS.md` — agent roles and project context scanned during framing
- `tasks/lessons.md` — past lessons scanned for relevant gotchas
- `.cursor/rules/incubyte-project-map.mdc` — module anatomy used for context enrichment
- `.cursor/rules/incubyte-fastapi-core.mdc` — architecture direction used for context enrichment
- `.cursor/rules/incubyte-craftsmanship.mdc` — values to weigh advisors' recommendations against
