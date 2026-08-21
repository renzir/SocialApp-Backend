import { beforeEach, describe, expect, it, vi } from "vitest";
import { authResolvers } from "./auth.resolvers.js";
import { authServices } from "./AuthService.js";

vi.mock("./AuthService.js", () => ({
  authServices: {
    register: vi.fn(),
    login: vi.fn(),
    verifyEmailToken: vi.fn(),
    refreshToken: vi.fn(),
    revokeToken: vi.fn(),
  },
}));

const registerMock = vi.mocked(authServices.register);
const loginMock = vi.mocked(authServices.login);
const verifyEmailTokenMock = vi.mocked(authServices.verifyEmailToken);

describe("authResolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // Mutation: register
  // =============================================
  describe("Mutation.register", () => {
    it("debería registrar un usuario con éxito", async () => {
      const mockInput = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        email_verified: false,
        is_active: true,
      };

      registerMock.mockResolvedValueOnce(mockUser);

      const result = await authResolvers.Mutation.register(
        {},
        { input: mockInput },
        {},
      );

      expect(registerMock).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual({
        success: true,
        message: "Usuario registrado con éxito.",
        user: mockUser,
      });
    });

    it("debería retornar un objeto de error si falla el registro", async () => {
      registerMock.mockRejectedValueOnce(
        new Error("El nombre de usuario o el correo ya están registrados"),
      );

      const result = await authResolvers.Mutation.register(
        {},
        {
          input: {
            username: "existinguser",
            email: "test@example.com",
            password: "password123",
          },
        },
        {},
      );

      expect(result).toEqual({
        success: false,
        message: "El nombre de usuario o el correo ya están registrados",
        user: null,
      });
    });

    it("debería usar el mensaje de error por defecto si el error no tiene mensaje", async () => {
      registerMock.mockRejectedValueOnce({});

      const result = await authResolvers.Mutation.register(
        {},
        {
          input: {
            username: "user",
            email: "test@example.com",
            password: "password123",
          },
        },
        {},
      );

      expect(result).toEqual({
        success: false,
        message: "Error al registrar el usuario",
        user: null,
      });
    });
  });

  // =============================================
  // Mutation: login
  // =============================================
  describe("Mutation.login", () => {
    it("debería iniciar sesión y configurar cookies en la respuesta", async () => {
      const mockInput = {
        username: "testuser",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      const mockTokens = {
        accessToken: "access_token_123",
        refreshToken: "refresh_token_123",
      };

      loginMock.mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      });

      const mockRes = {
        cookie: vi.fn(),
      };

      const result = await authResolvers.Mutation.login(
        {},
        { input: mockInput },
        { res: mockRes },
      );

      expect(loginMock).toHaveBeenCalledWith(mockInput);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access_token_123",
        {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh_token_123",
        {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        },
      );

      expect(result).toEqual({
        success: true,
        message: "Inicio de sesión exitoso",
        user: mockUser,
        accessToken: "access_token_123",
      });
    });

    it("debería iniciar sesión sin error cuando res no está en el contexto", async () => {
      const mockInput = {
        username: "testuser",
        password: "password123",
      };

      loginMock.mockResolvedValueOnce({
        user: { id: 1, username: "testuser", email: "test@example.com" },
        tokens: {
          accessToken: "access_token_123",
          refreshToken: "refresh_token_123",
        },
      });

      const result = await authResolvers.Mutation.login(
        {},
        { input: mockInput },
        {}, // contexto sin res
      );

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("access_token_123");
    });

    it("debería retornar respuesta fallida si las credenciales son inválidas", async () => {
      loginMock.mockRejectedValueOnce(new Error("Credenciales inválidas"));

      const result = await authResolvers.Mutation.login(
        {},
        { input: { username: "wrong", password: "wrong" } },
        {},
      );

      expect(result).toEqual({
        success: false,
        message: "Credenciales inválidas",
        user: null,
        accessToken: null,
      });
    });

    it("debería retornar mensaje por defecto si ocurre un error sin mensaje", async () => {
      loginMock.mockRejectedValueOnce({});

      const result = await authResolvers.Mutation.login(
        {},
        { input: { username: "user", password: "pwd" } },
        {},
      );

      expect(result).toEqual({
        success: false,
        message: "Credenciales inválidas",
        user: null,
        accessToken: null,
      });
    });
  });

  // =============================================
  // Mutation: logout
  // =============================================
  describe("Mutation.logout", () => {
    it("debería revocar token y limpiar las cookies cuando res está presente", async () => {
      const mockRes = {
        clearCookie: vi.fn(),
      };
      const mockReq = {
        cookies: { refreshToken: "test_refresh_token" },
      };

      const result = await authResolvers.Mutation.logout(
        {},
        {},
        { req: mockReq, res: mockRes },
      );

      expect(authServices.revokeToken).toHaveBeenCalledWith(
        "test_refresh_token",
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(mockRes.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(result).toEqual({
        success: true,
        message: "Sesión cerrada correctamente",
      });
    });

    it("debería funcionar correctamente sin error cuando res no está presente", async () => {
      const result = await authResolvers.Mutation.logout({}, {}, {});
      expect(result).toEqual({
        success: true,
        message: "Sesión cerrada correctamente",
      });
    });
  });

  // =============================================
  // Mutation: refreshToken
  // =============================================
  describe("Mutation.refreshToken", () => {
    it("debería renovar los tokens exitosamente", async () => {
      const mockReq = { cookies: { refreshToken: "old_refresh_token" } };
      const mockRes = { cookie: vi.fn() };
      vi.mocked(authServices.refreshToken).mockResolvedValueOnce({
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
      });

      const result = await authResolvers.Mutation.refreshToken(
        {},
        {},
        { req: mockReq, res: mockRes },
      );

      expect(authServices.refreshToken).toHaveBeenCalledWith(
        "old_refresh_token",
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new_access_token",
        expect.any(Object),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new_refresh_token",
        expect.any(Object),
      );
      expect(result).toEqual({
        success: true,
        message: "Tokens renovados exitosamente",
        accessToken: "new_access_token",
      });
    });

    it("debería fallar si no hay refreshToken en cookies", async () => {
      const result = await authResolvers.Mutation.refreshToken(
        {},
        {},
        { req: { cookies: {} } },
      );

      expect(result).toEqual({
        success: false,
        message: "No se proporcionó un refresh token",
        accessToken: null,
      });
    });
  });

  // =============================================
  // Mutation: verifyEmail
  // =============================================
  describe("Mutation.verifyEmail", () => {
    it("debería verificar el correo exitosamente", async () => {
      verifyEmailTokenMock.mockResolvedValueOnce(true);

      const result = await authResolvers.Mutation.verifyEmail(
        {},
        { token: "valid_token" },
      );

      expect(verifyEmailTokenMock).toHaveBeenCalledWith("valid_token");
      expect(result).toEqual({
        success: true,
        message: "Correo electrónico verificado con éxito.",
      });
    });

    it("debería retornar respuesta fallida si el token es inválido", async () => {
      verifyEmailTokenMock.mockRejectedValueOnce(
        new Error("El token de verificación es inválido o ha expirado"),
      );

      const result = await authResolvers.Mutation.verifyEmail(
        {},
        { token: "invalid_token" },
      );

      expect(result).toEqual({
        success: false,
        message: "El token de verificación es inválido o ha expirado",
      });
    });

    it("debería retornar mensaje por defecto si el error no tiene mensaje", async () => {
      verifyEmailTokenMock.mockRejectedValueOnce({});

      const result = await authResolvers.Mutation.verifyEmail(
        {},
        { token: "some_token" },
      );

      expect(result).toEqual({
        success: false,
        message: "Error al verificar el correo",
      });
    });
  });
});
