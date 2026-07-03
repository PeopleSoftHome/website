import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { LeadStatus } from '@prisma/client';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { UserContext } from '@/common/types';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { AddFollowUpDto } from './dto/add-follow-up.dto';

describe('LeadController', () => {
  let controller: LeadController;
  let service: LeadService;

  const adminUser: UserContext = {
    id: 'u1',
    workspaceId: 'w1',
    role: { name: 'ADMIN' },
  };
  const superAdminUser: UserContext = {
    id: 'u2',
    workspaceId: 'w1',
    role: { name: 'SUPER_ADMIN' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        {
          provide: LeadService,
          useValue: {
            findAll: jest.fn(),
            getStats: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
            addFollowUp: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RecaptchaGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<LeadController>(LeadController);
    service = module.get<LeadService>(LeadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /demo-bookings', () => {
    it('should list leads with workspace filter for admin', async () => {
      const expected = {
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const result = await controller.findAll(
        adminUser,
        pagination,
        LeadStatus.NEW,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        1,
        20,
        LeadStatus.NEW,
        'w1',
      );
      expect(result).toEqual(expected);
    });

    it('should omit workspace filter for super admin', async () => {
      const expected = {
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const result = await controller.findAll(superAdminUser, pagination);

      expect(service.findAll).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        undefined,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('GET /demo-bookings/stats', () => {
    it('should return lead stats', async () => {
      const expected = { total: 10, todayCount: 2, byStatus: [] };
      jest.spyOn(service, 'getStats').mockResolvedValue(expected as any);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('GET /demo-bookings/:id', () => {
    it('should return lead detail for admin with workspace filter', async () => {
      const expected = { id: 'b1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne('b1', adminUser);

      expect(service.findOne).toHaveBeenCalledWith('b1', 'w1');
      expect(result).toEqual(expected);
    });

    it('should omit workspace filter for super admin', async () => {
      const expected = { id: 'b1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne('b1', superAdminUser);

      expect(service.findOne).toHaveBeenCalledWith('b1', undefined);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /demo-bookings', () => {
    it('should create lead with ip and user agent', async () => {
      const dto: CreateLeadDto = {
        name: 'Alice',
        company: 'Acme',
        phone: '13800138000',
        scale: '1-50',
        source: 'website',
      };
      const expected = { id: 'b1', ...dto };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      } as unknown as Request;

      const result = await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...dto,
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('PATCH /demo-bookings/:id', () => {
    it('should update lead status for admin with workspace filter', async () => {
      const dto: UpdateLeadStatusDto = {
        status: LeadStatus.CONTACTED,
        assignedTo: 'u1',
        notes: 'Called',
      };
      const expected = { id: 'b1', ...dto };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(expected as any);

      const result = await controller.updateStatus('b1', adminUser, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(
        'b1',
        LeadStatus.CONTACTED,
        'u1',
        'Called',
        'w1',
      );
      expect(result).toEqual(expected);
    });

    it('should omit workspace filter for super admin', async () => {
      const dto: UpdateLeadStatusDto = { status: LeadStatus.WON };
      const expected = { id: 'b1', ...dto };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(expected as any);

      const result = await controller.updateStatus('b1', superAdminUser, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(
        'b1',
        LeadStatus.WON,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('POST /demo-bookings/:id/follow-ups', () => {
    it('should add follow-up for admin with workspace filter', async () => {
      const dto: AddFollowUpDto = {
        type: 'call',
        content: 'left message',
        createdBy: 'u1',
      };
      const expected = { id: 'f1', ...dto };
      jest.spyOn(service, 'addFollowUp').mockResolvedValue(expected as any);

      const result = await controller.addFollowUp('b1', adminUser, dto);

      expect(service.addFollowUp).toHaveBeenCalledWith('b1', dto, 'w1');
      expect(result).toEqual(expected);
    });

    it('should omit workspace filter for super admin', async () => {
      const dto: AddFollowUpDto = {
        type: 'email',
        content: 'sent quote',
        createdBy: 'u2',
      };
      const expected = { id: 'f1', ...dto };
      jest.spyOn(service, 'addFollowUp').mockResolvedValue(expected as any);

      const result = await controller.addFollowUp('b1', superAdminUser, dto);

      expect(service.addFollowUp).toHaveBeenCalledWith('b1', dto, undefined);
      expect(result).toEqual(expected);
    });
  });
});
