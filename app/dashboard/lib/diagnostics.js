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

/*
 * IMPORTANT:
 *
 * This function determines the BASIC historical verdict only.
 *
 * It does NOT determine whether the strategy is ready for
 * robustness testing. That decision belongs to the separate
 * robustness gate in ResearchDiagnostics.js.
 *
 * Therefore:
 *
 * HISTORICAL BACKTEST
 *        ↓
 * BASIC VERDICT
 *        ↓
 * ROBUSTNESS GATE
 *        ↓
 * OOS / WALK-FORWARD / MONTE CARLO / PAPER / LIVE
 *
 * Drawdown is a hard research-risk requirement for a
 * POSITIVE EDGE verdict.
 */

export function getResearchVerdict(results = {}) {
  const {
    checks
  } = calculateDiagnostics(results);


  /* ==========================================================
     1. SAMPLE SIZE
     ========================================================== */

  /*
   * ATLAS requires at least 100 trades before making a
   * meaningful statistical judgment.
   */

  if (!checks.sample) {
    return {
      verdict: "INSUFFICIENT SAMPLE",

      message:
        "The current test does not contain enough trades to make a reliable statistical judgment."
    };
  }


  /* ==========================================================
     2. CORE EDGE REQUIREMENTS
     ========================================================== */

  /*
   * A historical edge requires all three:
   *
   * - Profit Factor > 1
   * - Expectancy > 0
   * - Positive Net Result
   *
   * Failure of any one means there is currently no
   * sufficiently demonstrated historical edge.
   */

  const coreEdge =
    checks.profitability &&
    checks.expectancy &&
    checks.equity;


  if (!coreEdge) {
    return {
      verdict: "NO EDGE",

      message:
        "The tested strategy does not currently demonstrate a positive statistical edge."
    };
  }


  /* ==========================================================
     3. RISK CONTROL
     ========================================================== */

  /*
   * A strategy can be profitable while carrying unacceptable
   * historical risk.
   *
   * Therefore drawdown is NOT optional for POSITIVE EDGE.
   *
   * Research limit:
   *
   * maximum drawdown < 25%
   */

  if (!checks.drawdown) {
    return {
      verdict: "PROMISING",

      message:
        "The strategy demonstrates positive profitability, expectancy and equity growth, but historical drawdown exceeds the research risk limit. Additional risk investigation is required before the strategy can be considered a positive research edge."
    };
  }


  /* ==========================================================
     4. POSITIVE HISTORICAL EDGE
     ========================================================== */

  /*
   * At this point:
   *
   * sample       PASS
   * profitability PASS
   * expectancy    PASS
   * equity        PASS
   * drawdown      PASS
   *
   * This establishes a positive historical edge.
   *
   * It does NOT establish robustness.
   */

  return {
    verdict: "POSITIVE EDGE",

    message:
      "The current historical test demonstrates positive profitability, expectancy and equity growth within the research risk limits."
  };
}