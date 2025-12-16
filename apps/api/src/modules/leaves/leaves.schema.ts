import { t } from "elysia";

export const CreateLeaveSchema = t.Object({
  teamId: t.Optional(t.String()),
  type: t.Union([t.Literal("SICK"), t.Literal("VACATION"), t.Literal("PERSONAL")]),
  startDate: t.String(), // YYYY-MM-DD
  endDate: t.String(), // YYYY-MM-DD
  reason: t.Optional(t.String()),
  attachments: t.Optional(t.Array(t.Object({
      fileKey: t.String(),
      originalName: t.String(),
      mimeType: t.String(),
      fileUrl: t.String()
  })))
});


export const UpdateLeaveSchema = t.Object({
  type: t.Optional(t.Union([t.Literal("SICK"), t.Literal("VACATION"), t.Literal("PERSONAL")])),
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  reason: t.Optional(t.String()),
});
