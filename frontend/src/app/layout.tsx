import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Verity — Would you lend Suzlon ₹1 crore?",
  description:
    "Explainable credit memo: company, financial health, risks, evidence, lending decision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <header className="border-b border-line px-6 py-4 md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="serif text-xl text-brass">Verity</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted">
                Credit desk
              </p>
            </div>
            <p className="text-xs text-muted">₹1 Cr working-capital decision</p>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line px-6 py-4 text-center text-xs text-muted">
          Public filings and rating rationals. Not investment advice.
        </footer>
      </body>
    </html>
  );
}
