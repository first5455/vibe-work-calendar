import { db } from "../../db";
import { leaves, teamMembers, users } from "../../db/schema";
import { eq, and, sql, gt, lte, gte, inArray } from "drizzle-orm";

export const LeaveService = {
  async createLeaveRequest(userId: string, data: { teamId: string, type: "SICK" | "VACATION" | "PERSONAL", startDate: string, endDate: string, reason?: string }) {
    const [leave] = await db.insert(leaves).values({
      ...data,
      userId,
    }).returning();
    return leave;
  },

  async getTeamLeaves(teamId: string) {
    const results = await db.select({
        leave: leaves,
        user: {
            displayName: users.displayName
        }
    })
    .from(leaves)
    .innerJoin(users, eq(leaves.userId, users.id))
    .where(eq(leaves.teamId, teamId));

    return results.map(({ leave, user }) => ({
        ...leave,
        user
    }));
  },

  async getUserLeaves(userId: string) {
     const results = await db.select({
        leave: leaves,
        user: {
            displayName: users.displayName
        }
    })
    .from(leaves)
    .innerJoin(users, eq(leaves.userId, users.id))
    .where(eq(leaves.userId, userId));

    return results.map(({ leave, user }) => ({
        ...leave,
        user
    }));
  },

  async updateLeaveStatus(leaveId: string, status: "APPROVED" | "REJECTED") {
    const [leave] = await db.update(leaves)
      .set({ status })
      .where(eq(leaves.id, leaveId))
      .returning();
    return leave;
  },

  async updateLeave(id: string, data: { type?: "SICK" | "VACATION" | "PERSONAL", startDate?: string, endDate?: string, reason?: string }) {
      const [leave] = await db.update(leaves)
          .set(data)
          .where(eq(leaves.id, id))
          .returning();
      return leave;
  },

  async deleteLeave(id: string) {
    const [leave] = await db.delete(leaves)
        .where(eq(leaves.id, id))
        .returning();
    return leave;
  },

  async getLeaveById(id: string) {
      const [leave] = await db.select().from(leaves).where(eq(leaves.id, id));
      return leave;
  },

  async getStats(userId: string) {
    const today = new Date();
    
    // Count upcoming leaves for user
    const [upcoming] = await db.select({ count: sql<number>`count(*)` })
        .from(leaves)
        .where(and(
            eq(leaves.userId, userId),
            gt(leaves.startDate, today.toISOString())
        ));

    // Get user's teams
    const userTeams = await db.select({ teamId: teamMembers.teamId }).from(teamMembers).where(eq(teamMembers.userId, userId));
    const teamIds = userTeams.map(t => t.teamId);

    let teamMembersOnLeave = 0;
    
    if (teamIds.length > 0) {
        // Count team members on leave today
        // Note: checks if today is between start and end date
        // Simple logic: start <= today <= end
        // Drizzle/SQL date comparison depends on format, assuming ISO string for simplicity in DB
        const [onLeave] = await db.select({ count: sql<number>`count(*)` })
            .from(leaves)
            .innerJoin(teamMembers, eq(leaves.userId, teamMembers.userId))
            .where(and(
                inArray(teamMembers.teamId, teamIds),
                lte(leaves.startDate, today.toISOString()),
                gte(leaves.endDate, today.toISOString()),
                eq(leaves.status, 'APPROVED')
            ));
        teamMembersOnLeave = Number(onLeave.count);
    }

    return {
        upcomingLeaves: Number(upcoming.count),
        teamMembersOnLeave
    };
  },

  async canApprove(userId: string, teamId: string) {
      const [member] = await db.select().from(teamMembers)
        .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));
      
      return member && (member.role === 'ADMIN' || member.role === 'OWNER');
  }
};
