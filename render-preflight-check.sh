#!/bin/bash

# Render Pre-Deployment Checklist Script
# Run this before deploying to Render

echo "🔍 Render Deployment Pre-Flight Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create a .env file with your environment variables"
    echo "   See .env.render for template"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

# Check critical environment variables
echo "📋 Checking Environment Variables:"
echo "-----------------------------------"

check_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ $1 is NOT SET${NC}"
        return 1
    else
        if [ "$1" = "SENDGRID_API_KEY" ] || [ "$1" = "JWT_ACCESS_SECRET" ] || [ "$1" = "JWT_REFRESH_SECRET" ]; then
            echo -e "${GREEN}✅ $1 is set (${!1:0:10}...)${NC}"
        else
            echo -e "${GREEN}✅ $1 = ${!1}${NC}"
        fi
        return 0
    fi
}

ERRORS=0

check_var "MONGO_URI" || ((ERRORS++))
check_var "TEST_MONGO_URI" || ((ERRORS++))
check_var "JWT_ACCESS_SECRET" || ((ERRORS++))
check_var "JWT_REFRESH_SECRET" || ((ERRORS++))
check_var "SENDGRID_API_KEY" || ((ERRORS++))
check_var "SENDGRID_FROM_EMAIL" || ((ERRORS++))
check_var "CORS_ORIGIN" || ((ERRORS++))
check_var "FRONTEND_URL" || ((ERRORS++))

echo ""

# Validate SendGrid API key format
if [ ! -z "$SENDGRID_API_KEY" ]; then
    if [[ $SENDGRID_API_KEY == SG.* ]]; then
        echo -e "${GREEN}✅ SendGrid API key format is valid${NC}"
    else
        echo -e "${RED}❌ SendGrid API key must start with 'SG.'${NC}"
        ((ERRORS++))
    fi
fi

echo ""
echo "📧 SendGrid Configuration:"
echo "-----------------------------------"

# Check SendGrid configuration
if [ ! -z "$SENDGRID_API_KEY" ] && [ ! -z "$SENDGRID_FROM_EMAIL" ]; then
    echo -e "${YELLOW}⚠️  Remember to verify your sender email in SendGrid:${NC}"
    echo "   https://app.sendgrid.com/settings/sender_auth"
    echo ""
    echo "   Would you like to test SendGrid now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo "🧪 Testing SendGrid connection..."
        node test-sendgrid.js
    fi
fi

echo ""
echo "📦 Deployment Files:"
echo "-----------------------------------"

if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✅ render.yaml exists${NC}"
else
    echo -e "${RED}❌ render.yaml not found${NC}"
    ((ERRORS++))
fi

if [ -f "RENDER_DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${GREEN}✅ RENDER_DEPLOYMENT_GUIDE.md exists${NC}"
else
    echo -e "${YELLOW}⚠️  RENDER_DEPLOYMENT_GUIDE.md not found${NC}"
fi

echo ""
echo "📝 Git Status:"
echo "-----------------------------------"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"

    # Check if there are uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
        git status -s | head -5
        echo ""
        echo "   Remember to commit and push before deploying!"
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi

    # Check current branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$BRANCH" = "main" ]; then
        echo -e "${GREEN}✅ On 'main' branch${NC}"
    else
        echo -e "${YELLOW}⚠️  Currently on '$BRANCH' branch${NC}"
        echo "   Render deploys from 'main' branch by default"
    fi
else
    echo -e "${RED}❌ Not a git repository${NC}"
    ((ERRORS++))
fi

echo ""
echo "🌐 MongoDB Atlas:"
echo "-----------------------------------"
echo -e "${YELLOW}⚠️  Remember to whitelist Render's IP in MongoDB Atlas:${NC}"
echo "   1. Go to MongoDB Atlas → Network Access"
echo "   2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)"

echo ""
echo "======================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Pre-flight check PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Add Render deployment configuration'"
    echo "   git push origin main"
    echo ""
    echo "2. Deploy on Render:"
    echo "   https://dashboard.render.com/"
    echo ""
    echo "3. See RENDER_QUICK_START.md for detailed steps"
else
    echo -e "${RED}❌ Pre-flight check FAILED with $ERRORS error(s)${NC}"
    echo "Please fix the issues above before deploying"
    exit 1
fi

