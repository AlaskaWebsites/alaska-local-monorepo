// tests/unit/reviews.spec.ts
import { describe, it, expect } from 'vitest'
import {
    TenantSchema,
    StoreReviewsSchema,
    type StoreReviews,
} from '~/types/tenant'
import hamburgueriaData from '~/data/hamburgueria-x.json'

describe('StoreReviews & Tenant Schemas (iFood Style)', () => {
    const mockValidReviews: StoreReviews = {
        score: 4.9,
        totalReviews: 486,
        serviceQuality: {
            level: 3,
            experienceLabel: 'Experiência excelente',
            description: 'Alta qualidade e rapidez.',
            badges: [
                { icon: 'star', label: 'Avaliações excelentes', status: 'success' },
                { icon: 'chat-alert', label: 'Poucas reclamações', status: 'warning' },
                { icon: 'check-doc', label: 'Zero cancelamentos', status: 'success' },
            ],
        },
        distribution: {
            5: 88,
            4: 8,
            3: 2,
            2: 1,
            1: 1,
        },
        comments: [
            {
                id: 'rev-1',
                author: 'Aline M.',
                rating: 5,
                date: 'Há 2 dias',
                comment: 'Lanche excelente!',
                itemsOrdered: ['1x Smash Burger Duplo'],
            },
        ],
    }

    it('deve validar um objeto de avaliações completo e correto', () => {
        const result = StoreReviewsSchema.safeParse(mockValidReviews)
        expect(result.success).toBe(true)
    })

    it('deve falhar se a nota média (score) for maior que 5 ou menor que 0', () => {
        const invalidHigh = StoreReviewsSchema.safeParse({
            ...mockValidReviews,
            score: 5.5,
        })
        const invalidLow = StoreReviewsSchema.safeParse({
            ...mockValidReviews,
            score: -1,
        })

        expect(invalidHigh.success).toBe(false)
        expect(invalidLow.success).toBe(false)
    })

    it('deve falhar se o nível de qualidade for fora do range de 1 a 5', () => {
        const invalidLevel = StoreReviewsSchema.safeParse({
            ...mockValidReviews,
            serviceQuality: {
                ...mockValidReviews.serviceQuality,
                level: 6,
            },
        })
        expect(invalidLevel.success).toBe(false)
    })

    it('deve validar o JSON da hamburgueria-x com o novo bloco de reviews', () => {
        const result = TenantSchema.safeParse(hamburgueriaData)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.reviews).toBeDefined()
            expect(result.data.reviews?.score).toBe(4.9)
            expect(result.data.reviews?.comments.length).toBeGreaterThan(0)
        }
    })

    it('deve manter a compatibilidade com estabelecimentos que NÃO possuem reviews', () => {
        const tenantWithoutReviews = {
            slug: 'loja-sem-reviews',
            name: 'Loja Teste',
            phoneWhatsApp: '11999999999',
            categories: [],
        }

        const result = TenantSchema.safeParse(tenantWithoutReviews)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.reviews).toBeUndefined()
        }
    })
})

describe('Regras de Exibição e Distribuição de Avaliações', () => {
    const mockDistribution = { 5: 88, 4: 8, 3: 2, 2: 1, 1: 1 }

    const getDistributionPercentage = (
        distribution: Record<number, number>,
        star: number
    ): number => {
        return distribution[star] ?? 0
    }

    it('deve retornar a porcentagem correta para estrelas existentes', () => {
        expect(getDistributionPercentage(mockDistribution, 5)).toBe(88)
        expect(getDistributionPercentage(mockDistribution, 4)).toBe(8)
        expect(getDistributionPercentage(mockDistribution, 1)).toBe(1)
    })

    it('deve retornar 0 com segurança caso uma estrela não esteja mapeada', () => {
        const emptyDist: Record<number, number> = {}
        expect(getDistributionPercentage(emptyDist, 5)).toBe(0)
    })

    it('deve inverter a ordem dos comentários corretamente ao filtrar por recentes', () => {
        const comments = [
            { id: '1', author: 'Aline', rating: 5, date: 'Há 5 dias', comment: 'Bom' },
            { id: '2', author: 'Bruno', rating: 4, date: 'Há 1 dia', comment: 'Ótimo' },
        ]

        const filterRecent = (list: typeof comments, filter: 'todos' | 'recentes'): typeof comments => {
            return filter === 'recentes' ? [...list].reverse() : list
        }

        const todos = filterRecent(comments, 'todos')
        const recentes = filterRecent(comments, 'recentes')

        expect(todos.map(c => c.id)).toEqual(['1', '2'])
        expect(recentes.map(c => c.id)).toEqual(['2', '1'])
    })
})