import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/hasDatabase";
import DatabaseUnavailable from "@/components/admin/DatabaseUnavailable";
import BuilderForm from "@/components/admin/BuilderForm";
import Button from "@/components/ui/Button";
import { deleteBuilder, updateBuilder } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!hasDatabase) return <DatabaseUnavailable />;

  const { id } = await params;
  const builder = await prisma!.builder.findUnique({
    where: { id },
    include: { locations: true, capabilities: true },
  });

  if (!builder) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{builder.companyName}</h1>
        <p className="text-sm text-slate-500">/builders/{builder.slug}</p>
      </div>
      <BuilderForm action={updateBuilder} submitLabel="Save Changes" builder={builder} />

      <form action={deleteBuilder} className="card">
        <input type="hidden" name="builderId" value={builder.id} />
        <p className="text-sm text-slate-600">
          Removing this builder also removes its matches and opportunities.
        </p>
        <Button type="submit" variant="secondary" className="mt-3 text-red-600">
          Delete Builder
        </Button>
      </form>
    </div>
  );
}
