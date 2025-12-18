export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Team {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date | string;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: { displayName: string; email: string; avatarUrl: string | null } })[];
}
