import { Elysia } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { LeaveService } from "./leaves.service";
import { CreateLeaveSchema, UpdateLeaveSchema } from "./leaves.schema";
import { TeamService } from "../teams/teams.service";

export const leavesController = new Elysia({ prefix: "/leaves" })
  .use(authGuard)
  .post("/", async ({ body, user, set }) => {
      // Check if user is member of the team
      const isMember = await TeamService.isMember(user.sub as string, body.teamId);
      if (!isMember) {
          set.status = 403;
          throw new Error("You must be a member of the team to request leave.");
      }
      return await LeaveService.createLeaveRequest(user.sub as string, body as any);
  }, {
      body: CreateLeaveSchema
  })
  .get("/mine", async ({ user }: any) => {
      console.log("Leaves Controller /mine: user object", user);
      if (!user) throw new Error("User object is undefined in leaves controller");
      return await LeaveService.getUserLeaves(user.sub as string);
  })
  .get("/stats", async ({ user }: any) => {
      return await LeaveService.getStats(user.sub as string);
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
      const canManage = await LeaveService.canApprove(user.sub as string, leave.teamId);

      if (!isCreator && !canManage) {
          set.status = 403;
          throw new Error("Forbidden");
      }

      return await LeaveService.updateLeave(id, body);
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
      const canManage = await LeaveService.canApprove(user.sub as string, leave.teamId);

      if (!isCreator && !canManage) {
          set.status = 403;
          throw new Error("Forbidden");
      }

      return await LeaveService.deleteLeave(id);
  });
