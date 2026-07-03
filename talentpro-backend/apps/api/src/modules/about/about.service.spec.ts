import { Test, TestingModule } from '@nestjs/testing';
import { AboutService } from './about.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AboutService', () => {
  let service: AboutService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AboutService,
        {
          provide: PrismaService,
          useValue: {
            teamMember: {
              findMany: jest.fn(),
            },
            partner: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AboutService>(AboutService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findTeam', () => {
    it('should return all team members when no filters provided', async () => {
      const mockTeam = [
        { id: 't1', name: 'Alice', role: 'CEO', department: 'leadership', featured: true, sortOrder: 1 },
        { id: 't2', name: 'Bob', role: 'Engineer', department: 'engineering', featured: false, sortOrder: 2 },
      ];
      jest.spyOn(prisma.teamMember, 'findMany').mockResolvedValue(mockTeam as unknown as import('@prisma/client').TeamMember[]);

      const result = await service.findTeam();

      expect(prisma.teamMember.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      });
      expect(result).toEqual(mockTeam);
    });

    it('should filter by department and featured', async () => {
      const mockTeam = [{ id: 't1', name: 'Alice', role: 'CEO', department: 'leadership', featured: true, sortOrder: 1 }];
      jest.spyOn(prisma.teamMember, 'findMany').mockResolvedValue(mockTeam as unknown as import('@prisma/client').TeamMember[]);

      const result = await service.findTeam('leadership', true);

      expect(prisma.teamMember.findMany).toHaveBeenCalledWith({
        where: { department: 'leadership', featured: true },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('findPartners', () => {
    it('should return all partners when no type provided', async () => {
      const mockPartners = [
        { id: 'p1', name: 'Partner A', type: 'technology', featured: true, sortOrder: 1 },
        { id: 'p2', name: 'Partner B', type: 'consulting', featured: false, sortOrder: 2 },
      ];
      jest.spyOn(prisma.partner, 'findMany').mockResolvedValue(mockPartners as unknown as import('@prisma/client').Partner[]);

      const result = await service.findPartners();

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      });
      expect(result).toEqual(mockPartners);
    });

    it('should filter partners by type', async () => {
      const mockPartners = [{ id: 'p1', name: 'Partner A', type: 'technology', featured: true, sortOrder: 1 }];
      jest.spyOn(prisma.partner, 'findMany').mockResolvedValue(mockPartners as unknown as import('@prisma/client').Partner[]);

      const result = await service.findPartners('technology');

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: { type: 'technology' },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      });
      expect(result).toEqual(mockPartners);
    });
  });
});
