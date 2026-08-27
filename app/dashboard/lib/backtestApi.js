import { BACKTEST_API } from "./constants";

export async function apiCall(body, token) {
  const response = await fetch(BACKTEST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Backtest API returned HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Backtest failed with HTTP ${response.status}`
    );
  }

  return data;
}

export async function startBacktest(token) {
  return apiCall(
    {
      action: "start"
    },
    token
  );
}

export async function stepBacktest(
  jobId,
  token
) {
  return apiCall(
    {
      action: "step",
      job_id: jobId
    },
    token
  );
}