import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TestCase, TestCaseStatus, Requirement, Role, ExportFormat, AuditLog, AIModel } from './types';
import { generateTestCases } from './services/aiService';
import { exportTestCases } from './services/exportService';
import { TestCaseCard } from './components/TestCaseCard';
import { TraceabilityMatrix } from './components/TraceabilityMatrix';
import { ComplianceReport } from './components/ComplianceReport';
import { AuditLogReport } from './components/AuditLogReport';
import { AppHealthReport } from './components/AppHealthReport';
import { DocumentTextIcon, ChartBarIcon, ShieldCheckIcon, BeakerIcon, SparklesIcon, ArrowDownTrayIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ArrowUpTrayIcon, ClipboardDocumentListIcon, CpuChipIcon, CubeTransparentIcon } from './components/icons';
import { useAuth } from './auth/AuthContext';
import { Login } from './components/Login';

// Declare pdfjsLib from the CDN script to satisfy TypeScript
declare var pdfjsLib: any;

type View = 'dashboard' | 'traceability' | 'compliance' | 'audit' | 'health';

const roleColors: Record<Role, { bg: string; text: string; accent: string }> = {
    [Role.Admin]: { bg: 'bg-blue-600', text: 'text-blue-700', accent: 'bg-blue-100' },
    [Role.Tester]: { bg: 'bg-green-600', text: 'text-green-700', accent: 'bg-green-100' },
    [Role.ComplianceAuditor]: { bg: 'bg-purple-600', text: 'text-purple-700', accent: 'bg-purple-100' },
};

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [requirementText, setRequirementText] = useState<string>('As a doctor, I need to be able to securely access a patient\'s medical history by searching for their unique patient ID, so that I can provide an accurate diagnosis. The system must be HIPAA compliant.');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel>(AIModel.Gemini);

  const colors = roleColors[user!.role];

  // Define permissions based on user role
  const canGenerate = user?.role === Role.Admin || user?.role === Role.Tester;
  const canReview = user?.role === Role.Admin || user?.role === Role.Tester;
  const canExport = user?.role === Role.Admin || user?.role === Role.Tester;


  const logAction = useCallback((action: string, details: string) => {
      if (!user) return;
      const newLog: AuditLog = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          username: user.username,
          role: user.role,
          action,
          details,
      };
      setAuditLogs(prev => [newLog, ...prev]);
  }, [user]);

  useEffect(() => {
    // Set up PDF.js worker one time on component mount
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }
  }, []);

  useEffect(() => {
    if (user) {
        logAction('User Login', `User '${user.username}' logged in successfully.`);
        // Set default view based on role
        if (user.role === Role.ComplianceAuditor) {
            setActiveView('compliance');
        } else {
            setActiveView('dashboard');
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Run only when user object changes


  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !requirementText.trim()) {
      setError('Requirement cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTestCases([]);
    try {
      const newRequirement: Requirement = { id: 'REQ-01', text: requirementText };
      setRequirements([newRequirement]);
      const generated = await generateTestCases(requirementText, selectedModel);
      setTestCases(generated);
      logAction('Generate Test Cases', `Generated ${generated.length} test cases using ${selectedModel}.`);
      setActiveView('dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      logAction('Generate Test Cases Failed', `Model: ${selectedModel}, Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [requirementText, selectedModel, canGenerate, logAction]);
  
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read PDF file."));
            }
            try {
                const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                resolve(fullText.trim());
            } catch (error) {
                console.error('Error parsing PDF:', error);
                reject(new Error("Could not parse PDF file. It might be corrupted or protected."));
            }
        };
        reader.onerror = () => {
            reject(new Error("Error reading PDF file."));
        };
        reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
        let text = '';
        if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => reject(new Error('Error reading text file.'));
                reader.readAsText(file);
            });
        } else if (file.name.endsWith('.pdf')) {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF processing library is not loaded. Please try again in a moment.');
            }
            text = await extractTextFromPdf(file);
        } else {
            throw new Error('Please upload a valid document (.txt, .md, .pdf).');
        }
        
        setRequirementText(text);
        logAction('File Upload', `Uploaded and processed file: ${file.name}`);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        logAction('File Upload Failed', `File: ${file.name}, Error: ${errorMessage}`);
    } finally {
        setIsLoading(false);
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const handleStatusChange = (id: string, status: TestCaseStatus) => {
    if (!canReview) return;
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status } : tc));
    logAction('Review Test Case', `Set test case '${id}' status to '${status}'.`);
  };

  const handleExport = useCallback((format: ExportFormat) => {
    if (!canExport || requirements.length === 0 || testCases.length === 0) {
      setError("Cannot export without generated test cases and a requirement.");
      return;
    }
    exportTestCases(testCases, requirements[0], format);
    logAction('Export Data', `Exported ${testCases.length} test cases as ${format.toUpperCase()}.`);
  }, [requirements, testCases, logAction, canExport]);
  
  const handleLogout = () => {
    logAction('User Logout', `User '${user?.username}' logged out.`);
    logout();
  }

  const renderView = () => {
    switch (activeView) {
      case 'traceability':
        return <TraceabilityMatrix requirements={requirements} testCases={testCases} />;
      case 'compliance':
        return <ComplianceReport testCases={testCases} />;
      case 'audit':
        return <AuditLogReport logs={auditLogs} />;
      case 'health':
        return <AppHealthReport testCases={testCases}/>;
      case 'dashboard':
      default:
        return (
           <div className="space-y-4">
            {testCases.length > 0 ? (
                testCases.map(tc => <TestCaseCard key={tc.id} testCase={tc} onStatusChange={handleStatusChange} canReview={canReview} />)
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                    <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No test cases generated yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {canGenerate ? 'Enter a requirement and click "Generate" to start.' : 'Awaiting test case generation.'}
                    </p>
                </div>
            )}
           </div>
        );
    }
  };
  
  const renderNav = () => {
    const navButtons = [
        { view: 'dashboard', label: 'Test Case Dashboard', icon: BeakerIcon, roles: [Role.Admin, Role.Tester] },
        { view: 'traceability', label: 'Traceability Matrix', icon: ChartBarIcon, roles: [Role.Admin, Role.Tester] },
        { view: 'compliance', label: 'Compliance Report', icon: ShieldCheckIcon, roles: [Role.Admin, Role.Tester, Role.ComplianceAuditor] },
        { view: 'audit', label: 'Audit Log Report', icon: ClipboardDocumentListIcon, roles: [Role.Admin, Role.ComplianceAuditor] },
        { view: 'health', label: 'App Health Report', icon: CpuChipIcon, roles: [Role.ComplianceAuditor] },
    ];
    
    const visibleButtons = navButtons.filter(btn => btn.roles.includes(user!.role));

    return (
        <div className="space-y-2">
            {visibleButtons.map(btn => (
                <button 
                  key={btn.view} 
                  onClick={() => setActiveView(btn.view as View)} 
                  className={`w-full flex items-center text-left p-3 rounded-md transition-colors font-medium ${
                    activeView === btn.view 
                    ? `${colors.accent} ${colors.text}` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                    <btn.icon className="w-5 h-5 mr-3" /> {btn.label}
                </button>
            ))}
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white shadow-sm">
        <div className={`h-1.5 ${colors.bg}`}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className={`w-8 h-8 ${colors.text}`} />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">AI-Powered Test Case Generator</h1>
          </div>
           {user && (
             <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <UserCircleIcon className="w-6 h-6 text-gray-500" />
                    <div className="ml-2 text-right">
                        <p className="text-sm font-medium text-gray-800">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Logout">
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
            </div>
           )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <aside className="lg:col-span-1 space-y-6">
             {canGenerate && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Enter Requirement</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="requirement-text" className="block text-sm font-medium text-gray-700">
                        Type or paste requirement below
                    </label>
                    <textarea
                        id="requirement-text"
                        value={requirementText}
                        onChange={(e) => setRequirementText(e.target.value)}
                        placeholder="e.g., The system shall allow pharmacists to dispense medication..."
                        className="w-full h-40 mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    />
                  </div>
                  <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.md,.pdf"
                    />
                    <button
                        onClick={handleUploadClick}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-md border border-slate-300 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Upload from Document (.txt, .md, .pdf)
                    </button>
                  </div>
                  <div>
                     <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700">
                        Select AI Model
                    </label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                           <CubeTransparentIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                            id="ai-model"
                            name="ai-model"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
                            disabled={isLoading}
                            className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value={AIModel.Gemini}>Gemini (Google)</option>
                            <option value={AIModel.OpenAI}>OpenAI (GPT-4 Mock)</option>
                            <option value={AIModel.Lambda}>Lambda (Health-QA Mock)</option>
                        </select>
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-200" />
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !requirementText.trim()}
                    className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                    ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Generate Test Cases
                    </>
                    )}
                </button>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>
             )}

            {testCases.length > 0 && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Review & Analyze</h2>
                        {renderNav()}
                    </div>
                     {canExport && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Test Cases</h2>
                            <div className="space-y-2">
                                <button onClick={() => handleExport('json')} className="w-full flex items-center text-left p-3 rounded-md transition-colors hover:bg-gray-100 text-gray-700 font-medium">
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-3 text-gray-500" /> Export as JSON
                                </button>
                                <button onClick={() => handleExport('gherkin')} className="w-full flex items-center text-left p-3 rounded-md transition-colors hover:bg-gray-100 text-gray-700 font-medium">
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-3 text-gray-500" /> Export as Gherkin
                                </button>
                                <button onClick={() => handleExport('excel')} className="w-full flex items-center text-left p-3 rounded-md transition-colors hover:bg-gray-100 text-gray-700 font-medium">
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-3 text-gray-500" /> Export as Excel
                                </button>
                                <button onClick={() => handleExport('postman')} className="w-full flex items-center text-left p-3 rounded-md transition-colors hover:bg-gray-100 text-gray-700 font-medium">
                                    <ArrowDownTrayIcon className="w-5 h-5 mr-3 text-gray-500" /> Export for Postman
                                </button>
                            </div>
                        </div>
                     )}
                </>
            )}
          </aside>
          
          <div className="lg:col-span-2">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
    const { user } = useAuth();
    if (!user) {
        return <Login />;
    }
    return <MainApp />;
}

export default App;