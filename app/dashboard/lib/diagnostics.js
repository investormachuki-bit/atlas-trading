export function calculateDiagnostics(results) {
  const pf = Number(results?.profit_factor);

  const expectancy = Number(
    results?.expectancy_R
  );

  const totalR = Number(
    results?.total_R
  );

  const drawdown = Number(
    results?.max_drawdown
  );

  const trades = Number(
    results?.trades ??
      results?.test_trades ??
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


export function getResearchVerdict(results) {
  const {
    pf,
    expectancy,
    totalR,
    drawdown,
    trades,
    checks
  } = calculateDiagnostics(results);

  if (trades < 100) {
    return {
      verdict: "INSUFFICIENT SAMPLE",

      message:
        "The current test does not contain enough trades to make a reliable statistical judgment.",

      checks
    };
  }

  if (
    checks.profitability &&
    checks.expectancy &&
    checks.equity &&
    checks.sample &&
    checks.drawdown
  ) {
    return {
      verdict: "POSITIVE EDGE",

      message:
        "The current test demonstrates positive profitability, expectancy and equity growth within the research risk limits.",

      checks
    };
  }

  if (
    checks.profitability &&
    checks.expectancy &&
    checks.equity
  ) {
    return {
      verdict: "PROMISING",

      message:
        "The strategy shows positive characteristics but requires additional validation before being considered reliable.",

      checks
    };
  }

  return {
    verdict: "NO EDGE",

    message:
      "The tested strategy does not currently demonstrate a positive statistical edge.",

    checks
  };
}


export function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${(number * 100).toFixed(2)}%`;
}


export function formatR(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${number.toFixed(3)} R`;
}


export function formatNumber(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(decimals);
}