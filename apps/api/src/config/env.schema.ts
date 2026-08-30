import { z } from 'zod'

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().optional().default('postgres://alaska:alaskapassword@localhost:5432/alaska_local'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional().default('redis://localhost:6379')
})

export type Env = z.infer<typeof EnvSchema>

export function validateEnv(env: Record<string, unknown> = process.env): Env {
  const parsed = EnvSchema.safeParse(env)
  if (!parsed.success) {
    console.error('❌ Configuração inválida de variáveis de ambiente:', parsed.error.format())
    throw new Error('Falha na validação de variáveis de ambiente.')
  }
  return parsed.data
}
