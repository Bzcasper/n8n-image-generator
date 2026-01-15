import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './schema.prisma',
  database: {
    url: process.env.DATABASE_URL,
  },
  generator: {
    client: {
      provider: 'prisma-client-js',
    },
  },
})