export interface ReportTypings {
    id: string;
    type: 'bug' | 'suggestion' | 'user' | 'other';
    author: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected' | 'resolved';
    resolvedBy: string;
    resolvedAt: Date;
}