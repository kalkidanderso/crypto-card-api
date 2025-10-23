import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc)
    this.logger.debug(`Email content: ${options.html || options.text}`);
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    this.logger.log(`Email sent successfully to ${options.to}`);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to STRK Crypto Card Platform',
      html: `
        <h1>Welcome ${firstName}!</h1>
        <p>Thank you for registering with STRK Crypto Card Platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Create crypto wallets (BTC, ETH, USDT, USDC, BNB)</li>
          <li>Issue virtual and physical crypto cards</li>
          <li>Track all your transactions</li>
        </ul>
        <p>Get started by logging into your account.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('app.url')}/reset-password?token=${resetToken}`;
    
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your STRK account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }

  async sendTransactionNotification(
    email: string,
    type: string,
    amount: number,
    cryptoType: string,
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `Transaction ${type}: ${amount} ${cryptoType}`,
      html: `
        <h1>Transaction Notification</h1>
        <p>A ${type.toLowerCase()} transaction was processed on your account.</p>
        <p><strong>Amount:</strong> ${amount} ${cryptoType}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>If you didn't authorize this transaction, please contact support immediately.</p>
      `,
    });
  }

  async sendCardIssuedNotification(email: string, cardType: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: `New ${cardType} Card Issued`,
      html: `
        <h1>Card Issued Successfully</h1>
        <p>Your ${cardType.toLowerCase()} crypto card has been issued.</p>
        <p>You can now activate it from your dashboard and start using it for transactions.</p>
      `,
    });
  }
}
