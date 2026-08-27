export function calculateDiagnostics(results = {}) {
  const pf = Number(results.profit_factor);

  const expectancy = Number(
    results.expectancy_R
  );

  const totalR = Number(
    results.total_R
  );

  const drawdown = Number(
    results.max_drawdown
  );

  const trades = Number(
    results.trades ??
      results.test_trades ??
      0
  );

  const checks = {
    profitability:
      Number.isFinite(pf) &&
      pf > 1,

    expectancy:
      Number.isFinite(expectancy) &&
      expectancy > 0,

    equity:
      Number.isFinite(totalR) &&
      totalR > 0,

    sample:
      trades >= 100,

    drawdown:
      Number.isFinite(drawdown) &&
      drawdown < 0.25
  };

  return {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades,
    checks
  };
}


/* ============================================================
   RESEARCH VERDICT
   ============================================================ */

export function getResearchVerdict(results = {}) {
  const {
    checks
  } = calculateDiagnostics(results);

  const positiveChecks =
    Object.values(checks)
      .filter(Boolean)
      .length;

  /*
   * Not enough trades to make a
   * meaningful statistical judgment.
   */

  if (!checks.sample) {
    return {
      verdict: "INSUFFICIENT SAMPLE",
      message:
        "The current test does not contain enough trades to make a reliable statistical judgment."
    };
  }

  /*
   * A strategy cannot demonstrate
   * an edge without positive
   * profitability, expectancy
   * and equity growth.
   */

  if (
    !checks.profitability ||
    !checks.expectancy ||
    !checks.equity
  ) {
    return {
      verdict: "NO EDGE",
      message:
        "The tested strategy does not currently demonstrate a positive statistical edge."
    };
  }

  /*
   * Strong research result.
   */

  if (
    checks.profitability &&
    checks.expectancy &&
    checks.equity &&
    checks.sample &&
    checks.drawdown &&
    positiveChecks >= 4
  ) {
    return {
      verdict: "POSITIVE EDGE",
      message:
        "The current test demonstrates positive profitability, expectancy and equity growth within the research risk limits."
    };
  }

  /*
   * Positive characteristics,
   * but requires additional validation.
   */

  if (positiveChecks >= 3) {
    return {
      verdict: "PROMISING",
      message:
        "The strategy shows positive characteristics but requires additional validation before being considered reliable."
    };
  }

  return {
    verdict: "INCONCLUSIVE",
    message:
      "ATLAS needs more evidence before judging the strategy."
  };
}