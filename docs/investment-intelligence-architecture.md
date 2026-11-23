# ATLAS Investment Intelligence — Architecture & Delivery Plan

**Status:** Approved product direction; implementation plan  
**Repository:** `investormachuki-bit/atlas-trading`  
**Initial market:** Nairobi Securities Exchange (NSE)  
**Expansion:** Global equities and other supported asset classes  
**Product modes:** Long-term investing + active trading  
**Deployment:** Existing Next.js application on Render  
**Backend:** Existing ATLAS Supabase project (no replacement project)

## 1. Product vision

ATLAS becomes one personal investment intelligence workspace that separates two decision workflows while sharing market data, research, identity, and portfolio records:

- **Investing:** business quality, financial statements, valuation, dividends, balance-sheet strength, and long-term portfolio allocation.
- **Trading:** price action, indicators, strategy signals, backtests, risk sizing, and trade journaling.

The platform is an analytical decision-support tool. It must not present a score as a guaranteed outcome or place live orders automatically.

## 2. Non-negotiable implementation constraints

1. Extend the existing `atlas-trading` repository and deployed application. Do not create a duplicate product.
2. Preserve existing XAUUSD history, strategies, backtests, scanner, discovery and signal-evaluation workflows.
3. Reuse the existing ATLAS Supabase project and inspect its live schema before proposing/applying database changes. Never create a replacement Supabase project.
4. All database changes must be additive, reviewed migrations. No destructive table/column changes as part of this expansion.
5. Never expose Supabase service-role keys or market-provider secrets to the browser.
6. Never label delayed, stale, manually imported or simulated data as live.
7. Store source, currency, period, publication time, retrieval time and data-quality status for financial and price observations.
8. Keep research candidates separate from production strategies. Discovery must never silently promote a strategy or execute trades.
9. User portfolio records and private notes must be protected by authenticated ownership/RLS.
10. No fabricated historical prices, fundamentals, results or performance metrics.

## 3. Navigation and application modules

### Main navigation
- Overview
- Markets
- Investment Scanner
- Company Research
- Valuation Lab
- Trading Terminal
- Portfolio
- Watchlists
- Strategy Lab
- Risk Manager
- Research Centre
- Settings / Data Sources

### Overview
A single cross-market snapshot with separate Investing and Trading panels:
- portfolio market value, cost basis, unrealized/realized P&L and cash (only when actual records exist)
- watchlist movement and market breadth (only when sourced)
- top fundamental candidates and technical setups, clearly separated
- upcoming corporate actions and earnings dates when a reliable calendar is available
- data freshness and provider status

## 4. Market and instrument architecture

Use a market-neutral instrument model rather than building NSE-specific logic into the trading engine.

Logical concepts (not yet a final SQL schema):
- **Market:** exchange/venue, country, timezone, trading calendar, currency and market status source.
- **Instrument:** stable internal ID, symbol, display name, asset class, market ID, quote currency, sector/industry, instrument type and active status.
- **Price observation / candle:** instrument, interval, OHLCV, timestamp, source, ingestion timestamp, adjustment status and quality flags.
- **Fundamental observation:** instrument, metric, value, unit, currency, reporting period, fiscal period end, publication date, source and restatement/version.
- **Corporate action:** dividends, splits, rights issues, bonus issues, suspensions and other price/share-count adjustments.
- **Provider registry:** provider, supported markets/data types, licensing notes, credentials reference and health/freshness status.

NSE is the first market adapter. Later markets should plug into the same contracts without changing valuation formulas or core trading entities.

## 5. Investing engine

### Fundamental metrics
- EPS (reported and trailing twelve months)
- P/E (trailing; forward only where sourced estimates exist)
- Book value per share and P/B
- ROE and ROA where relevant
- Revenue, net-income and EPS growth
- Dividend per share, dividend yield and payout ratio
- Debt/equity, net debt and interest coverage where applicable
- Operating cash flow and free cash flow where the statements support calculation
- Liquidity and market capitalization

### Valuation methods
1. **Relative valuation:** P/E and P/B against the company's own history and appropriate sector peers.
2. **Dividend model:** only for suitable dividend-paying businesses and with explicit assumptions.
3. **Cash-flow valuation:** phased DCF after historical financial statement coverage and normalized cash-flow inputs are available.
4. **Asset-based checks:** useful for banks, insurers, property and other asset-heavy businesses, with sector-specific adjustments.

Do not apply one universal P/E or P/B threshold to all sectors. Banks and insurers need sector-aware treatment; negative earnings, negative book value, one-off earnings and stale statements must be flagged.

### Candidate scoring
Use a transparent, configurable score with visible component contributions:
- valuation
- profitability/business quality
- earnings and cash-flow growth
- balance-sheet risk
- dividend sustainability
- liquidity and data confidence

The score ranks research candidates; it is not a buy/sell command. Missing or stale inputs reduce confidence and may make a company unscorable. Show the as-of date and source for every input.

### Valuation output
- current price and price timestamp
- EPS/BVPS and their reporting periods
- selected peer/target multiples and rationale
- P/E-implied value and P/B-implied value where valid
- DCF or dividend-model value only when inputs are adequate
- base/bear/bull scenarios
- estimated value range and margin of safety
- key risks, assumptions and confidence/data-quality grade

## 6. Trading engine

Retain and extend the existing ATLAS trading capabilities:
- current XAUUSD data and market identity
- existing strategy definitions, backtests and research discovery
- signal ledger and outcome evaluator
- strategy robustness and chronological out-of-sample validation

Add NSE equity trading only after a valid price-data adapter and trading calendar are available. NSE is not assumed to have the same intraday coverage, liquidity or market hours as FX/CFD instruments.

Trading features:
- timeframe-aware charts and indicators
- rule-based signal cards with timestamp, entry, stop and targets
- entry-time feature snapshot and strategy version
- paper-trade journal and trade lifecycle
- risk per trade, position size, stop distance and risk/reward
- commissions, taxes, spread, slippage and liquidity assumptions where known
- backtests with chronological train/test and walk-forward validation

No broker integration or live order execution in the first release.

## 7. Portfolio and risk

Portfolio records should support:
- manual buy/sell entries, fees, taxes and cash movements
- positions, average cost, realized/unrealized P&L
- dividend receipts and corporate actions
- asset allocation by market, sector, instrument and currency
- watchlists and investment thesis notes
- trading journal kept distinct from long-term holdings

Risk controls:
- position sizing from account equity, chosen risk percentage and stop distance
- portfolio concentration and sector exposure
- currency exposure
- drawdown and loss tracking
- user-defined limits and alerts

Do not assume account equity, cash balance or holdings. They must come from user-entered or connected records.

## 8. Data strategy and source quality

Before connecting a provider, verify:
- exchange coverage (NSE instruments and corporate actions)
- historical depth and update frequency
- delayed vs real-time status
- licensing/redistribution terms
- API reliability, symbol mapping and adjustment policy
- cost and rate limits

Initial delivery should support an auditable manual/import workflow for financial statements and prices if an approved provider is not yet available. Provider integrations must be adapters, not hard-coded into UI components.

Every displayed market value must carry a freshness label such as Real-time, Delayed, End-of-day, Manual or Stale. Never infer market-open status without a reliable exchange calendar.

## 9. Security and data ownership

- Continue using Supabase Auth and existing organization/user relationships.
- Confirm the actual current schema and RLS policies before adding portfolio tables.
- Private portfolios, watchlists, notes, saved valuations and trade journals must be scoped to the authenticated user (or an explicitly selected organization).
- Use server-side authorization for privileged operations.
- Provider credentials remain server-side.
- Add audit records for imports, valuation runs and strategy changes.
- Public market reference data may be shared; personal financial data must not be.

## 10. Delivery phases

### Phase 0 — Existing-system audit (required before schema changes)
- Map all existing tables, views, functions, triggers and RLS policies in the existing ATLAS Supabase project.
- Map the existing frontend routes and trading-engine dependencies.
- Verify Render service, deployment branch, environment-variable names and current production health.
- Identify existing market/candle schema that can be reused.
- Produce a migration impact map. No schema changes in this phase.

### Phase 1 — NSE investment foundation (next build phase)
- Add a market/instrument directory using an exchange-neutral contract.
- Build NSE company list, search, sector filters and instrument detail.
- Build company fundamentals input/import with source and reporting-period metadata.
- Implement P/E, P/B, EPS, BVPS, ROE, dividend yield, payout and growth calculations.
- Add the first transparent fundamental screener and company comparison.
- Add a watchlist and saved investment thesis.
- Display freshness and data-quality states on every relevant view.

### Phase 2 — Valuation and portfolio
- Add peer-based relative valuation and scenario-based fair-value ranges.
- Add DCF only after adequate financial statement history is available.
- Add manual portfolio holdings, transactions, dividends, corporate actions and performance.
- Add portfolio risk and concentration views.

### Phase 3 — NSE trading
- Connect an approved NSE price-data source.
- Add exchange calendar, adjusted historical candles and data-quality checks.
- Adapt the existing technical-analysis and backtest contracts to NSE equities.
- Add paper trading and execution-cost assumptions before any broker integration is considered.

### Phase 4 — Global expansion
- Add market adapters for selected global exchanges.
- Add currency conversion with timestamped FX observations.
- Add international corporate actions and local exchange calendars.
- Keep the same portfolio, valuation and risk interfaces.

## 11. Phase 1 acceptance criteria

Phase 1 is complete only when:
- NSE instruments can be searched and filtered without mock records.
- Company fundamentals show source, reporting period, publication date and data freshness.
- P/E and P/B handle zero/negative EPS and zero/negative book value safely.
- All ratios can be traced to their input values and formulas.
- Sector comparisons use relevant peer groups.
- Stale/missing data is visibly flagged and cannot silently produce a high-confidence score.
- Watchlists and thesis notes persist for the signed-in user and pass ownership/RLS tests.
- Existing XAUUSD backtests, discovery and signal results remain functional.
- The deployed build passes its production build and authentication smoke tests.

## 12. Immediate blockers / approvals

- The GitHub repository is accessible and the existing frontend is Next.js 14 with Supabase JS.
- The existing ATLAS Supabase project ID recorded in prior project work is not visible in the currently connected Supabase project list. Do not guess or use another project. Confirm access to the existing ATLAS project before schema inspection or migrations.
- Render workspace selection is required before inspecting or changing Render resources. Do not select a workspace automatically.
- A production-grade NSE data provider has not yet been selected or verified. Do not invent a live feed.

## 13. First implementation sequence

1. Complete Phase 0 schema and deployment audit.
2. Agree the NSE data source and import format.
3. Implement the NSE instrument directory and fundamentals model additively.
4. Build the screener, company comparison and valuation pages.
5. Test RLS and regression-test the existing trading modules.
6. Deploy to the existing Render service only after the user reviews the change set.
