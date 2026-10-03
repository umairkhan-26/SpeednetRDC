import ShippingBoard from "@/components/staff/shipping/ShippingBoard";

export default async function AdminShippingPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { status } = await searchParams;
  return <ShippingBoard basePath="/admin/shipping" statusParam={typeof status === "string" ? status : undefined} />;
}
