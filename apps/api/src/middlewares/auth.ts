import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../config/env";

export const authGuard = (app: Elysia) => app
  .use(
    jwt({
        name: "jwt",
        secret: config.JWT_SECRET,
    })
  )
  .derive(async ({ jwt, cookie: { auth }, set }) => {
    const payload = await jwt.verify(auth.value as string);
    if (!payload) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    return {
      user: payload,
    };
  });
