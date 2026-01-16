# Longevity World Cup 2.0 - Development Milestones

## Overview
This document outlines the development milestones and WeDo tasks for rebuilding the Longevity World Cup platform.

---

## MILESTONE 1: Project Foundation
**Target:** Week 1-2
**Status:** ✅ Complete

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-001 | Initialize Next.js 14 project with App Router | High | - | ✅ Done |
| LWC-002 | Set up Tailwind CSS and design system tokens | High | LWC-001 | ✅ Done |
| LWC-003 | Configure PostgreSQL database and Prisma ORM | High | LWC-001 | ✅ Done (SQLite for dev) |
| LWC-004 | Implement authentication (Clerk/Auth.js) | High | LWC-001 | ✅ Done (Clerk) |
| LWC-005 | Create CI/CD pipeline (GitHub Actions) | Normal | LWC-001 | Pending |
| LWC-006 | Set up testing framework (Vitest, Playwright) | Normal | LWC-001 | ✅ Done (Playwright) |
| LWC-007 | Design and implement base UI component library | High | LWC-002 | ✅ Done

---

## MILESTONE 2: Core Data Models
**Target:** Week 3-4
**Status:** ✅ Complete

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-010 | Design Athlete schema and migrations | High | LWC-003 | ✅ Done |
| LWC-011 | Design BiomarkerSubmission schema | High | LWC-003 | ✅ Done |
| LWC-012 | Design Season and Competition schemas | High | LWC-003 | ✅ Done |
| LWC-013 | Design Leaderboard and Ranking schemas | High | LWC-003 | ✅ Done |
| LWC-014 | Implement PhenoAge calculation service | High | LWC-011 | ✅ Done |
| LWC-015 | Create data validation layer | High | LWC-010, LWC-011 | ✅ Done |
| LWC-016 | Set up seed data for development | Normal | LWC-010 | ✅ Done

---

## MILESTONE 3: Athlete System
**Target:** Week 5-6
**Status:** 🟡 In Progress

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-020 | Build athlete registration flow | High | LWC-004, LWC-010 | ✅ Done (onboarding) |
| LWC-021 | Create athlete profile page | High | LWC-010 | ✅ Done |
| LWC-022 | Implement profile edit functionality | Normal | LWC-021 | Pending |
| LWC-023 | Build profile picture upload with S3 | Normal | LWC-021 | Pending |
| LWC-024 | Implement division/generation assignment | High | LWC-020 | ✅ Done |
| LWC-025 | Create athlete verification system | High | LWC-020 | ✅ Done |
| LWC-026 | Build athlete search API | Normal | LWC-010 | ✅ Done

---

## MILESTONE 4: Biomarker Submission
**Target:** Week 7-8
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-030 | Create biomarker submission form | High | LWC-011 | Pending |
| LWC-031 | Implement lab report upload (image/PDF) | High | LWC-030 | Pending |
| LWC-032 | Build OCR extraction service (optional) | Normal | LWC-031 | Pending |
| LWC-033 | Validate biomarker ranges and formats | High | LWC-030 | Pending |
| LWC-034 | Auto-calculate PhenoAge on submission | High | LWC-014, LWC-030 | Pending |
| LWC-035 | Create submission history view | Normal | LWC-030 | Pending |
| LWC-036 | Implement proof image upload | High | LWC-031 | Pending |
| LWC-037 | Build admin verification dashboard | High | LWC-025 | Pending |

---

## MILESTONE 5: Leaderboard System
**Target:** Week 9-10
**Status:** 🟡 In Progress

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-040 | Build main leaderboard API | High | LWC-013 | ✅ Done |
| LWC-041 | Create leaderboard UI with table/grid | High | LWC-040 | ✅ Done |
| LWC-042 | Implement real-time rank updates | Normal | LWC-040 | Pending |
| LWC-043 | Add division/generation filtering | High | LWC-041 | ✅ Done |
| LWC-044 | Create podium component for top 3 | High | LWC-041 | ✅ Done |
| LWC-045 | Build rank change indicators | Normal | LWC-041 | Pending |
| LWC-046 | Implement search within leaderboard | Normal | LWC-041 | Pending |
| LWC-047 | Add pagination and infinite scroll | Normal | LWC-041 | ✅ Done |
| LWC-048 | Create shareable leaderboard positions | Normal | LWC-041 | Pending

---

## MILESTONE 6: Data Visualization
**Target:** Week 11-12
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-050 | Set up Recharts/D3 charting library | High | LWC-007 | Pending |
| LWC-051 | Build biomarker trend charts | High | LWC-050 | Pending |
| LWC-052 | Create PhenoAge history visualization | High | LWC-051 | Pending |
| LWC-053 | Implement Z-score comparison view | Normal | LWC-051 | Pending |
| LWC-054 | Build pace-of-aging trend chart | Normal | LWC-051 | Pending |
| LWC-055 | Create exportable chart images | Low | LWC-051 | Pending |

---

## MILESTONE 7: Gamification
**Target:** Week 13-14
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-060 | Build "Guess My Age" game UI | High | LWC-021 | Pending |
| LWC-061 | Implement age guessing API and scoring | High | LWC-060 | Pending |
| LWC-062 | Create badge/achievement system schema | High | LWC-010 | Pending |
| LWC-063 | Build badge display components | High | LWC-062 | Pending |
| LWC-064 | Implement badge earning triggers | High | LWC-062 | Pending |
| LWC-065 | Create achievement notifications | Normal | LWC-064 | Pending |
| LWC-066 | Build social sharing for achievements | Normal | LWC-064 | Pending |

---

## MILESTONE 8: Prize & Competition System
**Target:** Week 15-16
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-070 | Design prize pool tracking system | High | LWC-012 | Pending |
| LWC-071 | Integrate Bitcoin donation tracking | High | LWC-070 | Pending |
| LWC-072 | Build prize distribution logic | High | LWC-070 | Pending |
| LWC-073 | Create season management admin panel | High | LWC-012 | Pending |
| LWC-074 | Implement countdown timers | Normal | LWC-012 | Pending |
| LWC-075 | Build event feed/activity stream | Normal | LWC-040 | Pending |
| LWC-076 | Create season archives view | Normal | LWC-073 | Pending |

---

## MILESTONE 9: Polish & Performance
**Target:** Week 17-18
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-080 | Implement responsive design audit | High | All UI | Pending |
| LWC-081 | Add loading states and skeletons | High | All UI | Pending |
| LWC-082 | Implement error boundaries | High | - | Pending |
| LWC-083 | Optimize images and assets | High | - | Pending |
| LWC-084 | Add PWA support | Normal | - | Pending |
| LWC-085 | Implement SEO optimization | High | - | Pending |
| LWC-086 | Performance profiling and fixes | High | - | Pending |
| LWC-087 | Accessibility audit (WCAG 2.1) | High | - | Pending |

---

## MILESTONE 10: Security & Launch
**Target:** Week 19-20
**Status:** Pending

### Tasks
| ID | Task | Priority | Dependency | Status |
|----|------|----------|------------|--------|
| LWC-090 | Security audit and penetration testing | Critical | All | Pending |
| LWC-091 | Implement rate limiting | High | - | Pending |
| LWC-092 | Set up monitoring (Sentry, analytics) | High | - | Pending |
| LWC-093 | Create production deployment pipeline | High | LWC-005 | Pending |
| LWC-094 | Write user documentation | Normal | - | Pending |
| LWC-095 | Beta testing with select users | High | All | Pending |
| LWC-096 | Production launch | Critical | LWC-095 | Pending |
| LWC-097 | Post-launch monitoring and hotfixes | High | LWC-096 | Pending |

---

## Task Summary

| Milestone | Task Count | Priority Breakdown |
|-----------|------------|-------------------|
| 1. Foundation | 7 | 4 High, 2 Normal, 1 Low |
| 2. Data Models | 7 | 6 High, 1 Normal |
| 3. Athlete System | 7 | 4 High, 3 Normal |
| 4. Biomarker | 8 | 6 High, 2 Normal |
| 5. Leaderboard | 9 | 4 High, 5 Normal |
| 6. Visualization | 6 | 2 High, 3 Normal, 1 Low |
| 7. Gamification | 7 | 5 High, 2 Normal |
| 8. Prize System | 7 | 4 High, 3 Normal |
| 9. Polish | 8 | 6 High, 2 Normal |
| 10. Launch | 8 | 3 Critical, 4 High, 1 Normal |
| **TOTAL** | **74** | |

---

## Dependencies Graph

```
LWC-001 (Next.js Setup)
├── LWC-002 (Tailwind) → LWC-007 (UI Components)
├── LWC-003 (Database)
│   ├── LWC-010 (Athlete Schema)
│   │   ├── LWC-016 (Seed Data)
│   │   ├── LWC-020 (Registration)
│   │   │   ├── LWC-024 (Divisions)
│   │   │   └── LWC-025 (Verification) → LWC-037 (Admin)
│   │   ├── LWC-021 (Profile)
│   │   │   ├── LWC-022 (Edit)
│   │   │   ├── LWC-023 (Photo Upload)
│   │   │   └── LWC-060 (Guess Age)
│   │   └── LWC-062 (Badges)
│   ├── LWC-011 (Biomarker Schema)
│   │   ├── LWC-014 (PhenoAge Calc)
│   │   └── LWC-030 (Submission Form)
│   ├── LWC-012 (Season Schema)
│   │   ├── LWC-070 (Prize Pool)
│   │   └── LWC-073 (Admin)
│   └── LWC-013 (Leaderboard Schema)
│       └── LWC-040 (Leaderboard API)
├── LWC-004 (Auth) → LWC-020 (Registration)
└── LWC-005 (CI/CD) → LWC-093 (Prod Deploy)
```

---

*Last Updated: January 7, 2026*
