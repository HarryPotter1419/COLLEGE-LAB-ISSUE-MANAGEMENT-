/**
 * utils/mailer.js — Email Notification Service
 * Uses Nodemailer with Gmail SMTP
 * Set EMAIL_ENABLED=true in .env to activate
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification when issue status is updated
 * @param {string} toEmail   - Student's email
 * @param {string} toName    - Student's name
 * @param {object} issue     - The updated issue object
 */
async function sendStatusUpdateEmail(toEmail, toName, issue) {
  if (process.env.EMAIL_ENABLED !== 'true') return;

  const statusColors = {
    'Pending':     '#f59e0b',
    'In Progress': '#3b82f6',
    'Resolved':    '#10b981'
  };

  const color = statusColors[issue.status] || '#6366f1';

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px 40px; border-bottom: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="font-size: 28px;">🔬</span>
        <span style="font-size: 20px; font-weight: 700; color: #f1f5f9;">Lab Issue System</span>
      </div>
      <p style="color: #64748b; margin: 0; font-size: 14px;">Issue Status Update Notification</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="color: #94a3b8; margin-bottom: 24px; font-size: 15px;">Hi <strong style="color: #f1f5f9;">${toName}</strong>,</p>
      
      <p style="color: #94a3b8; margin-bottom: 24px; font-size: 15px;">
        Your reported lab issue has been updated. Here are the details:
      </p>

      <!-- Status Badge -->
      <div style="background: #1e293b; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155;">
        <div style="margin-bottom: 16px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">New Status</span><br/>
          <span style="display: inline-block; margin-top: 6px; padding: 6px 16px; background: ${color}22; color: ${color}; border-radius: 20px; font-weight: 700; font-size: 14px; border: 1px solid ${color}44;">
            ● ${issue.status}
          </span>
        </div>

        <div style="margin-bottom: 16px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Lab / System</span><br/>
          <span style="color: #f1f5f9; font-size: 14px; margin-top: 4px; display: block;">${issue.labNumber} — ${issue.systemNumber}</span>
        </div>

        <div style="margin-bottom: 16px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Your Description</span><br/>
          <span style="color: #cbd5e1; font-size: 14px; margin-top: 4px; display: block;">${issue.description}</span>
        </div>

        ${issue.adminRemarks ? `
        <div style="background: #0f172a; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
          <span style="font-size: 12px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">📝 Admin Remarks</span><br/>
          <span style="color: #fde68a; font-size: 14px; margin-top: 6px; display: block;">${issue.adminRemarks}</span>
        </div>` : ''}
      </div>

      <p style="color: #64748b; font-size: 13px;">
        Login to the portal to view full details and add follow-up comments.<br/>
        <a href="http://localhost:3000" style="color: #6366f1;">http://localhost:3000</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 20px 40px; text-align: center;">
      <p style="color: #475569; font-size: 12px; margin: 0;">
        This is an automated message from Lab Issue Reporting System.<br/>
        Please do not reply to this email.
      </p>
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `🔬 Issue Update: ${issue.status} — Lab Issue System`,
      html
    });
    console.log(`📧 Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't crash the server — email failure is non-fatal
  }
}

/**
 * Send confirmation email when a new issue is submitted
 */
async function sendIssueSubmittedEmail(toEmail, toName, issue) {
  if (process.env.EMAIL_ENABLED !== 'true') return;

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px 40px; border-bottom: 1px solid #1e293b;">
      <span style="font-size: 28px;">🔬</span>
      <span style="font-size: 20px; font-weight: 700; color: #f1f5f9; margin-left: 10px;">Lab Issue System</span>
      <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Issue Submitted Successfully</p>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #94a3b8;">Hi <strong style="color: #f1f5f9;">${toName}</strong>,</p>
      <p style="color: #94a3b8;">Your issue has been submitted and the HOD has been notified. We'll get back to you soon.</p>
      <div style="background: #1e293b; border-radius: 10px; padding: 20px; border: 1px solid #334155;">
        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Issue Summary</p>
        <p style="color: #f1f5f9; margin: 0 0 8px;">${issue.description}</p>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Lab: ${issue.labNumber} | Priority: <span style="color: #f59e0b;">${issue.priority}</span></p>
      </div>
    </div>
    <div style="background: #1e293b; padding: 20px 40px; text-align: center;">
      <p style="color: #475569; font-size: 12px; margin: 0;">Lab Issue Reporting System — Automated Notification</p>
    </div>
  </div>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `✅ Issue Submitted — Lab Issue System`,
      html
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendStatusUpdateEmail, sendIssueSubmittedEmail };