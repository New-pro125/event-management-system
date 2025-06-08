import {
  resolveLanguage,
  translateValidationMessage,
} from "@advanced-react/shared/i18n";
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import { db } from "./database";
import { auth } from "./features/auth";
import { CurrentUser, usersTable } from "./features/auth/models";
import i18next from "./i18n";

// Context available to all procedures
type Context = Awaited<ReturnType<typeof createContext>>;

// Create context for each request
export async function createContext(
  opts: trpcExpress.CreateExpressContextOptions,
) {
  const { language: detectedLanguage } = opts.req as unknown as {
    language?: string;
  };
  const language = resolveLanguage(detectedLanguage);
  const context = {
    req: opts.req,
    res: opts.res,
    user: null as CurrentUser | null,
    accessToken: null as string | null,
    language,
    t: i18next.getFixedT(language),
  };

  // Get authorization header
  const authHeader = opts.req.headers.authorization;

  // If no authorization header, return
  if (!authHeader) {
    return context;
  }

  // Get token from authorization header
  const token = authHeader.split(" ")[1];

  // Verify access token
  const accessTokenPayload = auth.verifyToken(token);

  if (!accessTokenPayload) {
    // Get refresh token from cookies
    const refreshToken = opts.req.cookies["refreshToken"];

    // If no refresh token, return
    if (!refreshToken) {
      return context;
    }

    // Verify refresh token
    const refreshTokenPayload = auth.verifyToken(refreshToken);

    // If refresh token is invalid or no user id, return
    if (!refreshTokenPayload || !refreshTokenPayload.userId) {
      return context;
    }

    // Get user from database
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, refreshTokenPayload.userId),
    });

    // If user not found, return
    if (!user) {
      return context;
    }

    const accessToken = auth.createToken(
      { refreshToken },
      { expiresIn: "15m" },
    );

    context.user = user;
    context.accessToken = accessToken;
  } else {
    // If no refresh token inside access token, return
    if (!accessTokenPayload.refreshToken) {
      return context;
    }

    const refreshTokenPayload = auth.verifyToken(
      accessTokenPayload.refreshToken,
    );

    // If refresh token is invalid or no user id, return
    if (!refreshTokenPayload || !refreshTokenPayload.userId) {
      return context;
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, refreshTokenPayload.userId),
    });

    // If user not found, return
    if (!user) {
      return context;
    }

    context.user = user;
  }

  return context;
}

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, ctx, error } = opts;
    const translate = (key: string) => String(ctx ? ctx.t(key) : key);
    const zodError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        ? error.cause.flatten((issue) =>
            translateValidationMessage(translate, issue.message),
          )
        : null;
    const messages = zodError
      ? [
          ...zodError.formErrors,
          ...Object.values(zodError.fieldErrors).flatMap((m) => m ?? []),
        ]
      : [];
    return {
      ...shape,
      message: messages[0] ?? shape.message,
      data: {
        ...shape.data,
        zodError,
      },
    };
  },
});

// Create protected procedure
const authMiddleware = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ctx.t("errors:notAuthenticated"),
    });
  }

  return next({
    ctx: {
      ...ctx,
      // Ready to be used in procedures
      user: ctx.user as CurrentUser,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
