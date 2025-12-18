export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  provider: string;
  providerId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}
