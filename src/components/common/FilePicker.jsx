import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkNewFiles, formatBytes } from '@/utils/crForm';

export default function FilePicker({ id, files, onChange, uploads, invalid }) {
  const inputRef = useRef(null);
  const [problems, setProblems] = useState([]);

  const add = (e) => {
    const { accepted, problems: found } = checkNewFiles(files, Array.from(e.target.files || []), uploads);
    setProblems(found);
    if (accepted.length) onChange([...files, ...accepted]);
    e.target.value = '';
  };

  const remove = (index) => {
    setProblems([]);
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        className="sr-only"
        accept={uploads.allowedExtensions.join(',')}
        onChange={add}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-invalid={invalid || undefined}
        className={invalid ? 'border-destructive' : undefined}
        onClick={() => inputRef.current?.click()}
        disabled={files.length >= uploads.maxFiles}
      >
        <Paperclip className="mr-2 h-4 w-4" /> Attach files
      </Button>
      <p className="text-xs text-muted-foreground">
        Up to {uploads.maxFiles} files, {formatBytes(uploads.maxFileBytes)} each. Allowed: {uploads.allowedExtensions.join(' ')}
      </p>
      {problems.length > 0 && (
        <ul className="space-y-1 text-sm text-destructive">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="divide-y rounded-md border">
          {files.map((file, i) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">{file.name}</span>
              <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {formatBytes(file.size)}
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i)} aria-label={`Remove ${file.name}`}>
                  <X className="h-4 w-4" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
