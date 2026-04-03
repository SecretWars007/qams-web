// src/app/core/dto/user.dto.ts

export interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  documentoIdentidad?: string;
  fechaNacimiento?: string;
}
