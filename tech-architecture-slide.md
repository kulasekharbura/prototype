# 3. Tech Architecture & Scaling

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                                │
│   Mobile App / Web App  ──  Voice + Text Intent Input  ──  Streaming Cart Display       │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ HTTPS / WebSocket
┌────────────────────────────────────────▼────────────────────────────────────────────────┐
│                         EDGE & API GATEWAY                                              │
│   CDN (static)  │  API Gateway (auth, rate-limit, routing)  │  BFF (contract adapter)  │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ gRPC
┌────────────────────────────────────────▼────────────────────────────────────────────────┐
│                    CART GENERATION ORCHESTRATOR (Saga / Temporal)                        │
│   Fan-out/fan-in  │  Per-stage deadlines  │  Fallback chains  │  Idempotency           │
└───┬────────────┬───────────────┬──────────────┬─────────────┬───────────────────────────┘
    │            │               │              │             │
    ▼            ▼               ▼              ▼             ▼
┌────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────────────┐
│ INTENT │ │  NEED   │ │  CONSUMER    │ │ QUANTITY │ │   CANDIDATE     │
│ UNDER- │ │ RESOLU- │ │  CONTEXT     │ │ ESTIMA-  │ │   GENERATION    │
│STANDING│ │  TION   │ │  CLASSIFIER  │ │  TION    │ │  (Vector+Rules) │
│        │ │         │ │              │ │          │ │                 │
│ LLM    │ │ Graph   │ │ GBDT model   │ │ ML +     │ │ HNSW ANN +     │
│cascade │ │traversal│ │ + rule       │ │ rules +  │ │ Affinity recall │
│+cache  │ │ (BFS)   │ │ backstops    │ │ guardrail│ │ + hard filters  │
└────────┘ └─────────┘ └──────────────┘ └──────────┘ └────────┬────────┘
                                                               │
    ┌──────────────────────────────────────────────────────────┘
    ▼
┌─────────────┐  ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────┐
│  RANKING &  │  │   AVAILABILITY    │  │  BUDGET OPTIMIZER  │  │ CART ASSEMBLER   │
│PERSONALIZA- │  │  & SUBSTITUTION   │  │     (MCKP)         │  │ & EXPLAINER      │
│   TION      │  │                   │  │                    │  │                  │
│ LTR + Bandit│  │ Soft-availability │  │ DP / Lagrangian    │  │ Pricing + Promos │
│ + Affinity  │  │ + Reservation     │  │ relaxation         │  │ + Reasons        │
└─────────────┘  └───────────────────┘  └────────────────────┘  └────────┬─────────┘
                                                                          │
┌─────────────────────────────────────────────────────────────────────────▼─────────────┐
│                         EXISTING PLATFORM INTEGRATION                                  │
│   Catalog/Pricing  │  Inventory/WMS  │  Cart/Checkout  │  Promotions  │  Fulfillment  │
└───────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────────┐
│                    ASYNC LEARNING LOOP (never on request path)                         │
│                                                                                       │
│  Client Events ──► Kafka ──► Flink ──► Feature Store (online) ──► Bandit Updater     │
│                       │                      │                                        │
│                       ▼                      ▼                                        │
│                   Lakehouse ──► Batch Train (LTR, embeddings, qty priors) ──► Registry │
└───────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA STORES                                              │
│                                                                                       │
│  Need Graph DB ──── Vector DB ──── Redis Cluster ──── Inventory KV ──── Profile Store │
│  (in-memory        (HNSW,          (semantic cache,   (per dark-store,   (user taste   │
│   versioned         sharded by      result cache,      CDC-updated,       vectors,     │
│   snapshots)        category)       online features)   soft-avail model)  preferences) │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React Native (mobile) + Next.js (web) | Shared component library, SSR for instant load, streaming responses via WebSocket for progressive cart display |
| **API Gateway** | Kong / AWS API Gateway | Auth, rate-limiting, request routing, canary traffic splitting — battle-tested at scale |
| **Orchestration** | Temporal (workflow engine) | Durable saga with per-step timeouts, retries, compensation, and full replay/debug — eliminates hand-rolled state machines |
| **Backend Services** | Go (latency-critical: orchestrator, retrieval, optimizer) + Python (ML serving) | Go for sub-ms latency and high concurrency; Python for ecosystem compatibility with ML/AI frameworks |
| **LLM Inference** | Self-hosted vLLM (distilled 7B model) + AWS Bedrock / OpenAI (frontier, tail traffic) | Cost cascade: self-hosted handles 65%+ of requests cheaply; hosted frontier only for novel/ambiguous prompts |
| **Need Graph** | Neo4j (editorial) + In-memory snapshot (runtime) | Graph queries for ontology management; runtime reads from a replicated in-memory snapshot (sub-ms, no network hop) |
| **Vector DB** | Milvus / Weaviate (sharded by category) | HNSW ANN at scale, hybrid search (vector + metadata filter), horizontal sharding for category isolation |
| **Cache** | Redis Cluster (multi-purpose) | Semantic intent cache, cart result cache, online feature serving — all sub-ms, all from one operated fleet |
| **Inventory Store** | DynamoDB / ScyllaDB (per dark-store partition) | Single-digit-ms KV reads at any scale; partition key = `dark_store_id` + `sku_id` for perfect data locality |
| **Event Streaming** | Apache Kafka | Durable, partitioned, replayable event backbone; decouples learning from serving; scales linearly with partitions |
| **Stream Processing** | Apache Flink | Stateful streaming for real-time feature computation, bandit updates, and inventory CDC consumption |
| **Feature Store** | Feast (online + offline with train/serve parity) | Guarantees identical feature values in training and serving — eliminates the #1 silent ML bug |
| **Model Serving** | Triton Inference Server (ranking GBDT) + vLLM (LLM) | Batched, GPU-optimized serving with model versioning and A/B routing |
| **ML Training** | PyTorch + XGBoost + Ray | LTR ranking, embedding generation, quantity priors; Ray for distributed hyperparameter tuning |
| **Experimentation** | In-house A/B + interleaving framework | Safe model rollout with guardrail metrics (edit rate, stockout rate, AOV) and auto-rollback |
| **Infra / Compute** | Kubernetes (EKS) + Istio service mesh | Autoscaling (HPA on QPS/CPU/p95), canary deployments, mTLS, traffic shaping, multi-AZ |
| **Data Lake** | Apache Iceberg on S3 | Cheap, queryable historical data for training, auditing, and analytics; time-travel for reproducible train sets |
| **CI/CD** | GitHub Actions + ArgoCD | GitOps-driven deployment; model promotion through registry gates separate from code deployment |
| **Monitoring** | Prometheus + Grafana + OpenTelemetry (distributed tracing) | RED metrics per service, domain KPIs (cart-acceptance, edit rate), per-cart provenance traces |

---

## Key Algorithms & Complexity

### 1. Intent Understanding — Semantic Cache + LLM Cascade

| Step | What happens | Complexity |
|------|-------------|-----------|
| Embed prompt | Sentence-transformer → 768-dim vector | O(1) — fixed model inference |
| ANN cache lookup | Cosine similarity against recent parses (HNSW) | O(log N) — N = cached prompts |
| Cache hit (≥0.95) | Reuse prior structured parse → **skip LLM entirely** | O(1) |
| Cache miss | Small distilled model (common patterns) → large model (tail) | O(1) per inference, bounded tokens |

**Why this matters:** 60–70% of prompts are head intents ("biryani", "study tonight"). The semantic cache turns a $0.01+ LLM call into a $0.00001 vector lookup for the majority of traffic. The cascade ensures cost scales **sub-linearly** with users.

---

### 2. Need Resolution — Bounded Graph Traversal (BFS)

```
resolveNeeds(intents[]) → NeedPlan

Algorithm:
  1. For each intent, BFS from intent node, max depth = 3
  2. Collect all Need nodes reachable via 'requires' edges
  3. Aggregate weights when multiple intents share a need (multi-intent merge)
  4. Pull high-confidence coOccursWith needs (need discovery, gated by threshold)
  5. Return deduplicated NeedPlan with weights + essentiality flags
```

| Metric | Value |
|--------|-------|
| Graph size | ~10⁴–10⁵ nodes (fully in memory) |
| Traversal depth | ≤ 3 (bounded) |
| Complexity | O(V + E) on the reachable subgraph |
| Latency | < 1ms (in-memory, no network) |

**Why a graph, not a lookup table:** Substitutability groups, co-occurrence mining, multi-intent merging, and locale-specific edges are all natural graph operations. A flat table would require N² join logic for the same expressiveness.

---

### 3. Consumer Context Classification — Effective Consumer Count

```
effective_consumers = classify(intent_type, prompt_cues, time, profile)

Rules:
  "study", "gym", "work"     → individual = 1 (regardless of household size)
  "family dinner", "biryani for family" → household_size (from profile)
  "guests tonight"           → inferred guest count (or ask one question)
  "movie night with family"  → household_size

quantity(need) = base_per_consumer × effective_consumers × intent_multiplier
                 → rounded to nearest pack size, clamped by [min, max] guardrails
```

**Why this is critical:** Getting quantities wrong destroys trust faster than anything. A customer in a family of 5 saying "I want to study" must NOT get 5× of everything. This classifier + guardrail system ensures the **right** scaling every time.

---

### 4. Budget Optimization — Multiple-Choice Knapsack Problem (MCKP)

```
maximize   Σ (need_weight × rank_score) × x[need][sku]
subject to:
  Σ price × qty × x[need][sku]  ≤  Budget           (budget constraint)
  Σ x[need][sku] ≤ 1            per need             (pick at most one SKU per need)
  essential needs must be filled                       (hard constraint)
  dietary / allergen constraints satisfied             (hard constraint)
```

| Parameter | Typical Value |
|-----------|--------------|
| Needs (G) | 5–30 |
| Candidates/need (K) | 5–10 (post-ranking top-K) |
| Budget buckets (B) | ~100–200 (₹10 granularity) |
| DP complexity | O(G × K × B) ≈ O(30 × 10 × 200) = 60,000 ops |
| Latency | < 5ms |

**For larger instances:** Lagrangian relaxation + greedy value-density approximation with provable quality bounds.

**Why MCKP and not rules/heuristics:**
- Same intent + ₹300 budget → coffee + biscuits (drops protein bar)
- Same intent + ₹1500 budget → premium coffee + energy drink + protein bar + healthy snacks
- One principled formulation handles budget, substitution preference, essentiality, and dietary constraints. New business rules = new constraints, not new spaghetti.

---

### 5. Personalization — Recency-Weighted Affinity + Contextual Bandits

```
score(user, sku) = w₁·affinity + w₂·LTR_relevance + w₃·exploration − w₄·rejection_penalty

where:
  affinity = Σ e^(−λ·Δt)     over past purchases of this SKU
                               (recent purchases weighted exponentially higher)

  exploration = Thompson sampling (contextual bandit per category)
                               (explore new SKUs without tanking experience)

  rejection_penalty = learned from removals / rejected recommendations
                               (if user keeps removing Energy Drinks → stop suggesting them)
```

**Why this combination:**
- **Affinity** ensures Customer A (Nescafe buyer) and Customer B (Bru buyer) get different carts for the same "study tonight" prompt
- **Bandit** introduces new products without A/B-testing every SKU individually — the system self-improves continuously
- **Rejection penalty** implements the brief's requirement: "customer repeatedly removes Energy Drinks → future carts prefer Green Tea"
- All signals update **online** (seconds) via streaming, not just in nightly batches

---

### 6. Inventory-Aware Substitution — Soft Availability Model

```
P(available) = f(current_stock, sell_through_velocity, time_to_fulfillment, last_count_age)

If P(available) < threshold for top-ranked SKU:
  → Walk substitutability group (same need, pre-ranked)
  → Pick next-best in-stock SKU respecting user constraints
  → Surface substitution transparently: "Nescafe → Bru (out of stock)"
```

**Why soft availability, not binary stock check:** In quick-commerce, inventory counts are stale within minutes. A binary "in stock = yes/no" produces broken promises. The probability model + substitution engine absorbs the reality that stock data is always *approximately* correct.

---

## Scaling Strategy

### How this handles 100×–1000× growth

```
Current:   ~8M DAU  →  ~3.5K RPS peak  →  ~1.2K hit LLM tier (after cache)
At 100×:  ~800M DAU →  ~350K RPS peak  →  ~120K hit model tier
At 1000×: hypothetical global scale
```

### The 7 Scaling Levers

| # | Lever | What it does | Scale factor |
|---|-------|-------------|-------------|
| 1 | **Stateless horizontal compute** | Every service autoscales on QPS/CPU/p95. Zero shared state in compute. Add pods linearly. | Linear ∞ |
| 2 | **Semantic intent cache (60–70% deflection)** | Near-identical prompts skip the entire LLM tier. Head intents are cached across users. | Reduces model load by 2–3× |
| 3 | **Cart template cache (per cluster)** | Users with similar taste vectors + same intent + same store → reuse a pre-scored cart template, personalize only the diff. | Reduces end-to-end compute by 5–10× for popular intents |
| 4 | **Off-peak precomputation** | Top-N intents × stores × taste-clusters pre-generated during low-traffic hours. Served instantly at peak. | Near-zero compute at peak for head traffic |
| 5 | **Data sharding by locality** | Inventory: sharded by `dark_store_id` (user reads one shard). Vector DB: sharded by category. Profiles: sharded by `user_id`. Spikes isolated per partition. | Eliminates cross-partition hotspots |
| 6 | **LLM cost cascade** | Cache → small self-hosted (cheap, fast) → large hosted (expensive, rare). Token spend is an SLO with budget alerts. | Cost scales sub-linearly |
| 7 | **Multi-region active-active** | Need Graph + models replicate globally. Inventory/pricing stay regional. Geo-DNS routes to nearest region. | Global reach without global latency |

### Scaling Architecture (multi-region)

```
                    ┌─────────────────┐
                    │   Geo DNS /     │
                    │  Global LB      │
                    └────┬───────┬────┘
                         │       │
            ┌────────────▼─┐   ┌─▼────────────┐
            │  Region A    │   │  Region B     │
            │  (India)     │   │  (SEA/Global) │
            │              │   │               │
            │  ┌────────┐  │   │  ┌────────┐   │
            │  │API GW  │  │   │  │API GW  │   │
            │  │(auto)  │  │   │  │(auto)  │   │
            │  └───┬────┘  │   │  └───┬────┘   │
            │      │       │   │      │        │
            │  ┌───▼────┐  │   │  ┌───▼────┐   │
            │  │Orch    │  │   │  │Orch    │   │
            │  │pool    │  │   │  │pool    │   │
            │  │(HPA)   │  │   │  │(HPA)   │   │
            │  └───┬────┘  │   │  └───┬────┘   │
            │      │       │   │      │        │
            │  ┌───▼─────────────────────┐     │
            │  │ Reasoning + Fulfillment │     │
            │  │ pods (stateless, HPA)   │     │
            │  └───┬──────┬──────┬───────┘     │
            │      │      │      │       │     │
            │   ┌──▼──┐┌──▼──┐┌──▼──┐    │     │
            │   │Redis││VecDB││InvKV│    │     │
            │   │Clstr││Shard││Shard│    │     │
            │   └─────┘└─────┘└─────┘    │     │
            └────────────────────────────┘     │
                                               └───────────────────┘

Replicated globally: Need Graph, ML Models, Embeddings
Regional only: Inventory, Pricing, User Profiles (with cross-region sync for travelers)
```

### Why this isn't "just horizontal scaling"

1. **The semantic cache creates a natural ceiling** on expensive compute — as user base grows, intent diversity grows *sub-linearly* (power law). More users ≠ proportionally more LLM calls.
2. **Taste-cluster-based cart templates** mean similar users share pre-computed work — the system gets *cheaper per user* as it scales (network effect on compute).
3. **The Need Graph is tiny and static** — it doesn't grow with users, orders, or SKUs. The core reasoning engine has O(1) cost regardless of platform scale.
4. **Sharding follows natural boundaries** (store, category, user) — no cross-shard queries on the hot path. Each partition scales independently.
5. **The learning loop is fully async** — doubling users doubles Kafka throughput (cheap) without touching request-path latency.

### Latency Budget at Scale

| Stage | p95 Latency | Cache hit | Notes |
|-------|-------------|-----------|-------|
| Gateway + auth | 5ms | 5ms | |
| Intent Understanding | 200ms | **0ms** (cached) | Dominates on miss |
| Need Resolution | 1ms | 1ms | In-memory graph |
| Consumer Context + Qty | 5ms | 5ms | Lightweight model |
| Candidate Gen (parallel) | 15ms | 15ms | Vector ANN + affinity |
| Ranking | 10ms | 10ms | GBDT scoring |
| Availability + Substitution | 10ms | 10ms | KV read |
| Budget Optimizer (MCKP) | 5ms | 5ms | DP, small instance |
| Cart Assembly + Pricing | 10ms | 10ms | |
| **Total (cache miss)** | **~260ms** | — | Well under 1.5s SLO |
| **Total (cache hit)** | **~60ms** | — | Well under 300ms SLO |

---

## Summary: Why This Architecture Wins

| Dimension | How we deliver |
|-----------|---------------|
| **Complexity** | 6 novel algorithms working in concert — not standard CRUD. LLM cascade, graph traversal, MCKP optimization, contextual bandits, soft-availability model, and semantic caching. |
| **Interconnectedness** | Every component feeds the learning loop, which improves every other component. Carts improve personalization → better ranking → fewer edits → cleaner training signal → repeat. |
| **Scalability** | Sub-linear cost growth via semantic caching + taste clusters. Multi-region active-active. Sharding on natural boundaries. The system gets *cheaper per user* as it scales. |
| **Resilience** | Every stage has a fallback. The customer always gets a cart. Degradation is graceful, never catastrophic. |
