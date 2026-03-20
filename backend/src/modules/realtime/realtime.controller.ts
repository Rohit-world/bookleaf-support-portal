import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { addSseClient, removeSseClient } from "../../services/sse.service";

type SseRole = "author" | "admin";

function isSseRole(role: unknown): role is SseRole {
  return role === "author" || role === "admin";
}

export function streamEvents(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing token",
      });
    }

    console.log("SSE token received:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId?: string; role?: string; email?: string };

    console.log("SSE decoded token:", decoded);

    if (!decoded.userId || !isSseRole(decoded.role)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    res.write(`event: connected\n`);
    res.write(
      `data: ${JSON.stringify({
        message: "SSE connected",
        userId: decoded.userId,
        role: decoded.role,
      })}\n\n`
    );

    addSseClient({
      userId: decoded.userId,
      role: decoded.role,
      res,
    });

    const keepAlive = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    }, 25000);

    req.on("close", () => {
      clearInterval(keepAlive);
      removeSseClient(res);
      res.end();
    });
  } catch (error: any) {
    console.error("SSE auth error:", error?.message);

    return res.status(401).json({
      success: false,
      message: error?.message || "Unauthorized",
    });
  }
}
