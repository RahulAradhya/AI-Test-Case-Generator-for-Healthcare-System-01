import { TestCase, TestCaseStatus, TestCaseType } from '../types';

// Mock implementation for a hypothetical OpenAI healthcare model
export const generateTestCases = async (requirementText: string): Promise<TestCase[]> => {
    console.log(`Generating with mock OpenAI for: "${requirementText}"`);
    return new Promise(resolve => setTimeout(() => {
        const mockData: TestCase[] = [
            { id: 'TC-GPT-01', requirementId: 'REQ-01', title: 'Verify Secure Patient Data Retrieval', description: 'Ensure that searching for a patient via their unique ID returns the correct data only for authenticated clinical staff.', type: TestCaseType.Security, status: TestCaseStatus.Pending, steps: [{ action: 'Log in as a Doctor and search for a valid patient ID.', expectedResult: 'The patient\'s full medical history is displayed.' }, { action: 'Log in as an administrator (non-clinical) and search for the same patient ID.', expectedResult: 'A permission error is shown, and no PHI is visible.' }] },
            { id: 'TC-GPT-02', requirementId: 'REQ-01', title: 'Handle Non-Existent Patient ID Search', description: 'Test the system response when a search is performed for a patient ID that does not exist in the database.', type: TestCaseType.Negative, status: TestCaseStatus.Pending, steps: [{ action: 'Enter a syntactically valid but non-existent patient ID.', expectedResult: 'The system displays a "No patient found" message without suggesting similar IDs.' }] },
        ];
        resolve(mockData);
    }, 1200));
};
