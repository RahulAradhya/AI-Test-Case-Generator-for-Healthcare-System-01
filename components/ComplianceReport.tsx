
import React, { useMemo } from 'react';
import { TestCase, ComplianceCheck, TestCaseType } from '../types';
import { CheckCircleIcon, ShieldCheckIcon } from './icons';

interface ComplianceReportProps {
  testCases: TestCase[];
}

const complianceFramework: Omit<ComplianceCheck, 'status' | 'evidence'>[] = [
  { id: 'HIPAA-01', control: 'Access Control', description: 'Ensure PHI is only accessible by authorized persons.' },
  { id: 'HIPAA-02', control: 'Audit Controls', description: 'Implement mechanisms to record and examine activity in systems that contain PHI.' },
  { id: 'FHIR-01', control: 'Resource Validation', description: 'Ensure data structures conform to FHIR standards.' },
  { id: 'HIPAA-03', control: 'Data Integrity', description: 'Protect PHI from improper alteration or destruction.' },
];

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ testCases }) => {

  const reportData: ComplianceCheck[] = useMemo(() => {
    return complianceFramework.map(frameworkItem => {
      let status: ComplianceCheck['status'] = 'Needs Review';
      const evidence: string[] = [];

      const securityTests = testCases.filter(tc => tc.type === TestCaseType.Security);
      const complianceTests = testCases.filter(tc => tc.type === TestCaseType.Compliance);

      if (frameworkItem.id.startsWith('HIPAA')) {
        if (securityTests.length > 0) {
          status = 'Covered';
          evidence.push(...securityTests.map(t => t.id));
        }
      }
      if (frameworkItem.id.startsWith('FHIR')) {
        if (complianceTests.length > 0) {
          status = 'Covered';
          evidence.push(...complianceTests.map(t => t.id));
        }
      }
      
      return { ...frameworkItem, status, evidence };
    });
  }, [testCases]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Compliance Checklist Report</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">This report automatically checks for test case coverage against key healthcare compliance controls.</p>
      
      <div className="space-y-4">
        {reportData.map(item => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{item.control} <span className="text-xs text-gray-400 font-mono">{item.id}</span></p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                item.status === 'Covered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status === 'Covered' && <CheckCircleIcon className="w-4 h-4 mr-1.5" />}
                {item.status}
              </div>
            </div>
            {item.evidence.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500">Evidence (Test Cases):</p>
                <div className="flex flex-wrap gap-2 mt-1">
                    {item.evidence.map(tcId => (
                        <span key={tcId} className="px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">
                            {tcId}
                        </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
