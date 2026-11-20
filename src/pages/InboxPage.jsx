import { Archive, Hourglass, Inbox } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Page from '@/components/layout/Page';
import CrWorkspace from '@/components/requests/CrWorkspace';
import StatCards from '@/components/requests/StatCards';
import { isReviewer } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import { useSummary } from '@/context/SummaryContext';
import { listQueue, listTracked } from '@/services/crService';

const ACTION_TAB = {
  value: 'action',
  label: 'For my action',
  load: listQueue,
  empty: { icon: Inbox, title: 'All caught up', text: 'No CRs are waiting for your action.' },
};

const REVIEWER_TABS = [
  ACTION_TAB,
  {
    value: 'progress',
    label: 'In progress',
    load: (params) => listTracked({ ...params, tab: 'progress' }),
    empty: { icon: Hourglass, title: 'Nothing in progress', text: 'Open CRs from every step show up here.' },
  },
  {
    value: 'closed',
    label: 'Closed',
    load: (params) => listTracked({ ...params, tab: 'closed' }),
    empty: { icon: Archive, title: 'No closed CRs yet', text: 'Completed and rejected CRs show up here.' },
  },
];

export default function InboxPage() {
  const { user } = useAuth();
  const { summary } = useSummary();
  const reviewer = isReviewer(user);

  return (
    <Page fill>
      <PageHeader title="Inbox" hint="Change requests that need your review or approval." />
      {reviewer && <div className="mb-6"><StatCards summary={summary} /></div>}
      <CrWorkspace basePath="/inbox" tabs={reviewer ? REVIEWER_TABS : [ACTION_TAB]} />
    </Page>
  );
}
