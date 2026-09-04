/**
 * Opciones estandarizadas para cookies de autenticación.
 * Estas opciones aseguran que las cookies sean seguras y funcionen correctamente
 * en ambos entornos (desarrollo local con HTTP y producción con HTTPS).
 */

export const getAccessTokenCookieOptions = (): import('express').CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutos (coincide con el JWT de acceso)
});

export const getRefreshTokenCookieOptions = (): import('express').CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (coincide con el JWT de refresco)
});