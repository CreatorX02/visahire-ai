export interface JobWithMatch {
  id: string
  title: string
  company: string
  companyLogo?: string | null
  location?: string | null
  country?: string | null
  isRemote: boolean
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  jobUrl: string
  description: string
  visaSponsorshipConfirmed: boolean
  source: string
  jobType?: string | null
  experienceLevel?: string | null
  postedDate?: Date | null
  scrapedAt: Date
  tags: string[]
  matchScore?: number
  matchReason?: string | null
  strengths?: string[]
  gaps?: string[]
  matchStatus?: string
  matchId?: string
}

export interface UserProfileData {
  targetRole?: string | null
  targetCountry: string[]
  yearsOfExperience?: number | null
  currentLocation?: string | null
  skills: string[]
  preferredSalaryMin?: number | null
  preferredSalaryMax?: number | null
  noticePeriod?: string | null
  visaStatus?: string | null
  industry?: string | null
  onboardingComplete: boolean
}

export interface CVData {
  id: string
  originalFileName: string
  extractedText: string
  standardizedVersion?: string | null
  overallScore?: number | null
  improvements: string[]
  missingSections: string[]
  createdAt: Date
}

export interface InterviewQuestion {
  question: string
  category: 'behavioral' | 'technical' | 'situational' | 'role-specific' | 'visa/authorization'
  difficulty: 'easy' | 'medium' | 'hard'
  suggestedAnswer: string
  followUps: string[]
}

export interface AgentStatus {
  isRunning: boolean
  lastScrapeTime?: Date | null
  nextScrapeTime?: Date | null
  totalJobs: number
  newToday: number
  expiredToday: number
  sources: SourceStat[]
}

export interface SourceStat {
  source: string
  jobsFound: number
  lastSuccess?: Date | null
  successRate: number
}
