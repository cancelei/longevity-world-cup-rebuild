# Badge Integration Documentation

This document describes all integration points where badges are automatically awarded in the Longevity World Cup application.

## Overview

The badge system uses the `badgeService.checkAndAwardBadges(athleteId)` function to automatically check eligibility and award badges throughout the user journey. The service is integrated at key touchpoints and runs asynchronously to avoid blocking the main flow.

## Integration Points

### 1. Athlete Verification
**File**: `src/app/api/admin/athletes/[id]/verify/route.ts`
**Trigger**: When an admin verifies an athlete's profile
**Badges Awarded**:
- `verified` - ACHIEVEMENT badge for completing identity verification
- `consistency` - ACHIEVEMENT badge if athlete has 3+ season submissions
- Any other eligible ACHIEVEMENT badges based on athlete's history

**Flow**:
```typescript
// After athlete status updated to VERIFIED
badgeService.checkAndAwardBadges(athleteId).catch((err) => {
  console.error("Failed to check and award badges:", err);
});
```

### 2. Submission Approval
**File**: `src/app/api/admin/submissions/[id]/approve/route.ts`
**Trigger**: When an admin approves a biomarker submission
**Badges Awarded**:
- `age-bender` - MILESTONE badge for 5+ years age reduction
- `super-ager` - MILESTONE badge for 10+ years age reduction
- `pace-master` - MILESTONE badge for pace of aging < 0.75
- `rising-star` - IMPROVEMENT badge for consistent improvement
- `inflammation-fighter` - BIOMARKER badge for CRP < 1.0
- `glucose-guru` - BIOMARKER badge for glucose < 95
- `winter-warrior`, `summer-solstice` - SEASONAL badges based on submission date

**Flow**:
```typescript
// After submission approved and leaderboard updated
badgeService.checkAndAwardBadges(submission.athleteId).catch((err) => {
  console.error("Failed to check and award badges:", err);
});
```

### 3. League Membership
**File**: `src/app/api/leagues/[slug]/members/route.ts`
**Trigger**: When an athlete joins a league
**Badges Awarded**:
- `team-player` - LEAGUE badge for joining first league
- `league-founder` - LEAGUE badge if athlete is among first 10 members
- `league-champion` - LEAGUE badge if athlete has won a league competition

**Flow**:
```typescript
// After league membership created
badgeService.checkAndAwardBadges(athlete.id).catch((err) => {
  console.error("Failed to check and award badges:", err);
});
```

### 4. Season Completion
**File**: `src/app/api/admin/seasons/[id]/complete/route.ts`
**Trigger**: When an admin manually completes a season
**Badges Awarded**:
- `champion` - COMPETITION badge for 1st place
- `podium-finisher` - COMPETITION badge for top 3
- `rising-star` - COMPETITION badge for significant rank improvement

**Flow**:
```typescript
// After season status updated to COMPLETED
const finalRankings = await prisma.leaderboardEntry.findMany({
  where: { seasonId: id },
  orderBy: { rank: "asc" },
  take: 10,
});

const badgeAwardPromises = finalRankings.map((entry) =>
  badgeService.checkAndAwardBadges(entry.athleteId).catch((err) => {
    console.error(`Failed to check and award badges for athlete ${entry.athleteId}:`, err);
  })
);

await Promise.allSettled(badgeAwardPromises);
```

## Badge Categories and Rules

### ACHIEVEMENT (5 badges)
- **verified**: Athlete status = VERIFIED
- **consistency**: 3+ approved submissions across different seasons
- **pioneer**: Among first 100 athletes (id <= 100)
- **early-adopter**: Joined during first 6 months
- **ambassador**: Referred 5+ athletes

### MILESTONE (7 badges)
- **age-bender**: Any submission with ageReduction >= 5
- **super-ager**: Any submission with ageReduction >= 10
- **pace-master**: Any submission with paceOfAging < 0.75
- **perfect-score**: Any submission with ageReduction >= 15
- **marathon-runner**: 10+ approved submissions
- **centenarian-path**: Projected to live 100+ years
- **time-lord**: 20+ years total age reduction

### COMPETITION (3 badges)
- **champion**: Rank 1 in any completed season
- **podium-finisher**: Rank 1-3 in any completed season
- **rising-star**: Rank improved by 10+ positions between seasons

### LEAGUE (4 badges)
- **team-player**: Member of 1+ leagues
- **league-founder**: Among first 10 members of a league
- **league-champion**: Rank 1 in league leaderboard
- **multi-league**: Member of 3+ leagues simultaneously

### BIOMARKER (7 badges)
- **inflammation-fighter**: CRP < 1.0
- **glucose-guru**: Glucose < 95
- **kidney-king**: Creatinine optimal range
- **liver-legend**: ALP optimal range
- **blood-master**: All biomarkers in optimal range
- **albumin-ace**: Albumin > 4.5
- **perfect-labs**: All biomarkers perfect

### IMPROVEMENT (3 badges)
- **trending-up**: 3+ consecutive submissions with improving ageReduction
- **breakthrough**: Improved ageReduction by 5+ years in one season
- **consistency-king**: Maintained age reduction within 1 year variance

### SEASONAL (5 badges)
- **winter-warrior**: Submission in Dec-Feb
- **spring-renewal**: Submission in Mar-May
- **summer-solstice**: Submission in Jun-Aug
- **autumn-harvest**: Submission in Sep-Nov
- **year-round**: Submissions in all 4 seasons

### SCIENCE (3 badges)
- **ocr-pioneer**: 5+ OCR-extracted submissions
- **data-scientist**: Exported data 10+ times
- **research-contributor**: Participated in research studies

### COMMUNITY (4 badges)
- **helpful-hand**: Helped 10+ other athletes
- **mentor**: Mentored 5+ new athletes
- **event-organizer**: Organized a community event
- **top-contributor**: High community engagement score

### SPECIAL (3 badges)
- **first-blood**: First athlete to submit in a season
- **legendary**: Exceptional achievement across all categories
- **hall-of-fame**: Inducted into hall of fame

## Error Handling

All badge awarding is non-blocking and uses async error handling:

```typescript
badgeService.checkAndAwardBadges(athleteId).catch((err) => {
  console.error("Failed to check and award badges:", err);
});
```

This ensures that badge awarding failures don't block the main user flow (verification, submission approval, etc.).

## Badge Duplication Prevention

The `badgeService.awardBadge()` function checks if an athlete already has a badge before creating a new `AthleteBadge` record:

```typescript
const existingBadge = await prisma.athleteBadge.findUnique({
  where: {
    athleteId_badgeId: {
      athleteId,
      badgeId: badge.id,
    },
  },
});

if (existingBadge) {
  return null; // Already has this badge
}
```

## Events

When a badge is awarded, a `BADGE_EARNED` event is created:

```typescript
await prisma.event.create({
  data: {
    type: "BADGE_EARNED",
    athleteId,
    message: `${athlete.displayName} earned the "${badge.name}" badge`,
    data: {
      badgeId: badge.id,
      badgeName: badge.name,
      badgeCategory: badge.category,
    },
  },
});
```

These events can be used for:
- Real-time notifications
- Activity feeds
- Analytics
- Badge notification emails

## Testing

### Unit Tests
- `src/lib/badges/badge-service.test.ts` - Tests badge eligibility rules
- `src/components/features/badges/badge-display.test.tsx` - Tests UI components

### Manual Integration Testing

To test badge awarding end-to-end:

1. **Test Verification Badges**:
   - Create an athlete via API
   - Verify the athlete via `/api/admin/athletes/[id]/verify`
   - Check that `verified` badge was awarded

2. **Test Submission Badges**:
   - Submit biomarkers with 10+ age reduction
   - Approve via `/api/admin/submissions/[id]/approve`
   - Check that `super-ager` badge was awarded

3. **Test League Badges**:
   - Join a league via `/api/leagues/[slug]/members`
   - Check that `team-player` badge was awarded

4. **Test Competition Badges**:
   - Complete a season via `/api/admin/seasons/[id]/complete`
   - Check that top 3 athletes received `podium-finisher` badge
   - Check that 1st place received `champion` badge

## Future Enhancements

### Automatic Season Completion
Currently, seasons must be manually completed via the admin endpoint. Future enhancements could include:
- Scheduled job to auto-complete seasons after `endDate`
- Webhook to trigger badge awarding when external events occur
- Real-time badge notifications to athletes

### Badge Notifications
Add real-time notifications when badges are earned:
- WebSocket notifications
- Email notifications with badge image
- In-app toast notifications
- Social media sharing

### Badge Analytics
Track badge metrics:
- Which badges are most commonly earned
- Average time to earn each badge
- Badge distribution across divisions/generations
- Badge leaderboard (who has the most badges)
