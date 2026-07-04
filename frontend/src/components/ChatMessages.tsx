import { useEffect, useRef } from "react";
import { FileQuestion } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types";

interface ChatMessagesProps {
      messages: ChatMessage[];
      isSending: boolean;
      documentLoaded: boolean;
}

export function ChatMessages({ messages, isSending, documentLoaded }: ChatMessagesProps) {
      const bottomRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, [messages, isSending]);

      if (messages.length === 0) {
            return (
                  <div className="empty-state">
                        <FileQuestion className="w-8 h-8" strokeWidth={1.5} />
                        <p>{documentLoaded ? "Ask anything about the document you uploaded." : "Upload a PDF above, then ask questions about it here."}</p>
                  </div>
            );
      }

      return (
            <div className="messages">
                  {messages.map((m) => (
                        <div key={m.id} className={`message-row ${m.role}`}>
                              <div className={`bubble ${m.role} ${m.isError ? "error" : ""}`}>
                                    {m.role === "assistant" ? (
                                          <div className="markdown">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                          </div>
                                    ) : (
                                          m.content
                                    )}
                              </div>
                        </div>
                  ))}

                  {isSending && (
                        <div className="message-row assistant">
                              <div className="bubble assistant thinking">
                                    <span className="dot" />
                                    <span className="dot" />
                                    <span className="dot" />
                              </div>
                        </div>
                  )}

                  <div ref={bottomRef} />
            </div>
      );
}
