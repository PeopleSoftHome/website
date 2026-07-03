import { Test, TestingModule } from '@nestjs/testing';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';

describe('AboutController', () => {
  let controller: AboutController;
  let aboutService: AboutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AboutController],
      providers: [
        {
          provide: AboutService,
          useValue: {
            findTeam: jest.fn(),
            findPartners: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AboutController>(AboutController);
    aboutService = module.get<AboutService>(AboutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /about/team', () => {
    it('should call aboutService.findTeam with parsed params', async () => {
      const mockTeam = [{ id: 't1', name: 'Alice' }];
      jest.spyOn(aboutService, 'findTeam').mockResolvedValue(mockTeam as unknown as import('@prisma/client').TeamMember[]);

      const result = await controller.findTeam('leadership', 'true');

      expect(aboutService.findTeam).toHaveBeenCalledWith('leadership', true);
      expect(result).toEqual(mockTeam);
    });

    it('should pass undefined featured when query omitted', async () => {
      jest.spyOn(aboutService, 'findTeam').mockResolvedValue([] as unknown as import('@prisma/client').TeamMember[]);

      await controller.findTeam();

      expect(aboutService.findTeam).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should parse featured=false correctly', async () => {
      jest.spyOn(aboutService, 'findTeam').mockResolvedValue([] as unknown as import('@prisma/client').TeamMember[]);

      await controller.findTeam(undefined, 'false');

      expect(aboutService.findTeam).toHaveBeenCalledWith(undefined, false);
    });
  });

  describe('GET /about/partners', () => {
    it('should call aboutService.findPartners with type', async () => {
      const mockPartners = [{ id: 'p1', name: 'Partner A' }];
      jest.spyOn(aboutService, 'findPartners').mockResolvedValue(mockPartners as unknown as import('@prisma/client').Partner[]);

      const result = await controller.findPartners('technology');

      expect(aboutService.findPartners).toHaveBeenCalledWith('technology');
      expect(result).toEqual(mockPartners);
    });
  });
});
