"use client";

import { useEffect, useState } from "react";
import {
  fetchCompany,
  fetchScore,
  type Company,
  type ScoreCard,
} from "@/lib/api";
import { Sparkline } from "./Sparkline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

const dirColor = {
  positive: "var(--ok)",
  watch: "var(--watch)",
  risk: "var(--risk)",
};

const dirIcon = {
  positive: "↑",
  watch: "→",
  risk: "↓",
};

function verdictLabel(v: ScoreCard["verdict"]) {
  if (v === "APPROVE") return "Approve";
  if (v === "DECLINE") return "Decline";
  return "Approve with conditions";
}

function verdictColor(v: ScoreCard["verdict"]) {
  if (v === "APPROVE") return "var(--ok)";
  if (v === "DECLINE") return "var(--risk)";
  return "var(--watch)";
}

function verdictEmoji(v: ScoreCard["verdict"]) {
  if (v === "APPROVE") return "✅";
  if (v === "DECLINE") return "❌";
  return "⚠️";
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function CompanyDesk({ slug }: { slug: string }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [score, setScore] = useState<ScoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("decision");

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([fetchCompany(slug), fetchScore(slug)])
      .then(([c, s]) => {
        setCompany(c);
        setScore(s);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e.message ?? e));
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["decision", "company", "health", "risks", "evidence"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-full border-2 border-brass/20 bg-bg-2" />
          <div>
            <p className="serif text-2xl text-brass">Building the memo</p>
            <p className="mt-1 text-sm text-muted">
              Loading filings, provenance, and the ₹1 crore recommendation.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse border border-line bg-bg-2" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="border-l-4 border-risk pl-6">
          <p className="serif text-3xl text-risk">API not reachable</p>
          <p className="mt-3 text-muted">
            Start the backend on port 3001 (`cd backend && npm run dev`), then retry.
          </p>
        </div>
        <pre className="mt-4 overflow-auto border border-line bg-bg-2 p-4 text-xs text-muted">
          {error}
        </pre>
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={load}
            className="border border-brass px-6 py-2 text-sm text-brass transition-colors hover:bg-brass/10"
          >
            Retry
          </button>
          <Link
            href="/"
            className="border border-line px-6 py-2 text-sm text-muted transition-colors hover:bg-bg-2"
          >
            ← Back to companies
          </Link>
        </div>
      </main>
    );
  }

  if (!company || !score) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center text-muted">
        <p className="serif text-2xl">No company memo available</p>
        <p className="mt-2">Seed Suzlon from the API, then refresh.</p>
        <Link
          href="/"
          className="mt-6 inline-block border border-line px-6 py-2 text-sm transition-colors hover:bg-bg-2"
        >
          ← Back to companies
        </Link>
      </main>
    );
  }

  const chartData = (company.annuals ?? []).slice(-6).map((a) => ({
    year: a.fy,
    revenue: a.sales,
    ebitda: a.ebitda,
    debt: a.borrowings,
    cfo: a.cfo,
  }));

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brass"
        >
          ← Back to companies
        </Link>
      </div>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-10 -mx-5 bg-bg/95 px-5 py-4 backdrop-blur-sm md:-mx-8 md:px-8">
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-muted">
          {["decision", "company", "health", "risks", "evidence"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`px-3 py-1 transition-colors ${
                activeSection === section
                  ? "border-b-2 border-brass text-brass"
                  : "hover:text-ink"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </nav>

      {/* Decision Section */}
      <section id="decision" className="border-b border-line pb-10 pt-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brass">
          <span>Would you lend them ₹1 crore?</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 
                className="serif text-4xl md:text-5xl" 
                style={{ color: verdictColor(score.verdict) }}
              >
                {verdictEmoji(score.verdict)} {verdictLabel(score.verdict)}
              </h1>
            </div>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed">{score.summary}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-right">
              <p className="num text-5xl font-light text-brass">{score.headlineScore}</p>
              <p className="text-xs text-muted">score / 100 · {score.asOf}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">confidence</span>
              <span className="num text-sm text-brass">{score.confidence}%</span>
            </div>
          </div>
        </div>
        <div className="mt-6 h-1.5 w-full bg-line">
          <div 
            className="h-1.5 transition-all duration-1000" 
            style={{ 
              width: `${score.headlineScore}%`,
              background: `linear-gradient(90deg, var(--ok), var(--brass), var(--risk))`,
              opacity: score.headlineScore > 50 ? 1 : 0.7
            }} 
          />
        </div>
        
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {score.signals.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b border-line/50 py-3">
              <span className="text-sm">{s.name}</span>
              <span className="num text-sm text-muted">
                {s.score} × {(s.weight * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Company Section */}
      <section id="company" className="mt-12">
        <h2 className="serif text-3xl">{company.name}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded border border-line px-3 py-1 text-brass">
            {company.ticker}
          </span>
          <span className="text-muted">{company.exchange}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{company.sector}</span>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed">{company.description}</p>
        {score.strengths && score.strengths.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {score.strengths.map((s) => (
              <span key={s} className="border border-ok/40 px-3 py-1.5 text-xs text-ok">
                + {s}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Financial Health Section */}
      <section id="health" className="mt-16">
        <h2 className="serif text-3xl">Financial health</h2>
        <p className="mt-1 text-sm text-muted">
          Revenue, EBITDA, CFO and gross debt (₹ Cr, consolidated, Screener).
        </p>
        {chartData.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No annual series loaded.</p>
        ) : (
          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" strokeOpacity={0.5} />
                <XAxis dataKey="year" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" tickFormatter={fmt} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    color: "var(--ink)",
                    padding: "12px",
                  }}
                  formatter={(value: number) => `₹${fmt(value)} Cr`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", color: "var(--muted)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c4a35a" 
                  strokeWidth={2.5} 
                  name="Sales" 
                  dot={{ fill: "#c4a35a", r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ebitda" 
                  stroke="#7ea57f" 
                  strokeWidth={2.5} 
                  name="EBITDA" 
                  dot={{ fill: "#7ea57f", r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cfo" 
                  stroke="#8d958c" 
                  strokeWidth={2.5} 
                  name="CFO" 
                  dot={{ fill: "#8d958c", r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="debt" 
                  stroke="#c56a55" 
                  strokeWidth={2.5} 
                  name="Gross debt" 
                  dot={{ fill: "#c56a55", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-widest text-muted">
                {["FY", "Sales", "EBITDA", "Interest", "PBT", "PAT", "Debt", "CFO", "DSO", "WC days", "ROCE"].map(
                  (h) => (
                    <th key={h} className="py-3 pr-4 font-normal first:pl-0">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {(company.annuals ?? []).slice(-6).map((r) => (
                <tr key={r.fy} className="border-b border-line/50 hover:bg-bg-2">
                  <td className="py-3 pr-4 font-medium">{r.fy}</td>
                  <td className="num py-3 pr-4">{fmt(r.sales)}</td>
                  <td className="num py-3 pr-4">{fmt(r.ebitda)}</td>
                  <td className="num py-3 pr-4">{fmt(r.interest)}</td>
                  <td className="num py-3 pr-4">{fmt(r.pbt)}</td>
                  <td className="num py-3 pr-4">{fmt(r.netProfit)}</td>
                  <td className="num py-3 pr-4">{fmt(r.borrowings)}</td>
                  <td className="num py-3 pr-4">{fmt(r.cfo)}</td>
                  <td className="num py-3 pr-4">{r.debtorDays}</td>
                  <td className="num py-3 pr-4">{r.wcDays}</td>
                  <td className="num py-3 pr-4">{r.roce}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Risks Section */}
      <section id="risks" className="mt-16">
        <h2 className="serif text-3xl">Risks and signals</h2>
        <p className="mt-1 text-sm text-muted">
          Five derived signals. Each score is deterministic from filings — recommendation, insight, calculation, source.
        </p>
        <div className="mt-8 grid gap-6">
          {score.signals.map((s, index) => (
            <article key={s.id} className="border border-line bg-bg-2/50 p-6 transition-colors hover:border-brass/30">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-2xl" 
                      style={{ color: dirColor[s.direction] }}
                    >
                      {dirIcon[s.direction]}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted">
                      {s.direction} · weight {(s.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="serif mt-2 text-2xl">{s.name}</h3>
                  <p className="num mt-1 text-lg text-brass">{s.displayValue}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="num text-4xl font-light" style={{ color: dirColor[s.direction] }}>
                    {s.score}
                  </p>
                  <p className="text-xs text-muted">confidence {s.confidence}%</p>
                  <div className="mt-2">
                    <Sparkline data={s.trend} color={dirColor[s.direction]} />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-6 border-t border-line/50 pt-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">Why this matters</p>
                  <p className="mt-2 text-sm leading-relaxed">{s.whyItMatters}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">What the numbers say</p>
                  <p className="mt-2 text-sm leading-relaxed">{s.explanation}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-line/50 pt-4">
                <p className="text-xs text-muted">
                  <span className="text-brass">Source:</span> {s.reliedOn.sourceName} — {s.reliedOn.reason}
                </p>
              </div>
            </article>
          ))}
        </div>

        {score.conditions?.length > 0 && (
          <div className="mt-10 border-l-4 border-watch pl-6">
            <h3 className="serif text-2xl">Conditions on the ₹1 crore line</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed">
              {score.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </div>
        )}

        {score.qualitative?.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {score.qualitative.map((q) => (
              <div key={q.id} className="border border-line bg-bg-2/30 p-5">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-2 w-2 rounded-full"
                    style={{ 
                      background: q.severity === "opportunity" ? "var(--ok)" : 
                                 q.severity === "watch" ? "var(--watch)" : "var(--risk)" 
                    }}
                  />
                  <p className="text-xs uppercase tracking-widest text-muted">{q.severity}</p>
                </div>
                <p className="mt-2 font-medium">{q.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{q.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Evidence Section */}
      <section id="evidence" className="mt-16">
        <h2 className="serif text-3xl">Evidence and uncertainty</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          When two sources disagree, both figures are shown. The recommendation names which one it used and why.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-widest text-muted">
                <th className="py-3 pr-4 font-normal">Metric</th>
                <th className="py-3 pr-4 font-normal">Period</th>
                <th className="py-3 pr-4 font-normal">Observations</th>
                <th className="py-3 pr-4 font-normal">Spread</th>
                <th className="py-3 font-normal">Relied on</th>
              </tr>
            </thead>
            <tbody>
              {(company.discrepancies ?? []).map((d) => (
                <tr key={d.id} className="border-b border-line/50 align-top hover:bg-bg-2/30">
                  <td className="py-4 pr-4 font-medium">{d.metric}</td>
                  <td className="num py-4 pr-4 text-muted">{d.period}</td>
                  <td className="py-4 pr-4">
                    <ul className="space-y-2">
                      {d.observations.map((o, i) => (
                        <li key={`${o.sourceId}-${i}`} className="text-sm">
                          <span className="text-muted">{o.sourceName}</span>
                          <span className="mx-2 text-muted">·</span>
                          <span className="num">{o.value.toLocaleString("en-IN")} {d.unit}</span>
                          {o.sourceId === d.preferredSourceId && (
                            <span className="ml-2 rounded border border-brass/30 px-2 py-0.5 text-xs text-brass">
                              ✓ used
                            </span>
                          )}
                          {o.note && (
                            <div className="mt-0.5 text-xs text-muted">{o.note}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="num py-4 pr-4">
                    {d.spreadPct != null ? `${d.spreadPct}%` : "definitional"}
                  </td>
                  <td className="py-4 text-xs leading-relaxed text-muted">{d.reliedWhy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {score.assumptions && score.assumptions.length > 0 && (
          <div className="mt-10 border-t border-line pt-8">
            <h3 className="serif text-2xl">Assumptions</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
              {score.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12">
          <h3 className="serif text-2xl">Rating path</h3>
          <div className="mt-6 space-y-6">
            {(company.ratings ?? []).map((r) => (
              <div key={`${r.date}-${r.agency}`} className="border-l-2 border-brass pl-5">
                <p className="num text-xs text-muted">
                  {r.date} · {r.agency}
                </p>
                <p className="mt-1 text-lg font-medium">
                  {r.rating} 
                  <span className="ml-3 text-sm font-normal text-muted">{r.outlook}</span>
                </p>
                <p className="mt-1 text-sm text-muted">{r.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h3 className="serif text-2xl">Sources</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(company.sources ?? []).map((s) => (
              <div key={s.id} className="border border-line bg-bg-2/30 p-5 transition-colors hover:border-brass/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted">{s.type}</p>
                  </div>
                  <span className="num text-sm text-brass">trust {s.trust}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{s.why}</p>
                {s.url && (
                  <a
                    className="mt-3 inline-block text-xs text-brass underline-offset-2 transition-colors hover:underline"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}