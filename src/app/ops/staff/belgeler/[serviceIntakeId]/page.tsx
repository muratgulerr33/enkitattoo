import { notFound } from "next/navigation";
import { OpsStaffDocumentPacket } from "@/components/ops/ops-staff-document-packet";
import { getStaffDocumentPacket } from "@/lib/ops/document-packets";

type PageProps = {
  params: Promise<{
    serviceIntakeId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function OpsStaffDocumentPacketPage({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceIntakeId = Number(resolvedParams.serviceIntakeId);

  if (!Number.isInteger(serviceIntakeId) || serviceIntakeId <= 0) {
    notFound();
  }

  const packet = await getStaffDocumentPacket(serviceIntakeId);

  if (!packet) {
    notFound();
  }

  return <OpsStaffDocumentPacket packet={packet} />;
}
