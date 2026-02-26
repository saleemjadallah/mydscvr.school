import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Require admin role. Returns admin userId or a 403 response.
 */
export async function requireAdmin(): Promise<
  { userId: string; isAdmin: true } | { response: NextResponse; isAdmin: false }
> {
  const session = await auth();

  if (!session.userId) {
    return {
      isAdmin: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = session.sessionClaims?.metadata?.role;

  if (role !== "admin") {
    return {
      isAdmin: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { userId: session.userId, isAdmin: true };
}

/**
 * Log admin action for audit trail.
 */
export async function logAdminAction(
  db: { query: (text: string, params?: unknown[]) => Promise<unknown> },
  opts: {
    adminUserId: string;
    action: string;
    targetType: string;
    targetId: string;
    changes?: Record<string, unknown>;
    ipAddress?: string | null;
  }
) {
  try {
    await db.query(
      `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, changes, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        opts.adminUserId,
        opts.action,
        opts.targetType,
        opts.targetId,
        opts.changes ? JSON.stringify(opts.changes) : null,
        opts.ipAddress ?? null,
      ]
    );
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}
