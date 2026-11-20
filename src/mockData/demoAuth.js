// for the demo: opens logged in, the sidebar switches personas
const PERSONA_KEY = 'changeflow.demoPersona';

export const PERSONAS = {
  requestor: {
    id: 'requestor',
    label: 'Requestor',
    uname: 'jsantos',
    employeeId: 'E-1024',
    name: 'Jamie Santos',
    email: 'jamie.santos@example.com',
    department: 'Retail Operations',
    departmentSlug: 'retail-operations',
    position: 'Operations Analyst',
    role: 'requestor',
    roleName: 'Requestor',
    image: null,
    approvingOfficerEmpId: 'E-2001',
    level: 'Rank and File',
  },
  'sa-pm': {
    id: 'sa-pm',
    label: 'SA / PM',
    uname: 'npatel',
    employeeId: 'E-1310',
    name: 'Nina Patel',
    email: 'nina.patel@example.com',
    department: 'IT Projects & Development',
    departmentSlug: 'it-projects-development',
    position: 'Systems Analyst / Project Manager',
    role: 'sa-pm',
    roleName: 'SA/PM',
    image: null,
    approvingOfficerEmpId: 'E-2005',
    level: 'Supervisory',
  },
  'general-manager': {
    id: 'general-manager',
    label: 'General Manager',
    uname: 'dcruz',
    employeeId: 'E-1002',
    name: 'Daniel Cruz',
    email: 'daniel.cruz@example.com',
    department: 'Office of the General Manager',
    departmentSlug: 'office-of-the-gm',
    position: 'General Manager',
    role: 'general-manager',
    roleName: 'General Manager',
    image: null,
    approvingOfficerEmpId: null,
    level: 'Managerial',
  },
};

// for approving officers who are not personas
export const APPROVING_OFFICERS = {
  'E-2001': { employeeId: 'E-2001', name: 'Rachel Kim', email: 'rachel.kim@example.com' },
  'E-2005': { employeeId: 'E-2005', name: 'Owen Brooks', email: 'owen.brooks@example.com' },
  'E-1002': { employeeId: 'E-1002', name: 'Daniel Cruz', email: 'daniel.cruz@example.com' },
};

export const DEFAULT_PERSONA = 'requestor';

const read = () => {
  try {
    return localStorage.getItem(PERSONA_KEY);
  } catch {
    return null;
  }
};

export const getPersonaId = () => {
  const stored = read();
  return stored && PERSONAS[stored] ? stored : DEFAULT_PERSONA;
};

export const setPersona = (id, to) => {
  if (!PERSONAS[id]) return;
  try {
    localStorage.setItem(PERSONA_KEY, id);
  } catch {
    // for private mode
  }
  window.location.assign(to || import.meta.env.BASE_URL);
};

export const getDemoUser = () => {
  const { id, label, ...user } = PERSONAS[getPersonaId()];
  return user;
};
