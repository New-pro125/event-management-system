import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { handle } from "i18next-http-middleware";
import { join } from "path";
import { authRouter } from "./features/auth/router";
import { commentRouter } from "./features/comment/router";
import { experienceRouter } from "./features/experience/router";
import { notificationRouter } from "./features/notification/router";
import { tagRouter } from "./features/tag/router";
import { userRouter } from "./features/user/router";
import i18next from "./i18n";
import { createContext, router } from "./trpc";
import { env } from "./utils/env";

const appRouter = router({
  auth: authRouter,
  comments: commentRouter,
  experiences: experienceRouter,
  notifications: notificationRouter,
  tags: tagRouter,
  users: userRouter,
});
export type AppRouter = typeof appRouter;

const app = express();

app.use(cookieParser());

app.use((_req, _res, next) => {
  setTimeout(next, Math.floor(Math.random() * 1000 + 100));
});

app.use(
  cors({
    origin: [env.CLIENT_BASE_URL, "http://localhost:55186"],
    credentials: true,
  }),
);
app.use(handle(i18next));
app.use("/uploads", express.static(join(process.cwd(), "public", "uploads")));

app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(3000, "0.0.0.0");
