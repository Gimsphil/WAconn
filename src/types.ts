export interface ChatMessage {
  id: string;
  channel: "WhatsApp" | "KakaoTalk" | "Telegram" | "Slack";
  sender: string;
  timestamp: string;
  original: string;
  translation: string;
  selectedToner: "BOSS" | "CLIENT" | "COWORKER" | "FAMILY" | null;
  activeOverlay: "original" | "translation" | "both";
  draftOriginal?: string;
  draftTranslated?: string;
  generating?: boolean;
}

export interface DiarizationBlock {
  id: string;
  speaker: "User" | "Speaker A" | "Speaker B";
  timestamp: string;
  text: string;
}

export interface IngestionMetadata {
  title: string;
  category: string;
  tags: string[];
}

export interface TimestampChip {
  timeCode: string; // e.g. "00:15"
  label: string;
}

export interface QAMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AISmartNote {
  id: string;
  metadata: IngestionMetadata;
  transcript: DiarizationBlock[];
  keywords: string[];
  executiveSummary: string;
  mindMapHierarchy: {
    title: string;
    children: {
      title: string;
      children?: string[];
    }[];
  };
  timestamps: TimestampChip[];
  qaHistory: QAMessage[];
}

export interface SyncService {
  id: "calendar" | "tasks" | "keep" | "drive";
  name: string;
  status: "Connected" | "Syncing" | "Pending Approval";
  lastSync: string;
}

export interface SyncLogItem {
  id: string;
  sourceModule: "Chat Translation" | "Meeting Copilot";
  type: "Calendar Event" | "Task Item" | "Document Archive";
  title: string;
  description: string;
  timestamp: string;
  status: "Pending" | "Synced" | "Failed";
}
