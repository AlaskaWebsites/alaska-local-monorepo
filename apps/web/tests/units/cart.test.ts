// tests/units/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCart, useCartStore } from '~/composables/useCart'
import type { Product, CartItem } from '~/types'

describe('Unit: Gerenciamento e Persistência de Sacola (useCart & useCartStore)', () => {
    const mockProduct: Product = {
        id: 'p1',
        name: 'Burger Duplo Smash',
        description: 'Dois burgers de 90g com queijo cheddar',
        price: 32.0,
        available: true,
        image: '',
        optionGroups: [],
    }

    const mockItem: CartItem = {
        product: mockProduct,
        quantity: 2,
        selectedOptions: [{ id: 'o1', name: 'Bacon Extra', price: 5.0, maxQuantity: 1 }] as any,
        observation: 'Sem picles',
        unitPrice: 37.0,
    }

    beforeEach(() => {
        setActivePinia(createPinia())
        if (typeof localStorage !== 'undefined') {
            localStorage.clear()
        }
    })

    describe('1. Composable Multi-Tenant (useCart)', () => {
        it('deve gerar storageKey isolada por tenant slug', () => {
            const cartA = useCart('loja-a')
            const cartB = useCart('loja-b')

            expect(cartA.storageKey.value).toBe('alaska_cart_loja-a')
            expect(cartB.storageKey.value).toBe('alaska_cart_loja-b')
        })

        it('deve adicionar item à sacola e recalcular totais', () => {
            const cart = useCart('hamburgueria-x')
            cart.clearCart()

            expect(cart.isEmpty.value).toBe(true)
            expect(cart.totalItemsCount.value).toBe(0)
            expect(cart.cartSubtotal.value).toBe(0)

            cart.addItem(mockItem)

            expect(cart.isEmpty.value).toBe(false)
            expect(cart.totalItemsCount.value).toBe(2)
            expect(cart.cartSubtotal.value).toBe(74.0) // 37.0 * 2
        })

        it('deve atualizar quantidade do item ou remover se quantidade for zero', () => {
            const cart = useCart('hamburgueria-x')
            cart.clearCart()
            cart.addItem({ ...mockItem, quantity: 1 })

            cart.updateItemQuantity(0, 3)
            expect(cart.totalItemsCount.value).toBe(3)

            cart.updateItemQuantity(0, 0)
            expect(cart.totalItemsCount.value).toBe(0)
            expect(cart.isEmpty.value).toBe(true)
        })

        it('deve remover item por índice e limpar sacola', () => {
            const cart = useCart('hamburgueria-x')
            cart.clearCart()

            cart.addItem(mockItem)
            expect(cart.totalItemsCount.value).toBe(2)

            cart.removeItem(0)
            expect(cart.totalItemsCount.value).toBe(0)

            cart.addItem(mockItem)
            cart.clearCart()
            expect(cart.items.value.length).toBe(0)
        })
    })

    describe('2. Pinia Store (useCartStore)', () => {
        it('deve inicializar com estado padrão vazio', () => {
            const store = useCartStore()
            expect(store.items).toEqual([])
            expect(store.totalItems).toBe(0)
            expect(store.subtotal).toBe(0)
            expect(store.total).toBe(0)
        })

        it('deve calcular subtotal e total com taxa de entrega', () => {
            const store = useCartStore()
            store.clearCart()
            store.deliveryFee = 8.0
            store.deliveryType = 'delivery'

            store.addItem(mockItem)

            expect(store.totalItems).toBe(2)
            expect(store.subtotal).toBe(74.0)
            expect(store.total).toBe(82.0) // 74.0 + 8.0
        })

        it('não deve cobrar taxa de entrega se for retirada', () => {
            const store = useCartStore()
            store.clearCart()
            store.deliveryFee = 8.0
            store.deliveryType = 'takeaway'

            store.addItem(mockItem)

            expect(store.total).toBe(74.0)
        })

        it('deve limpar carrinho com clearCart', () => {
            const store = useCartStore()
            store.addItem(mockItem)
            store.customerName = 'Danilo'
            store.clearCart()

            expect(store.items).toEqual([])
            expect(store.customerName).toBe('')
        })
    })
})
