import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const UsersService = {
  async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  },

  async updateProfile(userId: string, data: { displayName?: string }) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },
};
