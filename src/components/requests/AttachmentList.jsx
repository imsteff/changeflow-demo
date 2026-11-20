import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadAttachment } from '@/services/crService';
import { errorMessage } from '@/services/api';
import { formatBytes } from '@/utils/crForm';

const GROUPS = [
  { category: 'process_flow', label: 'Process Flow' },
  { category: 'regulatory', label: 'Regulatory Approval' },
];

export default function AttachmentList({ attachments }) {
  const [busyId, setBusyId] = useState(null);

  const download = async (file) => {
    setBusyId(file.id);
    try {
      await downloadAttachment(file.id, file.name);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download the file'));
    } finally {
      setBusyId(null);
    }
  };

  if (!attachments?.length) return <p className="text-sm text-muted-foreground">No attachments.</p>;

  return (
    <div className="space-y-4">
      {GROUPS.map(({ category, label }) => {
        const files = attachments.filter((a) => a.category === category);
        if (!files.length) return null;
        return (
          <div key={category} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <ul className="divide-y rounded-md border">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => download(file)}
                    disabled={busyId === file.id}
                    aria-label={`Download ${file.name}`}
                  >
                    {busyId === file.id ? <Loader2 className="animate-spin" /> : <Download />}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
