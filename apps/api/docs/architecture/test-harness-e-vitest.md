# Estratégia de Testes Unitários com Vitest

O Alaska Local Backend utiliza o **Vitest** com compilação rápida via **SWC** para executar suítes de testes unitários e de integração em milissegundos.

---

## 1. Por que Vitest + SWC em vez de Jest + ts-jest?

- **Velocidade:** O Vitest roda até 10x mais rápido que o Jest tradicional com `ts-jest`.
- **Suporte a Decorators do NestJS:** Configurado via `unplugin-swc` com `legacyDecorator: true` e `decoratorMetadata: true`.
- **Suporte Nativo a ESM:** Compatibilidade total com módulos ES modernos.

---

## 2. Padrão de Teste com Repositórios In-Memory

Para testar casos de uso sem mockar funções individuais com `vi.fn()`:

```ts
describe('GetTenantBySlugUseCase', () => {
  let repo: InMemoryTenantRepository
  let useCase: GetTenantBySlugUseCase

  beforeEach(() => {
    repo = new InMemoryTenantRepository()
    useCase = new GetTenantBySlugUseCase(repo)
  })

  it('deve retornar o tenant ativo', async () => {
    await repo.save(new Tenant({ id: '1', slug: 'pizzaria-bella', ... }))
    const result = await useCase.execute({ slug: 'pizzaria-bella' })
    expect(result.slug).toBe('pizzaria-bella')
  })
})
```

---

## 3. Execução dos Testes

```bash
# Rodar todos os testes unitários uma única vez
npm run test

# Rodar testes em modo watch durante o desenvolvimento
npm run test:watch

# Rodar com relatório de cobertura de código
npm run test:cov
```
