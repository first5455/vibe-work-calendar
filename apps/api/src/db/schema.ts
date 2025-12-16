import { pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  provider: text("provider").notNull(), // 'google', 'github', 'email'
  providerId: text("provider_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  teamId: uuid("team_id").references(() => teams.id).notNull(),
  role: text("role", { enum: ["OWNER", "ADMIN", "MEMBER"] }).notNull().default("MEMBER"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const leaves = pgTable("leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  type: text("type", { enum: ["SICK", "VACATION", "PERSONAL"] }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaveRequestId: uuid("leave_request_id").references(() => leaves.id).notNull(),
  fileKey: text("file_key").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(teamMembers),
  leaves: many(leaves),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  leaves: many(leaves),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const leavesRelations = relations(leaves, ({ one, many }) => ({
  user: one(users, {
    fields: [leaves.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [leaves.teamId],
    references: [teams.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  leave: one(leaves, {
    fields: [attachments.leaveRequestId],
    references: [leaves.id],
  }),
}));
