
import { GoogleGenAI, Type } from "@google/genai";
import { TestCase, TestCaseStatus, TestCaseType } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const testCaseSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique identifier for the test case (e.g., TC-001).' },
        requirementId: { type: Type.STRING, description: 'The ID of the requirement this test case covers (e.g., REQ-01).' },
        title: { type: Type.STRING, description: 'A concise title for the test case.' },
        description: { type: Type.STRING, description: 'A brief description of the test objective.' },
        type: {
            type: Type.STRING,
            enum: Object.values(TestCaseType),
            description: 'The category of the test case.'
        },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, description: 'The action performed by the user/system.' },
                    expectedResult: { type: Type.STRING, description: 'The expected outcome of the action.' },
                },
                required: ['action', 'expectedResult'],
            }
        },
    },
    required: ['id', 'requirementId', 'title', 'description', 'type', 'steps'],
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        testCases: {
            type: Type.ARRAY,
            description: 'A list of generated test cases.',
            items: testCaseSchema,
        }
    },
    required: ['testCases']
};

export const generateTestCases = async (requirementText: string): Promise<TestCase[]> => {
    if (!process.env.API_KEY) {
        // Mock implementation for development without an API key
        return new Promise(resolve => setTimeout(() => {
            const mockData: TestCase[] = [
                { id: 'TC-001', requirementId: 'REQ-01', title: 'Verify Patient Record Access', description: 'Ensure only authorized users can access patient records.', type: TestCaseType.Security, status: TestCaseStatus.Pending, steps: [{ action: 'Log in as a nurse', expectedResult: 'Patient records are accessible.' }, { action: 'Log in as a receptionist', expectedResult: 'Access to patient records is denied.' }] },
                { id: 'TC-002', requirementId: 'REQ-01', title: 'Successful Patient Search', description: 'Verify that a patient can be found using their unique ID.', type: TestCaseType.Positive, status: TestCaseStatus.Pending, steps: [{ action: 'Enter a valid patient ID in the search bar', expectedResult: 'The correct patient record is displayed.' }] },
                { id: 'TC-003', requirementId: 'REQ-01', title: 'Patient Search with Invalid ID', description: 'Verify behavior when searching for a non-existent patient.', type: TestCaseType.Negative, status: TestCaseStatus.Pending, steps: [{ action: 'Enter an invalid or non-existent patient ID', expectedResult: 'A "Patient not found" message is displayed.' }] },
                { id: 'TC-004', requirementId: 'REQ-01', title: 'Check FHIR Compliance for Patient Resource', description: 'Ensure the patient data structure conforms to FHIR R4 standards.', type: TestCaseType.Compliance, status: TestCaseStatus.Pending, steps: [{ action: 'Retrieve a patient record via API', expectedResult: 'The response JSON validates against the FHIR Patient resource schema.' }] },
            ];
            resolve(mockData);
        }, 1500));
    }
    
    try {
        const prompt = `
            You are an expert QA engineer specializing in healthcare software. Your task is to generate a comprehensive set of test cases based on the following requirement.
            The test cases must cover positive paths, negative paths, security vulnerabilities, and compliance with healthcare standards like HIPAA and FHIR.
            The requirement is: "${requirementText}"
            
            Generate the test cases in the specified JSON format. Ensure all fields are populated correctly. The requirementId should be 'REQ-01'.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        
        // Add the 'status' field, which is not part of the AI generation schema
        return parsed.testCases.map((tc: Omit<TestCase, 'status'>) => ({
            ...tc,
            status: TestCaseStatus.Pending,
        }));

    } catch (error) {
        console.error("Error generating test cases:", error);
        throw new Error("Failed to generate test cases from AI. Please check the requirement or your API key.");
    }
};
