export interface AuthData {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email: string;
    token?: string;
  } | null;
  token: string | null;
}
