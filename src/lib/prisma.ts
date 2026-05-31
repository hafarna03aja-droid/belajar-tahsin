// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Prisma 7 generated client
import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  // Strip the "file:" prefix, then resolve to an absolute path
  // to avoid CWD-dependent issues in Next.js server environment.
  // Prisma 7 adapter-better-sqlite3 accepts { url: string } directly.
  const relativePath = url.replace(/^file:/, "");
  const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
