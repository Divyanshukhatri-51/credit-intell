"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCompanies, type CompanySummary } from "@/lib/api";

export default function Home() {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then((list) => {
        setCompanies(list);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e.message ?? e));
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <h1 className="serif text-5xl text-brass">Verity Credit Desk</h1>
        <p className="mt-4 text-lg text-muted">
          Would you lend ₹1 crore? Open a company memo to see the analysis.
        </p>
      </div>

      {loading && (
        <p className="mt-16 text-center text-sm text-muted">Loading companies…</p>
      )}

      {error && (
        <div className="mx-auto mt-16 max-w-xl border border-line p-6 text-sm">
          <p className="text-risk">Could not load companies.</p>
          <p className="mt-2 text-muted">{error}</p>
          <p className="mt-2 text-muted">
            Start the API on port 3001, then refresh.
          </p>
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          No companies seeded. Run the backend so Suzlon is loaded.
        </p>
      )}

      {!loading && !error && companies.length > 0 && (
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/${company.slug}`}
              className="group border border-line p-6 transition-colors hover:border-brass hover:bg-bg-2"
            >
              <h2 className="serif text-2xl group-hover:text-brass">
                {company.name}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {[company.ticker, company.sector].filter(Boolean).join(" · ") ||
                  "View credit memo"}
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-brass">
                Open memo
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
