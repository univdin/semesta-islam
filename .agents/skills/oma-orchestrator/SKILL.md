---
name: oma-orchestrator
description: >-
  Oh My Antigravity (OmA) multi-agent team orchestrator. Coordinates roles (PM, Architect, UX Writer, QA Auditor, DevOps) and routes execution steps to appropriate skills and MCP tools.
---

# OmA Team Orchestrator (`oma-orchestrator`)

## Overview
`oma-orchestrator` coordinates multi-agent workflows across the 5 core OmA team personas defined in `.agents/AGENTS.md`.

## Persona Delegation Matrix

| Task Type | Lead Persona | Secondary Persona | Skills / Tools Triggered |
| :--- | :--- | :--- | :--- |
| Requirements & Scope | 🎯 Product Manager | 💻 Architect | `docs/00_BRD.md`, `docs/02_PRD.md` |
| UI/UX & Copywriting | 🎨 UX Writer | 🎯 Product Manager | `ux-copywriting-master`, `anti-ai-slop`, `ui-ux-pro-max` |
| Architecture & Data | 💻 Systems Architect | 🛡️ QA Auditor | `docs/01_BSD.md`, `docs/03_ERD.md`, `codegraph` |
| Compliance & Audit | 🛡️ QA Auditor | 🚀 DevOps Lead | `docs/05_MASTER_CONTEXT.md` |
| Dependency & OSS | 🚀 DevOps Lead | 💻 Systems Architect | `docs/04_OSS.md`, `docs/09_RESOURCE_REGISTRY.md` |

## Execution Directives
1. Always map requests to a primary OmA persona before executing.
2. Maintain strict authority chain: `BRD → BSD → PRD → ERD → OSS → UI → Implementation → Test`.
3. Require explicit human approval for any `BUSINESS DECISION REQUIRED` items.
