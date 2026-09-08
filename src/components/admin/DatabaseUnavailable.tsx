export default function DatabaseUnavailable() {
  return (
    <div className="card">
      <h1 className="text-lg font-semibold text-slate-900">Database not configured</h1>
      <p className="mt-2 text-sm text-slate-600">
        This app is running in temporary database-free mode — DATABASE_URL isn&apos;t set
        yet. Admin data (RFQs, builders, matching) will appear here automatically once
        the database is connected and migrations have run.
      </p>
    </div>
  );
}
