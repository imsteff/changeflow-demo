import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// for unsaved forms
export default function LeaveGuard({ when }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname);
  const open = blocker.state === 'blocked';

  useEffect(() => {
    if (!when) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [when]);

  // for Stay and Escape
  const stay = (next) => {
    if (!next && blocker.state === 'blocked') blocker.reset();
  };

  return (
    <AlertDialog open={open} onOpenChange={stay}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave this page?</AlertDialogTitle>
          <AlertDialogDescription>Your changes on this form will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <Button variant="destructive" onClick={() => { if (blocker.state === 'blocked') blocker.proceed(); }}>Leave</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
