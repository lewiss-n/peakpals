import { notFound } from "next/navigation";
import { getProductById } from "@/lib/merch";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/lib/actions/admin";
import { mediaUrl } from "@/lib/media-url";

export const metadata = { title: "Edit merch" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const p = await getProductById(id);
  if (!p) notFound();
  return (
    <div>
      <p className="kicker">Merch shop</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="mt-1 text-4xl">Edit: {p.name}</h1>
        <DeleteButton action={deleteProduct} id={p.id} label="Remove item" confirmText="Remove this item and its photos from the shop?" />
      </div>
      <ProductForm initial={{
        id: p.id, name: p.name, slug: p.slug, category: p.category, art: p.art, summary: p.summary, description: p.description,
        priceKes: String(p.priceKes), sizes: p.sizes.join(", "), colors: p.colors.join(", "), sortOrder: String(p.sortOrder),
        inStock: p.inStock, featured: p.featured, published: p.published,
        images: p.photos.map((ph) => ({ id: ph.id, url: mediaUrl(ph.thumb ?? ph.file)! })),
      }} />
    </div>
  );
}
