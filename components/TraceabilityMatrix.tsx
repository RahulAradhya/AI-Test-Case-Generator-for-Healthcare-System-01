
import React from 'react';
import { TestCase, Requirement } from '../types';

interface TraceabilityMatrixProps {
  requirements: Requirement[];
  testCases: TestCase[];
}

export const TraceabilityMatrix: React.FC<TraceabilityMatrixProps> = ({ requirements, testCases }) => {
  if (requirements.length === 0 || testCases.length === 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">Generate test cases to see the traceability matrix.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements Traceability Matrix</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-100">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requirement ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requirement
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Linked Test Cases
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requirements.map((req) => {
            const linkedTestCases = testCases.filter(tc => tc.requirementId === req.id);
            return (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 break-words">{req.text}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {linkedTestCases.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {linkedTestCases.map(tc => (
                            <span key={tc.id} className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                {tc.id}
                            </span>
                        ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
