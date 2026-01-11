# 🛒 E-commerce Project Tasks

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

---

## 📋 Task Status

| # | Task | Status | Scope | Priority |
|---|------|--------|-------|----------|
| 1 | Repo discovery & verification | 🔄 | Setup | HIGH |
| 2 | Cleanup test and docs clutter | ⬜ | Cleanup | HIGH |
| 3 | Standardize env & ports | ⬜ | DevOps | MED |
| 4 | Image max-size & object-fit | ✅ | Frontend | DONE |
| 5 | Dynamic Shop Now button | ⬜ | Frontend | HIGH |
| 6 | Search & Contact improvements | 🔄 | Frontend | MED |
| 7 | Disable color when size selected | ⬜ | Frontend | MED |
| 8 | MongoDB uploads verified | ✅ | Backend | DONE |
| 9 | Admin authentication | ⬜ | Backend | HIGH |
| 10 | Dollar → INR (shop page only) | ⬜ | Backend | MED |
| 11 | SMTP & forgot-password flow | ⬜ | Backend | MED |
| 12 | Admin dashboard panels | ⬜ | Admin | HIGH |
| 13 | QA & smoke tests | ⬜ | QA | LOW |

**Legend:** ✅ Done | 🔄 In Progress | ⬜ Todo

---

## 🔀 Dependency Flow

```
                  ┌─────────────┐
                  │ 1. Discovery│
                  └──────┬──────┘
                         ▼
          ┌──────────────┴──────────────┐
          ▼                              ▼
   ┌────────────┐                ┌────────────────┐
   │ 2. Cleanup │                │ 3. Env/Ports   │
   └──────┬─────┘                └───────┬────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼
         ┌───────────────────────────────┐
         │     FRONTEND (5-7)            │
         │  Shop Now | Search | Contact  │
         │  Color/Size logic             │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
  ┌──────────────┐              ┌──────────────────┐
  │ BACKEND (9-11)│              │ ADMIN (12)       │
  │ Auth | SMTP   │              │ Dashboard panels │
  │ Forgot pwd    │              └────────┬─────────┘
  └───────┬───────┘                       │
          └───────────────┬───────────────┘
                          ▼
                  ┌────────────┐
                  │ 13. QA     │
                  └────────────┘
```

---

## 📝 Task Details

### ✅ Completed

#### 4. Image max-size & object-fit
- `max-height`, `max-width`, and `object-fit: cover` applied
- Components: `HeroCarousel`, `ProductListingPage`, `TwoBoxSection`

#### 8. MongoDB uploads
- Image upload endpoint: `POST /api/images/upload`
- Images served at: `/api/images/<filename>`

---

### 🔄 In Progress

#### 1. Repo Discovery
- [ ] Confirm services running on ports 5001, 5177, 8091, 5175
- [ ] Verify MongoDB connection at `mongodb://localhost:28000`

#### 6. Search & Contact
- [ ] Search bar UI finalized in `SearchSidebar.tsx`
- [ ] Contact page to fetch social links from site config

---

### ⬜ Todo

#### 5. Dynamic Shop Now Button
**Files:** `FeatureSection.tsx`, `TwoBoxSection.tsx`
```tsx
// Change static link to dynamic category routing
<Link to={`/products?category=${collection.categorySlug}`}>
  Shop Now
</Link>
```

#### 7. Disable Color When Size Selected
**File:** `ProductDetailPage.tsx`
- Track selected size state
- Filter/disable colors not available for that size
- Requires product variant data structure

#### 9. Admin Authentication
**Backend tasks:**
- [ ] Create admin user model or role flag
- [ ] Add `/api/admin/login` endpoint
- [ ] Protect admin routes with JWT middleware
- [ ] Seed admin user script

**Frontend tasks:**
- [ ] Admin login page in `adminfrontend`
- [ ] Store admin token, redirect on auth

#### 10. Dollar → INR Conversion
**Scope:** Shop page only (`ProductListingPage`)
```js
// Example conversion helper
const USD_TO_INR = 83.5; // or fetch from API
const priceINR = (priceUSD * USD_TO_INR).toFixed(2);
```

#### 11. SMTP & Forgot Password
**Backend:**
- [ ] Configure env: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- [ ] Create `sendEmail()` utility
- [ ] `POST /api/auth/forgotPassword` → send reset link
- [ ] `POST /api/auth/resetPassword/:token` → update password

**Frontend:**
- [ ] Forgot password modal/page
- [ ] Reset password page with token

#### 12. Admin Dashboard Panels
- [ ] Site config editor (branding, announcements, hero)
- [ ] Image upload manager
- [ ] Bulk email sender
- [ ] Product/category management (exists, verify)

#### 13. QA & Smoke Tests
- [ ] Test user flows: browse → cart → checkout
- [ ] Test admin flows: login → edit config → save
- [ ] Verify announcement bar updates live

---

## 🚀 Quick Commands

```powershell
# Start all services
Ctrl+Shift+P → "Run Task" → "Start Workspace"

# Or manually:
cd backend && npm run dev      # :5001
cd frontend && npm run dev     # :5177
cd adminfrontend && npm run dev # :8091

# Database
mongosh "mongodb://localhost:28000/ecommerce"

# Seed data
cd backend
npm run seed          # Products
npm run seed:config   # Site config
```

---

## 📁 Key Files Reference

| Purpose | File |
|---------|------|
| Product detail | `frontend/src/components/ProductDetailPage.tsx` |
| Shop Now buttons | `frontend/src/components/TwoBoxSection.tsx` |
| Search | `frontend/src/components/SearchSidebar.tsx` |
| Contact page | `frontend/src/components/ContactUs.tsx` |
| Auth service | `frontend/src/services/authService.js` |
| Admin API | `adminfrontend/src/services/api.ts` |
| Backend routes | `backend/src/routes/*.js` |
| Site config model | `backend/src/models/SiteConfig.js` |
