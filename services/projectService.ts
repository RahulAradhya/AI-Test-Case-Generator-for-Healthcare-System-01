import { Project, Release, UserStory } from '../types';

// Mock Data Store
const mockProjects: Project[] = [
    { id: 'PROJ-1', name: 'EHR System Upgrade' },
    { id: 'PROJ-2', name: 'Telemedicine Platform' },
];

const mockReleases: Release[] = [
    { id: 'REL-1', name: 'Q3 2024 Release', projectId: 'PROJ-1' },
    { id: 'REL-2', name: 'Q4 2024 Release', projectId: 'PROJ-1' },
    { id: 'REL-3', name: 'V1.0 Launch', projectId: 'PROJ-2' },
];

const mockUserStories: UserStory[] = [
    { id: 'US-101', title: 'Patient History View', releaseId: 'REL-1', description: 'As a doctor, I need to be able to securely access a patient\'s medical history by searching for their unique patient ID, so that I can provide an accurate diagnosis. The system must be HIPAA compliant.' },
    { id: 'US-102', title: 'e-Prescribing Integration', releaseId: 'REL-1', description: 'As a physician, I need to be able to send prescriptions directly to a pharmacy from the EHR system to improve efficiency and reduce transcription errors. The system must meet NCPDP SCRIPT standards.' },
    { id: 'US-201', title: 'Video Consultation', releaseId: 'REL-3', description: 'As a patient, I need to be able to initiate a secure video call with my doctor through the platform, so I can have a remote consultation. All video streams must be encrypted end-to-end.' },
];

// Mock API functions with simulated delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProjects = async (): Promise<Project[]> => {
    await simulateDelay(500);
    console.log("Mock API: Fetching projects");
    return mockProjects;
};

export const getReleases = async (projectId: string): Promise<Release[]> => {
    await simulateDelay(700);
    console.log(`Mock API: Fetching releases for project ${projectId}`);
    return mockReleases.filter(r => r.projectId === projectId);
};

export const getUserStories = async (releaseId: string): Promise<UserStory[]> => {
    await simulateDelay(600);
    console.log(`Mock API: Fetching user stories for release ${releaseId}`);
    return mockUserStories.filter(s => s.releaseId === releaseId);
};

export const getUserStoryDetails = async (storyId: string): Promise<UserStory | undefined> => {
    await simulateDelay(400);
    console.log(`Mock API: Fetching details for story ${storyId}`);
    return mockUserStories.find(s => s.id === storyId);
};
