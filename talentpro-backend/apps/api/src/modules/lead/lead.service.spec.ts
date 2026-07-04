import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LeadStatus, DemoBookingScale, LeadSource, DemoBooking } from '@prisma/client';
import { LeadService } from './lead.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';

describe('LeadService', () => {
  let service: LeadService;
  let prisma: PrismaService;
  let mailService: MailService;
  let eventEmitter: EventEmitter2;
  let notificationQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: PrismaService,
          useValue: {
            demoBooking: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            followUp: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendDemoConfirmation: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: getQueueToken('lead-nurture'),
          useValue: {
            add: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LeadService>(LeadService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    notificationQueue = module.get(getQueueToken('lead-nurture'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated demo bookings with followUps', async () => {
      const mockBookings = [
        {
          id: 'b1',
          name: 'Alice',
          company: 'Acme',
          status: LeadStatus.NEW,
          followUps: [],
        },
      ];
      jest.spyOn(prisma.demoBooking, 'findMany').mockResolvedValue(mockBookings as unknown as DemoBooking[]);
      jest.spyOn(prisma.demoBooking, 'count').mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(prisma.demoBooking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          include: { followUps: { orderBy: { createdAt: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.data).toEqual(mockBookings);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status and workspaceId when provided', async () => {
      const mockBookings = [{ id: 'b1', status: LeadStatus.NEW }];
      jest.spyOn(prisma.demoBooking, 'findMany').mockResolvedValue(mockBookings as unknown as DemoBooking[]);
      jest.spyOn(prisma.demoBooking, 'count').mockResolvedValue(1);

      const result = await service.findAll(1, 20, LeadStatus.NEW, 'w1');

      expect(prisma.demoBooking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: LeadStatus.NEW, workspaceId: 'w1' },
        }),
      );
      expect(result.data).toEqual(mockBookings);
    });
  });

  describe('findOne', () => {
    it('should return a demo booking by id', async () => {
      const mockBooking = {
        id: 'b1',
        name: 'Alice',
        company: 'Acme',
        status: LeadStatus.NEW,
        followUps: [],
      };
      jest.spyOn(prisma.demoBooking, 'findFirst').mockResolvedValue(mockBooking as unknown as DemoBooking);

      const result = await service.findOne('b1');

      expect(prisma.demoBooking.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'b1' },
          include: { followUps: { orderBy: { createdAt: 'desc' } } },
        }),
      );
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      jest.spyOn(prisma.demoBooking, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('missing')).rejects.toThrow('Booking record not found');
    });
  });

  describe('create', () => {
    it('should create a booking, send confirmation email and emit event', async () => {
      const dto = {
        name: 'Alice',
        company: 'Acme',
        phone: '13800138000',
        email: 'alice@acme.com',
        products: ['HR Core'],
        scale: '1-50',
        source: 'website',
        workspaceId: 'w1',
      };
      const mockBooking = {
        id: 'b1',
        ...dto,
        scale: DemoBookingScale.SCALE_11_50,
        source: LeadSource.WEBSITE,
      };
      jest.spyOn(prisma.demoBooking, 'create').mockResolvedValue(mockBooking as unknown as DemoBooking);

      const result = await service.create(dto);
      // Allow unawaited async side effects (scheduleNurtureEmails) to flush
      await new Promise((resolve) => setImmediate(resolve));

      expect(prisma.demoBooking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            company: dto.company,
            email: dto.email,
            products: dto.products,
            workspaceId: dto.workspaceId,
          }),
        }),
      );
      expect(mailService.sendDemoConfirmation).toHaveBeenCalledWith(dto.email, {
        name: dto.name,
        company: dto.company,
        products: dto.products,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('lead.created', {
        bookingId: mockBooking.id,
        email: dto.email,
      });
      expect(notificationQueue.add).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockBooking);
    });

    it('should create a booking without email when email is not provided', async () => {
      const dto = {
        name: 'Bob',
        company: 'Inc',
        phone: '13900139000',
        scale: '50-200',
      };
      const mockBooking = {
        id: 'b2',
        ...dto,
        email: null,
        products: [],
        scale: DemoBookingScale.SCALE_51_200,
        source: LeadSource.WEBSITE,
      };
      jest.spyOn(prisma.demoBooking, 'create').mockResolvedValue(mockBooking as unknown as DemoBooking);

      const result = await service.create(dto);

      expect(mailService.sendDemoConfirmation).not.toHaveBeenCalled();
      expect(notificationQueue.add).not.toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateStatus', () => {
    it('should update status when transition is valid', async () => {
      const mockBooking = { id: 'b1', status: LeadStatus.NEW };
      const updatedBooking = { id: 'b1', status: LeadStatus.CONTACTED, assignedTo: 'u1', notes: 'Called' };
      jest.spyOn(prisma.demoBooking, 'findFirst').mockResolvedValue(mockBooking as unknown as DemoBooking);
      jest.spyOn(prisma.demoBooking, 'update').mockResolvedValue(updatedBooking as unknown as DemoBooking);

      const result = await service.updateStatus('b1', LeadStatus.CONTACTED, 'u1', 'Called');

      expect(prisma.demoBooking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'b1' },
          data: { status: LeadStatus.CONTACTED, assignedTo: 'u1', notes: 'Called' },
        }),
      );
      expect(result).toEqual(updatedBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      jest.spyOn(prisma.demoBooking, 'findFirst').mockResolvedValue(null);

      await expect(service.updateStatus('missing', LeadStatus.CONTACTED)).rejects.toThrow(NotFoundException);
      await expect(service.updateStatus('missing', LeadStatus.CONTACTED)).rejects.toThrow('Booking record not found');
    });

    it('should throw BadRequestException when status transition is invalid', async () => {
      const mockBooking = { id: 'b1', status: LeadStatus.WON };
      jest.spyOn(prisma.demoBooking, 'findFirst').mockResolvedValue(mockBooking as unknown as DemoBooking);

      await expect(service.updateStatus('b1', LeadStatus.NEW)).rejects.toThrow(BadRequestException);
      await expect(service.updateStatus('b1', LeadStatus.NEW)).rejects.toThrow('Status cannot transition from WON to NEW');
    });
  });
});
