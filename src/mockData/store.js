import {
  CLOSED_STATUSES, EMAIL_ACTIONS, FILE_TYPES, INTERNAL_APPS, OPEN_STATUSES, PENDING_STATUSES,
  REQUEST_TYPES, REQ_STATUS_NAMES, STATUS_LABELS, SYSTEM_TYPES, UPLOADS,
} from './constants';
import { APPROVING_OFFICERS, PERSONAS, getDemoUser } from './demoAuth';
import { buildSeed } from './seed';

const STORE_KEY = 'changeflow.demo.store';
const STALE_MESSAGE = 'This CR is not waiting for your action, refresh to see the latest';
const REVIEWERS = ['sa-pm', 'general-manager'];
const SAPM_NAME = PERSONAS['sa-pm'].name;
const GM = PERSONAS['general-manager'];

export const httpError = (status, message, details) => {
  const err = new Error(message);
  err.response = { status, data: { message, details } };
  return err;
};

const load = () => {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // for private mode
  }
  return buildSeed();
};

let db = load();

const save = () => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    // for private mode
  }
};

export const resetDemo = () => {
  db = buildSeed();
  save();
};

export const delay = (value) => new Promise((resolve, reject) => {
  setTimeout(() => (value instanceof Error ? reject(value) : resolve(value)), 250 + Math.random() * 200);
});

const nowIso = () => new Date().toISOString();
const find = (crNo) => db.crs.find((c) => c.cr_no === crNo);

// for workflow rules ported from the server
const isOwner = (user, cr) => cr.requestor_uname === user.uname;
const isAo = (user, cr) => Boolean(cr.approving_officer_emp_id) && cr.approving_officer_emp_id === user.employeeId;
const isReviewer = (user) => REVIEWERS.includes(user.role);
const canView = (user, cr) => isOwner(user, cr) || isAo(user, cr) || isReviewer(user);

const MOVES = {
  pending_ao: {
    approve: { to: 'pending_sapm', action: 'ao_approved', who: isAo },
    disapprove: { to: 'rejected', action: 'ao_disapproved', who: isAo, remarks: true },
    return: { to: 'returned', action: 'sapm_returned_at_ao', who: (u, cr) => u.role === 'sa-pm' && !isOwner(u, cr), remarks: true },
  },
  pending_sapm: {
    accept: { to: 'pending_final', action: 'sapm_accepted', who: (u) => u.role === 'sa-pm' },
    return: { to: 'returned', action: 'sapm_returned', who: (u) => u.role === 'sa-pm', remarks: true },
  },
  pending_final: {
    approve: { to: 'pending_req', action: 'gm_approved', who: (u) => u.role === 'general-manager' },
    disapprove: { to: 'rejected', action: 'gm_disapproved', who: (u) => u.role === 'general-manager', remarks: true },
  },
  pending_req: {
    claim: { to: 'req_processing', action: 'req_claimed', who: (u) => u.role === 'sa-pm' },
  },
  req_processing: {
    release: { to: 'pending_req', action: 'req_released', who: (u, cr) => cr.processed_by === u.uname },
  },
};

const allowedActions = (user, cr) => {
  const actions = Object.entries(MOVES[cr.status] || {}).filter(([, m]) => m.who(user, cr)).map(([a]) => a);
  if (cr.status === 'returned' && isOwner(user, cr) && user.role) actions.push('resubmit');
  if (cr.status === 'req_processing' && cr.processed_by === user.uname) actions.push('enter_req');
  if (cr.status === 'completed' && cr.req_key && user.role === 'sa-pm') actions.push('correct_req');
  return actions;
};

const systemName = (cr) => cr.app_name || cr.system_other || SYSTEM_TYPES[cr.system_type];

const toReq = (cr) => (cr.req_key
  ? { key: cr.req_key, url: '#', status: cr.req_status, statusCategory: cr.req_status_category }
  : null);

const processorOf = (cr) => (cr.processed_by ? { name: cr.processor_name || cr.processed_by } : null);

const toSummary = (cr) => ({
  crNo: cr.cr_no,
  title: cr.title,
  systemType: cr.system_type,
  systemLabel: SYSTEM_TYPES[cr.system_type],
  appName: cr.app_name,
  systemOther: cr.system_other,
  requestType: cr.request_type,
  requestTypeLabel: REQUEST_TYPES[cr.request_type],
  status: cr.status,
  statusLabel: STATUS_LABELS[cr.status] || cr.status,
  requestorName: cr.requestor_name,
  targetDate: cr.target_date,
  submittedAt: cr.submitted_at,
  updatedAt: cr.updatedAt,
  req: toReq(cr),
});

const toReqItem = (cr) => ({ ...toSummary(cr), processor: processorOf(cr), processedAt: cr.processed_at });

const toDetail = (cr, user) => ({
  ...toSummary(cr),
  revision: cr.revision,
  requestor: {
    uname: cr.requestor_uname, name: cr.requestor_name, email: cr.requestor_email, department: cr.requestor_department,
  },
  approvingOfficer: cr.approving_officer_emp_id ? { name: cr.approving_officer_name, email: cr.approving_officer_email } : null,
  businessObjective: cr.business_objective,
  businessJustification: cr.business_justification,
  benefits: cr.benefits,
  detailedRequirements: cr.detailed_requirements,
  proposedProcess: cr.proposed_process,
  processFlow: cr.process_flow,
  expectedBehavior: cr.expected_behavior,
  regulatoryApprovalNeeded: Boolean(cr.regulatory_approval_needed),
  reqKey: cr.req_key,
  req: cr.req_key ? { ...toReq(cr), summary: cr.req_summary, syncedAt: cr.req_synced_at } : null,
  processor: processorOf(cr),
  processedAt: cr.processed_at,
  isOwner: isOwner(user, cr),
  allowedActions: allowedActions(user, cr),
  attachments: cr.attachments.filter((a) => !a.removed_at).map((a) => ({
    id: a.id, category: a.category, name: a.original_name, mimeType: a.mime_type, sizeBytes: a.size_bytes, uploadedAt: a.createdAt,
  })),
  history: cr.history.map((h) => ({
    action: h.action,
    fromStatus: h.from_status,
    toStatus: h.to_status,
    toStatusLabel: STATUS_LABELS[h.to_status] || h.to_status,
    actorUname: h.actor_uname,
    actorName: h.actor_name,
    remarks: h.remarks,
    changes: h.changes,
    revision: h.revision,
    at: h.createdAt,
  })),
});

const byDesc = (key) => (a, b) => String(b[key] || '').localeCompare(String(a[key] || ''));

const paged = (rows, params = {}, map = toSummary) => {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize).map(map),
    total: rows.length,
    page,
    pageSize,
  };
};

const queueParts = (user, cr) => ({
  ao: cr.status === 'pending_ao' && isAo(user, cr),
  final: user.role === 'general-manager' && cr.status === 'pending_final',
  sapm: user.role === 'sa-pm' && cr.status === 'pending_sapm',
  reqPending: user.role === 'sa-pm' && cr.status === 'pending_req',
  reqMine: user.role === 'sa-pm' && cr.status === 'req_processing' && cr.processed_by === user.uname,
});

const inQueue = (user, cr) => Object.values(queueParts(user, cr)).some(Boolean);

const tracked = (user, cr, tab) => {
  if (tab === 'closed') {
    if (user.role === 'sa-pm') {
      return ['req_processing', 'completed', 'rejected'].includes(cr.status)
        && !(cr.status === 'req_processing' && cr.processed_by === user.uname);
    }
    return CLOSED_STATUSES.includes(cr.status);
  }
  if (!OPEN_STATUSES.includes(cr.status)) return false;
  if (cr.status === 'pending_ao' && isAo(user, cr)) return false;
  if (user.role === 'sa-pm' && cr.status === 'pending_sapm') return false;
  if (user.role === 'general-manager' && cr.status === 'pending_final') return false;
  return true;
};

const user = () => getDemoUser();

export const getOptions = () => ({
  systemTypes: Object.entries(SYSTEM_TYPES).map(([value, label]) => ({ value, label })),
  requestTypes: Object.entries(REQUEST_TYPES).map(([value, label]) => ({ value, label })),
  internalApps: INTERNAL_APPS,
  uploads: { allowedExtensions: Object.keys(FILE_TYPES), maxFileBytes: UPLOADS.maxFileBytes, maxFiles: UPLOADS.maxFiles },
  jira: { enabled: true },
});

export const listMine = (params) => {
  const me = user();
  return paged(db.crs.filter((c) => isOwner(me, c)).sort(byDesc('submitted_at')), params);
};

export const listQueue = (params) => {
  const me = user();
  return paged(db.crs.filter((c) => inQueue(me, c)).sort(byDesc('updatedAt')), params);
};

export const listTracked = (params = {}) => {
  const me = user();
  if (!isReviewer(me)) throw httpError(403, 'Only SA/PM and the General Manager can view all CRs');
  const tab = params.tab === 'closed' ? 'closed' : 'progress';
  return paged(db.crs.filter((c) => tracked(me, c, tab)).sort(byDesc('updatedAt')), params);
};

export const listReqs = (params = {}) => {
  if (user().role !== 'sa-pm') throw httpError(403, 'Only SA/PM can view the REQ tracker');
  const q = String(params.q || '').trim().toLowerCase();
  const base = db.crs.filter((c) => c.req_key && (!q
    || [c.cr_no, c.req_key, c.title].some((v) => v.toLowerCase().includes(q))));
  const counts = { all: base.length, new: 0, indeterminate: 0, done: 0 };
  base.forEach((c) => { if (counts[c.req_status_category] !== undefined) counts[c.req_status_category] += 1; });
  const category = params.category && params.category !== 'all' ? params.category : null;
  const rows = (category ? base.filter((c) => c.req_status_category === category) : base).sort(byDesc('processed_at'));
  const syncedAt = base.map((c) => c.req_synced_at).sort().pop() || nowIso();
  return { ...paged(rows, params, toReqItem), counts, syncedAt };
};

export const getSummary = () => {
  const me = user();
  const mine = db.crs.filter((c) => isOwner(me, c));
  const queue = { ao: 0, final: 0, sapm: 0, reqPending: 0, reqMine: 0 };
  db.crs.forEach((c) => Object.entries(queueParts(me, c)).forEach(([k, v]) => { if (v) queue[k] += 1; }));
  const summary = {
    waiting: Object.values(queue).reduce((a, b) => a + b, 0),
    returned: mine.filter((c) => c.status === 'returned').length,
    pending: mine.filter((c) => PENDING_STATUSES.includes(c.status)).length,
    queue,
  };
  if (isReviewer(me)) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    summary.returnedToRequestor = db.crs.filter((c) => c.status === 'returned').length;
    summary.inProgress = db.crs.filter((c) => OPEN_STATUSES.includes(c.status) && c.status !== 'returned').length;
    summary.approvedThisMonth = db.crs.filter((c) => c.history.some((h) => h.action === 'gm_approved'
      && new Date(h.createdAt) >= monthStart)).length;
  }
  return summary;
};

const visible = (crNo) => {
  const me = user();
  const cr = find(crNo);
  if (!cr || !canView(me, cr)) throw httpError(404, 'Change request not found');
  return { me, cr };
};

export const getCr = (crNo) => {
  const { me, cr } = visible(crNo);
  return toDetail(cr, me);
};

const record = (cr, actor, action, to, { remarks = null, changes = null } = {}) => {
  const at = nowIso();
  cr.history.push({
    action,
    from_status: cr.status,
    to_status: to,
    actor_uname: changes?.via === 'email' ? actor.email : actor.uname,
    actor_name: actor.name,
    remarks: remarks || null,
    changes,
    revision: cr.revision,
    createdAt: at,
  });
  cr.status = to;
  cr.updatedAt = at;
};

const applyMove = (cr, actor, action, remarks, { via, check = true } = {}) => {
  const move = MOVES[cr.status]?.[action];
  if (!move || (check && !move.who(actor, cr))) throw httpError(409, STALE_MESSAGE);
  if (move.remarks && !String(remarks || '').trim()) {
    throw httpError(400, 'Please check the highlighted fields', { remarks: 'Please add remarks' });
  }
  if (action === 'claim') {
    cr.processed_by = actor.uname;
    cr.processor_name = actor.name;
  }
  if (action === 'release') {
    cr.processed_by = null;
    cr.processor_name = null;
  }
  record(cr, actor, move.action, move.to, { remarks: String(remarks || '').trim(), changes: via ? { via } : null });
};

export const actOnCr = (crNo, action, remarks) => {
  const { me, cr } = visible(crNo);
  applyMove(cr, me, action, remarks);
  save();
  return { crNo: cr.cr_no, status: cr.status, statusLabel: STATUS_LABELS[cr.status] };
};

const COLUMN_OF = {
  systemType: 'system_type',
  appName: 'app_name',
  systemOther: 'system_other',
  title: 'title',
  requestType: 'request_type',
  businessObjective: 'business_objective',
  businessJustification: 'business_justification',
  benefits: 'benefits',
  detailedRequirements: 'detailed_requirements',
  proposedProcess: 'proposed_process',
  processFlow: 'process_flow',
  expectedBehavior: 'expected_behavior',
  regulatoryApprovalNeeded: 'regulatory_approval_needed',
  targetDate: 'target_date',
};
const SHORT_FIELDS = new Set(['systemType', 'appName', 'systemOther', 'title', 'requestType', 'regulatoryApprovalNeeded', 'targetDate']);

const readForm = (formData) => {
  const get = (k) => {
    const v = formData.get(k);
    return typeof v === 'string' && v.trim() ? v.trim() : null;
  };
  const columns = Object.fromEntries(Object.entries(COLUMN_OF).map(([field, col]) => [col, get(field)]));
  columns.regulatory_approval_needed = get('regulatoryApprovalNeeded') === 'yes';
  if (columns.system_type !== 'internal_app') columns.app_name = null;
  if (columns.system_type !== 'others') columns.system_other = null;
  const files = [
    ...formData.getAll('processFlowFiles').map((f) => ['process_flow', f]),
    ...formData.getAll('regulatoryFiles').map((f) => ['regulatory', f]),
  ];
  return { columns, files, remarks: get('remarks'), removeIds: formData.getAll('removeAttachmentIds').map(Number) };
};

const required = ['system_type', 'title', 'request_type', 'business_objective', 'business_justification', 'benefits',
  'detailed_requirements', 'expected_behavior', 'target_date'];

const checkColumns = (columns) => {
  if (required.some((c) => !columns[c])) throw httpError(400, 'Please fill in all required fields');
};

const toAttachments = (files, at) => files.map(([category, file]) => ({
  id: db.nextAttachmentId++,
  category,
  original_name: file.name,
  mime_type: file.type || FILE_TYPES[file.name.slice(file.name.lastIndexOf('.')).toLowerCase()] || 'application/octet-stream',
  size_bytes: file.size,
  createdAt: at,
  removed_at: null,
}));

const aoOf = (me) => (me.level === 'Managerial' ? null : APPROVING_OFFICERS[me.approvingOfficerEmpId] || null);

const nextCrNo = () => {
  const year = new Date().getFullYear();
  const prefix = `CR-${year}-`;
  const max = db.crs.filter((c) => c.cr_no.startsWith(prefix)).reduce((m, c) => Math.max(m, Number(c.cr_no.slice(prefix.length))), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

export const submitCr = (formData) => {
  const me = user();
  if (!me.role) throw httpError(403, 'Your account cannot submit change requests');
  const { columns, files } = readForm(formData);
  checkColumns(columns);
  const at = nowIso();
  const ao = aoOf(me);
  const cr = {
    id: db.crs.length + 1,
    cr_no: nextCrNo(),
    requestor_uname: me.uname,
    requestor_name: me.name,
    requestor_email: me.email,
    requestor_department: me.department,
    ...columns,
    status: 'submitted',
    approving_officer_emp_id: ao?.employeeId || null,
    approving_officer_name: ao?.name || null,
    approving_officer_email: ao?.email || null,
    revision: 1,
    submitted_at: at,
    updatedAt: at,
    processed_by: null,
    processor_name: null,
    processed_at: null,
    req_key: null,
    req_summary: null,
    req_status: null,
    req_status_category: null,
    req_synced_at: null,
    attachments: toAttachments(files, at),
    history: [],
  };
  cr.history.push({
    action: 'submitted', from_status: null, to_status: 'submitted', actor_uname: me.uname, actor_name: me.name,
    remarks: null, changes: null, revision: 1, createdAt: at,
  });
  if (ao) record(cr, me, 'sent_to_ao', 'pending_ao');
  else record(cr, me, 'ao_skipped', 'pending_sapm', { remarks: 'Requestor is at Managerial level' });
  db.crs.push(cr);
  save();
  return {
    crNo: cr.cr_no,
    status: cr.status,
    statusLabel: STATUS_LABELS[cr.status],
    approvingOfficer: ao ? { name: ao.name } : null,
    emailStatus: 'demo',
  };
};

const sameValue = (col, a, b) => (col === 'regulatory_approval_needed' ? Boolean(a) === Boolean(b) : (a ?? null) === (b ?? null));

export const resubmitCr = (crNo, formData) => {
  const { me, cr } = visible(crNo);
  if (!isOwner(me, cr)) throw httpError(404, 'Change request not found');
  if (cr.status !== 'returned') throw httpError(409, STALE_MESSAGE);
  const { columns, files, remarks, removeIds } = readForm(formData);
  checkColumns(columns);

  const changes = {};
  Object.entries(COLUMN_OF).forEach(([field, col]) => {
    if (sameValue(col, cr[col], columns[col])) return;
    if (!SHORT_FIELDS.has(field)) changes[field] = { changed: true };
    else if (col === 'regulatory_approval_needed') changes[field] = { from: Boolean(cr[col]), to: Boolean(columns[col]) };
    else changes[field] = { from: cr[col] ?? null, to: columns[col] ?? null };
  });

  const at = nowIso();
  const removed = cr.attachments.filter((a) => !a.removed_at && removeIds.includes(a.id));
  removed.forEach((a) => { a.removed_at = at; });
  const added = toAttachments(files, at);
  cr.attachments.push(...added);
  if (added.length) changes.attachmentsAdded = added.map((a) => a.original_name);
  if (removed.length) changes.attachmentsRemoved = removed.map((a) => a.original_name);

  const lastReturn = [...cr.history].reverse().find((h) => h.to_status === 'returned');
  const toAo = lastReturn?.from_status === 'pending_ao';
  const ao = toAo ? aoOf(me) : null;
  if (toAo && (ao?.employeeId || null) !== cr.approving_officer_emp_id) {
    changes.approvingOfficer = { from: cr.approving_officer_name || null, to: ao?.name || null };
  }
  if (toAo) {
    cr.approving_officer_emp_id = ao?.employeeId || null;
    cr.approving_officer_name = ao?.name || null;
    cr.approving_officer_email = ao?.email || null;
  }

  Object.assign(cr, columns);
  cr.revision += 1;
  record(cr, me, 'resubmitted', toAo && ao ? 'pending_ao' : 'pending_sapm', {
    remarks, changes: Object.keys(changes).length ? changes : null,
  });
  save();
  return { crNo: cr.cr_no, status: cr.status, statusLabel: STATUS_LABELS[cr.status], revision: cr.revision };
};

const REQ_KEY_RE = /^[A-Z][A-Z0-9]+-\d+$/;

const checkKey = (cr, key) => {
  if (!REQ_KEY_RE.test(key)) throw httpError(400, 'Please check the highlighted fields', { reqKey: 'Enter a ticket key like REQ-123' });
  const other = db.crs.find((c) => c.req_key === key && c.cr_no !== cr.cr_no);
  if (other) throw httpError(400, 'Please check the highlighted fields', { reqKey: `${key} is already linked to ${other.cr_no}` });
};

const nextReqKey = () => `REQ-${db.crs.reduce((m, c) => Math.max(m, c.req_key ? Number(c.req_key.split('-')[1]) || 0 : 0), 1000) + 1}`;

const setReq = (cr, key, linked) => {
  cr.req_key = key;
  cr.req_summary = `[${systemName(cr)}] ${cr.title}`;
  cr.req_status = linked ? REQ_STATUS_NAMES.indeterminate : REQ_STATUS_NAMES.new;
  cr.req_status_category = linked ? 'indeterminate' : 'new';
  cr.req_synced_at = nowIso();
};

export const enterReq = (crNo, input = {}) => {
  const { me, cr } = visible(crNo);
  if (cr.status !== 'req_processing' || cr.processed_by !== me.uname) throw httpError(409, STALE_MESSAGE);
  const linked = input.mode === 'link';
  const key = linked ? String(input.reqKey || '').trim().toUpperCase() : nextReqKey();
  if (linked) checkKey(cr, key);
  setReq(cr, key, linked);
  cr.processed_at = nowIso();
  record(cr, me, linked ? 'req_linked' : 'req_created', 'completed', {
    remarks: String(input.remarks || '').trim(), changes: { reqKey: { from: null, to: key } },
  });
  save();
  return { crNo: cr.cr_no, status: cr.status, statusLabel: STATUS_LABELS[cr.status], reqKey: key, reqUrl: '#' };
};

export const correctReq = (crNo, input = {}) => {
  const { me, cr } = visible(crNo);
  if (cr.status !== 'completed' || !cr.req_key || me.role !== 'sa-pm') throw httpError(409, STALE_MESSAGE);
  const key = String(input.reqKey || '').trim().toUpperCase();
  checkKey(cr, key);
  if (key === cr.req_key) throw httpError(400, 'Please check the highlighted fields', { reqKey: 'This is already the linked REQ' });
  if (!String(input.remarks || '').trim()) throw httpError(400, 'Please check the highlighted fields', { remarks: 'Please add remarks' });
  const from = cr.req_key;
  setReq(cr, key, true);
  record(cr, me, 'req_corrected', 'completed', { remarks: input.remarks.trim(), changes: { reqKey: { from, to: key } } });
  save();
  return { crNo: cr.cr_no, status: cr.status, statusLabel: STATUS_LABELS[cr.status], reqKey: key, reqUrl: '#' };
};

export const attachmentFile = (id) => {
  const me = user();
  const cr = db.crs.find((c) => c.attachments.some((a) => a.id === id));
  if (!cr || !canView(me, cr)) throw httpError(404, 'Attachment not found');
  const a = cr.attachments.find((x) => x.id === id);
  return `ChangeFlow demo placeholder\n\nFile: ${a.original_name}\nCR: ${cr.cr_no}\n\nThis is a portfolio demo, so attachments are not stored.\n`;
};

// for email decision links: demo-<stage>-<crNo>
const STAGES = { ao: 'pending_ao', sapm: 'pending_sapm', final: 'pending_final' };
const TOKEN_RE = /^demo-(ao|sapm|final)-(CR-\d{4}-\d+)$/;

export const decisionLinkFor = (cr) => {
  const stage = Object.entries(STAGES).find(([, s]) => s === cr.status)?.[0];
  return stage ? `demo-${stage}-${cr.cr_no}` : null;
};

export const emailStageCrs = () => db.crs.filter((c) => Object.values(STAGES).includes(c.status))
  .sort(byDesc('updatedAt')).map((c) => ({ crNo: c.cr_no, status: c.status, token: decisionLinkFor(c) }));

const recipientOf = (stage, cr) => {
  if (stage === 'ao') return { name: cr.approving_officer_name, email: cr.approving_officer_email, uname: cr.approving_officer_email };
  if (stage === 'sapm') return PERSONAS['sa-pm'];
  return GM;
};

const parseToken = (token) => {
  const m = TOKEN_RE.exec(token || '');
  if (!m) throw httpError(404, 'This link is not valid');
  const cr = find(m[2]);
  if (!cr) throw httpError(404, 'This link is not valid');
  return { stage: m[1], status: STAGES[m[1]], cr };
};

export const getDecision = (token) => {
  const { stage, status, cr } = parseToken(token);
  const open = cr.status === status && !db.usedLinks.includes(token);
  const recipient = recipientOf(stage, cr);
  const base = {
    state: open ? 'open' : 'closed',
    stage: status,
    actions: open ? EMAIL_ACTIONS[status] : [],
    recipientName: stage === 'sapm' ? SAPM_NAME : recipient.name,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  if (!open) return { ...base, cr: { crNo: cr.cr_no, title: cr.title, status: cr.status, statusLabel: STATUS_LABELS[cr.status] } };
  return {
    ...base,
    cr: {
      crNo: cr.cr_no,
      title: cr.title,
      status: cr.status,
      statusLabel: STATUS_LABELS[cr.status],
      requestorName: cr.requestor_name,
      requestorDepartment: cr.requestor_department,
      systemName: systemName(cr),
      requestTypeLabel: REQUEST_TYPES[cr.request_type],
      targetDate: cr.target_date,
      submittedAt: cr.submitted_at,
      regulatoryApprovalNeeded: Boolean(cr.regulatory_approval_needed),
      businessObjective: cr.business_objective,
      businessJustification: cr.business_justification,
      benefits: cr.benefits,
      detailedRequirements: cr.detailed_requirements,
      expectedBehavior: cr.expected_behavior,
    },
  };
};

export const submitDecision = (token, action, remarks) => {
  const { stage, status, cr } = parseToken(token);
  if (cr.status !== status || db.usedLinks.includes(token)) throw httpError(409, 'This request has already been decided');
  if (!EMAIL_ACTIONS[status].includes(action)) throw httpError(400, 'This action is not available here');
  applyMove(cr, recipientOf(stage, cr), action, remarks, { via: 'email', check: false });
  db.usedLinks.push(token);
  save();
  return { crNo: cr.cr_no, status: cr.status, statusLabel: STATUS_LABELS[cr.status] };
};
