import Link from "next/link";

export default function NotFound() {
  return (
    <div className="sheet mx-auto max-w-[1180px] px-5 py-28 md:px-8">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">SHEET MISSING</p>
      <h1 className="serif mt-4 text-6xl">Not on this drawing.</h1>
      <Link href="/" className="btn mt-10">
        Back to the society
      </Link>
    </div>
  );
}
