export type LeaveType = "SICK" | "VACATION" | "WFH" | "PERSONAL";

export interface Leave {
  id: string;
  userId: string;
  teamId: string | null;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LeaveWithUser extends Leave {
  user: {
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface LeaveStats {
  totalLeaves: number;
  upcomingLeaves: number;
  leavesThisMonth: number;
}
