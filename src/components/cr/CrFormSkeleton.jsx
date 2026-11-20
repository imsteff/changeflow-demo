import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { STEPS } from '@/utils/crForm';

export default function CrFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading form" className="grid gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_1fr] lg:grid-rows-1">
      <aside>
        <Skeleton className="h-1.5 w-full lg:hidden" />
        <div className="hidden space-y-8 lg:block">
          {Array.from({ length: STEPS.length }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <Card className="overflow-hidden shadow-sm lg:flex lg:min-h-0 lg:flex-col">
        <CardHeader className="space-y-4 border-b">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6 sm:p-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-4 sm:px-8">
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    </div>
  );
}
