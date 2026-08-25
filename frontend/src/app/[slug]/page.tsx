import { CompanyDesk } from "@/components/CompanyDesk";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CompanyDesk slug={slug} />;
}
