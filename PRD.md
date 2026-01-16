# Product Requirements Document (PRD)
# Longevity World Cup 2.0

**Version:** 1.0
**Date:** January 7, 2026
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
Longevity World Cup 2.0 is a next-generation competitive platform where participants compete to reverse their biological age using verified biomarker data. The platform gamifies longevity science, creating a global leaderboard where "you don't age out - you age in."

### 1.2 Problem Statement
The original Longevity World Cup successfully created engagement around biological age reversal, but opportunities exist to:
- Improve user experience and mobile responsiveness
- Enhance data verification and trust mechanisms
- Expand community engagement features
- Modernize the technical architecture
- Add richer analytics and insights for participants

### 1.3 Target Users
- **Primary:** Biohackers, longevity enthusiasts, health optimization practitioners
- **Secondary:** Researchers, health coaches, wellness influencers
- **Tertiary:** General public interested in longevity science

---

## 2. Current State Analysis

### 2.1 Existing Features (Original Platform)

| Feature | Description | Status |
|---------|-------------|--------|
| Leaderboard | Rankings by age reduction | Core |
| PhenoAge Calculator | Biological age from biomarkers | Core |
| Athlete Profiles | Individual pages with history | Core |
| Guess My Age Game | Interactive age guessing | Engagement |
| Bitcoin Donations | Prize pool funding | Monetization |
| Division System | Men's, Women's, Open | Segmentation |
| Generation Leagues | Silent Gen to Gen Alpha | Segmentation |
| Badge System | Achievement recognition | Gamification |
| Event Feed | Real-time activity stream | Social |
| Biomarker Charts | Visual data tracking | Analytics |

### 2.2 Technical Stack (Original)
- Chart.js for data visualization
- AOS (Animate On Scroll) library
- LocalStorage for user preferences
- Bitcoin API integration
- GitHub-hosted ruleset documentation

### 2.3 Identified Improvement Areas
1. **Authentication:** No user accounts system
2. **Data Submission:** Manual process via email
3. **Verification:** Limited proof validation
4. **Mobile:** Needs optimization
5. **Social:** Limited community interaction
6. **Analytics:** Basic charting only
7. **Internationalization:** English only

---

## 3. Product Requirements

### 3.1 Core Features (MVP)

#### 3.1.1 User Authentication & Profiles
- **REQ-001:** OAuth integration (Google, Apple, GitHub)
- **REQ-002:** Email/password authentication
- **REQ-003:** Athlete profile creation wizard
- **REQ-004:** Profile verification system (ID + biomarker proof)
- **REQ-005:** Privacy controls for data visibility
- **REQ-006:** Profile badges and achievement display

#### 3.1.2 Leaderboard System
- **REQ-010:** Real-time global leaderboard
- **REQ-011:** Multi-league filtering (Division, Generation, Custom)
- **REQ-012:** Historical rank tracking with trends
- **REQ-013:** Rank change animations and notifications
- **REQ-014:** Search and advanced filtering
- **REQ-015:** Shareable leaderboard positions

#### 3.1.3 Biomarker Management
- **REQ-020:** Secure biomarker data submission
- **REQ-021:** Lab report upload with OCR extraction
- **REQ-022:** Manual biomarker entry with validation
- **REQ-023:** PhenoAge auto-calculation engine
- **REQ-024:** Biomarker history visualization
- **REQ-025:** Z-score comparison against population
- **REQ-026:** Trend analysis and predictions

**Required Biomarkers:**
| Biomarker | Unit | Normal Range |
|-----------|------|--------------|
| Albumin | g/dL | 3.5-5.0 |
| Creatinine | mg/dL | 0.6-1.2 |
| Glucose | mg/dL | 70-100 |
| C-Reactive Protein (CRP) | mg/L | 0-3.0 |
| White Blood Cell Count | K/uL | 4.5-11.0 |
| Lymphocyte Percentage | % | 20-40 |
| Mean Corpuscular Volume (MCV) | fL | 80-100 |
| Red Cell Distribution Width (RDW) | % | 11.5-14.5 |
| Alkaline Phosphatase (ALP) | U/L | 44-147 |

#### 3.1.4 Competition System
- **REQ-030:** Annual season structure with clear dates
- **REQ-031:** Prize pool tracking (crypto + fiat)
- **REQ-032:** Automated prize distribution smart contracts
- **REQ-033:** Podium display with animations
- **REQ-034:** Season archives and historical data
- **REQ-035:** Competition rules engine

#### 3.1.5 Gamification
- **REQ-040:** "Guess My Age" interactive game
- **REQ-041:** Badge/achievement system
- **REQ-042:** Streak tracking for submissions
- **REQ-043:** XP and level progression
- **REQ-044:** Challenges and mini-competitions
- **REQ-045:** Social sharing rewards

### 3.2 Enhanced Features (Post-MVP)

#### 3.2.1 Community & Social
- **REQ-050:** Athlete following system
- **REQ-051:** Comments and reactions on profiles
- **REQ-052:** Team/group competitions
- **REQ-053:** Forums/discussion boards
- **REQ-054:** Mentorship matching
- **REQ-055:** Protocol sharing marketplace

#### 3.2.2 Advanced Analytics
- **REQ-060:** AI-powered insights and recommendations
- **REQ-061:** Comparative analytics (peer groups)
- **REQ-062:** Intervention tracking correlation
- **REQ-063:** Biological age prediction models
- **REQ-064:** Export to health apps (Apple Health, Google Fit)
- **REQ-065:** Research data contribution (anonymized)

#### 3.2.3 Monetization
- **REQ-070:** Premium subscription tier
- **REQ-071:** Sponsor/partner integration
- **REQ-072:** NFT badges for achievements
- **REQ-073:** Merchandise store integration
- **REQ-074:** Coaching marketplace

#### 3.2.4 Internationalization
- **REQ-080:** Multi-language support (10+ languages)
- **REQ-081:** Regional leaderboards
- **REQ-082:** Currency localization
- **REQ-083:** Lab result format standardization

---

## 4. Technical Architecture

### 4.1 Recommended Stack

#### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Radix UI
- **State:** Zustand or Jotai
- **Charts:** Recharts or D3.js
- **Animations:** Framer Motion

#### Backend
- **Runtime:** Node.js / Bun
- **Framework:** Hono or Fastify
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Search:** Meilisearch or Algolia

#### Infrastructure
- **Hosting:** Vercel / Railway / AWS
- **CDN:** Cloudflare
- **Auth:** Clerk or Auth.js
- **Payments:** Stripe + Crypto (Bitcoin, ETH)
- **Storage:** S3-compatible (R2, Supabase Storage)

### 4.2 API Design
```
/api/v1/
├── auth/
│   ├── login
│   ├── register
│   └── verify
├── athletes/
│   ├── [id]
│   ├── leaderboard
│   └── search
├── biomarkers/
│   ├── submit
│   ├── history
│   └── calculate-phenoage
├── competitions/
│   ├── current
│   ├── seasons
│   └── prizes
├── games/
│   └── guess-age
└── admin/
    ├── verify-athlete
    └── moderation
```

### 4.3 Data Models

```typescript
// Core Entities
Athlete {
  id: UUID
  userId: UUID
  displayName: string
  chronologicalAge: number
  division: enum
  generation: enum
  profilePicture: string
  verified: boolean
  createdAt: timestamp
}

BiomarkerSubmission {
  id: UUID
  athleteId: UUID
  submittedAt: timestamp
  biomarkers: JSON
  phenoAge: number
  proofImages: string[]
  verified: boolean
  verifiedBy: UUID
}

LeaderboardEntry {
  athleteId: UUID
  seasonId: UUID
  rank: number
  ageReduction: number
  paceOfAging: number
  updatedAt: timestamp
}

Season {
  id: UUID
  name: string
  startDate: timestamp
  endDate: timestamp
  prizePool: number
  status: enum
}
```

### 4.4 Security Requirements
- **SEC-001:** End-to-end encryption for biomarker data
- **SEC-002:** HIPAA-compliant data handling
- **SEC-003:** Rate limiting on all API endpoints
- **SEC-004:** Proof of identity verification
- **SEC-005:** Audit logging for data access
- **SEC-006:** Regular security audits

---

## 5. User Experience

### 5.1 User Journeys

#### Journey 1: New Athlete Registration
1. Land on homepage → View leaderboard
2. Click "Join Competition"
3. Create account (OAuth or email)
4. Complete profile wizard
5. Upload first biomarker results
6. Receive calculated PhenoAge
7. Appear on leaderboard

#### Journey 2: Returning Athlete Submission
1. Login to dashboard
2. Navigate to "Submit Biomarkers"
3. Upload lab report or enter manually
4. System validates and calculates
5. View updated rank and progress
6. Share achievement socially

#### Journey 3: Visitor Engagement
1. Browse leaderboard
2. Click athlete profile
3. Play "Guess My Age" game
4. View biomarker charts
5. Subscribe to newsletter
6. Consider joining

### 5.2 Design System

#### Colors
| Role | Color | Hex |
|------|-------|-----|
| Primary | Cyan | #00BCD4 |
| Secondary | Magenta | #FF4081 |
| Success | Green | #4CAF50 |
| Warning | Amber | #FFC107 |
| Error | Red | #F44336 |
| Background | Dark | #1A1A2E |
| Surface | Dark Gray | #16213E |
| Text | White | #FFFFFF |

#### Typography
- **Headings:** Orbitron (display font)
- **Body:** Inter or Roboto
- **Monospace:** JetBrains Mono (data)

#### Components
- Card radius: 16px
- Button radius: 8px
- Shadows: Subtle with glow effects
- Animations: Smooth, purposeful (300ms default)

### 5.3 Responsive Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Wide:** 1440px+

---

## 6. Success Metrics

### 6.1 Key Performance Indicators (KPIs)

| Metric | Target (Year 1) | Measurement |
|--------|-----------------|-------------|
| Registered Athletes | 1,000+ | Monthly count |
| Active Submissions | 500+/month | Biomarker uploads |
| Guess My Age Plays | 10,000+/month | Game interactions |
| Prize Pool | $100,000+ | Total donations |
| Mobile Usage | 60%+ | Device analytics |
| Retention Rate | 40%+ | Monthly active users |

### 6.2 Quality Metrics
- Page Load Time: < 2 seconds
- API Response Time: < 200ms (p95)
- Uptime: 99.9%
- Mobile Lighthouse Score: 90+

---

## 7. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Biomarker fraud | High | Medium | Multi-factor verification, lab integration |
| Data breach | Critical | Low | Encryption, audits, minimal data retention |
| Low adoption | High | Medium | Marketing, partnerships, influencer outreach |
| Regulatory issues | High | Low | Legal review, HIPAA compliance |
| Technical debt | Medium | Medium | Code reviews, testing, documentation |

---

## 8. Timeline & Milestones

### Phase 1: Foundation (Weeks 1-4)
- Project setup and architecture
- Core database design
- Authentication system
- Basic UI components

### Phase 2: Core Features (Weeks 5-10)
- Athlete profiles and registration
- Biomarker submission system
- PhenoAge calculator
- Leaderboard implementation

### Phase 3: Gamification (Weeks 11-14)
- Guess My Age game
- Badge system
- Achievement tracking
- Social sharing

### Phase 4: Polish & Launch (Weeks 15-18)
- Performance optimization
- Security hardening
- Beta testing
- Production deployment

### Phase 5: Enhancement (Post-Launch)
- Community features
- Advanced analytics
- Mobile app consideration
- International expansion

---

## 9. Appendices

### A. PhenoAge Calculation Formula

PhenoAge is calculated using the following biomarkers with the Levine et al. formula:

```
PhenoAge = 141.50225 + ln(-0.00553 × ln(1 - xb)) / 0.090165

where xb is derived from:
- Albumin (g/dL)
- Creatinine (mg/dL)
- Glucose (mg/dL)
- CRP (mg/L) - log transformed
- Lymphocyte percentage
- Mean cell volume (fL)
- Red cell distribution width (%)
- Alkaline phosphatase (U/L)
- White blood cell count (1000 cells/uL)
- Chronological age
```

### B. Competition Rules Summary
1. Must submit valid biomarkers from accredited lab
2. Proof of identity required for verification
3. One submission per competition period
4. Rankings based on age reduction (chronological - biological)
5. Ties broken by earliest submission
6. Disputes reviewed by organizing committee

### C. Glossary
- **PhenoAge:** Phenotypic age calculated from biomarkers
- **Age Reduction:** Chronological age minus biological age
- **Pace of Aging:** Biological age / Chronological age ratio
- **Division:** Gender-based competition category
- **Generation:** Birth-year-based competition category

---

**Document Approval**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Design Lead | | | |
| Stakeholder | | | |

---

*This PRD is a living document and will be updated as requirements evolve.*
