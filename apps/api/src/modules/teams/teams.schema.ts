import { t } from "elysia";

export const CreateTeamSchema = t.Object({
  name: t.String(),
  slug: t.String(),
});

export const AddMemberSchema = t.Object({
  userId: t.String(),
  role: t.Union([t.Literal("ADMIN"), t.Literal("MEMBER")]),
});

export const UpdateMemberRoleSchema = t.Object({
  role: t.Union([t.Literal("ADMIN"), t.Literal("MEMBER")]),
});

export const TransferOwnershipSchema = t.Object({
  newOwnerId: t.String(),
});

export const UpdateTeamSchema = t.Object({
    name: t.Optional(t.String()),
    logoUrl: t.Optional(t.String())
});
