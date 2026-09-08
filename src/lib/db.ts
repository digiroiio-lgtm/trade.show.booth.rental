import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { LEAD_STATUSES, type LeadStatus } from "./constants";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "leads.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __boothQuotesDb: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (!global.__boothQuotesDb) {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        createdAt TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        event TEXT,
        city TEXT,
        venue TEXT,
        eventDate TEXT,
        boothSize TEXT,
        services TEXT,
        budget TEXT,
        notes TEXT,
        landingPage TEXT,
        utmSource TEXT,
        utmMedium TEXT,
        utmCampaign TEXT,
        status TEXT NOT NULL DEFAULT 'NEW'
      );
    `);
    global.__boothQuotesDb = db;
  }
  return global.__boothQuotesDb;
}

export interface NewLeadInput {
  name: string;
  company?: string;
  email: string;
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

export interface Lead {
  id: number;
  createdAt: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  event: string | null;
  city: string | null;
  venue: string | null;
  eventDate: string | null;
  boothSize: string | null;
  services: string | null;
  budget: string | null;
  notes: string | null;
  landingPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  status: LeadStatus;
}

export function createLead(input: NewLeadInput): Lead {
  const db = getDb();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO leads (
      createdAt, name, company, email, phone, website, event, city, venue,
      eventDate, boothSize, services, budget, notes, landingPage,
      utmSource, utmMedium, utmCampaign, status
    ) VALUES (
      @createdAt, @name, @company, @email, @phone, @website, @event, @city, @venue,
      @eventDate, @boothSize, @services, @budget, @notes, @landingPage,
      @utmSource, @utmMedium, @utmCampaign, 'NEW'
    )
  `);
  const result = stmt.run({
    createdAt,
    name: input.name,
    company: input.company ?? null,
    email: input.email,
    phone: input.phone ?? null,
    website: input.website ?? null,
    event: input.event ?? null,
    city: input.city ?? null,
    venue: input.venue ?? null,
    eventDate: input.eventDate ?? null,
    boothSize: input.boothSize ?? null,
    services: input.services ? JSON.stringify(input.services) : null,
    budget: input.budget ?? null,
    notes: input.notes ?? null,
    landingPage: input.landingPage ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
  });
  return getLeadById(result.lastInsertRowid as number)!;
}

export function getLeadById(id: number): Lead | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as
    | Lead
    | undefined;
}

export function getAllLeads(): Lead[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM leads ORDER BY createdAt DESC")
    .all() as Lead[];
}

export function updateLeadStatus(id: number, status: LeadStatus): void {
  if (!LEAD_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const db = getDb();
  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id);
}
