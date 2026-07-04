import type { ChatMessage, DocumentStatus } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.detail ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function getStatus(): Promise<DocumentStatus> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function uploadDocument(file: File): Promise<{ filename: string; chunks: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function sendChatMessage(question: string): Promise<{ answer: string }> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function deleteDocument(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/document`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
}

let idCounter = 0;
export function nextMessageId(): string {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

export type { ChatMessage, DocumentStatus };
