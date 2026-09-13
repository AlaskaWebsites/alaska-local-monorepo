# Protocolo Pix BACEN EMV & LocalPixGateway — Alaska Local Backend

Este guia documenta o padrão de geração local de **Pix D+0** (BR Code EMV e QR Code visual) implementado no `LocalPixGateway`, garantindo pagamentos instantâneos com custo zero de intermediação para os lojistas.

---

## 1. Visão Geral da Arquitetura Pix

Ao contrário de e-commerces que dependem de intermediadores terceiros (com cobrança de tarifas por transação), o ecossistema Alaska Local permite que o pequeno lojista receba o dinheiro diretamente em sua conta bancária via Pix:

```
┌────────────────────────────────────────────────────────┐
│                   APLICAÇÃO BACKEND                    │
│                                                        │
│  [ CreateOrderUseCase / CalculatePixPayloadUseCase ]   │
│                          │                             │
│                          ▼                             │
│             [ LocalPixGateway.ts ]                     │
│  • Montagem TLV Oficial BACEN (Tags 00 a 63)           │
│  • Checksum Polinomial CRC-16 CCITT (0x1021)          │
│  • Renderização Assíncrona de QR Code PNG Base64       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   PAYLOAD DE SAÍDA                     │
│  • Copia e Cola: "00020126580014br.gov.bcb.pix..."    │
│  • QR Code Visual: "data:image/png;base64,iVBORw0..."  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura TLV do BR Code (Padrão Banco Central do Brasil)

O payload EMV é construído pelo método `generateBrCode()` seguindo o formato **Tag-Length-Value (TLV)**:

| Tag | Nome do Campo | Descrição | Exemplo Gerado |
| :--- | :--- | :--- | :--- |
| **00** | *Payload Format Indicator* | Versão do padrão EMV | `000201` |
| **26** | *Merchant Account Information* | Domínio do BACEN e chave Pix do lojista | `26580014br.gov.bcb.pix0136...` |
| **52** | *Merchant Category Code* | Código de categoria comercial (`0000` padrão) | `52040000` |
| **53** | *Transaction Currency* | Moeda (`986` = Real Brasileiro - ISO 4217) | `5303986` |
| **54** | *Transaction Amount* | Valor da transação com 2 casas decimais (opcional) | `540532.00` |
| **58** | *Country Code* | País de operação (`BR`) | `5802BR` |
| **59** | *Merchant Name* | Nome do recebedor (sanitizado, max 25 chars) | `5915Hamburgueria X` |
| **60** | *Merchant City* | Cidade do estabelecimento (sanitizada, max 15 chars) | `6009SAO PAULO` |
| **62** | *Additional Data Field Template* | Identificador da transação (`txid`, max 25 chars) | `62110507ord-123` |
| **63** | *CRC-16 Checksum* | Verificação de integridade calculada sobre o texto | `6304A1B2` |

---

## 3. Sanitização Rigorosa de Strings
Para evitar rejeição por leitores bancários:
* O método `sanitize()` aplica **normalização Unicode NFD** (`.normalize('NFD')`) removendo todos os acentos e caracteres especiais (`replace(/[\u0300-\u036f]/g, '')`).
* Remove pontuações e mantém estritamente caracteres alfanuméricos (`replace(/[^a-zA-Z0-9 ]/g, '')`).
* Trunca no limite máximo estipulado pelo BACEN (25 caracteres para nome e 15 para cidade).

---

## 4. Algoritmo do Checksum CRC-16 CCITT
O checksum de 4 caracteres hexadecimais é gerado com o polinômio padrão `0x1021` e valor inicial `0xFFFF`:

```ts
private crc16(payload: string): string {
  let crc = 0xffff
  const bytes = new TextEncoder().encode(payload)
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}
```

---

## 5. Geração de Imagem QR Code Base64
O método `generateQrCodeDataUrl(payload)` utiliza a biblioteca `qrcode`:
* **Margem reduzida:** `margin: 1` para melhor aproveitamento visual em telas de celular.
* **Dimensões:** `width: 320` px em alta resolução.
* **Nível de Correção de Erros:** `errorCorrectionLevel: 'M'` (15% de recuperação).
* **Paleta de Cores:** Módulo escuro em slate suave (`#0f172a`) e fundo branco (`#ffffff`), 100% aderente ao Design System Claro Suave.
