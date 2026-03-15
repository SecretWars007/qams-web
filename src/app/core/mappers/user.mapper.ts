// src/app/core/mappers/user.mapper.ts
import { UserDto } from '../dto/user.dto';
import { User } from '../models/user.model';

export class UserMapper {
  static fromDto(dto: UserDto): User {
    return new User(
      dto.id,
      dto.username,
      dto.email,
      dto.fullName,
      dto.isActive,
      new Date(dto.createdAt),
      dto.roles || []
    );
  }

  static toDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      roles: user.roles
    };
  }
}
