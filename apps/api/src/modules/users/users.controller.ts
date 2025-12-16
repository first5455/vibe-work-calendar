import { Elysia } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { UsersService } from "./users.service";
import { UpdateProfileSchema } from "./users.schema";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get("/me", async ({ user }) => {
    return await UsersService.getProfile(user.sub as string);
  })
  .patch("/me", async ({ user, body }) => {
    return await UsersService.updateProfile(user.sub as string, body);
  }, {
    body: UpdateProfileSchema
  });
