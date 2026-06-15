import axios from 'axios';

// When VITE_API_URL is set, the app talks to the real FastAPI backend.
// Otherwise it runs in DEMO mode with bundled sample data (static hosting,
// no backend). Sample data only — nothing is persisted server-side.
const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const DEMO_MODE = !API_URL;

const api = axios.create({
  baseURL: API_URL || 'http://localhost:8000',
});

// --- Types ---

export interface CredibilityScore {
  score: number;
  reason: string;
}

export interface Internship {
  id: number;
  title: string;
  company: string;
  description: string;
  skills_required: string;
  location: string;
  posted_date: string;
  source_url: string;
  is_scam: boolean;
  scam_score: number;
  scam_report: string;
  credibility_score?: CredibilityScore;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

export interface InternshipFormData {
  title: string;
  company: string;
  description: string;
  skills_required: string;
  location: string;
  source_url: string;
}

// --- Demo sample data ---

const demoInternships: Internship[] = [
  {
    id: 1,
    title: 'Frontend Engineering Intern',
    company: 'Stripe',
    description: 'Work with the payments dashboard team building accessible React components used by millions of businesses. Mentored by senior engineers.',
    skills_required: 'React, TypeScript, CSS, Testing',
    location: 'Bengaluru, India (Hybrid)',
    posted_date: '2026-05-28',
    source_url: 'https://stripe.com/jobs',
    is_scam: false,
    scam_score: 3,
    scam_report: '',
    credibility_score: { score: 9.4, reason: 'Verified company domain, structured stipend disclosure, and a clear scope of work.' },
  },
  {
    id: 2,
    title: 'Machine Learning Intern',
    company: 'Razorpay',
    description: 'Build and evaluate fraud-detection models on real transaction streams. Strong fundamentals in Python and statistics expected.',
    skills_required: 'Python, scikit-learn, SQL, Pandas',
    location: 'Bengaluru, India',
    posted_date: '2026-06-02',
    source_url: 'https://razorpay.com/jobs',
    is_scam: false,
    scam_score: 5,
    scam_report: '',
    credibility_score: { score: 8.7, reason: 'Reputable employer with a verifiable careers page and realistic role requirements.' },
  },
  {
    id: 3,
    title: 'Data Analyst Intern',
    company: 'Zomato',
    description: 'Support the supply analytics team with dashboards and ad-hoc analysis to improve delivery efficiency across cities.',
    skills_required: 'SQL, Excel, Tableau, Statistics',
    location: 'Gurugram, India',
    posted_date: '2026-06-10',
    source_url: 'https://www.zomato.com/careers',
    is_scam: false,
    scam_score: 8,
    scam_report: '',
    // unverified: no credibility_score and not scam
  },
  {
    id: 4,
    title: 'WORK FROM HOME - Earn ₹40,000/week!!!',
    company: 'Global Ventures Pvt Ltd',
    description: 'No skills needed! Just pay a small ₹2,500 registration fee to get started. Guaranteed income. Limited seats, apply NOW via WhatsApp!',
    skills_required: 'None',
    location: 'Remote',
    posted_date: '2026-06-12',
    source_url: 'http://global-ventures-apply.example',
    is_scam: true,
    scam_score: 96,
    scam_report: JSON.stringify({
      flags: ['Upfront registration fee requested', 'Unrealistic guaranteed pay', 'Contact only via WhatsApp', 'No verifiable company domain'],
      verdict: 'High-confidence scam — legitimate internships never ask for payment to apply.',
    }),
  },
  {
    id: 5,
    title: 'Backend Developer Intern',
    company: 'Freshworks',
    description: 'Contribute to internal APIs and microservices powering customer support tooling. Code review and CI culture.',
    skills_required: 'Node.js, PostgreSQL, REST, Docker',
    location: 'Chennai, India (Hybrid)',
    posted_date: '2026-05-21',
    source_url: 'https://www.freshworks.com/company/careers/',
    is_scam: false,
    scam_score: 4,
    scam_report: '',
    credibility_score: { score: 9.0, reason: 'Established product company; role scope and tech stack are concrete and consistent.' },
  },
  {
    id: 6,
    title: 'Data Entry Internship (Immediate Joining)',
    company: 'QuickCash Solutions',
    description: 'Copy-paste work from home. Send your Aadhaar and bank details to confirm your slot. Earn per form filled. Pay refundable deposit first.',
    skills_required: 'Typing',
    location: 'Remote',
    posted_date: '2026-06-14',
    source_url: 'http://quickcash-solutions.example',
    is_scam: true,
    scam_score: 91,
    scam_report: JSON.stringify({
      flags: ['Requests sensitive personal/bank details', 'Refundable deposit required', 'Vague employer with no online footprint'],
      verdict: 'Likely scam — never share Aadhaar/bank details or pay a deposit for an internship.',
    }),
  },
  {
    id: 7,
    title: 'Product Design Intern',
    company: 'CRED',
    description: 'Prototype and test flows for the rewards experience. Work closely with product and engineering in a tight feedback loop.',
    skills_required: 'Figma, UX Research, Prototyping',
    location: 'Bengaluru, India',
    posted_date: '2026-06-05',
    source_url: 'https://careers.cred.club/',
    is_scam: false,
    scam_score: 6,
    scam_report: '',
    credibility_score: { score: 8.3, reason: 'Known consumer brand with an active hiring portal and realistic expectations.' },
  },
  {
    id: 8,
    title: 'Cloud / DevOps Intern',
    company: 'Postman',
    description: 'Help maintain CI/CD pipelines and observability dashboards. Exposure to Kubernetes and infrastructure as code.',
    skills_required: 'AWS, Kubernetes, Terraform, Linux',
    location: 'Remote (India)',
    posted_date: '2026-05-30',
    source_url: 'https://www.postman.com/company/careers/',
    is_scam: false,
    scam_score: 7,
    scam_report: '',
    // unverified
  },
];

let demoStore: Internship[] = [...demoInternships];
let nextId = demoStore.length + 1;
const delay = <T,>(value: T, ms = 300): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

// --- API Functions ---

export const fetchInternships = async (skip = 0, limit = 100): Promise<Internship[]> => {
  if (DEMO_MODE) return delay(demoStore.slice(skip, skip + limit));
  const response = await api.get<Internship[]>('/internships/', { params: { skip, limit } });
  return response.data;
};

export const searchInternships = async (
  q?: string,
  location?: string,
  skip = 0,
  limit = 100
): Promise<Internship[]> => {
  if (DEMO_MODE) {
    const ql = (q || '').toLowerCase();
    const ll = (location || '').toLowerCase();
    const filtered = demoStore.filter((i) => {
      const matchQ = !ql || `${i.title} ${i.company} ${i.skills_required} ${i.description}`.toLowerCase().includes(ql);
      const matchL = !ll || i.location.toLowerCase().includes(ll);
      return matchQ && matchL;
    });
    return delay(filtered.slice(skip, skip + limit));
  }
  const response = await api.get<Internship[]>('/internships/search', { params: { q, location, skip, limit } });
  return response.data;
};

export const createInternship = async (internship: InternshipFormData): Promise<Internship> => {
  if (DEMO_MODE) {
    const created: Internship = {
      id: nextId++,
      ...internship,
      posted_date: new Date().toISOString().split('T')[0],
      is_scam: false,
      scam_score: 12,
      scam_report: '',
      credibility_score: { score: 7.5, reason: 'Demo submission — credibility scoring is illustrative only.' },
    };
    demoStore = [created, ...demoStore];
    return delay(created);
  }
  const response = await api.post<Internship>('/internships/', internship);
  return response.data;
};

export const updateInternship = async (id: number, internship: InternshipFormData): Promise<Internship> => {
  if (DEMO_MODE) {
    const idx = demoStore.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Not found');
    demoStore[idx] = { ...demoStore[idx], ...internship };
    return delay(demoStore[idx]);
  }
  const response = await api.put<Internship>(`/internships/${id}`, internship);
  return response.data;
};

export const deleteInternship = async (id: number): Promise<void> => {
  if (DEMO_MODE) {
    demoStore = demoStore.filter((i) => i.id !== id);
    await delay(null);
    return;
  }
  await api.delete(`/internships/${id}`);
};

export const loginUser = async (email: string, _password: string): Promise<LoginResponse> => {
  if (DEMO_MODE) {
    return delay({ access_token: 'demo-token', token_type: 'bearer', user_id: 1, username: email.split('@')[0] || 'demo_user' });
  }
  const response = await api.post<LoginResponse>('/auth/login', { email, password: _password });
  return response.data;
};

export const registerUser = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
  if (DEMO_MODE) {
    return delay({ id: 1, username, email });
  }
  const response = await api.post<RegisterResponse>('/auth/register', { username, email, password });
  return response.data;
};

export default api;
