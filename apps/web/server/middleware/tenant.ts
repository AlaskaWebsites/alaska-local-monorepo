// server/middleware/tenant.ts
import { defineEventHandler, getRequestHost } from 'h3'

function getSlugByCustomDomain(host: string): string {
  // Mapeamento de domínios próprios para slugs
  const domainToSlugMap: Record<string, string> = {
    'pizzariadoze.com.br': 'pizzaria-napolitana',
    'hamburgueria-x.com.br': 'hamburgueria-x',
    'karinefinardi.com.br': 'karine-finardi',
    'belladonna.com.br': 'bella-donna',
    'adegaprime.com.br': 'adega-prime',
    'barbeariastyle.com.br': 'barbearia-style',
    'clinicasorriso.com.br': 'clinica-sorriso'
  }
  
  // Remove www. e porta se presente
  const cleanHost = host.replace(/^www\./, '').split(':')[0]
  return domainToSlugMap[cleanHost] || cleanHost.split('.')[0] || cleanHost
}

export default defineEventHandler((event) => {
  const host = getRequestHost(event)
  const slug = getSlugByCustomDomain(host)
  event.context.tenantSlug = slug
})
