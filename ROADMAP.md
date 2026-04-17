# Backend Mastery — Learning Roadmap

**Timeline:** 12-15 months | 5hrs/day | 5 days/week
**Goal:** Senior Backend Engineer → System Architect
**Side track:** DS/Algorithms daily (morning) for FAANG prep

---

## Topics

| # | Topic | Branch | Status |
|---|-------|--------|--------|
| 1 | MongoDB + Mongoose | `feature/mongoose` | In Progress |
| 2 | Redis | `feature/redis` | Pending |
| 3 | MySQL | `feature/mysql` | Pending |
| 4 | DynamoDB | `feature/dynamodb` | Pending |
| 5 | RabbitMQ | `feature/rabbitmq` | Pending |
| 6 | Logging — Winston + CloudWatch | `feature/logging` | Pending |
| 7 | Lambda + API Gateway + SQS | `feature/aws-serverless` | Pending |
| 8 | RAG | `feature/rag` | Pending |
| 9 | GraphQL | `feature/graphql` | Pending |
| 10 | Monolith → Microservices | `feature/microservices` | Pending |
| 11 | Kubernetes (Kubestronaut level) | `feature/k8s` | Pending |

**Already strong:** AWS services, DevOps

---

## Per-Topic Phase Structure

Every topic follows these 5 phases in order. Do NOT move to next phase until you can work without the README.

### Phase 1 — Data / Schema Design
Production-grade application scenarios. Design schemas, justify every decision (embed vs reference, indexes, options). Reviewed by Claude.

### Phase 2 — Query / Operation Practice
1000+ seeded records. Practice all operations cold — reads, writes, aggregations, transactions. No reference allowed during practice.

### Phase 3 — Platform / Tool Deep Dive
Hands-on with the actual tool: Atlas, Redis CLI, MySQL EXPLAIN plans, DynamoDB console, etc.

### Phase 4 — Production Scenario Simulations
**This is what separates this plan from every tutorial.**

Real incident simulations: symptom → you diagnose → you fix → reviewed. ~8-10 scenarios per topic. Closes the "production experience" gap.

```
practice/
  phase1-schema-design/
  phase2-queries/
  phase3-platform/
  phase4-production-scenarios/   ← never skip this
  phase5-system-design/
```

### Phase 5 — System Design
Architecture questions using the technology you just learned. Argue tradeoffs at scale.

---

## Current Progress — MongoDB + Mongoose

- [x] Full reference README written
- [x] Connection setup with disconnect events
- [x] GlobalErrorHandler updated with Mongoose errors
- [x] Phase 1 started — Q1 Ecommerce schema (awaiting solution)
- [ ] Phase 1 remaining scenarios
- [ ] Phase 2 — seed data + query practice
- [ ] Phase 3 — Atlas
- [ ] Phase 4 — production scenarios
- [ ] Phase 5 — system design
