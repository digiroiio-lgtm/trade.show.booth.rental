import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/rfqs", label: "RFQs" },
  { href: "/admin/builders", label: "Builders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Admin
            </span>
            <nav className="flex items-center gap-6">
              {ADMIN_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
