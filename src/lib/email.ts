import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
}

export async function sendEnquiryEmail(params: EnquiryEmailParams) {
  if (params.type === "parent_confirmation") {
    return resend.emails.send({
      from: "mydscvr.ai <hello@mydscvr.ai>",
      to: params.to,
      subject: `Your enquiry to ${params.schoolName} has been sent`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Enquiry Sent!</h2>
          <p>Hi ${params.parentName},</p>
          <p>Your enquiry to <strong>${params.schoolName}</strong> has been sent successfully.
             The admissions team will typically respond within 1-2 business days.</p>
          <p>Your enquiry ID: <code>${params.enquiryId}</code></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 14px;">
            This email was sent by <a href="https://mydscvr.ai">mydscvr.ai</a> —
            Dubai's AI-powered school discovery platform.
          </p>
        </div>
      `,
    });
  }

  if (params.type === "school_notification") {
    return resend.emails.send({
      from: "mydscvr.ai <leads@mydscvr.ai>",
      to: params.to,
      subject: "New Admissions Enquiry from mydscvr.ai",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">New Parent Enquiry</h2>
          <p>You've received a new admissions enquiry through <strong>mydscvr.ai</strong>.</p>

          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Parent:</strong> ${params.parentName}</p>
            <p><strong>Email:</strong> ${params.parentEmail}</p>
            ${params.parentPhone ? `<p><strong>Phone:</strong> ${params.parentPhone}</p>` : ""}
            ${params.childGrade ? `<p><strong>Grade Applying For:</strong> ${params.childGrade}</p>` : ""}
            ${params.message ? `<p><strong>Message:</strong><br/>${params.message}</p>` : ""}
          </div>

          <p>Please respond within 24-48 hours to maximise conversion.</p>
          <p style="color: #999; font-size: 14px;">
            Lead ID: ${params.enquiryId} | Powered by <a href="https://mydscvr.ai">mydscvr.ai</a>
          </p>
        </div>
      `,
    });
  }
}
