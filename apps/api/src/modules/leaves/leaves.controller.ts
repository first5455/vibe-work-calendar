import { Elysia } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { LeaveService } from "./leaves.service";
import { CreateLeaveSchema, UpdateLeaveSchema } from "./leaves.schema";
import { TeamService } from "../teams/teams.service";

import { WebSocketService } from "../../services/ws.service";

export const leavesController = new Elysia({ prefix: "/leaves" })
  .use(authGuard)
  .post("/", async ({ body, user, set }) => {
      // Check if user is member of the team
      if (body.teamId) {
          const isMember = await TeamService.isMember(user.sub as string, body.teamId);
          if (!isMember) {
              set.status = 403;
              throw new Error("You must be a member of the team to request leave.");
          }
      }
      const leave = await LeaveService.createLeaveRequest(user.sub as string, body as any);
      WebSocketService.broadcast("LEAVE_CREATED", leave);
      return leave;
  }, {
      body: CreateLeaveSchema
  })
  .get("/mine", async ({ user }: any) => {
      if (!user) throw new Error("User object is undefined in leaves controller");
      return await LeaveService.getUserLeaves(user.sub as string);
  })
  .get("/stats", async ({ user }: any) => {
      return await LeaveService.getStats(user.sub as string);
  })
  .get("/all", async () => {
      return await LeaveService.getAllLeaves();
  })
  .get("/team/:teamId", async ({ params: { teamId }, user, set }) => {
       const isMember = await TeamService.isMember(user.sub as string, teamId);
       if (!isMember) {
          set.status = 403;
          throw new Error("Forbidden");
       }
       return await LeaveService.getTeamLeaves(teamId);
  })
  .patch("/:id", async ({ params: { id }, body, user, set }) => {
      const leave = await LeaveService.getLeaveById(id);
      if (!leave) {
          set.status = 404;
          throw new Error("Leave request not found");
      }

      // Allow update if:
      // 1. User is the creator of the request
      // 2. User is Admin/Owner of the team
      const isCreator = leave.userId === user.sub;
      const canManage = leave.teamId ? await LeaveService.canApprove(user.sub as string, leave.teamId) : false;

      if (!isCreator && !canManage) {
          set.status = 403;
          throw new Error("Forbidden");
      }

      const updated = await LeaveService.updateLeave(id, body);
      WebSocketService.broadcast("LEAVE_UPDATED", updated);
      return updated;
  }, {
      body: UpdateLeaveSchema
  })
  .delete("/:id", async ({ params: { id }, user, set }) => {
      const leave = await LeaveService.getLeaveById(id);
      if (!leave) {
          set.status = 404;
          throw new Error("Leave request not found");
      }

      // Allow deletion if:
      // 1. User is the creator of the request
      // 2. User is Admin/Owner of the team
      const isCreator = leave.userId === user.sub;
      const canManage = leave.teamId ? await LeaveService.canApprove(user.sub as string, leave.teamId) : false;

      if (!isCreator && !canManage) {
          set.status = 403;
          throw new Error("Forbidden");
      }

      const deleted = await LeaveService.deleteLeave(id);
      WebSocketService.broadcast("LEAVE_DELETED", { id });
      return deleted;
  });
