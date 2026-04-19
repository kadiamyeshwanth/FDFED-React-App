const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const REPORT_DIR = path.join(__dirname, "..", "perf-reports");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {};

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }

    out[key] = next;
    i += 1;
  }

  return out;
};

const ensureReportDir = () => {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
};

const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return Number(sorted[Math.max(index, 0)].toFixed(3));
};

const summarizeLatency = (values) => {
  if (!values.length) {
    return {
      count: 0,
      minMs: null,
      maxMs: null,
      avgMs: null,
      p50Ms: null,
      p95Ms: null,
      p99Ms: null,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    count: values.length,
    minMs: Number(min.toFixed(3)),
    maxMs: Number(max.toFixed(3)),
    avgMs: Number((total / values.length).toFixed(3)),
    p50Ms: percentile(values, 50),
    p95Ms: percentile(values, 95),
    p99Ms: percentile(values, 99),
  };
};

const buildHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const loginAdmin = async (baseUrl, email, password) => {
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for login.");
  }

  const response = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Admin login failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  if (!payload.token) {
    throw new Error("Admin login succeeded but token is missing in response.");
  }

  return payload.token;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();

  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (error) {
      json = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    json,
    text,
  };
};

const safeHitRatePct = (stats) => {
  const hits = Number(stats?.hits || 0);
  const misses = Number(stats?.misses || 0);
  const lookups = hits + misses;
  if (lookups <= 0) return null;
  return Number(((hits / lookups) * 100).toFixed(2));
};

const capture = async (options) => {
  const baseUrl = options.baseUrl || "http://localhost:3000";
  const endpoint =
    options.endpoint ||
    "/api/admin/revenue/platform-intelligence?timeframe=month&page=1&limit=20";
  const requestCount = toNumber(options.requests, 30);
  const label = options.label || `capture-${Date.now()}`;
  const shouldLogin = String(options.login || "true") !== "false";
  const logEach = toBoolean(options.logEach, true);
  const statsEach = toBoolean(options.statsEach, true);

  let token = options.token || "";
  if (shouldLogin && !token) {
    token = await loginAdmin(
      baseUrl,
      options.email || process.env.ADMIN_EMAIL,
      options.password || process.env.ADMIN_PASSWORD,
    );
  }

  const headers = buildHeaders(token);

  const resetStats = await requestJson(`${baseUrl}/api/admin/cache/redis-stats/reset`, {
    method: "POST",
    headers,
  });

  if (!resetStats.ok) {
    throw new Error(
      `Failed to reset Redis stats (${resetStats.status}): ${resetStats.text}`,
    );
  }

  const latencyMs = [];
  const statusCount = {};

  console.log(
    `[redis-perf] Starting capture label=${label} requests=${requestCount} endpoint=${endpoint}`,
  );

  for (let i = 0; i < requestCount; i += 1) {
    const started = process.hrtime.bigint();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers,
    });
    const finished = process.hrtime.bigint();
    const elapsedMs = Number(finished - started) / 1e6;
    latencyMs.push(elapsedMs);

    const statusKey = String(response.status);
    statusCount[statusKey] = (statusCount[statusKey] || 0) + 1;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Benchmark request failed at iteration ${i + 1} with status ${response.status}: ${text}`,
      );
    }

    await response.arrayBuffer();

    if (logEach) {
      let liveStatsText = "";

      if (statsEach) {
        const liveStatsResponse = await requestJson(
          `${baseUrl}/api/admin/cache/redis-stats`,
          {
            method: "GET",
            headers,
          },
        );

        if (liveStatsResponse.ok && liveStatsResponse.json?.success) {
          const liveStats = liveStatsResponse.json.stats || {};
          const liveHitRate = safeHitRatePct(liveStats);
          liveStatsText =
            ` hits=${Number(liveStats.hits || 0)}` +
            ` misses=${Number(liveStats.misses || 0)}` +
            ` sets=${Number(liveStats.sets || 0)}` +
            ` skippedNoRedis=${Number(liveStats.skippedNoRedis || 0)}` +
            ` hitRatePct=${liveHitRate === null ? "na" : liveHitRate}`;
        } else {
          liveStatsText = " liveStats=unavailable";
        }
      }

      console.log(
        `[redis-perf] #${i + 1}/${requestCount} status=${response.status} latencyMs=${elapsedMs.toFixed(3)}${liveStatsText}`,
      );
    }
  }

  const statsResponse = await requestJson(`${baseUrl}/api/admin/cache/redis-stats`, {
    method: "GET",
    headers,
  });

  if (!statsResponse.ok || !statsResponse.json || !statsResponse.json.success) {
    throw new Error(
      `Failed to fetch Redis stats (${statsResponse.status}): ${statsResponse.text}`,
    );
  }

  const redisStats = statsResponse.json.stats || {};
  const cacheLookups = Number(redisStats.hits || 0) + Number(redisStats.misses || 0);
  const hitRatePct = safeHitRatePct(redisStats);

  const report = {
    label,
    capturedAt: new Date().toISOString(),
    runConfig: {
      baseUrl,
      endpoint,
      requestCount,
      loginUsed: shouldLogin,
      tokenProvided: !!options.token,
    },
    latency: summarizeLatency(latencyMs),
    statusCount,
    redis: {
      stats: redisStats,
      hitRatePct,
      cacheLookups,
    },
  };

  ensureReportDir();
  const outFile = path.join(REPORT_DIR, `redis-cache-${label}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  console.log("Saved report:", outFile);
  console.log("Latency summary:", report.latency);
  console.log("Redis summary:", {
    hitRatePct: report.redis.hitRatePct,
    hits: redisStats.hits,
    misses: redisStats.misses,
    sets: redisStats.sets,
    skippedNoRedis: redisStats.skippedNoRedis,
  });
};

const compare = (options) => {
  const beforeLabel = options.before;
  const afterLabel = options.after;

  if (!beforeLabel || !afterLabel) {
    throw new Error("Use --before <label> and --after <label> in compare mode.");
  }

  const beforeFile = path.join(REPORT_DIR, `redis-cache-${beforeLabel}.json`);
  const afterFile = path.join(REPORT_DIR, `redis-cache-${afterLabel}.json`);

  if (!fs.existsSync(beforeFile) || !fs.existsSync(afterFile)) {
    throw new Error("One or both report files are missing. Capture both first.");
  }

  const before = JSON.parse(fs.readFileSync(beforeFile, "utf8"));
  const after = JSON.parse(fs.readFileSync(afterFile, "utf8"));

  const pctImprovement = (beforeValue, afterValue) => {
    if (
      typeof beforeValue !== "number" ||
      typeof afterValue !== "number" ||
      beforeValue === 0
    ) {
      return null;
    }
    return Number((((beforeValue - afterValue) / beforeValue) * 100).toFixed(2));
  };

  const result = {
    comparedAt: new Date().toISOString(),
    beforeLabel,
    afterLabel,
    latency: {
      avgMs: {
        before: before.latency?.avgMs ?? null,
        after: after.latency?.avgMs ?? null,
        improvementPct: pctImprovement(before.latency?.avgMs, after.latency?.avgMs),
      },
      p95Ms: {
        before: before.latency?.p95Ms ?? null,
        after: after.latency?.p95Ms ?? null,
        improvementPct: pctImprovement(before.latency?.p95Ms, after.latency?.p95Ms),
      },
      p99Ms: {
        before: before.latency?.p99Ms ?? null,
        after: after.latency?.p99Ms ?? null,
        improvementPct: pctImprovement(before.latency?.p99Ms, after.latency?.p99Ms),
      },
    },
    redis: {
      hitRatePct: {
        before: before.redis?.hitRatePct ?? null,
        after: after.redis?.hitRatePct ?? null,
      },
      hits: {
        before: before.redis?.stats?.hits ?? null,
        after: after.redis?.stats?.hits ?? null,
      },
      misses: {
        before: before.redis?.stats?.misses ?? null,
        after: after.redis?.stats?.misses ?? null,
      },
      skippedNoRedis: {
        before: before.redis?.stats?.skippedNoRedis ?? null,
        after: after.redis?.stats?.skippedNoRedis ?? null,
      },
    },
  };

  ensureReportDir();
  const outFile = path.join(
    REPORT_DIR,
    `redis-cache-compare-${beforeLabel}-vs-${afterLabel}.json`,
  );
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

  console.log("Saved comparison:", outFile);
  console.log(JSON.stringify(result, null, 2));
};

const main = async () => {
  const options = parseArgs();
  const mode = options.mode || "capture";

  if (!["capture", "compare"].includes(mode)) {
    throw new Error("Invalid --mode. Use capture or compare.");
  }

  if (mode === "compare") {
    compare(options);
    return;
  }

  await capture(options);
};

main().catch((error) => {
  console.error("redis-cache-perf failed:", error.message);
  process.exit(1);
});
