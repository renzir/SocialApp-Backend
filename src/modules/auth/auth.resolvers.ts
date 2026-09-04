import { GraphQLError } from "graphql";
import {
  emailVerificationSchema,
  loginSchema,
  registerSchema,
} from "../../types/zodSchemas.js";
import { authServices } from "./AuthService.js";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "./cookieOptions.js";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

export const authResolvers = {
  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: RegisterInput },
      _context: any, // Contexto de Apollo/Express
    ) => {
      try {
        const validatedInput = registerSchema.parse(input);
        const user = await authServices.register(validatedInput);
        return {
          success: true,
          message: "Usuario registrado con éxito.",
          user,
        };
      } catch (error: any) {
        throw new GraphQLError(
          error.message || "Error al registrar el usuario",
          {
            extensions: { code: "REGISTER_ERROR" },
          },
        );
      }
    },

    login: async (
      _: unknown,
      { input }: { input: LoginInput },
      context: any,
    ) => {
      try {
        const validatedInput = loginSchema.parse(input);
        const { user, tokens } = await authServices.login(validatedInput);

        if (context.res) {
          context.res.cookie(
            "accessToken",
            tokens.accessToken,
            getAccessTokenCookieOptions(),
          );
          context.res.cookie(
            "refreshToken",
            tokens.refreshToken,
            getRefreshTokenCookieOptions(),
          );
        }

        return {
          success: true,
          message: "Inicio de sesión exitoso",
          user,
          accessToken: tokens.accessToken,
        };
      } catch (error: any) {
        // Registrar el error real en la consola del servidor para depuración
        console.error("❌ Error en login:", error.message, error.stack);

        const message =
          error.errors?.[0]?.message ||
          error.message ||
          "Credenciales inválidas";
        return {
          success: false,
          message,
          user: null,
          accessToken: null,
        };
      }
    },

    refreshToken: async (_: unknown, __: unknown, context: any) => {
      try {
        const oldRefreshToken = context.req?.cookies?.refreshToken;
        if (!oldRefreshToken) {
          return {
            success: false,
            message: "No se proporcionó un refresh token",
            accessToken: null,
          };
        }

        const tokens = await authServices.refreshToken(oldRefreshToken);

        if (context.res) {
          context.res.cookie(
            "accessToken",
            tokens.accessToken,
            getAccessTokenCookieOptions(),
          );
          context.res.cookie(
            "refreshToken",
            tokens.refreshToken,
            getRefreshTokenCookieOptions(),
          );
        }
        return {
          success: true,
          message: "Tokens renovados exitosamente",
          accessToken: tokens.accessToken,
        };
      } catch (error: any) {
        if (context.res) {
          context.res.clearCookie("accessToken", getAccessTokenCookieOptions());
          context.res.clearCookie(
            "refreshToken",
            getRefreshTokenCookieOptions(),
          );
        }
        return {
          success: false,
          message: error.message || "Error al renovar token",
          accessToken: null,
        };
      }
    },

    logout: async (_: unknown, __: unknown, context: any) => {
      const refreshToken = context.req?.cookies?.refreshToken;
      if (refreshToken) {
        await authServices.revokeToken(refreshToken);
      }
      if (context.res) {
        context.res.clearCookie("accessToken", getAccessTokenCookieOptions());
        context.res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
      }
      return {
        success: true,
        message: "Sesión cerrada correctamente",
      };
    },

    verifyEmail: async (
      _: unknown,
      { token }: { token: string },
    ): Promise<{ success: boolean; message: string; user?: any }> => {
      try {
        const { token: validatedToken } = emailVerificationSchema.parse({
          token,
        });
        await authServices.verifyEmailToken(validatedToken);
        return {
          success: true,
          message: "Correo electrónico verificado con éxito.",
        };
      } catch (error: any) {
        const message =
          error.errors?.[0]?.message ||
          error.message ||
          "Error al verificar el correo";
        return {
          success: false,
          message,
        };
      }
    },
  },
};
