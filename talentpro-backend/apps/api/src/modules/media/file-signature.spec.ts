import { BadRequestException } from '@nestjs/common';
import { assertMediaSignature } from './file-signature';

describe('assertMediaSignature', () => {
  it('accepts JPEG magic bytes', () => {
    expect(() => assertMediaSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg')).not.toThrow();
  });

  it('accepts PNG magic bytes', () => {
    expect(() => assertMediaSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png')).not.toThrow();
  });

  it('rejects mismatched content type', () => {
    expect(() => assertMediaSignature(Buffer.from('%PDF-1.7'), 'image/png')).toThrow(BadRequestException);
  });

  it('rejects unsupported content types', () => {
    expect(() => assertMediaSignature(Buffer.from('text/plain'), 'text/plain')).toThrow(BadRequestException);
  });
});
