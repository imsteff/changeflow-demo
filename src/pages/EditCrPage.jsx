import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ChevronLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import LeaveGuard from '@/components/common/LeaveGuard';
import LoadError from '@/components/common/LoadError';
import PageHeader from '@/components/common/PageHeader';
import CrFormSkeleton from '@/components/cr/CrFormSkeleton';
import CrWizard from '@/components/cr/CrWizard';
import Page from '@/components/layout/Page';
import ActionDialog from '@/components/requests/ActionDialog';
import CrNotFound from '@/components/requests/CrNotFound';
import EmptyState from '@/components/requests/EmptyState';
import ReturnedBanner from '@/components/requests/ReturnedBanner';
import { ACTIONS } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import { useSummary } from '@/context/SummaryContext';
import useAsync from '@/hooks/useAsync';
import useCrForm from '@/hooks/useCrForm';
import { getCr, getOptions, resubmitCr } from '@/services/crService';
import { filesFromCr, fromCr, toResubmitFormData } from '@/utils/crForm';
import { statusMessage } from '@/utils/format';

function ResubmitForm({ cr, options }) {
  const { user } = useAuth();
  const { refresh: refreshSummary } = useSummary();
  const navigate = useNavigate();
  const form = useCrForm(options, () => ({ values: fromCr(cr), files: filesFromCr(cr) }));
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  // for LeaveGuard: navigate once the guard is off
  useEffect(() => {
    if (done) navigate(`/requests/${cr.crNo}`, { replace: true });
  }, [done, navigate, cr.crNo]);

  const openConfirm = () => {
    if (form.validate()) setConfirming(true);
  };

  const resubmit = async (note) => {
    const data = await form.submit(
      (onProgress) => resubmitCr(cr.crNo, toResubmitFormData(form.values, form.files, cr.attachments, note), onProgress),
      'Your CR was not resubmitted, please try again',
    );
    if (!data) return;
    toast.success(ACTIONS.resubmit.toast, { description: statusMessage(data) });
    refreshSummary();
    setDone(true);
  };

  return (
    <div ref={form.topRef} className="scroll-mt-24 space-y-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <ReturnedBanner cr={cr} />
      <CrWizard
        form={form}
        options={options}
        user={user}
        onSubmit={openConfirm}
        submitLabel="Resubmit CR"
        submittingLabel="Resubmitting"
        errorTitle="Not resubmitted"
      />
      {confirming && (
        <ActionDialog
          action="resubmit"
          crNo={cr.crNo}
          onConfirm={resubmit}
          onClose={() => setConfirming(false)}
        />
      )}
      <LeaveGuard when={form.dirty && !done} />
    </div>
  );
}

export default function EditCrPage() {
  const { crNo } = useParams();
  const page = useAsync(
    () => Promise.all([getCr(crNo), getOptions()]).then(([cr, options]) => ({ cr, options })),
    [crNo],
  );

  let body;
  if (page.status === 404) {
    body = <CrNotFound />;
  } else if (page.error && !page.data) {
    body = <LoadError title="Cannot load this CR" message={page.error} onRetry={page.reload} />;
  } else if (!page.data) {
    body = <CrFormSkeleton />;
  } else if (!page.data.cr.allowedActions?.includes('resubmit')) {
    body = (
      <div className="rounded-xl border bg-card">
        <EmptyState icon={Lock} title="This CR cannot be edited">Only CRs returned to you can be edited and resubmitted.</EmptyState>
      </div>
    );
  } else {
    body = <ResubmitForm key={crNo} cr={page.data.cr} options={page.data.options} />;
  }

  return (
    <Page fill className="max-w-6xl">
      <Link to={`/requests/${crNo}`} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-subtle hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> Back to {crNo}
      </Link>
      <PageHeader title={`Edit & Resubmit ${crNo}`} hint="Update this CR based on the remarks, then send it back for review." />
      {body}
    </Page>
  );
}
