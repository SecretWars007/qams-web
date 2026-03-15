export class TestSuite {
    constructor(
        public id: string,
        public projectId: string,
        public name: string,
        public description: string | null,
        public isActive: boolean,
        public createdAt: Date
    ) {}
}

export interface CreateTestSuite {
    projectId: string;
    name: string;
    description: string | null;
}
