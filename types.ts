export enum TestCaseStatus {
  Pending = 'Pending Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum TestCaseType {
  Positive = 'Positive',
  Negative = 'Negative',
  Security = 'Security',
  Compliance = 'Compliance',
  Performance = 'Performance',
}

export interface TestCaseStep {
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: TestCaseType;
  steps: TestCaseStep[];
  status: TestCaseStatus;
  requirementId: string;
}

export interface Requirement {
  id: string;
  text: string;
}

export interface ComplianceCheck {
  id: string;
  control: string;
  description: string;
  status: 'Covered' | 'Not Applicable' | 'Needs Review';
  evidence: string[];
}

export enum Role {
    Admin = 'Admin',
    Tester = 'Tester',
    ComplianceAuditor = 'Compliance Auditor'
}

export interface User {
    id: string;
    username: string;
    role: Role;
}

export type ExportFormat = 'json' | 'gherkin' | 'excel' | 'postman';

export interface AuditLog {
  id: string;
  timestamp: Date;
  username: string;
  role: Role;
  action: string;
  details: string;
}

export enum AIModel {
  Gemini = 'gemini-2.5-flash',
  OpenAI = 'gpt-4-healthcare',
  Lambda = 'lambda-health-qa',
}