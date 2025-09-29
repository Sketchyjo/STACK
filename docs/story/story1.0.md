## User Story (Backend): Managed Wallets on Sign-Up (Aptos, Solana, EVM via Turnkey)

As a new STACK user,  
I want my chain wallets (Aptos, Solana, EVM) to be created and managed automatically during onboarding,  
so that I can start funding and investing without seed phrases or crypto complexity.

---

## Outcome / Value
- Users complete onboarding with custody abstracted wallets on Aptos, Solana, and EVM, provisioned via Turnkey.  
- Backend exposes a clean API: issue session → perform KYC → provision wallets → persist metadata → return onboarding status.

## Notes on Turnkey capabilities we rely on
- Supports Aptos (ed25519, address derivation + signing).  
- Supports Solana (SVM) with ed25519, address derivation, and SDK signer.  
- Supports EVM (all L1/L2) with ADDRESS_TYPE_ETHEREUM.  
- Network model is curve-centric (ed25519 & secp256k1) enabling broad chain coverage including EVM & SVM.  
- API activities to create wallets / wallet accounts programmatically.  

---

## Scope (This Story)
- Backend services & integrations only: Onboarding Service, Wallet Service, KYC provider, Turnkey API.  
- Chains: Aptos, Solana, EVM (single EVM address usable across EVM L1/L2 per Turnkey’s ETH address type).  
- Persist all wallet metadata and link to users in Postgres.  
- Idempotent wallet provisioning (safe re-run).  
- Feature flags to toggle each chain independently.  

## Out of Scope
- Frontend UI flows, push/email comms.  
- Funding/Deposit listeners, gas abstraction, and trading (covered by other epics/stories).  
- Social/gamified features.  

---

## API Contract (proposed)

### POST /onboarding/start
Kick off onboarding; returns session + KYC token (if needed).  
- Request: `{ emailOrPhone, referralCode? }`  
- Response: `{ userId, onboardingStatus: "KYC_PENDING" | "KYC_PASSED" | "KYC_FAILED", sessionJwt }`  

### POST /onboarding/kyc/callback (provider webhook)
- Validates provider signature → updates `users.kyc_status`.  

### POST /wallets/provision
Creates (if missing) chain wallet accounts for the user via Turnkey.  
- Auth: user JWT  
- Request: `{ chains?: ["aptos","solana","evm"] }` (defaults to all enabled)  
- Response:
```json
{
  "userId": "u_123",
  "wallets": {
    "aptos": { "address": "...", "turnkey": { "walletId": "...", "accountId": "...", "addressType": "ADDRESS_TYPE_APTOS" } },
    "solana": { "address": "...", "turnkey": { "walletId": "...", "accountId": "...", "addressType": "ADDRESS_TYPE_SOLANA" } },
    "evm": { "address": "0x...", "turnkey": { "walletId": "...", "accountId": "...", "addressType": "ADDRESS_TYPE_ETHEREUM" } }
  }
}
```


## GET /wallets

## GET /wallets  
Returns wallet metadata for the current user.

---

### Data Model (additions to your MVP tables)

| Table        | Columns |
|--------------|---------|
| wallets      | id, user_id, chain ENUM(aptos,solana,evm), address, turnkey_wallet_id, turnkey_account_id, address_type, status, created_at |
| audit_logs   | (existing) record provisioning attempts & responses |
| feature_flags| wallet_aptos_enabled, wallet_solana_enabled, wallet_evm_enabled |

---

### Turnkey Integration Details (server)

1. **Auth/Stamps**  
   Use Turnkey SDK (`@turnkey/http`) with your stamper to sign requests to `https://api.turnkey.com`.

2. **Provisioning flow**  
   - Ensure/lookup a Turnkey wallet container for the user (org policy may prefer 1 wallet with accounts per chain).  
   - Create wallet (if none) via `ACTIVITY_TYPE_CREATE_WALLET`.  
   - Create wallet accounts per chain using `create_wallet_accounts` with proper `addressType`:  
     - Aptos → `ADDRESS_TYPE_APTOS` (ed25519)  
     - Solana → `ADDRESS_TYPE_SOLANA` (ed25519)  
     - EVM → `ADDRESS_TYPE_ETHEREUM` (secp256k1)  
   - Parse activity result → persist `address`, `turnkey_wallet_id`, `turnkey_account_id`.

3. **Idempotency**  
   If a row exists for `(user_id, chain)` with `status=active`, return it; otherwise retry activity with client-generated idempotency key.

4. **Policies (future story)**  
   Use Turnkey Policy Engine to restrict methods (e.g., only deposit whitelists, daily limits).

---

### Sequence (backend)

1. `POST /onboarding/start` → create user → start KYC → return JWT.  
2. KYC provider webhook → set `users.kyc_status=passed`.  
3. Client (or CRON) calls `POST /wallets/provision`.  
4. Wallet Service:  
   - `getOrCreateTurnkeyWallet(user)`  
   - For each requested chain (feature flag ON):  
     - `getOrCreateTurnkeyAccount(walletId, addressType)`  
     - Persist to `wallets` table.  
5. Return consolidated wallet payload.

---

### Acceptance Criteria

#### Functional
1. After KYC=passed, calling `/wallets/provision` creates missing accounts on Aptos, Solana, EVM via Turnkey and returns addresses.  
2. Repeated calls are idempotent (no duplicate rows / accounts).  
3. Disabling a feature flag prevents creation for that chain while others proceed.  
4. All Turnkey API errors are captured in `audit_logs` with correlation ids.  
5. DB contains exactly one active wallet row per `(user_id, chain)`.

#### Technical (Turnkey-specific)
1. Uses correct `addressType` per chain (Aptos, Solana, EVM) and stores returned account ids.  
2. Requests authenticated with a stamper and the `TurnkeyClient`; base URL `https://api.turnkey.com`.  
3. Wallet create & account create activities are issued using the documented Activities API.

---

### Observability
- **Metrics**: `wallet_provision_attempts_total`, `wallet_provision_success_total`, latency, per-chain success rate.  
- **Logs**: structured JSON with activity ids, user id, chain, error class.  
- **Tracing**: span for each Turnkey call.

---

### Security / Compliance
- No private keys handled by our backend; signing is remote via Turnkey.  
- Secrets in AWS Secrets Manager / Parameter Store; least-privileged Turnkey API keys.  
- PII separation: KYC results stored minimally; wallet addresses are not PII but treat as sensitive metadata.

---

### Performance
- P50 < 800 ms per chain activity submission (excluding asynchronous approval if configured); retries with backoff on 5xx.

---

### Error Handling
- Turnkey 4xx → map to `VALIDATION_ERROR` (bad addressType, etc.).  
- Turnkey 5xx / network → `INTEGRATION_TEMPORARY_FAILURE` with retry.  
- Partial success (e.g., Solana created, Aptos failed) returns 207 Multi-Status style payload with per-chain statuses.

---

### Definition of Done
- API endpoints implemented with unit tests (mocks for Turnkey).  
- Integration test hitting Turnkey sandbox org.  
- DB migrations applied; dashboards + alerts created.  
- Runbook added: how to re-provision or repair a user’s chain account.

---

### Test Plan (high level)

#### Unit
- `getOrCreateTurnkeyWallet` creates once per user; returns existing thereafter.  
- `getOrCreateTurnkeyAccount` issues correct `addressType` mapping per chain.

#### Integration (sandbox)
- Provision a test user end-to-end; verify returned Aptos, Solana, and EVM addresses validate on chain libraries.  
- Simulate Turnkey 429/5xx to confirm retry/backoff and alerting.

#### Contract
- Schema validation for request/response JSON.  
- OpenAPI updated for new endpoints.

---

### Implementation Notes
- **Service boundaries**: Keep Turnkey calls inside Wallet Service. Onboarding Service only orchestrates. (Matches your architecture.)  
- **Feature flags**: `wallet.enableAptos`, `wallet.enableSolana`, `wallet.enableEvm` (env or DB flags).  
- **Env vars**:  
  - `TURNKEY_BASE_URL=https://api.turnkey.com`  
  - `TURNKEY_ORG_ID=...`  
  - `TURNKEY_API_KEY=...` (or stamper creds)  
- **Libraries**: Node/Nest service with `@turnkey/http` client for Activities.

---

### Risks & Mitigations
- **KYC timing vs provisioning**: ensure wallet provisioning only after KYC=passed.  
- **Per-chain failures**: design partial success and safe replays.  
- **Regulatory**: keep on-chain actions gated behind KYC; document controls for audit.

---

### Story Points / Size
- 8 points (new integration, data model, idempotency, tests, ops).

---

### Dependencies
- KYC provider webhook configured and tested.  
- Turnkey sandbox org + API credentials available.
