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
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number;
  on_sale: boolean;
  is_comprable: boolean; // stock_quantity > 0
  meta_data: {
    key: string;
    value: unknown;
  }[];
}
