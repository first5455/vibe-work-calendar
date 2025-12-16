import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authController } from "./modules/auth/auth.controller";
import { teamsController } from "./modules/teams/teams.controller";
import { leavesController } from "./modules/leaves/leaves.controller";
import { usersController } from "./modules/users/users.controller";
import { uploadsController } from "./modules/uploads/uploads.controller";
import { UploadService } from "./modules/uploads/uploads.service";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(authController)
  .use(teamsController)
  .use(leavesController)
  .use(usersController)
  .use(uploadsController)
  .get("/", () => "Hello Elysia");

export type App = typeof app;

// Initialize MinIO bucket
await UploadService.initializeBucket();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦊 Elysia is running at localhost:${PORT}`);
});
