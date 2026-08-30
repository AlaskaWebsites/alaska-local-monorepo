// tests/units/cart-drawer.spec.ts
import { describe, it, expect } from 'vitest'
import { TenantSchema, type Tenant } from '~/types/tenant'
import type { CartItem, CheckoutFormData, DeliveryType } from '~/types/cart'

// 1. Mock Completo de Tenant Válido via Schema Zod
const mockTenant: Tenant = TenantSchema.parse({
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X',
    description: 'Os melhores smash burgers',
    logo: 'https://images.unsplash.com/logo.jpg',
    banner: 'https://images.unsplash.com/banner.jpg',
    phoneWhatsApp: '11999999999',
    address: 'Rua dos Burgers, 100 - Jardins',
    currency: 'R$',
    deliveryFee: 8.0,
    minOrderValue: 20.0,
    theme: 'food',
    openingHours: {
        open: '18:00',
        close: '23:30',
    },
    categories: [],
})

// 2. Mock de Itens no Carrinho (Tipagem Padronizada CartItem)
const mockCartItems: CartItem[] = [
    {
        product: {
            id: 'p1',
            name: 'Smash Duplo Bacon',
            description: '',
            price: 32.0,
            available: true,
            image: '',
            optionGroups: [],
        },
        quantity: 2,
        selectedOptions: [
            { id: 'opt-bacon', name: 'Bacon Crocante Extra', price: 4.0, maxQuantity: 2 },
            { id: 'opt-cheese', name: 'Queijo Extra', price: 3.0, maxQuantity: 1 },
        ],
        observation: 'Caprichar na maionese verde',
        unitPrice: 39.0, // 32 + 4 + 3
    },
    {
        product: {
            id: 'p2',
            name: 'Batata Rústica Individual',
            description: '',
            price: 15.0,
            available: true,
            image: '',
            optionGroups: [],
        },
        quantity: 1,
        selectedOptions: [],
        observation: '',
        unitPrice: 15.0,
    },
]

// 3. Funções Puras Extraídas do Componente para Testes Unitários
function calculateSubtotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
}

function calculateDeliveryFee(deliveryType: DeliveryType, tenantFee?: number): number {
    return deliveryType === 'delivery' ? tenantFee || 0 : 0
}

function calculateTotal(items: CartItem[], deliveryType: DeliveryType, tenantFee?: number): number {
    return calculateSubtotal(items) + calculateDeliveryFee(deliveryType, tenantFee)
}

function validateCheckout(
    customerName: string,
    deliveryType: DeliveryType,
    address: { street: string; number: string; neighborhood: string }
): boolean {
    if (!customerName.trim()) return false
    if (deliveryType === 'delivery') {
        return (
            address.street.trim() !== '' &&
            address.number.trim() !== '' &&
            address.neighborhood.trim() !== ''
        )
    }
    return true
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

function buildWhatsAppPayload(
    tenant: Tenant,
    items: CartItem[],
    checkout: CheckoutFormData
): { message: string; url: string } {
    const lines: string[] = []
    lines.push(`🍔 *NOVO PEDIDO - ${tenant.name.toUpperCase()}*`)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

    items.forEach((item) => {
        lines.push(`*${item.quantity}x* ${item.product.name} — *${formatCurrency(item.unitPrice * item.quantity)}*`)
        if (item.selectedOptions && Array.isArray(item.selectedOptions) && item.selectedOptions.length) {
            item.selectedOptions.forEach((opt: any) => {
                const priceStr = opt.price > 0 ? ` (+${formatCurrency(opt.price)})` : ''
                lines.push(`   └ _${opt.name}${priceStr}_`)
            })
        }
        if (item.observation) {
            lines.push(`   └ 💬 _Obs: "${item.observation}"_`)
        }
        lines.push('')
    })

    const subtotal = calculateSubtotal(items)
    const total = calculateTotal(items, checkout.deliveryType, tenant.deliveryFee)

    lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`Subtotal: ${formatCurrency(subtotal)}`)

    if (checkout.deliveryType === 'delivery') {
        lines.push(`Taxa de Entrega: ${formatCurrency(tenant.deliveryFee || 0)}`)
        lines.push(`*TOTAL: ${formatCurrency(total)}*`)
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
        lines.push(`📍 *DADOS DE ENTREGA:*`)
        lines.push(`• Nome: ${checkout.customerName}`)
        lines.push(`• Endereço: ${checkout.address.street}, ${checkout.address.number}`)
        if (checkout.address.complement) {
            lines.push(`• Complemento: ${checkout.address.complement}`)
        }
        lines.push(`• Bairro: ${checkout.address.neighborhood}`)
    } else {
        lines.push(`*TOTAL (RETIRADA): ${formatCurrency(total)}*`)
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
        lines.push(`🛍️ *RETIRADA NO BALCÃO:*`)
        lines.push(`• Nome: ${checkout.customerName}`)
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`💳 *FORMA DE PAGAMENTO:*`)
    lines.push(`• ${checkout.paymentMethod}`)
    if (checkout.paymentMethod === 'Dinheiro' && checkout.changeFor) {
        lines.push(`• Troco para: ${formatCurrency(checkout.changeFor)}`)
    }

    const message = lines.join('\n')
    const phone = tenant.phoneWhatsApp.replace(/\D/g, '')
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`

    return { message, url }
}

describe('Componente Modular: CartDrawerModal (Regras de Negócio e Checkout)', () => {
    describe('1. Cálculos de Subtotal, Frete e Total', () => {
        it('deve calcular corretamente o subtotal de múltiplos itens e quantidades com opcionais', () => {
            // Item 1: (32 + 4 + 3) * 2 = 78.00
            // Item 2: 15 * 1 = 15.00
            // Total Subtotal = 93.00
            const subtotal = calculateSubtotal(mockCartItems)
            expect(subtotal).toBe(93.0)
        })

        it('deve aplicar a taxa de entrega quando o pedido for para Delivery', () => {
            const fee = calculateDeliveryFee('delivery', mockTenant.deliveryFee)
            expect(fee).toBe(8.0)

            const total = calculateTotal(mockCartItems, 'delivery', mockTenant.deliveryFee)
            expect(total).toBe(101.0) // 93 + 8
        })

        it('deve zerar a taxa de entrega quando o pedido for para Retirada no Balcão (pickup)', () => {
            const fee = calculateDeliveryFee('pickup', mockTenant.deliveryFee)
            expect(fee).toBe(0)

            const total = calculateTotal(mockCartItems, 'pickup', mockTenant.deliveryFee)
            expect(total).toBe(93.0) // 93 + 0
        })
    })

    describe('2. Validação do Formulário de Checkout', () => {
        it('deve invalidar se o nome do cliente estiver em branco', () => {
            const isValid = validateCheckout('', 'pickup', {
                street: 'Rua A',
                number: '123',
                neighborhood: 'Centro',
            })
            expect(isValid).toBe(false)
        })

        it('deve validar pedido de retirada no balcão apenas com o nome preenchido', () => {
            const isValid = validateCheckout('Danilo Gozzi', 'pickup', {
                street: '',
                number: '',
                neighborhood: '',
            })
            expect(isValid).toBe(true)
        })

        it('deve invalidar pedido de delivery se faltar rua, número ou bairro', () => {
            const semRua = validateCheckout('Danilo Gozzi', 'delivery', {
                street: '',
                number: '123',
                neighborhood: 'Centro',
            })
            const semNumero = validateCheckout('Danilo Gozzi', 'delivery', {
                street: 'Rua das Flores',
                number: '',
                neighborhood: 'Centro',
            })
            const semBairro = validateCheckout('Danilo Gozzi', 'delivery', {
                street: 'Rua das Flores',
                number: '123',
                neighborhood: '',
            })

            expect(semRua).toBe(false)
            expect(semNumero).toBe(false)
            expect(semBairro).toBe(false)
        })

        it('deve validar pedido de delivery com todos os campos obrigatórios preenchidos', () => {
            const isValid = validateCheckout('Danilo Gozzi', 'delivery', {
                street: 'Rua das Palmeiras',
                number: '450',
                neighborhood: 'Jardins',
            })
            expect(isValid).toBe(true)
        })
    })

    describe('3. Geração do Payload e Formatação para WhatsApp', () => {
        it('deve gerar a mensagem formatada para Delivery com dados de entrega e opcionais', () => {
            const checkout: CheckoutFormData = {
                deliveryType: 'delivery',
                customerName: 'Danilo Gozzi',
                paymentMethod: 'Pix',
                changeFor: null,
                address: {
                    street: 'Rua das Palmeiras',
                    number: '450',
                    neighborhood: 'Jardins',
                    complement: 'Apto 12',
                },
            }

            const { message, url } = buildWhatsAppPayload(mockTenant, mockCartItems, checkout)

            expect(message).toContain('🍔 *NOVO PEDIDO - HAMBURGUERIA X*')
            expect(message).toContain('*2x* Smash Duplo Bacon')
            expect(message).toContain('Bacon Crocante Extra')
            expect(message).toContain('Queijo Extra')
            expect(message).toContain('Obs: "Caprichar na maionese verde"')
            expect(message).toContain('📍 *DADOS DE ENTREGA:*')
            expect(message).toContain('• Endereço: Rua das Palmeiras, 450')
            expect(message).toContain('• Complemento: Apto 12')
            expect(message).toContain('• Bairro: Jardins')
            expect(message).toContain(`Subtotal: ${formatCurrency(93)}`)
            expect(message).toContain(`Taxa de Entrega: ${formatCurrency(8)}`)
            expect(message).toContain(`*TOTAL: ${formatCurrency(101)}*`)
            expect(url).toContain('https://wa.me/5511999999999?text=')
        })

        it('deve gerar a mensagem formatada para Retirada no Balcão com troco se for Dinheiro', () => {
            const items: CartItem[] = [
                {
                    product: {
                        id: 'p1',
                        name: 'Burger Simples',
                        description: '',
                        price: 25.0,
                        available: true,
                        image: '',
                        optionGroups: [],
                    },
                    quantity: 1,
                    selectedOptions: [],
                    observation: '',
                    unitPrice: 25.0,
                },
            ]

            const checkout: CheckoutFormData = {
                deliveryType: 'pickup',
                customerName: 'Carlos Silva',
                paymentMethod: 'Dinheiro',
                changeFor: 50.0,
                address: {
                    street: '',
                    number: '',
                    neighborhood: '',
                    complement: '',
                },
            }

            const { message } = buildWhatsAppPayload(mockTenant, items, checkout)

            expect(message).toContain('🍔 *NOVO PEDIDO - HAMBURGUERIA X*')
            expect(message).toContain(`*TOTAL (RETIRADA): ${formatCurrency(25)}*`)
            expect(message).toContain('🛍️ *RETIRADA NO BALCÃO:*')
            expect(message).toContain('• Nome: Carlos Silva')
            expect(message).toContain('Dinheiro')
            expect(message).toContain(`Troco para: ${formatCurrency(50)}`)
        })
    })
})
