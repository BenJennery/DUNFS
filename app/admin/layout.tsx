import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/data";

const links = [
  { href: "/admin/events", label: "Events" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/programme", label: "Programme" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/society", label: "Society" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.configured) redirect("/login?error=Connect+Supabase+first");
  if (!session.user) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") redirect("/");

  return (
    <div className="sheet mx-auto grid max-w-[1180px] gap-10 px-5 py-14 md:grid-cols-12 md:px-8 md:py-16">
      <aside className="md:col-span-3">
        <p className="mono text-[11px] tracking-[0.22em] text-[var(--gold)]">ADMIN</p>
        <nav className="mt-5 flex flex-wrap gap-x-4 gap-y-2 md:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="md:col-span-9">{children}</div>
    </div>
  );
}
