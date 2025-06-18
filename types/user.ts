// types/user.ts

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
  lastLogin?: string | null; // Changed from Date to string | null
}

export interface UserResponse {
  _id: string;
  email: string;
  name: string;
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
  lastLogin?: string | null; // Changed from Date to string | null
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserResponse;
}

// API Response types
export interface UsersApiResponse {
  success: boolean;
  users: User[];
  count: number;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}