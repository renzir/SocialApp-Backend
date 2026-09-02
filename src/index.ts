import "dotenv/config"; // 1. Siempre primero
import "./instrument";   // 2. Instrumentación Sentry
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import { buildGraphQLContext } from "./middleware/authContext";
import { uploadRouter } from "./routes/upload";
import logger from "./config/logger";

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
