const TRUST_ITEMS = [
  "Free Quote Comparison",
  "No Obligation",
  "One Project Brief",
  "Up to 3 Booth Quotes",
];

export default function TrustSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 p-5 text-center"
            >
              <p className="text-sm font-semibold text-slate-900">{item}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-500">
          We review your project requirements and connect suitable requests
          with independent trade show booth providers. Providers may pay us
          referral or marketing fees.
        </p>
      </div>
    </section>
  );
}
