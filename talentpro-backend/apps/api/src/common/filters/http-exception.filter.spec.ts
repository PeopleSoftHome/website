import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  const createHost = (responseMock: Record<string, unknown>, requestMock: Record<string, unknown>): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getResponse: () => responseMock,
        getRequest: () => requestMock,
      }),
    }) as unknown as ArgumentsHost;

  it('should handle HttpException with object response', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const req = { method: 'GET', url: '/test', requestId: 'r1' };
    filter.catch(
      new HttpException({ message: ['bad'] }, HttpStatus.BAD_REQUEST),
      createHost(res, req),
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'bad',
        details: ['bad'],
        requestId: 'r1',
      },
    });
  });

  it('should handle HttpException with string response', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const req = { method: 'GET', url: '/test' };
    filter.catch(new HttpException('oops', 403), createHost(res, req));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'oops',
        details: undefined,
        requestId: undefined,
      },
    });
  });

  it('should handle unknown errors and log 500s', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const req = { method: 'POST', url: '/api', requestId: 'r2' };
    const err = new Error('password: secret123');
    filter.catch(err, createHost(res, req));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        details: undefined,
        requestId: 'r2',
      },
    });
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
