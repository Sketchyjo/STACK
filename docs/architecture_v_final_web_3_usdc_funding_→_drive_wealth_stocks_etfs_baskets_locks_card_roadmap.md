# Architecture vFinal – Web3 USDC Funding → DriveWealth Stocks/ETFs (Baskets, Locks, Card Roadmap)

**Date:** Sept 23, 2025\
**Owner:** Architect (Winston)\
**Status:** Finalized MVP architecture (ready for build)\
**Audience:** Engineering, Product, Compliance, Ops

---

## 0) Executive Summary

We enable **bankless funding** via **USDC** on supported chains (Circle wallets), **redeem USDC→USD** and **sweep USD** to **DriveWealth** to post buying power, and invest in **U.S. stocks & ETFs** only (no crypto trading). Investment UX centers on **Curated & DIY Baskets** and an optional **Time‑Lock** program (**10% early exit fee**). **AI CFO** (0G) provides explainers; **Social‑lite** drives engagement. **Card issuing (round‑ups & paycheck)** is a **post‑MVP** roadmap.

---

## 1) Scope & Principles

- **Assets:** U.S. equities & ETFs via DriveWealth; **fractional & dollar‑based** orders where supported.
- **Funding:** **USDC‑only** deposits via Circle wallets on allowlisted chains (MVP: **Aptos, Base, Polygon**).\
  → **USDC→USD redemption** via Circle Account/Mint (or approved PSP) → **USD sweep to DriveWealth omnibus** with user attribution → **buying power**.
- **Baskets:** Expert **Curated** models (versioned) and **DIY** baskets (user‑selected tickers with equal‑weight/custom%).
- **Time‑Lock:** Optional lock per basket investment; **10% early unlock fee** (program fee) routed to treasury; region‑gated.
- **Compliance posture:** **Non‑discretionary** model investing; explicit user consents for rebalances and locks; AI CFO is **education**, not advice.

---

## 2) Supported Chains & Wallet Capability (Circle)

**MVP Deposit Chains:** **Aptos**, **Base (EVM)**, **Polygon (EVM)**\
**Next Waves:** Arbitrum, Optimism, Ethereum, Unichain; **Future:** Solana, Near.\
**Notes:**

- **Aptos:** prioritize deposits/transfers; keep complex interactions on EVM.
- **EVM:** unified EVM addressing via Wallet Set; strong tooling for indexers.
- **Native USDC only**; block/warn bridged or unsupported assets.

---

## 3) High‑Level System Architecture

```
[ Client Apps ]
   |  (REST/GraphQL + JWT)
   v
[ API Gateway ] — schema validation, rate limits, idempotency
   |--> [ Auth Service ] — email/OTP or OAuth
   |--> [ Wallet Service (Circle) ] — wallet set, deposit addrs, tx history
   |--> [ Chain Listener/Indexer ] — deposit finality, write-behind to Ledger
   |--> [ Treasury & Settlement ] — USDC→USD redemption; USD sweep → DW omnibus
   |--> [ Identity & KYC (DW) ] — DW user/KYC/disclosures; account open
   |--> [ Brokerage Service (DW) ] — orders/positions/documents
   |--> [ Basket Service ] — curated models + DIY recipes; subscriptions
   |--> [ Portfolio Planner ] — legs computation; min-lot; residuals
   |--> [ Lock Program Service ] — lock agreements; enforcement; fee routing
   |--> [ AI CFO Service (0G) ] — explainers; artifact storage
   |--> [ Social Service ] — profiles, posts, follows, reactions
   |--> [ Compliance Service ] — region gates, disclosures, audit trail
   |--> [ Notification Service ] — email/push/webhooks
   |--> [ Admin/Backoffice ] — model editor, expert roster, incidents, flags

[ External ]: Circle Wallets/Account • Bank rails • DriveWealth REST/UAT • Market Data • (Optional) Cavos Starknet
```

---

## 4) Core Services (MVP)

### 4.1 API Gateway

- Routing, JWT verification, schema validation, rate limiting, **idempotency keys** on money movement & orders.
- OpenAPI v0.1 published; request/response logging with `x-request-id`.

### 4.2 Auth Service

- Email/OTP or OAuth; optional wallet sign‑in for social identity; roles: **investor**, **expert**, **admin**.

### 4.3 Wallet Service (Circle)

- API surface: `createWalletSet(userId)`, `getDepositAddress(chain)`, `listDeposits(status)`.
- Webhooks: `wallet.deposit.confirmed`, `wallet.transfer.settled` → enqueue reconciliation.
- Validate token & chain; accept **native USDC only**.

### 4.4 Chain Listener / Indexer

- Poll/subscribe to deposits; confirm finality; upsert `deposit` with `pending→confirmed` state; record tx hash & amount.

### 4.5 Treasury & Settlement

- **USDC→USD Redemption**: initiate redemption (Circle or PSP); ledger `treasury_conversion` state: `initiated→settled`.
- **USD→Broker Sweep**: ACH/wire to DW omnibus with user memo/ref; ledger `broker_transfer` state: `initiated→posted`.
- **Instant credit:** off by default; feature‑flagged with limits.
- **Early Unlock routing:** receive liquidation cash from DW; route **90% user / 10% treasury**; audit all entries.

### 4.6 Identity & KYC (DriveWealth)

- Create DW User (KYC); collect disclosures (W‑9/W‑8BEN, customer agreements); upon Approval, create DW Account.

### 4.7 Brokerage Service (DriveWealth)

- **Orders:** market/limit; **dollar‑based** and **fractional** where instrument‑enabled.
- **Positions & Balances:** holdings, cost basis, buying power; **Documents:** confirms, statements, tax docs.

### 4.8 Basket Service (Curated & DIY)

- **Curated:** expert‑owned **Basket Recipes**; versioned weights; disclosures; publish **vN**.
- **DIY:** user selects tickers; allocation rules: `equal_weight`, `custom_percent` (cap: N ≤ 25).
- Subscriptions: follow curated basket updates; explicit **rebalance consent** required.

### 4.9 Portfolio Planner

- Compute order legs from `$ amount` & weights; enforce **min lot** (≥ \$1 per leg), fractional support, **residual** cash policy (<\$0.50 or roll‑up).
- Generate plan for rebalances; dry‑run mode for previews.

### 4.10 Lock Program Service (10% Early Exit)

- Create **lock agreement** per basket investment: `start_ts`, `end_ts`, `fee_pct=10%`.
- Enforce: block sells on **locked slice** before `end_ts`.
- Early unlock: produce **fee quote** (10% of net liquidation proceeds); on confirm, liquidate via DW and route **90/10**; audit trail.

### 4.11 AI CFO Service (0G)

- Personas: **Conservative**, **Educator**, **Growth**; context‑aware explainers; store long‑form in 0G Storage; non‑advisory guardrails.

### 4.12 Social Service

- Profiles, posts, follows, reactions; reverse‑chronological feed; moderation & abuse limits.

### 4.13 Compliance Service

- Region/age gates; disclosure acceptance registry; sanctions screening hook; immutable audit logs.

### 4.14 Admin / Backoffice

- Model & basket editors; expert roster; incident console; feature flags: chains, instant credit, locks, curated publish, Starknet rail.

---

## 5) Data Architecture (Logical)

**Relational (Postgres):**

- `user(id, email, role, created_at)`
- `kyc_profile(id, user_id, pii_json, status)`
- `disclosure_acceptance(id, user_id, type, version, accepted_at)`
- `wallet(id, user_id, circle_wallet_id, chain, address, status)`
- `deposit(id, user_id, wallet_id, chain, tx_hash, amount_usdc, status, confirmed_at)`
- `treasury_conversion(id, user_id, deposit_id, amount_usdc, usd_amount, status, initiated_at, settled_at)`
- `broker_transfer(id, user_id, dw_account_id, usd_amount, method, status, initiated_at, posted_at, reference)`
- `dw_user(id, user_id, external_id, kyc_status)`
- `dw_account(id, user_id, external_account_id, status, type)`
- `basket(id, type, owner_id, name, description, risk_label, status)`
- `basket_version(id, basket_id, weights_json, effective_at, notes)`
- `basket_subscription(id, user_id, basket_id, mode, caps_json)`
- `order(id, user_id, account_id, symbol, side, qty_type, qty_or_amt, tif, limit_price?, status, external_order_id, basket_id?, lock_id?)`
- `trade(id, order_id, fill_qty, fill_price, filled_at)`
- `position(id, account_id, symbol, qty, avg_price, market_value)`
- `lock_agreement(id, user_id, basket_id, allocated_value_usd, start_ts, end_ts, fee_pct)`
- `lock_position(id, lock_id, symbol, qty_allocated)`
- `early_unlock_request(id, lock_id, requested_at, confirmed_at, settled_at, fee_amount_usd)`
- `fee_ledger(id, user_id, source, amount_usd, tx_ref, created_at)`
- `auto_invest_plan(id, user_id, basket_id, schedule, amount, status)`
- `post(id, user_id, body, attachments_uri, created_at)`
- `follow_edge(src_user_id, dst_user_id, created_at)`
- `cfo_session(id, user_id, persona, prompt, output_uri, created_at)`
- `audit_log(id, actor, action, payload, created_at)`

**Caches (Redis):** portfolio summaries, price snapshots, feed keys, quote cache, fee quotes.

**Object Storage (0G):** AI CFO artifacts; long‑form posts; CSV exports (analytics, reconciliations).

---

## 6) API Surface (key endpoints)

- **Wallets:** `POST /wallets/create`, `POST /wallets/deposit-address {chain}`, `GET /wallets/deposits?status=`
- **Treasury:** `POST /treasury/redeem {depositId}`, `POST /treasury/transfer-broker`, `GET /treasury/activities`
- **Onboarding:** `POST /kyc/start`, `POST /disclosures/accept`, `POST /accounts`
- **Baskets:** `POST /baskets` (DIY), `GET /baskets/:id`, `POST /baskets/:id/invest`, `POST /baskets/:id/version`, `POST /baskets/:id/rebalance/confirm`
- **Locks:** `POST /locks`, `GET /locks/:id`, `POST /locks/:id/early-unlock/quote`, `POST /locks/:id/early-unlock/confirm`
- **Brokerage:** `POST /orders`, `GET /orders/:id`, `GET /positions`, `GET /balances`, `GET /documents/{type}`
- **AI CFO & Social:** `POST /cfo/query`, `POST /social/follow`, `GET /feed`

> Full schemas in **OpenAPI v0.1** (on canvas).

---

## 7) Sequence Flows

### 7.1 USDC Deposit → Buying Power at Broker

1. `POST /wallets/deposit-address{chain}`
2. User sends **USDC** → Circle address
3. Webhook/Indexer: `deposit: pending→confirmed`
4. Treasury: **redeem USDC→USD** → `treasury_conversion: initiated→settled`
5. Treasury: **sweep USD → DW omnibus** → `broker_transfer: initiated→posted`
6. Brokerage: buying power updated; user sees funds available

### 7.2 Invest in Basket (Curated/DIY)

1. User selects basket + `$ amount` (+ optional **lock**)
2. **Portfolio Planner** computes legs; validations (min lot, instrument support)
3. **Brokerage** places **dollar‑based** orders; track order IDs
4. Positions update; optional social post; lock records (if applied)

### 7.3 Curated Rebalance (Consent)

1. Curator publishes **basket\_version vN**
2. Notify subscribers with deltas
3. User **consents** → execute rebalance legs → audit consent

### 7.4 Lock Early‑Unlock (10% fee)

1. User requests early unlock → **quote** (fee = 10% of estimated proceeds)
2. On confirm, liquidate positions; Treasury routes **90% user / 10% treasury**
3. Close lock; post receipts to `fee_ledger` and `audit_log`

### 7.5 Auto‑Invest Schedule

1. Scheduler triggers
2. Check buying power; place basket legs; handle skips/alerts

---

## 8) Security, Privacy & Compliance

- **AuthN/Z:** JWT bearer; RBAC; device binding optional; short‑l
