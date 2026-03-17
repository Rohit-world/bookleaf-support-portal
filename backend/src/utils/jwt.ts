import jwt from "jsonwebtoken";

interface JwtPayloadInput {
  userId: string;
  email: string;
  role: "author" | "admin";
}

export function generateToken(payload: JwtPayloadInput) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.verify(token, secret) as JwtPayloadInput;
}
