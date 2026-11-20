import { Building2, Mail, User } from 'lucide-react';

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="truncate text-sm font-medium" title={value || undefined}>{value || '-'}</p>
    </div>
  );
}

export default function RequestorSummary({ user }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Requestor</h3>
      <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3">
        <InfoItem label="Name" icon={User} value={user.name || user.uname} />
        <InfoItem label="Department" icon={Building2} value={user.department} />
        <InfoItem label="Email" icon={Mail} value={user.email} />
      </div>
    </section>
  );
}
