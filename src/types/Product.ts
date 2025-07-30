// Product related types
export interface Color {
  name: string;
  value: string;
  selected?: boolean;
}

export interface Specifications {
  [key: string]: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  categoryId: string;
  images: string[];
  colors: Color[];
  sizes: string[];
  inStock: boolean;
  rating: number;
  reviews: number;
  features: string[];
  specifications: Specifications;
  tags: string[];
  bestseller: boolean;
  featured: boolean;
  onSale?: boolean;
  dealText?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductsData {
  categories: Category[];
  products: Product[];
}
