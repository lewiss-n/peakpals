/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="topo flex min-h-dvh items-center justify-center p-4">
      <div className="sticker w-full max-w-md bg-white p-8">
        <img src="/brand/peak-pals-badge-primary.svg" alt="Peak Pals Adventures" className="mx-auto w-28" />
        <h1 className="mt-6 text-center text-3xl">Base camp login</h1>
        <p className="mt-1 text-center text-moss">Admin access for the Peak Pals team.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </div>
  );
}
