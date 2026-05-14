
export interface Report {
  id: string;
  userId: string;
  userEmail: string;
  type: 'bug' | 'chapter';
  chapterId?: string;
  description: string;
  status: 'pending' | 'resolved';
  timestamp: any;
}
