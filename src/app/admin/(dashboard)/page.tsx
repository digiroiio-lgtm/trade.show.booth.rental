import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    rfqsToday,
    rfqsThisMonth,
    statusCounts,
    cityCounts,
    recentRfqs,
  ] = await Promise.all([
    prisma.rFQ.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.rFQ.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.rFQ.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.rFQ.groupBy({
      by: ["citySlug"],
      _count: { _all: true },
      where: { citySlug: { not: null } },
      orderBy: { _count: { citySlug: "desc" } },
      take: 5,
    }),
    prisma.rFQ.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { company: true, city: true, event: true, leadScore: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count._all])
  );

  const cities = await prisma.city.findMany({
    where: { slug: { in: cityCounts.map((c) => c.citySlug!).filter(Boolean) } },
    select: { slug: true, name: true },
  });
  const cityNameBySlug = Object.fromEntries(cities.map((c) => [c.slug, c.name]));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          RFQ pipeline snapshot as of {now.toLocaleString()}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="RFQs Today" value={rfqsToday} />
        <StatTile label="RFQs This Month" value={rfqsThisMonth} />
        <StatTile label="Qualified" value={statusMap["QUALIFIED"] ?? 0} />
        <StatTile label="Won" value={statusMap["WON"] ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Pipeline by Status</h2>
          <div className="mt-4 space-y-2">
            {["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"].map((status) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{status}</span>
                <span className="font-semibold text-slate-900">
                  {statusMap[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Top Cities</h2>
          <div className="mt-4 space-y-2">
            {cityCounts.length === 0 && (
              <p className="text-sm text-slate-500">No RFQs with a city yet.</p>
            )}
            {cityCounts.map((c) => (
              <div key={c.citySlug} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {cityNameBySlug[c.citySlug!] ?? c.citySlug}
                </span>
                <span className="font-semibold text-slate-900">{c._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent RFQs</h2>
          <Link href="/admin/rfqs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            View all →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Event / City</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRfqs.map((rfq) => (
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
                    {rfq.event?.name ?? rfq.eventNameFreeText ?? "—"}
                    {rfq.city ? ` · ${rfq.city.name}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {rfq.leadScore ? `${rfq.leadScore.score} (${rfq.leadScore.tier})` : "—"}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{rfq.status}</td>
                  <td className="py-3 pr-4 text-slate-500">
                    {rfq.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentRfqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No RFQs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
