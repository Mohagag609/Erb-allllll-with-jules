import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // Handle missing DATABASE_URL during build time
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found. Using mock client for build time.');
    // Return a mock client that throws meaningful errors
    return {
      $connect: () => Promise.reject(new Error('Database not configured')),
      $disconnect: () => Promise.resolve(),
      $transaction: () => Promise.reject(new Error('Database not configured')),
    } as any;
  }
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
