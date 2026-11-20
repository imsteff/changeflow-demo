import { addYears, format } from 'date-fns';
import { RICH_FIELDS, hasRichText, toRichHtml } from './richText.js';

const TEXT_MAX = 10000;
const LONG_TEXT_MAX = 50000;

const FILE_FIELDS = ['processFlowFiles', 'regulatoryFiles'];

export const initialValues = () => ({
  systemType: '',
  appName: '',
  systemOther: '',
  title: '',
  requestType: '',
  businessObjective: '',
  businessJustification: '',
  benefits: '',
  detailedRequirements: '',
  proposedProcess: '',
  processFlow: '',
  expectedBehavior: '',
  regulatoryApprovalNeeded: '',
  targetDate: '',
});

export const initialFiles = () => ({ processFlowFiles: [], regulatoryFiles: [] });

export const TITLE_MAX = 255;

export const STEPS = [
  {
    key: 'request',
    title: 'Request Information',
    summary: 'System, title and type',
    description: 'Tell us which system this change affects and what kind of change it is.',
    fields: ['systemType', 'appName', 'systemOther', 'title', 'requestType'],
  },
  {
    key: 'business',
    title: 'Business Case',
    summary: 'Objective, justification and benefits',
    description: 'Explain why this change is needed and what it will deliver.',
    fields: ['businessObjective', 'businessJustification', 'benefits'],
  },
  {
    key: 'requirements',
    title: 'Requirements & Process',
    summary: 'Scope, process and expected behavior',
    description: 'Describe what needs to change and how it should work.',
    fields: ['detailedRequirements', 'proposedProcess', 'processFlow', 'processFlowFiles', 'expectedBehavior'],
  },
  {
    key: 'compliance',
    title: 'Compliance & Implementation',
    summary: 'Approvals and rollout',
    description: 'Flag any regulatory approval and set your target date.',
    fields: ['regulatoryApprovalNeeded', 'regulatoryFiles', 'targetDate'],
  },
  {
    key: 'review',
    title: 'Review & Submit',
    summary: 'Check everything and submit',
    description: 'Check everything below before you submit.',
    fields: [],
  },
];

export const stepOfField = (field) => {
  const index = STEPS.findIndex((s) => s.fields.includes(field));
  return index === -1 ? 0 : index;
};

export const todayStr = (now = new Date()) => format(now, 'yyyy-MM-dd');
export const maxTargetStr = (now = new Date()) => format(addYears(now, 3), 'yyyy-MM-dd');

const requiredText = (errors, values, field, label, max) => {
  const v = (values[field] || '').trim();
  if (!v) errors[field] = `${label} is required`;
  else if (v.length > max) errors[field] = `${label} must be at most ${max} characters`;
};

// for editor fields
const richRequired = (errors, values, field, label, max) => {
  const v = values[field] || '';
  if (!hasRichText(v)) errors[field] = `${label} is required`;
  else if (v.length > max) errors[field] = `${label} is too long`;
};

const richOptional = (errors, values, field, label, max) => {
  if ((values[field] || '').length > max) errors[field] = `${label} is too long`;
};

const validators = {
  request: (v, f, o, errors) => {
    if (!v.systemType) errors.systemType = 'System is required';
    if (v.systemType === 'internal_app') {
      if (!v.appName) errors.appName = 'Internal Application is required';
      else if (o?.internalApps && !o.internalApps.includes(v.appName)) errors.appName = 'Internal Application is invalid';
    }
    if (v.systemType === 'others') {
      const other = (v.systemOther || '').trim();
      if (!other) errors.systemOther = 'Please specify the system';
      else if (other.length > 255) errors.systemOther = 'System must be at most 255 characters';
    }
    requiredText(errors, v, 'title', 'CR Title', TITLE_MAX);
    if (!v.requestType) errors.requestType = 'Request Type is required';
  },
  business: (v, f, o, errors) => {
    richRequired(errors, v, 'businessObjective', 'Business Objective', TEXT_MAX);
    richRequired(errors, v, 'businessJustification', 'Business Justification', TEXT_MAX);
    richRequired(errors, v, 'benefits', 'Benefits', TEXT_MAX);
  },
  requirements: (v, f, o, errors) => {
    richRequired(errors, v, 'detailedRequirements', 'Detailed Requirements', LONG_TEXT_MAX);
    richOptional(errors, v, 'proposedProcess', 'Proposed Process', TEXT_MAX);
    richOptional(errors, v, 'processFlow', 'Proposed Process Flow', LONG_TEXT_MAX);
    richRequired(errors, v, 'expectedBehavior', 'Expected Behavior', TEXT_MAX);
  },
  compliance: (v, f, o, errors, now) => {
    if (v.regulatoryApprovalNeeded !== 'yes' && v.regulatoryApprovalNeeded !== 'no') {
      errors.regulatoryApprovalNeeded = 'Please choose Yes or No';
    }
    if (v.regulatoryApprovalNeeded === 'yes' && !f.regulatoryFiles.length) {
      errors.regulatoryFiles = 'Please attach the regulatory approval documents';
    }
    if (!v.targetDate) errors.targetDate = 'Target date is required';
    else if (v.targetDate < todayStr(now)) errors.targetDate = 'Target date cannot be in the past';
    else if (v.targetDate > maxTargetStr(now)) errors.targetDate = 'Target date is too far ahead';
  },
};

export const validateStep = (stepKey, values, files, options, now = new Date()) => {
  const errors = {};
  validators[stepKey]?.(values, files, options, errors, now);
  return errors;
};

export const validateAll = (values, files, options, now = new Date()) => STEPS.reduce(
  (acc, s) => ({ ...acc, ...validateStep(s.key, values, files, options, now) }),
  {},
);

const extOf = (name) => {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
};

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const checkNewFiles = (current, incoming, uploads) => {
  const accepted = [];
  const problems = [];
  for (const file of incoming) {
    if (!uploads.allowedExtensions.includes(extOf(file.name))) {
      problems.push(`${file.name} is not an allowed file type`);
    } else if (file.size > uploads.maxFileBytes) {
      problems.push(`${file.name} is larger than ${formatBytes(uploads.maxFileBytes)}`);
    } else if (file.size === 0) {
      problems.push(`${file.name} is empty`);
    } else if (current.length + accepted.length >= uploads.maxFiles) {
      problems.push(`You can attach up to ${uploads.maxFiles} files here`);
      break;
    } else if (current.some((c) => c.name === file.name && c.size === file.size)) {
      problems.push(`${file.name} is already attached`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, problems };
};

// for edits: only new picks are File objects
const newFiles = (list) => list.filter((f) => typeof File !== 'undefined' && f instanceof File);

export const toFormData = (values, files) => {
  const fd = new FormData();
  const put = (key) => {
    const v = (values[key] || '').trim();
    if (v) fd.append(key, v);
  };

  put('systemType');
  if (values.systemType === 'internal_app') put('appName');
  if (values.systemType === 'others') put('systemOther');
  ['title', 'requestType', 'businessObjective', 'businessJustification', 'benefits', 'detailedRequirements',
    'proposedProcess', 'processFlow', 'expectedBehavior', 'regulatoryApprovalNeeded', 'targetDate'].forEach(put);

  newFiles(files.processFlowFiles).forEach((file) => fd.append('processFlowFiles', file, file.name));
  if (values.regulatoryApprovalNeeded === 'yes') {
    newFiles(files.regulatoryFiles).forEach((file) => fd.append('regulatoryFiles', file, file.name));
  }
  return fd;
};

const sameFiles = (a, b) => a.length === b.length && a.every((f, i) => f === b[i]);

export const isChanged = (values, files, start) => Object.keys(values).some((k) => values[k] !== start.values[k])
  || FILE_FIELDS.some((k) => !sameFiles(files[k], start.files[k]));

const TEXT_FIELDS = ['title', 'requestType', 'businessObjective', 'businessJustification', 'benefits',
  'detailedRequirements', 'proposedProcess', 'processFlow', 'expectedBehavior', 'systemType', 'appName', 'systemOther'];

export const fromCr = (cr) => ({
  ...initialValues(),
  ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, cr[k] || ''])),
  ...Object.fromEntries(RICH_FIELDS.map((k) => [k, toRichHtml(cr[k])])),
  regulatoryApprovalNeeded: cr.regulatoryApprovalNeeded ? 'yes' : 'no',
  targetDate: String(cr.targetDate || '').slice(0, 10),
});

const ATTACHMENT_FIELDS = { process_flow: 'processFlowFiles', regulatory: 'regulatoryFiles' };

export const filesFromCr = (cr) => {
  const files = initialFiles();
  (cr.attachments || []).forEach((a) => {
    const field = ATTACHMENT_FIELDS[a.category];
    if (field) files[field].push({ id: a.id, name: a.name, size: a.sizeBytes });
  });
  return files;
};

export const toResubmitFormData = (values, files, attachments, remarks) => {
  const fd = toFormData(values, files);
  const kept = [...files.processFlowFiles, ...(values.regulatoryApprovalNeeded === 'yes' ? files.regulatoryFiles : [])];
  const keptIds = new Set(kept.filter((f) => f.id).map((f) => f.id));
  (attachments || []).filter((a) => !keptIds.has(a.id)).forEach((a) => fd.append('removeAttachmentIds', String(a.id)));
  const note = (remarks || '').trim();
  if (note) fd.append('remarks', note);
  return fd;
};
