export interface Product {
  id?: number | string;
  name: string | number;
  description?: string | null;
  price?: string | number | null;
  category?: string | null;
  shopid?: number | string;
  itemnumber?: number | null;
  amount?: number;
  [key: string]: unknown;
}

export interface Shop {
  id?: number | string;
  slug: string;
  name?: string;
  address?: string;
  notes?: string;
  opentimes?: string;
  deliverycost?: string | number;
  visibility?: boolean | string;
  logo?: string | null;
  background?: string | null;
  category?: string;
  ordersphonenumber?: string;
  orderswhatsappnumber?: string;
  products?: Product[];
  [key: string]: unknown;
}

export interface CartFormData {
  name: string;
  address: string;
  notes: string;
}

export interface CartState extends CartFormData {
  shop: Shop | null;
  products: Product[];
  totalAmount: number;
}

export interface ProductSection {
  name: string | null | undefined;
  products: Product[];
}
