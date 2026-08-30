// composables/useCep.ts
import { ref } from 'vue'
import { ViaCepResponseSchema, type ViaCepResponse } from '~/types'
import { sanitizeDigits, formatCep } from '~/utils/formatters'

export interface ParsedAddress {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  raw: ViaCepResponse
}

/**
 * Remove caracteres não numéricos do CEP.
 */
export function sanitizeCep(rawCep?: string): string {
  return sanitizeDigits(rawCep)
}

/**
 * Valida se a string possui exatamente 8 dígitos numéricos válidos.
 */
export function isValidCep(cep?: string): boolean {
  const clean = sanitizeCep(cep)
  if (clean.length !== 8) return false
  // Rejeita sequências repetidas como 00000000 ou 99999999
  if (/^(\d)\1{7}$/.test(clean)) return false
  return true
}

/**
 * Consulta a API pública do ViaCEP e valida o payload com Zod (fail-fast).
 */
export async function fetchAddressByCep(rawCep: string): Promise<ParsedAddress | null> {
  const clean = sanitizeCep(rawCep)
  if (!isValidCep(clean)) return null

  try {
    const response = await $fetch<unknown>(`https://viacep.com.br/ws/${clean}/json/`, {
      retry: 1,
      timeout: 6000
    })

    const parsed = ViaCepResponseSchema.parse(response)

    // ViaCEP retorna { erro: true } ou { erro: "true" } quando o CEP não é encontrado
    if (parsed.erro === true || parsed.erro === 'true') {
      return null
    }

    return {
      cep: formatCep(parsed.cep || clean),
      street: parsed.logradouro || '',
      neighborhood: parsed.bairro || '',
      city: parsed.localidade || '',
      state: parsed.uf || '',
      raw: parsed
    }
  } catch (e) {
    console.error('Erro ao consultar ViaCEP:', e)
    return null
  }
}

/**
 * Composable Reativo para consulta de CEP com estado de loading e mensagens de erro
 */
export function useCep() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAddress(rawCep: string): Promise<ParsedAddress | null> {
    error.value = null
    const clean = sanitizeCep(rawCep)

    if (!clean) {
      return null
    }

    if (!isValidCep(clean)) {
      error.value = 'CEP inválido. Digite 8 números.'
      return null
    }

    isLoading.value = true

    try {
      const address = await fetchAddressByCep(clean)
      if (!address) {
        error.value = 'CEP não encontrado.'
        return null
      }
      return address
    } catch (e) {
      error.value = 'Erro ao buscar CEP. Preencha manualmente.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Aliases para máxima compatibilidade entre componentes
  const isLoadingCep = isLoading
  const cepError = error
  const lookupCep = fetchAddress

  return {
    isLoading,
    error,
    isLoadingCep,
    cepError,
    fetchAddress,
    lookupCep,
    sanitizeCep,
    isValidCep,
    formatCep,
    fetchAddressByCep
  }
}
