import { Elysia } from "elysia";
import { authController } from "./modules/auth/auth.controller";
import { teamsController } from "./modules/teams/teams.controller";
import { leavesController } from "./modules/leaves/leaves.controller";
import { usersController } from "./modules/users/users.controller";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(authController)
  .use(teamsController)
  .use(leavesController)
  .use(usersController)
  .get("/", () => "Hello Elysia");

export type App = typeof app;

app.listen(3000, () => {
  console.log("🦊 Elysia is running at localhost:3000");
});
