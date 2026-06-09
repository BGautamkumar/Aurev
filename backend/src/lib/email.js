import nodemailer from 'nodemailer';

// Use a production-ready approach by configuring an SMTP transporter
export const sendResetEmail = async (toEmail, resetToken) => {
  try {
    // These should be set in .env in a real production environment
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-mailtrap-user',
        pass: process.env.SMTP_PASS || 'your-mailtrap-pass',
      },
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"AUREV Support" <${process.env.SMTP_FROM || 'support@aurev.local'}>`,
      to: toEmail,
      subject: 'AUREV - Protocol: Password Reset Requested',
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; background-color: #09090B; color: #FAFAFA; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #27272A;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #F5C518, #F5C518); display: inline-flex; align-items: center; justify-content: center; font-weight: 900; color: #09090B; font-size: 24px;">AU</div>
            <h1 style="color: #FAFAFA; margin-top: 20px; font-weight: 800; letter-spacing: -0.05em;">AUREV <span style="color: #F5C518;">SYSTEMS</span></h1>
          </div>
          
          <div style="background-color: #1A1A1F; border: 1px solid #27272A; border-radius: 12px; padding: 30px;">
            <p style="color: #A1A1AA; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">Automated Security Notice</p>
            
            <h2 style="color: #FAFAFA; font-size: 18px; margin-bottom: 15px;">Reset Protocol Initiated</h2>
            
            <p style="color: #D4D4D8; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
              A request has been logged to reset the access credentials for your sovereign node on the AUREV network.
              If you did not initiate this protocol, you can safely ignore this transmission. Your current credentials remain secure.
            </p>

            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #F5C518; color: #09090B; text-decoration: none; font-weight: 600; padding: 12px 30px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; transition: background-color 0.2s;">
                Authorize Reset
              </a>
            </div>

            <p style="color: #A1A1AA; font-size: 13px; line-height: 1.5;">
              This frequency link will destabilize and expire in exactly 60 minutes for security purposes.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #27272A;">
            <p style="color: #52525B; font-size: 12px;">
              Transmitted via AUREV Cryptographic Networks.<br/>
              Do not reply directly to this automated frequency.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};
