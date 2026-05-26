export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
}

export interface UserMockDbSchema {
  nextUserId: number;
  users: User[];
}
