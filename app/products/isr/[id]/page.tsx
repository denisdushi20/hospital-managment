import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllProducts, getProductById } from '@/lib/services/productService';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ id: product.id }));
}

interface Props {
  params: { id: string };
}

export default async function ISRProductPage({ params }: Props) {
  const product = await getProductById(params.id);
  if (!product) return <div>Produkti nuk u gjet.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-12 text-center bg-gray-50">
        <h1 className="text-4xl font-bold text-purple-600">ISR Produkti #{product.id}</h1>
        <h2 className="text-2xl mt-6 font-semibold text-blue-800">{product.name}</h2>
        <p className="mt-4 text-gray-700">{product.description}</p>
        <p className="mt-2 text-lg font-semibold text-purple-700">Çmimi: €{product.price}</p>
        <p className="mt-4 text-sm text-gray-500">Renderuar me Incremental Static Regeneration.</p>
      </main>
      <Footer />
    </div>
  );
}
