import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/hasDatabase";
import DatabaseUnavailable from "@/components/admin/DatabaseUnavailable";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminBuildersPage() {
  if (!hasDatabase) return <DatabaseUnavailable />;

  const builders = await prisma!.builder.findMany({
    orderBy: { companyName: "asc" },
    include: { locations: true, capabilities: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Builders</h1>
          <p className="mt-1 text-sm text-slate-500">{builders.length} total</p>
        </div>
        <Link href="/admin/builders/new">
          <Button type="button">Add Builder</Button>
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Cities</th>
              <th className="py-2 pr-4">Capabilities</th>
              <th className="py-2 pr-4">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {builders.map((builder) => (
              <tr key={builder.id}>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/builders/${builder.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {builder.companyName}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-slate-600">{builder.locations.length}</td>
                <td className="py-3 pr-4 text-slate-600">{builder.capabilities.length}</td>
                <td className="py-3 pr-4">
                  {builder.verified ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      Unverified
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {builders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No builders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
