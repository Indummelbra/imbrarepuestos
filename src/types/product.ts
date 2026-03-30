export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  permalink: string;
  images: {
    src: string;
    alt: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  attributes: {
    name: string;
    options: string[];
  }[];
  brand: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_years: number[];
  part_category: string;   // display name: "Suspensión", "Frenos", etc.
  category_slug: string;   // URL slug: "suspension", "frenos", etc.
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number;
  on_sale: boolean;
  is_comprable: boolean;   // true si stock_quantity > 0 && stock_status === 'instock'
  meta_data: {
    key: string;
    value: unknown;
  }[];
}
