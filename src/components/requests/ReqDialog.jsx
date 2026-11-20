import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import LoadError from '@/components/common/LoadError';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  REMARKS_MAX, REQ_DIALOGS, REQ_KEY_PATTERN, REQ_MODES,
} from '@/constants/cr';
import useAsync from '@/hooks/useAsync';
import { errorMessage, fieldErrors } from '@/services/api';
import { getOptions } from '@/services/crService';

const MODES = {
  [REQ_MODES.CREATE]: {
    label: 'Create it in Jira',
    hint: 'Makes an REQ story from this CR with you as the reporter.',
    note: 'For internal use only.',
    submit: 'Create REQ',
    pending: 'Creating',
  },
  [REQ_MODES.LINK]: {
    label: 'Link an existing REQ',
    hint: 'For an REQ that is already on the board.',
    submit: 'Link REQ',
    pending: 'Linking',
  },
};

function ModeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-2">
      <Skeleton className="h-[62px] w-full rounded-md" />
      <Skeleton className="h-[62px] w-full rounded-md" />
    </div>
  );
}

function ModePicker({ value, onChange, disabled }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} disabled={disabled} aria-label="How to set the REQ">
      {Object.entries(MODES).map(([mode, { label, hint, note }]) => (
        <Label
          key={mode}
          htmlFor={`req-mode-${mode}`}
          className="flex cursor-pointer items-start gap-3 rounded-md border p-3 font-normal has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand-tint"
        >
          <RadioGroupItem id={`req-mode-${mode}`} value={mode} className="mt-0.5" />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium text-foreground">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
            {note && <span className="block text-xs font-medium text-brand">{note}</span>}
          </span>
        </Label>
      ))}
    </RadioGroup>
  );
}

// for enter_req and correct_req: mount with key={action}
export default function ReqDialog({ action, crNo, currentKey, onConfirm, onClose }) {
  const config = REQ_DIALOGS[action];
  const isEnter = action === 'enter_req';
  const options = useAsync(() => (isEnter ? getOptions() : null), [isEnter]);
  const [picked, setPicked] = useState(null);
  const [reqKey, setReqKey] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  if (!config) return null;

  const jiraEnabled = Boolean(options.data?.jira?.enabled);
  const loading = isEnter && options.loading;
  const failed = isEnter && !loading && Boolean(options.error) && !options.data;
  const mode = isEnter && jiraEnabled ? picked || REQ_MODES.CREATE : REQ_MODES.LINK;
  const needsKey = mode === REQ_MODES.LINK;
  const submit = isEnter ? MODES[mode] : { submit: config.label, pending: config.pendingLabel };

  const clearError = (field) => {
    if (errors[field] || errors.form) setErrors({});
  };

  const confirm = async () => {
    const key = reqKey.trim().toUpperCase();
    if (needsKey && !REQ_KEY_PATTERN.test(key)) {
      setErrors({ reqKey: key ? 'Use the REQ-123 format' : 'REQ number is required' });
      return;
    }
    const input = {
      ...(isEnter && { mode }),
      ...(needsKey && { reqKey: key }),
      remarks: remarks.trim() || undefined,
    };
    setPending(true);
    setErrors({});
    try {
      await onConfirm(input);
      onClose();
    } catch (err) {
      const fields = fieldErrors(err);
      setErrors(fields.reqKey || fields.remarks
        ? { reqKey: fields.reqKey, remarks: fields.remarks }
        : { form: errorMessage(err) });
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
            {currentKey && <> It is linked to <span className="font-medium text-foreground">{currentKey}</span> now.</>}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {loading && <ModeSkeleton />}
          {failed && <LoadError title="Cannot load the REQ options" message={options.error} onRetry={options.reload} />}
          {isEnter && !loading && !failed && jiraEnabled && (
            <ModePicker value={mode} onChange={(value) => { setPicked(value); setErrors({}); }} disabled={pending} />
          )}
          {isEnter && !loading && !failed && !jiraEnabled && (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Jira is not connected, so link an REQ that is already on the board.
            </p>
          )}

          {!loading && !failed && needsKey && (
            <div className="space-y-2">
              <Label htmlFor="req-key">REQ number <span className="text-destructive">*</span></Label>
              <Input
                id="req-key"
                placeholder="REQ-123"
                autoComplete="off"
                maxLength={20}
                value={reqKey}
                disabled={pending}
                aria-invalid={errors.reqKey ? true : undefined}
                aria-describedby="req-key-help"
                onChange={(e) => {
                  setReqKey(e.target.value);
                  clearError('reqKey');
                }}
              />
              <p id="req-key-help" className="text-xs text-destructive">{errors.reqKey}</p>
            </div>
          )}

          {!loading && !failed && (
            <div className="space-y-2">
              <Label htmlFor="req-remarks">Remarks <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="req-remarks"
                rows={3}
                maxLength={REMARKS_MAX}
                value={remarks}
                disabled={pending}
                aria-invalid={errors.remarks ? true : undefined}
                aria-describedby="req-remarks-help"
                onChange={(e) => {
                  setRemarks(e.target.value);
                  clearError('remarks');
                }}
              />
              <div id="req-remarks-help" className="flex justify-between gap-3 text-xs">
                <span className="text-destructive">{errors.remarks}</span>
                <span className="shrink-0 text-muted-foreground">{remarks.length}/{REMARKS_MAX}</span>
              </div>
            </div>
          )}

          {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button className="min-w-28" onClick={confirm} disabled={pending || loading || failed}>
            {pending ? <>{submit.pending}<Loader2 className="animate-spin" /></> : submit.submit}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
