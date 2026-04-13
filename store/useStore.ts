import { create } from 'zustand';
import type { Job, User, SearchFilters, ChatMessage, ApplicationStatus } from '../types';
import { MOCK_JOBS, MOCK_USER, MOCK_CHAT_MESSAGES } from '../constants/data';

interface AppStore {
  // Auth
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  user: User | null;
  login: (email: string, _password: string) => Promise<void>;
  register: (name: string, email: string, _password: string) => Promise<void>;
  logout: () => void;
  setOnboarded: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Jobs
  jobs: Job[];
  featuredJobs: Job[];
  isLoadingJobs: boolean;
  fetchJobs: (filters?: Partial<SearchFilters>) => Promise<void>;

  // Search
  filters: SearchFilters;
  searchResults: Job[];
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;

  // Saved Jobs
  savedJobs: Job[];
  toggleSaveJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;

  // Applications
  applications: ApplicationStatus[];
  applyToJob: (jobId: string) => void;
  updateApplicationStatus: (jobId: string, status: ApplicationStatus['status']) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;

  // Notifications count
  unreadCount: number;
  markAllRead: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  visaOnly: false,
  remoteOnly: false,
  sortBy: 'relevance',
};

const AI_RESPONSES = [
  "I found several visa-sponsored roles matching your skills! Let me pull the top matches for you... Based on your React/TypeScript background, Stripe and Airbnb are your strongest fits right now.",
  "Great question! For H-1B sponsorship, top companies with high approval rates include Microsoft, Google, Amazon, Meta, and Apple — they file thousands of H-1B petitions annually.",
  "To strengthen your profile, I'd recommend: 1) Highlighting system design experience, 2) Adding quantified achievements, 3) Contributing to open source. Would you like me to review your resume?",
  "I've scanned 47 new job postings in the last hour. 12 match your profile with 80%+ compatibility. Top pick: OpenAI ML Engineer — 91% match with full visa sponsorship.",
  "Canada's work permits for engineers: You can apply for the Global Talent Stream (2-week processing!), LMIA-based work permits, or Express Entry. Shopify and Shopify partners actively sponsor. Shall I find specific openings?",
  "For remote visa-sponsored roles, companies like Shopify, Automattic, GitLab, and Notion hire globally and assist with visas in certain countries. I found 8 active listings for you!",
];

let aiResponseIndex = 0;

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  isAuthenticated: false,
  hasOnboarded: false,
  user: null,

  login: async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    set({ isAuthenticated: true, user: { ...MOCK_USER, email } });
  },

  register: async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1200));
    set({
      isAuthenticated: true,
      user: { ...MOCK_USER, name, email, savedJobIds: [], appliedJobIds: [] },
    });
  },

  logout: () => set({ isAuthenticated: false, user: null, chatMessages: MOCK_CHAT_MESSAGES }),

  setOnboarded: () => set({ hasOnboarded: true }),

  updateUser: (updates) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

  // Jobs
  jobs: MOCK_JOBS,
  featuredJobs: MOCK_JOBS.filter((j) => j.featured),
  isLoadingJobs: false,

  fetchJobs: async (filters) => {
    set({ isLoadingJobs: true });
    await new Promise((r) => setTimeout(r, 600));
    const { filters: currentFilters } = get();
    const merged = { ...currentFilters, ...filters };
    let results = [...MOCK_JOBS];

    if (merged.query) {
      const q = merged.query.toLowerCase();
      results = results.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (merged.visaOnly) results = results.filter((j) => j.visaSponsorship);
    if (merged.remoteOnly) results = results.filter((j) => j.remote);
    if (merged.category) results = results.filter((j) => j.category === merged.category);
    if (merged.type) results = results.filter((j) => j.type === merged.type);
    if (merged.level) results = results.filter((j) => j.level === merged.level);
    if (merged.country) {
      const c = merged.country.toLowerCase();
      results = results.filter((j) => j.country.toLowerCase().includes(c));
    }
    if (merged.sortBy === 'salary') {
      results.sort((a, b) => b.salary.max - a.salary.max);
    } else if (merged.sortBy === 'match') {
      results.sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0));
    } else if (merged.sortBy === 'date') {
      results.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    set({ searchResults: results, isLoadingJobs: false });
  },

  // Search
  filters: DEFAULT_FILTERS,
  searchResults: MOCK_JOBS,

  setFilters: (updates) => {
    set((state) => ({ filters: { ...state.filters, ...updates } }));
    get().fetchJobs(updates);
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, searchResults: MOCK_JOBS });
  },

  // Saved Jobs
  get savedJobs() {
    const { jobs, user } = get();
    return jobs.filter((j) => user?.savedJobIds.includes(j.id));
  },

  toggleSaveJob: (jobId) =>
    set((state) => {
      if (!state.user) return state;
      const saved = state.user.savedJobIds.includes(jobId);
      return {
        user: {
          ...state.user,
          savedJobIds: saved
            ? state.user.savedJobIds.filter((id) => id !== jobId)
            : [...state.user.savedJobIds, jobId],
        },
      };
    }),

  isJobSaved: (jobId) => get().user?.savedJobIds.includes(jobId) ?? false,

  // Applications
  applications: [],

  applyToJob: (jobId) => {
    const exists = get().applications.find((a) => a.jobId === jobId);
    if (exists) return;
    set((state) => ({
      applications: [
        ...state.applications,
        {
          jobId,
          status: 'applied',
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      user: state.user
        ? { ...state.user, appliedJobIds: [...state.user.appliedJobIds, jobId] }
        : null,
    }));
  },

  updateApplicationStatus: (jobId, status) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.jobId === jobId ? { ...a, status, updatedAt: new Date().toISOString() } : a
      ),
    })),

  // AI Chat
  chatMessages: MOCK_CHAT_MESSAGES,
  isChatLoading: false,

  sendMessage: async (content) => {
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      isChatLoading: true,
    }));

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: ChatMessage = {
      id: `m_${Date.now() + 1}`,
      role: 'assistant',
      content: AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length],
      timestamp: new Date().toISOString(),
    };
    aiResponseIndex++;

    set((state) => ({
      chatMessages: [...state.chatMessages, aiMsg],
      isChatLoading: false,
    }));
  },

  clearChat: () => set({ chatMessages: MOCK_CHAT_MESSAGES }),

  // Notifications
  unreadCount: 2,
  markAllRead: () => set({ unreadCount: 0 }),
}));
