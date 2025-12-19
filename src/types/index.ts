export type UserRole = 'buyer' | 'expert' | 'admin';

export type VettingStatus = 'pending' | 'approved' | 'rejected' | 'info_requested';

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export type ContractStatus = 'pending' | 'active' | 'paused' | 'completed' | 'disputed';

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Domain = 
  | 'ai_ml'
  | 'robotics'
  | 'climate_tech'
  | 'biotech'
  | 'quantum'
  | 'space_tech'
  | 'advanced_materials'
  | 'energy'
  | 'infrastructure';

export type RiskCategory = 'technical' | 'regulatory' | 'scale' | 'market';

export type EngagementType = 'advisory' | 'architecture_review' | 'hands_on_execution';

export type ValueTag = 
  | 'decision_made'
  | 'risk_avoided'
  | 'path_clarified'
  | 'knowledge_transferred'
  | 'problem_solved';

export type IPOwnership = 'buyer_owns' | 'shared' | 'expert_owns';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  location?: string;
  profileVisible: boolean;
  createdAt: Date;
}

export interface Expert extends User {
  role: 'expert';
  domains: Domain[];
  experienceSummary: string;
  hourlyRates: {
    advisory: number;
    architectureReview: number;
    handsOnExecution: number;
  };
  availability: AvailabilitySlot[];
  vettingStatus: VettingStatus;
  vettingLevel?: 'general' | 'advanced' | 'deep_tech_verified';
  patents?: string[];
  papers?: string[];
  products?: string[];
  totalHours: number;
  rating: number;
  reviewCount: number;
}

export interface Buyer extends User {
  role: 'buyer';
  company?: string;
  projectCount: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Project {
  id: string;
  clientId: string; // Using database field name (client_id)
  title: string;
  domain: Domain;
  problemDescription: string;
  trlLevel: TRLLevel;
  riskCategories: RiskCategory[];
  expectedOutcome: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  projectId: string;
  clientId: string; // Using database field name (client_id)
  expertId: string;
  hourlyRate: number;
  engagementType: EngagementType;
  weeklyHourCap: number;
  startDate: Date;
  endDate?: Date;
  status: ContractStatus;
  ipOwnership: IPOwnership;
  ndaSigned: boolean;
  totalHoursLogged: number;
  totalAmount: number;
  escrowBalance: number;
}

export interface HourLog {
  id: string;
  contractId: string;
  expertId: string;
  date: Date;
  hours: number;
  description: string;
  valueTags: ValueTag[];
  decision?: string;
  approved: boolean;
  buyerComment?: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  attachments?: FileAttachment[];
  createdAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Invoice {
  id: string;
  contractId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHours: number;
  totalAmount: number;
  status: 'pending' | 'paid';
  pdfUrl?: string;
}

export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  createdAt: Date;
}
