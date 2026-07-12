import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExportService } from './export.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

jest.mock('exceljs', () => {
  const addRow = jest.fn().mockReturnValue({});
  const worksheetCommit = jest.fn().mockResolvedValue(undefined);
  const addWorksheet = jest.fn().mockReturnValue({ addRow, commit: worksheetCommit });
  const workbookCommit = jest.fn().mockResolvedValue(undefined);
  const WorkbookWriter = jest.fn().mockImplementation(() => ({
    addWorksheet,
    commit: workbookCommit,
  }));
  return { stream: { xlsx: { WorkbookWriter } } };
});

describe('ExportService', () => {
  let service: ExportService;
  let prisma: PrismaService;
  let excelMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: PrismaService,
          useValue: {
            demoBooking: { count: jest.fn(), findMany: jest.fn() },
            user: { count: jest.fn(), findMany: jest.fn() },
            pageView: { findMany: jest.fn() },
            eventTrack: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    prisma = module.get<PrismaService>(PrismaService);
    excelMock = jest.requireMock('exceljs');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportLeads', () => {
    const res = {} as any;

    it('should export leads as xlsx', async () => {
      const leads = [
        {
          id: 'l1',
          name: 'Alice',
          company: 'Acme',
          phone: '13800138000',
          email: 'alice@example.com',
          products: ['ATS'],
          scale: '100-499',
          status: LeadStatus.NEW,
          source: 'web',
          followUps: [],
          createdAt: new Date('2024-01-01'),
        },
      ];
      jest.spyOn(prisma.demoBooking, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.demoBooking, 'findMany').mockResolvedValueOnce(leads as any).mockResolvedValueOnce([] as any);

      await service.exportLeads({ status: LeadStatus.NEW }, res);

      expect(prisma.demoBooking.count).toHaveBeenCalledWith({ where: { status: LeadStatus.NEW } });
      expect(prisma.demoBooking.findMany).toHaveBeenCalled();
      expect(excelMock.stream.xlsx.WorkbookWriter).toHaveBeenCalled();
    });

    it('should throw BadRequestException when total exceeds max rows', async () => {
      jest.spyOn(prisma.demoBooking, 'count').mockResolvedValue(50001);

      await expect(service.exportLeads({}, res)).rejects.toThrow(BadRequestException);
      expect(prisma.demoBooking.findMany).not.toHaveBeenCalled();
    });
  });

  describe('exportUsers', () => {
    const res = {} as any;

    it('should export users as xlsx', async () => {
      const users = [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          phone: '13800138000',
          status: 'ACTIVE',
          workspaceRole: 'ADMIN',
          createdAt: new Date('2024-01-01'),
          role: { name: 'ADMIN' },
          workspace: { name: 'WS' },
        },
      ];
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValueOnce(users as any).mockResolvedValueOnce([] as any);

      await service.exportUsers({ workspaceId: 'ws1' }, res);

      expect(prisma.user.count).toHaveBeenCalledWith({ where: { workspaceId: 'ws1' } });
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(excelMock.stream.xlsx.WorkbookWriter).toHaveBeenCalled();
    });

    it('should throw BadRequestException when total exceeds max rows', async () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValue(50001);

      await expect(service.exportUsers({}, res)).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportAnalytics', () => {
    const res = {} as any;

    it('should export analytics with workspace filter', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([{ id: 'u1' }] as any);
      jest.spyOn(prisma.pageView, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.eventTrack, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.demoBooking, 'findMany').mockResolvedValue([] as any);

      await service.exportAnalytics(7, 'ws1', res);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws1' },
        select: { id: true },
      });
      expect(prisma.pageView.findMany).toHaveBeenCalled();
      expect(prisma.eventTrack.findMany).toHaveBeenCalled();
      expect(prisma.demoBooking.findMany).toHaveBeenCalled();
      expect(excelMock.stream.xlsx.WorkbookWriter).toHaveBeenCalled();
    });

    it('should export analytics without workspace filter', async () => {
      jest.spyOn(prisma.pageView, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.eventTrack, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.demoBooking, 'findMany').mockResolvedValue([] as any);

      await service.exportAnalytics(30, undefined, res);

      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(prisma.pageView.findMany).toHaveBeenCalled();
    });
  });
});
