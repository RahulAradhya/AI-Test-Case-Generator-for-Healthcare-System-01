import React from 'react';
import { ServerStackIcon, TableCellsIcon, CloudIcon, KeyIcon, CpuChipIcon } from './icons';

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    purpose: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, purpose }) => (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-start space-x-4 h-full">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <p className="text-xs text-gray-500 mt-2"><span className="font-semibold">Purpose:</span> {purpose}</p>
            <div className="flex items-center mt-3">
                 <span className="w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                <p className="text-sm font-semibold text-green-600">Connected (Simulated)</p>
            </div>
        </div>
    </div>
);

export const SystemArchitecture: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-6">
                <CpuChipIcon className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-800">System Architecture Overview</h2>
            </div>
            <p className="text-sm text-gray-600 mb-8">This page illustrates the conceptual backend architecture for which this application is designed. All services are currently simulated on the client-side.</p>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Data Layer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ServiceCard 
                            icon={<ServerStackIcon className="w-6 h-6 text-blue-600" />}
                            title="Cloud SQL for PostgreSQL"
                            description="Managed relational database service for transactional data."
                            purpose="OLTP (Online Transaction Processing)"
                        />
                         <ServiceCard 
                            icon={<TableCellsIcon className="w-6 h-6 text-blue-600" />}
                            title="Google BigQuery"
                            description="Serverless data warehouse for large-scale analytics."
                            purpose="Traceability & Analytics"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Storage & Secrets</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ServiceCard 
                            icon={<CloudIcon className="w-6 h-6 text-blue-600" />}
                            title="Google Cloud Storage (GCS)"
                            description="Scalable object storage for unstructured data."
                            purpose="Document & Artifact Storage"
                        />
                         <ServiceCard 
                            icon={<KeyIcon className="w-6 h-6 text-blue-600" />}
                            title="Google Secret Manager"
                            description="Securely stores API keys, passwords, and other sensitive data."
                            purpose="Credentials Management"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
