// types/tenant.ts
// Re-exporta integralmente os schemas canônicos e tipos do @alaska/contracts
export * from '@alaska/contracts/tenant'
export * from '@alaska/contracts/catalog'

import type { OptionItem } from '@alaska/contracts/catalog'
import { OptionItemSchema } from '@alaska/contracts/catalog'

// Aliases de conveniência retrocompatíveis para o frontend (Menu, Shop, Hub, Pro)
export type Option = OptionItem
export type ProductOption = OptionItem
export const OptionSchema = OptionItemSchema
