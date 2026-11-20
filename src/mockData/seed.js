import { FILE_TYPES, REQ_STATUS_NAMES, SYSTEM_TYPES } from './constants';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join('');
const ul = (...items) => `<ul>${items.map((i) => `<li><p>${i}</p></li>`).join('')}</ul>`;
const ol = (...items) => `<ol>${items.map((i) => `<li><p>${i}</p></li>`).join('')}</ol>`;

export const PEOPLE = {
  jsantos: { uname: 'jsantos', name: 'Jamie Santos', email: 'jamie.santos@example.com', department: 'Retail Operations' },
  mlopez: { uname: 'mlopez', name: 'Maria Lopez', email: 'maria.lopez@example.com', department: 'Finance' },
  kong: { uname: 'kong', name: 'Kevin Ong', email: 'kevin.ong@example.com', department: 'Customer Support' },
  arahman: { uname: 'arahman', name: 'Aisha Rahman', email: 'aisha.rahman@example.com', department: 'Marketing' },
  tbecker: { uname: 'tbecker', name: 'Tom Becker', email: 'tom.becker@example.com', department: 'Human Resources' },
  npatel: { uname: 'npatel', name: 'Nina Patel', email: 'nina.patel@example.com', department: 'IT Projects & Development' },
  ltan: { uname: 'ltan', name: 'Leo Tan', email: 'leo.tan@example.com', department: 'IT Projects & Development' },
  dcruz: { uname: 'dcruz', name: 'Daniel Cruz', email: 'daniel.cruz@example.com', department: 'Office of the General Manager' },
  jira: { uname: 'jira', name: 'Jira' },
};

const AOS = {
  rachel: { emp: 'E-2001', uname: 'rkim', name: 'Rachel Kim', email: 'rachel.kim@example.com' },
  grace: { emp: 'E-2010', uname: 'glim', name: 'Grace Lim', email: 'grace.lim@example.com' },
  daniel: { emp: 'E-1002', uname: 'dcruz', name: 'Daniel Cruz', email: 'daniel.cruz@example.com' },
};

const actorOf = (key) => PEOPLE[key] || AOS[key];

const SEEDS = [
  {
    owner: 'mlopez', ago: 64, system: ['internal_app', 'Expense Claims'], type: 'enhancement', target: -20,
    title: 'Auto-attach receipts from mobile photos to expense claims',
    text: {
      obj: p('Let staff snap a receipt photo and have it attached to the right claim line automatically.'),
      just: p('About a third of returned claims are missing receipts. Finance spends hours chasing them every cut-off.'),
      ben: ul('Fewer returned claims', 'Faster month-end close', 'Less manual follow-up by Finance'),
      req: ol('Upload a photo from the claim line', 'Read the amount and date from the image', 'Flag lines where the amount does not match'),
      exp: p('Each claim line shows its receipt thumbnail, and mismatches are highlighted before submission.'),
    },
    files: [['process_flow', 'receipt-capture-flow.pdf', 412_880]],
    ao: 'daniel',
    steps: [[0, 'submitted', 'submitted', 'mlopez'], [0, 'sent_to_ao', 'pending_ao', 'mlopez'], [20, 'ao_approved', 'pending_sapm', 'daniel'],
      [46, 'sapm_accepted', 'pending_final', 'ltan'], [70, 'gm_approved', 'pending_req', 'dcruz'], [90, 'req_claimed', 'req_processing', 'ltan'],
      [92, 'req_created', 'completed', 'ltan', null, { reqKey: { from: null, to: 'REQ-1042' } }],
      [400, 'req_status_changed', 'completed', 'jira', null, { reqStatus: { from: 'To Do', to: 'In Progress' } }],
      [1100, 'req_status_changed', 'completed', 'jira', null, { reqStatus: { from: 'In Progress', to: 'Done' } }]],
    req: { key: 'REQ-1042', cat: 'done' }, processor: 'ltan',
  },
  {
    owner: 'arahman', ago: 58, system: ['website', null], type: 'new_feature', target: 25,
    title: 'Promo landing page builder with reusable blocks',
    text: {
      obj: p('Give Marketing a block-based builder for promo landing pages.'),
      just: p('Every landing page today needs a developer ticket, which adds one to two weeks per promo.'),
      ben: ul('Promos launch in days, not weeks', 'Consistent branding through shared blocks'),
      req: ol('Drag-and-drop hero, text, image and form blocks', 'Preview on mobile and desktop', 'Publish and unpublish on a schedule'),
      proc: p('Marketing drafts the page, a lead reviews it, then it is published from the builder.'),
      exp: p('A marketer can publish a new landing page without a developer.'),
    },
    files: [['process_flow', 'landing-builder-wireframes.png', 1_284_110], ['process_flow', 'publishing-flow.drawio', 38_204]],
    ao: null,
    steps: [[0, 'submitted', 'submitted', 'arahman'], [0, 'ao_skipped', 'pending_sapm', 'arahman', 'Requestor is at Managerial level'],
      [30, 'sapm_accepted', 'pending_final', 'npatel'], [54, 'gm_approved', 'pending_req', 'dcruz'], [60, 'req_claimed', 'req_processing', 'npatel'],
      [61, 'req_linked', 'completed', 'npatel', 'Linked to the existing web builder epic.', { reqKey: { from: null, to: 'REQ-1033' } }],
      [700, 'req_status_changed', 'completed', 'jira', null, { reqStatus: { from: 'In Progress', to: 'Done' } }]],
    req: { key: 'REQ-1033', cat: 'done' }, processor: 'npatel',
  },
  {
    owner: 'kong', ago: 41, system: ['internal_app', 'Customer Helpdesk'], type: 'enhancement', target: 30,
    title: 'Canned replies with placeholders in the helpdesk',
    text: {
      obj: p('Add canned replies that fill in the customer name and ticket number automatically.'),
      just: p('Support staff retype the same answers dozens of times a day, and typos reach customers.'),
      ben: ul('Shorter handling time', 'Consistent tone across the team'),
      req: ol('Manage a shared library of replies', 'Placeholders for name, ticket number and agent', 'Insert from the reply box with a shortcut'),
      exp: p('A reply can be inserted in two clicks and arrives fully personalised.'),
    },
    files: [],
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'kong'], [0, 'sent_to_ao', 'pending_ao', 'kong'], [5, 'ao_approved', 'pending_sapm', 'grace', null, { via: 'email' }],
      [26, 'sapm_accepted', 'pending_final', 'npatel'], [50, 'gm_approved', 'pending_req', 'dcruz', null, { via: 'email' }], [52, 'req_claimed', 'req_processing', 'npatel'],
      [53, 'req_created', 'completed', 'npatel', null, { reqKey: { from: null, to: 'REQ-1047' } }],
      [300, 'req_status_changed', 'completed', 'jira', null, { reqStatus: { from: 'To Do', to: 'In Progress' } }]],
    req: { key: 'REQ-1047', cat: 'indeterminate', status: 'In Progress' }, processor: 'npatel',
  },
  {
    owner: 'tbecker', ago: 35, system: ['internal_app', 'Leave Management'], type: 'process_change', target: 40,
    title: 'Two-level approval for leave longer than five days',
    text: {
      obj: p('Route long leave requests through the department head after the direct manager.'),
      just: p('Long absences affect staffing plans that only the department head can see.'),
      ben: ul('Fewer staffing gaps', 'Clear audit trail for long leave'),
      req: ol('Detect leave longer than five working days', 'Add the department head as a second approver', 'Notify both approvers by email'),
      exp: p('Long leave is only final once both approvers sign off.'),
    },
    files: [['process_flow', 'leave-approval-matrix.xlsx', 66_310]],
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'tbecker'], [0, 'sent_to_ao', 'pending_ao', 'tbecker'], [18, 'ao_approved', 'pending_sapm', 'grace'],
      [40, 'sapm_accepted', 'pending_final', 'ltan'], [64, 'gm_approved', 'pending_req', 'dcruz'], [70, 'req_claimed', 'req_processing', 'ltan'],
      [71, 'req_created', 'completed', 'ltan', null, { reqKey: { from: null, to: 'REQ-1058' } }],
      [200, 'req_status_changed', 'completed', 'jira', null, { reqStatus: { from: 'To Do', to: 'In Review' } }]],
    req: { key: 'REQ-1058', cat: 'indeterminate', status: 'In Review' }, processor: 'ltan',
  },
  {
    owner: 'jsantos', ago: 22, system: ['internal_app', 'Branch Finder'], type: 'enhancement', target: 45,
    title: 'Show live opening hours and holiday closures in Branch Finder',
    text: {
      obj: p('Show each branch&#39;s real opening hours, including holiday closures.'),
      just: p('Customers arrive at closed branches during holidays and complain to the hotline.'),
      ben: ul('Fewer wasted trips for customers', 'Fewer hotline complaints'),
      req: ol('Store regular hours per branch', 'Add one-off closures with a reason', 'Show an Open now / Closed badge'),
      exp: p('The branch card shows today&#39;s hours and a clear closed notice on holidays.'),
    },
    files: [['process_flow', 'branch-hours-mockup.png', 842_031]],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'], [8, 'ao_approved', 'pending_sapm', 'rachel'],
      [30, 'sapm_accepted', 'pending_final', 'npatel'], [52, 'gm_approved', 'pending_req', 'dcruz'], [55, 'req_claimed', 'req_processing', 'npatel'],
      [56, 'req_created', 'completed', 'npatel', null, { reqKey: { from: null, to: 'REQ-1061' } }]],
    req: { key: 'REQ-1061', cat: 'new' }, processor: 'npatel',
  },
  {
    owner: 'arahman', ago: 19, system: ['internal_app', 'Promotions Manager'], type: 'new_feature', target: 20,
    title: 'Customer-facing promo countdown widget',
    text: {
      obj: p('Embed a countdown timer for limited promos on partner sites.'),
      just: p('Partners asked for urgency cues to lift promo sign-ups.'),
      ben: ul('Higher promo conversion'),
      req: ol('Generate an embed snippet per promo', 'Countdown ends exactly at the promo end time'),
      exp: p('Partners paste one snippet and the timer stays in sync.'),
    },
    files: [],
    ao: null,
    steps: [[0, 'submitted', 'submitted', 'arahman'], [0, 'ao_skipped', 'pending_sapm', 'arahman', 'Requestor is at Managerial level'],
      [20, 'sapm_accepted', 'pending_final', 'ltan'],
      [44, 'gm_disapproved', 'rejected', 'dcruz', 'Partner embeds are on hold until the new partner agreement is signed. Please raise this again next quarter.']],
  },
  {
    owner: 'jsantos', ago: 16, system: ['kiosk', null], type: 'new_feature', target: 60,
    title: 'Let kiosk users print a queue ticket with an SMS reminder',
    text: {
      obj: p('Print a queue number at the kiosk and text the customer when they are next.'),
      just: p('Branches get crowded at peak hours and customers leave the line.'),
      ben: ul('Shorter visible queues'),
      req: ol('Collect an optional mobile number', 'Send an SMS two numbers before the customer is called'),
      exp: p('Customers can step out and come back when notified.'),
    },
    files: [['process_flow', 'kiosk-queue-flow.vsdx', 120_442]],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'],
      [10, 'ao_disapproved', 'rejected', 'rachel', 'SMS costs are not in this year&#39;s budget. Let&#39;s revisit when the new budget is approved.', { via: 'email' }]],
  },
  {
    owner: 'tbecker', ago: 12, system: ['internal_app', 'Training Hub'], type: 'enhancement', target: 35,
    title: 'Certificate expiry reminders in Training Hub',
    text: {
      obj: p('Remind staff and their managers before a mandatory certificate expires.'),
      just: p('Two audit findings last year were expired safety certificates.'),
      ben: ul('No more expired mandatory certificates', 'Audit-ready reports'),
      req: ol('Store an expiry date per certificate', 'Email reminders at 30, 14 and 3 days', 'Manager dashboard of upcoming expiries'),
      exp: p('Nobody is surprised by an expired certificate.'),
    },
    files: [['regulatory', 'audit-finding-2026-07.pdf', 233_904]],
    reg: true,
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'tbecker'], [0, 'sent_to_ao', 'pending_ao', 'tbecker'], [6, 'ao_approved', 'pending_sapm', 'grace'],
      [28, 'sapm_accepted', 'pending_final', 'npatel'], [200, 'gm_approved', 'pending_req', 'dcruz'], [210, 'req_claimed', 'req_processing', 'ltan']],
    processor: 'ltan',
  },
  {
    owner: 'mlopez', ago: 10, system: ['internal_app', 'Vendor Onboarding'], type: 'process_change', target: 28,
    title: 'Require bank-detail verification before vendor activation',
    text: {
      obj: p('Block vendor activation until a second person verifies the bank details.'),
      just: p('A spoofed bank-change request nearly went through last quarter.'),
      ben: ul('Lower payment fraud risk', 'Clear four-eyes control for audit'),
      req: ol('New Pending verification state', 'Verifier cannot be the person who entered the details', 'Log every bank-detail change'),
      exp: p('No vendor can be paid until its bank details are verified by a second user.'),
    },
    files: [['process_flow', 'vendor-verification.drawio', 44_512], ['regulatory', 'internal-audit-memo.docx', 98_221]],
    reg: true,
    ao: 'daniel',
    steps: [[0, 'submitted', 'submitted', 'mlopez'], [0, 'sent_to_ao', 'pending_ao', 'mlopez'], [4, 'ao_approved', 'pending_sapm', 'daniel'],
      [20, 'sapm_accepted', 'pending_final', 'ltan'], [205, 'gm_approved', 'pending_req', 'dcruz'], [212, 'req_claimed', 'req_processing', 'npatel']],
    processor: 'npatel',
  },
  {
    owner: 'kong', ago: 9, system: ['mobile_app', null], type: 'enhancement', target: 50,
    title: 'In-app chat history for logged-in customers',
    text: {
      obj: p('Show customers their past support chats inside the mobile app.'),
      just: p('Customers repeat their issue every time they open a new chat.'),
      ben: ul('Less repetition for customers', 'Agents see context faster'),
      req: ol('List previous chats with date and status', 'Open a chat transcript read-only'),
      exp: p('A returning customer can scroll back through earlier conversations.'),
    },
    files: [],
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'kong'], [0, 'sent_to_ao', 'pending_ao', 'kong'], [7, 'ao_approved', 'pending_sapm', 'grace'],
      [25, 'sapm_accepted', 'pending_final', 'npatel'], [190, 'gm_approved', 'pending_req', 'dcruz']],
  },
  {
    owner: 'jsantos', ago: 8, system: ['internal_app', 'Asset Requisition'], type: 'enhancement', target: 32,
    title: 'Bulk requisition upload for branch supplies',
    text: {
      obj: p('Let branch leads upload one spreadsheet instead of filing twenty separate requisitions.'),
      just: p('Monthly supply runs create a flood of near-identical requisitions.'),
      ben: ul('Hours saved per branch each month', 'Cleaner approval queue'),
      req: ol('Download a template', 'Upload and validate rows', 'Create one requisition per row with a shared batch number'),
      exp: p('A branch lead submits the monthly supply list in one upload.'),
    },
    files: [['process_flow', 'requisition-template.xlsx', 18_774]],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'], [3, 'ao_approved', 'pending_sapm', 'rachel'],
      [26, 'sapm_accepted', 'pending_final', 'ltan'], [176, 'gm_approved', 'pending_req', 'dcruz', null, { via: 'email' }]],
  },
  {
    owner: 'arahman', ago: 7, system: ['internal_app', 'Digital Signage CMS'], type: 'enhancement', target: 21,
    title: 'Schedule signage playlists by branch region',
    revision: 2,
    text: {
      obj: p('Schedule different signage playlists for each region from one screen.'),
      just: p('Regional promos are pushed branch by branch today, which takes a full afternoon.'),
      ben: ul('Regional promos go live together', 'Fewer wrong-region promos on screens'),
      req: ol('Group branches into regions', 'Assign a playlist to a region with start and end dates', 'Fallback to the national playlist when nothing is scheduled'),
      flow: p('Draft playlist, then pick regions, then schedule, then auto-publish at the start time.'),
      exp: p('A regional playlist starts on every screen in that region at the scheduled time.'),
    },
    files: [['process_flow', 'region-schedule-flow.pdf', 302_118]],
    ao: null,
    steps: [[0, 'submitted', 'submitted', 'arahman'], [0, 'ao_skipped', 'pending_sapm', 'arahman', 'Requestor is at Managerial level'],
      [20, 'sapm_returned', 'returned', 'npatel', 'Please add what happens when two regional playlists overlap, and attach the region list.'],
      [48, 'resubmitted', 'pending_sapm', 'arahman', 'Added the overlap rule and the process flow.', { detailedRequirements: { changed: true }, processFlow: { changed: true }, attachmentsAdded: ['region-schedule-flow.pdf'] }, 2],
      [70, 'sapm_accepted', 'pending_final', 'npatel', null, null, 2]],
  },
  {
    owner: 'jsantos', ago: 5, system: ['internal_app', 'Timekeeping'], type: 'process_change', target: 38,
    title: 'Allow shift swaps between staff with manager approval',
    text: {
      obj: p('Let staff request a shift swap with a colleague, approved by the manager in one step.'),
      just: p('Swaps are agreed over chat and the schedule is never updated, which breaks payroll.'),
      ben: ul('Accurate schedules for payroll', 'Less admin for branch managers'),
      req: ol('Pick a colleague and a shift to swap', 'Colleague accepts, then manager approves', 'Schedule updates automatically'),
      exp: p('Approved swaps show on both schedules right away.'),
    },
    files: [],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'], [6, 'ao_approved', 'pending_sapm', 'rachel'],
      [30, 'sapm_accepted', 'pending_final', 'npatel']],
  },
  {
    owner: 'tbecker', ago: 4, system: ['internal_app', 'Contract Vault'], type: 'new_feature', target: 55,
    title: 'E-signature for employment contracts',
    text: {
      obj: p('Send employment contracts for e-signature straight from Contract Vault.'),
      just: p('New hires currently print, sign and scan contracts, which delays onboarding.'),
      ben: ul('Contracts signed on day one', 'No paper storage'),
      req: ol('Send a contract for signature by email', 'Track signed / pending', 'Store the signed PDF back in the vault'),
      exp: p('HR sees the signed contract in the vault minutes after the hire signs.'),
    },
    files: [['regulatory', 'legal-e-signature-opinion.pdf', 154_620]],
    reg: true,
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'tbecker'], [0, 'sent_to_ao', 'pending_ao', 'tbecker'], [9, 'ao_approved', 'pending_sapm', 'grace']],
  },
  {
    owner: 'jsantos', ago: 3, system: ['website', null], type: 'enhancement', target: 42,
    title: 'Add a store-pickup option at checkout',
    text: {
      obj: p('Let online customers choose a branch for pickup instead of delivery.'),
      just: p('Delivery fees are the top reason for abandoned carts in our survey.'),
      ben: ul('Fewer abandoned carts', 'More foot traffic to branches'),
      req: ol('Pickup option on the checkout page', 'Branch picker with stock check', 'Ready-for-pickup email'),
      exp: p('Customers can pick a branch and get notified when the order is ready.'),
    },
    files: [['process_flow', 'pickup-checkout-flow.png', 655_002]],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'], [4, 'ao_approved', 'pending_sapm', 'rachel', null, { via: 'email' }]],
  },
  {
    owner: 'jsantos', ago: 3, system: ['internal_app', 'IT Service Desk'], type: 'enhancement', target: 26,
    title: 'Let branches attach screenshots when logging IT issues',
    text: {
      obj: p('Allow screenshots on IT tickets raised by branches.'),
      just: p('Half of branch tickets need a follow-up call just to see the error.'),
      ben: ul('Faster first response'),
      req: p('Allow image attachments.'),
      exp: p('Tickets arrive with the screenshot attached.'),
    },
    files: [],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos'], [5, 'ao_approved', 'pending_sapm', 'rachel'],
      [27, 'sapm_returned', 'returned', 'npatel', 'Please list the file types and size limit you need, and whether the branch can attach more than one screenshot.']],
  },
  {
    owner: 'kong', ago: 2, system: ['internal_app', 'Customer Helpdesk'], type: 'enhancement', target: 33,
    title: 'Satisfaction survey after a ticket is closed',
    text: {
      obj: p('Send a one-question satisfaction survey when a ticket is closed.'),
      just: p('We have no customer feedback signal on support quality.'),
      ben: ul('Measurable support quality'),
      req: ol('Email a 1-5 rating link on close', 'Show the score on the ticket and in a weekly report'),
      exp: p('Every closed ticket can collect a rating.'),
    },
    files: [],
    ao: 'grace',
    steps: [[0, 'submitted', 'submitted', 'kong'], [0, 'sent_to_ao', 'pending_ao', 'kong'],
      [20, 'sapm_returned_at_ao', 'returned', 'ltan', 'Grace is on extended leave, so this was returned. Please resubmit and it will go to your current approving officer.']],
  },
  {
    owner: 'mlopez', ago: 1, system: ['internal_app', 'Transactions Hub'], type: 'new_feature', target: 48,
    title: 'Daily reconciliation export for the finance ledger',
    text: {
      obj: p('Export a daily reconciliation file that the finance ledger can import directly.'),
      just: p('Finance rebuilds the daily file by hand from three reports.'),
      ben: ul('Two hours saved every day', 'Fewer manual entry errors'),
      req: ol('Scheduled export at 06:00', 'Ledger-ready CSV layout', 'Totals row that matches the dashboard'),
      exp: p('The ledger import runs every morning without manual edits.'),
    },
    files: [['process_flow', 'ledger-file-layout.xlsx', 22_910]],
    ao: 'daniel',
    steps: [[0, 'submitted', 'submitted', 'mlopez'], [0, 'sent_to_ao', 'pending_ao', 'mlopez']],
  },
  {
    owner: 'jsantos', ago: 0.4, system: ['internal_app', 'Partner Portal'], type: 'enhancement', target: 36,
    title: 'Partner self-service password reset',
    text: {
      obj: p('Let partners reset their own portal password by email.'),
      just: p('Password resets are the most common partner support request.'),
      ben: ul('Fewer support tickets', 'Partners unblocked without waiting'),
      req: ol('Forgot password link on the login page', 'Time-limited reset link by email', 'Lock after repeated failed attempts'),
      exp: p('A partner can reset a forgotten password in under a minute.'),
    },
    files: [],
    ao: 'rachel',
    steps: [[0, 'submitted', 'submitted', 'jsantos'], [0, 'sent_to_ao', 'pending_ao', 'jsantos']],
  },
];

const extOf = (name) => name.slice(name.lastIndexOf('.')).toLowerCase();

let attachmentId = 0;

const buildCr = (seed, index, now, year) => {
  const start = now - seed.ago * DAY;
  const at = (h) => new Date(Math.min(start + h * HOUR, now - 60 * 1000)).toISOString();
  const owner = PEOPLE[seed.owner];
  const ao = seed.ao ? AOS[seed.ao] : null;
  const revision = seed.revision || 1;
  const [systemType, appName] = seed.system;

  let from = null;
  const history = seed.steps.map(([h, action, to, actor, remarks = null, changes = null, rev]) => {
    const who = actorOf(actor);
    const row = {
      action,
      from_status: from,
      to_status: to,
      actor_uname: changes?.via === 'email' ? who.email : who.uname,
      actor_name: who.name,
      remarks,
      changes,
      revision: rev || (action === 'submitted' || action === 'sent_to_ao' || action === 'ao_skipped' ? 1 : revision),
      createdAt: at(h),
    };
    from = to;
    return row;
  });
  const last = history[history.length - 1];
  const reqStep = [...history].reverse().find((h) => h.action === 'req_created' || h.action === 'req_linked');
  const processor = seed.processor ? PEOPLE[seed.processor] : null;
  const system = appName || SYSTEM_TYPES[systemType];

  return {
    id: index + 1,
    cr_no: `CR-${year}-${String(index + 1).padStart(4, '0')}`,
    requestor_uname: owner.uname,
    requestor_name: owner.name,
    requestor_email: owner.email,
    requestor_department: owner.department,
    system_type: systemType,
    app_name: systemType === 'internal_app' ? appName : null,
    system_other: null,
    title: seed.title,
    request_type: seed.type,
    business_objective: seed.text.obj,
    business_justification: seed.text.just,
    benefits: seed.text.ben,
    detailed_requirements: seed.text.req,
    proposed_process: seed.text.proc || null,
    process_flow: seed.text.flow || null,
    expected_behavior: seed.text.exp,
    regulatory_approval_needed: Boolean(seed.reg),
    target_date: new Date(now + seed.target * DAY).toISOString().slice(0, 10),
    status: last.to_status,
    approving_officer_emp_id: ao?.emp || null,
    approving_officer_name: ao?.name || null,
    approving_officer_email: ao?.email || null,
    revision,
    submitted_at: history[0].createdAt,
    updatedAt: [...history].reverse().find((h) => h.action !== 'req_status_changed').createdAt,
    processed_by: processor?.uname || null,
    processor_name: processor?.name || null,
    processed_at: reqStep?.createdAt || null,
    req_key: seed.req?.key || null,
    req_summary: seed.req ? `[${system}] ${seed.title}` : null,
    req_status: seed.req ? seed.req.status || REQ_STATUS_NAMES[seed.req.cat] : null,
    req_status_category: seed.req?.cat || null,
    req_synced_at: seed.req ? new Date(now - 25 * 60 * 1000).toISOString() : null,
    attachments: seed.files.map(([category, name, size]) => ({
      id: ++attachmentId,
      category,
      original_name: name,
      mime_type: FILE_TYPES[extOf(name)] || 'application/octet-stream',
      size_bytes: size,
      createdAt: history[0].createdAt,
      removed_at: null,
    })),
    history,
  };
};

export const buildSeed = () => {
  attachmentId = 0;
  const now = Date.now();
  const year = new Date(now).getFullYear();
  const crs = SEEDS.map((seed, i) => buildCr(seed, i, now, year));
  return { crs, nextAttachmentId: attachmentId + 1, usedLinks: [] };
};
