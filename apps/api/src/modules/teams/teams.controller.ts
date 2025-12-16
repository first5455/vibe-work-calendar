import { Elysia } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { TeamService } from "./teams.service";
import { CreateTeamSchema, AddMemberSchema, UpdateMemberRoleSchema, TransferOwnershipSchema, UpdateTeamSchema } from "./teams.schema";

export const teamsController = new Elysia({ prefix: "/teams" })
  .use(authGuard)
  .post("/", async ({ body, user }) => {
    return await TeamService.createTeam(user.sub as string, body);
  }, {
    body: CreateTeamSchema
  })
  .get("/", async ({ user }: any) => {
    if (!user) {
        console.error("Teams Controller /: USER IS UNDEFINED");
        throw new Error("User context missing in teams controller");
    }
    return await TeamService.getUserTeams(user.sub as string);
  })
  .get("/:id", async ({ params: { id }, user, set }) => {
      const isMember = await TeamService.isMember(user.sub as string, id);
      if (!isMember) {
          set.status = 403;
          throw new Error("Forbidden");
      }
      return await TeamService.getTeamById(id);
  })
  .post("/:id/members", async ({ params: { id }, body, user, set }) => {
      const role = await TeamService.getMemberRole(user.sub as string, id);
      if (role !== "OWNER" && role !== "ADMIN") {
          set.status = 403;
          throw new Error("Only owner or admin can add members");
      }
      return await TeamService.addMember(id, body.userId, body.role);
  }, {
      body: AddMemberSchema
  })
  .patch("/:id", async ({ params: { id }, body, user, set }) => {
      const role = await TeamService.getMemberRole(user.sub as string, id);
      if (role !== "OWNER" && role !== "ADMIN") {
          set.status = 403;
          throw new Error("Only owner or admin can update team settings");
      }
      return await TeamService.updateTeam(id, body);
  }, {
      body: UpdateTeamSchema
  })
  .get("/:id/members", async ({ params: { id }, user, set }) => {
      const isMember = await TeamService.isMember(user.sub as string, id);
      if (!isMember) {
          set.status = 403;
          throw new Error("Forbidden");
      }
      return await TeamService.getTeamMembers(id);
  })
  .patch("/:id/members/:userId", async ({ params: { id, userId }, body, user, set }) => {
      const currentUserRole = await TeamService.getMemberRole(user.sub as string, id);
      if (currentUserRole !== "OWNER" && currentUserRole !== "ADMIN") {
          set.status = 403;
          throw new Error("Forbidden");
      }
      // Prevent Admin from changing Owner
      const targetUserRole = await TeamService.getMemberRole(userId, id);
      if (targetUserRole === "OWNER") {
          set.status = 403;
          throw new Error("Cannot modify team owner");
      }

      return await TeamService.updateMemberRole(id, userId, body.role);
  }, {
      body: UpdateMemberRoleSchema
  })
  .delete("/:id/members/:userId", async ({ params: { id, userId }, user, set }) => {
      const currentUserRole = await TeamService.getMemberRole(user.sub as string, id);
      if (currentUserRole !== "OWNER" && currentUserRole !== "ADMIN") {
          set.status = 403;
          throw new Error("Forbidden");
      }
      
      const targetUserRole = await TeamService.getMemberRole(userId, id);
      if (targetUserRole === "OWNER") {
          set.status = 403;
          throw new Error("Cannot remove team owner");
      }
      if (currentUserRole === "ADMIN" && targetUserRole === "ADMIN") {
          set.status = 403;
          throw new Error("Admins cannot remove other admins");
      }

      return await TeamService.removeMember(id, userId);
  })
  .post("/:id/transfer", async ({ params: { id }, body, user, set }) => {
      const currentUserRole = await TeamService.getMemberRole(user.sub as string, id);
      if (currentUserRole !== "OWNER") {
          set.status = 403;
          throw new Error("Only owner can transfer ownership");
      }
      return await TeamService.transferOwnership(id, user.sub as string, body.newOwnerId);
  }, {
      body: TransferOwnershipSchema
  });
