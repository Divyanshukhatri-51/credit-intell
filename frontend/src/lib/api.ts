export type Source = {
  id: string;
  name: string;
  type: string;
  url: string;
  trust: number;
  why: string;
};

export type Annual = {
  fy: string;
  sales: number;
  ebitda: number;
  interest: number;
  pbt: number;
  netProfit: number;
  borrowings: number;
  cfo: number;
  debtorDays: number;
  wcDays: number;
  cashConvCycle: number;
  roce: number;
};

export type Quarter = {
  quarter: string;
  sales: number;
  ebitda: number;
  interest: number;
  pbt: number;
  netProfit: number;
};

export type Rating = {
  date: string;
  agency: string;
  rating: string;
  outlook: string;
  rationale: string;
};

export type Discrepancy = {
  id: string;
  metric: string;
  period: string;
  unit: string;
  observations: {
    sourceId: string;
    sourceName: string;
    trust: number;
    value: number;
    note: string;
  }[];
  spreadPct: number | null;
  preferredSourceId: string;
  reliedWhy: string;
};

export type Company = {
  slug: string;
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  description: string;
  sources: Source[];
  annuals: Annual[];
  quarters: Quarter[];
  ratings: Rating[];
  discrepancies: Discrepancy[];
};

export type Signal = {
  id: string;
  name: string;
  weight: number;
  score: number;
  direction: "positive" | "watch" | "risk";
  confidence: number;
  displayValue: string;
  trend: { period: string; value: number }[];
  whyItMatters: string;
  explanation: string;
  reliedOn: { sourceId: string; sourceName: string; reason: string };
};

export type ScoreCard = {
  companySlug?: string;
  loanAmountCr?: number;
  asOf: string;
  verdict: "APPROVE" | "APPROVE_WITH_CONDITIONS" | "DECLINE";
  headlineScore: number;
  confidence: number;
  summary: string;
  conditions: string[];
  assumptions?: string[];
  signals: Signal[];
  strengths?: string[];
  qualitative: {
    id: string;
    title: string;
    severity: "opportunity" | "watch" | "risk";
    body: string;
  }[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type CompanySummary = {
  slug: string;
  name: string;
  ticker?: string;
  exchange?: string;
  sector?: string;
  description?: string;
};

export async function fetchCompanies(): Promise<CompanySummary[]> {
  const res = await fetch(`${API}/api/companies`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load companies (${res.status})`);
  return res.json();
}

export async function fetchCompany(slug: string): Promise<Company> {
  const res = await fetch(`${API}/api/companies/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load company (${res.status})`);
  return res.json();
}

export async function fetchScore(slug: string): Promise<ScoreCard> {
  const res = await fetch(`${API}/api/scores/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load score (${res.status})`);
  return res.json();
}
