import { Product } from '@/types/product.d';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Shtrati i Spitalit Elektrik',
    category: 'Mobilje',
    price: 1299,
    description: 'Shtrat elektrik i rregullueshëm për pacientë.',
  },
  {
    id: '2',
    name: 'Monitor i Shenjave Jetësore',
    category: 'Pajisje Mjekësore',
    price: 899,
    description: 'Monitor për EKG, Oksigjen dhe Tension Gjakut.',
  },
  {
    id: '3',
    name: 'Bomba Infuzioni',
    category: 'Pajisje',
    price: 550,
    description: 'Pajisje për dozimin e saktë të ilaçeve.',
  },
];

export async function getAllProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  return mockProducts.find(p => p.id === id) ?? null;
}
