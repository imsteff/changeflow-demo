import { toast } from 'sonner';

// for the demo: Jira links do not leave the page
export const jiraDemoClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  toast.info('Demo mode: Jira is not connected');
};
