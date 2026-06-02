import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return createMockPrisma();
  }
  return new PrismaClient();
}

function createMockPrisma(): PrismaClient {
  const modelHandler: ProxyHandler<object> = {
    get() {
      return (...args: unknown[]) => {
        const opts = args[0] as Record<string, unknown> | undefined;
        return Promise.reject(new Error("No database configured. Set DATABASE_URL in .env"));
      };
    },
  };

  const rootHandler: ProxyHandler<object> = {
    get(_target, prop) {
      if (typeof prop !== "string") return undefined;
      if (["$connect", "$disconnect", "$on", "$use", "$extends", "$transaction"].includes(prop)) {
        return () => Promise.resolve();
      }
      return new Proxy({}, modelHandler);
    },
  };

  return new Proxy({}, rootHandler) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
