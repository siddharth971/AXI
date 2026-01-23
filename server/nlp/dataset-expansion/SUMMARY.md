# AXI Dataset Expansion Summary

## Project Status: SEED COMPLETE (20 Batches)

---

## 📊 Final Expansion Metrics

### Content Volume

| Metric          | Baseline | Final Count | Growth |
| --------------- | -------- | ----------- | ------ |
| **Batches**     | 0        | 20          | N/A    |
| **New Samples** | 0        | 1,590       | N/A    |
| **Intents**     | 218      | 1,492       | +584%  |
| **Utterances**  | 11,956   | ~13,546     | +13%   |
| **Vocabulary**  | 3,756    | ~10,500     | +180%  |

### Domain Coverage

| Phase            | Focus Areas                                 | Batches |
| ---------------- | ------------------------------------------- | ------- |
| **1: Core**      | System, Files, Browser, Media, Productivity | 1-9     |
| **2: Tech**      | Cloud, DevOps, Git                          | 10-11   |
| **3: Lifestyle** | Finance, Health, Creative, IoT              | 12-15   |
| **4: Knowledge** | Education, Legal, HR                        | 16-17   |
| **5: Leisure**   | Gaming, Travel                              | 18-19   |
| **6: Stress**    | Adversarial, Edge Cases                     | 20      |

---

## 🗂️ Complete Directory Structure

```
server/nlp/dataset-expansion/
├── EXPANSION_ARCHITECTURE.md
├── ROADMAP.md
├── SUMMARY.md
├── schema/
├── batches/ (Batch-001)
├── cognitive-states/ (Batch-002)
├── discourse-patterns/ (Batch-003)
└── domains/
    ├── productivity/ (Batch-004)
    ├── browser/ (Batch-005)
    ├── file/ (Batch-006)
    ├── system/ (Batch-007)
    ├── media/ (Batch-008)
    ├── communication/ (Batch-009)
    ├── cloud/ (Batch-010, 011)
    ├── finance/ (Batch-012)
    ├── healthcare/ (Batch-013)
    ├── creative/ (Batch-014)
    ├── iot/ (Batch-015)
    ├── education/ (Batch-016)
    ├── professional/ (Batch-017)
    ├── gaming/ (Batch-018)
    ├── travel/ (Batch-019)
    └── stress-test/ (Batch-020)
```

---

## 🚀 Execution Guide

### 1. Training

The dataset is merged and ready. To train the NLU model with the new 1,590 high-quality samples:

```bash
npm run train:expanded
```

### 2. Validation

To verify the model's performance on the new intent types:

```bash
npm run test:nlp:comprehensive
```

### 3. Future Scaling (Roadmap)

The current 1,590 samples serve as "Seed Data". To reach 1M+ samples:

1.  Use `augment-data` scripts (planned) to perform synonym replacement on these seeds.
2.  Use LLM-based paraphrase generation on these seeds.
3.  Inject noise (typos, ASR errors) programmatically.

---

_Generated: 2026-01-23_
_Status: COMPLETED_
