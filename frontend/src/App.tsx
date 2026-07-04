import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { DocumentBadge } from "@/components/DocumentBadge";
import { deleteDocument, getStatus, nextMessageId, sendChatMessage, uploadDocument } from "@/api";
import type { ChatMessage } from "@/types";

export default function App() {
  const [filename, setFilename] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStatus()
      .then((status) => setFilename(status.filename))
      .catch(() => {
        // Backend not reachable yet — leave in "no document" state, the user
        // will see errors on their first action if it's still unreachable.
      });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadDocument(file);
      setFilename(result.filename);
      setMessages([]); // previous Q&A no longer applies to the new document
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemove = useCallback(async () => {
    setError(null);
    try {
      await deleteDocument();
      setFilename(null);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove document.");
    }
  }, []);

  const handleSend = useCallback(async (question: string) => {
    setError(null);
    const userMessage: ChatMessage = { id: nextMessageId(), role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const result = await sendChatMessage(question);
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "assistant", content: result.answer },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <FileText className="w-5 h-5" strokeWidth={2} />
        <h1>Chat with your PDF</h1>
      </header>

      <DocumentBadge filename={filename} isUploading={isUploading} onRemove={handleRemove} />

      {error && <div className="error-banner">{error}</div>}

      <div className="messages-scroll">
        <ChatMessages messages={messages} isSending={isSending} documentLoaded={!!filename} />
      </div>

      <ChatInput
        onSend={handleSend}
        onUploadFile={handleUpload}
        isSending={isSending}
        isUploading={isUploading}
        documentLoaded={!!filename}
      />
    </div>
  );
}
