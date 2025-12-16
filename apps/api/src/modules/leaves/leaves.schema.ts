import { t } from "elysia";

export const CreateLeaveSchema = t.Object({
  teamId: t.String(),
  type: t.Union([t.Literal("SICK"), t.Literal("VACATION"), t.Literal("PERSONAL")]),
  startDate: t.String(), // YYYY-MM-DD
  endDate: t.String(), // YYYY-MM-DD
  reason: t.Optional(t.String()),
});

export const UpdateLeaveStatusSchema = t.Object({
  status: t.Union([t.Literal("APPROVED"), t.Literal("REJECTED")]),
});

export const UpdateLeaveSchema = t.Object({
  type: t.Optional(t.Union([t.Literal("SICK"), t.Literal("VACATION"), t.Literal("PERSONAL")])),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  reason: t.Optional(t.String()),
});
