import { Test, TestingModule } from '@nestjs/testing';
import { AppStatus } from '@prisma/client';
import { MarketplaceController, MarketplaceAdminController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;
  let adminController: MarketplaceAdminController;
  let service: MarketplaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController, MarketplaceAdminController],
      providers: [
        {
          provide: MarketplaceService,
          useValue: {
            findAllApps: jest.fn(),
            findFeaturedApps: jest.fn(),
            findAppBySlug: jest.fn(),
            findCategories: jest.fn(),
            findReviews: jest.fn(),
            createReview: jest.fn(),
            installApp: jest.fn(),
            getWorkspaceApps: jest.fn(),
            getWorkspaceSubscriptions: jest.fn(),
            findAllAppsForAdmin: jest.fn(),
            updateAppStatus: jest.fn(),
            featureApp: jest.fn(),
            findAllVendors: jest.fn(),
            createVendor: jest.fn(),
            updateVendor: jest.fn(),
            deleteVendor: jest.fn(),
            findAllCategoriesForAdmin: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketplaceController>(MarketplaceController);
    adminController = module.get<MarketplaceAdminController>(MarketplaceAdminController);
    service = module.get<MarketplaceService>(MarketplaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(adminController).toBeDefined();
  });

  describe('GET /marketplace/apps', () => {
    it('should return paginated apps with filters', async () => {
      const expected = {
        data: [{ id: 'a1', name: 'Test App' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findAllApps').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAllApps']>);

      const result = await controller.findAllApps('hr', 'FREE', 'AI', 'newest', '1', '20');

      expect(service.findAllApps).toHaveBeenCalledWith({
        category: 'hr',
        pricingModel: 'FREE',
        search: 'AI',
        sort: 'newest',
        page: 1,
        pageSize: 20,
      });
      expect(result).toEqual(expected);
    });

    it('should use default pagination when params are missing', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(service, 'findAllApps').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAllApps']>);

      await controller.findAllApps();

      expect(service.findAllApps).toHaveBeenCalledWith({
        category: undefined,
        pricingModel: undefined,
        search: undefined,
        sort: undefined,
        page: 1,
        pageSize: 20,
      });
    });
  });

  describe('GET /marketplace/apps/featured', () => {
    it('should return featured apps', async () => {
      const expected = [{ id: 'a1', name: 'Featured App' }];
      jest.spyOn(service, 'findFeaturedApps').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findFeaturedApps']>);

      const result = await controller.findFeaturedApps();

      expect(service.findFeaturedApps).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('GET /marketplace/apps/:slug', () => {
    it('should return app by slug', async () => {
      const expected = { id: 'a1', name: 'Test App', slug: 'test-app' };
      jest.spyOn(service, 'findAppBySlug').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAppBySlug']>);

      const result = await controller.findAppBySlug('test-app');

      expect(service.findAppBySlug).toHaveBeenCalledWith('test-app');
      expect(result).toEqual(expected);
    });
  });

  describe('GET /marketplace/categories', () => {
    it('should return categories', async () => {
      const expected = [{ id: 'c1', name: 'HR' }];
      jest.spyOn(service, 'findCategories').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findCategories']>);

      const result = await controller.findCategories();

      expect(service.findCategories).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('GET /marketplace/apps/:slug/reviews', () => {
    it('should return paginated reviews', async () => {
      const expected = {
        data: [{ id: 'r1', rating: 5 }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findReviews').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findReviews']>);

      const result = await controller.findReviews('test-app', '1', '20');

      expect(service.findReviews).toHaveBeenCalledWith('test-app', 1, 20);
      expect(result).toEqual(expected);
    });

    it('should fallback to default pagination when query params are invalid', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(service, 'findReviews').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findReviews']>);

      await controller.findReviews('test-app', '0', 'invalid');

      expect(service.findReviews).toHaveBeenCalledWith('test-app', 1, 20);
    });
  });

  describe('POST /marketplace/apps/:slug/reviews', () => {
    it('should create a review', async () => {
      const dto: CreateReviewDto = { rating: 5, content: 'Great app!' };
      const expected = { id: 'r1', rating: 5, content: 'Great app!' };
      jest.spyOn(service, 'createReview').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['createReview']>);

      const result = await controller.createReview('test-app', 'user-1', dto);

      expect(service.createReview).toHaveBeenCalledWith('test-app', 'user-1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /marketplace/apps/:slug/install', () => {
    it('should install app for workspace', async () => {
      const expected = { id: 's1', status: 'TRIAL' };
      jest.spyOn(service, 'installApp').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['installApp']>);

      const result = await controller.installApp('test-app', { id: 'user-1', workspaceId: 'ws-1' });

      expect(service.installApp).toHaveBeenCalledWith('test-app', 'ws-1', 'user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('GET /marketplace/workspace/apps', () => {
    it('should return workspace installed apps', async () => {
      const expected = [{ id: 's1', app: { id: 'a1', name: 'Test App' } }];
      jest.spyOn(service, 'getWorkspaceApps').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['getWorkspaceApps']>);

      const result = await controller.getWorkspaceApps({ workspaceId: 'ws-1' });

      expect(service.getWorkspaceApps).toHaveBeenCalledWith('ws-1');
      expect(result).toEqual(expected);
    });
  });

  describe('GET /marketplace/workspace/subscriptions', () => {
    it('should return workspace subscriptions', async () => {
      const expected = [{ id: 's1', app: { id: 'a1' } }];
      jest.spyOn(service, 'getWorkspaceSubscriptions').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['getWorkspaceSubscriptions']>);

      const result = await controller.getWorkspaceSubscriptions({ workspaceId: 'ws-1' });

      expect(service.getWorkspaceSubscriptions).toHaveBeenCalledWith('ws-1');
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: GET /admin/marketplace/apps', () => {
    it('should return paginated apps for admin', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const expected = {
        data: [{ id: 'a1', name: 'Test App' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findAllAppsForAdmin').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAllAppsForAdmin']>);

      const result = await adminController.findAllAppsForAdmin(pagination, AppStatus.PUBLISHED, 'hr');

      expect(service.findAllAppsForAdmin).toHaveBeenCalledWith({ page: 1, pageSize: 20, status: AppStatus.PUBLISHED, category: 'hr' });
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: PATCH /admin/marketplace/apps/:id/status', () => {
    it('should update app status', async () => {
      const expected = { id: 'a1', status: AppStatus.PUBLISHED };
      jest.spyOn(service, 'updateAppStatus').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['updateAppStatus']>);

      const result = await adminController.updateAppStatus('a1', AppStatus.PUBLISHED);

      expect(service.updateAppStatus).toHaveBeenCalledWith('a1', AppStatus.PUBLISHED);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: POST /admin/marketplace/apps/:id/feature', () => {
    it('should feature app with sort order', async () => {
      const expected = { id: 'a1', featured: true, featuredSortOrder: 1 };
      jest.spyOn(service, 'featureApp').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['featureApp']>);

      const result = await adminController.featureApp('a1', true, 1);

      expect(service.featureApp).toHaveBeenCalledWith('a1', true, 1);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: GET /admin/marketplace/vendors', () => {
    it('should return paginated vendors', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const expected = {
        data: [{ id: 'v1', name: 'Vendor' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findAllVendors').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAllVendors']>);

      const result = await adminController.findAllVendors(pagination);

      expect(service.findAllVendors).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: POST /admin/marketplace/vendors', () => {
    it('should create vendor', async () => {
      const dto: CreateVendorDto = {
        name: 'Vendor',
        slug: 'vendor',
        contactEmail: 'vendor@example.com',
      };
      const expected = { id: 'v1', ...dto };
      jest.spyOn(service, 'createVendor').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['createVendor']>);

      const result = await adminController.createVendor(dto);

      expect(service.createVendor).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: PATCH /admin/marketplace/vendors/:id', () => {
    it('should update vendor', async () => {
      const dto: UpdateVendorDto = { name: 'Updated Vendor' };
      const expected = { id: 'v1', name: 'Updated Vendor' };
      jest.spyOn(service, 'updateVendor').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['updateVendor']>);

      const result = await adminController.updateVendor('v1', dto);

      expect(service.updateVendor).toHaveBeenCalledWith('v1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: DELETE /admin/marketplace/vendors/:id', () => {
    it('should delete vendor', async () => {
      const expected = { id: 'v1' };
      jest.spyOn(service, 'deleteVendor').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['deleteVendor']>);

      const result = await adminController.deleteVendor('v1');

      expect(service.deleteVendor).toHaveBeenCalledWith('v1');
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: GET /admin/marketplace/categories', () => {
    it('should return paginated categories', async () => {
      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const expected = {
        data: [{ id: 'c1', name: 'HR' }],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      };
      jest.spyOn(service, 'findAllCategoriesForAdmin').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['findAllCategoriesForAdmin']>);

      const result = await adminController.findAllCategoriesForAdmin(pagination);

      expect(service.findAllCategoriesForAdmin).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: POST /admin/marketplace/categories', () => {
    it('should create category', async () => {
      const dto: CreateCategoryDto = {
        name: 'HR',
        slug: 'hr',
        sortOrder: 1,
      };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(service, 'createCategory').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['createCategory']>);

      const result = await adminController.createCategory(dto);

      expect(service.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: PATCH /admin/marketplace/categories/:id', () => {
    it('should update category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated HR' };
      const expected = { id: 'c1', name: 'Updated HR' };
      jest.spyOn(service, 'updateCategory').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['updateCategory']>);

      const result = await adminController.updateCategory('c1', dto);

      expect(service.updateCategory).toHaveBeenCalledWith('c1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('Admin: DELETE /admin/marketplace/categories/:id', () => {
    it('should delete category', async () => {
      const expected = { id: 'c1' };
      jest.spyOn(service, 'deleteCategory').mockResolvedValue(expected as unknown as ReturnType<MarketplaceService['deleteCategory']>);

      const result = await adminController.deleteCategory('c1');

      expect(service.deleteCategory).toHaveBeenCalledWith('c1');
      expect(result).toEqual(expected);
    });
  });
});
