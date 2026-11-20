import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from '@/components/requests/StatusBadge';

const EMAIL_NOTES = {
  sent: 'A confirmation email has been sent to you.',
  failed: 'The confirmation email could not be sent right now.',
  dry_run: 'Email sending is turned off on this server.',
  demo: 'Demo mode: no emails are sent.',
};

const nextStep = ({ status, approvingOfficer }) => {
  if (status === 'pending_ao') {
    return approvingOfficer?.name
      ? `${approvingOfficer.name}, your approving officer, will review it next.`
      : 'Your approving officer will review it next.';
  }
  if (status === 'pending_sapm') return 'SA/PM will review it next.';
  return null;
};

export default function CrSuccess({ result, onStartOver }) {
  const next = nextStep(result);
  return (
    <Card className="mx-auto max-w-lg overflow-hidden shadow-sm">
      <CardContent className="flex flex-col items-center px-6 pb-6 pt-8 text-center sm:px-10">
        <span className="rounded-full animate-success-pulse motion-reduce:animate-none">
          <span className="flex h-14 w-14 animate-step-pop items-center justify-center rounded-full bg-emerald-500/10 motion-reduce:animate-none">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </span>
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Change Request submitted</h2>
        <p className="mt-1 text-sm text-subtle">Keep this number to track your request.</p>

        <div className="mt-5 flex w-full flex-col items-center gap-2 rounded-lg border bg-canvas/60 px-4 py-4">
          <span className="text-2xl font-semibold tracking-tight text-ink">{result.crNo}</span>
          <StatusBadge status={result.status} label={result.statusLabel} className="text-xs" />
        </div>

        {next && <p className="mt-4 text-sm text-ink-soft">{next}</p>}
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-subtle">
          <Mail className="h-3.5 w-3.5" />
          {EMAIL_NOTES[result.emailStatus] || EMAIL_NOTES.sent}
        </p>
      </CardContent>
      <CardFooter className="flex-col-reverse gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-center sm:px-10">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onStartOver}>Submit another CR</Button>
        <Button asChild className="group w-full sm:w-auto">
          <Link to={`/requests/${result.crNo}`}>
            View request
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
