import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRole = {
    id: 'r1',
    name: 'ADMIN',
    description: '管理员',
    permissions: [{ id: 'p1', resource: 'user', action: 'read' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /roles', () => {
    it('should return all roles', async () => {
      const expected = [mockRole];
      jest.spyOn(roleService, 'findAll').mockResolvedValue(expected as never);

      const result = await controller.findAll();

      expect(roleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return role by id', async () => {
      jest.spyOn(roleService, 'findOne').mockResolvedValue(mockRole as never);

      const result = await controller.findOne('r1');

      expect(roleService.findOne).toHaveBeenCalledWith('r1');
      expect(result).toEqual(mockRole);
    });
  });

  describe('POST /roles', () => {
    it('should create role', async () => {
      const dto: CreateRoleDto = { name: 'EDITOR', description: '编辑', permissionIds: ['p1'] };
      const expected = { id: 'r2', ...dto };
      jest.spyOn(roleService, 'create').mockResolvedValue(expected as never);

      const result = await controller.create(dto);

      expect(roleService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update role', async () => {
      const dto: UpdateRoleDto = { name: 'SUPER_ADMIN', permissionIds: ['p2'] };
      const expected = { id: 'r1', ...dto };
      jest.spyOn(roleService, 'update').mockResolvedValue(expected as never);

      const result = await controller.update('r1', dto);

      expect(roleService.update).toHaveBeenCalledWith('r1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should remove role', async () => {
      const expected = { message: 'Deleted successfully' };
      jest.spyOn(roleService, 'remove').mockResolvedValue(expected);

      const result = await controller.remove('r1');

      expect(roleService.remove).toHaveBeenCalledWith('r1');
      expect(result).toEqual(expected);
    });
  });
});
