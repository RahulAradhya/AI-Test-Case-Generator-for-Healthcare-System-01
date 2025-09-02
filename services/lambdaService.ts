import { TestCase, TestCaseStatus, TestCaseType } from '../types';

// Mock implementation for a hypothetical Lambda healthcare model
export const generateTestCases = async (requirementText: string): Promise<TestCase[]> => {
    console.log(`Generating with mock Lambda Health-QA for: "${requirementText}"`);
    return new Promise(resolve => setTimeout(() => {
        const mockData: TestCase[] = [
            { id: 'TC-LMD-01', requirementId: 'REQ-01', title: 'HIPAA-Compliant Patient Search', description: 'Verify that the patient search functionality adheres to HIPAA privacy rules by logging all data access events.', type: TestCaseType.Compliance, status: TestCaseStatus.Pending, steps: [{ action: 'Perform a patient search as a doctor.', expectedResult: 'An audit log entry is created with the doctor\'s ID, patient ID, and timestamp.' }] },
            { id: 'TC-LMD-02', requirementId: 'REQ-01', title: 'Patient Data Transmission Encryption', description: 'Ensure data transmitted from the server to the client is encrypted using TLS 1.2 or higher.', type: TestCaseType.Security, status: TestCaseStatus.Pending, steps: [{ action: 'Capture network traffic while accessing a patient record.', expectedResult: 'The payload containing PHI is not readable and is transmitted over HTTPS.' }] },
            { id: 'TC-LMD-03', requirementId: 'REQ-01', title: 'User Input Sanitization', description: 'Check that search inputs are sanitized to prevent injection attacks.', type: TestCaseType.Negative, status: TestCaseStatus.Pending, steps: [{ action: 'Enter a patient ID with a script tag, e.g., <script>alert(1)</script>.', expectedResult: 'The input is rejected or sanitized, and no script is executed.' }] },
        ];
        resolve(mockData);
    }, 900));
};
