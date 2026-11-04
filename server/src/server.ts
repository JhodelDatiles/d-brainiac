import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { config } from "./envConfig.ts";
import conn from "./config/db.ts";
import authRoutes from "./routes/auth.routes.ts";
import userRoutes from "./routes/user.routes.ts";
import { requireSameOrigin } from "./middlewares/requireSameOrigin.ts";

const app = express();

// Only needed when deployed behind ONE reverse proxy (Render, Railway, etc.)
// so rate limiting sees real client IPs. Harmless to leave off locally.
if (config.isProduction) app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use("/api", requireSameOrigin);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server's running");
});

// Error handler: must be last, and must have 4 params
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    res.status(400).json({ message: "Invalid JSON" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const startServer = async (): Promise<void> => {
  try {
    await conn();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error(
      "Startup failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};

void startServer();
