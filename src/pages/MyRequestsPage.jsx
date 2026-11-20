import { Link } from 'react-router';
import { Files } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Page from '@/components/layout/Page';
import CrWorkspace from '@/components/requests/CrWorkspace';
import { listMine } from '@/services/crService';

const TABS = [{
  value: 'mine',
  label: 'My requests',
  load: listMine,
  empty: {
    icon: Files,
    title: 'No requests yet',
    text: <>CRs you submit show up here. <Link to="/" className="font-medium text-brand-hover hover:underline">Submit a CR</Link></>,
  },
}];

export default function MyRequestsPage() {
  return (
    <Page fill>
      <PageHeader title="My Requests" hint="Track the CRs you submitted and fix the ones returned to you." />
      <CrWorkspace basePath="/requests" tabs={TABS} />
    </Page>
  );
}
