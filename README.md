# E-Commerce Application

A modern, full-featured e-commerce web application built with React, TypeScript, and Tailwind CSS. This project provides a complete online shopping experience with a clean, responsive design and modern web technologies.

![E-Commerce Homepage](https://github.com/user-attachments/assets/7912777a-9151-4fe1-9cb8-25a7883354f6)

## 🚀 Features

### Core E-Commerce Functionality
- **Product Catalog**: Browse products with detailed listings, images, and specifications
- **Product Details**: Comprehensive product pages with multiple images, colors, sizes, and reviews
- **Shopping Cart**: Add/remove items, quantity management, and cart persistence
- **User Authentication**: Login, signup, password reset with token-based authentication
- **User Account**: Profile management, order history, and account settings
- **Wishlist**: Save favorite products for later purchase
- **Search & Filtering**: Find products by category, price, and other attributes

### User Experience Features
- **Responsive Design**: Fully responsive layout that works on all devices
- **Hero Carousel**: Dynamic homepage slider for featured products and promotions
- **Hot Deals Section**: Showcase special offers and discounted items
- **Product Reviews**: Customer ratings and review system
- **Testimonials**: Customer feedback and testimonial display
- **FAQ Section**: Comprehensive help and frequently asked questions
- **Contact Form**: Customer support contact functionality
- **Newsletter Signup**: Email subscription for updates and offers

### Technical Features
- **Modern React Architecture**: Built with React 19.1.1 and React Router for navigation
- **TypeScript Support**: Full TypeScript implementation for type safety
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Animation Support**: GSAP animations for enhanced user interactions
- **Authentication**: JWT-based authentication with persistent login
- **API Integration**: RESTful API communication with error handling
- **State Management**: React hooks and context for application state
- **Responsive Navigation**: Mobile-friendly navigation with modals

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **React Router DOM 7.7.1** - Client-side routing and navigation
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons for React
- **GSAP 3.13.0** - Professional-grade animation library

### Development Tools
- **Vite 5.4.10** - Fast build tool and development server
- **ESLint** - Code linting and quality enforcement
- **PostCSS** - CSS transformation and processing
- **Autoprefixer** - Automatic vendor prefix handling

### Backend Integration
- **Axios** - HTTP client for API communication
- **JWT Authentication** - Secure token-based authentication
- **RESTful APIs** - Standard API communication patterns

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AnnouncementBar.tsx    # Top announcement banner
│   ├── Navbar.tsx             # Main navigation component
│   ├── HeroCarousel.tsx       # Homepage carousel
│   ├── ProductListingPage.tsx # Product catalog page
│   ├── ProductDetailPage.tsx  # Individual product view
│   ├── LoginModal.tsx         # Authentication modal
│   ├── Footer.tsx             # Site footer
│   └── ...
├── pages/               # Page-level components
│   ├── CartPage.jsx           # Shopping cart page
│   ├── WishlistPage.jsx       # User wishlist page
│   ├── LogoutPage.jsx         # Logout confirmation
│   └── ...
├── services/            # API and business logic
│   ├── authService.js         # Authentication API calls
│   ├── cartService.js         # Shopping cart management
│   ├── dataService.ts         # Product data fetching
│   ├── wishlistService.js     # Wishlist functionality
│   └── ...
├── types/               # TypeScript type definitions
│   ├── Product.ts             # Product-related types
│   ├── Components.ts          # Component prop types
│   └── ...
├── data/                # Static data and configuration
│   ├── products.json          # Product catalog data
│   └── siteConfig.json        # Site configuration
├── hooks/               # Custom React hooks
└── App.tsx              # Main application component
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srikrishnadeveloper/e-commerce-.git
   cd e-commerce-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5177` to see the application

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎯 Key Components

### Authentication System
- **Modal-based Login/Signup**: No separate pages, integrated modals
- **JWT Token Management**: Secure token storage and automatic refresh
- **Remember Me**: Persistent login sessions
- **Password Reset**: Email-based password recovery

### Product Management
- **Dynamic Product Catalog**: Products loaded from JSON/API
- **Advanced Filtering**: Category, price, and attribute-based filtering
- **Product Variants**: Support for colors, sizes, and options
- **Inventory Management**: Stock tracking and availability

### Shopping Experience
- **Cart Persistence**: Shopping cart saved across sessions
- **Wishlist Management**: Save and manage favorite products
- **Order Processing**: Complete checkout and order management
- **Responsive Design**: Optimized for mobile and desktop

## 🔧 Configuration

### Environment Variables
The application expects a backend API running on `http://localhost:5001`. Key configurations:

- **API Base URL**: `http://localhost:5001/api`
- **Image Proxy**: Images served from backend static server
- **Authentication**: JWT token-based authentication

### Customization
- **Styling**: Modify `tailwind.config.js` for custom themes
- **Products**: Update `src/data/products.json` for product catalog
- **Site Config**: Modify `src/data/siteConfig.json` for site settings

## 📱 Pages and Features

### Public Pages
- **Homepage**: Hero carousel, featured products, testimonials
- **Product Listing**: Browsable product catalog with filtering
- **Product Detail**: Detailed product information and reviews
- **Contact**: Customer support contact form
- **FAQ**: Frequently asked questions and help

### Authenticated Pages
- **Account**: User profile and settings management
- **Cart**: Shopping cart with item management
- **Wishlist**: Saved favorite products
- **Order History**: Previous purchases and order tracking

## 🎨 Design System

### Typography
- **Font Family**: Albert Sans (Google Fonts)
- **Responsive Typography**: Tailwind's responsive text sizing

### Colors
- **Primary**: Custom announcement blue (#2c3bc5)
- **Neutral**: Tailwind's gray scale
- **Semantic**: Success, warning, and error states

### Components
- **Modular Design**: Reusable components with consistent styling
- **Responsive Layout**: Mobile-first responsive design
- **Interactive Elements**: Hover states and smooth animations

## 🔄 State Management

### Authentication State
- **Global Auth Context**: User authentication status
- **Token Management**: Automatic token refresh and validation
- **User Profile**: Current user information and preferences

### Shopping State
- **Cart Management**: Local storage-based cart persistence
- **Wishlist State**: User's saved favorite products
- **Product State**: Catalog browsing and filtering state

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Client and server-side validation
- **HTTPS Ready**: Production-ready security configurations
- **XSS Protection**: Sanitized inputs and secure rendering

## 🚀 Deployment

### Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run code linting
```

### Production Considerations
- **Backend API**: Requires corresponding backend service
- **Environment Variables**: Configure API endpoints for production
- **Static Assets**: Serve images and static files appropriately
- **HTTPS**: Enable HTTPS for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is available for educational and commercial use. Please check with the repository owner for specific licensing terms.

## 🎯 Future Enhancements

- **Payment Integration**: Stripe/PayPal payment processing
- **Real-time Chat**: Customer support chat system
- **Advanced Search**: Elasticsearch-powered product search
- **Mobile App**: React Native mobile application
- **Admin Dashboard**: Product and order management interface
- **Multi-language**: Internationalization support
- **Progressive Web App**: PWA features for mobile experience

---

**Note**: This application is designed to work with a corresponding backend API service. The frontend handles the user interface and user experience, while the backend manages data persistence, authentication, and business logic.