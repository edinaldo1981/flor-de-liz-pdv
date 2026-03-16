import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "fallback-secret-change-me";

export interface AuthPayload {
  lojaId: number;
  lojaSlug: string;
  role: "admin" | "colaborador";
  permissions: Record<string, boolean> | null;
}

export interface SuperAdminPayload {
  superAdmin: true;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
      superAdmin?: boolean;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as SuperAdminPayload;
    if (!payload.superAdmin) return res.status(403).json({ error: "Acesso negado" });
    req.superAdmin = true;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function signSuperAdminToken(): string {
  return jwt.sign({ superAdmin: true }, JWT_SECRET, { expiresIn: "8h" });
}
