
import { FieldValue } from 'firebase/firestore';

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
  mangaMention?: {
    mangaId: string;
    title: string;
  } | null;
}
