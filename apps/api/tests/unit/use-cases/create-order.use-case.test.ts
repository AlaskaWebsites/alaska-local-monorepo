import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrderUseCase, CreateOrderInput } from '../../../../src/core/application/use-cases/create-order.use-case';
import { InMemoryTenantRepository } from '../../../../src/infrastructure/persistence/in-memory/in-memory-tenant.repository';
import { InMemoryOrderRepository } from '../../../../src/infrastructure/persistence/in-memory/in-memory-order.repository';
import { LocalPixGateway } from '../../../../src/infrastructure/gateways/local-pix.gateway';
import { Tenant } from '../../../../src/core/domain/entities/tenant.entity';
import { EntityNotFoundError, ValidationError } from '../../../../src/core/domain/errors/domain.error';

describe('CreateOrderUseCase', () => {
  let tenantRepository: InMemoryTenantRepository;
  let orderRepository: InMemoryOrderRepository;
  let pixGateway: LocalPixGateway;
  let useCase: CreateOrderUseCase;
  let tenant: Tenant;

  beforeEach(async () => {
    tenantRepository = new InMemoryTenantRepository();
    orderRepository = new InMemoryOrderRepository();
    pixGateway = new LocalPixGateway();
    useCase = new CreateOrderUseCase(tenantRepository, orderRepository, pixGateway);

    tenant = new Tenant({
      id: 'ten-hamburgueria-x',
      name: 'Hamburgueria X',
      slug: 'hamburgueria-x',
      phoneWhatsApp: '11988882222',
      businessCategory: 'menu',
      theme: 'food',
      deliveryFeeCents: 600,
      minOrderValueCents: 2000,
      pixConfig: {
        key: '11988882222',
        keyType: 'phone',
        beneficiary: 'Hamburgueria X',
        city: 'SAO PAULO',
      },
    });
    await tenantRepository.save(tenant);
  });

  it('deve criar um pedido de delivery com endereço, taxa e itens calculados', async () => {
    const input: CreateOrderInput = {
      tenantSlug: 'hamburgueria-x',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'delivery',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
      items: [
        {
          productId: 'prod-burger-1',
          name: 'Smash Burger Duplo',
          quantity: 2,
          unitPriceCents: 3200,
        },
      ],
      paymentMethod: 'Dinheiro',
      changeForCents: 10000,
    };

    const order = await useCase.execute(input);

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.tenantId).toBe('ten-hamburgueria-x');
    expect(order.customerName).toBe('Danilo Santos');
    expect(order.deliveryType).toBe('delivery');
    expect(order.deliveryFee.cents).toBe(600);
    expect(order.calculateSubtotal().cents).toBe(6400); // 2 * 3200
    expect(order.calculateTotal().cents).toBe(7000); // 6400 + 600

    const saved = await orderRepository.findById(order.id);
    expect(saved).not.toBeNull();
    expect(saved?.id).toBe(order.id);
  });

  it('deve criar um pedido de retirada (pickup) sem taxa de entrega e sem endereço', async () => {
    const input: CreateOrderInput = {
      tenantSlug: 'hamburgueria-x',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'pickup',
      items: [
        {
          productId: 'prod-burger-1',
          name: 'Smash Burger Duplo',
          quantity: 1,
          unitPriceCents: 3200,
        },
      ],
      paymentMethod: 'Pix',
    };

    const order = await useCase.execute(input);

    expect(order.deliveryType).toBe('pickup');
    expect(order.deliveryFee.cents).toBe(0);
    expect(order.calculateTotal().cents).toBe(3200);
  });

  it('deve gerar código Pix Copia e Cola quando a forma de pagamento for Pix', async () => {
    const input: CreateOrderInput = {
      tenantSlug: 'hamburgueria-x',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'pickup',
      items: [
        {
          productId: 'prod-burger-1',
          name: 'Smash Burger',
          quantity: 1,
          unitPriceCents: 2500,
        },
      ],
      paymentMethod: 'Pix',
    };

    const order = await useCase.execute(input);

    expect(order.pixCode).toBeDefined();
    expect(typeof order.pixCode).toBe('string');
    expect(order.pixCode?.startsWith('000201')).toBe(true); // Tag EMV inicial padrão
  });

  it('deve rejeitar pedido de delivery sem endereço com ValidationError', async () => {
    const input: CreateOrderInput = {
      tenantSlug: 'hamburgueria-x',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'delivery',
      items: [
        {
          productId: 'prod-burger-1',
          name: 'Smash Burger',
          quantity: 1,
          unitPriceCents: 2500,
        },
      ],
      paymentMethod: 'Dinheiro',
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it('deve rejeitar criação de pedido para tenant inexistente com EntityNotFoundError', async () => {
    const input: CreateOrderInput = {
      tenantSlug: 'tenant-fantasma',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'pickup',
      items: [
        {
          productId: 'prod-1',
          name: 'Item',
          quantity: 1,
          unitPriceCents: 1000,
        },
      ],
      paymentMethod: 'Pix',
    };

    await expect(useCase.execute(input)).rejects.toThrow(EntityNotFoundError);
  });
});
