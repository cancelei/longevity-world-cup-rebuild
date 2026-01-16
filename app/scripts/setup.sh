#!/bin/bash
# ============================================================================
# Longevity World Cup - One-Command Development Setup
# ============================================================================
#
# This script sets up the complete development environment:
# 1. Starts PostgreSQL via Docker
# 2. Waits for database to be ready
# 3. Runs database migrations
# 4. Seeds the database with test data
#
# Usage:
#   ./scripts/setup.sh          # Full setup
#   ./scripts/setup.sh --reset  # Reset and reseed (destroys existing data)
#   ./scripts/setup.sh --seed   # Just reseed (keeps schema, replaces data)
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

cd "$APP_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Longevity World Cup - Development Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Parse arguments
RESET_MODE=false
SEED_ONLY=false

for arg in "$@"; do
  case $arg in
    --reset)
      RESET_MODE=true
      ;;
    --seed)
      SEED_ONLY=true
      ;;
  esac
done

# If seed-only mode, just run the seed
if [ "$SEED_ONLY" = true ]; then
  echo -e "${YELLOW}Running seed only...${NC}"
  npm run db:seed
  echo -e "${GREEN}✓ Database seeded successfully!${NC}"
  exit 0
fi

# Step 1: Check Docker
echo -e "${YELLOW}Step 1: Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}Error: Docker daemon is not running. Please start Docker.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Step 2: Start PostgreSQL
echo ""
echo -e "${YELLOW}Step 2: Starting PostgreSQL container...${NC}"
docker compose -f docker-compose.dev.yml up -d

# Step 3: Wait for PostgreSQL to be ready
echo ""
echo -e "${YELLOW}Step 3: Waiting for PostgreSQL to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U lwc_user -d longevity_world_cup &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}Error: PostgreSQL did not become ready in time.${NC}"
  exit 1
fi

# Step 4: Generate Prisma client
echo ""
echo -e "${YELLOW}Step 4: Generating Prisma client...${NC}"
npm run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Step 5: Run migrations or push schema
echo ""
if [ "$RESET_MODE" = true ]; then
  echo -e "${YELLOW}Step 5: Resetting database (--reset mode)...${NC}"
  npm run db:reset
  echo -e "${GREEN}✓ Database reset and seeded${NC}"
else
  echo -e "${YELLOW}Step 5: Pushing database schema...${NC}"
  npm run db:push
  echo -e "${GREEN}✓ Database schema pushed${NC}"

  # Step 6: Seed database
  echo ""
  echo -e "${YELLOW}Step 6: Seeding database...${NC}"
  npm run db:seed
  echo -e "${GREEN}✓ Database seeded${NC}"
fi

# Done!
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Your development environment is ready."
echo ""
echo -e "${YELLOW}Test Accounts:${NC}"
echo "  admin@test.longevityworldcup.com    (ADMIN)"
echo "  pro@test.longevityworldcup.com      (Top performer)"
echo "  regular@test.longevityworldcup.com  (Regular user)"
echo "  newbie@test.longevityworldcup.com   (New user)"
echo "  pending@test.longevityworldcup.com  (Not onboarded)"
echo ""
echo "Password for all: Test123!"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  npm run dev     # Start the development server"
echo "  npm run db:studio  # Open Prisma Studio"
echo ""
