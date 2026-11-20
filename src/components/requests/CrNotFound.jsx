import { FileSearch } from 'lucide-react';
import EmptyState from '@/components/requests/EmptyState';

export default function CrNotFound() {
  return (
    <div className="rounded-xl border bg-card">
      <EmptyState icon={FileSearch} title="Change request not found">It may have been removed or you may not have access to it.</EmptyState>
    </div>
  );
}
