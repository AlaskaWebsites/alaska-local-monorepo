// tests/units/whatsapp-order.test.ts
import { describe, it, expect } from 'vitest'
import { generateWhatsAppOrderUrl } from '~/utils/whatsapp'
import { TenantSchema, type Tenant } from '~/types/tenant'
import type { CartState } from '~/types/cart'

describe('WhatsApp Order URL Generator', () => {
    const mockTenant: Tenant = TenantSchema.parse({
        slug: 'burger-test',
        name: 'Burger Test',
        description: 'Melhores burgers',
        phoneWhatsApp: '11999998888',
        address: 'Rua A, 100',
        currency: 'R$',
        deliveryFee: 5.0,
        minOrderValue: 20.0,
        theme: 'food',
        template: 'menu',
        categories: [],
    })

    const mockCart: CartState = {
        items: [
            {
                product: {
                    id: '1',
                    name: 'Cheeseburger',
                    description: '',
                    price: 25.0,
                    available: true,
                    image: '',
                    optionGroups: [],
                },
                quantity: 2,
                unitPrice: 25.0,
                selectedOptions: [{ id: 'b1', name: 'Bacon Extra', price: 4.0, maxQuantity: 1 }] as any,
            },
        ],
        deliveryType: 'delivery',
        deliveryFee: 5.0,
        customerName: 'Danilo',
        address: { street: 'Rua A', number: '100', neighborhood: 'Centro' },
        paymentMethod: 'Pix',
        subtotal: 50.0,
        total: 55.0,
    }

    it('deve gerar a URL com o telefone correto e prefixo 55', () => {
        const url = generateWhatsAppOrderUrl(mockTenant, mockCart)
        expect(url).toContain('https://wa.me/5511999998888')
    })

    it('deve conter o nome do cliente e endereço no payload decodificado', () => {
        const url = generateWhatsAppOrderUrl(mockTenant, mockCart)
        const decodedMessage = decodeURIComponent(url)

        expect(decodedMessage).toContain('Danilo')
        expect(decodedMessage).toContain('Rua A, 100')
        expect(decodedMessage).toContain('Bacon Extra')
        expect(decodedMessage).toContain('TOTAL: R$ 55.00')
    })

    it('deve formatar valores monetários corretamente', () => {
        const url = generateWhatsAppOrderUrl(mockTenant, mockCart)
        const decodedMessage = decodeURIComponent(url)

        expect(decodedMessage).toContain('Subtotal: R$ 50.00')
        expect(decodedMessage).toContain('Taxa de Entrega: R$ 5.00')
        expect(decodedMessage).toContain('TOTAL: R$ 55.00')
    })

    it('deve incluir itens com quantidades corretas', () => {
        const url = generateWhatsAppOrderUrl(mockTenant, mockCart)
        const decodedMessage = decodeURIComponent(url)

        expect(decodedMessage).toContain('*2x* Cheeseburger')
    })

    it('deve incluir a forma de pagamento selecionada', () => {
        const url = generateWhatsAppOrderUrl(mockTenant, mockCart)
        const decodedMessage = decodeURIComponent(url)

        expect(decodedMessage).toContain('FORMA DE PAGAMENTO:')
        expect(decodedMessage).toContain('Pix')
    })

    it('deve sanitizar o número do WhatsApp removendo caracteres não numéricos', () => {
        const tenantWithMaskedPhone: Tenant = TenantSchema.parse({
            ...mockTenant,
            phoneWhatsApp: '(11) 99999-8888',
        })
        const url = generateWhatsAppOrderUrl(tenantWithMaskedPhone, mockCart)

        expect(url).toContain('https://wa.me/5511999998888')
    })
})
