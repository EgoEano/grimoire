import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface MailerConfig {
  host: string;
  port: number;
  login: string;
  password: string;
  isSecure?: boolean;
  isTlsRejectUnauth?: boolean;
  isDev?: boolean;
}

export interface EmailOptions {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
  replyTo?: string;
}

export interface SendResult {
  messageId: string;
  response: string;
}

export class NodeMailerService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private config: MailerConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.isSecure ?? false,
      auth: {
        user: config.login,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: config.isTlsRejectUnauth ?? true,
      },
      logger: config.isDev,
      debug: config.isDev,
    });
  }

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    const { from, to, subject, text, html, attachments, cc, bcc, replyTo } = options;

    if (!from) throw new Error("Sender (from) is required.");
    if (!to) throw new Error("Recipient (to) is required.");
    if (!subject) throw new Error("Subject is required.");
    if (!text && !html) throw new Error("Email body (text or html) is required.");

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments,
        replyTo,
      });

      return { messageId: info.messageId, response: info.response };
    } catch (error: any) {
      console.error("Email sending failed:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
