import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import { buildGraphQLContext } from "./middleware/authContext";

import CommentRouter from "./modules/comment/CommentRouter.js";
import FriendshipsRouter from "./modules/friendships/FriendshipsRouter.js";
import PostRouter from "./modules/post/PostRouter.js";
import UserRouter from "./modules/user/UserRouter.js";

dotenv.config();

const logger = require("./config/logger.js");
require("./instrument.js");

async function startServer() {
  const app = express();
  const PORT: number = parseInt(process.env.PORT || "3000", 10);

  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://studio.apollographql.com",
  ];

  app.set("trust proxy", 1);

  // Configuración global de Middleware
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Servidor Apollo GraphQL
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  // Endpoint GraphQL
  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: buildGraphQLContext,
    }) as any
  );

  // Routers REST remanentes (a migrar progresivamente)
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
    console.log(`🚀 GraphQL Endpoint disponible en http://localhost:${PORT}/graphql`);
  });
}

startServer();