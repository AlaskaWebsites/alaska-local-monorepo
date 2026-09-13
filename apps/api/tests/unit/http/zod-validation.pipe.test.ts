import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from '../../../../src/infrastructure/http/pipes/zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string().min(2),
    age: z.number().int().positive(),
  });

  const pipe = new ZodValidationPipe(schema);

  it('deve retornar os dados validados com sucesso para input correto', () => {
    const input = { name: 'Danilo', age: 30 };
    const output = pipe.transform(input);
    expect(output).toEqual(input);
  });

  it('deve aplicar coerção ou defaults se configurados no schema', () => {
    const schemaWithDefault = z.object({
      active: z.boolean().default(true),
      count: z.coerce.number().default(0),
    });
    const defaultPipe = new ZodValidationPipe(schemaWithDefault);

    const output = defaultPipe.transform({ count: '5' });
    expect(output).toEqual({ active: true, count: 5 });
  });

  it('deve lançar BadRequestException para dados em formato inválido', () => {
    expect(() => pipe.transform({ name: 'A', age: -10 })).toThrow(BadRequestException);
    expect(() => pipe.transform(null)).toThrow(BadRequestException);
    expect(() => pipe.transform('texto-invalido')).toThrow(BadRequestException);
  });
});
