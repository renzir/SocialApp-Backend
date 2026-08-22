import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../db/database.js";
import { authServices } from "./AuthService.js";

// Hoisted mocks para asegurar que la misma instancia de función sea leída tanto en named como default
const {
  bcryptHashMock,
  bcryptCompareMock,
  jwtSignMock,
  jwtVerifyMock,
  sendVerificationEmailMock,
} = vi.hoisted(() => ({
  bcryptHashMock: vi.fn(),
  bcryptCompareMock: vi.fn(),
  jwtSignMock: vi.fn(),
  jwtVerifyMock: vi.fn(),
  sendVerificationEmailMock: vi.fn(),
}));

vi.mock("./EmailService.js", () => ({
  default: sendVerificationEmailMock,
  sendVerificationEmail: sendVerificationEmailMock,
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: bcryptHashMock,
    compare: bcryptCompareMock,
  },
  hash: bcryptHashMock,
  compare: bcryptCompareMock,
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: jwtSignMock,
    verify: jwtVerifyMock,
  },
  sign: jwtSignMock,
  verify: jwtVerifyMock,
}));

vi.mock("../../db/database.js", () => ({
  default: {
    execute: vi.fn(),
    getConnection: vi.fn(),
  },
}));

const poolExecuteMock = vi.mocked(pool.execute);
const poolGetConnectionMock = vi.mocked(pool.getConnection);

interface MockConnection {
  execute: ReturnType<typeof vi.fn>;
  beginTransaction: ReturnType<typeof vi.fn>;
  commit: ReturnType<typeof vi.fn>;
  rollback: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    process.env.EMAIL_VERIFY_SECRET = "test_verify_secret";
    process.env.ACCESS_TOKEN_SECRET = "test_access_secret";
    process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.EMAIL_VERIFY_SECRET;
    delete process.env.ACCESS_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;
  });

  // =============================================
  // Tests para register
  // =============================================
  describe("register", () => {
    it("debería registrar un nuevo usuario exitosamente", async () => {
      const mockConnection: MockConnection = {
        execute: vi
          .fn()
          .mockResolvedValueOnce([[], {}])
          .mockResolvedValueOnce([{ insertId: 1 }, {}]),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };

      poolGetConnectionMock.mockResolvedValue(mockConnection as any);
      bcryptHashMock.mockResolvedValue("hashed_password" as never);
      jwtSignMock
        .mockReturnValueOnce("access_token")
        .mockReturnValueOnce("refresh_token");
      sendVerificationEmailMock.mockResolvedValue(undefined);

      const result = await authServices.register({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        email_verified: false,
        is_active: true,
      });

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
      expect(sendVerificationEmailMock).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(String),
      );
    });

    it("debería lanzar error si el usuario ya existe", async () => {
      const mockConnection: MockConnection = {
        execute: vi.fn().mockResolvedValueOnce([[{ id: 1 }], {}]),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };

      poolGetConnectionMock.mockResolvedValue(mockConnection as any);

      await expect(
        authServices.register({
          username: "existinguser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(
        "El nombre de usuario o el correo ya están registrados",
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it("debería hacer rollback si falla al insertar", async () => {
      const mockConnection: MockConnection = {
        execute: vi
          .fn()
          .mockResolvedValueOnce([[], {}])
          .mockRejectedValueOnce(new Error("DB error")),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };

      poolGetConnectionMock.mockResolvedValue(mockConnection as any);

      await expect(
        authServices.register({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("DB error");

      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it("debería continuar aunque falle el envío de correo", async () => {
      const mockConnection: MockConnection = {
        execute: vi
          .fn()
          .mockResolvedValueOnce([[], {}])
          .mockResolvedValueOnce([{ insertId: 1 }, {}]),
        beginTransaction: vi.fn(),
        commit: vi.fn(),
        rollback: vi.fn(),
        release: vi.fn(),
      };

      poolGetConnectionMock.mockResolvedValue(mockConnection as any);
      bcryptHashMock.mockResolvedValue("hashed_password" as never);
      sendVerificationEmailMock.mockRejectedValue(new Error("SMTP error"));

      const result = await authServices.register({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toBeDefined();
    });

    it("debería validar los datos con Zod si faltan campos", async () => {
      await expect(
        authServices.register({
          username: "testuser",
          email: "test@example.com",
          password: "123",
        }),
      ).rejects.toThrow();

      await expect(
        authServices.register({
          username: "testuser",
          email: "not-an-email",
          password: "password123",
        }),
      ).rejects.toThrow();
    });
  });

  // =============================================
  // Tests para login
  // =============================================
  describe("login", () => {
    it("debería iniciar sesión exitosamente con username", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashed_password",
        email: "test@example.com",
        is_active: true,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);
      bcryptCompareMock.mockResolvedValue(true as never);
      jwtSignMock
        .mockReturnValueOnce("access_token")
        .mockReturnValueOnce("refresh_token");

      const result = await authServices.login({
        username: "testuser",
        password: "password123",
      });

      expect(result.user.username).toBe("testuser");
      expect(result.user.id).toBe(1);
      expect(result.tokens.accessToken).toBe("access_token");
      expect(result.tokens.refreshToken).toBe("refresh_token");
      expect(bcryptCompareMock).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
      expect((result.user as any).password).toBeUndefined();
    });

    it("debería iniciar sesión exitosamente con email", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashed_password",
        email: "test@example.com",
        is_active: true,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);
      bcryptCompareMock.mockResolvedValue(true as never);
      jwtSignMock
        .mockReturnValueOnce("access_token")
        .mockReturnValueOnce("refresh_token");

      const result = await authServices.login({
        username: "test@example.com",
        password: "password123",
      });

      expect(result.user.email).toBe("test@example.com");
    });

    it("debería lanzar error si el usuario no existe", async () => {
      poolExecuteMock.mockResolvedValueOnce([[], {}] as any);

      await expect(
        authServices.login({
          username: "nonexistent",
          password: "password123",
        }),
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debería lanzar error si la contraseña es incorrecta", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashed_password",
        email: "test@example.com",
        is_active: true,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);
      bcryptCompareMock.mockResolvedValue(false as never);

      await expect(
        authServices.login({
          username: "testuser",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("debería lanzar error si la cuenta está inactiva", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashed_password",
        email: "test@example.com",
        is_active: false,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);
      bcryptCompareMock.mockResolvedValue(true as never);

      await expect(
        authServices.login({
          username: "testuser",
          password: "password123",
        }),
      ).rejects.toThrow("Cuenta suspendida o inactiva");
    });
  });

  // =============================================
  // Tests para findUserById
  // =============================================
  describe("findUserById", () => {
    it("debería encontrar un usuario por ID", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);

      const result = await authServices.findUserById(1);

      expect(result).toEqual(mockUser);
    });

    it("debería devolver null si no se encuentra el usuario", async () => {
      poolExecuteMock.mockResolvedValueOnce([[], {}] as any);

      const result = await authServices.findUserById(999);

      expect(result).toBeNull();
    });
  });

  // =============================================
  // Tests para findUserByUsername
  // =============================================
  describe("findUserByUsername", () => {
    it("debería encontrar un usuario por username", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        email_verified: false,
      };

      poolExecuteMock.mockResolvedValueOnce([[mockUser], {}] as any);

      const result = await authServices.findUserByUsername("testuser");

      expect(result).toEqual(mockUser);
    });

    it("debería devolver null si no se encuentra el usuario", async () => {
      poolExecuteMock.mockResolvedValueOnce([[], {}] as any);

      const result = await authServices.findUserByUsername("nobody");

      expect(result).toBeNull();
    });
  });

  // =============================================
  // Tests para verifyEmail
  // =============================================
  describe("verifyEmail", () => {
    it("debería verificar el email y devolver true si se afectaron filas", async () => {
      poolExecuteMock.mockResolvedValueOnce([{ affectedRows: 1 }, {}] as any);

      const result = await authServices.verifyEmail(1);

      expect(result).toBe(true);
    });

    it("debería devolver false si no se afectaron filas", async () => {
      poolExecuteMock.mockResolvedValueOnce([{ affectedRows: 0 }, {}] as any);

      const result = await authServices.verifyEmail(999);

      expect(result).toBe(false);
    });
  });

  // =============================================
  // Tests para verifyEmailToken
  // =============================================
  describe("verifyEmailToken", () => {
    it("debería verificar el token y devolver true si es válido", async () => {
      const mockToken = "valid.token.here";
      jwtVerifyMock.mockReturnValueOnce({ userid: 1 } as any);
      poolExecuteMock.mockResolvedValueOnce([{ affectedRows: 1 }, {}] as any);

      const result = await authServices.verifyEmailToken(mockToken);

      expect(jwtVerifyMock).toHaveBeenCalledWith(
        mockToken,
        "test_verify_secret",
      );
      expect(result).toBe(true);
    });

    it("debería devolver false si no se afectaron filas tras verificar token", async () => {
      const mockToken = "valid.token.here";
      jwtVerifyMock.mockReturnValueOnce({ userid: 999 } as any);
      poolExecuteMock.mockResolvedValueOnce([{ affectedRows: 0 }, {}] as any);

      const result = await authServices.verifyEmailToken(mockToken);

      expect(result).toBe(false);
    });

    it("debería lanzar error si el token es inválido o ha expirado", async () => {
      jwtVerifyMock.mockImplementationOnce(() => {
        throw new Error("jwt expired");
      });

      await expect(
        authServices.verifyEmailToken("invalid.token"),
      ).rejects.toThrow("El token de verificación es inválido o ha expirado");
    });
  });
});
