import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const FONT = "'DM Sans', system-ui, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

const C = {
  bg: "#0b1221",
  surface: "#111827",
  card: "#162032",
  border: "#1e3050",
  text: "#dce8f5",
  muted: "#5a7a9e",
  blue: "#60a5fa",
  teal: "#2dd4bf",
  orange: "#fb923c",
  red: "#f87171",
};

const DATA = {
  federal_income: {
    label: "Federal Income Tax",
    sublabel: "The most cited measure",
    tagColor: C.blue,
    description:
      "Individual federal income taxes only — including refundable credits (EITC, Child Tax Credit), which make the bottom quintiles net recipients.",
    source: "Congressional Budget Office, 2023 (2020 tax year)",
    quintiles: [
      { group: "Bottom 20%", short: "Bot.", rate: -8, share: -2 },
      { group: "2nd Quintile", short: "2nd", rate: -1, share: 0 },
      { group: "Middle 20%", short: "Mid.", rate: 7, share: 6 },
      { group: "4th Quintile", short: "4th", rate: 12, share: 15 },
      { group: "Top 20%", short: "Top", rate: 22, share: 81 },
    ],
    top1: { rate: 26, share: 42 },
    verdict: "Progressive",
    verdictColor: C.blue,
    rateNote:
      "Rates span −8% to +22% — a very steep curve driven partly by refundable credits at the bottom.",
    shareNote:
      "Top 20% pays 81% of all federal income taxes. But they also earn ~55% of all income — so the concentration is real but context matters.",
    insight:
      "The bottom two quintiles receive more back in credits than they owe in taxes — net effective rates are negative. This is a feature, not a bug: the EITC and Child Tax Credit function as income supplements via the tax code.",
  },
  all_federal: {
    label: "All Federal Taxes",
    sublabel: "Add payroll and the curve flattens",
    tagColor: C.teal,
    description:
      "Income taxes + payroll (FICA) + corporate taxes + excise taxes. Payroll taxes are capped at ~$160K, so they hit the middle class proportionally harder.",
    source: "Congressional Budget Office, 2023 (2020 tax year)",
    quintiles: [
      { group: "Bottom 20%", short: "Bot.", rate: 2, share: 1 },
      { group: "2nd Quintile", short: "2nd", rate: 8, share: 5 },
      { group: "Middle 20%", short: "Mid.", rate: 13, share: 10 },
      { group: "4th Quintile", short: "4th", rate: 17, share: 19 },
      { group: "Top 20%", short: "Top", rate: 27, share: 65 },
    ],
    top1: { rate: 31, share: 24 },
    verdict: "Moderately Progressive",
    verdictColor: C.teal,
    rateNote:
      "The curve still rises, but the gap between the middle and top compresses — payroll taxes do more proportional work for middle earners.",
    shareNote:
      "Adding payroll taxes redistributes share down the income scale: the middle contributes a larger slice than in income-tax-only view.",
    insight:
      "Social Security taxes apply at a flat 6.2% up to ~$160K, then zero above that. This 'regressive cap' means someone earning $320K pays the same payroll tax in dollars as someone earning $160K — half the effective rate.",
  },
  all_taxes: {
    label: "Federal + State + Local",
    sublabel: "The full tax burden",
    tagColor: C.orange,
    description:
      "All taxes: federal income + payroll + state income + sales taxes + property taxes. Sales and property taxes are regressive — they consume a larger share of lower incomes.",
    source: "Institute on Taxation & Economic Policy (ITEP), Who Pays?, 2024",
    quintiles: [
      { group: "Bottom 20%", short: "Bot.", rate: 20, share: 2 },
      { group: "2nd Quintile", short: "2nd", rate: 22, share: 6 },
      { group: "Middle 20%", short: "Mid.", rate: 25, share: 11 },
      { group: "4th Quintile", short: "4th", rate: 27, share: 20 },
      { group: "Top 20%", short: "Top", rate: 29, share: 61 },
    ],
    top1: { rate: 34, share: 24 },
    verdict: "Nearly Flat",
    verdictColor: C.orange,
    rateNote:
      "The poorest fifth face ~20% effective rate; the richest ~29%. That's a less-than-1.5× ratio despite a 10× or more income difference.",
    shareNote:
      "At this scale, share of taxes paid roughly tracks share of income — which is the definition of a proportional (flat) system, not a progressive one.",
    insight:
      "Sales taxes in most states are flat-rate on consumption, and lower-income households spend a higher share of income. A family spending all their income pays 7% sales tax on 100% of earnings; a wealthy family spending 30% of income faces 7% on only 30%. The tax rate is identical; the burden is not.",
  },
};

const KEYS = ["federal_income", "all_federal", "all_taxes"];

function RateTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      style={{
        background: "#1a2840",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: FONT,
        fontSize: 13,
        color: C.text,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: val < 0 ? C.red : C.blue }}>
        {val >= 0 ? "+" : ""}
        {val}% effective rate
      </div>
    </div>
  );
}

function ShareTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      style={{
        background: "#1a2840",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: FONT,
        fontSize: 13,
        color: C.text,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: val < 0 ? C.red : C.teal }}>
        {val}% of total taxes
      </div>
    </div>
  );
}

function TaxRateChart({ d }) {
  return (
    <>
      <div
        style={{
          fontSize: 12.5,
          color: C.muted,
          marginBottom: 14,
          paddingLeft: 4,
        }}
      >
        % of income paid in taxes, by quintile
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={d.quintiles}
          margin={{ top: 4, right: 16, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            vertical={false}
          />
          <XAxis
            dataKey="group"
            tick={{ fill: C.muted, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: C.muted, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={<RateTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <ReferenceLine y={0} stroke={C.border} strokeWidth={1.5} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {d.quintiles.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.rate < 0 ? C.red : d.tagColor}
                fillOpacity={0.7 + i * 0.06}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderLeft: `3px solid ${d.tagColor}`,
          background: C.card,
          borderRadius: "0 6px 6px 0",
          fontSize: 13,
          color: C.muted,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: C.text }}>Top 1% rate: </strong>
        <span style={{ color: d.tagColor, fontWeight: 600 }}>
          {d.top1.rate}%
        </span>
        <span style={{ opacity: 0.65 }}>
          {" "}
          vs. Top 20% avg: {d.quintiles[4].rate}%
        </span>
        <div style={{ marginTop: 6, fontSize: 12.5 }}>{d.rateNote}</div>
      </div>
    </>
  );
}

function TaxShareChart({ d }) {
  return (
    <>
      <div
        style={{
          fontSize: 12.5,
          color: C.muted,
          marginBottom: 14,
          paddingLeft: 4,
        }}
      >
        Share of total tax revenue, by quintile
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={d.quintiles}
          margin={{ top: 4, right: 16, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={C.border}
            vertical={false}
          />
          <XAxis
            dataKey="group"
            tick={{ fill: C.muted, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: C.muted, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={<ShareTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <ReferenceLine y={0} stroke={C.border} strokeWidth={1.5} />
          <Bar dataKey="share" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {d.quintiles.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.share < 0 ? C.red : C.teal}
                fillOpacity={0.55 + i * 0.1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderLeft: `3px solid ${C.teal}`,
          background: C.card,
          borderRadius: "0 6px 6px 0",
          fontSize: 13,
          color: C.muted,
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: C.text }}>Top 1% contribution: </strong>
        <span style={{ color: C.teal, fontWeight: 600 }}>{d.top1.share}%</span>
        <span style={{ opacity: 0.65 }}> — they earn ~21% of all income</span>
        <div style={{ marginTop: 6, fontSize: 12.5 }}>{d.shareNote}</div>
      </div>
    </>
  );
}

const GITHUB_URL = "https://github.com/nicolovejoy/tax-progressivity";

function About({ onBack }) {
  return (
    <>
      <button
        onClick={onBack}
        className="r-btn"
        style={{
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: "6px 12px",
          color: C.muted,
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 20,
        }}
      >
        ← Back to charts
      </button>
      <div
        style={{
          marginBottom: 6,
          fontSize: 11,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: C.muted,
          fontWeight: 500,
        }}
      >
        About
      </div>
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(22px, 5vw, 38px)",
          fontWeight: 700,
          lineHeight: 1.15,
          margin: "0 0 18px",
          color: "#f0f6ff",
        }}
      >
        What is this?
      </h1>
      <p style={{ color: C.text, fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>
        A small data viz exploring a simple question: <em>is the U.S. tax system
        progressive?</em> The honest answer is &quot;it depends on which taxes you
        count.&quot; Look at federal income tax alone and the curve is steeply
        progressive. Add payroll taxes and it flattens. Include state and local
        taxes — sales, property, excise — and the effective rate on the bottom
        quintile ends up within a few points of the top.
      </p>
      <p style={{ color: C.text, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
        That&apos;s the whole project. Toggle between the three regimes to see how
        the framing changes the answer.
      </p>

      <h2 style={{ fontFamily: SERIF, fontSize: 22, color: "#f0f6ff", margin: "28px 0 10px" }}>
        Where the data comes from
      </h2>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 12,
          fontSize: 13.5,
          lineHeight: 1.65,
          color: C.muted,
        }}
      >
        <div style={{ color: C.blue, fontWeight: 600, marginBottom: 4 }}>
          Federal Income Tax &middot; All Federal Taxes
        </div>
        Congressional Budget Office, <em>The Distribution of Household Income</em>,
        2023 edition (2020 tax year).{" "}
        <a href="https://www.cbo.gov/publication/58353" style={{ color: C.blue }}>
          cbo.gov/publication/58353
        </a>
      </div>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 24,
          fontSize: 13.5,
          lineHeight: 1.65,
          color: C.muted,
        }}
      >
        <div style={{ color: C.orange, fontWeight: 600, marginBottom: 4 }}>
          Federal + State + Local
        </div>
        Institute on Taxation &amp; Economic Policy (ITEP), <em>Who Pays?</em>,
        7th edition, 2024.{" "}
        <a href="https://itep.org/whopays/" style={{ color: C.orange }}>
          itep.org/whopays
        </a>
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 22, color: "#f0f6ff", margin: "28px 0 10px" }}>
        Caveats
      </h2>
      <ul style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.75, paddingLeft: 20 }}>
        <li>
          Figures are single-year snapshots and rounded. Different sources use
          different income definitions (comprehensive vs. AGI vs. market income),
          so rates are not directly comparable across the three regimes.
        </li>
        <li>
          State and local burdens vary enormously by state — ITEP&apos;s national
          average smooths over a 7-state spread wider than the national bottom-to-top gap.
        </li>
        <li>
          Negative effective rates in the federal income view reflect refundable
          credits (EITC, Child Tax Credit) exceeding tax liability. That&apos;s
          working as designed, not an error.
        </li>
        <li>
          &quot;Top 1%&quot; is a subset of the &quot;Top 20%&quot; quintile, not a separate bucket.
        </li>
      </ul>

      <h2 style={{ fontFamily: SERIF, fontSize: 22, color: "#f0f6ff", margin: "28px 0 10px" }}>
        Source
      </h2>
      <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7 }}>
        Built with React, Vite, and recharts. Hosted on Vercel. Source and data
        on GitHub:{" "}
        <a href={GITHUB_URL} style={{ color: C.teal }}>
          {GITHUB_URL.replace("https://", "")}
        </a>
      </p>
    </>
  );
}

export default function TaxProgressivity() {
  const [regime, setRegime] = useState("federal_income");
  const [view, setView] = useState("rates");
  const [page, setPage] = useState("main");
  const d = DATA[regime];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: FONT,
        padding: "28px 20px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        .r-btn:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {page === "about" ? (
          <About onBack={() => setPage("main")} />
        ) : (
        <>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.muted,
              fontWeight: 500,
            }}
          >
            Tax Policy
          </div>
          <button
            onClick={() => setPage("about")}
            className="r-btn"
            style={{
              background: "transparent",
              border: "none",
              color: C.muted,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: 0,
            }}
          >
            About →
          </button>
        </div>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(22px, 5vw, 38px)",
            fontWeight: 700,
            lineHeight: 1.15,
            margin: "0 0 10px",
            color: "#f0f6ff",
          }}
        >
          Progressive Taxation:
          <br />
          Myth or Reality?
        </h1>
        <p
          style={{
            color: C.muted,
            fontSize: 14,
            maxWidth: 560,
            margin: "0 0 28px",
            lineHeight: 1.65,
          }}
        >
          The U.S. tax system is described as progressive — but the answer
          changes dramatically depending on which taxes you include. Toggle
          between views below.
        </p>

        {/* Regime selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {KEYS.map((key) => {
            const dat = DATA[key];
            const active = regime === key;
            return (
              <button
                key={key}
                className="r-btn"
                onClick={() => setRegime(key)}
                style={{
                  background: active ? dat.tagColor : "transparent",
                  border: `1.5px solid ${active ? dat.tagColor : C.border}`,
                  borderRadius: 6,
                  padding: "8px 14px",
                  color: active ? "#0b1221" : C.muted,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {dat.label}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  → {dat.verdict}
                </span>
              </button>
            );
          })}
        </div>

        {/* Description bar */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: C.muted,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: d.tagColor, fontWeight: 600 }}>
            {d.sublabel}.{" "}
          </span>
          {d.description}
          <span
            style={{
              display: "block",
              marginTop: 5,
              fontSize: 11.5,
              opacity: 0.6,
            }}
          >
            Data: {d.source}
          </span>
        </div>

        {/* View tabs */}
        <div
          style={{
            display: "flex",
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            overflow: "hidden",
            width: "fit-content",
            marginBottom: 16,
          }}
        >
          {[
            ["rates", "Effective Rates"],
            ["share", "Share of Taxes"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                background: view === key ? C.blue : "transparent",
                color: view === key ? "#0b1221" : C.muted,
                border: "none",
                padding: "8px 16px",
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: "20px 16px 16px",
            marginBottom: 18,
          }}
        >
          {view === "rates" ? <TaxRateChart d={d} /> : <TaxShareChart d={d} />}
        </div>

        {/* Insight */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                background: d.verdictColor,
                color: "#0b1221",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              {d.verdict}
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            {d.insight}
          </p>
        </div>

        {/* Comparison summary */}
        <div
          style={{
            background: C.surface,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            Effective rate comparison (bottom 20% vs top 20%)
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {KEYS.map((key) => {
              const dat = DATA[key];
              const bottom = dat.quintiles[0].rate;
              const top = dat.quintiles[4].rate;
              const isActive = regime === key;
              return (
                <div
                  key={key}
                  onClick={() => setRegime(key)}
                  style={{
                    flex: "1 1 160px",
                    background: isActive ? `${dat.tagColor}12` : C.card,
                    border: `1.5px solid ${isActive ? dat.tagColor : C.border}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: dat.tagColor,
                      marginBottom: 6,
                    }}
                  >
                    {dat.label}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    <span>
                      Bot:{" "}
                      <strong style={{ color: bottom < 0 ? C.red : C.text }}>
                        {bottom}%
                      </strong>
                    </span>
                    <span style={{ margin: "0 8px", opacity: 0.4 }}>→</span>
                    <span>
                      Top: <strong style={{ color: C.text }}>{top}%</strong>
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: C.muted,
                      marginTop: 4,
                      opacity: 0.7,
                    }}
                  >
                    {top > 0 && bottom > 0
                      ? `${(top / bottom).toFixed(1)}× ratio`
                      : "Negative bottom rate"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 16,
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.7,
            opacity: 0.8,
          }}
        >
          <strong style={{ color: C.text }}>Notes: </strong>
          Data is approximate; figures represent single-year snapshots and vary
          by source methodology. "Effective rate" = total taxes paid ÷
          comprehensive household income. Negative effective rates reflect
          refundable credits exceeding tax liability. Income quintile thresholds
          approximate 2020 CBO values. State/local data varies significantly by
          state. Top 1% is a subset of the Top 20% quintile; treat comparisons
          accordingly.
        </div>
        </>
        )}
      </div>
    </div>
  );
}
