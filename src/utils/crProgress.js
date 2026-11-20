const PROGRESS_STEPS = [
  { key: 'submitted', label: 'Submitted', doneBy: ['submitted', 'resubmitted'] },
  { key: 'ao', label: 'Approving Officer', doneBy: ['ao_approved', 'ao_skipped'], stoppedBy: ['ao_disapproved', 'sapm_returned_at_ao'] },
  { key: 'sapm', label: 'SA/PM Review', doneBy: ['sapm_accepted'], stoppedBy: ['sapm_returned'] },
  { key: 'final', label: 'Final Approval', doneBy: ['gm_approved'], stoppedBy: ['gm_disapproved'] },
  { key: 'req', label: 'REQ Creation', doneBy: ['req_created', 'req_linked'] },
];

const STEP_OF_STATUS = {
  submitted: 1,
  pending_ao: 1,
  pending_sapm: 2,
  returned: 2,
  pending_final: 3,
  pending_req: 4,
  req_processing: 4,
  completed: PROGRESS_STEPS.length,
};

export const actorOf = (event) => event?.actorName || event?.actorUname || null;

const lastOf = (history, actions) => [...history].reverse().find((h) => actions.includes(h.action)) || null;

const RETURNS = ['sapm_returned', 'sapm_returned_at_ao'];

const currentIndex = (cr, history) => {
  if (cr.status === 'returned' && lastOf(history, RETURNS)?.action === 'sapm_returned_at_ao') return 1;
  if (cr.status !== 'rejected') return STEP_OF_STATUS[cr.status] ?? 0;
  const rejection = lastOf(history, ['ao_disapproved', 'gm_disapproved']);
  return rejection?.action === 'ao_disapproved' ? 1 : 3;
};

const STOPPED_STATE = { rejected: 'rejected', returned: 'returned' };

// for the detail stepper
export const progressOf = (cr) => {
  const history = cr.history || [];
  const current = currentIndex(cr, history);

  return PROGRESS_STEPS.map((step, i) => {
    if (i < current) {
      const event = lastOf(history, step.doneBy);
      const state = event?.action === 'ao_skipped' ? 'skipped' : 'done';
      return { ...step, state, actor: actorOf(event), at: event?.at || null };
    }
    if (i > current) return { ...step, state: 'upcoming', actor: null, at: null };

    const stopped = STOPPED_STATE[cr.status];
    if (stopped) {
      const event = lastOf(history, step.stoppedBy || []);
      return { ...step, state: stopped, actor: actorOf(event), at: event?.at || null };
    }
    const waitingOn = { ao: cr.approvingOfficer?.name, req: cr.processor?.name };
    const actor = waitingOn[step.key] || null;
    return { ...step, state: 'current', actor, at: null };
  });
};

export const lastReturn = (cr) => lastOf(cr.history || [], RETURNS);
