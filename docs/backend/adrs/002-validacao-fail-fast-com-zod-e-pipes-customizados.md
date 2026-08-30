# ADR 002: Validação Fail-Fast com Zod e Pipes Customizados

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulos `src/config/env.schema.ts`, `src/infrastructure/http/pipes/zod-validation.pipe.ts`, DTOs HTTP

---

## 1. Contexto & Problema

O ecossistema NestJS tradicionalmente utiliza `class-validator` e `class-transformer` com decorators em classes.

No entanto:
1. `class-validator` não infere tipos estáticos no TypeScript (requer duplicação manual de propriedades e tipos).
2. Não funciona de forma nativa para validação de variáveis de ambiente (`process.env`), webhooks externos (Asaas) e saídas estruturadas de agentes de IA (LLMs).
3. Mensagens de erro de validação são frequentemente prolixas ou inconsistentes.

## 2. Decisão Arquitetural

Adotamos **Zod** como a ferramenta única e universal de validação de dados em todo o backend:

### A. Validação de Ambiente no Bootstrap (`src/config/env.schema.ts`)
Ao iniciar a aplicação, `validateEnv()` executa a validação fail-fast. Se qualquer variável obrigatória estiver faltando ou inválida, a aplicação interrompe o processo imediatamente com log explicativo:
```ts
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().optional()
})
```

### B. ZodValidationPipe no NestJS (`src/infrastructure/http/pipes/zod-validation.pipe.ts`)
Criamos um Pipe customizado que valida payloads de entrada de controllers usando schemas Zod e formata respostas de erro padronizadas:
```ts
@Get('resolve')
@UsePipes(new ZodValidationPipe(ResolveDomainQuerySchema))
async resolve(@Query() query: ResolveDomainQuery) { ... }
```

### C. Inferência Automática de Tipos
Elimina duplicação de código usando `z.infer<typeof Schema>` para gerar os tipos TypeScript em tempo de compilação.

## 3. Consequências & Benefícios

- **Consistência Total:** A mesma biblioteca Zod valida o front-end Nuxt 3, o backend NestJS e os structured outputs de LLMs.
- **Fail-Fast:** Erros de payload são bloqueados antes de atingir qualquer caso de uso.
