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
    console.log("Auth Guard: Checking cookie");
    if (!auth || !auth.value) {
      console.log("Auth Guard: No cookie value");
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const payload = await jwt.verify(auth.value as string);
    if (!payload) {
      console.log("Auth Guard: Invalid payload");
      set.status = 401;
      throw new Error("Unauthorized");
    }

    console.log("Auth Guard: Success", payload);
    return {
      user: payload,
    };
  });
