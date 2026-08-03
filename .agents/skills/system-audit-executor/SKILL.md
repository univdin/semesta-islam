---
name: system-audit-executor
description: >-
  Comprehensive production-readiness audit skill covering Security, UI/UX, SEO, and Agent Experiments. Prioritizes runtime evidence over documentation and executes safe fixes.
---

# System Audit Executor

## Overview
This skill operates as an Autonomous Production Readiness Audit & Experiment Agent. It executes a rigorous, evidence-based system audit prioritizing runtime reality over documentation. It covers the entire product surface including UI/UX, SEO/AEO/GEO, Information Architecture, and Security, without regressing the existing hardened internal economy. 

## Dependencies
- `understand-codebase`: For architecture mapping and resolving dependencies.
- `agentic-seo` (Optional Candidate): For SEO/AEO/GEO evaluation experiments.
- `ui-ux-pro-max` (Optional Candidate): For visual hierarchy and accessibility experiments.

## Quick Start
To trigger the full system audit, ask:
"Run the system-audit-executor across the entire product surface."

To focus on a specific domain initially, ask:
"Run the system-audit-executor focusing first on the Member Portal."

## Workflow

### 0. Role & Setup
- Act as an Autonomous Production Readiness Audit & Experiment Agent.
- **Goal:** DISCOVER → VERIFY → AUDIT → EXPERIMENT → IMPLEMENT SAFE FIXES → TEST → MEASURE → REPORT.
- Maintain existing tests (111/111 passing) and security baselines.

### 1. Establish Source-of-Truth Hierarchy
Before auditing, establish this hierarchy:
1. **Runtime reality** (Highest authority): Database state, browser behavior, actual HTTP responses.
2. **Source code**: Routes, schema, middleware.
3. **Tests**: Evidence of intended behavior.
4. **Current architecture/configuration**: `package.json`, `schema.prisma`.
5. **Documentation**: Only trust after verifying against Levels 1–4. Treat as claims.
6. **External references**: Use only where appropriate.

Distinguish findings explicitly as: `REPOSITORY FACT`, `RUNTIME EVIDENCE`, `TEST EVIDENCE`, `EXTERNAL REFERENCE`, or `AGENT INFERENCE`.

### 2. First Experiment — Document Trust Audit
- Verify every important MD/document against actual codebase and runtime.
- Classify claims as: `VERIFIED`, `PARTIALLY VERIFIED`, `STALE`, `CONTRADICTED`, `UNVERIFIED`, `NOT APPLICABLE`.
- **Rule:** If code contradicts documentation, report it. If documentation contradicts runtime, runtime wins.

### 3. Product Surface Discovery
- Discover the actual surface dynamically from `src/app/**`, `src/components/**`, `src/lib/**`, middlewares, API routes, sitemap.
- Produce an internal route graph.
- Classify every route (e.g., PUBLIC, AUTHENTICATED, API).
- Determine purpose, auth requirements, metadata, and silo for each route.

### 4. UI/UX Audit & Experiment
- Audit actual rendered interface (Visual hierarchy, interaction, responsiveness, accessibility).
- **Task-based experiments:** Run simulations (e.g., Member LOGIN → inspect activity → find action). Measure success, clicks, dead ends.

### 5. Information Architecture & Silo Audit
- Build the IA derived from the repository (not invented).
- Detect orphan pages, competing routes, and cross-silo leakage.
- Target: Important public pages ≤ 3 clicks from homepage (unless legit reason prevents it).

### 6. SEO, AEO, and GEO Audit
- **Technical SEO:** Check meta, robots, canonicals, 404s, Next.js metadata implementation.
- **Semantic SEO / AEO:** Verify clear search intent, extracted facts, clear relationships. Test prompts like "What is X?".
- **GEO (AI Discoverability):** Inspect JSON-LD, Schema.org. Ensure entities correspond to visible content.
- **Machine Access:** Check robots.txt, sitemap.xml, server rendering.

### 7. Performance Measurement
- Establish baselines (LCP, INP, CLS) using Lighthouse / DevTools before any optimization.

### 8. Security Full-System Audit
- Ensure 111/111 test baseline remains PASS. Any regression is a BLOCKER.
- Check authentication, IDOR, tenant isolation across all endpoints.
- Generate an API attack matrix evaluating cross-user, forged ID, and revoked delegation scenarios.

### 9. Agent Effectiveness Experiment
- **Methodology:** Run audits with baseline agent vs. specialized skill (e.g., `agentic-seo`, `ui-ux-pro-max`).
- Compare task completion, test coverage, token consumption, and hallucinations.
- Determine if the skill actually improves the repository's outcome.

### 10. Safe Implementation Policy & Terminology
- **Fixes:** Implement only when finding is verified, rollback is possible, and regressions are zero.
- **Prohibited:** Do not redesign UI entirely, replace auth, add fake SEO schema, or alter terminology (preserve terms like *Pendidik*, *Verifikasi Lajnah*, *Poin*).

### 11. Required Output Generation
Produce six specific matrices in the final `audit-report.md`:
A. SOURCE-OF-TRUTH AUDIT
B. PRODUCT SURFACE MAP
C. UI/UX AUDIT
D. SEO/AEO/GEO AUDIT
E. SECURITY AUDIT
F. AGENT EXPERIMENT RESULT
Conclude with a single decision: `PRODUCTION-READY`, `CONDITIONALLY PRODUCTION-READY`, or `NOT PRODUCTION-READY`, followed by a priority list of blockers/fixes.

## Rate Limiting
N/A. This skill primarily analyzes internal codebase and local runtime behavior. For any external API usage, respect 1 request per second unless documented otherwise.

## Common Mistakes
1. **Trusting MD files blindly:** Failing to verify documentation claims against the actual runtime.
2. **"Fixing" documentation silently:** Updating stale docs to match broken code instead of investigating the discrepancy.
3. **Overusing external skills:** Applying large external skills without measuring if they actually improve the codebase over the baseline agent.
