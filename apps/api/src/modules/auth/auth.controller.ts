import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { BuildAuthUrlSchema, CallbackSchema } from "./auth.schema";
import { config } from "../../config/env";

export const authController = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: config.JWT_SECRET,
    })
  )
  .get("/login/:provider", ({ params: { provider } }) => {
     if (provider === 'google') {
          return Response.redirect(AuthService.getGoogleAuthUrl());
     }
     if (provider === 'github') {
          return Response.redirect(AuthService.getGithubAuthUrl());
     }
     return new Response("Invalid provider", { status: 400 });
  }, {
      params: BuildAuthUrlSchema
  })
  .get("/me", async ({ jwt, cookie: { auth }, set }) => {
      if (!auth || !auth.value) {
          set.status = 401;
          return "Unauthorized";
      }
      const profile = await jwt.verify(auth.value as string);
      if (!profile) {
          set.status = 401;
          return "Unauthorized";
      }
      return profile;
  })
  .post("/logout", ({ cookie: { auth } }) => {
      auth.remove();
      return { success: true };
  })
  .get("/callback/:provider", async ({ params: { provider }, query: { code }, jwt, cookie: { auth } }) => {
      if (!code) {
          return new Response("No code provided", { status: 400 });
      }

      let email = "";
      let displayName = "";
      let avatarUrl = "";

      try {
          if (provider === 'google') {
              const tokens = await AuthService.exchangeGoogleCode(code);
              const userProfile = await AuthService.getGoogleUser(tokens.access_token);
              email = userProfile.email;
              displayName = userProfile.name;
              avatarUrl = userProfile.picture;
          } else if (provider === 'github') {
              const tokens = await AuthService.exchangeGithubCode(code);
              const userProfile = await AuthService.getGithubUser(tokens.access_token);
              email = userProfile.email;
              displayName = userProfile.name || userProfile.login;
              avatarUrl = userProfile.avatar_url;
          } else {
              return new Response("Invalid provider", { status: 400 });
          }
      } catch (error) {
          console.error("OAuth Error:", error);
          return new Response("Authentication failed", { status: 500 });
      }

      let user = await AuthService.validateUser(email);
      
      if (!user) {
          user = await AuthService.createUser({
              email,
              displayName,
              provider,
              avatarUrl
          });
      }

      const token = await jwt.sign({
          sub: user.id,
          id: user.id,
          name: user.displayName,
          email: user.email,
      });

      auth.set({
          value: token as string,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', 
          path: "/",
          sameSite: "lax",
      });

      return Response.redirect("http://localhost:5173/dashboard");
  }, {
      query: CallbackSchema
  });
