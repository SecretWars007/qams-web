// src/app/core/models/api-key.model.ts
// Modelos para API Keys (integración CI/CD)

export interface ApiKey {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  maskedKey: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

/** Solo se retorna al crear — el valor plano no puede recuperarse después */
export interface ApiKeyCreated extends ApiKey {
  plainKey: string;
}

export interface CreateApiKey {
  projectId: string;
  name: string;
  expiresAt?: string;
}
