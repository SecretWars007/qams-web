// src/app/core/models/user.model.ts
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface CreateUser {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleIds: string[];
}

export interface UpdateUser {
  email: string;
  fullName: string;
  isActive: boolean;
  roleIds: string[];
}
