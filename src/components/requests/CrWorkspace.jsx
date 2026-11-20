import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { MousePointerClick } from 'lucide-react';
import { toast } from 'sonner';
import LoadError from '@/components/common/LoadError';
import ActionDialog from '@/components/requests/ActionDialog';
import CrDetail, { BackLink, CrDetailSkeleton } from '@/components/requests/CrDetail';
import CrList from '@/components/requests/CrList';
import CrNotFound from '@/components/requests/CrNotFound';
import EmptyState from '@/components/requests/EmptyState';
import ReqDialog from '@/components/requests/ReqDialog';
import { ACTIONS, REQ_DIALOGS } from '@/constants/cr';
import { useSummary } from '@/context/SummaryContext';
import useAsync from '@/hooks/useAsync';
import useUrlParams from '@/hooks/useUrlParams';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/services/api';
import {
  actOnCr, correctReq, enterReq, getCr,
} from '@/services/crService';
import { statusMessage } from '@/utils/format';

const PAGE_SIZE = 20;

function DetailPane({ crNo, detail, onAction, backTo }) {
  if (!crNo) {
    return (
      <div className="rounded-xl border border-dashed bg-card">
        <EmptyState icon={MousePointerClick} title="Select a CR">Pick a request from the list to see its details.</EmptyState>
      </div>
    );
  }
  let body;
  if (detail.status === 404) {
    body = <CrNotFound />;
  } else if (detail.error && !detail.data) {
    body = <LoadError title="Cannot load this CR" message={detail.error} onRetry={detail.reload} />;
  } else if (!detail.data) {
    body = <CrDetailSkeleton />;
  } else {
    body = <CrDetail cr={detail.data} onAction={onAction} editTo={`/requests/${crNo}/edit`} />;
  }
  return (
    <>
      <BackLink to={backTo} />
      {body}
    </>
  );
}

// for Inbox and My Requests
export default function CrWorkspace({ basePath, tabs }) {
  const { crNo } = useParams();
  const { search } = useLocation();
  const [params, updateParams] = useUrlParams();
  const { refresh: refreshSummary } = useSummary();
  const [action, setAction] = useState(null);

  const tab = tabs.find((t) => t.value === params.get('tab')) || tabs[0];
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);

  const list = useAsync(() => tab.load({ page, pageSize: PAGE_SIZE }), [tab.value, page]);
  const detail = useAsync(() => (crNo ? getCr(crNo) : null), [crNo]);

  const refreshAll = () => {
    list.reload();
    detail.reload();
    refreshSummary();
  };

  const settle = async (send, notify) => {
    try {
      notify(await send());
    } catch (err) {
      if (err?.response?.status !== 409) throw err;
      toast.error(errorMessage(err));
    }
    refreshAll();
  };

  const runAction = (remarks) => settle(
    () => actOnCr(crNo, action, remarks),
    (result) => toast.success(ACTIONS[action].toast, {
      description: ACTIONS[action].message?.(crNo) || statusMessage({ crNo, ...result }),
    }),
  );

  const runReq = (input) => settle(
    () => (action === 'correct_req' ? correctReq(crNo, input) : enterReq(crNo, input)),
    (result) => toast.success(REQ_DIALOGS[action].toast(result.reqKey), { description: statusMessage({ crNo, ...result }) }),
  );

  return (
    <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className={cn('lg:flex lg:min-h-0 lg:flex-col', crNo && 'hidden')}>
        <CrList
          list={list}
          page={page}
          pageSize={PAGE_SIZE}
          onPage={(p) => updateParams({ page: p > 1 ? p : null })}
          linkTo={(no) => ({ pathname: `${basePath}/${no}`, search })}
          selectedCrNo={crNo}
          tabs={tabs.length > 1 ? tabs : null}
          tab={tab.value}
          onTab={(value) => updateParams({ tab: value === tabs[0].value ? null : value, page: null })}
          empty={tab.empty}
        />
      </div>

      <div key={crNo} className={cn('min-w-0 lg:flex lg:min-h-0 lg:flex-col', !crNo && 'hidden lg:flex')}>
        <DetailPane crNo={crNo} detail={detail} onAction={setAction} backTo={{ pathname: basePath, search }} />
      </div>

      {action && REQ_DIALOGS[action] && (
        <ReqDialog
          key={action}
          action={action}
          crNo={crNo}
          currentKey={detail.data?.req?.key}
          onConfirm={runReq}
          onClose={() => setAction(null)}
        />
      )}
      {action && !REQ_DIALOGS[action] && (
        <ActionDialog key={action} action={action} crNo={crNo} onConfirm={runAction} onClose={() => setAction(null)} />
      )}
    </div>
  );
}
