# ADR 019: Estratégia de Upload Direto do Client e Otimização de Imagens com Cloudinary

- **Status:** Aceito / Em Planejamento de Implementação
- **Data:** 2026-09-16
- **Contexto:** `apps/web/components/admin/modals/AdminCreateProductModal.vue`, `apps/web/composables/useImageUpload.ts`, `apps/web/components/storefront/ProductCard.vue`, `apps/web/components/ProductCustomizerModal.vue`, `docs/frontend/adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md`

---

## 1. Contexto & Diagnóstico da Dor Operacional

Nas versões iniciais do Painel do Lojista (`apps/web/pages/[slug]/admin.vue`), a adição de fotos de produtos dependia do preenchimento manual de uma URL externa pública via campo de texto.

Na prática operacional de pequenos comerciantes de bairro (adegas, hamburguerias, pet shops, barbearias e clínicas), esse fluxo gerava fricção severa e falhas silenciosas:
1. **Atrito de Usabilidade no Mobile:** Exigir que o lojista pesquise a imagem no Google Imagens ou Unsplash no celular, copie o link e cole no input inviabiliza o fluxo rápido de cadastro de novos itens no balcão.
2. **Bloqueio de Hotlink (CORS / Referer Anti-Leech):** Links copiados de sites de terceiros (portais automotivos, e-commerces, etc.) frequentemente bloqueiam requisições de domínios externos via cabeçalho `Referer`, retornando `HTTP 403 Forbidden` e quebrando a exibição.
3. **Páginas vs Arquivos Diretos:** O lojista costuma copiar o link da página do produto/blog em vez do binário direto da imagem (`.webp`, `.jpg`), impedindo a tag `<img>` de decodificar os pixels.
4. **Peso e Desempenho:** Fotos brutas tiradas por smartphones modernos (iPhone/Android) pesam entre 6 MB e 15 MB em resoluções acima de 4000px, tornando inviável o tráfego direto sem compressão e redimensionamento.

**Objetivo:** Permitir que o lojista suba fotos de produtos diretamente do celular (câmera ou galeria) com upload em nuvem gratuito, otimização automática de formato/tamanho e custo zero de tráfego na API central.

---

## 2. Análise Comparativa de Soluções Cloud (2026/2027)

| Provedor | Free Tier | Upload Direto Client-to-Cloud | Otimização On-the-Fly (WebP/Resize) | Sobrecarga na API NestJS | Veredito Arquitetural |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloudinary** | **25 GB** storage + **25 GB** banda/mês | **Sim** (Unsigned Upload Preset) | **Nativa via URL** (`f_auto,q_auto,w_600`) | **Zero** (Direto do Nuxt) | **Vencedor.** Resolve pipeline de mídia de ponta a ponta. |
| **Cloudflare R2** | **10 GB** storage + Egress Ilimitado Grátis | Sim (Presigned URLs via S3 SDK) | Não no Free (exige worker ou lib cliente) | Baixa (gera presigned URLs) | Excelente para backups pesados, mas complexo para fotos de catálogo. |
| **Vercel Blob** | **1 GB** storage / **10 GB** banda | Sim (`@vercel/blob/client`) | Não | Zero | Limite gratuito de 1 GB é insuficiente para múltiplos lojistas. |
| **UploadThing** | **2 GB** storage | Sim | Básica | Média | Ecossistema focado em React/Next.js; limite free restrito. |
| **ImgBB API** | Ilimitado (arquivos até 32 MB) | Sim (API Key) | Não | Zero | Sem controle de CDN corporativa, sem transformações dinâmicas. |

---

## 3. Decisão Arquitetural: Cloudinary com Unsigned Upload Preset

Adota-se o **Cloudinary** como serviço de armazenamento, CDN e otimização dinâmica de imagens para o ecossistema Alaska Local, operando através do padrão **Client-to-Cloud Unsigned Upload**.

### Principais Justificativas:

1. **Zero Gargalo no Backend (Render Free Tier):**
   A API NestJS (`apps/api`) opera em container com limites de memória. Fazer streaming de uploads multipart de 15 MB pelo NestJS consumiria memória excessiva e causaria timeouts. Com o Cloudinary, o browser do lojista envia os bytes diretamente para os servidores do Cloudinary via HTTPS multipart.
2. **Transformações Dinâmicas On-The-Fly:**
   Ao salvar uma imagem, o Cloudinary permite manipular resolução, corte e formato dinamicamente alterando apenas a rota da URL:
   ```text
   https://res.cloudinary.com/<cloud_name>/image/upload/c_fill,g_auto,w_600,h_600,f_auto,q_auto/<public_id>.<ext>
   ```
   - `f_auto`: serve automaticamente no formato mais moderno suportado pelo cliente (AVIF ou WebP).
   - `q_auto`: compressão perceptual de alta eficiência, reduzindo o arquivo para ~30 KB a 50 KB sem perda visual perceptível.
   - `c_fill,g_auto,w_600,h_600`: enquadramento inteligente no ponto de foco automático em proporção 1:1, ideal para os cards de produtos.
3. **Zero Dependências Pesadas no Bundle:**
   A integração não exige SDK pesado do Cloudinary no front-end. O upload é executado com uma simples chamada HTTP nativa `fetch` para o endpoint REST `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`.

---

## 4. Topologia de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUXO DE UPLOAD CLOUD-DIRECT                           │
│                                                                             │
│  [ Celular do Lojista ]                                                     │
│       │                                                                     │
│       ├─ 1. Seleciona foto na Galeria / Câmera (<input type="file">)        │
│       ├─ 2. Preview instantâneo local (URL.createObjectURL)                │
│       │                                                                     │
│       ▼ (POST multipart/form-data com unsigned preset)                      │
│  [ Cloudinary CDN / Ingestion API ]                                         │
│       │                                                                     │
│       ├─ 3. Validação de formato e tamanho máximo (ex: max 10MB)            │
│       ├─ 4. Otimização e geração de secure_url                              │
│       │                                                                     │
│       ▼ Retorna JSON { secure_url: "https://res.cloudinary.com/..." }      │
│  [ useMerchantAdmin / LocalStorage Overrides ]                              │
│       │                                                                     │
│       └─ 5. Salva produto com a URL otimizada no catálogo do tenant         │
│                                                                             │
│  [ Vitrine Pública / Clientes ]                                             │
│       │                                                                     │
│       └─ 6. Carregamento ultra-rápido em WebP (~40KB) via CDN global        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Especificação dos Contratos & Componentes

### 5.1. Composable de Upload: `useImageUpload.ts`

```typescript
// apps/web/composables/useImageUpload.ts
export interface UploadResult {
  url: string
  publicId?: string
  width?: number
  height?: number
}

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)
  const uploadProgress = ref(0)

  async function uploadImage(file: File): Promise<UploadResult | null> {
    isUploading.value = true
    uploadError.value = null
    uploadProgress.value = 0

    try {
      const config = useRuntimeConfig()
      const cloudName = config.public.cloudinaryCloudName || 'alaska-local'
      const uploadPreset = config.public.cloudinaryUploadPreset || 'alaska_products'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'alaska-products')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`Falha no upload: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Aplica transformações automáticas para vitrine (f_auto, q_auto, corte inteligente)
      const optimizedUrl = (data.secure_url as string).replace(
        '/image/upload/',
        '/image/upload/c_fill,g_auto,w_600,h_600,f_auto,q_auto/'
      )

      return {
        url: optimizedUrl,
        publicId: data.public_id,
        width: data.width,
        height: data.height
      }
    } catch (err: any) {
      uploadError.value = err.message || 'Erro ao enviar imagem'
      return null
    } finally {
      isUploading.value = false
    }
  }

  return {
    uploadImage,
    isUploading,
    uploadError,
    uploadProgress
  }
}
```

### 5.2. Experiência de Usuário no Modal (`AdminCreateProductModal.vue`)

- **Elemento UI:** Área de toque generosa (`h-32`), pontilhada (`border-dashed border-slate-700`), com ícone de câmera/upload.
- **Trigger Mobile:** `<input type="file" accept="image/png, image/jpeg, image/webp" class="hidden" />` ativado ao clicar na caixa.
- **Preview em Tempo Real:** Ao selecionar o arquivo, a UI renderiza imediatamente a imagem em miniatura via `URL.createObjectURL(file)` acompanhada de um indicador de progresso (*spinner* suave).
- **Fallback Híbrido:** Permanece um botão sutil *"Ou colar link de imagem externa"* para casos especiais onde o lojista já possui a URL pronta.

---

## 6. Sinergia com a ADR 008 (Resiliência & SVG Fallback)

Conforme estabelecido na **ADR 008**, toda imagem na vitrine continua blindada com a diretiva `@error="handleImageError"` e o atributo `referrerpolicy="no-referrer"`. 

Caso ocorra indisponibilidade temporária na CDN ou conexão instável do cliente final:
- A interface exibe instantaneamente o **Placeholder SVG Temático** da vertical da loja (ícone suave em tons monocromáticos de descanso visual `bg-slate-100`).
- O layout permanece 100% íntegro, sem quebras de altura (*layout shifts* CLS = 0).

---

## 7. Roteiro de Implementação

1. **Configuração de Ambiente:** Adicionar as variáveis públicas `NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME` e `NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` no `nuxt.config.ts` e nas variáveis de ambiente da Vercel.
2. **Criação do Composable:** Implementar `apps/web/composables/useImageUpload.ts` com testes unitários no Vitest mockando a resposta da API Cloudinary.
3. **Refatoração do Modal:** Integrar o seletor de arquivos com pré-visualização no `AdminCreateProductModal.vue`.
4. **Validação:** Submeter imagens de diversos formatos (JPG, PNG, WebP) em dispositivos móveis reais e validar a entrega otimizada no `ProductCard.vue` e `ProductCustomizerModal.vue`.
