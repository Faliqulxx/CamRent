import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  // If it's a remote connection string (Postgres/MySQL/Supabase), use as is
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // On Vercel Serverless environment (AWS Lambda), /var/task is read-only
  // We must copy the bundled database to writable /tmp
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve(process.cwd(), 'prisma/dev.db'),
        path.resolve(process.cwd(), 'dev.db'),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed copying database to /tmp:', e);
          }
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  // Local development: use absolute path to avoid cwd ambiguity
  const localCandidates = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
  ];
  for (const c of localCandidates) {
    if (fs.existsSync(c)) {
      return `file:${c}`;
    }
  }

  return 'file:./dev.db';
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
