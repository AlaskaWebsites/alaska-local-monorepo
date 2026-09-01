import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MerchantAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação ausente ou inválido');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (!decoded.tenantId || decoded.role !== 'merchant') {
        throw new UnauthorizedException('Token de autorização inválido');
      }
      (request as any).merchant = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Formato de token de autenticação corrompido');
    }
  }
}
