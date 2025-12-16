import { t } from "elysia";

export const UpdateProfileSchema = t.Object({
  displayName: t.Optional(t.String()),
});
