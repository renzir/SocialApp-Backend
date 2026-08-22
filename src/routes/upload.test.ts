import { Response } from "express";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/authMiddleware";
// Mock de la clave secreta
process.env.ACCESS_TOKEN_SECRET = "testsecretkey";

describe("authMiddleware / requireAuth", () => {
  it("debe retornar status 401 si no hay token", () => {
    const req = {
      headers: {},
      cookies: {},
    } as AuthenticatedRequest;

    const resJson = vi.fn();
    const resStatus = vi.fn().mockReturnValue({ json: resJson });
    const res = { status: resStatus } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(resStatus).toHaveBeenCalledWith(401);
    expect(resJson).toHaveBeenCalledWith({ error: "No autenticado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("debe retornar status 401 si el token es inválido", () => {
    const req = {
      headers: { authorization: "Bearer tokeninvalido" },
      cookies: {},
    } as AuthenticatedRequest;

    const resJson = vi.fn();
    const resStatus = vi.fn().mockReturnValue({ json: resJson });
    const res = { status: resStatus } as unknown as Response;
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(resStatus).toHaveBeenCalledWith(401);
    expect(resJson).toHaveBeenCalledWith({
      error: "Token inválido o expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debe adjuntar usuario y llamar a next() si el token es válido", () => {
    const token = jwt.sign(
      { id: 1, username: "usuarioPrueba" },
      process.env.ACCESS_TOKEN_SECRET!,
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    } as AuthenticatedRequest;

    const res = {} as Response;
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(req.user).toMatchObject({ id: 1, username: "usuarioPrueba" });
    expect(next).toHaveBeenCalled();
  });
});
