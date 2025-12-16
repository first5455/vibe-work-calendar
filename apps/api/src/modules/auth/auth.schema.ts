import { t } from "elysia";

export const LoginSchema = t.Object({
  email: t.String(),
  password: t.String(),
});

export const RegisterSchema = t.Object({
  email: t.String(),
  password: t.String(),
  displayName: t.String(),
});

export const BuildAuthUrlSchema = t.Object({
  provider: t.Union([t.Literal("google"), t.Literal("github")]),
});

export const CallbackSchema = t.Object({
  code: t.String(),
  state: t.Optional(t.String()),
});
