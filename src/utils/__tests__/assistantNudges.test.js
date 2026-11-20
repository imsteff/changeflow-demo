import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNudges, nudgeSignature } from '../assistantNudges.js';

test('no summary or zero counts gives no reminders', () => {
  assert.deepEqual(buildNudges(null), []);
  assert.deepEqual(buildNudges({ waiting: 0, returned: 0, pending: 0, queue: { ao: 0 } }), []);
});

test('requestor sees returned and pending CRs of their own', () => {
  const nudges = buildNudges({ returned: 1, pending: 3, queue: { ao: 0 } });
  assert.deepEqual(nudges.map((n) => n.text), [
    'You have 1 CR returned to you for more details.',
    'You have 3 CRs still pending approval.',
  ]);
  assert.ok(nudges.every((n) => n.to === '/requests'));
});

test('SA/PM sees each queue kind on its own line', () => {
  const nudges = buildNudges({ queue: { ao: 1, sapm: 2, reqPending: 1, reqMine: 4 } });
  assert.deepEqual(nudges.map((n) => n.text), [
    'You have 2 CRs waiting for your SA/PM review.',
    'You have 1 CR waiting for your approval as approving officer.',
    'You have 1 approved CR ready for an REQ in Jira.',
    'You are processing 4 REQs right now.',
  ]);
});

test('GM sees final approvals', () => {
  const [one] = buildNudges({ queue: { final: 2 } });
  assert.equal(one.text, 'You have 2 CRs waiting for your final approval.');
  assert.equal(one.to, '/inbox');
});

test('signature changes only when a count changes', () => {
  const a = nudgeSignature(buildNudges({ returned: 1, queue: { ao: 2 } }));
  assert.equal(a, 'ao:2|returned:1');
  assert.equal(nudgeSignature(buildNudges({ returned: 1, inProgress: 9, queue: { ao: 2 } })), a);
  assert.notEqual(nudgeSignature(buildNudges({ returned: 1, queue: { ao: 3 } })), a);
});
