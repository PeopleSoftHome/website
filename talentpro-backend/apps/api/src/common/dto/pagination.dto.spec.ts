import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('should have default values', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(20);
  });

  it('should accept valid page and pageSize', async () => {
    const dto = plainToInstance(PaginationDto, { page: 2, pageSize: 50 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.pageSize).toBe(50);
  });

  it('should reject invalid page', async () => {
    const dto = plainToInstance(PaginationDto, { page: 0, pageSize: 20 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid pageSize', async () => {
    const dto = plainToInstance(PaginationDto, { page: 1, pageSize: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
