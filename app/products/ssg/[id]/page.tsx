import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllProducts, getProductById } from "@/lib/services/productService";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ id: product.id.toString() }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SSGProductPage({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) return <div>Produkti nuk u gjet.</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-12 text-center bg-gray-50">
        <h1 className="text-4xl font-bold text-yellow-600">
          SSG Produkti #{product.id}
        </h1>
        <h2 className="text-2xl mt-6 font-semibold text-blue-800">
          {product.name}
        </h2>
        <p className="mt-4 text-gray-700">{product.description}</p>
        <p className="mt-2 text-lg font-semibold text-yellow-700">
          Çmimi: €{product.price}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Renderuar me Static Site Generation.
        </p>
      </main>
      <Footer />
    </div>
  );
}
