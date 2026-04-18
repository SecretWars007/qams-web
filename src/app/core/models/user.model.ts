export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public fullName: string,
    public isActive: boolean,
    public createdAt: Date,
    public roles: string[],
    public documentoIdentidad: string = '',
    public fechaNacimiento: string = '',
    public isDeleted?: boolean,
    public is_deleted?: boolean
  ) {}
}

export interface CreateUser {
  username: string;
  email: string;
  password: string;
  fullName: string;
  documentoIdentidad: string;
  fechaNacimiento: string; // ISO string o yyyy-MM-dd
  telefono?: string;
  roleIds: string[];
}

export interface UpdateUser {
  email: string;
  fullName: string;
  isActive: boolean;
  documentoIdentidad?: string;
  fechaNacimiento?: string;
  telefono?: string;
  roleIds?: string[];
}
