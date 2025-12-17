import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authController } from "./modules/auth/auth.controller";
import { teamsController } from "./modules/teams/teams.controller";
import { leavesController } from "./modules/leaves/leaves.controller";
import { usersController } from "./modules/users/users.controller";
import { uploadsController } from "./modules/uploads/uploads.controller";
import { UploadService } from "./modules/uploads/uploads.service";

import { WebSocketService } from "./services/ws.service";

const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(swagger())
  .use(authController)
  .use(teamsController)
  .use(leavesController)
  .use(usersController)
  .use(uploadsController)
  .get("/", () => "Hello Elysia");

// Export type for Eden Treaty
export type App = typeof app;

// Runtime extension with WebSocket
const runtimeApp = (app as any)
  .ws("/ws", {
    open(ws: any) {
      ws.subscribe("updates");
    },
    message(ws: any, message: any) {
      if (message === "ping") {
        ws.send("pong");
      }
    }
  });

// Initialize WebSocket Service with publish capability
WebSocketService.setPublish((topic, data) => {
    // runtimeApp.server is available after listen or if we access it via the running instance.
    // We should ensure safely accessing it.
    runtimeApp.server?.publish(topic, JSON.stringify(data));
});

// Initialize MinIO bucket
await UploadService.initializeBucket();

const PORT = process.env.PORT || 3000;
runtimeApp.listen(PORT, () => {
  console.log(`🦊 Elysia is running at :${PORT}`);
});
