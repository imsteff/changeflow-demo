import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseServerDate, statusMessage } from '../format.js';

test('zoneless server datetimes are read as Manila time', () => {
  assert.equal(parseServerDate('2026-10-06 08:30:00').toISOString(), '2026-10-06T00:30:00.000Z');
});

test('ISO strings with a zone are kept as is', () => {
  assert.equal(parseServerDate('2026-10-06T00:30:00.000Z').toISOString(), '2026-10-06T00:30:00.000Z');
});

test('date-only strings are local calendar dates', () => {
  const d = parseServerDate('2026-12-01');
  assert.deepEqual([d.getFullYear(), d.getMonth(), d.getDate()], [2026, 11, 1]);
});

test('empty or invalid values give null', () => {
  assert.equal(parseServerDate(null), null);
  assert.equal(parseServerDate(''), null);
  assert.equal(parseServerDate('not a date'), null);
});

test('statusMessage says where the CR went next', () => {
  assert.equal(statusMessage({ crNo: 'CR-0001', status: 'pending_ao' }), 'CR-0001 sent to the approving officer for approval');
  assert.equal(statusMessage({ crNo: 'CR-0001', status: 'rejected' }), 'CR-0001 is closed and will not proceed');
  assert.equal(statusMessage({ crNo: 'CR-0001', status: 'completed' }), 'CR-0001 is completed');
  assert.equal(statusMessage({ crNo: 'CR-0001', status: 'on_hold', statusLabel: 'On Hold' }), 'CR-0001 is now On Hold');
});
