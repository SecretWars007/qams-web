// src/app/core/models/risk.model.ts
export type RiskProbability = 1 | 2 | 3 | 4 | 5; // 1: Muy baja, 5: Muy alta
export type RiskImpact = 1 | 2 | 3 | 4 | 5;      // 1: Insignificante, 5: Catastrófico

export interface ProductRisk {
  id: string;
  projectId: string;
  requirementCode: string;
  requirementTitle: string;
  category: 'Funcional' | 'Seguridad' | 'Rendimiento' | 'Usabilidad' | 'Integración';
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number; // probability * impact (1..25)
  riskLevel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  mitigationStrategy: string;
  associatedTestCasesCount: number;
}
