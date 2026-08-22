
/**
 * Tipos específicos del módulo de autenticación.
 * Estos tipos son detalles internos del servicio y no necesitan
 * ser expuestos en el espacio de nombres global (/types).
 */

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

