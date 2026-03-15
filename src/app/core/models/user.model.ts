export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public fullName: string,
    public isActive: boolean,
    public createdAt: Date,
    public roles: string[]
  ) {}
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
