import { z } from 'zod'

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  CORS_ORIGINS: z.string().default('*'),
  DATABASE_URL: z.string().optional().default('postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional().default('redis://localhost:6379')
})

export type Env = z.infer<typeof EnvSchema>

export function validateEnv(): Env {
  const result = EnvSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Configuração inválida de variáveis de ambiente:', result.error.format())
    throw new Error('Falha na validação das variáveis de ambiente.')
  }

  return result.data
}
