export interface AuthUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
  username: string;
  timezone: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
