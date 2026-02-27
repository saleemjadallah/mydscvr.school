import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import db from "@/db";
import type { SchoolAdminRole } from "@/types";

export interface SchoolAdminSession {
  userId: string;
  schoolAdminId: string;
  schoolId: string;
  role: SchoolAdminRole;
  isSchoolAdmin: true;
}

interface SchoolAdminAuthFailure {
  response: NextResponse;
  isSchoolAdmin: false;
}

/**
 * Require school admin access. Optionally scope to a specific school.
 * Mirrors the `requireAdmin()` pattern from admin-auth.ts.
 */
export async function requireSchoolAdmin(
  schoolId?: string
): Promise<SchoolAdminSession | SchoolAdminAuthFailure> {
  const session = await auth();

  if (!session.userId) {
    return {
      isSchoolAdmin: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Query active school_admins record for this Clerk user
  let query = `
    SELECT id, school_id, role
    FROM school_admins
    WHERE clerk_user_id = $1 AND is_active = true
  `;
  const params: unknown[] = [session.userId];

  if (schoolId) {
    query += ` AND school_id = $2`;
    params.push(schoolId);
  }

  query += ` ORDER BY role = 'owner' DESC, created_at ASC LIMIT 1`;

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    return {
      isSchoolAdmin: false,
      response: NextResponse.json(
        { error: "Not a school administrator" },
        { status: 403 }
      ),
    };
  }

  const row = result.rows[0];
  return {
    userId: session.userId,
    schoolAdminId: row.id,
    schoolId: row.school_id,
    role: row.role,
    isSchoolAdmin: true,
  };
}

/**
 * Get all schools a Clerk user administers (for school switcher).
 */
export async function getSchoolsForAdmin(clerkUserId: string) {
  const result = await db.query(
    `SELECT sa.id AS school_admin_id, sa.school_id, sa.role,
            s.name AS school_name, s.slug AS school_slug
     FROM school_admins sa
     JOIN schools s ON s.id = sa.school_id
     WHERE sa.clerk_user_id = $1 AND sa.is_active = true
     ORDER BY s.name`,
    [clerkUserId]
  );
  return result.rows;
}
