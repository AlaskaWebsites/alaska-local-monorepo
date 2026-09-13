import { describe, it, expect } from 'vitest';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { MerchantAuthGuard } from '@infra/http/guards/merchant-auth.guard';

describe('MerchantAuthGuard', () => {
  const guard = new MerchantAuthGuard();

  function createMockContext(headers: Record<string, string | undefined>): ExecutionContext {
    const req: any = { headers };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it('deve autorizar requisição com token Bearer base64 válido e anexar payload de lojista', () => {
    const tokenPayload = { tenantId: 'ten-123', slug: 'hamburgueria-x', role: 'merchant', iat: Date.now() };
    const base64Token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const ctx = createMockContext({
      authorization: `Bearer ${base64Token}`,
    });

    const result = guard.canActivate(ctx);
    expect(result).toBe(true);

    const req = ctx.switchToHttp().getRequest<any>();
    expect(req.merchant).toBeDefined();
    expect(req.merchant.tenantId).toBe('ten-123');
    expect(req.merchant.role).toBe('merchant');
  });

  it('deve lançar UnauthorizedException quando o header Authorization for ausente ou sem Bearer', () => {
    expect(() => guard.canActivate(createMockContext({}))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(createMockContext({ authorization: 'Basic 12345' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException quando o token estiver corrompido ou com role inválida', () => {
    const invalidRole = Buffer.from(JSON.stringify({ tenantId: 'ten-1', role: 'customer' })).toString('base64');
    expect(() => guard.canActivate(createMockContext({ authorization: `Bearer ${invalidRole}` }))).toThrow(
      UnauthorizedException,
    );

    expect(() =>
      guard.canActivate(createMockContext({ authorization: 'Bearer token-invalido-nao-json' })),
    ).toThrow(UnauthorizedException);
  });
});
