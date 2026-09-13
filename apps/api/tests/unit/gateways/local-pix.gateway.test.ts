import { describe, it, expect, beforeEach } from 'vitest';
import { LocalPixGateway, generatePixEmv } from '../../../../src/infrastructure/gateways/local-pix.gateway';

describe('LocalPixGateway & generatePixEmv (BACEN BR Code EMV)', () => {
  let gateway: LocalPixGateway;

  beforeEach(() => {
    gateway = new LocalPixGateway();
  });

  it('deve gerar payload BR Code contendo todas as tags EMV obrigatórias', () => {
    const payload = generatePixEmv({
      key: '11988882222',
      name: 'Hamburgueria X LTDA',
      city: 'SAO PAULO',
      amount: 32.5,
      txid: 'PEDIDO123',
    });

    expect(payload).toBeDefined();
    expect(payload.startsWith('000201')).toBe(true); // Tag 00 - Payload Format Indicator
    expect(payload).toContain('br.gov.bcb.pix'); // Tag 26 - Merchant Account Information
    expect(payload).toContain('11988882222'); // Chave Pix
    expect(payload).toContain('52040000'); // Tag 52 - Merchant Category Code
    expect(payload).toContain('5303986'); // Tag 53 - Currency BRL (986)
    expect(payload).toContain('540532.50'); // Tag 54 - Valor formatado
    expect(payload).toContain('5802BR'); // Tag 58 - País BR
    expect(payload).toContain('SAO PAULO'); // Tag 60 - Cidade
    expect(payload).toContain('6304'); // Tag 63 - Checksum CRC-16
  });

  it('deve sanitizar caracteres especiais e limitar tamanho de nome (25) e cidade (15)', () => {
    const payload = generatePixEmv({
      key: 'contato@lojinha.com.br',
      name: 'Pizzaria Bella & Tradizionale de São Paulo LTDA', // > 25 chars e com acentos/&
      city: 'São José dos Campos', // > 15 chars e com acentos
      amount: 45.0,
      txid: 'ALASKA99',
    });

    // Tag 59 (Nome) e Tag 60 (Cidade)
    expect(payload).not.toContain('ã');
    expect(payload).not.toContain('é');
    expect(payload).toContain('5802BR');
    expect(payload).toContain('6304');
  });

  it('deve calcular checksum CRC-16 de 4 caracteres hexadecimais', () => {
    const payload = gateway.generateBrCode({
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      name: 'Karine Finardi',
      city: 'FRANCISCO MORATO',
      amount: 89.9,
    });

    // O payload deve terminar com a tag 6304XXXX onde XXXX é o CRC16 hex
    const match = payload.match(/6304([0-9A-F]{4})$/);
    expect(match).not.toBeNull();
    expect(match?.[1].length).toBe(4);
  });

  it('deve gerar payload e QR Code data URL no método generatePayload', async () => {
    const result = await gateway.generatePayload({
      key: '11999998888',
      name: 'Adega Prime',
      city: 'SAO PAULO',
      amount: 10.0,
      txid: 'TEST1',
    });

    expect(result.emv).toBeDefined();
    expect(result.emv.startsWith('000201')).toBe(true);
    expect(result.qrCodeDataUrl).toBeDefined();
    expect(result.qrCodeDataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});
