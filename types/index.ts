export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'year' | 'month' | 'hour';
  };
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  visaSponsorship: boolean;
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  deadline?: string;
  applicants: number;
  category: JobCategory;
  remote: boolean;
  source: string;
  sourceUrl: string;
  aiMatchScore?: number;
  featured?: boolean;
}

export type JobCategory =
  | 'engineering'
  | 'design'
  | 'marketing'
  | 'finance'
  | 'healthcare'
  | 'data'
  | 'product'
  | 'sales'
  | 'operations'
  | 'legal';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  skills: string[];
  location: string;
  visaStatus: 'citizen' | 'permanent_resident' | 'work_visa' | 'student' | 'requires_sponsorship';
  preferredLocations: string[];
  preferredCategories: JobCategory[];
  savedJobIds: string[];
  appliedJobIds: string[];
}

export interface SearchFilters {
  query: string;
  category?: JobCategory;
  type?: Job['type'];
  level?: Job['level'];
  visaOnly: boolean;
  remoteOnly: boolean;
  minSalary?: number;
  location?: string;
  country?: string;
  sortBy: 'relevance' | 'date' | 'salary' | 'match';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  jobSuggestions?: Job[];
}

export interface Notification {
  id: string;
  type: 'match' | 'application' | 'deadline' | 'news';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  jobId?: string;
}

export interface ApplicationStatus {
  jobId: string;
  status: 'bookmarked' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}
