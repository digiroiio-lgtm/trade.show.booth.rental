import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/enums";
import {
  addAdminNote,
  assignBuilder,
  createOpportunity,
  rerunMatching,
  updateRfqStatus,
} from "../actions";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: {
      event: true,
      city: true,
      boothSize: true,
      company: true,
      services: { include: { service: true } },
      files: true,
      attribution: true,
      leadScore: true,
      builderMatches: { include: { builder: true }, orderBy: { matchScore: "desc" } },
      opportunities: { include: { builder: true } },
    },
  });

  if (!rfq) notFound();

  const [notes, verifiedBuilders] = await Promise.all([
    prisma.adminNote.findMany({
      where: { rfqId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.builder.findMany({
      where: { verified: true },
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true },
    }),
  ]);
  const matchedBuilderIds = new Set(rfq.builderMatches.map((m) => m.builderId));
  const opportunityBuilderIds = new Set(rfq.opportunities.map((o) => o.builderId));
  const unmatchedBuilders = verifiedBuilders.filter((b) => !matchedBuilderIds.has(b.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {rfq.company?.name ?? "Unknown Company"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submitted {rfq.createdAt.toLocaleString()}
          </p>
        </div>
        <form action={updateRfqStatus} className="flex items-center gap-2">
          <input type="hidden" name="rfqId" value={rfq.id} />
          <select name="status" defaultValue={rfq.status} className="input w-auto">
            {Object.values(LeadStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Update Status
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Event</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Event" value={rfq.event?.name ?? rfq.eventNameFreeText ?? (rfq.eventUnknown ? "Not known yet" : "—")} />
            <Row label="City" value={rfq.city?.name ?? "—"} />
            <Row label="Venue" value={rfq.venueFreeText ?? "—"} />
            <Row label="Event Date" value={rfq.eventDate ? rfq.eventDate.toLocaleDateString() : "—"} />
          </dl>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Booth & Budget</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Booth Size" value={rfq.boothSize?.label ?? "—"} />
            <Row label="Budget" value={rfq.budgetRange ?? "—"} />
            <Row
              label="Services"
              value={rfq.services.map((s) => s.service.name).join(", ") || "—"}
            />
          </dl>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Lead Score</h2>
          {rfq.leadScore ? (
            <div className="mt-3">
              <p className="text-3xl font-bold text-slate-900">
                {rfq.leadScore.score}{" "}
                <span className="text-base font-medium text-slate-400">
                  Tier {rfq.leadScore.tier}
                </span>
              </p>
              <dl className="mt-3 space-y-1 text-xs text-slate-500">
                {Object.entries(rfq.leadScore.breakdown as Record<string, number>).map(
                  ([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  )
                )}
              </dl>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Not scored.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Company</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={rfq.company?.name ?? "—"} />
            <Row label="Website" value={rfq.company?.website ?? "—"} />
            <Row label="Industry" value={rfq.company?.industry ?? "—"} />
            <Row label="Country" value={rfq.company?.country ?? "—"} />
          </dl>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Name" value={`${rfq.firstName} ${rfq.lastName}`} />
            <Row label="Email" value={rfq.email} />
            <Row label="Phone" value={rfq.phone ?? "—"} />
            <Row label="Preferred Contact" value={rfq.preferredContact} />
          </dl>
        </div>
      </div>

      {rfq.projectDescription && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Project Description</h2>
          <p className="mt-3 text-sm text-slate-700">{rfq.projectDescription}</p>
        </div>
      )}

      {rfq.files.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Files</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {rfq.files.map((file) => (
              <li key={file.id}>
                {file.category}: {file.fileName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rfq.attribution && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900">Attribution</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <Row label="UTM Source" value={rfq.attribution.utmSource ?? "—"} />
            <Row label="UTM Medium" value={rfq.attribution.utmMedium ?? "—"} />
            <Row label="UTM Campaign" value={rfq.attribution.utmCampaign ?? "—"} />
            <Row label="Landing Page" value={rfq.attribution.landingPage ?? "—"} />
            <Row label="Referrer" value={rfq.attribution.referrer ?? "—"} />
          </dl>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Matched Builders</h2>
          <form action={rerunMatching}>
            <input type="hidden" name="rfqId" value={rfq.id} />
            <Button type="submit" variant="secondary">
              Run Matching
            </Button>
          </form>
        </div>

        {rfq.builderMatches.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No builders matched yet. Matching runs automatically on submission
            for verified builders serving the RFQ&apos;s city — click &quot;Run
            Matching&quot; to retry, or assign one manually below.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {rfq.builderMatches.map((match) => (
              <li key={match.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="font-medium text-slate-900">{match.builder.companyName}</span>
                  <span className="ml-2 text-slate-500">Score: {match.matchScore ?? "—"}</span>
                </div>
                {opportunityBuilderIds.has(match.builderId) ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Opportunity created
                  </span>
                ) : (
                  <form action={createOpportunity}>
                    <input type="hidden" name="rfqId" value={rfq.id} />
                    <input type="hidden" name="builderId" value={match.builderId} />
                    <Button type="submit" variant="secondary">
                      Create Opportunity
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        {unmatchedBuilders.length > 0 && (
          <form action={assignBuilder} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <input type="hidden" name="rfqId" value={rfq.id} />
            <select name="builderId" className="input w-auto" defaultValue="">
              <option value="" disabled>
                Assign a builder manually…
              </option>
              {unmatchedBuilders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.companyName}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Assign
            </Button>
          </form>
        )}

        {rfq.opportunities.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Opportunities
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {rfq.opportunities.map((opp) => (
                <li key={opp.id} className="flex justify-between text-slate-700">
                  <span>{opp.builder.companyName}</span>
                  <span className="text-slate-500">{opp.stage}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-slate-900">Admin Notes</h2>
        <form action={addAdminNote} className="mt-3 flex gap-2">
          <input type="hidden" name="rfqId" value={rfq.id} />
          <input
            type="text"
            name="note"
            required
            placeholder="Add a note…"
            className="input"
          />
          <Button type="submit" variant="secondary">
            Add
          </Button>
        </form>
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="text-sm text-slate-700">
              <p>{note.note}</p>
              <p className="text-xs text-slate-400">{note.createdAt.toLocaleString()}</p>
            </li>
          ))}
          {notes.length === 0 && (
            <p className="text-sm text-slate-500">No notes yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
