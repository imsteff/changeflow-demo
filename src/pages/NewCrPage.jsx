import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useSummary } from '@/context/SummaryContext';
import { getOptions, submitCr } from '@/services/crService';
import LeaveGuard from '@/components/common/LeaveGuard';
import LoadError from '@/components/common/LoadError';
import PageHeader from '@/components/common/PageHeader';
import CrFormSkeleton from '@/components/cr/CrFormSkeleton';
import CrSuccess from '@/components/cr/CrSuccess';
import CrWizard from '@/components/cr/CrWizard';
import Page from '@/components/layout/Page';
import InboxBanner from '@/components/requests/InboxBanner';
import useAsync from '@/hooks/useAsync';
import useCrForm from '@/hooks/useCrForm';
import { initialFiles, initialValues, toFormData } from '@/utils/crForm';
import { statusMessage } from '@/utils/format';

const newStart = () => ({ values: initialValues(), files: initialFiles() });

export default function NewCrPage() {
  const { user } = useAuth();
  const { refresh: refreshSummary } = useSummary();
  const { data: options, error: loadError, reload: loadOptions } = useAsync(getOptions, []);
  const form = useCrForm(options, newStart);
  const [result, setResult] = useState(null);

  const submit = async () => {
    const data = await form.submit(
      (onProgress) => submitCr(toFormData(form.values, form.files), onProgress),
      'Your CR was not submitted, please try again',
    );
    if (!data) return;
    toast.success('CR submitted', { description: statusMessage(data) });
    setResult(data);
    refreshSummary();
    form.topRef.current?.scrollIntoView({ block: 'start' });
  };

  const startOver = () => {
    form.reset();
    setResult(null);
  };

  let body;
  if (loadError && !options) {
    body = <LoadError title="Cannot load the form" message={loadError} onRetry={loadOptions} />;
  } else if (!options) {
    body = <CrFormSkeleton />;
  } else if (result) {
    body = <CrSuccess result={result} onStartOver={startOver} />;
  } else {
    body = <CrWizard form={form} options={options} user={user} onSubmit={submit} />;
  }

  return (
    <Page fill className="max-w-6xl">
      <InboxBanner />
      <div ref={form.topRef} className="scroll-mt-24 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        {!result && (
          <PageHeader title="New Change Request">
            Submit a request to change, enhance, or fix a system. Fields marked{' '}
            <span className="text-destructive">*</span> are required.
          </PageHeader>
        )}
        {body}
      </div>
      <LeaveGuard when={form.dirty && !result} />
    </Page>
  );
}
