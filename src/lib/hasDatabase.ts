// Temporary database-free production mode support. When DATABASE_URL isn't
// configured yet (e.g. Postgres/Neon hasn't been provisioned on Vercel),
// every DB-backed code path should check this first and fall back safely
// instead of touching Prisma. Once DATABASE_URL is set and `prisma migrate
// deploy` has run, this flips to true and all guarded paths resume normal
// behavior automatically — no other code changes needed.
export const hasDatabase = Boolean(process.env.DATABASE_URL);
