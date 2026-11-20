export const SYSTEM_TYPES = {
  website: 'Website',
  mobile_app: 'Mobile App',
  kiosk: 'Self-Service Kiosk',
  internal_app: 'Internal Application',
  others: 'Others',
};

export const REQUEST_TYPES = {
  enhancement: 'Enhancement',
  new_feature: 'New Features',
  process_change: 'Process Change',
};

export const INTERNAL_APPS = [
  'Asset Requisition',
  'Branch Finder',
  'Contract Vault',
  'Customer Helpdesk',
  'Digital Signage CMS',
  'Expense Claims',
  'IT Service Desk',
  'Leave Management',
  'Partner Portal',
  'Promotions Manager',
  'Timekeeping',
  'Training Hub',
  'Transactions Hub',
  'Vendor Onboarding',
];

export const STATUS_LABELS = {
  submitted: 'CR Submitted',
  pending_ao: 'Pending Approving Officer',
  pending_sapm: 'SA/PM Review',
  returned: 'Returned to Requestor',
  pending_final: 'Pending Final Approval',
  pending_req: 'Approved, Pending REQ',
  req_processing: 'REQ Processing',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const OPEN_STATUSES = ['pending_ao', 'pending_sapm', 'returned', 'pending_final'];
export const CLOSED_STATUSES = ['pending_req', 'req_processing', 'completed', 'rejected'];
export const PENDING_STATUSES = OPEN_STATUSES.filter((s) => s !== 'returned');

export const FILE_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.vsdx': 'application/vnd.ms-visio.drawing',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.drawio': 'application/vnd.jgraph.mxfile',
  '.txt': 'text/plain',
};

export const UPLOADS = { maxFileBytes: 10 * 1024 * 1024, maxFiles: 5 };

// for decision links: which actions each email step offers
export const EMAIL_ACTIONS = {
  pending_ao: ['approve', 'disapprove'],
  pending_sapm: ['accept', 'return'],
  pending_final: ['approve', 'disapprove'],
};

export const REQ_STATUS_NAMES = { new: 'To Do', indeterminate: 'In Progress', done: 'Done' };
