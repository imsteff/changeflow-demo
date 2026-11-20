import { format, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import RichText from '@/components/common/RichText';
import { formatBytes } from '@/utils/crForm';
import { hasRichText } from '@/utils/richText';

const labelOf = (list, value) => list.find((o) => o.value === value)?.label || value;

function Row({ label, children }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-muted-foreground sm:col-span-2">{children || '-'}</dd>
    </div>
  );
}

const rich = (html) => (hasRichText(html) ? <RichText value={html} /> : null);

function FileList({ files }) {
  if (!files.length) return null;
  return (
    <ul className="space-y-0.5">
      {files.map((f) => <li key={`${f.name}-${f.size}`}>{f.name} ({formatBytes(f.size)})</li>)}
    </ul>
  );
}

function Section({ title, stepIndex, onEdit, children }) {
  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => onEdit(stepIndex)}>
          Edit
        </Button>
      </div>
      <dl className="divide-y">{children}</dl>
    </section>
  );
}

export default function CrReview({ values, files, options, user, onEdit }) {
  const system = values.systemType === 'internal_app'
    ? `${labelOf(options.systemTypes, 'internal_app')}: ${values.appName}`
    : values.systemType === 'others'
      ? `${labelOf(options.systemTypes, 'others')}: ${values.systemOther.trim()}`
      : labelOf(options.systemTypes, values.systemType);

  const target = values.targetDate
    ? format(parse(values.targetDate, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')
    : '';

  return (
    <div className="space-y-6">
      <Section title="Request Information" stepIndex={0} onEdit={onEdit}>
        <Row label="Requestor">{user.name || user.uname}</Row>
        <Row label="System">{system}</Row>
        <Row label="CR Title">{values.title.trim()}</Row>
        <Row label="Request Type">{labelOf(options.requestTypes, values.requestType)}</Row>
      </Section>

      <Section title="Business Case" stepIndex={1} onEdit={onEdit}>
        <Row label="Business Objective">{rich(values.businessObjective)}</Row>
        <Row label="Business Justification">{rich(values.businessJustification)}</Row>
        <Row label="Benefits">{rich(values.benefits)}</Row>
      </Section>

      <Section title="Requirements & Process" stepIndex={2} onEdit={onEdit}>
        <Row label="Detailed Requirements">{rich(values.detailedRequirements)}</Row>
        <Row label="Proposed Process">{rich(values.proposedProcess)}</Row>
        <Row label="Proposed Process Flow">{rich(values.processFlow)}</Row>
        <Row label="Process Flow Attachments"><FileList files={files.processFlowFiles} /></Row>
        <Row label="Expected Behavior">{rich(values.expectedBehavior)}</Row>
      </Section>

      <Section title="Compliance & Implementation" stepIndex={3} onEdit={onEdit}>
        <Row label="Regulatory Approval Needed">{values.regulatoryApprovalNeeded === 'yes' ? 'Yes' : 'No'}</Row>
        {values.regulatoryApprovalNeeded === 'yes' && (
          <Row label="Regulatory Documents"><FileList files={files.regulatoryFiles} /></Row>
        )}
        <Row label="Target Implementation Date">{target}</Row>
      </Section>
    </div>
  );
}
