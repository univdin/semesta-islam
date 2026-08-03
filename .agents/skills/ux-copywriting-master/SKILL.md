---
name: ux-copywriting-master
description: >-
  Master UX writing and marketing copywriting skill. Formulates high-converting, accessible, human-centric UI microcopy (buttons, error messages, empty states, modals) and marketing text (hero headers, value propositions, CTAs) while enforcing anti-AI-slop rules, brand voice, and domain context from codebase documentation.
---

# UX Copywriting Master (`ux-copywriting-master`)

## Overview
`ux-copywriting-master` is a comprehensive skill for generating, auditing, and refining user interface microcopy and marketing copywriting. It distills best practices from industry-standard UX writing frameworks, anti-AI-slop principles, and conversion copywriting models into actionable agent directives.

## Dependencies & Skill Integration
When executing copy tasks, this skill dynamically orchestrates and aligns with:
- **`anti-ai-slop`**: Eliminates buzzwords ("delve", "game-changer", "seamless", "elevate", "cutting-edge", "unleash", "tapestry").
- **`brand-guidelines` / `efobiz`**: Enforces specific brand voice, tone, and terminology rules.
- **`ui-ux-pro-max`**: Aligns microcopy length, typography hierarchy, and UI state context with visual layouts.
- **`understand-codebase`**: Reads project domain documents (e.g. `docs/00_BRD.md`, `docs/01_BSD.md`, `docs/02_PRD.md`) to ensure domain terminology is 100% accurate.

---

## 1. UX Microcopy Framework

### Action Elements (Buttons / CTAs)
- **Principle**: Verb + Noun format. Be explicit about what happens next.
- **Bad**: *Submit*, *OK*, *Click Here*, *Learn More*
- **Good**: *Save Profile*, *Continue to Payment*, *Read Course Syllabus*, *Send Invitation*
- **Rule**: Max 3 words for primary buttons unless clarity requires 4.

### Error Messages & Form Validation
- **Principle**: Explain what happened, why it happened, and how to fix it immediately without blaming the user.
- **Bad**: *Invalid Input*, *Error 404*, *Something went wrong.*
- **Good**: *We couldn't verify your email address. Check for typos or request a new code below.*
- **Structure**:
  1. Problem statement (clear, non-technical).
  2. Next step / solution (actionable).

### Empty States & Onboarding
- **Principle**: Turn zero-data states into helpful starting points.
- **Structure**:
  1. **Title**: Direct & friendly status (e.g., *No saved classes yet*).
  2. **Body**: Value statement (e.g., *Bookmark classes you want to attend later*).
  3. **CTA**: Primary action (e.g., *Browse Available Classes*).

### Modals & Dialogs
- **Title**: Clear action/question (e.g., *Delete this course draft?*).
- **Body**: State consequences clearly (e.g., *This action cannot be undone. All lessons in this draft will be removed.*).
- **Buttons**: Match action to title (*Cancel* | *Delete Draft*). Avoid generic *Yes / No*.

---

## 2. Marketing & Conversion Copywriting

### High-Converting Copy Frameworks

#### AIDA (Attention, Interest, Desire, Action)
- Use for landing page hero sections and product announcements.

#### PAS (Problem, Agitate, Solve)
- Use for value proposition sections, feature intros, and solving user pain points.

#### BAB (Before, After, Bridge)
- Use for testimonials, case studies, and transformation-focused messaging.

### Hero Section Guidelines
1. **Headline**: Clear value proposition (what it is + who it's for + primary benefit) in ≤ 10 words.
2. **Subheadline**: Supporting detail addressing key hesitation or mechanism in ≤ 25 words.
3. **Primary CTA**: Direct action step (*Start Free Trial*, *Explore Programs*).
4. **Social Proof**: Micro-copy under CTA (*Join 10,000+ educators*).

---

## 3. Anti-AI-Slop Directives

### Banned Words & Phrases
Never use the following generic LLM clichés:
- ❌ *Delve into*, *Game-changer*, *Seamless integration*, *Elevate your experience*
- ❌ *Cutting-edge*, *Unleash*, *Tapestry*, *Beacon*, *Harness the power of*
- ❌ *In today's fast-paced world*, *Look no further*, *Supercharge*

### Human-Centric Replacement Standards
- Use active voice, simple verbs, and concrete nouns.
- Write like a thoughtful human subject-matter expert speaking to a peer.

---

## 4. Execution Workflow

When tasked with writing or reviewing copy:
1. **Check Domain Context**: Use `understand-codebase` or inspect project docs (`BRD`, `PRD`) to confirm target audience, tone, and terminology.
2. **Select Category**: Identify whether the request is **UX Microcopy** or **Marketing Copywriting**.
3. **Draft Options**: Provide 3 distinct variants:
   - Variant A: Direct & Concise (Minimalist)
   - Variant B: Warm & Encouraging (Conversational)
   - Variant C: Action-Oriented (Conversion-Focused)
4. **Audit Against Rules**: Ensure zero banned AI-slop words and verify accessibility/contrast/length constraints.
