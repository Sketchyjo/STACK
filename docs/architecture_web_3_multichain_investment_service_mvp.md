Architecture – Web3 Multichain Investment Service (MVP)

Date: Sept 23, 2025
Owner: Architect (Winston)
Scope: MVP architecture for a multichain, wallet-native investing service with Circle Wallet API, 0G AI/Storage, social features, copy investing, curated baskets, and time-lock vaults.

⸻

1. Context & Assumptions
	•	MVP Assets: Crypto only (curated baskets + individual tokens). Stocks/ETFs deferred (see §17 for DriveWealth path).
	•	Wallets & Transfers: Circle Wallet API for wallet provisioning, addresses, transfers, and reporting.
	•	Supported Chains (Circle Wallets): Aptos, Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon, Solana, Near, Unichain, and Other EVM chains (with some endpoint limitations). See §3.3 for capability matrix and notes.
	•	Starknet: Not covered by Circle Wallets; integrate via Cavos Wallet SDK/Service for Starknet accounts and gasless transactions (optional in MVP; see §3.12).
	•	AI & Storage: 0G AI SDK for CFO explainers + 0G Storage for LLM artifacts, UGC, basket metadata.
	•	Custody: Non‑custodial UX for users; on‑platform wallets managed via Circle Wallet API. Vault/time‑lock contracts are chain‑resident.
	•	Auth: Wallet-based auth (message signing) + optional email for notifications. No custodial PII beyond necessary KYC/AML gates.
	•	Deadline: 3 weeks → focus on essential components, guardrails, and observability.

⸻

2. High‑Level Architecture

[ Client Apps ]
   |   (REST/GraphQL)
   v
[ API Gateway ] --(OIDC/JWT)--> [ Auth Service ]
   |--> [ Wallet Service (Circle) ]----> Circle Wallet API
   |--> [ Chain Listener/Indexer ]-----> Aptos / Starknet nodes
   |--> [ Order Router ]---------------> Swap venues / internal MM (MVP: on‑chain DEX)
   |--> [ Strategy Engine ]
   |--> [ Ledger Service ]-----> Postgres (TXN) / Redis (cache)
   |--> [ Social Service ]-----> Postgres / 0G Storage
   |--> [ AI CFO Service ]-----> 0G AI SDK + 0G Storage
   |--> [ Compliance Service ]-> Screening / Rules
   |--> [ Notification svc ]---> Email/Push/Webhooks
   |--> [ Admin/Backoffice ]---> Ops UI, feature flags

[ Smart Contracts ]: Time‑Lock Vaults (per chain), Access Controls, Upgrade Proxy


⸻

3. Core Services (MVP)

3.1 API Gateway
	•	Responsibilities: Routing, rate limiting, request schema validation, token verification, API keys for internal tools.
	•	Interfaces: REST + (optional) GraphQL for read aggregation; OpenAPI spec v1.

3.2 Auth Service
	•	Wallet‑first auth (sign a challenge → JWT); session TTL 24h; device binding optional.
	•	Roles: user, expert, admin.

3.3 Wallet Service (Circle)
	•	Abstractions: createWallet(userId), getDepositAddress(chain), getBalance(), transfer(), listTransactions().
	•	Chains & Capabilities:
	•	Aptos, Arbitrum, Avalanche, Base, Ethereum, Optimism, Polygon, Near, Solana, Unichain, Other EVM chains.
	•	Note: On Aptos, contract-execution endpoints are limited (batch transfer function only). Plan DEX interaction primarily on EVM chains for MVP.
	•	Other EVM chains supported with reduced read features (balances/NFTs may be limited); use unified wallet addressing for EVM (one address across EVM chains where enabled).
	•	Webhooks: deposit confirmed, transfer settled, wallet events → enqueue to Reconciler.
	•	Safety: chain allowlist, native USDC only, memo/tag support if required.

3.4 Chain Listener / Indexer
	•	Track vault contract events (lock/unlock, penalty transfers), token transfers, and confirmations for on‑chain actions.
	•	Write‑behind to Ledger Service with idempotent upserts.

3.5 Ledger Service
	•	Off‑chain positions, PnL snapshots, deposit/withdraw records, copy links, strategy holdings.
	•	PostgreSQL with strict constraints; all writes via service layer; daily on‑chain anchors for auditability.

3.6 Order Router
	•	MVP: On‑chain swaps (per chain) with slippage controls; retry logic; gas/fee estimator.
	•	Abstract interface for future CEX or MM integration.

3.7 Strategy Engine (Curated Baskets & Copy)
	•	Versioned basket definitions (weights, assets, constraints, rebalance policy).
	•	Copy subscriptions with global/user caps (max allocation %, max daily change, drawdown halt).
	•	Emits Rebalance Plans consumed by Order Router.

3.8 AI CFO Service (0G)
	•	Persona registry (conservative, educator, growth‑focused…); per‑user default persona.
	•	Endpoints: POST /cfo/query {persona, prompt, portfolioContext} → calls 0G AI SDK; stores artifacts in 0G Storage.
	•	Guardrails: explanation tone, no individualized fiduciary advice, risk disclaimers.

3.9 Social Service
	•	Entities: Profile, Post (portfolio snapshot/insight), FollowEdge, Reaction.
	•	Feeds: simple reverse‑chronological per follow graph; rate limits + moderation hooks.

3.10 Compliance Service
	•	Wallet screening, sanctions lists, chain analytics provider hooks (pluggable).
	•	Policy engine (OPA or custom) for feature gating and disclosures.

3.11 Admin / Backoffice
	•	Feature flags, basket editor, expert roster management, incident dashboard, audit trails.

3.12 Starknet Wallet Adapter (Cavos)
	•	Purpose: Provide Starknet wallet creation, account abstraction, and gasless tx via Cavos where Circle is not supported.
	•	Interfaces: createStarkWallet(userId), starkTransfer(), starkContractCall(); abstracts Cavos Service SDK.
	•	Auth: org/user registration via Cavos; optional social login; align with platform JWT.
	•	Notes: Treat Starknet deposits as separate rails with explicit UX labels. Avoid bridged USDC in MVP unless risk-cleared.

3.13 Circle‑Supported Chains – Capability Matrix (MVP Focus)

Chain	Wallets (DCW/UCW)	Contract Execution	Sign Typed Data	Gas Station	Notes	Status
Aptos	✅ / ✅	Limited (batch transfer only)	—	✅	Use for deposits/transfers; keep DEX interactions on EVM.	MVP
Base (EVM)	✅ / ✅	✅	✅	✅	EVM-first swaps/DEX.	MVP
Polygon (EVM)	✅ / ✅	✅	✅	✅	EVM-first swaps/DEX.	MVP
Arbitrum (EVM)	✅ / ✅	✅	✅	✅	Next wave expansion.	Next
Ethereum (EVM)	✅ / ✅	✅	✅	✅	Gas costs higher; enable later.	Next
Optimism (EVM)	✅ / ✅	✅	✅	✅	Next wave expansion.	Next
Solana	✅ / —	—	—	✅	Non‑EVM signing model; separate backlog.	Future
Near	✅ / —	—	—	—	Only signing in DCW; plan later.	Future
Unichain (EVM)	✅ / ✅	✅	✅	✅	Emerging; evaluate liquidity.	Future
Other EVMs	✅ / ✅*	—	✅	—	Read features limited; EVM signing available.	Future

	•	With blockchain = EVM or EVM-TESTNET for signing across EVMs.

⸻

4. Data Model (MVP, key tables)
	•	user(id, wallet_pubkey, email?, role, created_at)
	•	wallet(id, user_id, circle_wallet_id, chain, address, status)
	•	stark_wallet(id, user_id, cavos_wallet_id, address, status)
	•	deposit(id, user_id, wallet_id, chain, tx_hash, amount, status, confirmed_at)
	•	portfolio(id, user_id, strategy_version_id?, name)
	•	basket(id, name, description, status)
	•	strategy_version(id, basket_id, weights_json, effective_at, metadata)
	•	position(id, portfolio_id, asset, qty, avg_price)
	•	copy_link(id, follower_id, expert_portfolio_id, caps_json, status)
	•	lock(id, user_id, amount, chain, start_ts, end_ts, penalty_pct, status)
	•	post(id, user_id, body, attachments_uri, created_at)
	•	follow_edge(src_user_id, dst_user_id, created_at)
	•	cfo_session(id, user_id, persona, prompt, output_uri, created_at)
	•	broker_account(id, user_id, broker, external_account_id, status, kyc_status)
	•	broker_position(id, broker_account_id, symbol, qty, avg_price)
	•	audit_log(id, actor, action, payload, created_at)

Redis caches: portfolio summaries, feed keys, price snapshots.

0G Storage: CFO prompts/outputs, long‑form posts, basket metadata exports, analytics dumps.

⸻

5. External Interfaces

5.1 Public REST Endpoints (MVP)
	•	POST /auth/challenge → message to sign
	•	POST /auth/verify → JWT
	•	POST /wallets/create
	•	POST /wallets/deposit-address {chain}
	•	GET /wallets/deposits?status=
	•	POST /orders (single or basket)
	•	POST /copy/{portfolioId}/subscribe
	•	POST /vaults/lock / POST /vaults/unlock
	•	GET /positions / GET /performance
	•	POST /social/follow / GET /feed
	•	POST /cfo/query {persona}

5.2 Webhooks / Events
	•	circle.wallet.deposit.confirmed
	•	circle.wallet.transfer.settled
	•	contract.vault.locked
	•	contract.vault.unlocked
	•	strategy.rebalance.plan
	•	cavos.wallet.event (optional if Starknet enabled)

⸻

6. Smart Contracts (per chain)
	•	Vault/Time‑Lock: lock(amount, duration), requestUnlock(), forceUnlock() with 10% penalty prior to end_ts (to treasury/insurance).
	•	Upgradeable via proxy with timelocked admin; pausable on incident.
	•	Safe math, reentrancy guard, thorough events for indexer.

⸻

7. Sequence Flows

7.1 Deposit
	1.	Client → API: POST /wallets/deposit-address{chain}
	2.	User transfers USDC → Circle wallet address
	3.	Circle webhook → Wallet Service → Ledger upsert (pending→confirmed)
	4.	Balance visible; eligible to invest.

7.2 Invest in Basket
	1.	Client selects basket + $ amount
	2.	API → Strategy Engine builds order legs
	3.	Order Router executes swaps on chain(s)
	4.	Ledger updates positions; portfolio snapshot written; feed post optional.

7.3 Copy Subscribe & Rebalance
	1.	Client → POST /copy/{portfolioId}/subscribe (caps)
	2.	Expert changes trigger strategy.rebalance.plan
	3.	Router batch‑executes deltas within caps
	4.	Ledger + notifications.

7.4 Time‑Lock with Penalty
	1.	Client → POST /vaults/lock
	2.	Contract mints lock receipt (event)
	3.	Early unlock → penalty transfer (10%) to treasury
	4.	Indexer records; Ledger adjusts balances.

7.5 AI CFO Query & Persona
	1.	Client chooses persona → POST /cfo/query
	2.	AI CFO Service: build prompt (portfolio context) → 0G AI SDK
	3.	Output stored to 0G Storage (URI returned)
	4.	Response with concise explainer + URI for full report.

⸻

8. Security & Privacy
	•	Auth: Signed messages → short‑lived JWT; rotate signing nonce.
	•	Scopes: Per‑endpoint RBAC; experts/admins gated.
	•	PII boundary: Keep PII minimal; encrypt at rest; segregate from chain data.
	•	Secrets: KMS/Secrets Manager; never log keys; strict egress policies.
	•	Contracts: External audit prior to enabling withdrawals; bug bounty.
	•	Abuse: Rate limits, WAF, spam/SEO filters on social.

⸻

9. Observability & Ops
	•	Metrics: deposit latency, conversion rate, swap success rate, copy execution lag, CFO query time.
	•	Logs: structured JSON; correlation IDs propagated.
	•	Traces: API→service→router spans.
	•	Alerts: deposit backlog, webhook failures, contract anomaly, CPU/mem.
	•	Runbooks: deposit stuck, rebalance fail, CFO degraded, contract pause.

⸻

10. Deployment & Infra
	•	Runtime: Containerized services on Kubernetes (or ECS); horizontal autoscaling.
	•	DB: Postgres HA; read replica for analytics; Redis managed.
	•	Storage: 0G Storage SDK; back‑pressure strategy.
	•	CI/CD: trunk‑based; canary deploy for API/Router; infra as code (Terraform).
	•	Secrets: cloud KMS; per‑env isolation; least privilege.
	•	External Services: Circle Wallets nodes & APIs; optional Cavos API; DriveWealth sandbox (post‑MVP).

⸻

11. Configuration & Feature Flags
	•	Chains allowlist, native‑asset validator, persona catalog, copy caps defaults, penalty pct, basket visibility, maintenance mode, incident kill‑switch.

⸻

12. MVP Cutlines & Phased Add‑Ons
	•	Keep: deposits, invest, copy, social‑lite, time‑lock, CFO explainers.
	•	Defer: fiat rails, advanced CFO automation, DMs, creator monetization, additional chains.

⸻

13. Risk Register (Top 10)
	1.	Copy‑invest regulatory exposure → stringent disclosures + caps.
	2.	Multichain UX complexity → restrict to 2–3 chains for MVP; excellent UX copy.
	3.	Router slippage/MEV → conservative slippage, tx simulation, fail‑fast.
	4.	Contract bugs → audit + pause switch.
	5.	Circle webhook outages → retry queues, backfill jobs.
	6.	Price feed hiccups → multi‑provider fallback; cache TTLs.
	7.	Persona advice misinterpretation → non‑advisory guardrails; link to risks.
	8.	Social abuse/spam → rate limits, moderation flags.
	9.	Data leakage → strict scoping, tokenized access to 0G URIs.
	10.	Broker integration & licensing (DriveWealth) → legal review, regional gating, phased rollout.

⸻

14. Open Questions
	•	Circle Wallet model: single wallet per user per chain vs. pooled + sub‑accounting?
	•	Treasury governance: where do penalties accrue; multisig policy?
	•	Expert vetting & revocation policy.
	•	Launch geographies and feature gating per region.
	•	Preferred DEX venues per chain for MVP.
	•	Starknet: scope & timing for Cavos integration; deposit/withdraw policy.

⸻

15. Implementation Plan Tie‑In (3 Weeks)
	•	Week 1: Wallet Service + deposits via Circle; Vault contract draft + indexer; Ledger core; 0G integration spike; endpoints skeleton.
	•	Week 2: Baskets/Copy/Router flows; Social‑lite; CFO persona selector end‑to‑end.
	•	Week 3: Hardening (audit fixes, load tests, alerts), legal copy, beta cut with allowlist.

⸻

16. API/Schema Appendices
	•	OpenAPI v1 stub (to be generated)
	•	DB migration DDL (init): users, wallets, stark_wallets, deposits, positions, baskets, strategy_versions, copy_links, locks, posts, follows, cfo_sessions, broker accounts, audit_log
	•	Event catalog & payload contracts (webhooks)

⸻

17. Stocks/ETFs Integration Path (Post‑MVP – DriveWealth)
	•	Broker: Evaluate DriveWealth for US equities & fractional support via REST APIs (sandbox/UAT available).
	•	Requirements: Full KYC/AML, account opening flows, disclosures, statements, tax docs.
	•	Architecture: Separate Broker Service managing broker_account, orders, positions; money movement via broker rails; segregated from crypto wallet flows.
	•	UX: Mark clearly as “Stocks (Brokered)” vs “Crypto (On‑chain)”.
	•	Compliance: Regional gating; surface required disclosures.

⸻

18. Reference Config & Environment
	•	CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET (if applicable)
	•	CIRCLE_WALLET_SET_ID (for unified EVM addressing)
	•	CIRCLE_BLOCKCHAINS_ENABLED = [“APTOS”,“BASE”,“MATIC”]
	•	RPC_BASE_URLS = { base: …, polygon: … }
	•	APTOS_NODE_URL = …
	•	CAVOS_API_URL, CAVOS_CLIENT_ID, CAVOS_CLIENT_SECRET (if Starknet enabled)
	•	OG_STORAGE_ENDPOINT, OG_API_KEY
	•	PRICE_FEEDS provider keys
	•	Region/feature flags for stocks (DriveWealth) and Starknet.

⸻

19. Errors & Status Codes (API)
	•	400 – validation_error (invalid chain, amount)
	•	401 – auth_required / invalid_signature
	•	403 – feature_gated (region, KYC)
	•	409 – duplicate_request (idempotency)
	•	422 – unsupported_asset / chain_not_enabled
	•	429 – rate_limited (respect Circle Wallets queue limits)
	•	500 – internal_error

Include x-request-id in all responses; propagate to logs & traces.