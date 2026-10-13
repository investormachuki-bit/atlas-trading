# ATLAS Signal Platform — Product Requirements from SimpliTradeAI Reference

Status: implementation requirements, not a claim that these features are already deployed.

## Product objective
Build an original multi-tenant market scanner and signal-history platform inspired by the functional patterns in the user-provided SimpliTradeAI screenshots. Do not copy its branding, proprietary code, or assume its advertised performance is independently verified.

## 1. Live scanner
- Scan configured instruments and supported timeframes on a schedule appropriate to each market.
- Show instrument, timeframe, current price, last scan time, market-open/closed state when reliable market-calendar data exists, and active signal count.
- Support the user's chosen markets, including synthetic indices where licensed/reliable data and permitted integrations are available.
- Avoid claiming a market is live or open based only on a stale candle.

## 2. Multi-timeframe panel
For each configured timeframe (initial target: 1m, 5m, 15m, 30m, 1h, 4h, 1D), show indicator values and a deterministic state: BUY, SELL, or WAIT.
- Display the rule(s) that produced each state.
- Higher-timeframe agreement is a feature, not proof of predictive edge.
- Store indicator/rule version and candle timestamp used for the decision.
- Never use candles that had not closed at signal time.

## 3. Signal lifecycle and immutable audit trail
Each signal must be persisted with at least:
- signal ID, organization/tenant ID, market ID, timeframe, strategy/version ID
- direction, signal timestamp, candle timestamp, entry, stop loss, TP1/TP2/TP3
- risk distance, target distances, planned R multiples, spread/cost assumptions and source
- feature snapshot (regime, volatility bucket, session, indicator states)
- signal status: active, invalidated, expired, or closed
- evaluation timestamps and outcome fields
- engine/rule version and input-data provenance

Do not overwrite historical signals when rules change. Store a new version/new signal record. Restrict updates to trusted evaluator code; client UI must not be able to edit outcomes.

## 4. Explicit outcome policy
Before comparing ATLAS to another signal service, define one consistent evaluation policy:
- Signal is recorded at a completed candle close; execution/entry assumption is explicit.
- Stop/target collisions within one candle are resolved conservatively unless lower-timeframe data proves the order.
- Define expiry and early invalidation before testing.
- Define whether TP1/TP2/TP3 are partial exits, alternative target scenarios, or milestone-only observations.
- If partial exits are used, define allocation percentages and the remaining-position stop/trailing policy.
- Record SL, TP1, TP2, TP3, timeout, invalidation, and unresolved outcomes separately.
- Include spread, commission, slippage and execution delay when known; otherwise label the run gross/indicative.
- Never count a trade as a winner merely because price touched TP1 if the configured exit policy would have closed it at a loss first.

## 5. Signal Results dashboard
Provide filters for date range, market, timeframe, strategy/rule version, direction, session, volatility/regime, and all signals versus selected filters.
Display:
- signals generated, evaluated, open, expired and closed
- TP1/TP2/TP3 reach counts and rates, with denominators stated
- win/loss/breakeven/early/invalidation counts under the declared outcome policy
- net and gross R, expectancy R per closed trade, profit factor, max drawdown, and equity curve
- results by timeframe, market, direction, session, UTC hour, month and year
- sample size and confidence/uncertainty warnings
- downloadable raw signal ledger for audit

Every metric must be calculated from persisted signal records and the selected filter, not manually entered UI values. All denominators must be explicit; TP milestone rates may overlap and must not be added as if mutually exclusive outcomes.

## 6. Signal card
Show market, BUY/SELL, timeframe, fired-at time, signal age, entry, SL, TP1/TP2/TP3, current/last close with timestamp, planned R distances, rule explanation, and any confirmation timeframes. Provide copy-levels and open-chart actions when the chart destination is known. Do not fabricate prices or label delayed data as live.

## 7. Research integration
- Candidate filters include direction, volatility, session, UTC hour and only regime features that are genuinely calculated and available at signal time.
- Run single-factor screens before combinations; bound the search to reduce multiple-testing overfit.
- Use chronological train/OOS separation and expanding walk-forward folds.
- Rank on robustness, sample sufficiency, OOS expectancy/PF/drawdown, period stability and complexity penalty—not raw full-history profit alone.
- Preserve every experiment and its data/strategy/version identifiers.
- No candidate automatically becomes an active production strategy. Require separate review and paper-trading validation.

## 8. Multi-tenant and security requirements
- Enforce tenant isolation in database policies and backend authorization, not only frontend filters.
- Derive tenant membership from authenticated server-side identity.
- Keep broker credentials server-side as references/secrets; never return them to the browser.
- Rate-limit scanning and signal-generation endpoints and log failures.
- Do not use synthetic/mock market data in real performance reports.

## 9. Delivery order
1. Inspect existing schema/functions and map current signal/backtest entities.
2. Agree and implement the signal outcome policy.
3. Implement persisted signal ledger and trusted outcome evaluator.
4. Implement scanner scheduling and signal card using real data.
5. Implement Signal Results analytics from the ledger.
6. Add research candidate screening and walk-forward evaluation.
7. Verify tenant isolation, RLS, idempotency, collision handling, and stale-data behavior.
8. Run historical tests and paper trading; disclose costs and limitations.

## Reference screenshot interpretation
The supplied reference shows a multi-timeframe RSI/golden-cross state panel, chart levels for entry/SL/three targets, and a results dashboard with TP milestone counts and aggregate R metrics. The displayed percentages and totals are reference claims only, not independently verified evidence. ATLAS must define its own reproducible accounting rules before comparing performance.
