import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "jsr:@panva/jose@6";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabaseJwtIssuer =
  Deno.env.get("SB_JWT_ISSUER") || `${supabaseUrl}/auth/v1`;
const supabaseJwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
const supabaseJwks = supabaseUrl
  ? jose.createRemoteJWKSet(new URL(supabaseJwksUrl))
  : null;

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function ensureSupabaseEnv() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new HttpError(
      500,
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

function parseAdminEmails() {
  return new Set(
    (Deno.env.get("ADMIN_EMAILS") || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function createSupabaseAdminClient() {
  ensureSupabaseEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

export async function requireAuthorizedAdmin(authHeader: string | null) {
  ensureSupabaseEnv();

  if (!authHeader) {
    throw new HttpError(401, "Missing Authorization header.");
  }

  const user = await resolveUserFromAuthHeader(authHeader);
  if (!user) {
    throw new HttpError(401, "Unauthorized.");
  }

  const allowedAdminEmails = parseAdminEmails();
  if (allowedAdminEmails.size === 0) {
    throw new HttpError(500, "ADMIN_EMAILS is not configured.");
  }

  const userEmail = user.email?.trim().toLowerCase();
  if (!userEmail || !allowedAdminEmails.has(userEmail)) {
    throw new HttpError(403, "Admin access required.");
  }

  return user;
}

export async function requireAuthorizedAdminOrCronSecret({
  authHeader,
  cronSecretHeader,
  secretEnvName,
}: {
  authHeader: string | null;
  cronSecretHeader: string | null;
  secretEnvName: string;
}) {
  const configuredSecret = Deno.env.get(secretEnvName) || "";

  if (configuredSecret && cronSecretHeader === configuredSecret) {
    return { type: "cron" as const };
  }

  const user = await requireAuthorizedAdmin(authHeader);
  return {
    type: "admin" as const,
    user,
  };
}

async function resolveUserFromAuthHeader(authHeader: string) {
  const token = getBearerToken(authHeader);
  if (!token) {
    return null;
  }

  const verifiedUser = await verifyJwtWithJwks(token);
  if (verifiedUser) {
    return verifiedUser;
  }

  const authClient = createSupabaseAdminClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error) {
    return null;
  }

  return user ?? null;
}

function getBearerToken(authHeader: string) {
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function verifyJwtWithJwks(token: string) {
  if (!supabaseJwks) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify(token, supabaseJwks, {
      issuer: supabaseJwtIssuer,
    });

    return {
      id: typeof payload.sub === "string" ? payload.sub : "",
      email: typeof payload.email === "string" ? payload.email : "",
      role: typeof payload.role === "string" ? payload.role : "",
      payload,
    };
  } catch {
    return null;
  }
}
