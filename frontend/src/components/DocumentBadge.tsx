import { FileText, X, Loader2 } from "lucide-react";

interface DocumentBadgeProps {
  filename: string | null;
  isUploading: boolean;
  onRemove: () => void;
}

export function DocumentBadge({ filename, isUploading, onRemove }: DocumentBadgeProps) {
  if (isUploading) {
    return (
      <div className="doc-badge doc-badge-pending">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Processing document...</span>
      </div>
    );
  }

  if (!filename) {
    return (
      <div className="doc-badge doc-badge-empty">
        <FileText className="w-4 h-4" />
        <span>No document loaded — upload a PDF to get started</span>
      </div>
    );
  }

  return (
    <div className="doc-badge doc-badge-active">
      <FileText className="w-4 h-4" />
      <span className="doc-badge-name">{filename}</span>
      <button
        type="button"
        onClick={onRemove}
        className="doc-badge-remove"
        aria-label="Remove document"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
