// src/app/core/dto/catalog.dto.ts

export interface CreateCatalogItemDto {
  name: string;
  description?: string;
  isActive: boolean;
}
