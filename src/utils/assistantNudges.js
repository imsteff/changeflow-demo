const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// for the chameleon: 2nd person reminders, only the ones with a count
export const buildNudges = (summary) => {
  if (!summary) return [];
  const { returned = 0, pending = 0, queue = {} } = summary;
  const { ao = 0, sapm = 0, final = 0, reqPending = 0, reqMine = 0 } = queue;
  return [
    sapm > 0 && { id: 'sapm', count: sapm, to: '/inbox', text: `You have ${plural(sapm, 'CR', 'CRs')} waiting for your SA/PM review.` },
    final > 0 && { id: 'final', count: final, to: '/inbox', text: `You have ${plural(final, 'CR', 'CRs')} waiting for your final approval.` },
    ao > 0 && { id: 'ao', count: ao, to: '/inbox', text: `You have ${plural(ao, 'CR', 'CRs')} waiting for your approval as approving officer.` },
    reqPending > 0 && { id: 'reqPending', count: reqPending, to: '/inbox', text: `You have ${plural(reqPending, 'approved CR', 'approved CRs')} ready for an REQ in Jira.` },
    reqMine > 0 && { id: 'reqMine', count: reqMine, to: '/inbox', text: `You are processing ${plural(reqMine, 'REQ', 'REQs')} right now.` },
    returned > 0 && { id: 'returned', count: returned, to: '/requests', text: `You have ${plural(returned, 'CR', 'CRs')} returned to you for more details.` },
    pending > 0 && { id: 'pending', count: pending, to: '/requests', text: `You have ${plural(pending, 'CR', 'CRs')} still pending approval.` },
  ].filter(Boolean);
};

export const nudgeSignature = (nudges) => nudges.map((n) => `${n.id}:${n.count}`).join('|');
