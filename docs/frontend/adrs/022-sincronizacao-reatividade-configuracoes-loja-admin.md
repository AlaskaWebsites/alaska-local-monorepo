# ADR 022: Sincronização e Reatividade das Configurações do Estabelecimento no Painel do Lojista

## Status
**Aprovado e Implementado** (Fase 2 - Opção B) — Setembro de 2026

## Contexto
O Painel Administrativo (`/[slug]/admin`) é a ferramenta central de operação do comerciante local. Mudanças em horários de expediente, pausa emergencial (chuva/falta de luz), valor do frete, tempo de entrega, chave Pix e comunicado superior precisam:
1. Atualizar o estado visual e o LocalStorage imediatamente (< 50ms) com haptic feedback nativo;
2. Sincronizar em segundo plano com a API NestJS / PostgreSQL sem travar a navegação do usuário;
3. Manter a vitrine pública (`/[slug]`) atualizada para novos clientes que acessam o cardápio ou catálogo.

## Decisão de Arquitetura

1. **Camadas de Armazenamento e Reatividade (3-Layer Persistence Architecture)**:
   * **Camada 1 (Memória Reativa / Vue Ref)**: Resposta instantânea da UI em milissegundos.
   * **Camada 2 (LocalStorage Seguro com Zod)**: Persistência local que sobrevive a reloads e quedas de internet.
   * **Camada 3 (PostgreSQL via NestJS API)**: Persistência autoritativa que distribui as mudanças para todos os clientes da vitrine.

2. **Comportamento Otimista com Sync Assíncrono (`useMerchantAdmin.ts`)**:
   * Funções operacionais (`updateEmergency`, `updateDelivery`, `updatePixConfig`, `updateContact`, `updateAnnouncement`, `updateWeeklySchedule`) persistem no LocalStorage imediatamente e disparam chamadas HTTP `$fetch` com timeout de 15 segundos para a API NestJS.
   * Retornos síncronos imediatos para evitar quebras em chamadas legadas e testes unitários.

3. **Validação Estrita via `@alaska/contracts`**:
   * Todo payload enviado à API é estritamente tipado contra os schemas canônicos compartilhados (`UpdateEmergencySchema`, `UpdateDeliveryConfigSchema`, `UpdatePixConfigSchema`, `UpdateContactSchema`, `UpdateAnnouncementSchema`).

## Consequências
- **Experiência Mobile-First Sem Fricção**: O lojista não sofre com spinners de loading ao alternar uma chave Pix ou mudar uma taxa de entrega.
- **Tolerância a Falhas**: Se o lojista estiver em uma rede móvel instável, o LocalStorage mantém as configurações ativas até a próxima sincronização.
- **Conformidade de Testes**: 100% dos testes unitários do frontend (`merchant-admin.test.ts`) continuam passando sem regressões.
