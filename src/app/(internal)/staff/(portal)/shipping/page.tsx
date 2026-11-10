import ShippingBoard from "@/components/staff/shipping/ShippingBoard";

export default async function StaffShippingPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { status } = await searchParams;
  return <ShippingBoard basePath="/staff/shipping" statusParam={typeof status === "string" ? status : undefined} />;
}
