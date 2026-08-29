import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";
import { buildGraphQLContext } from "./middleware/authContext";
import { uploadRouter } from "./routes/upload";

dotenv.config();

import logger from "./config/logger";
import "./instrument";

/** @type {import('eslint').Linter.Config} */
export default [{ files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] }];

import cors from "cors";
import express from "express";

async function startServer() {
  const app = express();
  const PORT: number = parseInt(process.env.PORT || "3000", 10);

  // Lista de origins permitidos
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "https://social.renzi.dev",
    "https://api-social.renzi.dev",
    "https://studio.apollographql.com",
  ];

  // Middleware CORS personalizado para mayor control
  const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
      // Permitir requests sin origin (curl, postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar si el origen está en la lista blanca
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`Origen no permitido: ${origin}`);
      callback(new Error("No autorizado por CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  };

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.set("trust proxy", 1);

  // Configuración global de Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Servir archivos estáticos subidos
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
