# Epics & Stories vFinal — Web3 USDC → DriveWealth (Baskets, Locks)

**Date:** Sept 23, 2025  
**Owner:** Product Owner (Sarah)  
**Aligned to:** PRD v1.3 · Architecture vFinal — Web3 USDC Funding → DriveWealth Stocks/ETFs (Baskets, Locks, Card Roadmap)

**Scope:** MVP enables **USDC web3 funding** (Circle wallets on Aptos/Base/Polygon) → **USDC→USD redemption & USD sweep to DriveWealth** → invest in **U.S. stocks & ETFs** (no crypto trading). First‑class **Curated & DIY baskets** and **Time‑Lock** (10% early exit fee). Includes **AI CFO** explainers and **Social‑lite**. Card (round‑ups, paycheck) is post‑MVP.

---

## Conventions
- **Story key format:** E<epic>#-<story#>, e.g., **E02‑011**  
- **Priority:** High / Medium / Low  
- **Estimate:** S=2, M=3‑5, L=5‑8 (dev days)  
- **Acceptance style:** Gherkin‑lite; include NFR + instrumentation for key paths  
- **Dependencies:** Upstream capabilities required before story can be worked

---

## Epic **E01 — Onboarding & KYC (DriveWealth)**
**Objective:** Compliant brokerage onboarding (KYC/CIP, disclosures) prior to trading.  
**Success:** ≥95% KYC pass in target geos; 100% disclosures captured.

- **E01‑001** KYC: Start DW user & CIP — **Priority High, Est M**  
  **Acceptance**  
  • Given I am authenticated  
  • When I submit PII (name, DOB, address, tax residency, TIN optional)  
  • Then a DriveWealth **user** is created with `status=pending` and I see required next steps
  **Instrumentation:** `kyc_started`, `kyc_submitted`  
  **Deps:** Auth service ready

- **E01‑002** Disclosures acceptance (W‑9/W‑8BEN, agreements) — **High, Est S**  
  **Acceptance**  
  • Given my KYC status is Pending/Review  
  • When I accept each disclosure  
  • Then acceptance is stored with **type, version, timestamp** and is immutable  
  **Deps:** Disclosure registry

- **E01‑003** Create brokerage account on **Approved** — **High, Est S**  
  **Acceptance**  
  • When DW webhook signals `approved`  
  • Then an **Account** is created and trading UI is unblocked  
  **Instrumentation:** `dw_account_created`

- **E01‑004** Gate trading until **Approved** — **High, Est S**  
  **Acceptance**  
  • If account != `Approved`, order requests return `account_not_approved`

---

## Epic **E02 — Wallet Funding (Circle – USDC deposits)**
**Objective:** Accept **native USDC** deposits on **Aptos/Base/Polygon** with confirmation and ledgering.  
**Success:** <0.5% failed/unsupported deposits; median deposit detection < 60s.

- **E02‑010** Generate deposit address/QR (per chain) — **High, Est S**  
  **Acceptance:** Supported chains listed; request returns address + QR; unsupported chains hidden.

- **E02‑011** Deposit state machine `pending→confirmed` — **High, Est M**  
  **Acceptance:** Webhook/indexer writes `deposit` with tx hash & amount; flips to `confirmed` after finality; funding view updates.

- **E02‑012** Flag unsupported/bridged deposits — **Medium, Est S**  
  **Acceptance:** Non‑native USDC or wrong chain → `unsupported` with recovery guidance; Ops alert.

- **E02‑013** Wallet set (unified EVM address) — **Medium, Est S**  
  **Acceptance:** Each user has stable EVM address used across EVM chains.

---

## Epic **E03 — Treasury & Settlement (USDC→USD→DW sweep)**
**Objective:** Convert confirmed deposits to USD and credit DW buying power accurately.  
**Success:** Median **deposit→posted** ≤ **T+1**; 0 unreconciled items after D+1.

- **E03‑020** Redeem USDC→USD (Circle/PSP) — **High, Est M**  
  **Acceptance:** `treasury_conversion` moves `initiated→settled` with timestamps; error states retried with backoff.

- **E03‑021** Sweep USD→DW omnibus — **High, Est M**  
  **Acceptance:** `broker_transfer` created; `postedAt` set on confirmation; **buying power** updated.

- **E03‑022** Reconciliation report & alerts — **High, Est M**  
  **Acceptance:** Daily report ties **deposit ↔ conversion ↔ sweep ↔ DW posting** per user; mismatches create alerts.

- **E03‑023** Instant credit flag (OFF by default) — **Medium, Est S**  
  **Acceptance:** Allowlist users may receive limited **provisional** buying power; negative balances are prevented.

---

## Epic **E04 — Brokerage Trading (Orders & Positions)**
**Objective:** Place **dollar‑based & fractional** orders and display holdings & cash.  
**Success:** ≥95% order success; positions reflect fills within SLA.

- **E04‑030** Dollar‑based buy order (ETF) — **High, Est M**  
  **Acceptance:** Validations (account approved, buying power); order submitted; fills update position.

- **E04‑031** Positions, balances, order history — **Medium, Est S**  
  **Acceptance:** Portfolio read endpoints return consistent snapshot (positions, buying power, PnL basics).

- **E04‑032** Cancel open limit order (if eligible) — **Low, Est S**  
  **Acceptance:** Eligible order cancels; status=`cancelled`.

---

## Epic **E05 — DIY Basket Builder**
**Objective:** Let users assemble multi‑ticker investments quickly.  
**Success:** ≥50% of first buys use baskets; avg 4–8 tickers per DIY.

- **E05‑040** Create equal‑weight DIY basket — **High, Est M**  
  **Acceptance:** Given ≥2 tickers and `$ amount`, system computes legs at `total/N`; fractional allowed; min per‑leg $1.

- **E05‑041** Custom % allocation — **High, Est M**  
  **Acceptance:** Percentages sum to 100; validation errors shown; saved recipe version.

- **E05‑042** Invest into DIY basket — **High, Est M**  
  **Acceptance:** Per‑leg orders placed; residual cash < $0.50 or rolled to largest leg; positions update.

- **E05‑043** Edit DIY basket & reinvest — **Medium, Est S**  
  **Acceptance:** New version saved; next invest uses latest weights.

---

## Epic **E06 — Curated Baskets (Experts)**
**Objective:** Offer expert‑maintained models with versioned weights & disclosures.  
**Success:** ≥30% follow at least one curated basket; rebalance consent rate ≥60%.

- **E06‑050** Invest & subscribe to curated basket — **High, Est M**  
  **Acceptance:** Invest `$ amount`; subscription stored (follow versions: on/off).

- **E06‑051** Rebalance consent flow — **High, Est S**  
  **Acceptance:** New **basket_version** diff shown; without consent no execution; on consent, deltas executed; audit stored.

- **E06‑052** Curator console — **Medium, Est M**  
  **Acceptance:** Publish versions (weights, notes, disclosures); preview diffs; schedule communications.

---

## Epic **E07 — Time‑Lock Program (10% Early Exit)**
**Objective:** Encourage discipline via optional lock on basket investments.  
**Success:** Lock take‑rate ≥10%; early‑unlock ≤20%.

- **E07‑060** Create lock agreement (30/90/180d) — **High, Est M**  
  **Acceptance:** Lock stored with start/end; sells on **locked slice** blocked pre `end_ts`.

- **E07‑061** Early unlock **fee quote** — **High, Est S**  
  **Acceptance:** Quote shows estimated proceeds, **fee=10%**, userReceives; must confirm disclosures.

- **E07‑062** Early unlock confirm & routing **90/10** — **High, Est M**  
  **Acceptance:** Liquidations executed; **90%** to user, **10%** to program treasury; receipts in `fee_ledger` and `audit_log`.

- **E07‑063** Lock dashboard — **Medium, Est S**  
  **Acceptance:** Active locks with remaining days; early‑unlock option; history of actions.

---

## Epic **E08 — AI CFO (0G) Explainability**
**Objective:** Persona‑based, plain‑language explainers for baskets & ETFs.  
**Success:** ≥50% of buyers read a CFO TL;DR before investing.

- **E08‑070** CFO persona query — **Medium, Est S**  
  **Acceptance:** Request with persona + topic returns TL;DR and link to long‑form (0G Storage); rate‑limited; logged.

- **E08‑071** Guardrails & disclaimers — **Medium, Est S**  
  **Acceptance:** “Education, not advice” banner; block unsupported prompts; redact PII.

---

## Epic **E09 — Social‑lite**
**Objective:** Lightweight social engagement without messaging.  
**Success:** ≥30% of actives follow ≥1 profile; low abuse rate.

- **E09‑080** Follow profiles & feed — **Low, Est S**  
  **Acceptance:** Follow edges create personalized feed (reverse‑chrono).

- **E09‑081** Post milestones & reactions — **Low, Est S**  
  **Acceptance:** Users can share basket buys/returns; reactions; moderation hooks.

---

## Epic **E10 — Observability & Reconciliation**
**Objective:** Detect issues quickly; ensure financial accuracy.  
**Success:** P90 deposit→posted within target; 0 unreconciled D+1 items.

- **E10‑090** Metrics dashboards — **High, Est S**  
  **Acceptance:** Dashboards for deposit→posted SLA, fills, locks, errors.

- **E10‑091** Alerts (redemption/sweep/legs) — **High, Est S**  
  **Acceptance:** Stuck redemption/sweep and failed basket legs trigger alerts.

- **E10‑092** Daily reconciliation job — **High, Est S**  
  **Acceptance:** Nightly job outputs CSV; mismatches flagged.

- **E10‑093** Runbooks & on‑call — **Medium, Est S**  
  **Acceptance:** Docs for unsupported deposits, stuck redemptions, failed legs, early‑unlock exceptions.

---

## Epic **E11 — Admin & Backoffice**
**Objective:** Operate the system safely.  
**Success:** Support resolves Tier‑1 issues within SLA.

- **E11‑100** Feature flags & expert roster — **Medium, Est S**  
  **Acceptance:** Toggle chains, locks, curated publish, instant credit; manage expert list.

- **E11‑101** Beta allowlist & user lookup — **Medium, Est S**  
  **Acceptance:** Only allowlisted users can trade; support can view profile + immutable audit log.

- **E11‑102** Fee ledger & reports — **Medium, Est S**  
  **Acceptance:** Export period fee revenue; tie to `fee_ledger` entries.

---

## Epic **E12 — Documents (Confirms, Statements, Tax)**
**Objective:** Provide regulatory docs access.  
**Success:** 100% docs retrievable for pilot cohort.

- **E12‑110** Trade confirmations — **Medium, Est S**  
  **Acceptance:** Links available within SLA; access logged.

- **E12‑111** Monthly statements — **Medium, Est S**  
  **Acceptance:** Statement links visible; retention met.

- **E12‑112** Tax documents (1099 / W‑8BEN adjacency) — **Medium, Est S**  
  **Acceptance:** When available, user can download; access logged.

---

## Epic **E13 — Market Data & Instruments**
**Objective:** Symbol search, quotes, ETF facts for planning.  
**Success:** 99% symbol match; quote latency acceptable.

- **E13‑120** Symbol search — **Medium, Est S**  
  **Acceptance:** Search by ticker/name; return instrument meta.

- **E13‑121** Basic quotes — **Medium, Est S**  
  **Acceptance:** Near‑real‑time bid/ask/last; cached.

- **E13‑122** ETF facts — **Low, Est S**  
  **Acceptance:** Show expense ratio and strategy summary.

---

## Epic **E14 — Optional Starknet Rail (Cavos)** *(Gated, non‑MVP)*
**Objective:** Add an optional Starknet deposit rail behind a feature flag.  

- **E14‑130** Enable Starknet deposits (Cavos) — **Low, Est M**  
  **Acceptance:** Admin can enable; deposit address shown; funds follow same treasury path.

---

## Epic **E15 — Card & Automations (Post‑MVP)**
**Objective:** Round‑ups & paycheck auto‑invest via card issuing.  

- **E15‑140** Link card — **Post‑MVP**  
- **E15‑141** Round‑ups accumulate & invest — **Post‑MVP**  
- **E15‑142** Paycheck rule on payday — **Post‑MVP**  
- **E15‑143** Controls: caps, pause, destination basket — **Post‑MVP**

---

## Cross‑Cutting Requirements
- **Compliance:** All trading/basket/lock actions require appropriate disclosures and explicit user consents; region gates enforced.  
- **Security & Privacy:** JWT/RBAC; KMS; PII encryption; least privilege; no secrets in logs.  
- **Performance:** Basket leg calc < 300ms; order submission < 1s (excl. broker latency); deposit detection < 60s.  
- **Reliability:** Idempotency on money movement & orders; retries with backoff; circuit breakers.  
- **Instrumentation (min):** `deposit_created/confirmed`, `treasury_redeem_initiated/settled`, `broker_sweep_initiated/posted`, `basket_invest_submitted/succeeded/failed`, `lock_created`, `early_unlock_quote/confirmed/settled`, `rebalance_consent_given`, `cfo_query`, `doc_available`.

---

## Sprint Slicing (MVP, 3 Weeks)
**Week 1 (Foundations):** E02‑010/011, E03‑020 (sandbox), E01‑001/002/003, E05‑040 skeleton, E10‑090 base  
**Week 2 (Trading & Baskets):** E03‑021, E04‑030/031, E05‑041/042, E06‑050, E12‑110, E10‑091/092  
**Week 3 (Locks & Hardening):** E07‑060/061/062/063, E06‑051, E11‑100/101, E10‑093; legal copy + allowlist beta

**Go/Gate:** USDC deposit → USD redemption → DW posted funds → **$‑based basket buy** filled → **early‑unlock with 10% fee** → documents retrievable; no P0s.

---

## Definition of Ready (DoR) / Definition of Done (DoD)
**DoR:** User value clear; acceptance criteria present; data impacts noted; dependencies mapped; test notes included.  
**DoD:** Code merged; tests pass; telemetry added; runbook updated; flags configured; acceptance verified in UAT; security review passed for high‑risk flows.

---

## Jira/Linear Import (CSV)
A Jira‑ready CSV covering these Epics & Stories lives in **PO Deliverables v1 – Jira CSV + Sprint 1 Plan**. Map columns: *Issue Type*, *Summary*, *Epic Name*/*Epic Link*, *Description*, *Acceptance Criteria*, *Labels*, *Components*, *Priority*, *Story Points*.

