import { createClient } from '@libsql/client';

export const db = createClient({
  url: 'libsql://pfr-mohansky.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN // Better to use an environment variable
});