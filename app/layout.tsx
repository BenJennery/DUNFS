import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Blueprint } from "@/components/blueprint";
import { Footer, Header } from "@/components/chrome";
import { getSession } from "@/lib/data";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Durham Fusion Society",
    template: "%s · Durham Fusion",
  },
  description:
    "A student society at Durham for fusion science, engineering, and the people who want to work on it.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Blueprint />
        <div className="relative z-10">
          <Header session={session} />
          <main>{children}</main>
          <Footer session={session} />
        </div>
      </body>
    </html>
  );
}
