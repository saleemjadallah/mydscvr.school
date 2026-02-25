import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

interface EnquiryEmailParams {
  type: "parent_confirmation" | "school_notification";
  to: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  schoolName?: string;
  childGrade?: string;
  message?: string;
  enquiryId?: string;
  enquiryType?: string;
}

const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  general: "General Admission",
  tour: "School Tour",
  fees: "Fees & Scholarships",
  transfer: "Transfer Enquiry",
  sen: "SEN / Inclusion",
};

export async function sendEnquiryEmail(params: EnquiryEmailParams) {
  if (params.type === "parent_confirmation") {
    return getResend().emails.send({
      from: "mydscvr.ai <hello@mydscvr.ai>",
      to: params.to,
      subject: `Your enquiry to ${params.schoolName} has been sent`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Enquiry Sent!</h2>
          <p>Hi ${params.parentName},</p>
          <p><a href="https://mydscvr.ai" style="color: #FF6B35; text-decoration: none; font-weight: 600;">mydscvr.ai</a> has forwarded your enquiry directly to the admissions team at <strong>${params.schoolName}</strong>.</p>
          <p>They will typically respond within 1–2 business days.</p>
          <p>Your enquiry ID: <code>${params.enquiryId}</code></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 14px;">
            This email was sent by <a href="https://mydscvr.ai" style="color: #999;">mydscvr.ai</a> —
            Dubai's AI-powered school finder.
          </p>
        </div>
      `,
    });
  }

  if (params.type === "school_notification") {
    const typeLabel = params.enquiryType
      ? ENQUIRY_TYPE_LABELS[params.enquiryType] || "General Enquiry"
      : "General Enquiry";

    const subjectParts = [`New Enquiry: ${typeLabel}`, `— ${params.parentName}`];
    if (params.childGrade) subjectParts.push(`(${params.childGrade})`);
    subjectParts.push(`| ${params.schoolName}`);
    const subject = subjectParts.join(" ");

    const typeBadgeColor =
      params.enquiryType === "tour"
        ? "#2563eb"
        : params.enquiryType === "fees"
          ? "#16a34a"
          : params.enquiryType === "transfer"
            ? "#9333ea"
            : params.enquiryType === "sen"
              ? "#e11d48"
              : "#FF6B35";

    return getResend().emails.send({
      from: "mydscvr.ai <leads@mydscvr.ai>",
      replyTo: params.parentEmail,
      bcc: params.parentEmail,
      to: params.to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">New Parent Enquiry</h2>

          <span style="display: inline-block; background: ${typeBadgeColor}; color: white; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">
            ${typeLabel}
          </span>

          <p>You've received a new admissions enquiry through <strong>mydscvr.ai</strong>.</p>

          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Parent:</strong> ${params.parentName}</p>
            <p><strong>Email:</strong> <a href="mailto:${params.parentEmail}">${params.parentEmail}</a></p>
            ${params.parentPhone ? `<p><strong>Phone:</strong> <a href="tel:${params.parentPhone}">${params.parentPhone}</a></p>` : ""}
            ${params.childGrade ? `<p><strong>Grade Applying For:</strong> ${params.childGrade}</p>` : ""}
            ${params.message ? `<p><strong>Message:</strong><br/>${params.message}</p>` : ""}
          </div>

          <p><strong>Reply directly to this email to respond to the parent.</strong></p>
          <p>Please respond within 24–48 hours to maximise conversion.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 13px;">
            This enquiry was submitted via <a href="https://mydscvr.ai" style="color: #999;">mydscvr.ai</a> — Dubai's AI-powered school finder.
            <br/>Lead ID: ${params.enquiryId}
          </p>
        </div>
      `,
    });
  }
}

// ---------------------------------------------------------------------------
// No-response reminder email
// ---------------------------------------------------------------------------

interface NoResponseReminderParams {
  to: string;
  parentName: string;
  schoolName: string;
  daysWaiting: number;
  enquiryId: string;
}

export async function sendNoResponseReminderEmail(
  params: NoResponseReminderParams
) {
  return getResend().emails.send({
    from: "mydscvr.ai <hello@mydscvr.ai>",
    to: params.to,
    subject: `Reminder: Your enquiry to ${params.schoolName} — ${params.daysWaiting} days waiting`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Enquiry Follow-up</h2>
        <p>Hi ${params.parentName},</p>
        <p>Your enquiry to <strong>${params.schoolName}</strong> has been waiting
           <strong>${params.daysWaiting} days</strong> without a response.</p>

        <div style="background: #fff7ed; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #fed7aa;">
          <p style="margin: 0; font-size: 14px;">
            <strong>What you can do:</strong>
          </p>
          <ul style="margin: 8px 0 0; padding-left: 18px; font-size: 14px;">
            <li>Contact the school directly via their website or phone</li>
            <li>Submit an enquiry to similar schools on mydscvr.ai</li>
            <li>Check your dashboard for updates</li>
          </ul>
        </div>

        <p>
          <a href="https://mydscvr.ai/dashboard"
             style="display: inline-block; background: #FF6B35; color: white;
                    padding: 10px 24px; border-radius: 8px; text-decoration: none;
                    font-weight: 600; font-size: 14px;">
            View Dashboard
          </a>
        </p>

        <p style="color: #999; font-size: 14px;">
          Enquiry ID: ${params.enquiryId} |
          <a href="https://mydscvr.ai/profile?tab=notifications">Manage notification preferences</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 14px;">
          This email was sent by <a href="https://mydscvr.ai">mydscvr.ai</a> —
          Dubai's AI-powered school discovery platform.
        </p>
      </div>
    `,
  });
}
