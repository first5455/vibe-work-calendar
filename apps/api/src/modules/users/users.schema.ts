import { t } from "elysia";

export const UpdateProfileSchema = t.Object({
  displayName: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
});

export const SearchUserSchema = t.Object({
  q: t.String(),
});
