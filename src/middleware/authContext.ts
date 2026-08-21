import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface GraphQLContext {
  req: Request;
  res: Response;
  user: { id: number; username: string } | null;
}

export async function buildGraphQLContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> {
  let user: { id: number; username: string } | null = null;

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : req.cookies?.accessToken;

  if (token) {
    try {
      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) {
        throw new Error(
          "La variable de entorno ACCESS_TOKEN_SECRET no está definida",
        );
      }

      const decoded = jwt.verify(token, secret) as {
        id: number;
        username: string;
      };

      user = { id: decoded.id, username: decoded.username };
    } catch (err) {
      // Token inválido o expirado
      user = null;
    }
  }

  return { req, res, user };
}
