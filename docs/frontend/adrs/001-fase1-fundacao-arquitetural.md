# **Documento de Decisão de Arquitetura (ADR): Fundação Arquitetural do Ecossistema Alaska Local**

## **Contexto Restritivo**

O presente Documento de Decisão de Arquitetura (ADR) formaliza o desenho estrutural da Fase 1 do sistema denominado **Alaska Local**. Este sistema tem como desígnio primordial a criação de uma plataforma multi-tenant de domínio único com resolução dinâmica de domínios para lojistas locais (restaurantes, barbearias, salões, clínicas).

Devido à natureza multi-tenant e à necessidade de escalabilidade gradual (Estágio 1: estático → Estágio 2: backend NestJS → Estágio 3: micro-SaaS completo), o imperativo técnico exige o estabelecimento de um ecossistema TypeScript estrito, intrinsecamente modular e preparado para evolução. A premissa central de engenharia dita que as regras de negócio corporativas e da aplicação não devem, sob nenhuma circunstância, depender ou ter conhecimento do framework de infraestrutura subjacente (NestJS/Nuxt 3), garantindo longevidade, testabilidade e portabilidade do núcleo lógico.

O escopo de fronteira define proibições estritas:

* Estão terminantemente vedadas sugestões baseadas em arquiteturas tradicionais MVC (Model-View-Controller).
* Proibido o acoplamento direto de lógicas de negócio em Controladores ou Serviços utilizando decoradores (como @Injectable()) dentro das camadas de Domínio ou de Casos de Uso.
* A validação de variáveis de ambiente no momento do *bootstrap* deve ser executada estritamente com a biblioteca **Zod**.

A investigação técnica detalhada neste documento encontra-se fragmentada em três vetores lógicos e isolados: Topologia de diretórios (Clean Arch), Validação de ambiente no arranque, e Estratégia de evolução por estágios.

## **Opções Mapeadas**

### **Vetor 1: Estruturação para Clean Architecture (NestJS 11 + Nuxt 3)**

* **MVC Tradicional:** Altamente acoplado. Viola a premissa fundamental de isolamento. (Rejeitada)
* **Arquitetura Hexagonal:** Baixo acoplamento, mas foca mais na separação tecnológica do que na estrita separação entre Regras Corporativas e Regras de Aplicação. (Parcialmente Aderente)
* **Clean Architecture Ortodoxa com Custom Providers:** Acoplamento nulo. O Domínio e os Casos de Uso são POTO (*Plain Old TypeScript Objects*). O framework atua exclusivamente na camada mais externa através de injeção manual com useFactory. **(Totalmente Aderente)**

### **Vetor 2: Validação Estrita de Variáveis de Ambiente**

* **Joi:** Integração nativa, mas tipagem TypeScript fraca. (Rejeitada)
* **class-validator / class-transformer:** Requer decoradores experimentais e conversões implícitas. (Rejeitada)
* **Zod:** Excelente extração estrita de tipos via z.infer. Requer a utilização do ponto de extensão validate() customizado do ConfigModule. **(Totalmente Aderente)**

### **Vetor 3: Estratégia de Evolução por Estágios**

* **Monolito Completo desde o Início:** Alto custo inicial, complexidade desnecessária para 0-5 clientes. (Rejeitada)
* **Evolução Gradual (Estágio 1 → 2 → 3):** Permite validação de mercado antes de investir em infraestrutura complexa. **(Totalmente Aderente)**

## **Decisão Adotada**

### **1\. Topologia de Diretórios (Inversão de Controle Manual)**

A estrutura segrega a aplicação em core (agnóstico) e infrastructure (acoplado a tecnologias):

src/
├── core/                        # Camada Absolutamente Pura (POTO)
│   ├── domain/                  # Regras Corporativas (Enterprise Rules)
│   │   ├── entities/            # Modelos puros (Merchant, Product, Category, Order)
│   │   └── value-objects/       # Objetos imutáveis (Money, Slug, PhoneNumber)
│   └── application/             # Regras da Aplicação (Use Cases)
│       ├── use-cases/           # Orquestração (sem @Injectable)
│       └── ports/               # Interfaces/Contratos (in/out)
│
├── infrastructure/              # NestJS, Nuxt 3, PostgreSQL, Redis, etc.
│   ├── adapters/                # Implementações concretas das Portas
│   │   ├── persistence/         # PostgreSQL/Supabase com RLS
│   │   └── messaging/           # BullMQ Adapter (Estágio 2+)
│   └── framework/               # Camada de integração de frameworks
│       ├── nestjs/              # Acoplamento exclusivo NestJS 11 (Estágio 2+)
│       │   ├── config/          # Validação Zod
│       │   ├── http/            # Controllers/DTOs
│       │   └── modules/         # Configuração de Custom Providers
│       └── nuxt/                # Frontend Nuxt 3 (Estágio 1+)
│           ├── middleware/      # Resolução de domínio/tenant
│           └── pages/          # Rotas dinâmicas [slug].vue
└── main.ts

Nota: o diretório `framework/` foi introduzido para isolar o acoplamento aos frameworks (NestJS e Nuxt 3). Isso permite plugar outros frameworks ou adaptadores legados dentro de `infrastructure/` sem contaminar o core (src/core/).

Além disso, as regras mestras para agentes automatizados (ex.: Cursor/Copilot) foram centralizadas em `.cursorrules` na raiz do repositório; esse arquivo define diretrizes obrigatórias (leitura de ADRs, testes com Vitest, isolamento de framework, etc.) que agentes devem seguir antes de propor ou gerar mudanças de arquitetura.

**Implementação do Custom Provider (Isolamento do Framework):**

Utiliza-se Symbol para criar *tokens* de injeção, permitindo que o NestJS instancie a classe pura passando os repositórios concretos.

// infrastructure/framework/nestjs/modules/merchant.module.ts
export const MERCHANT_REPOSITORY_TOKEN = Symbol('MERCHANT_REPOSITORY_TOKEN');

@Module({
  providers: [
    { provide: MERCHANT_REPOSITORY_TOKEN, useClass: PostgresMerchantRepository },
    {
      provide: CreateMerchantUseCase,
      useFactory: (merchantRepo: PostgresMerchantRepository) => {
        return new CreateMerchantUseCase(merchantRepo);
      },
      inject: [MERCHANT_REPOSITORY_TOKEN],
    },
  ],
})
export class MerchantModule {}

### **2\. Validação de Ambiente (Zod via Fail-Fast)**

Implementação do padrão Fail-Fast no app.module.ts, interceptando o arranque se as credenciais críticas faltarem.

// infrastructure/framework/nestjs/config/env.validation.ts
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL obrigatório.' }),
});

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Falha Crítica nas Variáveis de Ambiente:');
    process.exit(1); // Aborta o container
  }
  return result.data;
}

### **3\. Estratégia de Evolução por Estágios**

#### **Estágio 1: Modo Sem Backend (0 a 5 Clientes Pagantes)**

* **Front-end Estático (Nuxt 3 + Tailwind):** Template modular responsivo populado por arquivos JSON estáticos.
* **Despacho Direto:** Carrinho processa itens, opcionais, taxa de entrega e gera o payload formatado na URL wa.me/55....
* **Infraestrutura:** Hospedagem na Vercel ou Cloudflare Pages com custo de infraestrutura inicial de R$ 0.

#### **Estágio 2: Fundação Multi-tenant & Backend NestJS (6 a 15 Clientes Pagantes)**

* **Core Domain:** Entidades desacopladas (Merchant, Product, Category, Order) e Value Objects (Money, Slug, PhoneNumber).
* **Core Application:** Use cases isolados por Ports (CreateMerchantUseCase, GetPublicMenuUseCase, UpdateMenuUseCase).
* **Infrastructure:** Validação Fail-Fast via Zod, persistência em PostgreSQL/Supabase com Row-Level Security (RLS), testes automatizados com Vitest e governança via ADRs.
* **Painel Administrativo (Nuxt Admin):** Interface simplificada para o lojista alterar preços, pausar itens em falta e ajustar horários de funcionamento.

#### **Estágio 3: Micro-SaaS Completo & Automações Avançadas (15+ Clientes Pagantes)**

* **Liquidação Instantânea de Pix:** Integração via Webhooks (OpenPix/Asaas) para confirmação de pagamento em até 1,5 segundos.
* **Impressão Térmica de Cupom:** Disparo de comandos ESC/POS para impressoras térmicas (58mm/80mm) via Web Bluetooth API direto do navegador móvel do caixa.
* **Módulo de Agendamento Online:** Gestão de horários integrada ao Google Calendar para barbearias, salões e clínicas.

### **4\. Resolução de Domínio no Nuxt 3 (Server Middleware)**

TypeScript
// server/middleware/tenant.ts
export default defineEventHandler((event) => {
  const host = getRequestHost(event) // ex: "www.pizzariadoze.com.br" ou "alaska-websites.com.br"
  
  if (!host.includes('alaska-websites.com.br') && !host.includes('localhost')) {
    // Mapeia o domínio customizado para o slug correspondente
    event.context.tenantSlug = getSlugByCustomDomain(host) // ex: "pizzariadoze"
  }
})
