import { Controller, Get, Post, Body, Param, Query, Inject, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import { TOKENS } from '../../../core/application/tokens';
import { GetTenantBySlugUseCase } from '../../../core/application/use-cases/get-tenant-by-slug.use-case';
import { ResolveTenantByDomainUseCase } from '../../../core/application/use-cases/resolve-tenant-by-domain.use-case';
import { UpdateTenantHoursUseCase } from '../../../core/application/use-cases/update-tenant-hours.use-case';
import { AuthenticateMerchantUseCase } from '../../../core/application/use-cases/authenticate-merchant.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { MerchantLoginSchema, type MerchantLoginInput } from '@alaska/contracts';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';

@Controller('tenants')
export class TenantController {
  private authenticateMerchantUseCase: AuthenticateMerchantUseCase;

  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase,
    private readonly updateTenantHoursUseCase: UpdateTenantHoursUseCase,
    @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepository: ITenantRepository,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {
    this.authenticateMerchantUseCase = new AuthenticateMerchantUseCase(
      this.tenantRepository,
      this.passwordHasher,
    );
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute(slug);
    return tenant.toJSON();
  }

  @Get('resolve/domain')
  async resolveByDomain(@Query('host') host: string) {
    const tenant = await this.resolveTenantByDomainUseCase.execute(host);
    return tenant ? tenant.toJSON() : null;
  }

  @Post(':slug/admin/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(MerchantLoginSchema))
  async login(
    @Param('slug') slug: string,
    @Body() body: MerchantLoginInput,
  ) {
    return this.authenticateMerchantUseCase.execute({
      slug,
      pin: body.pin,
    });
  }

  @Post(':slug/hours')
  async updateHours(
    @Param('slug') slug: string,
    @Body() body: { hours: Record<string, { open: string; close: string; closed?: boolean }> },
  ) {
    return this.updateTenantHoursUseCase.execute({
      slug,
      hours: body.hours,
    });
  }
}
