import jwt from "jsonwebtoken";

export function generateEmailVerifyToken(userid: number): string {
  const secret = process.env.EMAIL_VERIFY_SECRET || "default_verify_secret";
  return jwt.sign({ userid }, secret, {
    expiresIn: "15m",
  });
}

export function verifyEmailToken(token: string): { userid: number } {
  const secret = process.env.EMAIL_VERIFY_SECRET || "default_verify_secret";
  return jwt.verify(token, secret) as { userid: number };
}
