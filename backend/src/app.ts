import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./config/swagger";



const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
);

export default app;
