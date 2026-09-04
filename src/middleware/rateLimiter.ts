import { rateLimit } from 'express-rate-limit';

// Configuración de rate limiting para endpoints de autenticación
const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Limite de 20 intentos por ventana
  message: {
    error: 'Demasiados intentos, por favor intente nuevamente en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Configuración más restrictiva para login específico
const loginRateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Solo 5 intentos de login por hora
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intente nuevamente en una hora.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Configuración para registro de usuarios
const registerRateLimitConfig = {
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // Solo 3 registros por día
  message: {
    error: 'Demasiados intentos de registro. Intente nuevamente en 24 horas.',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Middleware de rate limiting para endpoints de autenticación general
export const authRateLimiter = rateLimit(authRateLimitConfig);

// Middleware de rate limiting específico para login
export const loginRateLimiter = rateLimit(loginRateLimitConfig);

// Middleware de rate limiting específico para registro
export const registerRateLimiter = rateLimit(registerRateLimitConfig);

// Middleware para endpoints de recuperación de contraseña (futuro)
export const passwordRecoveryRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 intentos por hora
  message: {
    error: 'Demasiados intentos de recuperación. Intente nuevamente en una hora.',
    code: 'PASSWORD_RECOVERY_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});