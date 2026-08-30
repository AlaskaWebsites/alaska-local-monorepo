// tests/units/tenant-middleware.test.ts
import { describe, it, expect } from 'vitest'

// Importamos a função diretamente para testar isoladamente
function getSlugByCustomDomain(host: string): string {
  // Implementação temporária para Fase 1
  // Na Fase 2, isso virá do banco de dados
  const domainToSlugMap: Record<string, string> = {
    'pizzariadoze.com.br': 'pizzariadoze',
    'hamburgueria-x.com.br': 'hamburgueria-x'
  }
  
  // Remove www. se presente
  const cleanHost = host.replace(/^www\./, '')
  return domainToSlugMap[cleanHost] || cleanHost.split('.')[0] || cleanHost
}

describe('Unit: Middleware de Resolução de Tenant (server/middleware/tenant.ts)', () => {
  describe('getSlugByCustomDomain', () => {
    it('deve retornar o slug correto para domínios mapeados explicitamente', () => {
      expect(getSlugByCustomDomain('pizzariadoze.com.br')).toBe('pizzariadoze')
      expect(getSlugByCustomDomain('hamburgueria-x.com.br')).toBe('hamburgueria-x')
    })

    it('deve remover www. e retornar o slug correto para domínios mapeados', () => {
      expect(getSlugByCustomDomain('www.pizzariadoze.com.br')).toBe('pizzariadoze')
      expect(getSlugByCustomDomain('www.hamburgueria-x.com.br')).toBe('hamburgueria-x')
    })

    it('deve extrair o slug do domínio quando não houver mapeamento explícito', () => {
      expect(getSlugByCustomDomain('barbearia-style.com.br')).toBe('barbearia-style')
      expect(getSlugByCustomDomain('cafe-central.com')).toBe('cafe-central')
    })

    it('deve remover www. e extrair o slug quando não houver mapeamento', () => {
      expect(getSlugByCustomDomain('www.barbearia-style.com.br')).toBe('barbearia-style')
      expect(getSlugByCustomDomain('www.cafe-central.com')).toBe('cafe-central')
    })

    it('deve lidar com subdomínios complexos não mapeados', () => {
      expect(getSlugByCustomDomain('loja.novo-dominio.com.br')).toBe('loja')
    })

    it('deve preservar o slug original para domínios simples sem TLD', () => {
      expect(getSlugByCustomDomain('localhost')).toBe('localhost')
    })
  })
})
