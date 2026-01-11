# E-commerce Platform - Copilot Instructions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     E-COMMERCE MONOREPO                         │
├─────────────────────────────────────────────────────────────────┤
│  frontend/              adminfrontend/                          │
│  (Customer)             (Admin Dashboard)                       │
│  :5177                  :8091                                   │
│       │                      │                                  │
│       └──────────────────────┘                                  │
│                          │                                      │
│                          ▼                                      │
│                    backend/ :5001                               │
│                    (Express REST API)                           │
│                          │                                      │
│                          ▼                                      │
│               MongoDB :28000/ecommerce                          │
└─────────────────────────────────────────────────────────────────┘
```

| App | Port | Purpose |
|-----|------|---------|
| `backend/` | 5001 | REST API (Express + Mongoose) |
| `frontend/` | 5177 | Customer storefront (React + Vite) |
| `adminfrontend/` | 8091 | Admin dashboard (React + ShadCN) |

## ⚠️ GIT REPOSITORY STRUCTURE - CRITICAL

**Each folder has its OWN separate Git repository. NEVER push the entire monorepo!**

| Folder | Repository | Branch |
|--------|-----------|--------|
| `frontend/` | `srikrishnadeveloper/e-commerce-` | `master` |
| `backend/` | `srikrishnadeveloper/e-commerce-backend` | `main` |
| `adminfrontend/` | `srikrishnadeveloper/e-commerce_adminfrontend` | `master` |

### Push Commands (Run from each folder)
```powershell
# Frontend
cd frontend
git add -A; git commit -m "your message"; git push origin master

# Backend  
cd backend
git add -A; git commit -m "your message"; git push origin main

# Admin Frontend
cd adminfrontend
git add -A; git commit -m "your message"; git push origin master
```

### 🚫 NEVER DO THIS
```powershell
# WRONG - Do not push from root folder
cd ecommerce
git push  # ❌ This will try to push entire monorepo
```

## Quick Start

**VS Code Task:** `Ctrl+Shift+P` → "Run Task" → **"Start Workspace"**

**Kill & Restart Servers:**
```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
# Then run "Start Workspace" task
```

## Testing Configuration

| Setting | Value |
|---------|-------|
| **Test Email** | `srik27600@gmail.com` |
| **SMTP Email** | `srikrishnawebdeveloper@gmail.com` |
| **MongoDB** | `mongodb://localhost:28000/ecommerce` |

## MCP Integrations


Use for: project docs, task tracking, meeting notes, knowledge base

### MongoDB Operations
**Always use CLI for database operations:**
```powershell
# Connect to MongoDB
mongosh "mongodb://localhost:28000/ecommerce"

# Common queries
db.products.find({})                    # All products
db.products.find({ featured: true })    # Featured products
db.siteconfigs.findOne({ key: "all" })  # Site configuration
db.users.find({})                       # All users
db.orders.find({}).sort({ createdAt: -1 }) # Recent orders

# Update operations
db.siteconfigs.updateOne(
  { key: "all" },
  { $set: { "config.announcementbar.enabled": true } }
)
```

## Cleanup Tasks (Priority Order)

| Priority | Task | Location | Action |
|----------|------|----------|--------|
| ✅ DONE | Remove test files | Root folder | Deleted test files |
| ✅ DONE | Remove .md clutter | Root folder | Consolidated into `docs/` folder |
| ✅ DONE | Duplicate `src/` folder | Root | **REMOVED** - was duplicate of `frontend/src/` |
| 🟡 MED | Hardcoded ports | Multiple files | Use env vars for `localhost:5001`, `localhost:5000` |
| 🟡 MED | Duplicate LoginModal | `frontend/src/components/` | Keep only `.tsx`, remove `.jsx` |
| 🟢 LOW | Backup files | `frontend/src/services/` | Remove `dataService_backup.js` |

## 📚 Documentation Structure

All documentation has been consolidated into the `docs/` folder:

| File | Description |
|------|-------------|
| `docs/01_Project_Overview.md` | Project architecture and setup |
| `docs/02_Tasks_and_TODOs.md` | Feature roadmap and improvements |
| `docs/03_Admin_Auth_Guide.md` | Admin authentication documentation |
| `docs/04_Email_Implementation.md` | Email service setup and templates |
| `docs/05_Knowledge_Base.md` | Development knowledge transfer |
| `docs/06_Testing_Guide.md` | Complete testing documentation (consolidated) |

## Key Patterns

### Backend API
```
backend/src/
├── routes/      → Express routers
├── controllers/ → Business logic
├── models/      → Mongoose schemas (Product, User, Order, SiteConfig)
└── middleware/  → Auth (JWT), errors
```

**Response format:** `{ success: true, data: {...} }`

### Frontend Services
```
frontend/src/services/
├── dataService.ts    → Products, categories, config
├── authService.js    → Login/signup/logout
├── cartService.js    → Cart operations
└── wishlistService.js → Wishlist operations
```

**Global events:**
```js
window.dispatchEvent(new Event('auth:changed'));
window.dispatchEvent(new Event('cart:changed'));
window.dispatchEvent(new Event('wishlist:changed'));
```

## Database Seeding
```powershell
cd backend
npm run seed          # Products
npm run seed:config   # Site config
npm run seed:all      # Both
```

## ⚠️ CRITICAL RULES

### 🚫 NEVER Change Existing UI
| Rule | Details |
|------|---------|
| **Preserve UI** | NEVER redesign or change existing component styling/layout |
| **Add functionality only** | Add features, API calls, state management TO existing UI |
| **Backup first** | Before any major changes, copy to `frontend/src/backup/` |
| **Don't delete** | Move files to backup folder instead of deleting |

### 📁 Backup Location
```
frontend/src/backup/    # Store old versions here
```

## Communication Style

**Vibe coder mode — keep responses visual and scannable:**

| Do ✅ | Don't ❌ |
|-------|---------|
| Tables for lists/comparisons | Wall of text |
| ASCII/Mermaid diagrams | Verbose prose |
| Bold key terms | Bury info in paragraphs |
| 1-line summary first | Over-explain obvious things |
| Code diffs, not full files | Repeat unchanged code |
| **Add functionality to existing UI** | **Redesign/change UI layout** |

**Example response:**
```
✅ Added user profile endpoint

| File | Change |
|------|--------|
| `backend/src/routes/userRoutes.js` | Added GET /profile |
| `frontend/src/services/authService.js` | Added `getProfile()` |

Run: `npm run dev` in backend to test.
```

---

##  Recent Updates (Jan 2026)

### Product Features
| Feature | Status | Details |
|---------|--------|---------|
| **Sizes with Prices** |  Complete | Products now support multiple sizes, each with its own price. Format: `sizes: [{name: String, price: Number}]` |
| **Hot Deals Removed from bestseller** |  Complete | Removed `bestseller` field entirely. Only `hotDeal: boolean` remains for product flags |
| **Hot Deals Auto-Sync** |  Complete | Toggling product's `hotDeal` checkbox automatically updates `SiteConfig.homepage.hotDealsSection.productIds` array |

### Admin Dashboard Improvements
| Feature | Location | Change |
|---------|----------|--------|
| **ProductModal Simplified** | `adminfrontend/src/components/modals/ProductModal.tsx` | Removed bestseller checkbox, kept only Hot Deals (with sync indicator) |
| **Dashboard Sync Function** | `adminfrontend/src/components/Dashboard.tsx` | Added `syncHotDealWithConfig()` to auto-add/remove products from homepage config |
| **Product Types Updated** | `adminfrontend/src/types/index.ts` | Removed `bestseller: boolean` from Product interface |

### Analytics Fixes
| Issue | Location | Fix |
|-------|----------|-----|
| **Revenue/Orders Not Showing** | `backend/src/services/analyticsService.js` | Changed filter from `paymentStatus: 'paid'` to `status: { $nin: ['cancelled', 'refunded'] }` to include COD orders |
| **Payment Methods Filter** | `backend/src/controllers/analyticsController.js` | Same filter update for revenue time series and payment method breakdowns |

### Frontend UX Enhancements
| Feature | Location | Change |
|---------|----------|--------|
| **You May Also Like Redesign** | `frontend/src/components/ProductDetailPage.tsx` | Desktop: 4-column grid (up to 8 products). Mobile: 2-column carousel with infinite loop, improved hover effects, quick actions |

---

##  Bugs Fixed (E2E Testing - Nov 29, 2025)

| Bug | Location | Fix |
|-----|----------|-----|
| **Profile Update Endpoint** | `frontend/src/components/AccountPage.tsx` | Changed `/api/auth/update-profile` (PUT)  `/api/auth/updateMe` (PATCH) |
| **Password Update Endpoint** | `frontend/src/components/AccountPage.tsx` | Changed `/api/auth/change-password` (PUT)  `/api/auth/updatePassword` (PATCH) |
| **Bulk Status Update Error** | `backend/src/controllers/adminOrderController.js` | Added missing `performedBy: 'Admin'` to timeline entry (required field) |

---

##  TODO: Remaining Improvements

###  HIGH Priority

| # | Task | Description | Location |
|---|------|-------------|----------|
| 1 | **Payment Integration** | Implement Razorpay/Stripe payment gateway | `backend/`, `frontend/` |
| 2 | **Email Notifications** | Send order confirmations, status updates, shipping alerts | `backend/src/utils/email.js` |
| 3 | **Admin Authentication** | Add proper JWT auth for admin dashboard | `adminfrontend/`, `backend/` |
| 4 | **Process Refund Feature** | Enable refund processing for paid orders | `backend/src/controllers/adminOrderController.js` |
| 5 | **Password Reset Flow** | Forgot password email + reset token | `backend/src/controllers/authController.js` |
| 6 | **Input Validation** | Server-side validation for all endpoints | `backend/src/middleware/` |
| 7 | **Rate Limiting** | Prevent brute force attacks | `backend/server.js` |
| 8 | **CORS Configuration** | Proper CORS setup for production | `backend/server.js` |

###  MEDIUM Priority

| # | Task | Description | Location |
|---|------|-------------|----------|
| 9 | **Order Invoice PDF** | Generate downloadable invoices | `backend/src/utils/pdfGenerator.js` |
| 10 | **Product Reviews** | Allow customers to leave reviews + ratings | `backend/src/models/Review.js` |
| 11 | **Inventory Management** | Stock tracking, low stock alerts | `backend/src/models/Product.js` |
| 12 | **Coupon/Discount System** | Promo codes, percentage/fixed discounts | `backend/src/models/Coupon.js` |
| 13 | **Shipping Rate Calculator** | Calculate shipping based on location/weight | `backend/src/utils/shipping.js` |
| 14 | **Order Cancellation** | Allow users to cancel pending orders | `frontend/src/components/AccountPage.tsx` |
| 15 | **Address Validation** | Validate postal codes, phone numbers | `frontend/src/components/` |
| 16 | **Product Image Gallery** | Multiple images with zoom/lightbox | `frontend/src/components/ProductDetailPage.tsx` |
| 17 | **Category Management** | Admin CRUD for categories | `adminfrontend/src/pages/` |
| 18 | **Customer Management** | Admin view/edit customers | `adminfrontend/src/pages/Customers.tsx` |
| 19 | **Bulk Product Import** | CSV/Excel product import | `backend/src/controllers/productController.js` |
| 20 | **Search Filters** | Price range, brand, rating filters | `frontend/src/components/ProductListingPage.tsx` |

###  LOW Priority

| # | Task | Description | Location |
|---|------|-------------|----------|
| 21 | **Product Variants** | Size/color combinations with separate stock | `backend/src/models/Product.js` |
| 22 | **Customer Notifications** | In-app notifications for order updates | `frontend/src/components/NotificationBell.tsx` |
| 23 | **Analytics Dashboard** | Sales charts, top products, customer insights | `adminfrontend/src/pages/Analytics.tsx` |
| 24 | **Export Reports** | CSV/Excel export for orders, customers | `backend/src/controllers/` |
| 25 | **SEO Optimization** | Meta tags, sitemap, structured data | `frontend/index.html` |
| 26 | **Social Login** | Google, Facebook OAuth | `backend/src/routes/authRoutes.js` |
| 27 | **Recently Viewed** | Track and show recently viewed products | `frontend/src/hooks/` |
| 28 | **Product Comparison** | Compare multiple products | `frontend/src/pages/Compare.tsx` |
| 29 | **Gift Wrapping** | Optional gift wrap at checkout | `frontend/src/pages/Checkout.tsx` |
| 30 | **Abandoned Cart Email** | Email users with abandoned carts | `backend/src/cron/` |
| 31 | **Multi-language Support** | i18n for frontend | `frontend/src/i18n/` |
| 32 | **Dark Mode** | Theme toggle | `frontend/src/hooks/useTheme.js` |
| 33 | **PWA Support** | Service worker, offline mode | `frontend/public/sw.js` |
| 34 | **Image Optimization** | Compress/resize uploads | `backend/src/utils/imageProcessor.js` |
| 35 | **Admin Activity Log** | Track admin actions | `backend/src/models/AdminLog.js` |

---

##  Technical Debt

| # | Issue | Description | Location |
|---|-------|-------------|----------|
| ✅ | **Duplicate src folder** | Root `/src` duplicates `frontend/src` | **REMOVED** |
| 37 | **Hardcoded ports** | Change to environment variables | Multiple files |
| 38 | **LoginModal duplicates** | Remove `.jsx` version | `frontend/src/components/` |
| 39 | **Backup files** | Clean up `*_backup.js` files | `frontend/src/services/` |
| ✅ | **Test files cleanup** | Remove `test-*.js`, `check-*.js` | **DONE** |
| ✅ | **MD file cleanup** | Remove `*_COMPLETE.md`, `*_FIX.md` | **DONE** - moved to `docs/` |
| 42 | **Error boundary** | Add React error boundaries | `frontend/src/App.tsx` |
| 43 | **Loading states** | Consistent skeleton loaders | `frontend/src/components/` |
| 44 | **API error handling** | Unified error response format | `backend/src/middleware/errorHandler.js` |

---

##  E2E Testing Completed (Nov 29, 2025)

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration |  Working | Creates user with default address |
| User Login |  Working | JWT token stored in localStorage |
| Add to Cart |  Working | Products with color variants |
| Wishlist |  Working | Add/remove products |
| Checkout Flow |  Working | Address  Billing  Order Confirmation |
| Order Creation |  Working | MongoDB order with items, address, totals |
| Order History |  Working | Account page shows all orders |
| Order Tracking |  Working | Timeline, tracking number, carrier info |
| Profile Update |  Working | Name, email (password change available) |
| Product Search |  Working | Categories, suggestions, instant results |
| Admin Order View |  Working | Full order details modal |
| Admin Status Update |  Working | Single order and bulk update |
| Admin Add Tracking |  Working | Carrier, tracking #, URL, estimated delivery |

---

##  Test Accounts

| Type | Email | Password |
|------|-------|----------|
| **Test User** | `srik27600@gmail.com` | `TestPassword123!` |
| **Test Order** | Order #7562C278 | 3 items, $144.97, processing |

---

##  Database Schema TODOs

| # | Model | Field/Feature | Description |
|---|-------|---------------|-------------|
| 46 | **Order** | `refundedAt` | Track refund timestamp |
| 47 | **Order** | `refundReason` | Store refund reason |
| 48 | **User** | `emailVerified` | Email verification flag |
| 49 | **User** | `phoneVerified` | Phone verification flag |
| 50 | **Product** | `variants[]` | Size/color combinations |
