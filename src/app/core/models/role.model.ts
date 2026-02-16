// src/app/core/models/role.model.ts
export interface Role {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  code: string;
  description: string;
  module: string;
}

export interface CreateRole {
  name: string;
  description: string | null;
}

export interface AssignPermissions {
  permissionIds: string[];
}
