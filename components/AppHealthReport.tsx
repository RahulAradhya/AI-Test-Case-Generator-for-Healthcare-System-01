import React, { useMemo } from 'react';
import { CpuChipIcon, CheckCircleIcon } from './icons';
import { TestCase, TestCaseStatus } from '../types';

interface AppHealthReportProps {
    testCases: TestCase[];
}

const HealthMetricCard: React.FC<{ title: string; value: string; status: 'Healthy' | 'Warning' | 'Error'; description: string }> = ({ title, value, status, description }) => {
    const statusColorMap = {
        Healthy: 'text-green-500',
        Warning: 'text-yellow-500',
        Error: 'text-red-500',
    };
    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
                 <span className={`w-3 h-3 rounded-full mr-2 ${statusColorMap[status].replace('text-', 'bg-')}`}></span>
                <p className={`text-sm font-semibold ${statusColorMap[status]}`}>{status}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
    );
};

export const AppHealthReport: React.FC<AppHealthReportProps> = ({ testCases }) => {
    const healthMetrics = useMemo(() => {
        const total = testCases.length;
        const approved = testCases.filter(tc => tc.status === TestCaseStatus.Approved).length;
        const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';

        return [
            { id: 'uptime', title: 'API Uptime (24h)', value: '99.98%', status: 'Healthy', description: 'Measures the availability of the core AI service.' },
            { id: 'gen-time', title: 'Avg. Generation Time', value: '1.45s', status: 'Healthy', description: 'Average time to generate a full test suite.' },
            { id: 'approval-rate', title: 'Test Case Approval Rate', value: `${approvalRate}%`, status: parseFloat(approvalRate) >= 85 || total === 0 ? 'Healthy' : 'Warning', description: 'Percentage of AI-generated tests approved by reviewers.' },
            { id: 'error-rate', title: 'API Error Rate (24h)', value: '0.02%', status: 'Healthy', description: 'Percentage of failed requests to the AI service.' },
        ];

    }, [testCases]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                <CpuChipIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">Application Health Report</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">This report provides an overview of the system's operational status and key performance metrics.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthMetrics.map(metric => (
                    <HealthMetricCard 
                        key={metric.id}
                        title={metric.title}
                        value={metric.value}
                        status={metric.status as 'Healthy' | 'Warning' | 'Error'}
                        description={metric.description}
                    />
                ))}
            </div>
        </div>
    );
};
