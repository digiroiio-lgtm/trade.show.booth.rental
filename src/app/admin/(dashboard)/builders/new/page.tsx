import BuilderForm from "@/components/admin/BuilderForm";
import { createBuilder } from "../actions";

export default function NewBuilderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Builder</h1>
      <BuilderForm action={createBuilder} submitLabel="Create Builder" />
    </div>
  );
}
