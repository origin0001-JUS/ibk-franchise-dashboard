export type Stage =
    | 'Proposal'
    | 'Field Meeting'
    | 'Contract Review'
    | 'Signing'
    | 'Integration'
    | 'Join'
    | 'Operation';

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'Contact' | 'Meeting' | 'File' | 'Note';
    content: string;
    files?: string[]; // URLs
    createdBy: string; // User ID/Email
}

export type ServiceType = 'Card' | 'Loan' | 'VirtualAccount';

export interface Franchise {
    id: string;
    rank: number;
    name: string;
    storeCount: number;
    revenue?: number; // 단위: 억원
    memo?: string;
    serviceTypes: ServiceType[];
    status: Stage;
    history: TimelineEvent[];
}

export interface UserProfile {
    uid: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isApproved: boolean;
    createdAt: string;
}
