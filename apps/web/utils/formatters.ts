// utils/formatters.ts

/**
 * Formata um valor numérico para o padrão de moeda brasileira (Real - R$).
 * Ex: 25.5 -> "R$ 25,50"
 */
export function formatCurrency(value?: number): string {
    if (value === undefined || value === null || isNaN(value)) {
        return 'R$ 0,00'
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

/**
 * Formata um número de telefone com DDD (10 ou 11 dígitos) para o padrão visual brasileiro.
 * Ex: "11999998888" -> "(11) 99999-8888"
 */
export function formatPhone(phone?: string): string {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
}

/**
 * Remove todos os caracteres não numéricos de uma string.
 * Ex: "07901-020" -> "07901020"
 */
export function sanitizeDigits(value?: string): string {
    if (!value) return ''
    return value.replace(/\D/g, '')
}

/**
 * Formata um CEP (até 8 dígitos) com máscara visual padrão (00000-000).
 * Ex: "07901020" -> "07901-020"
 */
export function formatCep(cep?: string): string {
    if (!cep) return ''
    const cleaned = sanitizeDigits(cep).slice(0, 8)
    if (cleaned.length > 5) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    }
    return cleaned
}
