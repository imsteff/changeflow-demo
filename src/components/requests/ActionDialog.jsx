import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ACTIONS, REMARKS_MAX } from '@/constants/cr';
import { errorMessage, fieldErrors } from '@/services/api';

// for workflow actions: mount with key={action}
export default function ActionDialog({ action, crNo, onConfirm, onClose }) {
  const config = ACTIONS[action];
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!config) return null;

  const confirm = async () => {
    const note = remarks.trim();
    if (config.remarksRequired && !note) {
      setError('Remarks are required');
      return;
    }
    setPending(true);
    setError('');
    try {
      await onConfirm(note);
      onClose();
    } catch (err) {
      setError(fieldErrors(err).remarks || errorMessage(err));
      setPending(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{crNo}</span> {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="action-remarks">
            Remarks {config.remarksRequired ? <span className="text-destructive">*</span> : <span className="text-muted-foreground">(optional)</span>}
          </Label>
          <Textarea
            id="action-remarks"
            rows={4}
            maxLength={REMARKS_MAX}
            value={remarks}
            disabled={pending}
            aria-invalid={error ? true : undefined}
            aria-describedby="action-remarks-help"
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError('');
            }}
          />
          <div id="action-remarks-help" className="flex justify-between gap-3 text-xs">
            <span className="text-destructive">{error}</span>
            <span className="shrink-0 text-muted-foreground">{remarks.length}/{REMARKS_MAX}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant={config.danger ? 'destructive' : 'default'} className="min-w-28" onClick={confirm} disabled={pending}>
            {pending ? <>{config.pendingLabel}<Loader2 className="animate-spin" /></> : config.label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
