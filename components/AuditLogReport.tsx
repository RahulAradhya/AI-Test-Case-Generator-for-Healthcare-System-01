import React from 'react';
import { AuditLog } from '../types';
import { ClipboardDocumentListIcon } from './icons';

interface AuditLogReportProps {
  logs: AuditLog[];
}

export const AuditLogReport: React.FC<AuditLogReportProps> = ({ logs }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-800">Audit Log Report</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">This report shows a chronological record of activities performed in the system.</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {log.timestamp.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.username}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                     {log.action}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 break-words">{log.details}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No audit log entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
