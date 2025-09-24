# Analyst Mega‑Brief – USDC Funding → DriveWealth Stocks/ETFs (Baskets, Locks, Card Roadmap)

**Date:** Sept 23, 2025  
**Owner:** Analyst (Mary)  
**Audience:** PM, Architecture, PO, Legal/Compliance, Ops  
**Scope:** Consolidated brief covering competitive/regulatory scan, user research plan, messaging, metrics, and chain/treasury risks for the MVP: **USDC web3 funding → USD redemption & sweep to DriveWealth → stocks/ETFs only**, with **Curated & DIY baskets**, **Time‑Lock (10% early exit fee)**, and **Card (round‑ups, paycheck)** as **post‑MVP**.

---

## 1) Executive Summary (TL;DR)
- **Who we serve:** Crypto‑native and bank‑un/der‑banked users who want fast equity/ETF exposure without traditional bank onboarding.  
- **What’s new:** **Bankless funding** via USDC on supported chains; **curated & DIY baskets** to simplify choice; **optional Time‑Lock** to build discipline; light **social + AI CFO personas** to explain complex concepts in plain language.  
- **Why we win:** Faster activation (wallet → deposit → buying power), simpler choices (baskets), social trust (curated models), and transparent rules (non‑discretionary, consented rebalances; clear lock fee).  
- **Biggest risks:** Settlement timing (USDC→USD→broker), regulatory posture for lock fees and model portfolios, and reconciliation complexity.

---

## 2) Competitive & Regulatory Scan (Focused)

### 2.1 Competitive Set (selected)
- **Acorns / Revolut / Cash App** — Round‑ups and auto‑invest; fiat‑first; strong habit loops.  
- **M1 Finance / Wealthfront** — Model portfolios, auto‑invest, recurring deposits; discretionary or managed in parts; bank rails.  
- **Public / Robinhood** — Fractionals, social feed; fiat bank funding; education content.  
- **eToro (non‑US copy)** — Social copy‑trading; regulatory posture varies by region; in US constrained.  
- **Crypto on‑ramps (CEX/DeFi)** — Some offer tokenized equities (regulatory grey). We avoid this; we’re **broker‑native** via DriveWealth.

**Positioning gap to exploit:** **USDC → equities** with curated/DIY baskets + optional lock; transparent, **non‑discretionary** user consent for changes; **no bank account required** to start.

### 2.2 Regulatory Posture (working summary; not legal advice)
- **Model/Copy investing:** Treat curated/DIY baskets as **non‑discretionary models**. User **explicitly consents** to each rebalance execution (or invests one‑shot). Provide clear disclosures, performance caveats, and caps/limits.  
- **Time‑Lock (10% early exit):** Implement as a **program fee** applied by our **treasury sweep** upon early liquidation of the locked slice (not a broker fee). Region‑gate feature; surface fee quote & disclosures before consent.  
- **USDC funding:** Accept only **native USDC on allowlisted chains**; warn/block bridged or unsupported assets. Redemption provider and omnibus banking must be KYC’d/approved.  
- **KYC/AML:** Full brokerage KYC/CIP via DriveWealth; additional wallet analytics/sanctions screening if required; audit trail for all consents.  
- **Comms/Marketing:** Avoid implying guaranteed returns; no personalized fiduciary advice; AI CFO outputs are **education, not advice**.

---

## 3) User Research Plan (lean but decisive)

### 3.1 Hypotheses to test
1. **Activation:** Users with USDC can fund faster than with traditional bank rails.  
2. **Choice overload:** **Baskets** reduce paralysis vs. picking single stocks.  
3. **Lock program:** A subset values commitment mechanics; fee comprehension is the blocker.  
4. **Trust:** Social proof (curated by experts) + **AI CFO explainers** increases confidence.  
5. **DIY builder:** Equal‑weight default feels “fair/easy”; custom% needed by power users.

### 3.2 Target segments
- **Seg‑A:** Crypto‑native users with on‑chain USDC.  
- **Seg‑B:** New‑to‑equities but web3‑curious users.  
- **Seg‑C:** Experienced investors wanting simple set‑and‑forget models.

### 3.3 Methods & timeline (2‑week sprint)
- **Day 1–2:** 10x **discovery interviews** (remote) — funding habits, basket comprehension, fee sensitivity.  
- **Day 3–7:** **Usability tests** with mid‑fi flows (Figma/Prototype):  
  - USDC deposit (address/QR → pending → confirmed) and **ETA** comprehension.  
  - **Curated basket invest** ($ amount → legs preview).  
  - **DIY basket builder** (equal‑weight → edit to custom%).  
  - **Lock flow** (duration pick → early unlock **fee quote** → consent).  
  - **Rebalance consent** for curated basket update.  
  - **CFO persona** explainer tasks (“Explain this ETF like I’m new”).  
- **Day 8–10:** Synthesize findings; update copy & acceptance criteria.

### 3.4 Key research questions
- Do users understand **USDC→USD→broker** steps and timing?  
- Do baskets lower the perceived effort to get started?  
- Is **10% early exit** understood and considered fair? What lock durations resonate?  
- Which **CFO persona** builds most trust? (Conservative vs Educator vs Growth.)  
- What’s the acceptable **residual cash** after basket execution?

### 3.5 Success signals
- ≥80% task success for **deposit → first basket buy** in under 10 minutes (prototype).  
- ≥70% comprehension on **lock fee quote** quiz.  
- ≥60% preference for **baskets** over single‑stock first buys.

---

## 4) Messaging & Positioning Grid

| Audience | Problem | Value Prop | Proof/Features | Tone/Voice |
|---|---|---|---|---|
| Crypto‑native | Bank rails slow & KYC friction | **Fund with USDC, invest in stocks today** | Circle wallets; deposit states; redemption & sweep to broker | Direct, fast, credible |
| New investor | Too many choices; jargon | **One‑tap baskets, explained by an AI CFO** | Curated & DIY baskets; plain‑language explainers | Friendly, simple |
| Habit builder | Hard to stay consistent | **Lock it in & automate** | Time‑Lock (10% early exit), Auto‑Invest schedules | Supportive, transparent |
| Social learner | Wants examples & social proof | **Follow expert baskets (your choice to rebalance)** | Non‑discretionary models; consented rebalances | Empowering, honest |

**Tagline candidates:** “Fund with USDC. Own real stocks.” / “Baskets, not guesswork.” / “Invest simply, stay committed.”

---

## 5) Metrics Map (Activation → Habit → Trust)

### 5.1 North Star & Primary
- **NSM:** Count of users who **deposit USDC and execute a first basket order within 24h**.  
- **Activation:** Time **deposit→posted buying power** (median; target ≤ **T+1**).  
- **Adoption:** % of funded users investing via **baskets** (curated + DIY).  
- **Habit:** **Auto‑invest** enabled rate; **Lock** take‑rate.

### 5.2 Supporting Metrics
- **DIY usage:** avg tickers per basket; share of equal‑weight vs custom% baskets.  
- **Curated:** follow rate; rebalance consent rate; time‑to‑consent.  
- **Lock:** early‑unlock rate and reasons; **fee revenue** (program) and NPS impact.  
- **CFO:** explainer CTR; persona selection mix; repeated usage.  
- **Ops:** reconciliation success; stuck redemption/sweep incidents; webhook reliability.

### 5.3 Guardrails
- Failed/unsupported deposits < **0.5%**; **0 P0** security incidents; complaints per 1k users; disclosure acceptance coverage 100% for trading, locks, rebalances.

---

## 6) Chain & Treasury Risk Brief (USDC → USD → Broker)

### 6.1 On‑chain
- **Accept native USDC only** on **Aptos, Base, Polygon** (MVP).  
- Finality & chain events drive **deposit confirmed**; clear UI for pending vs confirmed.  
- **Unsupported/bridged** tokens: block or warn with recovery guidance; incident runbook.

### 6.2 Redemption & Banking
- **Redemption path:** USDC→USD via Circle Mint/Account (or approved PSP).  
- **Treasury sweeps:** USD → **DriveWealth omnibus** via ACH/wire with **user attribution**; maintain cut‑through refs.  
- **State machine & reconciliation:** `deposit` ↔ `treasury_conversion` ↔ `broker_transfer` ↔ **DW posting**.  
- **ETAs:** Communicate T+0/T+1; keep **instant credit** behind a flag with tight limits.

### 6.3 Program Fees & Locks
- **Fee handling:** On early unlock, **90% to user / 10% to program treasury** via sweep; audit logs; region gating.  
- **Disclosures:** Lock agreement + pre‑trade warnings; jurisdictional review.  
- **Edge cases:** Corporate actions within locked holdings; account restrictions; failed sell legs.

### 6.4 Compliance & Privacy
- **Broker KYC/CIP** mandatory; disclosures registry; sanctions screening if required; data minimization & encryption; access control; retention policies.

---

## 7) Recommendations & Decisions Needed
1. **MVP chain set**: Keep **Aptos, Base, Polygon**; confirm if adding Arbitrum in wave‑2.  
2. **Instant credit**: Default **OFF**; enable for allowlisted users post telemetry.  
3. **Lock durations**: Offer **30/90/180 days** presets; fee fixed at **10%** MVP.  
4. **DIY limits**: cap **N ≤ 25** tickers; min per‑leg **$1**; residual cash ≤ $0.50 (or roll‑up).  
5. **CFO personas**: Launch with **Conservative, Educator, Growth**; collect feedback for tuning.  
6. **Card roadmap**: Prioritize **round‑ups** first; shortlist issuer‑processors; begin compliance scoping.

---

## 8) Research Artefacts & Next Steps
- **Prototypes**: Deposit flow, DIY builder, curated invest, lock + early‑unlock, rebalance consent, CFO explainers.  
- **Interview guide & screeners**: USDC holders; target geos aligned with brokerage.  
- **Pilot metrics**: Daily dashboards for deposit→posted SLA, basket adoption, lock take‑rate, early‑unlock reasons.  
- **Legal review pack**: Model vs advice, lock fee, disclosures language.

