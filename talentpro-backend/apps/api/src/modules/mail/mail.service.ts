import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface MailPayload {
  to: string;
  subject: string;
  templateKey?: string;
  variables?: Record<string, any>;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT') || 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP not configured. Emails will be logged but not sent.');
    }
  }

  async send(payload: MailPayload): Promise<void> {
    let html = payload.html;
    let subject = payload.subject;

    // 如果指定了模板 key，从数据库读取并渲染
    if (payload.templateKey) {
      const template = await this.prisma.emailTemplate.findUnique({
        where: { key: payload.templateKey },
      });
      if (template) {
        subject = Handlebars.compile(template.subject)(payload.variables || {});
        html = Handlebars.compile(template.html || template.body)(payload.variables || {});
      }
    }

    const from = this.config.get<string>('SMTP_FROM') || 'TalentPro <noreply@talentpro.cn>';

    if (!this.transporter) {
      this.logger.log(`[MAIL MOCK] To: ${payload.to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: payload.to,
        subject,
        text: payload.text,
        html,
      });
      this.logger.log(`Email sent to ${payload.to}: ${subject}`);
    } catch (err: any) {
      this.logger.error(`Failed to send email: ${err.message}`);
      throw err;
    }
  }

  async sendDemoConfirmation(to: string, data: { name: string; company: string; products: string[] }) {
    await this.send({
      to,
      templateKey: 'demo_confirmation',
      subject: 'TalentPro Demo 预约确认',
      variables: {
        name: data.name,
        company: data.company,
        products: data.products.join('、'),
        date: new Date().toLocaleDateString('zh-CN'),
      },
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2937;">
  <h2 style="color:#1B5FEB;margin-bottom:8px;">Hi ${data.name}，预约已收到</h2>
  <p>感谢您预约 <strong>TalentPro</strong> 产品演示。</p>
  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
    <p style="margin:4px 0;"><strong>公司：</strong>${data.company}</p>
    <p style="margin:4px 0;"><strong>关注产品：</strong>${data.products.join('、')}</p>
    <p style="margin:4px 0;"><strong>预约时间：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
  </div>
  <p>我们的售前顾问将在 <strong>1 个工作日内</strong>与您联系，安排具体演示时间。</p>
  <p style="margin-top:24px;font-size:13px;color:#6b7280;">如有疑问，请拨打售前热线：400-888-8888</p>
</div>`,
    });
  }
}
