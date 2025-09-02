import React, { useState } from 'react';
import { TestCase, TestCaseStatus, TestCaseType } from '../types';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from './icons';

interface TestCaseCardProps {
  testCase: TestCase;
  onStatusChange: (id: string, status: TestCaseStatus) => void;
  canReview: boolean;
}

const typeColorMap: Record<TestCaseType, string> = {
  [TestCaseType.Positive]: 'bg-green-100 text-green-800',
  [TestCaseType.Negative]: 'bg-red-100 text-red-800',
  [TestCaseType.Security]: 'bg-blue-100 text-blue-800',
  [TestCaseType.Compliance]: 'bg-purple-100 text-purple-800',
  [TestCaseType.Performance]: 'bg-yellow-100 text-yellow-800',
};

const statusColorMap: Record<TestCaseStatus, string> = {
  [TestCaseStatus.Pending]: 'border-gray-300',
  [TestCaseStatus.Approved]: 'border-green-500',
  [TestCaseStatus.Rejected]: 'border-red-500',
};

export const TestCaseCard: React.FC<TestCaseCardProps> = ({ testCase, onStatusChange, canReview }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-300 ${statusColorMap[testCase.status]}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColorMap[testCase.type]}`}>
              {testCase.type}
            </span>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">{testCase.id}: {testCase.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            {canReview && (
              <>
                <button onClick={() => onStatusChange(testCase.id, TestCaseStatus.Approved)} className="text-green-500 hover:text-green-700 disabled:text-gray-300 disabled:cursor-not-allowed" title="Approve" disabled={testCase.status === TestCaseStatus.Approved}>
                  <CheckCircleIcon className="w-6 h-6" />
                </button>
                <button onClick={() => onStatusChange(testCase.id, TestCaseStatus.Rejected)} className="text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed" title="Reject" disabled={testCase.status === TestCaseStatus.Rejected}>
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </>
            )}
             <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-gray-700" title={isExpanded ? 'Collapse' : 'Expand'}>
              <EyeIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Test Steps</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Action</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Expected Result</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testCase.steps.map((step, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-800">{step.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{step.expectedResult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
