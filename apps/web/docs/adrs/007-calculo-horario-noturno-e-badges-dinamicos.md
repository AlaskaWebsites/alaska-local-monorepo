# ADR 007: Cálculo de Horários Noturnos e Badges Dinâmicos de Atendimento

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Composable `useOpeningHours.ts`, Vitrine `pages/[slug].vue`, Modal `StoreInfoModal.vue`, Testes `tests/units/opening-hours.test.ts`

---

## 1. Contexto & Problema

Estabelecimentos locais — em especial do segmento de **Food Service** (hamburguerias, pizzarias, adegas, bares e casas noturnas da vertical *Alaska Menu*) — operam rotineiramente em turnos noturnos que ultrapassam a meia-noite (por exemplo, das `18:00` às `03:00` da madrugada).

Na abordagem ingênua de verificação de horários (`now >= open && now <= close`), dois problemas críticos ocorriam:
1. **Falso Fechamento na Madrugada:** Entre `00:00` e `03:00`, a hora atual é menor que `18:00`, fazendo a verificação ingênua classificar a loja incorretamente como "Fechada".
2. **Falta de Clareza no Status (Micro-UX):** Apenas exibir "Aberto" ou "Fechado" não informa ao cliente quando a loja abre ou fecha, gerando ansiedade e perda de conversão.

## 2. Decisão Arquitetural

Desenvolvemos um subsistema desacoplado em `composables/useOpeningHours.ts` baseado em funções puras e reatividade do Vue 3, estruturado em três pilares:

### A. Conversão e Cálculo de Minutos do Dia (`parseTimeToMinutes`)
As strings de horário (`HH:mm`) são convertidas em minutos decorridos a partir da meia-noite (0 a 1439 minutos):
- `openMinutes = (openH * 60) + openM`
- `closeMinutes = (closeH * 60) + closeM`
- `currentMinutes = (nowH * 60) + nowM`

### B. Tratamento de Turnos Noturnos (`isOvernight`)
Quando `openMinutes > closeMinutes` (ex: `18:00` = 1080 min e `03:00` = 180 min):
- O estabelecimento está **aberto** se: `currentMinutes >= openMinutes` (noite do dia corrente) **OU** `currentMinutes < closeMinutes` (madrugada do dia seguinte).
- Nos turnos diurnos convencionais (`openMinutes <= closeMinutes`), o estabelecimento está aberto se: `currentMinutes >= openMinutes && currentMinutes < closeMinutes`.

### C. Status Textual Dinâmico & Acessibilidade (`getOpeningStatus`)
A função computa o rótulo amigável em tempo real:
- **Aberto:** "Aberto até às {HH:mm}"
- **Fechado antes do expediente:** "Fechado • Abre hoje às {HH:mm}"
- **Fechado após o encerramento do dia:** "Fechado • Abre às {HH:mm}"
- **Fallback Permissivo:** Caso o tenant não possua `openingHours` configurado, assume status aberto ("Aberto agora") para não travar a vitrine em estabelecimentos com horário flexível.
- **Acessibilidade W3C/WCAG:** Fornece propriedade `ariaLabel` explicativa para leitores de tela em botões e elementos interativos.

## 3. Consequências & Benefícios

- **Precisão Operacional:** Lojas noturnas continuam recebendo pedidos na madrugada sem falso aviso de fechamento.
- **Micro-UX de Alta Conversão:** O cliente sabe exatamente a janela de tempo que possui para concluir seu pedido.
- **Cobertura de Testes (Vitest):** A suíte `tests/units/opening-hours.test.ts` cobre 100% dos cenários: turnos diurnos, turnos noturnos antes e depois da meia-noite, horários vazios/nulos e reatividade com `ref<Tenant>`.