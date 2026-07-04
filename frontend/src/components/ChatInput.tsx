import { useCallback, useEffect, useRef, useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function ArrowUpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg height={size} width={size} viewBox="0 0 16 16" style={{ color: "currentcolor" }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface ChatInputProps {
  onSend: (question: string) => void;
  onUploadFile: (file: File) => void;
  isSending: boolean;
  isUploading: boolean;
  documentLoaded: boolean;
}

export function ChatInput({
  onSend,
  onUploadFile,
  isSending,
  isUploading,
  documentLoaded,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const canSend = documentLoaded && !isSending && !isUploading && input.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(input.trim());
    setInput("");
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    e.target.value = "";
  };

  return (
    <div className="chat-input-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden-file-input"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="chat-input-pill">
        <button
          type="button"
          className="icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Upload PDF"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        <Textarea
          ref={textareaRef}
          rows={1}
          placeholder={
            documentLoaded ? "Ask a question about the document..." : "Upload a PDF to begin..."
          }
          value={input}
          disabled={!documentLoaded || isSending}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="chat-textarea"
        />

        <Button
          type="button"
          size="icon"
          className="send-btn"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <ArrowUpIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
