import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  MerchantCredentialsLoginSchema,
  ChangeMerchantPasswordSchema,
  type MerchantCredentialsLoginDto,
  type ChangeMerchantPasswordDto,
} from '@alaska/contracts';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { MerchantAuthGuard } from '../guards/merchant-auth.guard';
import { AuthenticateMerchantCredentialsUseCase } from '@core/application/use-cases/authenticate-merchant-credentials.use-case';
import { ChangeMerchantPasswordUseCase } from '@core/application/use-cases/change-merchant-password.use-case';

@ApiTags('Merchant Auth')
@Controller('auth/merchant')
export class MerchantAuthController {
  constructor(
    private readonly authenticateUseCase: AuthenticateMerchantCredentialsUseCase,
    private readonly changePasswordUseCase: ChangeMerchantPasswordUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica o lojista com e-mail, senha e tenantSlug (ADR 017)',
    description: 'Substitui o PIN mockado do ADR 007 por credenciais corporativas blindadas com hash criptográfico.',
  })
  @ApiResponse({ status: 200, description: 'Lojista autenticado com sucesso ou credenciais inválidas.' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado.' })
  async login(
    @Body(new ZodValidationPipe(MerchantCredentialsLoginSchema)) dto: MerchantCredentialsLoginDto,
  ) {
    const result = await this.authenticateUseCase.execute({
      email: dto.email,
      password: dto.password,
      tenantSlug: dto.tenantSlug,
    });

    return {
      success: result.authenticated,
      data: result,
    };
  }

  @Post('change-password')
  @UseGuards(MerchantAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Altera a senha do lojista autenticado (ADR 017)',
    description: 'Requer autenticação Bearer JWT do lojista, validação da senha atual e nova senha mínima de 8 caracteres.',
  })
  @ApiResponse({ status: 200, description: 'Senha atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta ou senhas divergentes.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async changePassword(
    @Req() req: any,
    @Body(new ZodValidationPipe(ChangeMerchantPasswordSchema)) dto: ChangeMerchantPasswordDto,
  ) {
    const merchant = req.merchant;
    const result = await this.changePasswordUseCase.execute({
      userId: merchant.userId,
      tenantSlug: merchant.tenantSlug,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
      confirmPassword: dto.confirmPassword,
    });

    return {
      success: true,
      message: result.message,
    };
  }

  @Get('me')
  @UseGuards(MerchantAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna a sessão ativa do lojista autenticado (ADR 017)',
  })
  @ApiResponse({ status: 200, description: 'Sessão do lojista retornada.' })
  @ApiResponse({ status: 401, description: 'Token de autenticação inválido.' })
  async me(@Req() req: any) {
    return {
      success: true,
      data: req.merchant,
    };
  }
}
