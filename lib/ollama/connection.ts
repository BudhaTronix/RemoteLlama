import type { ConnectionProtocol, ConnectionSettings } from "@/types/app";

const DEFAULT_PORT = 11434;

function stripCredentials(value: string) {
  return value.includes("@") ? value.split("@").at(-1) ?? value : value;
}

export function normalizeConnectionInput(input: {
  protocol?: ConnectionProtocol;
  host: string;
  port?: number | string;
}): ConnectionSettings {
  let protocol = input.protocol ?? "http";
  let host = input.host.trim();
  let port = Number(input.port ?? DEFAULT_PORT);

  if (/^https?:\/\//i.test(host)) {
    try {
      const parsed = new URL(host);
      protocol = parsed.protocol === "https:" ? "https" : "http";
      host = parsed.hostname;
      if (parsed.port) {
        port = Number(parsed.port);
      }
    } catch {
      host = host.replace(/^https?:\/\//i, "");
    }
  }

  host = stripCredentials(host)
    .replace(/[/?#].*$/, "")
    .replace(/\/+$/, "");

  const ipv6Match = host.match(/^(\[[^\]]+\])(?::(\d+))?$/);
  if (ipv6Match) {
    host = ipv6Match[1];
    if (ipv6Match[2]) {
      port = Number(ipv6Match[2]);
    }
  } else if (/^[^:]+:\d+$/.test(host)) {
    const [normalizedHost, normalizedPort] = host.split(":");
    host = normalizedHost;
    port = Number(normalizedPort);
  }

  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    port = DEFAULT_PORT;
  }

  return {
    protocol,
    host,
    port,
  };
}

export function isSafeHost(host: string) {
  if (!host) {
    return false;
  }

  if (host.includes("/") || host.includes("?") || host.includes("#")) {
    return false;
  }

  try {
    const url = new URL(`http://${host}`);
    return url.hostname === host;
  } catch {
    return /^\[[0-9a-fA-F:]+\]$/.test(host);
  }
}

export function buildOllamaBaseUrl(connection: ConnectionSettings) {
  const host = connection.host.startsWith("[")
    ? connection.host
    : connection.host.toLowerCase();

  return `${connection.protocol}://${host}:${connection.port}`;
}

export function getDefaultConnection(): ConnectionSettings {
  return {
    protocol: "http",
    host: "",
    port: DEFAULT_PORT,
  };
}
