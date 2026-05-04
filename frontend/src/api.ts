import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
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

// --- API Functions ---

export const fetchInternships = async (skip = 0, limit = 100): Promise<Internship[]> => {
  const response = await api.get<Internship[]>('/internships/', {
    params: { skip, limit },
  });
  return response.data;
};

export const searchInternships = async (
  q?: string,
  location?: string,
  skip = 0,
  limit = 100
): Promise<Internship[]> => {
  const response = await api.get<Internship[]>('/internships/search', {
    params: { q, location, skip, limit },
  });
  return response.data;
};

export const createInternship = async (internship: InternshipFormData): Promise<Internship> => {
  const response = await api.post<Internship>('/internships/', internship);
  return response.data;
};

export const updateInternship = async (
  id: number,
  internship: InternshipFormData
): Promise<Internship> => {
  const response = await api.put<Internship>(`/internships/${id}`, internship);
  return response.data;
};

export const deleteInternship = async (id: number): Promise<void> => {
  await api.delete(`/internships/${id}`);
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};

export default api;
