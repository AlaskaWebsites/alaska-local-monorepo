// tests/units/cep.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    sanitizeCep,
    isValidCep,
    fetchAddressByCep,
    useCep,
} from '~/composables/useCep'
import { formatCep } from '~/utils/formatters'
import { ViaCepResponseSchema } from '~/types'

describe('Unit: Utilitários e Composable de Consulta de CEP (useCep.ts)', () => {
    describe('1. Sanitização de CEP (sanitizeCep)', () => {
        it('deve remover hífens, pontos e espaços', () => {
            expect(sanitizeCep('07901-020')).toBe('07901020')
            expect(sanitizeCep(' 07.901-020 ')).toBe('07901020')
            expect(sanitizeCep('01001000')).toBe('01001000')
        })

        it('deve lidar com valores vazios ou indefinidos com segurança', () => {
            expect(sanitizeCep('')).toBe('')
            expect(sanitizeCep(undefined)).toBe('')
        })
    })

    describe('2. Validação de CEP (isValidCep)', () => {
        it('deve retornar true para CEPs válidos com 8 dígitos', () => {
            expect(isValidCep('07901-020')).toBe(true)
            expect(isValidCep('01001000')).toBe(true)
            expect(isValidCep('04571-010')).toBe(true)
        })

        it('deve retornar false para CEPs com quantidade incorreta de dígitos', () => {
            expect(isValidCep('123')).toBe(false)
            expect(isValidCep('0790102')).toBe(false) // 7 dígitos
            expect(isValidCep('079010200')).toBe(false) // 9 dígitos
            expect(isValidCep('')).toBe(false)
        })

        it('deve rejeitar sequências inválidas de dígitos repetidos', () => {
            expect(isValidCep('00000000')).toBe(false)
            expect(isValidCep('00000-000')).toBe(false)
            expect(isValidCep('99999999')).toBe(false)
        })
    })

    describe('3. Formatação com Máscara Visual (formatCep)', () => {
        it('deve formatar 8 dígitos no padrão 00000-000', () => {
            expect(formatCep('07901020')).toBe('07901-020')
            expect(formatCep('01001000')).toBe('01001-000')
        })

        it('deve manter valores parciais durante a digitação', () => {
            expect(formatCep('0790')).toBe('0790')
            expect(formatCep('07901')).toBe('07901')
            expect(formatCep('079010')).toBe('07901-0')
        })

        it('deve truncar dígitos excedentes para no máximo 8', () => {
            expect(formatCep('0790102099999')).toBe('07901-020')
        })
    })

    describe('4. Schema Zod do ViaCEP (ViaCepResponseSchema)', () => {
        it('deve validar e parsear resposta de sucesso da API', () => {
            const mockApiData = {
                cep: '07901-020',
                logradouro: 'Rua Virgílio Martins de Oliveira',
                complemento: '',
                bairro: 'Centro',
                localidade: 'Francisco Morato',
                uf: 'SP',
                ibge: '3516309',
                ddd: '11',
            }

            const parsed = ViaCepResponseSchema.parse(mockApiData)
            expect(parsed.cep).toBe('07901-020')
            expect(parsed.logradouro).toBe('Rua Virgílio Martins de Oliveira')
            expect(parsed.bairro).toBe('Centro')
            expect(parsed.localidade).toBe('Francisco Morato')
            expect(parsed.uf).toBe('SP')
            expect(parsed.erro).toBeUndefined()
        })

        it('deve validar resposta com flag de erro { erro: true }', () => {
            const mockErrorData = { erro: true }
            const parsed = ViaCepResponseSchema.parse(mockErrorData)
            expect(parsed.erro).toBe(true)
            expect(parsed.logradouro).toBe('')
        })
    })

    describe('5. Composable Reativo (useCep)', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        it('deve inicializar com loading false e erro nulo', () => {
            const { isLoadingCep, cepError } = useCep()
            expect(isLoadingCep.value).toBe(false)
            expect(cepError.value).toBeNull()
        })

        it('deve retornar erro para CEP com menos de 8 dígitos', async () => {
            const { lookupCep, cepError, isLoadingCep } = useCep()

            const result = await lookupCep('1234')
            expect(result).toBeNull()
            expect(cepError.value).toBe('CEP inválido. Digite 8 números.')
            expect(isLoadingCep.value).toBe(false)
        })

        it('deve retornar null para entrada vazia sem gerar erro', async () => {
            const { lookupCep, cepError } = useCep()

            const result = await lookupCep('')
            expect(result).toBeNull()
            expect(cepError.value).toBeNull()
        })
    })
})
