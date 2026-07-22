import nodemailer, { Transporter } from 'nodemailer';

export class EmailService {
  private static transporter: Transporter | null = null;

  private static isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
  }

  private static getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    if (!this.isConfigured()) {
      throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    return this.transporter;
  }

  private static getFromAddress(): string {
    return process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@openwork.com';
  }

  private static getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  /**
   * Send email. In development without SMTP, logs the payload instead of failing.
   */
  static async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('[EmailService] SMTP not configured — logging email instead of sending:');
      console.warn(`  To: ${options.to}`);
      console.warn(`  Subject: ${options.subject}`);
      console.warn(`  Body: ${options.text || options.html}`);
      return;
    }

    await this.getTransporter().sendMail({
      from: this.getFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
  }

  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.getFrontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your OpenWork email',
      text: `Verify your email by visiting: ${verifyUrl}`,
      html: `
        <h2>Welcome to OpenWork</h2>
        <p>Please verify your email address to get started.</p>
        <p><a href="${verifyUrl}">Verify email</a></p>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      `
    });
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

    await this.sendMail({
      to: email,
      subject: 'Reset your OpenWork password',
      text: `Reset your password by visiting: ${resetUrl}`,
      html: `
        <h2>Password reset</h2>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
      `
    });
  }
}
