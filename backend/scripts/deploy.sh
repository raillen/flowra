#!/bin/bash

# Deploy script for KBSys Backend
# Handles deployment on VPS/server

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main || echo "Warning: git pull failed (continuing...)"

echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f docker/docker-compose.yml build

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker/docker-compose.yml down

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose -f docker/docker-compose.yml up -d

echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

echo -e "${YELLOW}📊 Running migrations...${NC}"
docker-compose -f docker/docker-compose.yml exec -T backend npm run migrate || echo "Warning: migrations failed"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Services status:"
docker-compose -f docker/docker-compose.yml ps

echo ""
echo -e "${GREEN}📝 Useful commands:${NC}"
echo "  View logs: docker-compose -f docker/docker-compose.yml logs -f"
echo "  Stop: docker-compose -f docker/docker-compose.yml down"
echo "  Restart: docker-compose -f docker/docker-compose.yml restart"

