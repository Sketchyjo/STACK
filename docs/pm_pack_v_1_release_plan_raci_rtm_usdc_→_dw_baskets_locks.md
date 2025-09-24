# PM Pack v1 — Release Plan, RACI & RTM (USDC → DW, Baskets & Locks)

**Date:** Sept 23, 2025  
**Owner:** Product Manager (John)  
**Scope:** MVP program plan for **USDC web3 funding → USD redemption & sweep → DriveWealth** with **Stocks/ETFs only**, **Curated & DIY baskets**, **Time‑Lock (10% fee)**, AI CFO, Social‑lite. Card (round‑ups, paycheck) is post‑MVP.

---

## 1) MVP Release Plan (3 Weeks)

### Week 1 — Foundations & Access (Owners in §2)
- Circle wallets (Aptos/Base/Polygon) deposit address/QR; webhook → deposit ledger (Pending→Confirmed)
- Treasury redemption **sandbox** path USDC→USD (mocked/partner UAT); state machine skeleton
- DriveWealth **User/KYC/Disclosures**; Account creation on Approved
- DIY Basket Builder (equal‑weight) stub; Curated Basket Recipe model
- AI CFO persona selector + prompt orchestration (0G) stub
- Observability skeleton (request IDs, error taxonomy, basic metrics)
**Exit/Gate:** Deposits confirmed end‑to‑end; DW KYC flow to Approved in UAT; DIY basket creates legs (dry‑run)

### Week 2 — Trading & Money Movement
- Treasury sweep USD → **DW omnibus** (UAT) with user attribution; buying power reflects posted funds
- Orders (market/limit; dollar‑based; fractionals where supported); Positions/Balances
- Basket invest (curated & DIY): execution engine (min‑lot, remainder rules)
- Lock Program: lock agreement & enforcement; block sells on locked slice
- Documents read (trade confirms, statements); Social‑lite v1
**Exit/Gate:** Deposit→Posted buying power path green in UAT; $‑based basket buy succeeds and reflects in positions; lock enforcement blocks premature sells

### Week 3 — Lock Early‑Unlock, Reconciliation, Beta
- Early‑unlock flow: **fee quote (10%) → confirm → liquidation → fee routing 90/10** via Treasury; audit trail
- Reconciliation: report tying **deposit ↔ redemption ↔ sweep ↔ DW posting ↔ fee**; alerting on mismatches
- Legal copy: basket disclosures, lock agreement, rebalances consent; region gatings
- Runbooks & on‑call; dashboards for SLA & failure modes
- Allowlist **Beta** enablement; data review checklist
**Exit/Gate:** Go/No‑Go checklist (§5) satisfied; no P0s; pilot cohort ready

---

## 2) RACI (Key Streams)

| Stream | R | A | C | I |
|---|---|---|---|---|
| Circle Wallets (deposit flow) | Backend Eng | Architect | PM, DevOps | Ops |
| Treasury: USDC→USD redemption | Treasury Ops | PM | Architect, Compliance | Broker Liaison |
| Treasury: USD→DW sweep | Treasury Ops | PM | DevOps, Broker Liaison | Finance |
| DW KYC/Account/Docs | Backend Eng | PM | Compliance, UX | Ops |
| Orders/Positions (DW) | Backend Eng | Architect | PM, QA | Ops |
| DIY/Curated Baskets | Backend Eng | PM | Architect, UX | QA |
| Lock Program (10% fee) | Backend Eng | PM | Compliance, Finance | Ops |
| AI CFO (0G) | Backend Eng | PM | Architect | QA |
| Social‑lite | Backend Eng | PM | UX | QA |
| Observability & Reconciliation | DevOps | Architect | PM | Ops |
| Legal/Disclosures/Region gates | Compliance | PM | Legal Counsel | All |
| Beta & Comms | PM | PM | Support, Ops | All |

> R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 3) Requirements Traceability Matrix (RTM)

| PRD § | Requirement | Architecture Component | Epic/Story |
|---|---|---|---|
| 4.1 | USDC deposit (Aptos/Base/Polygon), states | Wallet Service (Circle), Chain Listener | Epic 02 US‑010/011 |
| 4.1 | Redemption & sweep to DW | Treasury & Settlement | Epic 03 US‑020/021/022 |
| 4.2 | Curated & DIY baskets | Basket Service, Portfolio Planner | Epic B1/B2 |
| 4.3 | Time‑Lock (10% early exit) | Lock Program Service, Treasury fee routing | Epic L1 (001–003) |
| 4.4 | DW trading (fractional/$) | Brokerage Service (DW) | Epic 04 US‑030/031/032 |
| 4.5 | AI CFO personas | AI CFO Service (0G) | Epic 06 US‑050 |
| 4.5 | Social‑lite | Social Service | Epic 07 US‑060/061 |
| 5 | Non‑functional (perf, obs) | Observability, Reconciliation jobs | Epic 09 |

---

## 4) Risks, Mitigations & Owners

1. **Settlement timing** (USDC→USD→DW) — *Owner: Treasury Ops*  
   Mitigate: clear ETAs, only credit after DW posting; retries/backoff; reconciliation alerts
2. **Lock fee compliance** — *Owner: Compliance*  
   Mitigate: region gates; legal review; explicit user consents; fee ledger audit
3. **Curated liability** — *Owner: PM/Compliance*  
   Mitigate: content classification as non‑advisory models; caps; disclosures
4. **Unsupported deposits** — *Owner: Backend Eng*  
   Mitigate: strict allowlist; token detection; recovery guidance
5. **UAT dependencies (DW/Circle)** — *Owner: Broker Liaison*  
   Mitigate: parallel sandbox access; contingency PSP; dry‑run modes

---

## 5) Go/No‑Go Checklist (MVP Beta)

**Technical**  
☐ Deposit→Posted buying power green (sample users)  
☐ Basket invest ($‑based) fills and positions match planner  
☐ Lock early‑unlock fee routing 90/10 verified  
☐ Dashboards + alerts live; runbooks exercised

**Compliance/Legal**  
☐ Disclosures (trading, curated models, lock terms) in app  
☐ Region gating applied  
☐ KYC/Docs retrieval working

**Ops/Support**  
☐ Reconciliation daily report  
☐ Support playbooks (unsupported deposit, stuck redemption, early unlock)  
☐ Allowlist + incident comms ready

---

## 6) Communications Plan (Beta)
- **Cadence:** Daily Slack stand‑ups; 3x weekly exec check‑ins; Beta status digest Fri 5pm.  
- **User comms:** In‑app notices (deposit ETAs, lock fee disclosures); email confirm for rebalances/locks; incident banner toggle.  
- **Partners:** Weekly DW + Circle UAT sync; shared punchlist.

---

## 7) KPI Dashboard Spec (MVP)
- **Activation:** median time *deposit→posted* (target ≤ T+1); P50/P90  
- **Adoption:** % funded users buying baskets; curated vs DIY split  
- **Habit:** auto‑invest enable %, **lock take‑rate**, **early‑unlock rate**  
- **Financials:** fee revenue (program), residual cash per basket order  
- **Reliability:** redemption failures, sweep failures, webhook error rate  
- **Compliance:** disclosure acceptance coverage; blocked region events

**Event Instrumentation (min set):** `deposit_created/confirmed`, `treasury_redeem_initiated/settled`, `broker_sweep_initiated/posted`, `basket_invest_submitted/succeeded/failed`, `lock_created`, `early_unlock_quote/confirmed/settled`, `rebalance_consent_given`, `cfo_query`, `doc_available`.

---

## 8) Decision Log (current)
- MVP chains: **Aptos, Base, Polygon**  
- Investing universe: **U.S. stocks & ETFs only** (DriveWealth)  
- Baskets: **Curated + DIY** (equal‑weight, custom%; mkt‑cap later)  
- Lock: **10% early exit**; non‑discretionary; region‑gated  
- Card: **Post‑MVP**; round‑ups first

---

## 9) Next Actions
1. Generate **OpenAPI stubs** for `/baskets` + `/locks` + treasury endpoints.  
2. Export **Jira/Linear CSV** from Epics & Stories v1.1.  
3. Draft **legal copy pack** (disclosures for curated/DIY & lock program).  
4. Build **UAT test plan** (DW & Circle) with sample data and pass/fail gates.

