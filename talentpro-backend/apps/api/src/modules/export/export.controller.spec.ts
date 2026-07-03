import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UserContext } from '@/common/types';
import { LeadStatus } from '@prisma/client';

describe('ExportController', () => {
  let controller: ExportController;
  let service: ExportService;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [
        {
          provide: ExportService,
          useValue: {
            exportLeads: jest.fn(),
            exportUsers: jest.fn(),
            exportAnalytics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
    service = module.get<ExportService>(ExportService);
    res = { setHeader: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/export/leads', () => {
    it('should set headers and export leads with workspace filter', async () => {
      const user: UserContext = { id: 'u1', workspaceId: 'ws1', role: { name: 'ADMIN' } };
      jest.spyOn(service, 'exportLeads').mockResolvedValue(undefined);

      await controller.exportLeads(res, user, LeadStatus.NEW, 'csv');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('leads-'),
      );
      expect(service.exportLeads).toHaveBeenCalledWith(
        { status: LeadStatus.NEW, workspaceId: 'ws1' },
        res,
      );
    });

    it('should ignore workspace filter for SUPER_ADMIN', async () => {
      const user: UserContext = { id: 'u1', workspaceId: 'ws1', role: { name: 'SUPER_ADMIN' } };
      jest.spyOn(service, 'exportLeads').mockResolvedValue(undefined);

      await controller.exportLeads(res, user);

      expect(service.exportLeads).toHaveBeenCalledWith({ workspaceId: undefined }, res);
    });
  });

  describe('GET /admin/export/users', () => {
    it('should set headers and export users', async () => {
      const user: UserContext = { id: 'u1', workspaceId: 'ws1', role: { name: 'ADMIN' } };
      jest.spyOn(service, 'exportUsers').mockResolvedValue(undefined);

      await controller.exportUsers(res, user, 'xlsx');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('users-'),
      );
      expect(service.exportUsers).toHaveBeenCalledWith({ workspaceId: 'ws1' }, res);
    });
  });

  describe('GET /admin/export/analytics', () => {
    it('should set headers and export analytics', async () => {
      const user: UserContext = { id: 'u1', workspaceId: 'ws1', role: { name: 'ADMIN' } };
      jest.spyOn(service, 'exportAnalytics').mockResolvedValue(undefined);

      await controller.exportAnalytics(res, user, '7');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('analytics-'),
      );
      expect(service.exportAnalytics).toHaveBeenCalledWith(7, 'ws1', res);
    });

    it('should default days to 30', async () => {
      const user: UserContext = { id: 'u1', workspaceId: 'ws1', role: { name: 'ADMIN' } };
      jest.spyOn(service, 'exportAnalytics').mockResolvedValue(undefined);

      await controller.exportAnalytics(res, user);

      expect(service.exportAnalytics).toHaveBeenCalledWith(30, 'ws1', res);
    });
  });
});
