import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import AuthRouter from "./features/auth/AuthRouter.js";
import CommentRouter from "./features/comment/CommentRouter.js";
import FriendshipsRouter from "./features/friendships/FriendshipsRouter.js";
import PostRouter from "./features/post/PostRouter.js";
import UserRouter from "./features/user/UserRouter.js";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
dotenv.config();

const logger = require("./config/logger.js");
require("./instrument.js");

async function startServer() {
  const app = express();
  const rawPort = parseInt(process.env.PORT || "3000", 10);
  const PORT: number = isNaN(rawPort) ? 3000 : rawPort;

  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://studio.apollographql.com",
  ];

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.body) {
        req.body = {};
      }
      next();
    },
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({ req, res }),
    }) as any,
  );

  app.use("/auth", AuthRouter);
  app.use("/user", UserRouter);
  app.use("/rels", FriendshipsRouter);
  app.use("/post", PostRouter);
  app.use("/comment", CommentRouter);

  Sentry.setupExpressErrorHandler(app);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error en ${req.path}:`, err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, () => {
    console.log(`Servidor conectado en el puerto ${PORT}`);
    console.log(
      `🚀 GraphQL Endpoint disponible en http://localhost:${PORT}/graphql`,
    );
  });
}

startServer();
