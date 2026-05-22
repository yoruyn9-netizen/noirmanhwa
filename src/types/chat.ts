
import { FieldValue } from 'firebase/firestore';

// Defined based on user's specification for the mention object
export interface MangaMention {
  type: "manga_mention";
  mangaId: string;
  title: string;
  coverUrl: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  timestamp: any; // Firestore Timestamp
  isOwner?: boolean;
  replyTo?: string | null;
  replyToUser?: string | null;
  replyToText?: string | null;
  mentions?: MangaMention[];
}
