"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions";
import { socialHref } from "@/lib/copy";
import type { Session } from "@/lib/types";
import { Mark } from "@/components/blueprint";

const links = [
  { href: "/events", label: "Events" },
  { href: "/members", label: "Members" },
  { href: "/sponsors", label: "Sponsors" },
];

export function Header({ session }: { session: Session }) {
  const pathname = usePathname();
  const admin = session.profile?.role === "admin";

  return (
    <header className="sheet sticky top-0 z-30 border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 text-[var(--paper)]">
          <Mark className="h-8 w-8 text-[var(--cyan)]" />
          <span>
            <span className="serif block text-xl leading-none">Durham Fusion</span>
            <span className="mono mt-1 block text-[10px] tracking-[0.22em] text-[var(--cyan)]">SOCIETY</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={active ? "text-[var(--gold)]" : "text-[var(--paper)]"}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          {session.user ? (
            <>
              <Link href="/account" className={pathname === "/account" ? "text-[var(--gold)]" : ""}>
                Account
              </Link>
              {admin ? (
                <Link href="/admin" className={pathname.startsWith("/admin") ? "text-[var(--gold)]" : ""}>
                  Admin
                </Link>
              ) : null}
              <form action={signOut}>
                <button type="submit" className="text-[var(--cyan)]">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/join" className="btn px-3 py-2 text-sm">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer({ session }: { session: Session }) {
  const email = session.copy.contact_email.trim();
  const instagram = socialHref(session.copy.instagram);
  const linkedin = socialHref(session.copy.linkedin);

  return (
    <footer className="sheet mt-8 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-6 px-5 py-8 md:px-8">
        <div>
          <p className="mono text-[11px] tracking-[0.18em] text-[var(--cyan)]">DURHAM FUSION SOCIETY</p>
          <p className="mt-2 text-sm text-[var(--paper-dim)]">Affiliated with Durham University</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {email ? <a href={`mailto:${email}`}>{email}</a> : null}
          {instagram ? (
            <a href={instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          ) : null}
          {linkedin ? (
            <a href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
          <a href="/#newsletter">Newsletter</a>
        </div>
        <p className="mono text-[11px] tracking-[0.16em] text-[var(--cyan)]">DFS–GA–01</p>
      </div>
    </footer>
  );
}

export function Index({ n, label }: { n: string; label: string }) {
  return (
    <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">
      {n} {label}
    </p>
  );
}

export function Flash({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  return (
    <p className={`mb-6 text-sm ${error ? "text-[var(--warn)]" : "text-[var(--gold)]"}`}>{error || notice}</p>
  );
}
