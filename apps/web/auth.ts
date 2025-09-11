// auth.ts
import NextAuth from "next-auth";
import type { GetServerSidePropsContext } from "next/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { prisma } from "./lib/prisma";

export const {
  handlers,
  auth,
  signIn,
  signOut,
}: {
  handlers: any;
  auth: (context?: GetServerSidePropsContext) => Promise<any>;
  signIn: (
    provider: string,
    options?: { redirectTo?: string; email?: string; state?: any },
  ) => Promise<any>;
  signOut: () => Promise<any>;
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});
