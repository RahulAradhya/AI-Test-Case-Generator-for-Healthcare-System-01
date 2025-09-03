import { Requirement, TestCase, AuditLog } from '../types';

const REQUIREMENTS_KEY = 'app_requirements';
const TEST_CASES_KEY = 'app_test_cases';
const AUDIT_LOGS_KEY = 'app_audit_logs';

// Helper function to safely parse JSON from localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

// --- Requirements ---
export const getInitialRequirements = (): Requirement[] => {
    return getItem<Requirement[]>(REQUIREMENTS_KEY, []);
};

export const saveRequirements = (requirements: Requirement[]): void => {
    localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(requirements));
};

// --- Test Cases ---
export const getInitialTestCases = (): TestCase[] => {
    return getItem<TestCase[]>(TEST_CASES_KEY, []);
};

export const saveTestCases = (testCases: TestCase[]): void => {
    localStorage.setItem(TEST_CASES_KEY, JSON.stringify(testCases));
};

// --- Audit Logs ---
export const getInitialAuditLogs = (): AuditLog[] => {
    // Dates are stored as strings in JSON, so we need to convert them back to Date objects
    const logs = getItem<any[]>(AUDIT_LOGS_KEY, []).map(log => ({
        ...log,
        timestamp: new Date(log.timestamp),
    }));
    return logs;
};

export const saveAuditLogs = (logs: AuditLog[]): void => {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
};

// --- Clear All Data ---
export const clearAllData = (): void => {
    localStorage.removeItem(REQUIREMENTS_KEY);
    localStorage.removeItem(TEST_CASES_KEY);
    localStorage.removeItem(AUDIT_LOGS_KEY);
}
