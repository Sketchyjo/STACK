# Project Brief v1.2 – Web3 Funding + Brokered Stocks/ETFs

**Date:** Sept 23, 2025  
**Owner:** Analyst (Mary)  
**Vision Type:** Greenfield – Backend Service/API powering a bankless, social investing app  
**Delivery Target:** 3 weeks (MVP)

---

## 1) Product Vision & Value Proposition
A **bankless** investing platform where users fund with **USDC** from self‑custody wallets and invest in **U.S. stocks & ETFs** via a regulated broker (**DriveWealth**). Keep the experience **social**, **fun**, and **simple**, with **AI CFO personas** for explainers. **No crypto trading** in MVP; crypto is only a funding rail.

**Key Differentiators**
- **Stablecoin Funding (USDC)**: Start without bank accounts; deposit on supported chains.  
- **Stocks/ETFs Access**: Fractional and dollar‑based trades via DriveWealth after USDC→USD sweep.  
- **Community Investing**: Curated **Model Portfolios**, opt‑in copy (non‑discretionary), social feed.  
- **AI CFO Personas**: Plain‑language explanations and nudges.

---

## 2) Target Users & Use Cases
**Primary**: Crypto‑native retail users wanting equities exposure without legacy bank onboarding.  
**Use cases**: Deposit **USDC** → see **buying power** appear → buy into an **ETF** with $10; follow a curated **Model**; get CFO explainer.

---

## 3) MVP Scope
- **Wallet Funding (Web3)**: Accept **USDC** via **Circle Wallets**; **MVP chains**: **Aptos, Base, Polygon**; deposit address/QR; confirmation states.  
- **Treasury & Settlement**: **Redeem USDC→USD** (Circle/PSP), **sweep** to **DriveWealth** omnibus with user attribution; show ETA.  
- **Brokerage Trading**: **Stocks/ETFs only**; **dollar-based & fractional** orders; positions; documents.  
- **Models (Copy)**: Non‑discretionary **Model Portfolios** + **Auto‑Invest** schedules; explicit consents for rebalances.  
- **Social‑lite**: Profiles, follow, share, reactions (no DMs).  
- **AI CFO (V0)**: Persona selector; explainers (ETF/model, risk, costs).  
- **$1 minimum** enabled via dollar‑based orders.

---

## 4) Constraints & Integrations
- **Circle Wallets** (chains: Aptos/Base/Polygon for MVP; expandable).  
- **Circle Mint/Account** (or approved PSP) for **USDC redemption** to USD.  
- **DriveWealth** for KYC/Accounts/Orders/Docs; regional gating & disclosures.  
- **0G** for AI CFO & storage.  
- **Legal**: Non‑discretionary model flows; explicit rebalances consent; W‑9/W‑8BEN handling.

---

## 5) Success Metrics (MVP)
- ≥ 50% of USDC depositors place ≥1 stock/ETF order.  
- Median **deposit→buying power posted** ≤ **T+1**.  
- ≥ 30% of actives invest via **Model/Auto‑Invest**.  
- D7 retention ≥ 25%; <0.5% failed/unsupported deposits; 0 P0 security incidents.

---

## 6) High‑Level Architecture
Core: API Gateway, Wallet Service (Circle), Chain Listener, **Treasury & Settlement** (USDC→USD→DW sweep), Identity & KYC (DW), Brokerage Service (DW), Portfolio Service (Models/Auto‑Invest), AI CFO (0G), Social, Compliance, Notifications, Admin.  
Data: wallets/deposits, treasury conversions, broker transfers, DW users/accounts, orders/trades/positions, models, CFO sessions, posts.

---

## 7) Delivery Plan (3 Weeks)
- **Week 1**: Circle wallets & deposits; Treasury redemption sandbox; DW User/Account & disclosures; Models CRUD; AI CFO skeleton.  
- **Week 2**: Treasury sweep to DW; Orders (dollar‑based) & Positions; Auto‑Invest; Social‑lite; Documents retrieval.  
- **Week 3**: Hardening (reconciliation, idempotency, alerts), legal copy, allowlist beta; UAT with Circle & DW.

**Gate**: USDC deposit → USD redemption → DW posted funds → fractional/dollar-based order placed & filled → docs retrievable.

---

## 8) Open Questions
- Circle redemption eligibility & timelines; instant credit policy.  
- Regional gating for brokerage; tax forms (W‑9/W‑8BEN).  
- Model curator vetting; disclosure language.  
- Additional chains after MVP; Starknet via Cavos (gated).

