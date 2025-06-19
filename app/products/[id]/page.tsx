import { Product } from '@/types/product.d';
import { getProductById } from '@/lib/services/productService';

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  const products = await fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json());
    
  return products.slice(0, 10).map((product: Product) => ({
    id: product.id.toString(),
  }));
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductById(params.id);

  return (
    <div className="pt-12 px-20 flex flex-col items-center justify-center min-h-screen gap-y-20">
      <h1 className="text-4xl font-bold pt-20 pb-6 text-black text-center">
        SSG/ISR Product ID: {product.id}
      </h1>

    </div>
  );
}