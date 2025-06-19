'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Product = {
  id: string;
  name: string;
  description: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-10 bg-gray-50">
        <h1 className="text-4xl font-bold text-center mb-12 text-blue-900">Produktet Spitalore</h1>
        <div className="space-y-10 max-w-4xl mx-auto">
          {products.map((product) => (
            <div key={product.id} className="bg-white shadow p-6 rounded-md">
              <h2 className="text-2xl font-semibold text-blue-800">{product.name}</h2>
              <p className="text-gray-600 mt-2">{product.description}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href={`/products/ssg/${product.id}`}>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">SSG</button>
                </Link>
                <Link href={`/products/ssr/${product.id}`}>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">SSR</button>
                </Link>
                <Link href={`/products/isr/${product.id}`}>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">ISR</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
