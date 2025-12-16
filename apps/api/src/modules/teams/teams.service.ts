import { db } from "../../db";
import { teams, teamMembers, users } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";

export const TeamService = {
  async createTeam(userId: string, data: { name: string; slug: string }) {
    const [team] = await db.insert(teams).values({
      ...data,
      ownerId: userId,
    }).returning();

    await db.insert(teamMembers).values({
      userId,
      teamId: team.id,
      role: "OWNER",
    });

    return team;
  },

  async getUserTeams(userId: string) {
    // Get teams where user is a member
    const userTeams = await db.select({
      team: teams,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId));

    // For each team, get member count and preview members
    const teamsWithCounts = await Promise.all(userTeams.map(async (t) => {
        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(teamMembers)
            .where(eq(teamMembers.teamId, t.team.id));
            
        const members = await db.select({
            id: users.id,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl
        })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(eq(teamMembers.teamId, t.team.id))
        .limit(3);

        return {
            ...t.team,
            role: t.role,
            memberCount: Number(countResult.count),
            members
        };
    }));

    return teamsWithCounts;
  },

  async getTeamById(teamId: string) {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    return team;
  },

  async addMember(teamId: string, userId: string, role: "ADMIN" | "MEMBER") {
      const [member] = await db.insert(teamMembers).values({
          teamId,
          userId,
          role
      }).returning();
      return member;
  },
  
  async isMember(userId: string, teamId: string) {
      const [member] = await db.select().from(teamMembers)
        .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));
      return !!member;
  },

  async getTeamMembers(teamId: string) {
      return await db.select({
          id: users.id,
          name: users.displayName,
          email: users.email,
          avatarUrl: users.avatarUrl,
          role: teamMembers.role,
          joinedAt: teamMembers.joinedAt
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
  }
};
