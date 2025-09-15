import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product, Color, SiteConfig, Category } from '../types';
// CENTRALIZED DATA SERVICE - Single source for all product data
import { 
  getProducts, 
  getCategories, 
  getSiteConfig, 
  getDealsProducts,
  filterProductsByPriceRange,
  sortProducts 
} from '../services/dataService';

interface CategoryWithCount {
  name: string;
  count: number;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

type ViewMode = 'grid' | 'list';
type SortBy = 'default' | 'price-low' | 'price-high' | 'name';

// Accessible, styled dropdown to replace native <select>
const SortDropdown: React.FC<{
  value: SortBy;
  onChange: (v: SortBy) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const options: { value: SortBy; label: string }[] = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => options.findIndex(o => o.value === value));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    setActiveIndex(options.findIndex(o => o.value === value));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const commitSelection = useCallback((idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    // return focus to button for good a11y
    buttonRef.current?.focus();
  }, [onChange]);

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      // focus list soon after open
      requestAnimationFrame(() => {
        listRef.current?.focus();
      });
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = (i + 1) % options.length;
        return next;
      });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = (i - 1 + options.length) % options.length;
        return next;
      });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSelection(activeIndex);
      return;
    }
    if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const selected = options.find(o => o.value === value) ?? options[0];
  const dropdownId = 'sort-dropdown-listbox';

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        onKeyDown={onButtonKeyDown}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-between gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black w-full xs:w-auto min-w-[160px]"
        title="Sort products"
      >
        <span className="truncate">{selected.label}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={dropdownId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={options[activeIndex]?.value}
          onKeyDown={onListKeyDown}
          className="absolute z-20 mt-2 w-full xs:w-64 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none"
        >
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const active = idx === activeIndex;
            return (
              <li
                key={opt.value}
                id={opt.value}
                role="option"
                aria-selected={selected}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${active ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => commitSelection(idx)}
              >
                <span className={`truncate ${selected ? 'font-medium text-black' : 'text-gray-700'}`}>{opt.label}</span>
                {selected && (
                  <svg className="w-4 h-4 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 00-1.408-1.42l-7.58 7.52-3.01-2.95a1 1 0 10-1.39 1.44l3.71 3.64a1 1 0 001.4 0l8.28-8.23z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const ProductListingPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, configData, dealsData, categoriesData] = await Promise.all([
          getProducts(),
          getSiteConfig(),
          getDealsProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        setSiteConfig(configData);
        setSaleProducts(dealsData.slice(0, 3));
        
        // Build categories with count
        const categoriesList: CategoryWithCount[] = [
          { name: 'All', count: productsData.length },
          ...categoriesData.map(category => ({
            name: category.name,
            count: productsData.filter(product => product.categoryId === category.id).length
          }))
        ];
        setCategories(categoriesList);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter and sort products - IMPORTANT: This must be called unconditionally before any returns
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [selectedCategory, priceRange, sortBy, products]);
  
  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy]);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  // Use dynamic page content with fallback
  const pageContent = siteConfig?.productPages?.listing || {
    title: "Latest Electronics",
    description: "Discover cutting-edge technology and premium electronics at unbeatable prices"
  };

  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      'black': 'bg-black',
      'white': 'bg-white border-gray-300',
      'gray': 'bg-gray-400',
      'blue': 'bg-blue-500',
      'red': 'bg-red-500',
      'pink': 'bg-pink-400',
      'orange': 'bg-orange-500',
      'green': 'bg-green-400',
      'purple': 'bg-purple-500',
      'yellow': 'bg-yellow-400',
      'silver': 'bg-gray-300',
      'gold': 'bg-yellow-600'
    };
    return colorMap[color] || 'bg-gray-300';
  };

  const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
    if (viewMode === 'list') {
      return (
  <Link to={`/product/${(product._id || product.id)}`} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group block">
          <div className="w-full sm:w-20 md:w-24 h-48 sm:h-20 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}
            />
          </div>
          
          <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-0">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-black mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Category: {product.category}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <p className="text-lg sm:text-xl font-semibold text-black">${product.price}</p>
                <div className="flex gap-1">
                  {product.colors.map((color: Color, index: number) => (
                    <button
                      key={index}
                      className={`w-4 h-4 rounded-full border ${getColorClass(color.name)} hover:scale-110 transition-transform`}
                      title={color.name}
                      onClick={(e) => e.preventDefault()}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end sm:justify-start">
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => e.preventDefault()}
                  className="px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Grid view (default)
    return (
  <Link to={`/product/${(product._id || product.id)}`} className="group cursor-pointer w-full block">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-2 sm:mb-3 aspect-square">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => e.preventDefault()}
              className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => e.preventDefault()}
              className="w-full py-1.5 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm"
            >
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="text-center px-1">
          <h3 className="text-xs sm:text-sm font-medium text-black mb-1 group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[2.8rem]">
            {product.name}
          </h3>
          <p className="text-sm sm:text-base font-semibold text-black mb-2">${product.price}</p>
          
          {/* Color Swatches */}
          <div className="flex justify-center gap-1">
            {product.colors.slice(0, 4).map((color: Color, index: number) => (
              <button
                key={index}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border ${getColorClass(color.name)} hover:scale-110 transition-transform`}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const Sidebar: React.FC = () => (
    <div className="space-y-8">
      {/* Filter Button */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.553.894l-4 2A1 1 0 019 21V14.414a1 1 0 00-.293-.707L2.293 7.293A1 1 0 012 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">Filter</span>
      </div>

      {/* Product Categories */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Product categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full flex items-center justify-between p-2 text-left rounded transition-colors ${
                selectedCategory === category.name
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{category.name}</span>
              <span className="text-xs text-gray-500">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={() => {
              // Apply price filter (already handled by useMemo)
              console.log('Price filter applied:', priceRange);
            }}
            className="w-full py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Sale Products */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Sale products</h3>
        <div className="space-y-4">
          {saleProducts.map((product) => (
            <div key={(product._id || product.id)} className="flex gap-3 group cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.images ? product.images[0] : '/images/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  style={{ boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' }}
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm text-black group-hover:text-gray-700 transition-colors line-clamp-2">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-black">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Delivery */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Shipping & Delivery</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-black">Free shipping</h4>
              <p className="text-xs text-gray-600">Free iconbox for all US order</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-black">Premium Support</h4>
              <p className="text-xs text-gray-600">Support 24 hours a day</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-black">30 Days Return</h4>
              <p className="text-xs text-gray-600">You have 30 days to return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Gallery</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            'three-device-wireless-charger.png',
            'red-beats-airpods.png', 
            'phone-case.png',
            'usb-cable.png',
            'watch-strap.png',
            'wireless-white-beats-earbuds.png'
          ].map((img, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group">
              <img
                src={`/images/${img}`}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Follow Us */}
      <div>
        <h3 className="text-base font-semibold text-black mb-4">Follow us</h3>
        <div className="flex gap-3">
          {[
            { icon: 'facebook', href: '#' },
            { icon: 'twitter', href: '#' },
            { icon: 'instagram', href: '#' },
            { icon: 'tiktok', href: '#' },
            { icon: 'pinterest', href: '#' }
          ].map((social) => (
            <a
              key={social.icon}
              href={social.href}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Hero Section */}
      <div className="text-center py-6 sm:py-8 lg:py-12 px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">{pageContent.title}</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{pageContent.description}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="flex gap-4 lg:gap-8">
          {/* Desktop Sidebar - Hide at 1010px */}
          <div className="hidden filter-hide:block w-80 flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main Product Area */}
          <div className="flex-1 min-w-0">
            {/* Top Controls - Combined Mobile Filter and Layout Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="filter-hide:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.553.894l-4 2A1 1 0 019 21V14.414a1 1 0 00-.293-.707L2.293 7.293A1 1 0 012 6.586V4z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium">Filter</span>
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="List View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {filteredAndSortedProducts.length} products found
                </span>
                <SortDropdown
                  value={sortBy}
                  onChange={(v) => setSortBy(v)}
                  className="w-full xs:w-auto"
                />
              </div>
            </div>

            {/* Product Grid/List */}
            <div className={`mb-8 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6' 
                : 'space-y-4'
            }`}>
              {paginatedProducts.map((product) => (
                <ProductCard key={(product._id || product.id)} product={product} viewMode={viewMode} />
              ))}
            </div>

            {/* No Products Message */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap px-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <>
                    <span className="px-2 text-gray-500 text-sm">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-2 sm:px-3 py-2 rounded-md font-medium transition-colors text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 filter-hide:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out filter-hide:hidden overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-4">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
