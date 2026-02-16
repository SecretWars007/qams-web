// src/app/core/models/catalog.model.ts
export interface CatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateCatalogItem {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}
