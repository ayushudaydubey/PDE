const nodemailer = require("nodemailer");

const sendAssignmentEmail = async (salesmanEmail, salesmanName, targetListName, description, adminName, adminEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: process.env.SMTP_PORT || 2525,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${adminName} via Prospect Engine" <${process.env.SMTP_FROM_EMAIL || "noreply@gnosysdigital.com"}>`,
      replyTo: adminEmail || process.env.SMTP_FROM_EMAIL || "noreply@gnosysdigital.com",
      to: salesmanEmail,
      subject: `New Target List Assigned: ${targetListName}`,
      text: `Hello ${salesmanName},\n\nYou have been assigned a new target list for outreach by ${adminName}.\n\nList Details:\nName: ${targetListName}\nNote: ${description || "No description provided."}\n\nPlease log in to the portal to view the list.\n\nRegards,\nPDE - Prospect Engine Team`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #0b0f19; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Prospect Engine</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Centralized Data Hub</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">New Target List Assignment</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong style="color: #0f172a;">${salesmanName}</strong>,</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">You have been assigned a new target list for outreach by <strong style="color: #0f172a;">${adminName}</strong>.</p>
            
            <!-- Info Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">List Details</p>
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a; font-weight: 600;">${targetListName}</p>
              <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5; white-space: pre-wrap;">${description || "No description provided."}</p>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://pde.gnosysdigital.com/target-lists" style="display: inline-block; padding: 12px 28px; background-color: #034463ff; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">View Target List</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #64748b;">Regards,<br/><strong style="color: #475569; font-size: 14px; display: inline-block; margin-top: 4px;">PDE - Prospect Engine Team </strong></p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;"> Gnosys Digital </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Assignment email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending assignment email:", error);
    return false;
  }
};

const sendOTPEmail = async (userEmail, userName, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: process.env.SMTP_PORT || 2525,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Prospect Engine" <${process.env.SMTP_FROM_EMAIL || "noreply@gnosysdigital.com"}>`,
      to: userEmail,
      subject: `Password Reset OTP`,
      text: `Hello ${userName},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nRegards,\nPDE - Prospect Engine Team`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #0b0f19; padding: 24px; text-align: center; border-bottom: 3px solid #2563eb;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Prospect Engine</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Password Reset</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">Reset Your Password</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong style="color: #0f172a;">${userName}</strong>,</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">We received a request to reset your password. Here is your One-Time Password (OTP):</p>
            
            <!-- OTP Box -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px 32px;">
                <span style="font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 4px;">${otp}</span>
              </div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0 0 24px 0;">This OTP is valid for <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #64748b;">Regards,<br/><strong style="color: #475569; font-size: 14px; display: inline-block; margin-top: 4px;">PDE - Prospect Engine Team </strong></p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;"> Gnosys Digital </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = {
  sendAssignmentEmail,
  sendOTPEmail,
};
