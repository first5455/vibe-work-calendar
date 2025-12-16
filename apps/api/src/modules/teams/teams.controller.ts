import { Elysia, t } from "elysia";
import { authGuard } from "../../middlewares/auth";
import { TeamService } from "./teams.service";
import { CreateTeamSchema, AddMemberSchema } from "./teams.schema";

export const teamsController = new Elysia({ prefix: "/teams" })
  .use(authGuard)
  .post("/", async ({ body, user }) => {
    return await TeamService.createTeam(user.sub as string, body);
  }, {
    body: CreateTeamSchema
  })
  .get("/", async ({ user }: any) => {
    console.log("Teams Controller /: user object", user);
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
      // TODO: Check if user is OWNER or ADMIN
      return await TeamService.addMember(id, body.userId, body.role);
  }, {
      body: AddMemberSchema
  })
  .get("/:id/members", async ({ params: { id }, user, set }) => {
      const isMember = await TeamService.isMember(user.sub as string, id);
      if (!isMember) {
          set.status = 403;
          throw new Error("Forbidden");
      }
      return await TeamService.getTeamMembers(id);
  });
