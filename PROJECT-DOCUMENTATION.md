# E-Commerce White-Label Platform Documentation

## 🎯 **Overview**

This is a fully dynamic, white-label e-commerce platform built with React + Vite. All content (site branding, navigation, products, etc.) is driven by JSON configuration files, making it instantly adaptable for any business type.

---

## 🚀 **Quick Start**

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:5173`

---

## 📁 **Project Structure**

```
src/
├── services/
│   └── dataService.js          # 🔥 SINGLE SOURCE - All data functions
├── data/
│   ├── products.json           # 📦 Product database (backend-ready)
│   └── siteConfig.json         # ⚙️ Site configuration (backend-ready)
├── components/
│   ├── AnnouncementBar.jsx     # ✅ Dynamic announcements
│   ├── Navbar.jsx              # ✅ Dynamic branding & menu
│   ├── HeroCarousel.jsx        # ✅ Dynamic hero slides
│   ├── ProductListingPage.jsx  # ✅ Dynamic product grid
│   ├── ProductDetailPage.jsx   # ✅ Dynamic product details
│   ├── HotDealsSection.jsx     # ✅ Dynamic deals carousel
│   ├── TwoBoxSection.jsx       # ✅ Dynamic featured collections
│   ├── ServiceFeaturesSection.jsx # ✅ Dynamic service features
│   ├── Footer.jsx              # ✅ Dynamic footer content
│   └── TestimonialSection.jsx  # ✅ Dynamic testimonials
└── App.jsx                     # Main router
```

---

## 🎨 **White-Label System**

### **Business Adaptation in 3 Steps:**

1. **Swap Configuration Files**
   ```bash
   # Switch to fashion business
   copy siteConfig-fashion.json siteConfig.json
   
   # Or create custom config
   edit src/data/siteConfig.json
   ```

2. **Update Product Data**
   ```bash
   edit src/data/products.json
   ```

3. **Replace Images**
   ```bash
   # Add new images to public/images/
   # Update image paths in JSON files
   ```

### **Example Business Types:**
- **Electronics** (current) - Tech products, gadgets
- **Fashion** (demo available) - Clothing, accessories
- **Home & Garden** - Furniture, decor
- **Sports** - Equipment, apparel
- **Beauty** - Cosmetics, skincare

---

## 🔧 **Configuration Files**

### **siteConfig.json** - Site Branding & Content
```json
{
  "site": {
    "name": "TechHub",           // Brand name
    "logo": "/logo.svg",         // Logo path
    "tagline": "Latest Tech"     // Brand tagline
  },
  "navigation": {
    "menu": [                    // Main navigation
      {"name": "Home", "path": "/"},
      {"name": "Products", "path": "/products"}
    ]
  },
  "hero": {
    "slides": [...]              // Hero carousel slides
  },
  "footer": {
    "company": {...},            // Company info
    "links": {...},              // Footer links
    "newsletter": {...}          // Newsletter signup
  }
}
```

### **products.json** - Product Database
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "category": "electronics",
      "price": 99.99,
      "originalPrice": 129.99,   // For sale pricing
      "images": ["image1.png"],  // Product images
      "description": "...",
      "features": [...],
      "specifications": {...}
    }
  ]
}
```

---

## 🎯 **Backend Integration Ready**

### **Centralized Data Service**

All components use `src/services/dataService.js` for data access:

```javascript
// Current (JSON files)
const products = await getProducts();
const config = await getSiteConfig();

// Future (API endpoints)
const products = await fetch('/api/products');
const config = await fetch('/api/config');
```

### **Migration Path:**

1. **Phase 1: JSON Files** ✅ (Current)
   - Static JSON files
   - File-based data service

2. **Phase 2: API Integration** 🔄 (Next)
   - Update `dataService.js` 
   - Add API endpoints
   - Keep same component interface

3. **Phase 3: Database** 🎯 (Future)
   - MongoDB integration
   - User management
   - Order processing

---

## 🔍 **Visual Indicators**

Dynamic content is visually marked for development:

- **Red Text** (`text-red-500`) - Dynamic text content
- **Red Borders** (`border-red-400`) - Dynamic images
- **Red Box Shadow** - Dynamic image containers

Remove these classes in production:
```bash
# Find all visual indicators
grep -r "text-red-500\|border-red-400" src/
```

---

## 🛠 **Development Guidelines**

### **Adding New Content:**

1. **Static Content** - Add directly to component
2. **Dynamic Content** - Add to `siteConfig.json`
3. **Product Content** - Add to `products.json`
4. **New Components** - Use `dataService.js` for data

### **Component Standards:**

```javascript
// ✅ Good - Uses data service
import { getSiteConfig } from '../services/dataService';

const MyComponent = () => {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    getSiteConfig().then(setConfig);
  }, []);
  
  return (
    <div>
      <h1 className="text-red-500">{config?.title}</h1>
    </div>
  );
};
```

### **Error Handling:**

```javascript
// Always provide fallbacks
const title = config?.hero?.title || 'Default Title';
const slides = config?.hero?.slides || [];
```

---

## 📊 **Database Schema (MongoDB Ready)**

### **Products Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  price: Number,
  originalPrice: Number,
  images: [String],
  description: String,
  features: [String],
  specifications: Object,
  inStock: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **SiteConfig Collection:**
```javascript
{
  _id: ObjectId,
  businessType: String,  // "electronics", "fashion", etc.
  site: Object,
  navigation: Object,
  hero: Object,
  footer: Object,
  featuredCollections: Object,
  hotDealsSection: Object,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 **Deployment**

### **Production Build:**
```bash
npm run build
```

### **Environment Variables:**
```bash
# .env.production
VITE_API_URL=https://your-api.com
VITE_MONGODB_URI=mongodb://your-db
```

### **White-Label Deployment:**
1. Build once
2. Swap config files per client
3. Deploy with client-specific assets

---

## 🔄 **Business Adaptation Examples**

### **Electronics → Fashion:**
```bash
# 1. Swap config
copy siteConfig-fashion.json siteConfig.json

# 2. Update products
# Change categories: electronics → clothing
# Update images: tech → fashion
# Modify features: specs → size/material

# 3. Replace hero images
# Tech banners → Fashion lookbooks
```

### **Custom Business Setup:**
```json
// siteConfig-restaurant.json
{
  "site": {
    "name": "Bella Vista",
    "tagline": "Fine Italian Dining"
  },
  "navigation": {
    "menu": [
      {"name": "Menu", "path": "/products"},
      {"name": "Reservations", "path": "/contact"}
    ]
  }
}
```

---

## 📚 **Additional Resources**

- **React Router**: Dynamic routing with `useParams`
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast development server
- **MongoDB MCP**: Database integration tools

---

## 🎯 **Next Steps**

1. **Backend API Development**
   - Create REST endpoints
   - Update `dataService.js`
   - Add authentication

2. **Admin Dashboard**
   - Config management UI
   - Product management
   - Business switching

3. **Advanced Features**
   - User accounts
   - Shopping cart
   - Order processing
   - Payment integration

---

*This documentation is automatically updated as the system evolves.*
