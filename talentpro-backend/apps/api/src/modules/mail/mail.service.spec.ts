import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from '@prisma/client';
import { MailService, MailPayload } from './mail.service';
import { PrismaService } from '@/common/prisma/prisma.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('MailService', () => {
  let service: MailService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, unknown> = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: 587,
                SMTP_USER: 'user@example.com',
                SMTP_PASS: 'secret',
                SMTP_FROM: 'TalentPro <noreply@talentpro.cn>',
              };
              return map[key] || null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            emailTemplate: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send email with template when templateKey provided', async () => {
      const payload: MailPayload = {
        to: 'user@example.com',
        subject: 'Test',
        templateKey: 'welcome',
        variables: { name: 'Alice' },
      };
      const mockTemplate = {
        id: 'tmpl1',
        key: 'welcome',
        subject: 'Welcome {{name}}',
        html: '<p>Hello {{name}}</p>',
        body: '<p>Hello {{name}}</p>',
      };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(mockTemplate as unknown as EmailTemplate);

      await service.send(payload);

      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({ where: { key: 'welcome' } });
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: { user: 'user@example.com', pass: 'secret' },
        }),
      );
      const transporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: payload.to,
          subject: 'Welcome Alice',
          html: '<p>Hello Alice</p>',
        }),
      );
    });

    it('should send email directly when no templateKey provided', async () => {
      const payload: MailPayload = {
        to: 'user@example.com',
        subject: 'Direct Mail',
        text: 'Plain text',
        html: '<p>HTML</p>',
      };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(null);

      await service.send(payload);

      expect(prisma.emailTemplate.findUnique).not.toHaveBeenCalled();
      const transporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
      );
    });

    it('should log mock message when SMTP is not configured', async () => {
      // Recreate service with no SMTP config
      const noSmtpConfig = { get: jest.fn(() => null) } as unknown as ConfigService;
      const noSmtpService = new MailService(noSmtpConfig, prisma);
      const loggerLog = jest.spyOn((noSmtpService as unknown as { logger: { log: jest.Mock } }).logger, 'log').mockImplementation(() => {});

      const payload: MailPayload = {
        to: 'user@example.com',
        subject: 'Mock Mail',
      };

      await noSmtpService.send(payload);

      expect(loggerLog).toHaveBeenCalledWith(expect.stringContaining('[MAIL MOCK]'));
    });

    it('should throw error when transporter.sendMail fails', async () => {
      const payload: MailPayload = {
        to: 'user@example.com',
        subject: 'Fail',
      };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(null);

      const transporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
      transporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(service.send(payload)).rejects.toThrow('SMTP error');
    });
  });

  describe('sendDemoConfirmation', () => {
    it('should call send with demo_confirmation template and variables', async () => {
      const sendSpy = jest.spyOn(service, 'send').mockResolvedValue(undefined);

      await service.sendDemoConfirmation('alice@example.com', {
        name: 'Alice',
        company: 'Acme',
        products: ['HR Core', 'Payroll'],
      });

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'alice@example.com',
          templateKey: 'demo_confirmation',
          subject: 'TalentPro Demo 预约确认',
          variables: expect.objectContaining({
            name: 'Alice',
            company: 'Acme',
            products: 'HR Core、Payroll',
          }),
        }),
      );
    });
  });
});
