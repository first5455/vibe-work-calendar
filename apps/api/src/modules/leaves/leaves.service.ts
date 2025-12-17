import { db } from "../../db";
import { leaves, teamMembers, attachments } from "../../db/schema";
import { eq, and, sql, gt, lte, gte, inArray } from "drizzle-orm";
import { config } from "../../config/env";
import { UploadService } from "../uploads/uploads.service";

export const LeaveService = {
  async createLeaveRequest(userId: string, data: { 
      teamId?: string, 
      type: "SICK" | "VACATION" | "PERSONAL", 
      startDate: string, 
      endDate: string, 
      reason?: string,
      attachments?: { fileKey: string, originalName: string, mimeType: string, fileUrl: string }[] 
  }) {
    const [leave] = await db.insert(leaves).values({
      teamId: data.teamId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      userId,
    }).returning();

    if (data.attachments && data.attachments.length > 0) {
        await db.insert(attachments).values(
            data.attachments.map(att => ({
                leaveRequestId: leave.id,
                fileKey: att.fileKey,
                originalName: att.originalName,
                mimeType: att.mimeType
            }))
        );
    }
    
    return leave;
  },


  async getTeamLeaves(teamId: string) {
    const results = await db.query.leaves.findMany({
        where: eq(leaves.teamId, teamId),
        with: {
            user: {
                columns: {
                    displayName: true,
                    avatarUrl: true
                }
            },
            attachments: true
        }
    });

    return (results as any[]).map(leave => ({
        ...leave,
        attachments: leave.attachments ? leave.attachments.map((att: any) => ({
            ...att,
            fileUrl: `${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${att.fileKey}`
        })) : []
    }));
  },

  async getAllLeaves() {
    const results = await db.query.leaves.findMany({
        orderBy: (leaves, { desc }) => [desc(leaves.startDate)],
        with: {
            user: {
                columns: {
                    displayName: true,
                    avatarUrl: true
                }
            },
            attachments: true
        }
    });

    return (results as any[]).map(leave => ({
        ...leave,
        attachments: leave.attachments ? leave.attachments.map((att: any) => ({
            ...att,
            fileUrl: `${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${att.fileKey}`
        })) : []
    }));
  },

  async getUserLeaves(userId: string) {
     const results = await db.query.leaves.findMany({
        where: eq(leaves.userId, userId),
        with: {
            user: {
                columns: {
                    displayName: true,
                    avatarUrl: true
                }
            },
            attachments: true
        }
     });

    return (results as any[]).map(leave => ({
        ...leave,
        attachments: leave.attachments ? leave.attachments.map((att: any) => ({
            ...att,
            fileUrl: `${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${att.fileKey}`
        })) : []
    }));
  },


  async updateLeave(id: string, data: { type?: "SICK" | "VACATION" | "PERSONAL", startDate?: string, endDate?: string, reason?: string, attachments?: any[] }) {
      await db.transaction(async (tx) => {
          if (data.attachments) {
              // Fetch existing attachments to compare
              const existingAttachments = await tx.select().from(attachments).where(eq(attachments.leaveRequestId, id));
              const newFileKeys = new Set(data.attachments.map(a => a.fileKey));

              // Identify files to delete from MinIO
              const filesToDelete = existingAttachments.filter(att => !newFileKeys.has(att.fileKey));
              for (const file of filesToDelete) {
                  await UploadService.deleteFile(file.fileKey);
              }

              // Replace all attachments in DB
              await tx.delete(attachments).where(eq(attachments.leaveRequestId, id));
              
              if (data.attachments.length > 0) {
                  await tx.insert(attachments).values(
                      data.attachments.map(att => ({
                          leaveRequestId: id,
                          fileKey: att.fileKey,
                          originalName: att.originalName,
                          mimeType: att.mimeType || "application/octet-stream"
                      }))
                  );
              }
          }

          const [updated] = await tx.update(leaves)
              .set({
                  type: data.type,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  reason: data.reason
              })
              .where(eq(leaves.id, id))
              .returning();
          
          return [updated];
      });
      
      // Re-fetch to get complete object with attachments
      const [completeLeave] = await db.query.leaves.findMany({
          where: eq(leaves.id, id),
          with: {
              user: { columns: { displayName: true, avatarUrl: true } },
              attachments: true
          }
      });
      
      // Transform attachments URL
      return {
          ...completeLeave,
          attachments: completeLeave.attachments.map((att: any) => ({
              ...att,
              fileUrl: `${config.MINIO_ENDPOINT}/${config.MINIO_BUCKET}/${att.fileKey}`
          }))
      };
  },

  async deleteLeave(id: string) {
    const existingAttachments = await db.select().from(attachments).where(eq(attachments.leaveRequestId, id));
    
    // Delete files from MinIO
    for (const file of existingAttachments) {
        await UploadService.deleteFile(file.fileKey);
    }
    
    // Attachments will be deleted by CASCADE if configured, but here we might need manual delete if no cascade
    await db.delete(attachments).where(eq(attachments.leaveRequestId, id));

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
                gte(leaves.endDate, today.toISOString())
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
