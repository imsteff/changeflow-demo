import { Link } from 'react-router';
import {
  ChevronLeft, ExternalLink, Pencil, Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ActionBar from '@/components/requests/ActionBar';
import ActivityFeed from '@/components/requests/ActivityFeed';
import AttachmentList from '@/components/requests/AttachmentList';
import CrProgress from '@/components/requests/CrProgress';
import ReturnedBanner from '@/components/requests/ReturnedBanner';
import StatusBadge from '@/components/requests/StatusBadge';
import RichText from '@/components/common/RichText';
import ScrollPane from '@/components/common/ScrollPane';
import { REQ_STATUS_STYLES, isSaPm, systemName } from '@/constants/cr';
import { useAssistantTone } from '@/context/AssistantContext';
import { useAuth } from '@/context/AuthContext';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, timeAgo } from '@/utils/format';
import { hasRichText } from '@/utils/richText';
import { jiraDemoClick } from '@/utils/demoLinks';

const CARD = 'overflow-hidden rounded-xl border bg-card shadow-sm';
// for the side rail: Tailwind xl
const WIDE = '(min-width: 1280px)';

function Section({ title, children }) {
  return (
    <section className="space-y-3 border-t px-5 py-5 first:border-t-0 sm:px-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, value, wide }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">{value || <span className="text-faint">Not provided</span>}</dd>
    </div>
  );
}

function RichField({ label, value }) {
  return <Field label={label} value={hasRichText(value) ? <RichText value={value} /> : null} />;
}

// for requestors: most have no Jira account
const reqNote = (isOwner) => `${isOwner ? 'Your' : 'This'} request is now with the development team. Track its progress here.`;

function ReqCard({
  req, team, isOwner, canChange, onChange,
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-start gap-3 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand">
          <Ticket className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{req.key}</p>
          <p className="line-clamp-2 text-subtle">{req.summary || 'Open in Jira to see the details'}</p>
        </div>
        {req.status && <StatusBadge status={req.statusCategory} label={req.status} styles={REQ_STATUS_STYLES} />}
      </div>
      {!team && <p className="px-3 pb-3 text-subtle">{reqNote(isOwner)}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-3 py-1.5">
        <p className="text-xs text-muted-foreground">
          {req.syncedAt ? `Status from Jira, updated ${timeAgo(req.syncedAt)}` : 'Status not synced from Jira'}
        </p>
        <div className="flex gap-1">
          {canChange && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onChange}>
              <Pencil className="h-3.5 w-3.5" /> Change
            </Button>
          )}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn('h-7 px-2 text-xs', team ? 'text-brand hover:text-brand' : 'text-muted-foreground')}
          >
            <a href="#" onClick={jiraDemoClick}>
              Open in Jira <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BackLink({ to }) {
  return (
    <Link to={to} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-subtle hover:text-ink lg:hidden">
      <ChevronLeft className="h-4 w-4" /> Back to list
    </Link>
  );
}

const metaOf = (cr) => [
  cr.requestTypeLabel,
  systemName(cr),
  cr.submittedAt && `Submitted ${formatDate(cr.submittedAt)}`,
  cr.revision > 1 && `Rev ${cr.revision}`,
].filter(Boolean).join(' · ');

// for xl: content plus a details rail
function DetailLayout({
  rail, head, details, body, activity, ...props
}) {
  if (!rail) {
    return (
      <ScrollPane className="lg:rounded-xl" {...props}>
        <article className={CARD}>{head}{details}{body}{activity}</article>
      </ScrollPane>
    );
  }
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] grid-rows-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]" {...props}>
      <ScrollPane className="rounded-xl">
        <article className={CARD}>{head}{body}</article>
      </ScrollPane>
      <ScrollPane className="max-h-full self-start rounded-xl">
        <aside className={CARD}>{details}{activity}</aside>
      </ScrollPane>
    </div>
  );
}

function RequestDetails({ cr, onAction, rail }) {
  const { user } = useAuth();
  return (
    <Section title="Request">
      <dl className={cn('grid gap-4', !rail && 'sm:grid-cols-2')}>
        <Field label="System" value={systemName(cr)} />
        <Field label="Requestor" value={[cr.requestor?.name, cr.requestor?.department].filter(Boolean).join(' · ')} />
        <Field label="Approving Officer" value={cr.approvingOfficer?.name || 'Not needed'} />
        <Field label="Target Date" value={formatDate(cr.targetDate)} />
        <Field label="Submitted" value={formatDateTime(cr.submittedAt)} />
        <Field label="Regulatory Approval Needed" value={cr.regulatoryApprovalNeeded ? 'Yes' : 'No'} />
        {cr.processor && <Field label="REQ Processor" value={cr.processor.name} />}
        {cr.req && (
          <Field
            wide={!rail}
            label="REQ"
            value={(
              <ReqCard
                req={cr.req}
                team={isSaPm(user)}
                isOwner={cr.isOwner}
                canChange={cr.allowedActions?.includes('correct_req')}
                onChange={() => onAction('correct_req')}
              />
            )}
          />
        )}
      </dl>
    </Section>
  );
}

export default function CrDetail({ cr, onAction, editTo }) {
  const rail = useMediaQuery(WIDE);
  useAssistantTone(cr.status);
  const head = (
    <div className="space-y-4 px-5 py-5 sm:px-6">
      <ActionBar actions={cr.allowedActions} onAction={onAction} editTo={editTo} />
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-semibold text-subtle">{cr.crNo}</p>
          <h2 className="break-words text-xl font-semibold tracking-tight text-ink">{cr.title}</h2>
          <p className="text-xs text-muted-foreground">{metaOf(cr)}</p>
        </div>
        <StatusBadge status={cr.status} label={cr.statusLabel} className="text-xs" />
      </header>
      <CrProgress cr={cr} />
      <ReturnedBanner cr={cr} />
    </div>
  );
  const body = (
    <>
      <Section title="Business Case">
        <dl className="grid gap-4">
          <RichField label="Business Objective" value={cr.businessObjective} />
          <RichField label="Business Justification" value={cr.businessJustification} />
          <RichField label="Benefits" value={cr.benefits} />
        </dl>
      </Section>

      <Section title="Requirements & Process">
        <dl className="grid gap-4">
          <RichField label="Detailed Requirements" value={cr.detailedRequirements} />
          <RichField label="Proposed Process" value={cr.proposedProcess} />
          <RichField label="Proposed Process Flow" value={cr.processFlow} />
          <RichField label="Expected Behavior" value={cr.expectedBehavior} />
        </dl>
      </Section>

      <Section title="Attachments">
        <AttachmentList attachments={cr.attachments} />
      </Section>
    </>
  );

  return (
    <DetailLayout
      rail={rail}
      head={head}
      details={<RequestDetails cr={cr} onAction={onAction} rail={rail} />}
      body={body}
      activity={<Section title="Activity"><ActivityFeed history={cr.history} /></Section>}
    />
  );
}

function FieldSkeleton({ value = 'w-40' }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className={`h-4 ${value} max-w-full`} />
    </div>
  );
}

function SectionSkeleton({ children }) {
  return (
    <div className="space-y-4 border-t px-5 py-5 first:border-t-0 sm:px-6">
      <Skeleton className="h-3 w-28" />
      {children}
    </div>
  );
}

// for slow loads
export function CrDetailSkeleton() {
  const rail = useMediaQuery(WIDE);
  const head = (
    <div className="space-y-4 px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>
      <div className="flex pt-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex min-w-[112px] flex-1 flex-col items-center gap-2 px-1">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DetailLayout
      aria-busy="true"
      aria-label="Loading request"
      rail={rail}
      head={head}
      details={(
        <SectionSkeleton>
          <div className={cn('grid gap-4', !rail && 'sm:grid-cols-2')}>
            {['w-32', 'w-44', 'w-36', 'w-28', 'w-40', 'w-12'].map((w, i) => <FieldSkeleton key={i} value={w} />)}
          </div>
        </SectionSkeleton>
      )}
      body={(
        <SectionSkeleton>
          {['w-full', 'w-5/6', 'w-2/3'].map((w, i) => <FieldSkeleton key={i} value={w} />)}
        </SectionSkeleton>
      )}
      activity={(
        <SectionSkeleton>
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56 max-w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </SectionSkeleton>
      )}
    />
  );
}
