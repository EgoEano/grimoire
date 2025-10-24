import { NodeMailerService } from "../services/connection/nodeMailerService.js";
import { SendResult } from "../services/connection/nodeMailerService.js";

export interface SendEmailParams {
    from: string;
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer | string;
        contentType?: string;
    }>;
}

export interface SendEmailResponse {
    success: boolean;
    data?: SendResult;
    error?: string;
}

/**
 * Универсальная функция для отправки писем.
 * Создаёт экземпляр NodeMailerService, используя ENV настройки.
 */
export async function sendEmail({
    from,
    to,
    subject,
    text,
    html,
    attachments,
}: SendEmailParams): Promise<SendEmailResponse> {
    const host = process.env.SMTP_HOST || "";
    const login = process.env.SMTP_LOGIN || "";
    const password = process.env.SMTP_PASS || "";
    const port = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_ISSECURE === "true";
    const isTlsRejectUnauth = process.env.SMTP_ISTLSREJECTUNAUTH === "true";
    const isDev = process.env.SMTP_ISDEV === "true";

    try {
        const mailer = new NodeMailerService({
        host,
        login,
        password,
        port,
        isSecure,
        isTlsRejectUnauth,
        isDev,
        });

        const result = await mailer.sendEmail({
        from,
        to,
        subject,
        text,
        html,
        attachments,
        });

        const success =
            Array.isArray((result as any)?.accepted) &&
            (result as any).accepted.length > 0 &&
            (!(result as any).rejected || (result as any).rejected.length === 0);

        return { success, data: result };
    } catch (e: unknown) {
        const message =
        e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
        return { success: false, error: message };
    }
}
