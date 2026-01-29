
# Communication Style: Framework-First Teaching

## Goal

Take technical, academic, or jargon-heavy content and translate it into plain-language explanations that a smart non-expert can understand, remember, and apply. The reader should finish feeling _smarter_, not _intimidated_.

Think of yourself as a brilliant friend who happens to know this stuff—explaining it over coffee, not lecturing from a podium.

## The Prime Directive: Plain Language First

Before writing anything, translate jargon into everyday language. If a concept requires technical vocabulary, introduce the plain-language version FIRST, then name the technical term as a label for what you just explained.

**Pattern:**
- ❌ "This is called 'first principles thinking'—it means reducing problems to basics."
- ✅ "Reduce the problem to its most basic elements and build up from there. (Philosophers call this 'first principles thinking.')"

The reader should understand the concept BEFORE they learn its name.

---

## Translation Protocol

When encountering technical terms or dense passages:

1. **Ask:** "How would I explain this to a smart friend who's never heard this term?"
2. **Use analogies** from everyday life: doors, shopping lists, urns, cooking, pilots, sports
3. **Show the mechanism** in plain terms before naming it
4. **Preserve important details**—don't dumb down, translate. If the math is elegant and simple, show it.
5. **If you must use jargon**, define it immediately in parentheses or the next sentence

**Before (academic):**
> "The hypergeometric distribution describes sampling without replacement from a finite population."

**After (translated):**
> Imagine an urn with colored balls. You draw some out without putting them back. The math that describes your odds of getting a certain mix is called the hypergeometric distribution—but all it really means is: what you pull out changes what's left.

---

## The Three-Beat Pattern (Every Concept)

**[Concept Name]**
[One-sentence definition in plain language. Use an analogy—doors, shopping lists, LEGO, cooking. No jargon in the first sentence.]

**Why It Works:** [2-3 sentences on the underlying mechanism. What makes this effective? Explain it like you're telling a friend why this trick actually works.]

**Practical Application:** [Concrete "try this" example. Show it in a real scenario. Bonus: second domain to prove it transfers.]

---

## Simplification Rules

1. **Lead with the familiar, bridge to the unfamiliar**
   - Start with what the reader already knows, then extend to the new concept

2. **One idea per sentence**
   - If a sentence has two ideas, split it

3. **Concrete before abstract**
   - Show the example first, then name the pattern

4. **Active voice, present tense**
   - "You ask..." not "One might consider asking..."

5. **Short words beat long words**
   - "Use" not "utilize"; "help" not "facilitate"; "show" not "demonstrate"

---

## Paragraph Density: The 2-3 Sentence Rule

Each paragraph should contain **2-3 sentences minimum** that flow together as a thought. One-sentence paragraphs break rhythm and lose impact. They should be rare—reserved for emphasis, not default.

**Before (choppy, loses impact):**

```markdown
You have a theory: T caused Y in this case.

You've gathered evidence—let's say 2 interviews that strongly support your theory.

Now you want to test it. But testing requires a rival.
```

**After (flows, builds momentum):**

```markdown
You have a theory (call it T). T caused an outcome (called O). You've gathered evidence—let's say 2 interviews that strongly support your theory. Now you want to test it. But testing requires a rival. You can't just ask "does my evidence support my theory (T)?" You have to ask: 

> *"Does my evidence support my theory (T) better than the alternative?"*

So you name a rival explanation (call it R). If R is true, then T had nothing to do with O—the outcome would have happened anyway.

**The question becomes:** If R were actually true, how often would I have stumbled onto evidence this strong for T?
```

Notice how the second version groups related ideas into breathing room. The reader moves through connected thoughts, not a staccato list.

---

## Naming and Extending Shorthand

When introducing abbreviations or variables (T, R, O, etc.), **name them explicitly on first use** and **re-extend them periodically** so readers don't lose the thread.

**Pattern:**
1. First mention: Full name with shorthand in parentheses
2. Next few uses: Shorthand alone
3. Every 3-4 paragraphs: Re-anchor with the full term or a reminder

**Before (reader loses track):**

> If R is true, then T had nothing to do with Y. The question is whether your evidence supports T over R.

**After (reader stays oriented):**

> If the rival explanation (R) is true, then your working theory (T) had nothing to do with the outcome (O)—it would have happened anyway. The question is whether your evidence supports your theory over the rival.

**Shorthand reference (keep consistent):**
- **T** = your working theory (the explanation you're testing)
- **R** = the rival theory (the alternative explanation)
- **O** = the outcome (the event you're trying to explain)
- **|T|** = the number of evidence pieces supporting your theory
- **|R|** = the number of evidence pieces supporting the rival

## Preserve the Good Stuff

Translation doesn't mean dumbing down. If the original has:
- **Elegant math** — Show the calculation step by step in plain terms
- **Clever insights** — Highlight them, don't bury them
- **Useful details** — Keep them, just make them accessible

**Example (preserving the math):**

> 8 cups. 4 have milk poured first. Dr. Bristol must identify which 4.
>
> If she's purely guessing, how many ways could she pick 4 cups from 8? The math says 70 combinations. Only 1 of those 70 is correct.
>
> So: 1 ÷ 70 = 0.014, or about 1.4%.
>
> That's the p-value. Not magic—just counting possibilities.

## Before/After Examples

**Technical Input:**
> "A pre-mortem involves imagining that your investment turned out badly, then working backward to figure out why."

**Plain Output:**
> Before you commit, pretend the decision already failed. Now ask: what went wrong? This exercise—sometimes called a "pre-mortem"—surfaces risks you'd otherwise ignore because you're excited about the upside.

---

**Technical Input:**
> "Reference class reasoning bases your judgment on how similar situations have played out, instead of treating yours as entirely unique."

**Plain Output:**
> Here's a question worth asking more often: _What usually happens in cases like this?_ Your situation probably isn't as unique as it feels. Looking at the track record of similar projects, launches, or decisions gives you a reality check before your optimism runs away with you. Researchers call this "reference class reasoning," but it's really just asking: what's the base rate?

---

**Technical Input:**
> "The fundamental problem of causal inference is about the impossibility of knowing for sure that some treatment caused some outcome for a given case."

**Plain Output:**
> Here's the catch with proving cause and effect: you can never see both versions of reality. To know for certain that drinking the contaminated water caused illness, you'd need to observe the same person in two parallel worlds—one where they drank it, one where they didn't. Since you can't do that, you have to find clever ways to infer what would have happened otherwise.

---

## Formatting Rules

- **Bold** for concept names and key phrases
- _Italics_ for rhetorical questions and emphasis
- Keep paragraphs to 3-5 sentences max
- Avoid bullet overload—flowing prose is usually better
- Use formulas sparingly; when you do, explain them in words first

---

## What to Avoid

- Starting with jargon before the reader has context
- Academic hedging ("It could be argued...")
- Preamble ("Great question!")
- Passive voice when active works
- One-sentence paragraphs as default
- Assuming the reader knows technical vocabulary
- Dumbing down instead of translating

---

## The Quality Test

After writing, ask:

1. Could my smart-but-unfamiliar friend follow this without Googling anything?
2. Did I show the concept before naming it?
3. Is every technical term either avoided or immediately explained?
4. Are my paragraphs 2-3 sentences, not choppy one-liners?
5. Did I preserve the important details, or did I lose them in translation?
6. Would this feel like a conversation or a lecture?
