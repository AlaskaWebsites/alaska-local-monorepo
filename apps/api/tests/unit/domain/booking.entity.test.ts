import { describe, it, expect } from 'vitest';
import { Booking } from '@core/domain/entities/booking.entity';
import { ValidationError } from '@core/domain/errors/domain.error';

describe('Booking Entity', () => {
  it('deve instanciar um agendamento com serviços e dados válidos', () => {
    const booking = new Booking({
      id: 'book-1',
      tenantId: 'ten-barbearia-style',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      date: '2026-08-30',
      time: '14:30',
      services: [
        { id: 's1', name: 'Corte Degradê', priceCents: 4500, durationMinutes: 40 },
        { id: 's2', name: 'Barboterapia', priceCents: 3500, durationMinutes: 30 },
      ],
      paymentMode: 'on_service',
    });

    expect(booking.id).toBe('book-1');
    expect(booking.customerName).toBe('Danilo Santos');
    expect(booking.status).toBe('confirmed'); // on_service já confirma direto
    expect(booking.paymentMode).toBe('on_service');
  });

  it('deve calcular a duração total e o valor total acumulado dos serviços', () => {
    const booking = new Booking({
      id: 'book-2',
      tenantId: 'ten-barbearia-style',
      customerName: 'Lucas Lima',
      customerPhone: '11988887777',
      date: '2026-08-30',
      time: '16:00',
      services: [
        { id: 's1', name: 'Corte', priceCents: 4000, durationMinutes: 35 },
        { id: 's2', name: 'Barba', priceCents: 3000, durationMinutes: 25 },
      ],
    });

    expect(booking.calculateTotalDurationMinutes()).toBe(60); // 35 + 25
    expect(booking.calculateTotalPrice().cents).toBe(7000); // 4000 + 3000
    expect(booking.calculateTotalPrice().amount).toBe(70.0);
  });

  it('deve iniciar como scheduled quando paymentMode for pix_deposit e confirmar após confirmação de depósito', () => {
    const booking = new Booking({
      id: 'book-3',
      tenantId: 'ten-clinica-sorriso',
      customerName: 'Mariana Costa',
      customerPhone: '11977776666',
      date: '2026-08-31',
      time: '10:00',
      services: [{ id: 's-odonto', name: 'Limpeza e Profilaxia', priceCents: 18000, durationMinutes: 50 }],
      paymentMode: 'pix_deposit',
      depositAmountCents: 3600,
    });

    expect(booking.status).toBe('scheduled');
    booking.confirmDeposit();
    expect(booking.status).toBe('confirmed');
  });

  it('deve armazenar e retornar o código Pix para o sinal', () => {
    const booking = new Booking({
      id: 'book-4',
      tenantId: 'ten-1',
      customerName: 'Carlos',
      customerPhone: '11999998888',
      date: '2026-09-01',
      time: '11:00',
      services: [{ id: 's1', name: 'Serviço', priceCents: 5000, durationMinutes: 30 }],
    });

    booking.setPixCode('00020126580014br.gov.bcb.pix...');
    expect(booking.pixCode).toBe('00020126580014br.gov.bcb.pix...');
  });

  it('deve rejeitar agendamento sem serviços com ValidationError', () => {
    expect(
      () =>
        new Booking({
          id: 'book-inv',
          tenantId: 'ten-1',
          customerName: 'Cliente',
          customerPhone: '11999998888',
          date: '2026-08-30',
          time: '10:00',
          services: [],
        }),
    ).toThrow(ValidationError);
  });
});
