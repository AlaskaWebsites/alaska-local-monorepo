import { z } from 'zod'

export const MoneyCentsSchema = z.number().int().nonnegative()

export const CepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')

export const PhoneSchema = z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos')

export const AddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
  zipCode: CepSchema,
})

export type MoneyCents = z.infer<typeof MoneyCentsSchema>
export type Address = z.infer<typeof AddressSchema>
