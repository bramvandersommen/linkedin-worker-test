#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# LinkedIn Worker - Deploy to Production
# ═══════════════════════════════════════════════════════════════════════════
#
# Purpose: Automate deployment from linkedin-worker-test (dev) to
#          offhours-oasis-landing/public/client/phuys/m8kP3vN7xQ2wR9sL/ (prod)
#
# What this script does:
# 1. Validates both repositories exist
# 2. Increments version number
# 3. Copies files from dev to prod
# 4. Swaps URLs (GitHub Pages → offhoursai.com) in BOTH scraper and worker
# 5. Removes @require dependency (embeds VIP config)
# 6. Shows diff for review
# 7. Commits changes (with confirmation)
#
# Usage: ./deploy-to-prod.sh
#
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

DEV_REPO="$(cd "$(dirname "$0")" && pwd)"
PROD_REPO="${DEV_REPO}/../offhours-oasis-landing"
PROD_PATH="public/client/phuys/m8kP3vN7xQ2wR9sL"

DEV_USERSCRIPT="${DEV_REPO}/linkedin-scraper.user.js"
DEV_WORKER="${DEV_REPO}/worker.html"

PROD_USERSCRIPT="${PROD_REPO}/${PROD_PATH}/linkedin-scraper.user.js"
PROD_WORKER="${PROD_REPO}/${PROD_PATH}/worker.html"

# URL swap patterns (for scraper AND worker communication)
DEV_WORKER_URL="https://bramvandersommen.github.io/linkedin-worker-test/worker.html"
PROD_WORKER_URL="https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html"

DEV_BASE_URL="https://bramvandersommen.github.io/linkedin-worker-test"
PROD_BASE_URL="https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL"

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════
# Validation
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 1: Validation"

# Check we're in linkedin-worker-test
if [[ ! -f "${DEV_USERSCRIPT}" ]]; then
    print_error "Not in linkedin-worker-test directory!"
    print_info "Please run this script from the linkedin-worker-test directory"
    exit 1
fi
print_success "Found linkedin-worker-test repository"

# Check prod repo exists
if [[ ! -d "${PROD_REPO}" ]]; then
    print_error "Production repository not found at: ${PROD_REPO}"
    print_info "Expected: offhours-oasis-landing/ as sibling directory"
    exit 1
fi
print_success "Found production repository"

# Check prod path exists
if [[ ! -d "${PROD_REPO}/${PROD_PATH}" ]]; then
    print_error "Production path not found: ${PROD_REPO}/${PROD_PATH}"
    exit 1
fi
print_success "Found production deployment path"

# Check both files exist
if [[ ! -f "${DEV_WORKER}" ]]; then
    print_error "worker.html not found in dev repo"
    exit 1
fi
print_success "Found worker.html in dev repo"

# ═══════════════════════════════════════════════════════════════════════════
# Version Management
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 2: Version Management"

# Extract current version from dev userscript
CURRENT_VERSION=$(grep -m 1 "@version" "${DEV_USERSCRIPT}" | sed -E 's/.*@version[[:space:]]+([0-9.]+).*/\1/')

if [[ -z "${CURRENT_VERSION}" ]]; then
    print_error "Could not extract version from ${DEV_USERSCRIPT}"
    exit 1
fi

print_info "Current version: ${CURRENT_VERSION}"

# Increment version (simple patch increment)
IFS='.' read -ra VERSION_PARTS <<< "${CURRENT_VERSION}"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"

# Increment minor version
NEW_MINOR=$((MINOR + 1))
NEW_VERSION="${MAJOR}.${NEW_MINOR}"

print_info "Suggested version: ${NEW_VERSION}"

# Ask for confirmation on version
echo -ne "${YELLOW}Use version ${NEW_VERSION}? [Y/n]: ${NC}"
read -r VERSION_CONFIRM

if [[ "${VERSION_CONFIRM}" =~ ^[Nn]$ ]]; then
    echo -ne "${YELLOW}Enter custom version (e.g., 4.5): ${NC}"
    read -r CUSTOM_VERSION
    NEW_VERSION="${CUSTOM_VERSION}"
fi

print_success "Version set to: ${NEW_VERSION}"

# ═══════════════════════════════════════════════════════════════════════════
# File Processing
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 3: Processing Files"

# Create temp directory for processed files
TEMP_DIR=$(mktemp -d)
TEMP_USERSCRIPT="${TEMP_DIR}/linkedin-scraper.user.js"
TEMP_WORKER="${TEMP_DIR}/worker.html"

print_info "Processing userscript..."

# Process userscript:
# 1. Update version
# 2. Swap WORKER_URL (for opening worker window)
# 3. Add @updateURL and @downloadURL
# 4. Remove @require line (vip-config.js)

sed -e "s/@version[[:space:]]*[0-9.]*/@version      ${NEW_VERSION}/" \
    -e "s|${DEV_WORKER_URL}|${PROD_WORKER_URL}|g" \
    -e "s|${DEV_BASE_URL}|${PROD_BASE_URL}|g" \
    -e "/@require.*vip-config.js/d" \
    "${DEV_USERSCRIPT}" > "${TEMP_USERSCRIPT}"

# Add @updateURL and @downloadURL after @version if not present
if ! grep -q "@updateURL" "${TEMP_USERSCRIPT}"; then
    sed -i '' "/^\/\/ @version/a\\
// @updateURL    https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js
" "${TEMP_USERSCRIPT}"
fi

if ! grep -q "@downloadURL" "${TEMP_USERSCRIPT}"; then
    sed -i '' "/^\/\/ @updateURL/a\\
// @downloadURL  https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js
" "${TEMP_USERSCRIPT}"
fi

print_success "Userscript processed (URLs swapped, @require removed)"

print_info "Processing worker.html..."

# Process worker.html:
# 1. Swap any references to GitHub Pages URLs
# 2. Update asset paths if needed (img/ folder)
# 3. Ensure CORS/origin references point to prod domain
# 4. Fix favicon paths (relative → absolute for production)

sed -e "s|${DEV_BASE_URL}|${PROD_BASE_URL}|g" \
    -e "s|bramvandersommen\.github\.io/linkedin-worker-test|offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL|g" \
    -e 's|href="img/favicon|href="/client/phuys/m8kP3vN7xQ2wR9sL/img/favicon|g' \
    -e 's|href="img/apple-touch-icon|href="/client/phuys/m8kP3vN7xQ2wR9sL/img/apple-touch-icon|g' \
    -e 's|href="img/site\.webmanifest"|href="/client/phuys/m8kP3vN7xQ2wR9sL/img/site.webmanifest"|g' \
    "${DEV_WORKER}" > "${TEMP_WORKER}"

print_success "Worker processed (URLs swapped, favicon paths fixed)"

# ═══════════════════════════════════════════════════════════════════════════
# Show Diff
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 4: Review Changes"

print_info "Changes in linkedin-scraper.user.js:"
echo ""

# Show key changes
echo -e "${YELLOW}Version:${NC}"
echo "  ${CURRENT_VERSION} → ${NEW_VERSION}"
echo ""

echo -e "${YELLOW}WORKER_URL:${NC}"
echo "  Old: ${DEV_WORKER_URL}"
echo "  New: ${PROD_WORKER_URL}"
echo ""

echo -e "${YELLOW}@require line:${NC}"
echo "  Removed: @require vip-config.js (VIP list now embedded)"
echo ""

echo -e "${YELLOW}Auto-update URLs:${NC}"
echo "  Added/Updated: @updateURL and @downloadURL"
echo ""

# Show actual diff (first 30 lines)
print_info "Diff preview (first 50 lines):"
diff -u "${PROD_USERSCRIPT}" "${TEMP_USERSCRIPT}" 2>/dev/null | head -50 || true

echo ""
echo ""
print_info "Changes in worker.html:"
echo ""

echo -e "${YELLOW}URL References:${NC}"
echo "  All GitHub Pages URLs → offhoursai.com"
echo "  Asset paths updated for img/ folder"
echo ""

# Count URL changes in worker
WORKER_CHANGES=$(diff -u "${PROD_WORKER}" "${TEMP_WORKER}" 2>/dev/null | grep -c "^+" || echo "0")
print_info "Worker diff: ~${WORKER_CHANGES} lines changed"

# ═══════════════════════════════════════════════════════════════════════════
# Confirmation
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 5: Confirmation"

echo -e "${YELLOW}Ready to deploy:${NC}"
echo "  • Version: ${CURRENT_VERSION} → ${NEW_VERSION}"
echo "  • From: linkedin-worker-test/ (dev)"
echo "  • To:   offhours-oasis-landing/${PROD_PATH}/ (prod)"
echo ""
echo -e "${YELLOW}Changes:${NC}"
echo "  ✓ Scraper: URLs swapped, @require removed, auto-update enabled"
echo "  ✓ Worker: URLs swapped for cross-window communication"
echo ""

echo -ne "${YELLOW}Proceed with deployment? [y/N]: ${NC}"
read -r DEPLOY_CONFIRM

if [[ ! "${DEPLOY_CONFIRM}" =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled"
    rm -rf "${TEMP_DIR}"
    exit 0
fi

# ═══════════════════════════════════════════════════════════════════════════
# Deploy
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 6: Deploying to Production"

# Copy processed files to production
cp "${TEMP_USERSCRIPT}" "${PROD_USERSCRIPT}"
cp "${TEMP_WORKER}" "${PROD_WORKER}"

print_success "Files copied to production"

# Cleanup temp directory
rm -rf "${TEMP_DIR}"

# ═══════════════════════════════════════════════════════════════════════════
# Git Operations
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 7: Git Operations"

cd "${PROD_REPO}"

# Check if there are changes
if [[ -z $(git status --porcelain) ]]; then
    print_warning "No changes detected in production repo"
    exit 0
fi

# Show git status
print_info "Git status:"
git status --short

echo ""
echo -ne "${YELLOW}Commit changes to production repo? [Y/n]: ${NC}"
read -r COMMIT_CONFIRM

if [[ "${COMMIT_CONFIRM}" =~ ^[Nn]$ ]]; then
    print_warning "Files deployed but not committed"
    print_info "You can manually commit later with:"
    print_info "  cd ${PROD_REPO}"
    print_info "  git add ${PROD_PATH}"
    print_info "  git commit -m 'Update LinkedIn worker to v${NEW_VERSION}'"
    exit 0
fi

# Stage changes
git add "${PROD_PATH}"

# Create commit message
COMMIT_MSG="Update LinkedIn worker to v${NEW_VERSION}

- Update userscript from v${CURRENT_VERSION} to v${NEW_VERSION}
- Swap WORKER_URL to production domain
- Update worker.html URLs for cross-window communication
- Remove @require dependency (VIP config embedded)
- Add @updateURL and @downloadURL for auto-updates

🤖 Generated with deploy-to-prod.sh"

# Commit
git commit -m "${COMMIT_MSG}"

print_success "Changes committed"

# ═══════════════════════════════════════════════════════════════════════════
# Push Reminder
# ═══════════════════════════════════════════════════════════════════════════

print_header "Step 8: Next Steps"

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Push to GitHub:"
echo "     cd ${PROD_REPO}"
echo "     git push origin main"
echo ""
echo "  2. Wait for Lovable sync (~30-60 seconds)"
echo ""
echo "  3. Click 'Publish' in Lovable dashboard"
echo ""
echo "  4. Verify production deployment:"
echo "     https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js"
echo ""
echo "  5. Test communication:"
echo "     - Install userscript in Tampermonkey"
echo "     - Navigate to LinkedIn VIP search page"
echo "     - Click scraper button"
echo "     - Verify worker opens at offhoursai.com domain"
echo "     - Verify posts are sent from scraper to worker"
echo ""

print_info "Production version: ${NEW_VERSION}"
print_info "Both scraper and worker now reference production URLs"

# Return to original directory
cd "${DEV_REPO}"
