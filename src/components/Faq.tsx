export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.question}
          className="rounded-lg border border-slate-200 p-5"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {item.question}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
