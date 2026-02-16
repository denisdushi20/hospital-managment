import { Product } from "@/types/product.d";
import { getProductById } from "@/lib/services/productService";

// 1. Update the interface: params must be a Promise
interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await fetch(
    "https://jsonplaceholder.typicode.com/posts",
  ).then((res) => res.json());

  return products.slice(0, 10).map((product: Product) => ({
    id: product.id.toString(),
  }));
}

// 2. Await the params inside the component
export default async function ProductPage({ params }: Props) {
  const { id } = await params; // Extract id after awaiting
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="pt-12 px-20 flex flex-col items-center justify-center min-h-screen gap-y-20">
        <h1 className="text-4xl font-bold pt-20 pb-6 text-black text-center">
          Product not found
        </h1>
      </div>
    );
  }

  return (
    <div className="pt-12 px-20 flex flex-col items-center justify-center min-h-screen gap-y-20">
      <h1 className="text-4xl font-bold pt-20 pb-6 text-black text-center">
        SSG/ISR Product ID: {product.id}
      </h1>
    </div>
  );
}