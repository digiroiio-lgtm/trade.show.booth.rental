import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/hasDatabase";
import DatabaseUnavailable from "@/components/admin/DatabaseUnavailable";
import { LeadStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["ALL", ...Object.values(LeadStatus)];

export default async function AdminRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!hasDatabase) return <DatabaseUnavailable />;

  const { status } = await searchParams;
  const activeStatus = status && Object.values(LeadStatus).includes(status as LeadStatus)
    ? (status as LeadStatus)
    : null;

  const rfqs = await prisma!.rFQ.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { company: true, city: true, event: true, leadScore: true, boothSize: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">RFQs</h1>
        <p className="mt-1 text-sm text-slate-500">{rfqs.length} shown</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = tab === "ALL" ? !activeStatus : activeStatus === tab;
          return (
            <Link
              key={tab}
              href={tab === "ALL" ? "/admin/rfqs" : `/admin/rfqs?status=${tab}`}
              className={
                isActive
                  ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400"
              }
            >
              {tab}
            </Link>
          );
        })}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Event / City</th>
              <th className="py-2 pr-4">Booth</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rfqs.map((rfq) => (
              <tr key={rfq.id}>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/rfqs/${rfq.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {rfq.company?.name ?? "—"}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {rfq.firstName} {rfq.lastName}
                  <div className="text-xs text-slate-400">{rfq.email}</div>
                </td>
                <td className="py-3 pr-4 text-slate-600">
                  {rfq.event?.name ?? rfq.eventNameFreeText ?? "—"}
                  {rfq.city ? ` · ${rfq.city.name}` : ""}
                </td>
                <td className="py-3 pr-4 text-slate-600">{rfq.boothSize?.label ?? "—"}</td>
                <td className="py-3 pr-4 text-slate-600">
                  {rfq.leadScore ? `${rfq.leadScore.score} (${rfq.leadScore.tier})` : "—"}
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {rfq.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-500">
                  {rfq.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rfqs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No RFQs match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
