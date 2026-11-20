import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkNewFiles, filesFromCr, fromCr, initialFiles, initialValues, isChanged, stepOfField, toFormData,
  toResubmitFormData, validateAll, validateStep,
} from '../crForm.js';

const NOW = new Date(2026, 9, 2);
const OPTIONS = { internalApps: ['IT Service Desk', 'Training Hub'] };
const UPLOADS = { allowedExtensions: ['.pdf', '.png'], maxFileBytes: 1000, maxFiles: 2 };

const valid = () => ({
  ...initialValues(),
  systemType: 'website',
  title: 'Add export button',
  requestType: 'enhancement',
  businessObjective: 'obj',
  businessJustification: 'just',
  benefits: 'ben',
  detailedRequirements: 'req',
  expectedBehavior: 'beh',
  regulatoryApprovalNeeded: 'no',
  targetDate: '2026-12-01',
});

const file = (name, size = 10) => new File([new Uint8Array(size)], name);

test('a complete form has no errors', () => {
  assert.deepEqual(validateAll(valid(), initialFiles(), OPTIONS, NOW), {});
});

test('empty form flags every required field', () => {
  const errors = validateAll(initialValues(), initialFiles(), OPTIONS, NOW);
  for (const key of ['systemType', 'title', 'requestType', 'businessObjective', 'businessJustification',
    'benefits', 'detailedRequirements', 'expectedBehavior', 'regulatoryApprovalNeeded', 'targetDate']) {
    assert.ok(errors[key], `${key} should be required`);
  }
});

test('whitespace only counts as empty', () => {
  const errors = validateStep('request', { ...valid(), title: '   ' }, initialFiles(), OPTIONS, NOW);
  assert.equal(errors.title, 'CR Title is required');
});

test('internal_app needs a known internal application', () => {
  const v = { ...valid(), systemType: 'internal_app' };
  assert.equal(validateStep('request', v, initialFiles(), OPTIONS, NOW).appName, 'Internal Application is required');
  v.appName = 'Nope';
  assert.equal(validateStep('request', v, initialFiles(), OPTIONS, NOW).appName, 'Internal Application is invalid');
  v.appName = 'Training Hub';
  assert.deepEqual(validateStep('request', v, initialFiles(), OPTIONS, NOW), {});
});

test('others needs the system specified', () => {
  const v = { ...valid(), systemType: 'others' };
  assert.equal(validateStep('request', v, initialFiles(), OPTIONS, NOW).systemOther, 'Please specify the system');
  v.systemOther = 'HR tool';
  assert.deepEqual(validateStep('request', v, initialFiles(), OPTIONS, NOW), {});
});

test('target date must be today up to 3 years ahead', () => {
  const check = (targetDate) => validateStep('compliance', { ...valid(), targetDate }, initialFiles(), OPTIONS, NOW).targetDate;
  assert.equal(check('2026-10-01'), 'Target date cannot be in the past');
  assert.equal(check('2026-10-02'), undefined);
  assert.equal(check('2029-10-02'), undefined);
  assert.equal(check('2029-10-03'), 'Target date is too far ahead');
});

test('regulatory yes needs documents', () => {
  const v = { ...valid(), regulatoryApprovalNeeded: 'yes' };
  assert.ok(validateStep('compliance', v, initialFiles(), OPTIONS, NOW).regulatoryFiles);
  const files = { ...initialFiles(), regulatoryFiles: [file('a.pdf')] };
  assert.deepEqual(validateStep('compliance', v, files, OPTIONS, NOW), {});
});

test('stepOfField maps fields to their step', () => {
  assert.equal(stepOfField('title'), 0);
  assert.equal(stepOfField('benefits'), 1);
  assert.equal(stepOfField('processFlowFiles'), 2);
  assert.equal(stepOfField('targetDate'), 3);
  assert.equal(stepOfField('unknown'), 0);
});

test('checkNewFiles enforces type, size, empty, count and duplicates', () => {
  const existing = [file('one.pdf')];
  const { accepted, problems } = checkNewFiles(existing, [
    file('bad.exe'), file('big.pdf', 2000), file('empty.pdf', 0), file('one.pdf'), file('two.PNG'), file('three.pdf'),
  ], UPLOADS);
  assert.deepEqual(accepted.map((f) => f.name), ['two.PNG']);
  assert.equal(problems.length, 5);
  assert.match(problems.at(-1), /up to 2 files/);
});

test('toFormData sends only relevant fields and files', () => {
  const v = {
    ...valid(), systemType: 'website', appName: 'Training Hub', systemOther: 'x', proposedProcess: '  ',
  };
  const files = { processFlowFiles: [file('flow.png')], regulatoryFiles: [file('reg.pdf')] };
  const fd = toFormData(v, files);
  assert.equal(fd.get('appName'), null);
  assert.equal(fd.get('systemOther'), null);
  assert.equal(fd.get('proposedProcess'), null);
  assert.equal(fd.get('title'), 'Add export button');
  assert.equal(fd.getAll('processFlowFiles').length, 1);
  assert.equal(fd.getAll('regulatoryFiles').length, 0);
});

const CR = {
  systemType: 'internal_app',
  appName: 'Training Hub',
  systemOther: null,
  title: 'Add export',
  requestType: 'enhancement',
  businessObjective: 'obj',
  businessJustification: 'just',
  benefits: 'ben',
  detailedRequirements: 'req',
  proposedProcess: null,
  processFlow: null,
  expectedBehavior: 'beh',
  regulatoryApprovalNeeded: true,
  targetDate: '2026-12-01',
  attachments: [
    { id: 1, category: 'process_flow', name: 'flow.pdf', sizeBytes: 10 },
    { id: 2, category: 'regulatory', name: 'reg.pdf', sizeBytes: 20 },
  ],
};

test('fromCr and filesFromCr prefill the form from a CR', () => {
  const values = fromCr(CR);
  assert.equal(values.appName, 'Training Hub');
  assert.equal(values.systemOther, '');
  assert.equal(values.proposedProcess, '');
  assert.equal(values.regulatoryApprovalNeeded, 'yes');
  assert.deepEqual(filesFromCr(CR), {
    processFlowFiles: [{ id: 1, name: 'flow.pdf', size: 10 }],
    regulatoryFiles: [{ id: 2, name: 'reg.pdf', size: 20 }],
  });
  assert.deepEqual(validateAll(values, filesFromCr(CR), OPTIONS, NOW), {});
});

test('toResubmitFormData sends new files only and removes dropped attachments', () => {
  const files = filesFromCr(CR);
  files.processFlowFiles = [file('new.pdf')];
  const fd = toResubmitFormData(fromCr(CR), files, CR.attachments, '  fixed columns ');
  assert.equal(fd.getAll('processFlowFiles').length, 1);
  assert.equal(fd.getAll('regulatoryFiles').length, 0);
  assert.deepEqual(fd.getAll('removeAttachmentIds'), ['1']);
  assert.equal(fd.get('remarks'), 'fixed columns');
});

test('toResubmitFormData drops regulatory attachments when approval is no longer needed', () => {
  const fd = toResubmitFormData({ ...fromCr(CR), regulatoryApprovalNeeded: 'no' }, filesFromCr(CR), CR.attachments, '');
  assert.deepEqual(fd.getAll('removeAttachmentIds'), ['2']);
  assert.equal(fd.get('remarks'), null);
});

test('isChanged compares against the starting form', () => {
  const start = { values: fromCr(CR), files: filesFromCr(CR) };
  assert.equal(isChanged(start.values, start.files, start), false);
  assert.equal(isChanged({ ...start.values, title: 'x' }, start.files, start), true);
  assert.equal(isChanged(start.values, { ...start.files, regulatoryFiles: [] }, start), true);
});
