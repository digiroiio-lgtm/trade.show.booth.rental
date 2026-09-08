export default function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        )}
        {required && <span className="ml-1 text-slate-400">*</span>}
      </span>
      {children}
    </label>
  );
}
