import { NextRequest, NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/school-admin-auth";
import db from "@/db";
import { getPlanConfig } from "@/lib/plans";

// POST /api/school-admin/profile/photos — Upload photo (placeholder)
export async function POST(request: NextRequest) {
  const adminCheck = await requireSchoolAdmin();
  if (!adminCheck.isSchoolAdmin) return adminCheck.response;

  try {
    // Check plan photo limit
    const subResult = await db.query(
      `SELECT plan FROM school_subscriptions
       WHERE school_id = $1 AND status IN ('active', 'trialing')
       LIMIT 1`,
      [adminCheck.schoolId]
    );
    const plan = getPlanConfig(subResult.rows[0]?.plan ?? "free");

    const photoCount = await db.query(
      `SELECT COUNT(*) FROM school_photos
       WHERE school_id = $1 AND is_active = true`,
      [adminCheck.schoolId]
    );

    if (Number(photoCount.rows[0].count) >= plan.maxPhotos) {
      return NextResponse.json(
        {
          error: `Photo limit reached. Your ${plan.name} plan allows up to ${plan.maxPhotos} photos.`,
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    // TODO: Implement actual file upload to R2
    // For now, accept the FormData but return a placeholder
    const _formData = await request.formData();

    return NextResponse.json(
      {
        error: "Photo upload storage not yet configured",
        message: "R2 storage integration coming soon.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("School admin photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
