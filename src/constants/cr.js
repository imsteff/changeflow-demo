export const ROLES = {
  REQUESTOR: 'requestor',
  SA_PM: 'sa-pm',
  GENERAL_MANAGER: 'general-manager',
};

const REVIEWER_ROLES = [ROLES.SA_PM, ROLES.GENERAL_MANAGER];

export const isReviewer = (user) => REVIEWER_ROLES.includes(user?.role);

export const isSaPm = (user) => user?.role === ROLES.SA_PM;

// for AO-only users, who have no ChangeFlow role
export const canSubmit = (user) => Boolean(user?.role);

// for REQ tracker links: completed CRs sit in the Inbox closed tab
export const crTrackerLink = (crNo) => `/inbox/${crNo}?tab=closed`;

export const systemName = (cr) => cr.appName || cr.systemOther || cr.systemLabel;

const WAITING = 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';

export const STATUS_STYLES = {
  submitted: WAITING,
  pending_ao: WAITING,
  pending_sapm: WAITING,
  pending_final: WAITING,
  returned: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30',
  pending_req: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  req_processing: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  rejected: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
};

// for the chameleon skin
export const ASSISTANT_TONE = '#FA9A21';
export const STATUS_TONES = {
  submitted: ASSISTANT_TONE,
  pending_ao: ASSISTANT_TONE,
  pending_sapm: '#3b82f6',
  pending_final: '#8b5cf6',
  returned: '#64748b',
  pending_req: '#0ea5e9',
  req_processing: '#0ea5e9',
  completed: '#16a34a',
  rejected: '#dc2626',
};

export const REMARKS_MAX = 2000;

// for ActionBar and ActionDialog
export const ACTIONS = {
  approve: {
    label: 'Approve',
    pendingLabel: 'Approving',
    primary: true,
    title: 'Approve this CR?',
    description: 'The CR moves to the next step.',
    toast: 'CR approved',
  },
  disapprove: {
    label: 'Disapprove',
    pendingLabel: 'Disapproving',
    danger: true,
    title: 'Disapprove this CR?',
    description: 'This rejects the CR and cannot be undone. Tell the requestor why.',
    remarksRequired: true,
    toast: 'CR disapproved',
  },
  accept: {
    label: 'Accept',
    pendingLabel: 'Accepting',
    primary: true,
    title: 'Accept this CR?',
    description: 'The CR goes to the general manager for final approval.',
    toast: 'CR accepted',
  },
  return: {
    label: 'Return',
    pendingLabel: 'Returning',
    title: 'Return this CR to the requestor?',
    description: 'The requestor can edit and resubmit it. Tell them what to change.',
    remarksRequired: true,
    toast: 'CR returned to the requestor',
  },
  resubmit: {
    label: 'Resubmit CR',
    pendingLabel: 'Resubmitting',
    primary: true,
    title: 'Resubmit this CR?',
    description: 'It goes back for review. You can add a note about what you changed.',
    toast: 'CR resubmitted',
  },
  claim: {
    label: 'Start processing',
    pendingLabel: 'Starting',
    primary: true,
    title: 'Start processing this CR?',
    description: 'It moves to you so no one else picks it up. You can release it later if someone else should take it.',
    toast: 'You are now processing this CR',
  },
  release: {
    label: 'Release',
    pendingLabel: 'Releasing',
    title: 'Release this CR?',
    description: 'It goes back to the SA/PM queue so another SA/PM can pick it up.',
    toast: 'CR released',
    message: (crNo) => `${crNo} is back in the SA/PM queue`,
  },
  enter_req: {
    label: 'Enter REQ',
    primary: true,
  },
};

// for ReqDialog
export const REQ_DIALOGS = {
  enter_req: {
    title: 'Enter the REQ for this CR',
    description: 'Create the REQ in Jira from this CR, or link one that already exists. The CR is completed once its REQ is set.',
    toast: (key) => `${key} saved to the CR`,
  },
  correct_req: {
    title: 'Change the REQ number?',
    description: 'Use this when the wrong REQ was linked. The change shows in the activity.',
    label: 'Change REQ',
    pendingLabel: 'Changing',
    toast: (key) => `REQ changed to ${key}`,
  },
};

export const REQ_MODES = { CREATE: 'create', LINK: 'link' };

export const REQ_KEY_PATTERN = /^REQ-[1-9]\d{0,8}$/;

export const REQ_STATUS_STYLES = {
  new: 'bg-muted text-muted-foreground ring-border',
  indeterminate: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
};

// for the REQ tracker tabs, by Jira status category
export const REQ_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'To Do' },
  { value: 'indeterminate', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const HISTORY_LABELS = {
  submitted: 'Submitted the CR',
  sent_to_ao: 'Sent to the approving officer',
  ao_skipped: 'Approving officer step skipped',
  ao_approved: 'Approved as approving officer',
  ao_disapproved: 'Disapproved as approving officer',
  sapm_accepted: 'Accepted in SA/PM review',
  sapm_returned: 'Returned to the requestor',
  sapm_returned_at_ao: 'Returned to the requestor before approving officer review',
  resubmitted: 'Resubmitted the CR',
  gm_approved: 'Gave final approval',
  gm_disapproved: 'Disapproved at final approval',
  req_claimed: 'Started processing the REQ',
  req_released: 'Released the CR back to the SA/PM queue',
  req_created: 'Created the REQ in Jira',
  req_linked: 'Linked the REQ',
  req_corrected: 'Changed the REQ number',
  req_status_changed: 'Updated the REQ status',
};

export const FIELD_LABELS = {
  systemType: 'System',
  appName: 'Internal Application',
  systemOther: 'Other system',
  title: 'CR Title',
  requestType: 'Request Type',
  businessObjective: 'Business Objective',
  businessJustification: 'Business Justification',
  benefits: 'Benefits',
  detailedRequirements: 'Detailed Requirements',
  proposedProcess: 'Proposed Process',
  processFlow: 'Proposed Process Flow',
  expectedBehavior: 'Expected Behavior',
  regulatoryApprovalNeeded: 'Regulatory Approval',
  targetDate: 'Target Date',
};
