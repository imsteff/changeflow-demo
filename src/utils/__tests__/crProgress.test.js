import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actorOf, lastReturn, progressOf } from '../crProgress.js';

const ev = (action, actorName = 'X', extra = {}) => ({ action, actorName, at: '2026-10-06 08:00:00', ...extra });
const states = (cr) => progressOf(cr).map((s) => s.state);

test('waiting for the approving officer', () => {
  const cr = { status: 'pending_ao', approvingOfficer: { name: 'Ana AO' }, history: [ev('submitted'), ev('sent_to_ao')] };
  assert.deepEqual(states(cr), ['done', 'current', 'upcoming', 'upcoming', 'upcoming']);
  assert.equal(progressOf(cr)[1].actor, 'Ana AO');
});

test('skipped approving officer shows as skipped', () => {
  const cr = { status: 'pending_sapm', history: [ev('submitted'), ev('ao_skipped')] };
  assert.deepEqual(states(cr), ['done', 'skipped', 'current', 'upcoming', 'upcoming']);
});

test('returned CR marks the SA/PM step as returned with who returned it', () => {
  const cr = { status: 'returned', history: [ev('submitted'), ev('ao_approved'), ev('sapm_returned', 'Sam PM', { remarks: 'fix' })] };
  assert.deepEqual(states(cr), ['done', 'done', 'returned', 'upcoming', 'upcoming']);
  assert.equal(progressOf(cr)[2].actor, 'Sam PM');
  assert.equal(lastReturn(cr).remarks, 'fix');
});

test('return before approving officer review lands on the approving officer step', () => {
  const cr = { status: 'returned', history: [ev('submitted'), ev('sent_to_ao'), ev('sapm_returned_at_ao', 'Sam PM', { remarks: 'wrong AO' })] };
  assert.deepEqual(states(cr), ['done', 'returned', 'upcoming', 'upcoming', 'upcoming']);
  assert.equal(progressOf(cr)[1].actor, 'Sam PM');
  assert.equal(lastReturn(cr).remarks, 'wrong AO');
  const later = { status: 'returned', history: [...cr.history, ev('resubmitted'), ev('ao_approved'), ev('sapm_returned', 'Sam PM')] };
  assert.deepEqual(states(later), ['done', 'done', 'returned', 'upcoming', 'upcoming']);
});

test('rejection lands on the step that rejected it', () => {
  const byAo = { status: 'rejected', history: [ev('submitted'), ev('ao_disapproved')] };
  assert.deepEqual(states(byAo), ['done', 'rejected', 'upcoming', 'upcoming', 'upcoming']);
  const byGm = { status: 'rejected', history: [ev('submitted'), ev('ao_approved'), ev('sapm_accepted'), ev('gm_disapproved', 'Gina GM')] };
  assert.deepEqual(states(byGm), ['done', 'done', 'done', 'rejected', 'upcoming']);
  assert.equal(progressOf(byGm)[3].actor, 'Gina GM');
});

test('final approval moves to REQ creation and completed fills every step', () => {
  const history = [ev('submitted'), ev('ao_approved'), ev('sapm_accepted'), ev('gm_approved')];
  assert.deepEqual(states({ status: 'pending_req', history }), ['done', 'done', 'done', 'done', 'current']);
  assert.deepEqual(states({ status: 'completed', history }), ['done', 'done', 'done', 'done', 'done']);
});

test('actorOf falls back to the username', () => {
  assert.equal(actorOf({ actorName: 'Ana AO', actorUname: 'ana' }), 'Ana AO');
  assert.equal(actorOf({ actorName: null, actorUname: 'ana' }), 'ana');
  assert.equal(actorOf(null), null);
});

test('progress actor uses the username when the name is missing', () => {
  const cr = { status: 'pending_sapm', history: [ev('submitted'), ev('ao_approved', null, { actorUname: 'ana' })] };
  assert.equal(progressOf(cr)[1].actor, 'ana');
});

test('REQ step waits on the processor and completes with whoever set the REQ', () => {
  const history = [ev('submitted'), ev('ao_approved'), ev('sapm_accepted'), ev('gm_approved'), ev('req_claimed', 'Pat PM')];
  const processing = { status: 'req_processing', processor: { name: 'Pat PM' }, history };
  assert.equal(progressOf(processing)[4].state, 'current');
  assert.equal(progressOf(processing)[4].actor, 'Pat PM');
  const completed = { status: 'completed', history: [...history, ev('req_linked', 'Pat PM')] };
  assert.deepEqual(progressOf(completed)[4], { ...progressOf(completed)[4], state: 'done', actor: 'Pat PM' });
});
