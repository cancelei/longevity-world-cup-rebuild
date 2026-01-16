# Longevity World Cup

A competitive platform for biological age reversal, where athletes compete based on their PhenoAge biomarker scores.

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.1 | React framework with App Router |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Radix UI](https://www.radix-ui.com/) | Latest | Accessible UI primitives |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animations & transitions |
| [Lucide React](https://lucide.dev/) | 0.562.x | Icon library |
| [class-variance-authority](https://cva.style/) | 0.7.x | Component variants |

### Database & Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [PostgreSQL](https://www.postgresql.org/) | 16+ | Relational database |
| [Prisma](https://www.prisma.io/) | 6.19.x | Type-safe ORM |
| [Clerk](https://clerk.com/) | 6.36.x | Authentication & user management |
| [AWS SDK S3](https://aws.amazon.com/sdk-for-javascript/) | 3.966.x | S3-compatible storage |

### OCR & Document Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tesseract.js](https://tesseract.projectnaptha.com/) | 7.x | OCR engine for lab reports |
| [pdfjs-dist](https://mozilla.github.io/pdf.js/) | 5.4.x | PDF parsing |
| [Sharp](https://sharp.pixelplumbing.com/) | 0.34.x | Image processing |
| [Canvas](https://github.com/Automattic/node-canvas) | 3.2.x | Server-side canvas rendering |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| [Recharts](https://recharts.org/) | 3.6.x | Charts & graphs |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| [Vitest](https://vitest.dev/) | 4.x | Unit testing framework |
| [Testing Library](https://testing-library.com/) | 16.x | React component testing |
| [Playwright](https://playwright.dev/) | 1.57.x | E2E testing |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| [ESLint](https://eslint.org/) | 9.x | Code linting |
| [Prettier](https://prettier.io/) | 3.7.x | Code formatting |
| [tsx](https://github.com/privatenumber/tsx) | 4.21.x | TypeScript execution |

## Features

- PhenoAge calculation from 9 biomarkers (albumin, creatinine, glucose, CRP, lymphocyte %, MCV, RDW, ALP, WBC)
- Global and league-based leaderboards with real-time rankings
- OCR-powered lab report parsing with multi-format support (PDF, PNG, JPEG, HEIC, WebP, TIFF)
- Division-based competition (Men's, Women's, Open)
- Generation-based categories (Gen Z, Millennial, Gen X, Boomer, Silent)
- Badge and achievement system
- "Guess My Age" interactive game
- Toast notification system for user feedback
- Responsive design with dark mode support

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/longevity-world-cup.git
cd longevity-world-cup

# Install dependencies
npm install

# Start PostgreSQL database
docker compose -f docker-compose.dev.yml up -d

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file with the following:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://lwc_user:lwc_dev_password@localhost:5433/longevity_world_cup?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# S3-compatible Storage (optional)
S3_BUCKET=your-bucket
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=https://your-endpoint.com
S3_REGION=us-east-1

# Email (optional)
EMAILIT_API_KEY=your-emailit-key
EMAIL_FROM=noreply@yourdomain.com
```

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (destructive)

# Testing
npm run test             # Run unit tests (watch mode)
npm run test:run         # Run unit tests (single run)
npm run test:coverage    # Run tests with coverage report
npx playwright test      # Run E2E tests
npx playwright test --ui # Run E2E tests with UI
```

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/            # Protected routes
│   │   ├── dashboard/          # User dashboard
│   │   ├── onboarding/         # New user setup
│   │   ├── profile/            # Profile management
│   │   └── submit/             # Biomarker submission
│   ├── api/                    # API routes (40+ endpoints)
│   │   ├── athletes/           # Athlete CRUD
│   │   ├── leagues/            # League management
│   │   ├── leaderboard/        # Rankings
│   │   ├── ocr/                # OCR processing
│   │   ├── submissions/        # Biomarker submissions
│   │   └── admin/              # Admin endpoints
│   ├── athletes/               # Public athlete profiles
│   ├── leagues/                # League pages
│   ├── about/                  # About page
│   └── rules/                  # Competition rules
├── components/
│   ├── ui/                     # Reusable UI (Button, Card, Modal, Toast, etc.)
│   ├── features/               # Feature components
│   │   ├── admin/              # Admin panels
│   │   ├── badges/             # Badge display
│   │   ├── charts/             # Biomarker charts
│   │   ├── competition/        # Countdown, prizes
│   │   ├── games/              # Guess age game
│   │   ├── home/               # Homepage sections
│   │   ├── leaderboard/        # Leaderboard tables
│   │   └── ocr/                # OCR upload & review
│   └── layout/                 # Header, Footer, Navigation
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api-utils.ts            # API helpers & error handling
│   ├── db.ts                   # Prisma client
│   ├── email.ts                # Email service
│   ├── phenoage.ts             # PhenoAge calculation algorithm
│   ├── rate-limit.ts           # API rate limiting
│   ├── storage.ts              # S3 storage utilities
│   ├── utils.ts                # General utilities
│   └── ocr/                    # OCR processing pipeline
│       ├── ocr-service.ts      # Tesseract.js integration
│       ├── pdf-processor.ts    # PDF to image conversion
│       ├── biomarker-extractor.ts  # Value extraction
│       ├── confidence-scorer.ts    # Result confidence
│       └── file-formats.ts     # Format detection & conversion
├── test/                       # Test setup & mocks
└── types/                      # TypeScript definitions

prisma/
├── schema.prisma               # Database schema (15+ models)
└── seed.ts                     # Sample data seeding

e2e/                            # Playwright E2E tests
```

## API Endpoints

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with database status |
| `/api/leaderboard` | GET | Global rankings with filters |
| `/api/athletes` | GET | List verified athletes |
| `/api/leagues` | GET | List public leagues |
| `/api/leagues/leaderboard` | GET | Cross-league rankings |
| `/api/stats` | GET | Platform statistics |
| `/api/events` | GET | Recent activity feed |

### Authenticated Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/athletes` | POST | Create athlete profile |
| `/api/athletes/me` | GET/PATCH | Current user's profile |
| `/api/athletes/me/photo` | POST | Upload profile photo |
| `/api/submissions` | GET/POST | Biomarker submissions |
| `/api/leagues` | POST | Create new league |
| `/api/leagues/[slug]` | GET/PATCH/DELETE | League management |
| `/api/leagues/[slug]/members` | GET/POST/DELETE | Member management |
| `/api/leagues/[slug]/invite` | POST | Generate invite link |
| `/api/ocr/upload` | POST | Upload lab report for OCR |
| `/api/ocr/status/[jobId]` | GET | Check OCR job status |
| `/api/ocr/results/[jobId]` | GET | Get OCR results |
| `/api/games/guess-age` | POST | Submit age guess |

### Admin Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/submissions/[id]/approve` | POST | Approve submission |
| `/api/admin/submissions/[id]/reject` | POST | Reject submission |
| `/api/admin/athletes/[id]/verify` | POST | Verify athlete |

## Architecture

### PhenoAge Calculation
The platform uses the Levine PhenoAge algorithm, calculating biological age from 9 biomarkers:
- Albumin, Creatinine, Glucose, C-reactive protein (CRP)
- Lymphocyte %, Mean corpuscular volume (MCV)
- Red cell distribution width (RDW), Alkaline phosphatase (ALP)
- White blood cell count (WBC)

### OCR Pipeline
1. **Upload** - Accept PDF/images (HEIC, WebP, TIFF auto-converted)
2. **Processing** - Tesseract.js extracts text from lab reports
3. **Extraction** - Pattern matching identifies biomarker values
4. **Validation** - Confidence scoring and range validation
5. **Review** - User confirms/edits extracted values

### Leagues-First Architecture
Athletes must join a league to participate. Submissions are league-scoped, enabling:
- Corporate wellness competitions
- Research cohorts
- Geographic/demographic groups

## Security Features

- **Rate Limiting:** Configurable rate limits per endpoint type (API, auth, submission, OCR)
- **Security Headers:** CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- **Authentication:** Clerk-based auth with role-based access (Athlete, Admin)
- **Input Validation:** Zod schemas + Prisma ORM with parameterized queries
- **API Error Handling:** Standardized error responses with Prisma error classification
- **File Validation:** Magic byte detection, size limits, format whitelisting

## Testing

```bash
# Unit tests
npm run test:run

# E2E tests
npx playwright test

# E2E tests with UI
npx playwright test --ui

# Test coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
# Build the image
docker build -t longevity-world-cup .

# Run with Docker Compose
docker compose up -d
```

### CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linting and type checking
- Executes unit and E2E tests
- Builds and validates Docker image
- Deploys to production (on main branch)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:run && npm run lint`
4. Submit a pull request

## License

Proprietary - All rights reserved
