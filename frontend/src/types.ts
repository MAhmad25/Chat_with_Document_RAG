export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export interface DocumentStatus {
  document_loaded: boolean;
  filename: string | null;
}
