import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, or, ilike } from "drizzle-orm";
import { UploadService } from "../uploads/uploads.service";

export const UsersService = {
  async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  },


// ...

  async updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string }) {
    // If updating avatar, check if we need to clean up the old one
    if (data.avatarUrl) {
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      if (currentUser && currentUser.avatarUrl && currentUser.avatarUrl !== data.avatarUrl) {
        // Only delete if it matches our upload pattern (file stored in bucket)
        if (currentUser.avatarUrl.includes("/vibe-uploads/")) {
             await UploadService.deleteFile(currentUser.avatarUrl);
        }
      }
    }

    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },

  async searchUsers(query: string) {
    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        or(
          ilike(users.displayName, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
      )
      .limit(10);
    return results;
  },
};
