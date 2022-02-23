export interface IBackgroundColors {
  [key: string]: any;
}

export interface IProduct {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price?: number;
  // shopid: shopID,
  // itemnumber: itemNumber,
}

interface ICartProduct extends IProduct {
  amount: number;
}

export interface IShop {
  id: number;
  slug: string;
}
