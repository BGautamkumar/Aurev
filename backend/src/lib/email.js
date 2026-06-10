import nodemailer from 'nodemailer';

// Use a production-ready approach by configuring an SMTP transporter
export const sendResetEmail = async (toEmail, resetToken) => {
  try {
    let transporter;

    // Check if custom SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal Email for zero-config real email testing
      console.log('⚙️ Generating Ethereal test account to send real email... (this takes a second)');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"AUREV Support" <${process.env.SMTP_FROM || 'support@aurev.local'}>`,
      to: toEmail,
      subject: 'AUREV - Protocol: Password Reset Requested',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #F8FAFC; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B;">
          <div style="text-align: center; margin-bottom: 35px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #0EA5E9, #38BDF8); display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #FFFFFF; font-size: 22px; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);">AU</div>
            <h1 style="color: #F8FAFC; margin-top: 24px; font-weight: 700; font-size: 24px; letter-spacing: -0.02em;">AUREV</h1>
          </div>
          
          <div style="background-color: #0F172A; border: 1px solid #1E293B; border-radius: 12px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <h2 style="color: #F8FAFC; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
            
            <p style="color: #94A3B8; line-height: 1.7; font-size: 15px; margin-bottom: 30px;">
              We received a request to reset the password for your AUREV account. If you made this request, please click the button below to establish a new password.
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #0EA5E9; color: #FFFFFF; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 15px; transition: background-color 0.2s; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                Reset Password
              </a>
            </div>

            <p style="color: #64748B; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
              If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. This link will expire in 1 hour.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #475569; font-size: 12px; line-height: 1.5;">
              © ${new Date().getFullYear()} AUREV Systems. All rights reserved.<br/>
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Check if we used Ethereal to send it
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log('\n======================================================');
      console.log('✅ Real email successfully sent via Ethereal!');
      console.log('📬 TO VIEW THE EMAIL, CLICK THIS LINK:');
      console.log(testUrl);
      console.log('======================================================\n');
    } else {
      console.log('Real reset email successfully sent to %s (Message ID: %s)', toEmail, info.messageId);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    throw new Error('Failed to send reset email');
  }
};
