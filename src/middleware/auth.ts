import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";

type TokenPayload = JwtPayload & {
  id?: string | number;
  email?: string;
};

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "Invalid Authorization format. Use: Bearer <token>" });
  }

  const token = parts[1];
  const secret: Secret = (process.env.JWT_SECRET ?? "default_secret") as Secret;

  try {
    const verified = jwt.verify(token!, secret);
    const payload =
      typeof verified === "string"
        ? JSON.parse(verified)
        : (verified as TokenPayload);

    if (!payload || !payload.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: String(payload.id),
      email: payload.email,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}
