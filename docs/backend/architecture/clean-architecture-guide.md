# Guia de Clean Architecture no NestJS 11

Este guia estabelece os padrões e convenções de código para o desenvolvimento de novas funcionalidades no **Alaska Local Backend**.

---

## 1. Estrutura de Pastas e Responsabilidades

```
src/
├── core/                                # REGRAS DE NEGÓCIO PURAS (ZERO NESTJS)
│   ├── domain/                         # Entidades, Value Objects, Erros e Eventos
│   │   ├── entities/                   # ex: tenant.entity.ts, order.entity.ts
│   │   ├── value-objects/              # ex: money.vo.ts, pix-key.vo.ts
│   │   └── errors/                     # ex: domain.error.ts
│   └── application/                    # Casos de Uso e Contratos de Portas
│       ├── ports/                      # Interfaces TypeScript (ex: tenant.repository.port.ts)
│       ├── use-cases/                  # Classes de Caso de Uso puras
│       └── tokens.ts                   # Symbols de injeção de dependência
│
├── infrastructure/                     # ADAPTADORES & FRAMEWORK
│   ├── http/                           # Controllers, Pipes, Filters, Interceptors
│   ├── persistence/                    # Repositórios (In-Memory, Supabase, Drizzle)
│   ├── modules/                        # Módulos NestJS agrupando adaptadores
│   └── ai/                             # Adaptadores de LLMs e MCP
│
└── config/                             # Validação de Variáveis de Ambiente
```

---

## 2. Padrão de Implementação de Casos de Uso

Cada caso de uso deve ter **uma única responsabilidade** e implementar o método `execute`:

```ts
export interface CreateOrderInput {
  tenantId: string
  items: Array<{ productId: string; quantity: number }>
  customerName: string
  customerPhone: string
}

export class CreateOrderUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // 1. Busca e validação de entidades
    const tenant = await this.tenantRepository.findById(input.tenantId)
    if (!tenant) throw new EntityNotFoundError('Tenant', input.tenantId)

    // 2. Execução da regra de negócio de domínio
    if (!tenant.isOpen()) {
      throw new ValidationError('O estabelecimento está fechado no momento.')
    }

    // 3. Criação e persistência
    const order = new Order({ ... })
    await this.orderRepository.save(order)
    return order
  }
}
```

---

## 3. Injeção de Dependências no Módulo NestJS

Nunca use `@Injectable()` no Core. Conecte as dependências na camada de infraestrutura:

```ts
@Module({
  controllers: [TenantController],
  providers: [
    { provide: TOKENS.TENANT_REPOSITORY, useClass: SupabaseTenantRepository },
    {
      provide: GetTenantBySlugUseCase,
      useFactory: (repo: ITenantRepository) => new GetTenantBySlugUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    }
  ]
})
export class TenantModule {}
```
