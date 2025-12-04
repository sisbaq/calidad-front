export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  department: string;
  position: string;
  role: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}
