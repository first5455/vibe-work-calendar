import { Elysia } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { UsersService } from "./users.service";
import { UpdateProfileSchema, SearchUserSchema } from "./users.schema";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get("/me", async ({ user }) => {
    return await UsersService.getProfile(user.sub as string);
  })
  .patch("/me", async ({ user, body }) => {
    return await UsersService.updateProfile(user.sub as string, body);
  }, {
    body: UpdateProfileSchema
  })
  .get("/search", async ({ query }) => {
    return await UsersService.searchUsers(query.q);
  }, {
    query: SearchUserSchema
  });
