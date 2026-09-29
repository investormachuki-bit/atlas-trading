# ATLAS Research Engine V2 — Controlled Feature Discovery

## Objective

Upgrade Strategy Discovery from a small fixed hypothesis list to a controlled, statistically disciplined feature-combination search. The engine must discover conditions under which an existing strategy has positive expectancy without automatically changing the live strategy.

## Search dimensions

1. Direction: LONG, SHORT
2. Volatility: LOW, NORMAL, HIGH
3. Session: ASIA, LONDON, NEW_YORK, OFF_HOURS
4. UTC hour: 0–23, only when minimum sample requirements are satisfied
5. Market regime: use the regime classifications already produced by the backtest engine
6. Exit reason: TP, SL, TIME_EXIT (diagnostic only; never use future exit information as an entry filter)

## Candidate construction

- Test single-factor candidates first.
- Test two-factor combinations next.
- Do not search arbitrary higher-order combinations until two-factor candidates establish sufficient evidence.
- Enforce a minimum sample size before ranking a candidate.
- Preserve chronological order. Never shuffle.
- Candidate filters must use information available at entry time only.
- Never use exit outcome, future candles, or post-entry MFE/MAE to construct an entry filter.

## Validation

Every candidate must be evaluated on:

- ALL history
- chronological TRAIN split
- chronological OOS split
- expanding walk-forward folds

Record:

- trades
- wins
- losses
- breakevens
- total R
- expectancy R/trade
- profit factor
- max drawdown
- positive OOS fold percentage
- yearly stability
- monthly stability

## Robust ranking

Rank candidates using robustness rather than raw profit. The ranking should reward:

- positive OOS expectancy
- PF > 1
- positive OOS total R
- high positive walk-forward fold percentage
- low drawdown
- sufficient sample size
- stability across years/months

Penalize:

- small samples
- extreme drawdown
- single-period dependence
- excessive filter complexity
- candidates that pass only because of one exceptional period

## Research gates

A candidate must not be labeled POSITIVE_EDGE unless it satisfies the configured evidence gates. Recommended initial gates:

- minimum total trades: 100
- minimum OOS trades: 30
- OOS expectancy > 0
- OOS PF > 1.05
- OOS total R > 0
- walk-forward positive folds >= 60%
- max drawdown < 25%
- no single calendar year contributes more than 60% of total positive R

These are research gates, not trading guarantees.

## Current hypothesis to preserve as a benchmark

The latest baseline research found `LONG + NO HIGH VOLATILITY` interesting: historically approximately +1R and OOS approximately +18R. This must remain a hypothesis for independent validation, not a promoted strategy.

## Required output JSON

```json
{
  "engine_version": "2.0.0",
  "search_space": {},
  "candidates_tested": 0,
  "ranked_candidates": [],
  "recommended_next_step": null,
  "research_verdict": "NO_EDGE",
  "research_score": 0,
  "validation": {
    "oos": {},
    "walk_forward": {}
  }
}
```

Each ranked candidate should include its filter definition plus `all`, `train`, `test`, `walk_forward`, `stability`, `complexity`, `discovery_score`, `validation_pass`, and `sample_status` fields.

## Safety

Discovery results are research evidence only. The engine must never automatically alter the production strategy, generate live orders, or authorize live trading from a discovery result.
