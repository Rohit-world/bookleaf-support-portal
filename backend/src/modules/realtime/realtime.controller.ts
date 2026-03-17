import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { addSseClient, removeSseClient } from "../../services/sse.service";

export function streamEvents(req: AuthRequest, res: Response) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`event: connected\n`);
  res.write(
    `data: ${JSON.stringify({
      message: "SSE connected",
      userId: user.userId,
      role: user.role,
    })}\n\n`
  );

  addSseClient({
    userId: user.userId,
    role: user.role,
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
}
