#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}ResearchCollab Deployment Script${NC}"
echo -e "================================"

# Check if it's a production deployment
if [ "$1" = "production" ]; then
  ENV="production"
  echo -e "${RED}PRODUCTION DEPLOYMENT${NC}"
else
  ENV="staging"
  echo -e "${GREEN}STAGING DEPLOYMENT${NC}"
fi

# Step 1: Pull latest changes
echo -e "\n${BLUE}Step 1: Pulling latest changes from Git...${NC}"
git pull origin main

# Step 2: Install dependencies
echo -e "\n${BLUE}Step 2: Installing dependencies...${NC}"
npm install

# Step 3: Run type check
echo -e "\n${BLUE}Step 3: Running type check...${NC}"
npm run typecheck
if [ $? -ne 0 ]; then
  echo -e "${RED}Type check failed. Aborting deployment.${NC}"
  exit 1
fi

# Step 4: Run linting
echo -e "\n${BLUE}Step 4: Running linting...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${RED}Linting failed. Aborting deployment.${NC}"
  exit 1
fi

# Step 5: Build application
echo -e "\n${BLUE}Step 5: Building the application...${NC}"
NODE_ENV=$ENV npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Aborting deployment.${NC}"
  exit 1
fi

# Step 6: Run database migrations
echo -e "\n${BLUE}Step 6: Running database migrations...${NC}"
if [ "$ENV" = "production" ]; then
  echo -e "${RED}APPLYING MIGRATIONS TO PRODUCTION DATABASE${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
  fi
  # Apply migrations to production
  npx supabase db push
else
  # Apply migrations to staging
  npx supabase db push
fi

# Step 7: Deploy to Vercel
echo -e "\n${BLUE}Step 7: Deploying to Vercel...${NC}"
if [ "$ENV" = "production" ]; then
  npx vercel --prod
else
  npx vercel
fi

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "\nNext steps:"
echo -e "  1. Verify the deployment works as expected"
echo -e "  2. Check for any database migration issues"
echo -e "  3. Monitor application logs for errors"

exit 0 