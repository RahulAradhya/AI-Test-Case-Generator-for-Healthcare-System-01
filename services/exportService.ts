import { Requirement, TestCase } from "../types";
import { ExportFormat } from '../types';

// Let TypeScript know that XLSX is a global variable from the script tag
declare var XLSX: any;

// Utility to trigger file download in the browser
const downloadFile = (content: string | ArrayBuffer, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};

const convertToGherkin = (testCases: TestCase[], requirement: Requirement): string => {
    let gherkinContent = `Feature: ${requirement.text}\n\n`;

    testCases.forEach(tc => {
        gherkinContent += `  @${tc.type.toLowerCase()}\n`;
        gherkinContent += `  Scenario: ${tc.id} - ${tc.title}\n`;
        if (tc.description) {
            const descriptionLines = tc.description.split('\n').map(line => `    # ${line}`).join('\n');
            gherkinContent += `${descriptionLines}\n`;
        }
        
        tc.steps.forEach((step, index) => {
            const actionKeyword = index === 0 ? 'When' : 'And';
            gherkinContent += `    ${actionKeyword} ${step.action}\n`;
            gherkinContent += `    Then ${step.expectedResult}\n`;
        });

        gherkinContent += '\n';
    });

    return gherkinContent;
};

const convertToJson = (testCases: TestCase[]): string => {
    return JSON.stringify(testCases, null, 2);
}

const convertToExcel = (testCases: TestCase[]): ArrayBuffer => {
    const flattenedData = testCases.flatMap(tc => 
        tc.steps.map((step, index) => ({
            'Test Case ID': tc.id,
            'Title': tc.title,
            'Description': tc.description,
            'Type': tc.type,
            'Status': tc.status,
            'Requirement ID': tc.requirementId,
            'Step': index + 1,
            'Action': step.action,
            'Expected Result': step.expectedResult,
        }))
    );

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');
    
    // Set column widths for better readability
    worksheet['!cols'] = [
        { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 15 }, 
        { wch: 15 }, { wch: 15 }, { wch: 5 }, { wch: 60 }, { wch: 60 }
    ];

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

const convertToPostman = (testCases: TestCase[], requirement: Requirement): string => {
    const collection = {
        info: {
            _postman_id: crypto.randomUUID(),
            name: `Test Cases for: ${requirement.id}`,
            description: requirement.text,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: testCases.map(tc => ({
            name: `${tc.id}: ${tc.title}`,
            request: {
                method: 'GET', // Placeholder method
                header: [],
                url: {
                    raw: `{{baseUrl}}/change-me`,
                    host: ['{{baseUrl}}'],
                    path: ['change-me']
                },
                description: `**Test Case Description:**\n${tc.description}\n\n**Type:** ${tc.type}\n\n**Steps:**\n\n` + 
                             tc.steps.map((step, i) => `${i + 1}. **Action:** ${step.action}\n   **Expected Result:** ${step.expectedResult}`).join('\n\n')
            },
            response: []
        }))
    };
    return JSON.stringify(collection, null, 2);
}


export const exportTestCases = (testCases: TestCase[], requirement: Requirement, format: ExportFormat) => {
    switch (format) {
        case 'json': {
            const content = convertToJson(testCases);
            downloadFile(content, 'test-cases.json', 'application/json');
            break;
        }
        case 'gherkin': {
            const content = convertToGherkin(testCases, requirement);
            downloadFile(content, `${requirement.id}.feature`, 'text/plain');
            break;
        }
        case 'excel': {
            const content = convertToExcel(testCases);
            downloadFile(content, 'test-cases.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            break;
        }
        case 'postman': {
            const content = convertToPostman(testCases, requirement);
            downloadFile(content, 'postman-collection.json', 'application/json');
            break;
        }
        default:
            console.error(`Unsupported export format: ${format}`);
    }
};