import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ActionDialog from '@/components/requests/ActionDialog';
import RichText from '@/components/common/RichText';
import useAsync from '@/hooks/useAsync';
import { getDecision, submitDecision } from '@/services/decisionService';
import { ACTIONS } from '@/constants/cr';
import { formatDate, formatDateTime } from '@/utils/format';
import { hasRichText } from '@/utils/richText';

const STAGE_TEXT = {
  pending_ao: 'For your approval',
  pending_sapm: 'For your requirements review',
  pending_final: 'For your final approval',
};

const CLOSED_TEXT = {
  closed: (cr) => `${cr.crNo} is now "${cr.statusLabel}". No action is needed.`,
  expired: () => 'This link has expired. Please open the CR in ChangeFlow to decide.',
};

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-ink">{children || <span className="text-faint">Not provided</span>}</dd>
    </div>
  );
}

function RichField({ label, value }) {
  return <Field label={label}>{hasRichText(value) ? <RichText value={value} /> : null}</Field>;
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-3 p-4 sm:justify-center sm:py-10">
      {children}
      <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline">Back to ChangeFlow (demo)</Link>
    </div>
  );
}

function Message({ title, text }) {
  return (
    <Shell>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{text}</CardDescription>
        </CardHeader>
      </Card>
    </Shell>
  );
}

function DecideSkeleton() {
  return (
    <Shell>
      <Card className="w-full max-w-2xl" aria-busy="true" aria-label="Loading request">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          {['w-40', 'w-56', 'w-32', 'w-full', 'w-5/6'].map((w, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className={`h-4 ${w} max-w-full`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </Shell>
  );
}

const variantOf = (config) => {
  if (config.danger) return 'destructive';
  return config.primary ? 'default' : 'outline';
};

// for the AO, SA/PM and GM email links
export default function DecidePage() {
  const { token } = useParams();
  const [params] = useSearchParams();
  const link = useAsync(() => getDecision(token), [token]);
  // for the decision buttons in the email
  const [action, setAction] = useState(() => params.get('action'));
  const [result, setResult] = useState(null);

  if (result) {
    return (
      <Shell>
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <CheckCircle2 className="h-10 w-10 text-brand" />
            <CardTitle>{ACTIONS[result.action].toast}</CardTitle>
            <CardDescription>{result.crNo} is now "{result.statusLabel}". You can close this page.</CardDescription>
          </CardHeader>
        </Card>
      </Shell>
    );
  }
  if (link.error && !link.data) return <Message title={link.status === 404 ? 'Link not valid' : 'Cannot load this CR'} text={link.error} />;
  if (!link.data) return <DecideSkeleton />;

  const {
    state, stage, actions, cr, expiresAt,
  } = link.data;
  if (state !== 'open') return <Message title="No action needed" text={CLOSED_TEXT[state](cr)} />;

  const decide = async (remarks) => {
    try {
      setResult({ ...(await submitDecision(token, action, remarks)), action });
    } catch (err) {
      // for a CR decided elsewhere: the reload shows its new state, the dialog shows why
      if (err?.response?.status === 409) link.reload();
      throw err;
    }
  };

  return (
    <Shell>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1.5">
          <p className="text-sm font-semibold text-subtle">{cr.crNo} · {STAGE_TEXT[stage]}</p>
          <CardTitle className="break-words text-xl">{cr.title}</CardTitle>
          <CardDescription>This link works once and expires on {formatDateTime(expiresAt)}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Requestor">{[cr.requestorName, cr.requestorDepartment].filter(Boolean).join(' · ')}</Field>
            <Field label="System">{cr.systemName}</Field>
            <Field label="Request Type">{cr.requestTypeLabel}</Field>
            <Field label="Target Date">{formatDate(cr.targetDate)}</Field>
            <Field label="Submitted">{formatDateTime(cr.submittedAt)}</Field>
            <Field label="Regulatory Approval Needed">{cr.regulatoryApprovalNeeded ? 'Yes' : 'No'}</Field>
          </dl>
          <dl className="grid gap-4 border-t pt-5">
            <RichField label="Business Objective" value={cr.businessObjective} />
            <RichField label="Business Justification" value={cr.businessJustification} />
            <RichField label="Benefits" value={cr.benefits} />
            <RichField label="Detailed Requirements" value={cr.detailedRequirements} />
            <RichField label="Expected Behavior" value={cr.expectedBehavior} />
          </dl>
          <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
            {[...actions].reverse().map((a) => (
              <Button key={a} variant={variantOf(ACTIONS[a])} onClick={() => setAction(a)}>{ACTIONS[a].label}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {actions.includes(action) && <ActionDialog key={action} action={action} crNo={cr.crNo} onConfirm={decide} onClose={() => setAction(null)} />}
    </Shell>
  );
}
