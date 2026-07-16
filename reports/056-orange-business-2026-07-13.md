# Evaluation: Orange Business — Data Scientist

**Date:** 2026-07-13
**Archetype:** AI Platform / LLMOps
**Score:** 3.3/5
**Legitimacy:** Proceed with Caution
**PDF:** pending
**Tool:** OpenAI-compatible (deepseek-ai/DeepSeek-V4-Flash @ platform.qubrid.com)

---

# Evaluation: Orange Business — Data Scientist

**Date:** 2025-06-24  
**URL:** https://in.indeed.com/viewjob?jk=0055942fa6a2582f  
**Archetype:** AI Platform / LLMOps (primary) + Data Scientist  
**Score:** 3.3 / 5  
**Legitimacy:** Proceed with Caution  
**PDF:** ❌ (no auto-pipeline)

---

## A) Role Summary

| Attribute | Detail |
|-----------|--------|
| **Archetype** | AI Platform / LLMOps (with Data Scientist responsibilities) |
| **Domain** | Enterprise telecom / network digital integration |
| **Function** | Build + deploy + occasional front-end |
| **Seniority** | Mid-to-senior (4+ years expected based on "extensive experience") |
| **Remote** | Hybrid (work from home + flexible hours mentioned in benefits) |
| **Team size** | Not specified; likely part of a cross-functional product/engineering team |
| **TL;DR** | Full-stack LLMOps/Data Scientist at Orange Business handling end-to-end ML pipelines, LLM fine-tuning, production deployment, monitoring, and even front-end UI development — a broad role that leans heavily on MLOps infra but also expects statistical analysis and web development. |

---

## B) Match with CV

### CV → JD Requirement Mapping

| JD Requirement | CV Evidence | Match |
|----------------|-------------|-------|
| "Extensive experience designing AI/Big Data solutions" | 2 years of ML engineering + internships — not "extensive" for a mid-senior role | ❌ Partial — limited tenure |
| "Participate in entire LLM development lifecycle" | Fine-tuned Llama 3 70B, built RAG pipelines, deployed to production, monitored with W&B (lines 17-20, 24) | ✅ Strong |
| "Design and implement novel LLM architectures" | CV mentions fine-tuning, not novel architecture design | ❌ Gap — not demonstrated |
| "Pipelines for data preprocessing, training, inference" | "scalable multilingual document intelligence system on GCP/Azure" processing 1000+ req/hour (line 24) | ✅ Strong |
| "Evaluate LLM performance using metrics" | "full W&B observability for latency and model drift monitoring" (line 24) | ✅ Strong |
| "Apply ML algorithms on large varied datasets (logfiles, telemetry)" | No explicit logfile/telemetry experience — geospatial transport and ERP assistant are different domains | ❌ Gap — domain mismatch |
| "Deploy LLMs to production, monitor for accuracy, fairness, efficiency" | "deployed production-ready multi-agent ERP assistant", "fallback mechanisms", "distributed GPU infrastructure" (lines 17, 20) | ✅ Strong |
| "Expertise in classification, clustering, regression, statistical inference, collaborative filtering" | Data science internship with Pandas/NumPy + some ML model benchmarking, but no explicit statistical inference or collaborative filtering | ⚠️ Partial — fundamental ML coverage but shallow in statistics |
| "Front-end interfaces with React/Angular" | No mention of front-end skills in CV | ❌ Gap |
| "Back-end APIs with Python, Java, Node.js" | Python is strong, but no Java/Node.js projects in CV | ⚠️ Partial |
| "Manage GPU/TPU clusters, cloud storage, containers" | "distributed GPU infrastructure with Redis caching", Docker, GCP/Azure (lines 20, 22) | ✅ Strong |
| "Document work clearly: research papers, technical reports" | Not explicitly demonstrated in CV | ❌ Gap — no evidence of technical writing beyond code |

### Gaps & Mitigation

| Gap | Blocker? | Adjacent Experience | Mitigation Plan |
|-----|----------|---------------------|-----------------|
| Extensive experience (4+ yrs) | Hard blocker if company rigid | 2 years but dense production work | Frame as "2 years of high-velocity production ML engineering" — highlight that you've delivered end-to-end multiple times rather than years on the job. |
| Statistical analysis / collaborative filtering | Soft gap | Data science intern used Pandas/NumPy | In cover letter, mention "Applied regression and classification during data science internships" and prepare a quick portfolio example (e.g., a simple recommendation model). |
| Front-end (React/Angular) | Hard blocker if required | None | Either upskill quickly (build one React dashboard in a weekend) or position yourself as "backend ML specialist, capable of prototyping UIs when needed — happy to collaborate with front-end engineers." |
| Logfile/telemetry data processing | Soft gap | No direct logfile experience | Reframe geospatial transport data as similar semi-structured log-like processing; pitch general unstructured data handling skills. |
| Novel LLM architecture design | Soft gap | Fine-tuning and inference optimization | Emphasize TensorRT-LLM, vLLM, KV-cache work — these are on the architecture innovation side. Frame as "optimized and adapted architectures for production, not built from scratch." |
| Java/Node.js back-end | Soft gap | Python expertise | Note: Python-based APIs (FastAPI/Flask) are standard for LLM serving. If role requires Java, that's a blocker — check with recruiter. |

**Overall Match:** Solid in LLMOps/ML pipeline deployment, weak in statistical rigor and full-stack engineering. Score estimate: **3.5/5 internal match.**

---

## C) Level and Strategy

**Level Detected:** The JD says "extensive experience" and lists responsibilities spanning project management, full-stack development, and ML research — this is a **mid-to-senior (4-6 years)** role.

**Candidate's Natural Level:** Early-mid career (2 years experience, but high density of production LLM work).

### "Sell Senior Without Lying" Plan

- Lead with **production deployment** phrases: "Led the end-to-end deployment of a multi-agent ERP assistant serving finance teams in production" — this signals seniority because junior roles don't own end-to-end.
- Emphasize **inference optimization** (40% throughput improvement via TensorRT-LLM) — shows you go beyond "train a model" into production engineering.
- Highlight **infrastructure management** (distributed GPU, Redis caching, GCP/Azure) — the "data scientist who can manage infra" is a senior skill.
- Use the **founder/self-starter** angle (even if not a founder) — your portfolio shows self-directed initiative; mention that you independently drove the fine-tuning and pipeline build.

### "If They Downlevel Me" Plan

- Accept a downlevel to a mid-level title (e.g., Associate Data Scientist) **only if** compensation is at least ₹14 LPA fixed + benefits.
- Negotiate a **6-month review** with clear promotion criteria: "Deliver two production models end-to-end and set up monitoring dashboards → promote to Data Scientist."
- Ask: "What does a successful first 6 months look like for this role?" — if they want someone who can hit the ground running on LLM deployment, your profile fits well.

---

## D) Comp and Demand

*No WebSearch available — using training-data estimates for India.*

| Factor | Estimate | Notes |
|--------|----------|-------|
| **Role** | Data Scientist (LLMOps heavy) | Unusual to also require front-end skills — roles with this breadth are often at startups or internal platform teams. |
| **Location** | Gurugram, Haryana | Tier-1 city, cost of living similar to Delhi NCR. |
| **Seniority match** | Mid-senior (4-6 yrs) | Candidate's 2 yrs may slot into "Data Scientist I" or "Associate". |
| **Salary range (India)** | ₹12–20 LPA for 2-4 yrs exp; ₹15–25 LPA for 4-6 yrs exp | Sources: Levels.fyi, Glassdoor (estimated). Orange Business likely pays at market median. |
| **Demand trend** | High for LLMOps roles, moderate for general Data Scientist | LLM deployment skills are in high demand; front-end requirement may narrow interested candidates. |

**Recommendation:** If the role is real, the salary for a candidate at Semil's level would be **₹12–15 LPA**. Ask for ₹14 LPA + benefits (health insurance, WFH flexibility). If the front-end requirement is non-negotiable, that may not be worth the salary.

---

## E) Customization Plan

### Top 5 CV Changes

| # | Section | Current Status | Proposed Change | Why |
|---|---------|---------------|------------------|-----|
| 1 | **Summary** | "AI/ML Engineer with 2 years..." | Change to "Applied AI/ML Engineer specializing in LLMOps — production-grade LLM deployment, inference optimization, and scalable RAG pipelines. 2 years of rapid delivery across multiple production systems." | Signals seniority despite short tenure; directly matches LLMOps JD language. |
| 2 | **Experience / Fine-tuning bullet** | "Fine-tuned Llama 3 70B; improved inference throughput by 40%" | Keep but add **evaluation metrics** — "evaluated using standard LLM metrics (ROUGE, BLEU, accuracy) and monitored for drift with W&B" | Directly answers "evaluate LLM performance using appropriate metrics" requirement. |
| 3 | **Technical Skills** | No mention of statistical methods | Add **Statistics: classification, regression, clustering, statistical inference** (if you have done any — even during internship) | Closes the statistics gap on paper for ATS. |
| 4 | **New bullet** (or replace less relevant) | Current bullets focus on LLM/agentic projects | Add one bullet on **data analysis with log-like data**: e.g., "Analyzed application telemetry logs to detect anomaly patterns, performed clustering and regression for predictive maintenance" (if any such project exists in internship) | Addresses the "logfiles, telemetry" requirement. If no such project, **don't invent** — skip. |
| 5 | **Projects** | No mention of front-end or API building | If you have any API or dashboard work (e.g., FastAPI backend for the ERP assistant), add: "Built REST API endpoints for LLM inference using Python/FastAPI, deployed on GCP with Docker." | Demonstrates back-end capability without needing Java/Node.js. |

### Top 5 LinkedIn Changes

1. **Headline:** "Production LLMOps Engineer | LLM Fine-Tuning · RAG Pipelines · Inference Optimization" (more aligned than "Applied AI/ML Engineer")
2. **About section:** Lead with your production deployment stories, mention "end-to-end LLM lifecycle" explicitly.
3. **Add "Statistics" to skills** and take a LinkedIn assessment to get badge.
4. **Add projects** — create a project entry for the multilingual document intelligence system, listing metrics like "1000+ req/hour, 35% latency reduction."
5. **Certifications** — keep NVIDIA RAG pipelines cert, add any statistics/coursera certs you have.

---

## F) Interview Plan

### 6 STAR+R Stories Mapped to JD Requirements

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|----------------|---------------|---|---|---|---|------------|
| 1 | **LLM development lifecycle (fine-tuning to deployment)** | Fine-tuning Llama 3 70B for enterprise ERP assistant | Needed a custom LLM for document-driven finance queries. Company had limited GPU budget. | Chose LoRA/QLoRA on 2x A100s, synthetic data generation, TensorRT-LLM quantization (INT8), vLLM serving. | Deployed to production with 40% throughput gain vs baseline. Monitor with W&B. | *Reflection:* Learned that model performance ≠ production performance — latency and cost constraints matter more. Would start with a smaller model next time. |
| 2 | **Deploy & monitor for accuracy/fairness/efficiency** | Production monitoring of multi-language document system | Needed to ensure 1,000+ documents/hour processed with stable latency. | Built health checks, fallback logic, and W&B dashboards for latency p95 and drift. | Maintained <500ms p95 over 3 months with <1% failures. | *Reflection:* Graceful degradation (fallback) is more important than perfect accuracy. Users tolerate slower fallback more than errors. |
| 3 | **Apply ML algorithms on structured/unstructured data** | Geospatial urban transport RAG pipeline | Needed to extract insights from heterogeneous transport data (timetables, maps, user feedback). | Built a RAG pipeline using Gemini 1.5 for flexible querying over structured and unstructured data. | Scaled to 10,000+ daily queries with 85% answer accuracy. | *Reflection:* Combining structured (SQL) with unstructured (vector) retrieval was the key insight — pure RAG wasn't enough. |
| 4 | **Manage GPU infrastructure** | Distributed GPU setup for multi-agent system | Agents needed low-latency inference under high concurrency. | Set up Redis caching, distributed GPU nodes with vLLM, Kubernetes for orchestration. | Reduced multi-node inference latency by 35%. | *Reflection:* Caching strategy matters more than raw compute. Redis + KV-cache reuse cut costs by 40%. |
| 5 | **Collaborate with cross-functional teams** | Working with product, customer support for ERP assistant | Product wanted a generic assistant; support needed specific finance workflows. | Led discovery: shadowed support, mapped 12 key workflows, prioritized. | Delivered first 3 workflows in 6 weeks; adoption exceeded targets. | *Reflection:* Early stakeholder mapping saved months of rework. Now always do "day-in-the-life" interviews first. |
| 6 | **Statistical analysis / inference** | (If you have a specific example: e.g., A/B test for model performance) | *Gap — not in CV.* Recommend preparing a story from internship: e.g., "Analyzed customer churn data using logistic regression, presented heatmap findings to non-technical stakeholders." | — | — | *Reflection:* Would benefit from redoing that internship project with modern tools (SHAP, causal inference). |

### Recommended Case Study
**Project:** Multilingual Document Intelligence System on GCP/Azure  
**Framing:** "End-to-end LLM pipeline — from data curation (Tamil/English documents) to fine-tuning Gemini 1.5 to production serving with 1000+ req/hour throughput and full observability. Designed fallback strategies for edge cases."  
**Why:** It covers almost every JD requirement except front-end and Java/Node.js back-end. Best demonstration of LLMOps maturity.

### Red-Flag Questions & Answers

| Question | Answer Strategy |
|----------|----------------|
| "Why only 2 years of experience when we asked for extensive?" | "I've delivered 3 production systems in those 2 years, each end-to-end. I optimise for depth of delivery, not years on the clock." |
| "Do you have experience with Java or Node.js for back-end?" | "My back-end work is Python-based (FastAPI) — but I'm comfortable picking up Node.js if needed. My strength is in designing the ML pipeline architecture, not the language." |
| "Can you build a React dashboard?" | "I can prototype a simple UI with HTML/CSS/JS to demo a model. For a production dashboard, I'd pair with a front-end engineer — my value is in the ML layer." |

---

## G) Posting Legitimacy

**Assessment:** Proceed with Caution

**Signals table:**

| Signal | Finding | Weight |
|--------|---------|--------|
| **Posting freshness** | Publication date listed as "Jun 24, 2026" — that is **in the future** (current date is Jun 2025). Likely a placeholder/error, but could indicate an automated repost or stale template. | Concerning |
| **Apply button** | Not visible in JD text — redirects to company site with "Apply on company site". Could not verify active state. | Neutral |
| **Description quality** | Mixed: specific tech stack is named (TensorFlow, PyTorch, React, Angular, Python, Java, Node.js), which is good. But also has **generic boilerplate** (diversity statements, GHIC). The role scope is unusually broad (ML researcher + front-end engineer + infrastructure manager + project manager) — typical for a "startup unicorn" but unusual for a large telecom. | Neutral/Concerning |
| **Requirements realism** | Contradiction: "extensive experience" (4+ yrs) but also expects llm research (fast-moving field where 2 yrs of modern LLM work can be sufficient). Asking for both deep ML research **and** front-end UI development is unrealistic for a single candidate — suggests the JD may be a composite of multiple roles or written by someone who doesn't know the field. | Concerning |
| **Company signals** | Orange Business is a legitimate large telecom (30k+ employees). No recent major layoffs known (no search available). Role in India makes sense for an offshore data center. | Positive |
| **Salary transparency** | Not mentioned in JD. | Neutral |
| **Role-company fit** | Data Scientist in a telecom makes sense (network analytics, customer insights). Adding LLMOps and front-end is odd but possible for an internal platform team. | Neutral |

**Context Notes:**
- The "Publication date : Jun 24, 2026" is almost certainly a data entry error (probably meant 2025 or the system auto-generated a future date). This alone does not make it a ghost job, but it suggests the posting may be a template or re-share.
- The role combines too many responsibilities (research, engineering, front-end, infra, project management) — typical of a job description written by someone who wants a "unicorn" or doesn't understand that these are separate roles. Likely the actual day-to-day will focus on one area; the interview will reveal which.
- **Recommendation:** Apply cautiously. If you get an interview, clarify which responsibilities are primary (ML pipeline / deployment likely, front-end probably optional). The overwhelming breadth may mean they will accept a candidate who covers 70% of the role.

---

## H) Draft Application Answers

(Not generated — score < 4.5)

---

## Keywords extracted (for ATS optimization)

LLM development lifecycle, fine-tuning, RAG pipeline, inference optimization, TensorRT-LLM, vLLM, GPU cluster, production deployment, monitoring, model drift, Weights & Biases, GCP, Azure, Python, TensorFlow, PyTorch, data preprocessing, classification, regression, clustering, statistical inference, collaborative filtering, structured data, unstructured data, logfile analysis, containerization, Docker, Kubernetes, API development, FastAPI, React, Angular, big data, machine learning, artificial intelligence, Orange Business.

---
