# Pipeline de Agentes de IA & Model Context Protocol (MCP)

Este documento descreve a arquitetura dos agentes autônomos de IA que operam no backend do Alaska Local.

---

## 1. Agente de Extração Visual de Catálogos (OCR Multimodal)

O pipeline transforma imagens não estruturadas em dados estruturados com validação Zod:

```
[Foto Cardápio/Feed] ──► [Vision LLM (Gemini/Claude)] ──► [Zod Schema Parser] ──► [Tenant Catalog JSON]
                                                                │
                                                      (Se erro de validação)
                                                                ▼
                                                    [Self-Correction Prompt]
```

### Regras de Extração:
1. **Identificação de Categorias:** Agrupa itens por contexto (ex: "Burgers Artesanais", "Porções", "Bebidas").
2. **Identificação de Opcionais:** Detecta pontos da carne, tamanhos, adicionais pagos e opcionais gratuitos.
3. **Normalização de Preços:** Converte strings como `"R$ 35,90"` em centavos inteiros (`3590`).

---

## 2. Protocolo de Ferramentas MCP (Model Context Protocol)

O backend disponibiliza ferramentas MCP para que agentes conversacionais operem sobre o catálogo e agendamentos:

| Ferramenta MCP | Descrição | Parâmetros de Entrada |
| :--- | :--- | :--- |
| `consultar_cardapio` | Retorna categorias e produtos ativos do tenant | `{ tenantSlug: string, categoryId?: string }` |
| `verificar_horario` | Informa se a loja está aberta e horário de encerramento | `{ tenantSlug: string, date?: string }` |
| `calcular_frete` | Consulta ViaCEP e calcula taxa de entrega | `{ tenantSlug: string, cep: string }` |
| `buscar_slots_agendamento` | Lista horários livres para serviços de barbearia/clínica | `{ tenantSlug: string, serviceId: string, date: string }` |
| `gerar_pix_payload` | Gera o BR Code Copia e Cola EMV para pagamento | `{ tenantSlug: string, amount: number, txid: string }` |
