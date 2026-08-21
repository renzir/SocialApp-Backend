import jwt from "jsonwebtoken";

export function generateEmailVerifyToken(userid: number): string {
  const secret = process.env.EMAIL_VERIFY_SECRET;
  if (!secret) {
    throw new Error(
      "La variable de entorno EMAIL_VERIFY_SECRET no está definida",
    );
  }

  return jwt.sign({ userid }, secret, {
    expiresIn: "15m",
  });
}

export function verifyEmailToken(token: string): { userid: number } {
  const secret = process.env.EMAIL_VERIFY_SECRET;
  if (!secret) {
    throw new Error(
      "La variable de entorno EMAIL_VERIFY_SECRET no está definida",
    );
  }

  return jwt.verify(token, secret) as { userid: number };
}
