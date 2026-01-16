import { PrismaClient } from "@prisma/client";
import { calculatePhenoAge, calculateAgeReduction, calculatePaceOfAging } from "../src/lib/phenoage";

const prisma = new PrismaClient();

// ============================================================================
// TEST ACCOUNTS FOR DEVELOPMENT
// ============================================================================
//
// These accounts are created with predefined Clerk test IDs for local development.
// To log in with these accounts in development:
//
// 1. Use Clerk's test mode (automatically enabled with test API keys)
// 2. Sign up/sign in using these emails - Clerk test mode allows any password
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ EMAIL                          │ ROLE    │ SCENARIO                        │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │ admin@test.longevityworldcup.com │ ADMIN   │ Full admin access, can verify  │
// │                                │         │ athletes and approve submissions │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │ pro@test.longevityworldcup.com  │ ATHLETE │ Top performer, 12+ yr reduction │
// │                                │         │ Multiple badges, league founder  │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │ regular@test.longevityworldcup.com │ ATHLETE │ Average user, 3 yr reduction  │
// │                                │         │ Member of 2 leagues, few badges  │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │ newbie@test.longevityworldcup.com │ ATHLETE │ New user, just onboarded       │
// │                                │         │ No submissions yet, 1 league     │
// ├─────────────────────────────────────────────────────────────────────────────┤
// │ pending@test.longevityworldcup.com │ USER    │ Signed up but not onboarded   │
// │                                │         │ No athlete profile yet           │
// └─────────────────────────────────────────────────────────────────────────────┘
//
// Password for all test accounts: Test123!
//
// ============================================================================

// Test user definitions with specific scenarios
const testUsers = [
  {
    email: "admin@test.longevityworldcup.com",
    clerkId: "user_test_admin_lwc_2024",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN" as const,
    createAthlete: true,
    athleteData: {
      displayName: "Admin Tester",
      slug: "admin-tester",
      bio: "Platform administrator and quality assurance lead.",
      age: 35,
      division: "MENS" as const,
      verified: true,
    },
  },
  {
    email: "pro@test.longevityworldcup.com",
    clerkId: "user_test_pro_lwc_2024",
    firstName: "Pro",
    lastName: "Athlete",
    role: "ATHLETE" as const,
    createAthlete: true,
    athleteData: {
      displayName: "Pro Performer",
      slug: "pro-performer",
      bio: "Elite biohacker with 5+ years of tracked optimization. Top 3 global ranking.",
      age: 45,
      division: "MENS" as const,
      verified: true,
      biomarkerIndex: 0, // Best biomarkers
    },
  },
  {
    email: "regular@test.longevityworldcup.com",
    clerkId: "user_test_regular_lwc_2024",
    firstName: "Regular",
    lastName: "User",
    role: "ATHLETE" as const,
    createAthlete: true,
    athleteData: {
      displayName: "Regular Optimizer",
      slug: "regular-optimizer",
      bio: "Casual longevity enthusiast tracking progress over time.",
      age: 42,
      division: "WOMENS" as const,
      verified: true,
      biomarkerIndex: 2, // Average biomarkers
    },
  },
  {
    email: "newbie@test.longevityworldcup.com",
    clerkId: "user_test_newbie_lwc_2024",
    firstName: "New",
    lastName: "Member",
    role: "ATHLETE" as const,
    createAthlete: true,
    athleteData: {
      displayName: "Newbie Explorer",
      slug: "newbie-explorer",
      bio: "Just started my longevity journey!",
      age: 28,
      division: "OPEN" as const,
      verified: false,
      biomarkerIndex: null, // No submissions yet
    },
  },
  {
    email: "pending@test.longevityworldcup.com",
    clerkId: "user_test_pending_lwc_2024",
    firstName: "Pending",
    lastName: "Signup",
    role: "USER" as const,
    createAthlete: false, // User signed up but hasn't completed onboarding
  },
];

// Helper to generate birth year from age
function birthYearFromAge(age: number): number {
  return new Date().getFullYear() - age;
}

// Helper to determine generation from birth year
function getGeneration(birthYear: number): "SILENT" | "BOOMER" | "GENX" | "MILLENNIAL" | "GENZ" | "GENALPHA" {
  if (birthYear < 1946) return "SILENT";
  if (birthYear < 1965) return "BOOMER";
  if (birthYear < 1981) return "GENX";
  if (birthYear < 1997) return "MILLENNIAL";
  if (birthYear < 2013) return "GENZ";
  return "GENALPHA";
}

// Sample biomarker data sets (realistic values)
const biomarkerSets = [
  // Excellent - very young biological age
  { albumin: 4.8, creatinine: 0.9, glucose: 82, crp: 0.3, lymphocytePercent: 35, mcv: 88, rdw: 12.1, alp: 55, wbc: 5.5 },
  // Good
  { albumin: 4.5, creatinine: 1.0, glucose: 88, crp: 0.8, lymphocytePercent: 32, mcv: 90, rdw: 12.5, alp: 65, wbc: 6.0 },
  // Average
  { albumin: 4.2, creatinine: 1.1, glucose: 95, crp: 1.5, lymphocytePercent: 28, mcv: 92, rdw: 13.2, alp: 78, wbc: 6.8 },
  // Below average
  { albumin: 4.0, creatinine: 1.2, glucose: 102, crp: 2.5, lymphocytePercent: 25, mcv: 95, rdw: 14.0, alp: 95, wbc: 7.5 },
  // Poor
  { albumin: 3.8, creatinine: 1.3, glucose: 110, crp: 4.0, lymphocytePercent: 22, mcv: 98, rdw: 14.8, alp: 120, wbc: 8.5 },
];

// Sample athletes data
const athletesData = [
  { name: "Bryan Johnson", age: 47, division: "MENS" as const, bio: "Tech entrepreneur and founder of Blueprint. Pioneering age reversal protocols." },
  { name: "Dave Asprey", age: 51, division: "MENS" as const, bio: "Biohacker and author of The Bulletproof Diet. CEO of Upgrade Labs." },
  { name: "Peter Attia", age: 51, division: "MENS" as const, bio: "Physician focused on longevity medicine and host of The Drive podcast." },
  { name: "Rhonda Patrick", age: 43, division: "WOMENS" as const, bio: "Biomedical scientist and founder of FoundMyFitness." },
  { name: "Sandra Kaufmann", age: 58, division: "WOMENS" as const, bio: "Chief of Pediatric Anesthesia and author of The Kaufmann Protocol." },
  { name: "David Sinclair", age: 54, division: "MENS" as const, bio: "Harvard professor and author of Lifespan. Leading aging researcher." },
  { name: "Valter Longo", age: 57, division: "MENS" as const, bio: "Director of USC Longevity Institute. Creator of the Fasting Mimicking Diet." },
  { name: "Aubrey de Grey", age: 61, division: "MENS" as const, bio: "Biomedical gerontologist and co-founder of SENS Research Foundation." },
  { name: "Elizabeth Parrish", age: 53, division: "WOMENS" as const, bio: "CEO of BioViva. First person to receive gene therapy to reverse aging." },
  { name: "Ben Greenfield", age: 43, division: "MENS" as const, bio: "Fitness and health consultant. Author and podcaster." },
  { name: "Siim Land", age: 29, division: "MENS" as const, bio: "Author and biohacker focused on metabolic health and longevity." },
  { name: "Matt Kaeberlein", age: 52, division: "MENS" as const, bio: "Professor at University of Washington. Dog Aging Project lead." },
  { name: "Morgan Levine", age: 38, division: "WOMENS" as const, bio: "Yale professor. Creator of PhenoAge biological age algorithm." },
  { name: "Andrew Huberman", age: 49, division: "MENS" as const, bio: "Stanford neuroscientist and host of Huberman Lab podcast." },
  { name: "Serena Williams", age: 43, division: "WOMENS" as const, bio: "Professional tennis player and wellness advocate." },
  { name: "Alex Zhavoronkov", age: 45, division: "MENS" as const, bio: "CEO of Insilico Medicine. AI and longevity researcher." },
  { name: "Nir Barzilai", age: 68, division: "MENS" as const, bio: "Director of Institute for Aging Research at Albert Einstein College." },
  { name: "Gary Brecka", age: 52, division: "MENS" as const, bio: "Human biologist and co-founder of 10X Health System." },
  { name: "James Clement", age: 65, division: "MENS" as const, bio: "Author of The Switch and supercentenarian researcher." },
  { name: "Liz Josefsberg", age: 50, division: "WOMENS" as const, bio: "Health and wellness coach. Weight loss expert." },
];

// Sample leagues data
const leaguesData = [
  {
    name: "Blueprint Clinic",
    slug: "blueprint-clinic",
    description: "Bryan Johnson's elite longevity clinic pushing the boundaries of age reversal.",
    type: "CLINIC" as const,
    tier: "PRO" as const,
    country: "USA",
    city: "San Francisco",
  },
  {
    name: "Upgrade Labs Network",
    slug: "upgrade-labs",
    description: "Dave Asprey's biohacking franchise helping people optimize their biology.",
    type: "CLINIC" as const,
    tier: "ENTERPRISE" as const,
    country: "USA",
    city: "Los Angeles",
  },
  {
    name: "Google Longevity Initiative",
    slug: "google-longevity",
    description: "Google's corporate wellness program focused on employee healthspan extension.",
    type: "CORPORATE" as const,
    tier: "ENTERPRISE" as const,
    country: "USA",
    city: "Mountain View",
  },
  {
    name: "Biohackers United",
    slug: "biohackers-united",
    description: "Global community of biohackers sharing protocols and competing together.",
    type: "COLLECTIVE" as const,
    tier: "STARTER" as const,
    country: "USA",
  },
  {
    name: "Singapore Health Hub",
    slug: "singapore-health-hub",
    description: "Singapore's national longevity initiative tracking population healthspan.",
    type: "GEOGRAPHIC" as const,
    tier: "PRO" as const,
    country: "Singapore",
    city: "Singapore",
  },
  {
    name: "Bay Area Optimizers",
    slug: "bay-area-optimizers",
    description: "San Francisco Bay Area biohacking collective.",
    type: "COLLECTIVE" as const,
    tier: "FREE" as const,
    country: "USA",
    city: "San Francisco",
  },
];

// Badge definitions organized by category
const badgeDefinitions = [
  // ============================================
  // ACHIEVEMENT - Completing specific actions
  // ============================================
  { name: "Verified Competitor", slug: "verified", description: "Completed identity and biomarker verification", icon: "badge-check", category: "ACHIEVEMENT" as const },
  { name: "Consistency King", slug: "consistency", description: "Submitted biomarkers for 3 consecutive seasons", icon: "calendar-check", category: "ACHIEVEMENT" as const },

  // ============================================
  // MILESTONE - Reaching quantitative goals
  // ============================================
  { name: "Age Bender", slug: "age-bender", description: "Achieved 5+ years of biological age reduction", icon: "clock-rewind", category: "MILESTONE" as const },
  { name: "Super Ager", slug: "super-ager", description: "Achieved 10+ years of biological age reduction", icon: "zap", category: "MILESTONE" as const },
  { name: "Data Scientist", slug: "data-scientist", description: "Submitted 10+ biomarker reports", icon: "chart-line", category: "MILESTONE" as const },

  // ============================================
  // COMPETITION - Ranking-based achievements
  // ============================================
  { name: "Top 10", slug: "top-10", description: "Reached top 10 on the global leaderboard", icon: "trophy", category: "COMPETITION" as const },
  { name: "Podium Finish", slug: "podium", description: "Finished in top 3 for a season", icon: "medal", category: "COMPETITION" as const },

  // ============================================
  // COMMUNITY - Social and helping others
  // ============================================
  { name: "Community Champion", slug: "community", description: "Helped 10+ athletes with their protocols", icon: "users", category: "COMMUNITY" as const },

  // ============================================
  // SPECIAL - Rare/unique achievements
  // ============================================
  { name: "Pioneer", slug: "pioneer", description: "One of the first 100 athletes to join", icon: "rocket", category: "SPECIAL" as const },
  { name: "Perfect Score", slug: "perfect-score", description: "All biomarkers in optimal range", icon: "star", category: "SPECIAL" as const },

  // ============================================
  // LEAGUE - Team-based achievements
  // ============================================
  { name: "League Founder", slug: "league-founder", description: "Created a league with 10+ members", icon: "building", category: "LEAGUE" as const },
  { name: "League Champion", slug: "league-champion", description: "Member of a season-winning league", icon: "crown", category: "LEAGUE" as const },
  { name: "Team Player", slug: "team-player", description: "Active member in 3 leagues simultaneously", icon: "users", category: "LEAGUE" as const },
  { name: "League MVP", slug: "league-mvp", description: "Top performer in your league for a season", icon: "swords", category: "LEAGUE" as const },

  // ============================================
  // BIOMARKER - Specific biomarker excellence
  // ============================================
  { name: "Inflammation Fighter", slug: "inflammation-fighter", description: "Maintained CRP < 1.0 mg/L for 3 submissions", icon: "shield", category: "BIOMARKER" as const },
  { name: "Metabolic Master", slug: "metabolic-master", description: "Fasting glucose in optimal range for 5 submissions", icon: "activity", category: "BIOMARKER" as const },
  { name: "Iron Will", slug: "iron-will", description: "Optimal RDW and MCV for 3 consecutive submissions", icon: "heart-pulse", category: "BIOMARKER" as const },
  { name: "Clean Machine", slug: "clean-machine", description: "All 9 biomarkers improved in a single submission", icon: "sparkles", category: "BIOMARKER" as const },
  { name: "Kidney King", slug: "kidney-king", description: "Creatinine in optimal range for 5 submissions", icon: "droplets", category: "BIOMARKER" as const },
  { name: "Liver Legend", slug: "liver-legend", description: "ALP in optimal range for 5 submissions", icon: "flask", category: "BIOMARKER" as const },

  // ============================================
  // IMPROVEMENT - Progress tracking
  // ============================================
  { name: "Rising Star", slug: "rising-star", description: "Achieved biggest age reduction improvement in a season", icon: "trending", category: "IMPROVEMENT" as const },
  { name: "Comeback Kid", slug: "comeback-kid", description: "Improved 3+ years after a previous decline", icon: "target", category: "IMPROVEMENT" as const },
  { name: "Steady Climber", slug: "steady-climber", description: "Improved age reduction for 5 submissions in a row", icon: "chart-line", category: "IMPROVEMENT" as const },
  { name: "Breakthrough", slug: "breakthrough", description: "First time breaking 5-year age reduction barrier", icon: "zap", category: "IMPROVEMENT" as const },
  { name: "Unstoppable", slug: "unstoppable", description: "Maintained improvement streak for 10+ submissions", icon: "flame", category: "IMPROVEMENT" as const },

  // ============================================
  // SEASONAL - Time-limited events
  // ============================================
  { name: "Founding Season", slug: "founding-season", description: "Participated in Season 1", icon: "star", category: "SEASONAL" as const },
  { name: "Winter Warrior", slug: "winter-warrior", description: "Submitted during the December challenge", icon: "snowflake", category: "SEASONAL" as const },
  { name: "Summer Soldier", slug: "summer-soldier", description: "Submitted during the Summer challenge", icon: "sun", category: "SEASONAL" as const },
  { name: "Anniversary Athlete", slug: "anniversary", description: "Active on the platform for 1 year", icon: "gift", category: "SEASONAL" as const },
  { name: "Beta Tester", slug: "beta-tester", description: "Participated in platform beta testing", icon: "flask", category: "SEASONAL" as const },
  { name: "Holiday Hero", slug: "holiday-hero", description: "Submitted during the holiday season", icon: "party", category: "SEASONAL" as const },

  // ============================================
  // SCIENCE - Research contribution
  // ============================================
  { name: "OCR Pioneer", slug: "ocr-pioneer", description: "One of the first 100 to use OCR lab report upload", icon: "file-search", category: "SCIENCE" as const },
  { name: "Data Donor", slug: "data-donor", description: "Opted in to anonymized research data sharing", icon: "database", category: "SCIENCE" as const },
  { name: "Format Finder", slug: "format-finder", description: "Helped identify a new lab report format", icon: "microscope", category: "SCIENCE" as const },
  { name: "Feedback Champion", slug: "feedback-champion", description: "Provided valuable platform feedback", icon: "message", category: "SCIENCE" as const },
  { name: "Research Ally", slug: "research-ally", description: "Participated in a longevity research study", icon: "beaker", category: "SCIENCE" as const },
  { name: "Protocol Pioneer", slug: "protocol-pioneer", description: "Shared a successful longevity protocol", icon: "lightbulb", category: "SCIENCE" as const },
];

async function main() {
  console.log("Seeding database...\n");

  // Clear existing data (order matters due to foreign keys)
  console.log("Clearing existing data...");
  await prisma.ageGuess.deleteMany();
  await prisma.guessMyAgeGame.deleteMany();
  await prisma.event.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.athleteBadge.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.leagueLeaderboardEntry.deleteMany();
  await prisma.biomarkerSubmission.deleteMany();
  await prisma.leagueSubscription.deleteMany();
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.athlete.deleteMany();
  await prisma.season.deleteMany();
  await prisma.user.deleteMany();

  // Create badges
  console.log("Creating badges...");
  const badges = await Promise.all(
    badgeDefinitions.map((badge) =>
      prisma.badge.create({
        data: badge,
      })
    )
  );
  console.log(`  Created ${badges.length} badges`);

  // Create seasons
  console.log("Creating seasons...");
  const currentYear = new Date().getFullYear();

  const seasons = await Promise.all([
    prisma.season.create({
      data: {
        name: `Season ${currentYear}`,
        year: currentYear,
        slug: `season-${currentYear}`,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
        submissionDeadline: new Date(`${currentYear}-11-30`),
        status: "ACTIVE",
        prizePoolBTC: 0.85,
        prizePoolUSD: 42500,
        prizeGoalBTC: 1.0,
        prizeGoalUSD: 100000,
        bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
    }),
    prisma.season.create({
      data: {
        name: `Season ${currentYear - 1}`,
        year: currentYear - 1,
        slug: `season-${currentYear - 1}`,
        startDate: new Date(`${currentYear - 1}-01-01`),
        endDate: new Date(`${currentYear - 1}-12-31`),
        submissionDeadline: new Date(`${currentYear - 1}-11-30`),
        status: "COMPLETED",
        prizePoolBTC: 1.2,
        prizePoolUSD: 78000,
        prizeGoalBTC: 1.0,
        prizeGoalUSD: 100000,
        bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
    }),
    prisma.season.create({
      data: {
        name: `Season ${currentYear + 1}`,
        year: currentYear + 1,
        slug: `season-${currentYear + 1}`,
        startDate: new Date(`${currentYear + 1}-01-01`),
        endDate: new Date(`${currentYear + 1}-12-31`),
        submissionDeadline: new Date(`${currentYear + 1}-11-30`),
        status: "UPCOMING",
        prizePoolBTC: 0.15,
        prizePoolUSD: 7500,
        prizeGoalBTC: 1.5,
        prizeGoalUSD: 150000,
        bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      },
    }),
  ]);
  console.log(`  Created ${seasons.length} seasons`);

  const activeSeason = seasons[0];
  const pastSeason = seasons[1];

  // ============================================
  // Create Test Users (for development)
  // ============================================
  console.log("Creating test users...");
  const testUserAthletes: { user: Awaited<ReturnType<typeof prisma.user.create>>; athlete: Awaited<ReturnType<typeof prisma.athlete.create>> | null }[] = [];

  for (const testUser of testUsers) {
    const user = await prisma.user.create({
      data: {
        clerkId: testUser.clerkId,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
      },
    });

    let athlete = null;
    if (testUser.createAthlete && testUser.athleteData) {
      const birthYear = birthYearFromAge(testUser.athleteData.age);
      const generation = getGeneration(birthYear);

      athlete = await prisma.athlete.create({
        data: {
          userId: user.id,
          displayName: testUser.athleteData.displayName,
          slug: testUser.athleteData.slug,
          bio: testUser.athleteData.bio,
          birthYear,
          chronologicalAge: testUser.athleteData.age,
          division: testUser.athleteData.division,
          generation,
          status: testUser.athleteData.verified ? "VERIFIED" : "PENDING",
          verified: testUser.athleteData.verified,
          verifiedAt: testUser.athleteData.verified ? new Date() : null,
        },
      });
    }

    testUserAthletes.push({ user, athlete });
  }
  console.log(`  Created ${testUsers.length} test users`);
  console.log("  Test accounts:");
  testUsers.forEach((u) => {
    console.log(`    - ${u.email} (${u.role})`);
  });

  // Create users and athletes
  console.log("Creating athletes...");
  const createdAthletes = [];

  for (let i = 0; i < athletesData.length; i++) {
    const athleteData = athletesData[i];
    const birthYear = birthYearFromAge(athleteData.age);
    const generation = getGeneration(birthYear);
    const slug = athleteData.name.toLowerCase().replace(/\s+/g, "-");

    // Create user first
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_${slug}_${Date.now()}_${i}`,
        email: `${slug}@longevityworldcup.com`,
        firstName: athleteData.name.split(" ")[0],
        lastName: athleteData.name.split(" ").slice(1).join(" "),
        role: "ATHLETE",
      },
    });

    // Create athlete
    const athlete = await prisma.athlete.create({
      data: {
        userId: user.id,
        displayName: athleteData.name,
        slug,
        bio: athleteData.bio,
        birthYear,
        chronologicalAge: athleteData.age,
        division: athleteData.division,
        generation,
        status: i < 15 ? "VERIFIED" : "PENDING",
        verified: i < 15,
        verifiedAt: i < 15 ? new Date() : null,
        twitter: `@${slug.replace("-", "")}`,
        website: `https://${slug}.com`,
      },
    });

    createdAthletes.push({ user, athlete, data: athleteData });
  }
  console.log(`  Created ${createdAthletes.length} athletes`);

  // Create leagues (owned by first few users)
  console.log("Creating leagues...");
  const createdLeagues = [];

  for (let i = 0; i < leaguesData.length; i++) {
    const leagueData = leaguesData[i];
    const ownerIndex = i % createdAthletes.length;
    const owner = createdAthletes[ownerIndex].user;

    const league = await prisma.league.create({
      data: {
        ...leagueData,
        ownerId: owner.id,
        status: leagueData.tier === "FREE" ? "PENDING" : "ACTIVE", // Payment-gated
        verified: leagueData.tier !== "FREE",
        verifiedAt: leagueData.tier !== "FREE" ? new Date() : null,
        verifiedBy: leagueData.tier !== "FREE" ? "PAYMENT_AUTO" : null,
      },
    });
    createdLeagues.push(league);
  }
  console.log(`  Created ${createdLeagues.length} leagues`);

  // Assign athletes to leagues (each athlete joins 1-3 leagues)
  console.log("Creating league memberships...");
  let membershipCount = 0;

  for (let i = 0; i < createdAthletes.length; i++) {
    const { athlete } = createdAthletes[i];

    // Each athlete joins 1-3 leagues based on their index
    const numLeagues = Math.min(3, (i % 3) + 1);

    for (let j = 0; j < numLeagues; j++) {
      const leagueIndex = (i + j) % createdLeagues.length;
      const league = createdLeagues[leagueIndex];

      // First athlete in each league becomes ADMIN, second becomes CAPTAIN
      let role: "ADMIN" | "CAPTAIN" | "MEMBER" = "MEMBER";
      if (j === 0 && i < leaguesData.length) role = "ADMIN";
      else if (j === 0 && i < leaguesData.length * 2) role = "CAPTAIN";

      await prisma.leagueMember.create({
        data: {
          leagueId: league.id,
          athleteId: athlete.id,
          role,
        },
      });
      membershipCount++;
    }
  }
  console.log(`  Created ${membershipCount} league memberships`);

  // Create biomarker submissions
  console.log("Creating biomarker submissions...");
  let submissionCount = 0;
  const leaderboardData: { athleteId: string; leagueId: string; phenoAge: number; ageReduction: number; paceOfAging: number; chronologicalAge: number }[] = [];

  // Get athlete's first league membership for submissions
  const athleteLeagues = new Map<string, string>();
  for (const { athlete } of createdAthletes) {
    const membership = await prisma.leagueMember.findFirst({
      where: { athleteId: athlete.id },
    });
    if (membership) {
      athleteLeagues.set(athlete.id, membership.leagueId);
    }
  }

  for (let i = 0; i < createdAthletes.length; i++) {
    const { athlete, data } = createdAthletes[i];
    const leagueId = athleteLeagues.get(athlete.id)!;

    // Select biomarkers - better athletes get better biomarkers
    const biomarkerIndex = Math.min(i % 5, biomarkerSets.length - 1);
    const biomarkers = biomarkerSets[biomarkerIndex];

    // Calculate PhenoAge
    const phenoAge = calculatePhenoAge({
      ...biomarkers,
      chronologicalAge: data.age,
    });
    const ageReduction = calculateAgeReduction(data.age, phenoAge);
    const paceOfAging = calculatePaceOfAging(data.age, phenoAge);

    // Create submission for current season (tied to league)
    await prisma.biomarkerSubmission.create({
      data: {
        athleteId: athlete.id,
        seasonId: activeSeason.id,
        leagueId, // REQUIRED - leagues-first architecture
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        ...biomarkers,
        phenoAge,
        ageReduction,
        paceOfAging,
        status: i < 15 ? "APPROVED" : "PENDING",
        verifiedAt: i < 15 ? new Date() : null,
        proofImages: JSON.stringify([`https://storage.longevityworldcup.com/proofs/${athlete.slug}-lab-report.pdf`]),
      },
    });
    submissionCount++;

    // Store for leaderboard
    if (i < 15) {
      leaderboardData.push({
        athleteId: athlete.id,
        leagueId,
        phenoAge,
        ageReduction,
        paceOfAging,
        chronologicalAge: data.age,
      });
    }

    // Create submission for past season (for some athletes)
    if (i < 10) {
      const pastBiomarkers = biomarkerSets[Math.min((i + 1) % 5, biomarkerSets.length - 1)];
      const pastPhenoAge = calculatePhenoAge({
        ...pastBiomarkers,
        chronologicalAge: data.age - 1,
      });

      await prisma.biomarkerSubmission.create({
        data: {
          athleteId: athlete.id,
          seasonId: pastSeason.id,
          leagueId, // REQUIRED - leagues-first architecture
          submittedAt: new Date(`${currentYear - 1}-06-15`),
          ...pastBiomarkers,
          phenoAge: pastPhenoAge,
          ageReduction: (data.age - 1) - pastPhenoAge,
          paceOfAging: pastPhenoAge / (data.age - 1),
          status: "APPROVED",
          verifiedAt: new Date(`${currentYear - 1}-06-20`),
          proofImages: JSON.stringify([`https://storage.longevityworldcup.com/proofs/${athlete.slug}-lab-report-${currentYear - 1}.pdf`]),
        },
      });
      submissionCount++;
    }
  }
  console.log(`  Created ${submissionCount} biomarker submissions`);

  // Create leaderboard entries
  console.log("Creating leaderboard entries...");

  // Sort by age reduction (descending)
  leaderboardData.sort((a, b) => b.ageReduction - a.ageReduction);

  for (let rank = 0; rank < leaderboardData.length; rank++) {
    const entry = leaderboardData[rank];
    await prisma.leaderboardEntry.create({
      data: {
        athleteId: entry.athleteId,
        seasonId: activeSeason.id,
        rank: rank + 1,
        previousRank: rank < 10 ? rank + 2 : null, // Simulate rank changes
        bestPhenoAge: entry.phenoAge,
        bestAgeReduction: entry.ageReduction,
        bestPaceOfAging: entry.paceOfAging,
        submissionCount: 1,
        divisionRank: Math.floor(rank / 2) + 1,
        generationRank: Math.floor(rank / 3) + 1,
      },
    });
  }
  console.log(`  Created ${leaderboardData.length} leaderboard entries`);

  // Create league leaderboard entries
  console.log("Creating league leaderboard entries...");

  // Aggregate data by league
  const leagueStats = new Map<string, { ageReductions: number[]; totalMembers: number; activeMembers: number }>();

  for (const league of createdLeagues) {
    leagueStats.set(league.id, { ageReductions: [], totalMembers: 0, activeMembers: 0 });
  }

  // Count members per league
  const memberCounts = await prisma.leagueMember.groupBy({
    by: ['leagueId'],
    _count: { athleteId: true },
  });
  for (const mc of memberCounts) {
    const stats = leagueStats.get(mc.leagueId);
    if (stats) stats.totalMembers = mc._count.athleteId;
  }

  // Collect age reductions for verified athletes in each league
  for (const entry of leaderboardData) {
    const stats = leagueStats.get(entry.leagueId);
    if (stats) {
      stats.ageReductions.push(entry.ageReduction);
      stats.activeMembers++;
    }
  }

  // Calculate league scores and create entries
  const leagueLeaderboardData: { leagueId: string; avgAgeReduction: number; totalMembers: number; activeMembers: number; best: number; worst: number }[] = [];

  for (const [leagueId, stats] of leagueStats) {
    if (stats.ageReductions.length === 0) continue;

    // Top 10 scoring (or all if <10)
    const sorted = stats.ageReductions.sort((a, b) => b - a);
    const topN = sorted.slice(0, 10);
    const avgAgeReduction = topN.reduce((sum, v) => sum + v, 0) / topN.length;

    leagueLeaderboardData.push({
      leagueId,
      avgAgeReduction,
      totalMembers: stats.totalMembers,
      activeMembers: stats.activeMembers,
      best: sorted[0],
      worst: topN[topN.length - 1],
    });
  }

  // Sort leagues by avgAgeReduction and assign ranks
  leagueLeaderboardData.sort((a, b) => b.avgAgeReduction - a.avgAgeReduction);

  for (let rank = 0; rank < leagueLeaderboardData.length; rank++) {
    const entry = leagueLeaderboardData[rank];
    await prisma.leagueLeaderboardEntry.create({
      data: {
        leagueId: entry.leagueId,
        seasonId: activeSeason.id,
        rank: rank + 1,
        previousRank: rank < 3 ? rank + 2 : null,
        avgAgeReduction: entry.avgAgeReduction,
        totalMembers: entry.totalMembers,
        activeMembers: entry.activeMembers,
        bestIndividual: entry.best,
        worstIndividual: entry.worst,
      },
    });
  }
  console.log(`  Created ${leagueLeaderboardData.length} league leaderboard entries`);

  // Award badges to top athletes
  console.log("Awarding badges...");
  let badgeCount = 0;

  const pioneerBadge = badges.find((b) => b.slug === "pioneer")!;
  const verifiedBadge = badges.find((b) => b.slug === "verified")!;
  const ageBenderBadge = badges.find((b) => b.slug === "age-bender")!;
  const superAgerBadge = badges.find((b) => b.slug === "super-ager")!;
  const top10Badge = badges.find((b) => b.slug === "top-10")!;
  const podiumBadge = badges.find((b) => b.slug === "podium")!;

  for (let i = 0; i < Math.min(15, createdAthletes.length); i++) {
    const { athlete } = createdAthletes[i];
    const entry = leaderboardData.find((e) => e.athleteId === athlete.id);

    // Pioneer badge for first 15
    await prisma.athleteBadge.create({
      data: { athleteId: athlete.id, badgeId: pioneerBadge.id },
    });
    badgeCount++;

    // Verified badge
    await prisma.athleteBadge.create({
      data: { athleteId: athlete.id, badgeId: verifiedBadge.id },
    });
    badgeCount++;

    if (entry) {
      // Age bender for 5+ years reduction
      if (entry.ageReduction >= 5) {
        await prisma.athleteBadge.create({
          data: { athleteId: athlete.id, badgeId: ageBenderBadge.id },
        });
        badgeCount++;
      }

      // Super ager for 10+ years reduction
      if (entry.ageReduction >= 10) {
        await prisma.athleteBadge.create({
          data: { athleteId: athlete.id, badgeId: superAgerBadge.id },
        });
        badgeCount++;
      }

      // Top 10 badge
      const rank = leaderboardData.indexOf(entry) + 1;
      if (rank <= 10) {
        await prisma.athleteBadge.create({
          data: { athleteId: athlete.id, badgeId: top10Badge.id },
        });
        badgeCount++;
      }

      // Podium badge
      if (rank <= 3) {
        await prisma.athleteBadge.create({
          data: { athleteId: athlete.id, badgeId: podiumBadge.id },
        });
        badgeCount++;
      }
    }
  }
  console.log(`  Awarded ${badgeCount} badges`);

  // Create Guess My Age games
  console.log("Creating Guess My Age games...");
  let gameCount = 0;

  for (let i = 0; i < 10; i++) {
    const { athlete, data } = createdAthletes[i];

    const game = await prisma.guessMyAgeGame.create({
      data: {
        athleteId: athlete.id,
        totalGuesses: Math.floor(Math.random() * 500) + 50,
        averageGuess: data.age - (Math.random() * 10 - 3), // Slightly underestimate
      },
    });

    // Create some sample guesses
    for (let j = 0; j < 5; j++) {
      await prisma.ageGuess.create({
        data: {
          gameId: game.id,
          visitorId: `visitor_${Date.now()}_${j}`,
          guessedAge: data.age - Math.floor(Math.random() * 15 - 5),
          actualAge: data.age,
          difference: Math.floor(Math.random() * 10 - 5),
        },
      });
    }
    gameCount++;
  }
  console.log(`  Created ${gameCount} Guess My Age games`);

  // Create events
  console.log("Creating events...");
  const events = [];

  for (let i = 0; i < 10; i++) {
    const { athlete } = createdAthletes[i];

    events.push({
      type: "ATHLETE_JOINED" as const,
      athleteId: athlete.id,
      seasonId: activeSeason.id,
      message: `${athlete.displayName} joined the competition`,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    });

    if (i < 5) {
      events.push({
        type: "SUBMISSION_VERIFIED" as const,
        athleteId: athlete.id,
        seasonId: activeSeason.id,
        message: `${athlete.displayName}'s biomarkers have been verified`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    if (i < 3) {
      events.push({
        type: "BADGE_EARNED" as const,
        athleteId: athlete.id,
        message: `${athlete.displayName} earned the Super Ager badge`,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
    }
  }

  // Add some donation events
  events.push({
    type: "DONATION_RECEIVED" as const,
    seasonId: activeSeason.id,
    message: "Anonymous donated 0.1 BTC to the prize pool",
    data: JSON.stringify({ amount: 0.1, currency: "BTC" }),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  events.push({
    type: "DONATION_RECEIVED" as const,
    seasonId: activeSeason.id,
    message: "Longevity Foundation donated 0.5 BTC to the prize pool",
    data: JSON.stringify({ amount: 0.5, currency: "BTC", donor: "Longevity Foundation" }),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  });

  await prisma.event.createMany({ data: events });
  console.log(`  Created ${events.length} events`);

  // Create donations
  console.log("Creating donations...");
  const donations = [
    { amountBTC: 0.5, amountUSD: 25000, donorName: "Longevity Foundation", anonymous: false },
    { amountBTC: 0.25, amountUSD: 12500, donorName: "Blueprint Labs", anonymous: false },
    { amountBTC: 0.1, amountUSD: 5000, anonymous: true },
  ];

  for (const donation of donations) {
    await prisma.donation.create({
      data: {
        seasonId: activeSeason.id,
        ...donation,
        confirmedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  Created ${donations.length} donations`);

  console.log("\n✅ Database seeded successfully!");
  console.log(`
Summary:
  - ${badges.length} badges
  - ${seasons.length} seasons
  - ${createdAthletes.length} athletes
  - ${createdLeagues.length} leagues
  - ${membershipCount} league memberships
  - ${submissionCount} biomarker submissions
  - ${leaderboardData.length} individual leaderboard entries
  - ${leagueLeaderboardData.length} league leaderboard entries
  - ${badgeCount} badges awarded
  - ${gameCount} Guess My Age games
  - ${events.length} events
  - ${donations.length} donations
`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
