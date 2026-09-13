import { describe, it, expect } from 'vitest';
import { HealthController } from '@infra/http/controllers/health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('deve retornar status ok e identificador de servico', () => {
    const res = controller.check();

    expect(res).toBeDefined();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('alaska-local-backend');
    expect(res.timestamp).toBeDefined();
    expect(typeof res.uptime).toBe('number');
  });

  it('deve gerar timestamp valido em formato ISO 8601', () => {
    const res = controller.check();
    const parsedDate = new Date(res.timestamp);
    expect(parsedDate.getTime()).not.toBeNaN();
    expect(res.uptime).toBeGreaterThanOrEqual(0);
  });
});
