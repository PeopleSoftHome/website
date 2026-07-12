import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@shared/dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/search', () => {
    it('should delegate search with limit', async () => {
      const expected = { data: [{ id: 'u1', name: 'A' }] };
      jest.spyOn(userService, 'search').mockResolvedValue(expected as never);

      const result = await controller.search('A', '5');

      expect(userService.search).toHaveBeenCalledWith('A', 5);
      expect(result).toEqual(expected);
    });

    it('should default limit to 10', async () => {
      jest.spyOn(userService, 'search').mockResolvedValue({ data: [] } as never);

      await controller.search('A', undefined);

      expect(userService.search).toHaveBeenCalledWith('A', 10);
    });

    it('should coerce invalid limit to 10', async () => {
      jest.spyOn(userService, 'search').mockResolvedValue({ data: [] } as never);

      await controller.search('A', 'not-a-number');

      expect(userService.search).toHaveBeenCalledWith('A', 10);
    });
  });

  describe('GET /users', () => {
    it('should return paginated users', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(userService, 'findAll').mockResolvedValue(expected);

      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const result = await controller.findAll(pagination);

      expect(userService.findAll).toHaveBeenCalledWith(1, 20);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const expected = { id: 'u1', email: 'a@example.com' };
      jest.spyOn(userService, 'findOne').mockResolvedValue(expected as never);

      const result = await controller.findOne('u1');

      expect(userService.findOne).toHaveBeenCalledWith('u1');
      expect(result).toEqual(expected);
    });
  });

  describe('POST /users', () => {
    it('should create user', async () => {
      const dto: CreateUserDto = {
        email: 'a@example.com',
        password: 'SecurePass123!',
        name: 'A',
      };
      const expected = { id: 'u1', ...dto };
      jest.spyOn(userService, 'create').mockResolvedValue(expected as never);

      const result = await controller.create(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user', async () => {
      const dto: UpdateUserDto = { name: 'B' };
      const expected = { id: 'u1', name: 'B' };
      jest.spyOn(userService, 'update').mockResolvedValue(expected as never);

      const result = await controller.update('u1', dto);

      expect(userService.update).toHaveBeenCalledWith('u1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should remove user', async () => {
      const expected = { message: 'Deleted successfully' };
      jest.spyOn(userService, 'remove').mockResolvedValue(expected);

      const result = await controller.remove('u1');

      expect(userService.remove).toHaveBeenCalledWith('u1');
      expect(result).toEqual(expected);
    });
  });
});
