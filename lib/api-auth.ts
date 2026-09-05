import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/auth";

export interface ApiAuthUser {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

/** Same trust root as NextAuth's own JWT session — see auth.ts. */
function mobileJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is not set");
  return secret;
}

export function signMobileToken(user: ApiAuthUser): string {
  return jwt.sign(user, mobileJwtSecret(), { expiresIn: "30d" });
}

/**
 * Resolves the authenticated user for either client: a mobile request
 * carrying `Authorization: Bearer <token>` (signed by
 * POST /api/mobile/session), or the web's NextAuth cookie session. Neither
 * client format is decodable by the other's verifier — this only requires
 * they share a secret, not an encoding scheme.
 */
export async function getAuthUser(req: NextRequest): Promise<ApiAuthUser | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, mobileJwtSecret());
      if (typeof payload === "object" && payload.id && payload.role) {
        return payload as unknown as ApiAuthUser;
      }
      return null;
    } catch {
      return null;
    }
  }

  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as { id: string; role: string; name?: string; email?: string };
  return { id: user.id, role: user.role, name: user.name, email: user.email };
}

/** Throws-free guard — callers still return their own 401/403 JSON response. */
export function hasRole(user: ApiAuthUser | null, roles: string[]): user is ApiAuthUser {
  return !!user && roles.includes(user.role);
}
