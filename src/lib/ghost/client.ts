import jwt from "jsonwebtoken";
import { getGhostAdminKey, getGhostAdminUrl } from "@/lib/ghost/env";

const GHOST_ADMIN_API_PREFIX = "/ghost/api/admin/";
const GHOST_ACCEPT_VERSION = "v5.0";

function assertGhostConfig() {
  if (!getGhostAdminUrl() || !getGhostAdminKey()) {
    throw new Error("Ghost nije konfigurisan (GHOST_ADMIN_URL / GHOST_ADMIN_KEY).");
  }
}

export function createGhostAdminToken(): string {
  assertGhostConfig();
  const adminKey = getGhostAdminKey()!;
  const [id, secret] = adminKey.split(":");

  if (!id || !secret) {
    throw new Error("GHOST_ADMIN_KEY nije u formatu id:secret");
  }

  return jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    audience: "/admin/",
    expiresIn: "5m",
  });
}

function buildGhostAdminUrl(endpointPath: string): string {
  const adminUrl = getGhostAdminUrl()!;
  const normalizedPath = endpointPath.replace(/^\/+/, "");
  return new URL(`${GHOST_ADMIN_API_PREFIX}${normalizedPath}`, adminUrl).toString();
}

type GhostRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
};

export async function ghostAdminRequest(
  endpointPath: string,
  options: GhostRequestOptions = {}
): Promise<Record<string, unknown>> {
  const token = createGhostAdminToken();
  const headers: Record<string, string> = {
    Authorization: `Ghost ${token}`,
    "Accept-Version": GHOST_ACCEPT_VERSION,
  };

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(buildGhostAdminUrl(endpointPath), {
    ...requestInit,
    next: { revalidate: 300 },
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const firstError =
      payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      Array.isArray((payload as { errors?: unknown[] }).errors)
        ? (payload as { errors: Array<{ message?: string }> }).errors[0]
        : undefined;
    throw new Error(
      `Ghost API ${response.status}: ${firstError?.message ?? "nepoznata greška"}`
    );
  }

  return payload as Record<string, unknown>;
}
