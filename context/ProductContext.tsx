'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

type ProductContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
};

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/products'); // or SSR route
      const data = await res.json();
      setProducts(data);
    };
    fetchData();
  }, []);

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used inside ProductProvider');
  return context;
};
