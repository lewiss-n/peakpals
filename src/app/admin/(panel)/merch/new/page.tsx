import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add merch" };

export default function NewProduct() {
  return (
    <div>
      <p className="kicker">Merch shop</p>
      <h1 className="mt-1 text-4xl">Add merch</h1>
      <ProductForm />
    </div>
  );
}
