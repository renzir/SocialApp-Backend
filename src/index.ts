import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config"; // 1. Siempre primero
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import logger from "./config/logger";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import "./instrument"; // 2. Instrumentación Sentry
import { buildGraphQLContext } from "./middleware/authContext";
import {
  authRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
} from "./middleware/rateLimiter";
import { uploadRouter } from "./routes/upload";

async function startServer() {
  const app = express();
  const PORT: number = parseInt(process.env.PORT || "4001", 10);

  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://studio.apollographql.com",
  ];

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.set("trust proxy", 1);

  // Configuración global de Middleware
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Aplicar rate limiting a todas las rutas GraphQL antes del middleware de Apollo
  app.use("/graphql", (req: Request, _res: Response, next: NextFunction) => {
    // Determinar qué rate limiter aplicar basado en la operación
    const body = req.body;

    if (body?.operationName || body?.query) {
      const query = body.query || "";

      // Aplicar limitadores específicos según el tipo de mutación
      if (
        query.includes("mutation {") &&
        (query.includes("login") || query.includes("Login"))
      ) {
        return loginRateLimiter(req, _res, next);
      }

      if (
        query.includes("mutation {") &&
        (query.includes("register") || query.includes("Register"))
      ) {
        return registerRateLimiter(req, _res, next);
      }
    }

    // Rate limiter por defecto para otras operaciones GraphQL
    return authRateLimiter(req, _res, next);
  });

  app.use("/uploads", express.static(uploadsDir));

  // REST endpoints
  app.use("/api/upload", uploadRouter);

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
    }) as any,
  );

  Sentry.setupExpressErrorHandler(app);

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
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
