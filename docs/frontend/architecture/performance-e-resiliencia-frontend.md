# Performance, Resiliência e Integração SSR — Alaska Local Frontend

Este guia documenta os padrões de **alta performance, resiliência contra falhas de rede, estratégias de cache e resolução SSR** implementados no frontend Nuxt 3 (`apps/web`).

---

## 1. Otimização de Tráfego & Cache no `useTenant.ts`

Com o desmame da base puramente mockada e a conexão com o PostgreSQL gerenciado via API NestJS no Render, o composable `useTenant.ts` implementa uma tríade de otimização de requisições:

```
┌────────────────────────────────────────────────────────┐
│                     useTenant.ts                       │
├──────────────────────────┬─────────────────────────────┤
│ 1. Cache Reativo         │ 2. Deduplicação em Voo      │
│    useState('tenant_...')│    (In-Flight Promise)      │
├──────────────────────────┴─────────────────────────────┤
│ 3. Debounce de 2s em Foco de Janela                    │
│    Evita tempestade de requests ao alternar abas       │
└────────────────────────────────────────────────────────┘
```

1. **Cache em Memória com `useState`**:
   - Os dados do estabelecimento são mantidos no estado compartilhado do Nuxt (`useState`), compartilhados entre a Vitrine e o Admin durante a navegação SPA.
2. **Deduplicação de Requisições em Voo (*Flight Deduplication*)**:
   - Se múltiplos componentes requisitarem os dados da mesma loja simultaneamente (ex: Hero Banner, Catálogo e Header Card), uma única promise de rede é disparada e compartilhada entre os chamadores.
3. **Debounce de 2 Segundos no Auto-Refresh**:
   - Ao focar a janela do navegador (`visibilitychange` / `focus`), o recarregamento dos dados da loja obedece a uma janela mínima de 2 segundos, prevenindo sobrecarga de requisições à API.
4. **Fallback Gracioso para o Catálogo Local**:
   - Caso a API esteja temporariamente indisponível ou em processo de cold-start no Render, o composable faz fallback transparente para os dados estáticos em `apps/web/data/<slug>.json`, garantindo **zero downtime visual** para o cliente final.

---

## 2. Compartilhamento Nativo Mobile (`useShare.ts`)

O composable `useShare.ts` e o componente `StoreHeroBanner.vue` implementam compartilhamento mobile-first:

```ts
export function useShare() {
  async function shareStore(title: string, text: string, url: string) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return { shared: true }
      } catch (err) {
        // Usuário cancelou o compartilhamento
      }
    }
    // Fallback para Clipboard em navegadores desktop
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      return { copied: true }
    }
    return { shared: false, copied: false }
  }
}
```

* **Mobile (iOS / Android)**: Abre o menu nativo de compartilhamento para Stories do Instagram, WhatsApp e mensagens.
* **Desktop**: Copia a URL amigável diretamente para a área de transferência com toast de confirmação.

---

## 3. Resolução SSR de Domínios no Nitro (`server/middleware/tenant.ts`)

A resolução multi-tenant ocorre antes do HTML ser gerado pelo servidor:

```ts
// apps/web/server/middleware/tenant.ts
export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''
  const cleanHost = host.split(':')[0].toLowerCase()

  // 1. Subdomínios (ex: barbearia.alaska.app)
  if (cleanHost.endsWith('.alaska.app')) {
    event.context.tenantSlug = cleanHost.replace('.alaska.app', '')
  }
  // 2. Domínios Próprios (ex: www.barbeariastyle.com.br)
  else if (!cleanHost.includes('localhost') && !cleanHost.includes('vercel.app')) {
    event.context.customDomain = cleanHost
  }
})
```

* **Vantagem de SEO**: Os títulos, descrições e OpenGraph tags já saem pré-renderizados no primeiro pacote de resposta SSR.
