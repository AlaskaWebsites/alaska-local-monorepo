// tests/unit/multi-tenancy.spec.ts
import { describe, it, expect } from 'vitest'

describe('Resolução Dinâmica de Multi-Tenancy (One Codebase, Infinite Domains)', () => {
    // Simulação pura da lógica do server/middleware/tenant.ts
    const resolveTenantSlugFromHost = (host: string): string | null => {
        // 1. Ignora ambiente local e domínio raiz da Alaska
        if (
            host.includes('localhost') ||
            host.includes('127.0.0.1') ||
            host.includes('alaska-websites.com.br') ||
            host === 'alaska.app'
        ) {
            return null
        }

        // 2. Subdomínio Wildcard (ex: hamburgueria-x.alaska.app)
        if (host.endsWith('.alaska.app')) {
            const subdomain = host.replace('.alaska.app', '')
            return subdomain.length > 0 ? subdomain : null
        }

        // 3. Domínio Customizado (ex: www.pizzariadoze.com.br ou pizzariadoze.com.br)
        const cleanHost = host.replace(/^www\./, '')
        const domainPart = cleanHost.split('.').at(0)
        return domainPart || null
    }

    it('deve extrair o slug de subdomínios wildcard (*.alaska.app)', () => {
        expect(resolveTenantSlugFromHost('hamburgueria-x.alaska.app')).toBe('hamburgueria-x')
        expect(resolveTenantSlugFromHost('espetaria-brasa.alaska.app')).toBe('espetaria-brasa')
        expect(resolveTenantSlugFromHost('barbearia-style.alaska.app')).toBe('barbearia-style')
    })

    it('deve extrair o slug a partir de domínios próprios (.com.br / .com)', () => {
        expect(resolveTenantSlugFromHost('www.pizzariadoze.com.br')).toBe('pizzariadoze')
        expect(resolveTenantSlugFromHost('pizzariadoze.com.br')).toBe('pizzariadoze')
        expect(resolveTenantSlugFromHost('www.burgershop.com')).toBe('burgershop')
    })

    it('deve retornar null para localhost e para o domínio principal da Alaska', () => {
        expect(resolveTenantSlugFromHost('localhost:3000')).toBeNull()
        expect(resolveTenantSlugFromHost('127.0.0.1:3000')).toBeNull()
        expect(resolveTenantSlugFromHost('alaska-websites.com.br')).toBeNull()
        expect(resolveTenantSlugFromHost('alaska.app')).toBeNull()
    })
})