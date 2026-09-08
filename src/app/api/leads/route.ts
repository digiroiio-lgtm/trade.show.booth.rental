import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/db";

export const dynamic = "force-dynamic";

interface LeadPayload {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  event?: string;
  city?: string;
  venue?: string;
  eventDate?: string;
  boothSize?: string;
  services?: string[];
  budget?: string;
  notes?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const company = body.company?.trim();
  const email = body.email?.trim();

  if (!name || !company || !email) {
    return NextResponse.json(
      { error: "Name, company and email are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid business email is required." },
      { status: 400 }
    );
  }

  const lead = createLead({
    name,
    company,
    email,
    phone: body.phone?.trim(),
    website: body.website?.trim(),
    event: body.event?.trim(),
    city: body.city?.trim(),
    venue: body.venue?.trim(),
    eventDate: body.eventDate?.trim(),
    boothSize: body.boothSize?.trim(),
    services: Array.isArray(body.services) ? body.services : undefined,
    budget: body.budget?.trim(),
    notes: body.notes?.trim(),
    landingPage: body.landingPage?.trim(),
    utmSource: body.utmSource?.trim(),
    utmMedium: body.utmMedium?.trim(),
    utmCampaign: body.utmCampaign?.trim(),
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
