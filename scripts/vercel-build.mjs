// Production build entrypoint for Vercel. Written in Node (not shell
// scripting) so the DATABASE_URL conditional works the same way on every
// platform. Steps:
//   1. Always run `prisma generate` — needs only the schema file, not a
//      live database connection.
//   2. Only run `prisma migrate deploy` when DATABASE_URL is actually set.
//      This is what lets the app deploy in a temporary database-free mode
//      before Postgres/Neon is provisioned, without ever inventing a fake
//      connection string.
//   3. Always run `next build`.
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit" });
}

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
} else {
  console.log(
    "\nDATABASE_URL is not set — skipping `prisma migrate deploy`. " +
      "Deploying in temporary database-free mode; DB-backed features will " +
      "return safe fallbacks until DATABASE_URL is configured and this " +
      "build runs again."
  );
}

run("npx next build");
