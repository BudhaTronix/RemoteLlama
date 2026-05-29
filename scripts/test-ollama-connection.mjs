#!/usr/bin/env node

const DEFAULT_PROTOCOL = "http";
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 11434;
const DEFAULT_TIMEOUT_MS = 5000;

function printUsage() {
  console.log(`Usage:
  npm run test:connection -- --url http://192.168.1.42:11434
  npm run test:connection -- --host 192.168.1.42 --port 11434 --protocol http

Options:
  --url <url>           Full Ollama base URL
  --host <host>         Hostname or IP address
  --port <port>         Port number (default: 11434)
  --protocol <scheme>   http or https (default: http)
  --timeout <ms>        Request timeout in milliseconds (default: 5000)
`);
}

function parseArgs(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      values[key] = true;
      continue;
    }

    values[key] = next;
    index += 1;
  }

  return values;
}

function normalizeTarget(options) {
  if (options.help) {
    printUsage();
    process.exit(0);
  }

  if (options.url) {
    const parsed = new URL(String(options.url));
    return {
      protocol: parsed.protocol.replace(":", "") || DEFAULT_PROTOCOL,
      host: parsed.hostname || DEFAULT_HOST,
      port: Number(parsed.port || DEFAULT_PORT),
      timeoutMs: Number(options.timeout || DEFAULT_TIMEOUT_MS),
    };
  }

  return {
    protocol: String(options.protocol || DEFAULT_PROTOCOL),
    host: String(options.host || process.env.OLLAMA_TEST_HOST || DEFAULT_HOST),
    port: Number(options.port || process.env.OLLAMA_TEST_PORT || DEFAULT_PORT),
    timeoutMs: Number(options.timeout || DEFAULT_TIMEOUT_MS),
  };
}

function buildBaseUrl(target) {
  return `${target.protocol}://${target.host}:${target.port}`;
}

function createTimeoutSignal(timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return undefined;
  }

  return AbortSignal.timeout(timeoutMs);
}

async function fetchJson(url, timeoutMs) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: createTimeoutSignal(timeoutMs),
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const target = normalizeTarget(options);
  const baseUrl = buildBaseUrl(target);

  console.log(`Testing Ollama connection at ${baseUrl}`);

  try {
    const versionStarted = Date.now();
    const version = await fetchJson(`${baseUrl}/api/version`, target.timeoutMs);
    const versionLatency = Date.now() - versionStarted;

    if (!version.ok) {
      console.error(
        `Version check failed (${version.status}): ${
          typeof version.data === "string"
            ? version.data
            : JSON.stringify(version.data)
        }`,
      );
      process.exit(1);
    }

    const modelsStarted = Date.now();
    const models = await fetchJson(`${baseUrl}/api/tags`, target.timeoutMs);
    const modelsLatency = Date.now() - modelsStarted;

    if (!models.ok) {
      console.error(
        `Model list check failed (${models.status}): ${
          typeof models.data === "string" ? models.data : JSON.stringify(models.data)
        }`,
      );
      process.exit(1);
    }

    const versionLabel =
      version.data && typeof version.data === "object" && "version" in version.data
        ? version.data.version
        : "unknown";
    const modelNames = Array.isArray(models.data?.models)
      ? models.data.models
          .map((model) => model?.name)
          .filter((name) => typeof name === "string")
      : [];

    console.log("Connection works.");
    console.log(`Version: ${versionLabel}`);
    console.log(`Version latency: ${versionLatency} ms`);
    console.log(`Models latency: ${modelsLatency} ms`);
    console.log(
      modelNames.length
        ? `Models: ${modelNames.join(", ")}`
        : "Models: none returned",
    );
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "TimeoutError"
        ? `Timed out after ${target.timeoutMs} ms.`
        : error instanceof Error
          ? error.message
          : "Unknown error.";

    console.error(`Connection failed: ${message}`);
    process.exit(1);
  }
}

await main();
