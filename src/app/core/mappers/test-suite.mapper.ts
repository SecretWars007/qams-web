// src/app/core/mappers/test-suite.mapper.ts
import { TestSuiteDto } from '../dto/test-suite.dto';
import { TestSuite } from '../models/test-suite.model';

export class TestSuiteMapper {
    static fromDto(dto: TestSuiteDto): TestSuite {
        return new TestSuite(
            dto.id,
            dto.projectId,
            dto.name,
            dto.description,
            dto.isActive,
            new Date(dto.createdAt)
        );
    }

    static toDto(suite: TestSuite): TestSuiteDto {
        return {
            id: suite.id,
            projectId: suite.projectId,
            name: suite.name,
            description: suite.description,
            isActive: suite.isActive,
            createdAt: suite.createdAt.toISOString()
        };
    }
}
