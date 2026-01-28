export type UserRole = 'buyer' | 'expert' | 'admin';

export type VettingStatus = 'pending' | 'approved' | 'rejected' | 'info_requested' | 'verified';

export type ExpertStatus = 'incomplete' | 'pending_review' | 'rookie' | 'verified' | 'rejected';

export type ProjectStatus = 'draft' | 'open' | 'active' | 'closed' | 'paused' | 'completed' | 'archived';

export type ContractStatus = 'pending' | 'active' | 'declined' | 'paused' | 'completed' | 'disputed';

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Domain =
  // Technology & Engineering
  | 'ai_ml'
  | 'data_science'
  | 'web_development'
  | 'mobile_development'
  | 'software_engineering'
  | 'devops_cloud'
  | 'cybersecurity'
  | 'blockchain'
  | 'database_admin'
  | 'qa_testing'
  | 'game_development'
  | 'ar_vr'
  | 'iot'
  // Deep Tech
  | 'robotics'
  | 'climate_tech'
  | 'biotech'
  | 'quantum'
  | 'space_tech'
  | 'advanced_materials'
  | 'energy'
  | 'infrastructure'
  // Design & Creative
  | 'ui_ux_design'
  | 'graphic_design'
  | 'product_design'
  | 'brand_identity'
  | 'motion_graphics'
  | 'illustration'
  | 'video_production'
  | 'photography'
  // Marketing & Sales
  | 'digital_marketing'
  | 'content_marketing'
  | 'seo'
  | 'social_media'
  | 'email_marketing'
  | 'sales_strategy'
  | 'market_research'
  // Business & Finance
  | 'business_consulting'
  | 'financial_consulting'
  | 'accounting'
  | 'legal_consulting'
  | 'hr_recruiting'
  | 'project_management'
  | 'product_management'
  | 'operations'
  // Writing & Translation
  | 'content_writing'
  | 'copywriting'
  | 'technical_writing'
  | 'translation'
  | 'editing_proofreading'
  // Other
  | 'customer_support'
  | 'virtual_assistant'
  | 'other';

export type RiskCategory = 'technical' | 'regulatory' | 'scale' | 'market';

export type EngagementType = 'advisory' | 'architecture_review' | 'hands_on_execution';

export type EngagementModel = 'daily' | 'sprint' | 'fixed' | 'hourly';

export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export type ValueTag =
  | 'decision_made'
  | 'risk_avoided'
  | 'path_clarified'
  | 'knowledge_transferred'
  | 'problem_solved';

export type IPOwnership = 'buyer_owns' | 'shared' | 'expert_owns';

export type ClientType = 'individual' | 'organisation';


/* =========================
   CHAT & MESSAGING
========================= */

export interface MessageModerationMetadata {
  isAllowed: boolean;
  violations: Array<{
    type: "number" | "contact" | "link" | "profanity";
    severity: "warning" | "block";
    description: string;
    matches: string[];
  }>;
  cleanContent?: string;
  timestamp: string;
}

export interface MessageTranslation {
  targetLanguage: string;
  content: string;
  timestamp: string;
  confidence?: number;
}

export interface ChatMessage {
  id: string;
  original: string;
  sourceLanguage?: string;
  translations?: Record<string, MessageTranslation>;
  moderation?: MessageModerationMetadata;
  displayContent?: string;
}

export interface PaymentTerms {
  currency: string;
  rate?: number;
  daily_rate?: number;
  total_days?: number;
  sprint_rate?: number;
  sprint_duration_days?: number;
  current_sprint_number?: number;
  sprint_start_date?: string;
  total_amount?: number;
  total_sprints?: number;
  hourly_rate?: number;
  estimated_hours?: number;
}

export type NdaType = 'standard_template' | 'custom_upload';
export type NdaStatus = 'pending_creation' | 'waiting_for_expert' | 'waiting_for_buyer_verification' | 'signed_and_active';

export interface NdaDetails {
  type: NdaType;
  status: NdaStatus;
  original_file_url?: string;
  signed_file_url?: string;
  sent_at?: string;
  signed_at?: string;
  digital_signature?: {
    signed_by_name: string;
    signed_at: string;
    ip_address?: string;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  last_logout?: string | null;
  avatar_url?: string;
  banner_url?: string;
  profile_completion?: number;
  settings?: Record<string, any>;
  username?: string;
}

export interface Profile extends User {
  expert_status: any;
  bio?: string;
  location?: string;
  rating?: number;
  vetting_status?: VettingStatus;
  total_hours?: number;
  review_count?: number;
  domains?: Domain[];
  company?: string;
  project_count?: number;
  phone?: string;
  phone_verified?: boolean;
  preferred_language?: string;
  username?: string;
}

export interface Expert extends User {
  // Profile-centric IDs
  expert_profile_id?: string;
  profile_id?: string;
  user_id?: string;

  timezone: string;
  headline: string;
  availability_status: string;
  bio: string;
  location: string;
  name: string;
  role: 'expert';
  domains: Domain[];
  experience_summary: string;

  avg_daily_rate: number;
  avg_fixed_rate: number;
  avg_sprint_rate: number;
  preferred_engagement_mode: EngagementModel;

  avg_hourly_rate?: number;

  availability: AvailabilitySlot[];
  vetting_status: VettingStatus;
  vetting_level?: 'general' | 'advanced' | 'deep_tech_verified';
  expert_status: ExpertStatus;

  patents?: string[];
  papers?: string[];
  products?: string[];

  skills: string[];
  expertise_areas: string[];
  languages: string[];

  years_experience: number;
  profile_video_url?: string;
  is_profile_complete: boolean;

  total_hours: number;
  rating: number;
  review_count: number;
  response_time_hours?: number;

  tier?: RankTier;
  badges?: UserTag[];
}

export interface Buyer extends User {
  role: 'buyer';

  // Profile-centric IDs
  buyer_profile_id?: string;
  profile_id?: string;
  user_id?: string;

  // From 'buyers' table
  company_name?: string;
  company_size?: string;
  industry?: string;
  total_spent: number;
  projects_posted: number;
  hires_made: number;
  rating: number;
  review_count: number;
  verified: boolean;
  verified_at?: string;
  last_active_at?: string;
  company_description?: string;
  website?: string;
  company_website?: string;
  billing_country?: string;
  avg_contract_value: number;
  preferred_engagement_model?: EngagementModel;
  client_type: ClientType;
  social_proof?: string;
  vat_id?: string;

  // Optional Join Fields (from profiles usually)
  location?: string;
  timezone?: string;
  verified_identity?: boolean; // Often mapped from verified
  verified_payment?: boolean; // Mapped from verified
  verified_email?: boolean; // From User/Profile table
}

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  status: ProjectStatus;

  currency?: string;

  budget_min?: number;
  budget_max?: number;

  trl_level: TRLLevel;
  risk_categories: RiskCategory[];
  expected_outcome: string;
  deadline?: string;
  experience_level?: ExperienceLevel;

  buyer_id: string;
  buyer_profile_id?: string;
  expert_id?: string;
  expert_profile_id?: string;

  attachments: { name: string; url: string; size?: number; type?: string }[];

  created_at: string;
  updated_at: string;
  completed_at?: string;

  // Joined Fields
  buyer?: Buyer;
  buyer_name?: string;
  buyer_avatar?: string;
  buyer_location?: string;
  buyer_rating?: number;
  buyer_joined_at?: string;
  buyer_user_id?: string;
  proposals_count?: number;
  proposal_count?: number; // alias - backend returns this

  // Viewer-specific fields (optional; provided by backend depending on endpoint)
  my_proposal_status?: 'pending' | 'accepted' | 'rejected' | null;

  // Buyer project list convenience fields
  active_contract_id?: string | null;
  active_contract_status?: string | null;
}

export interface Proposal {
  id: string;
  project_id: string;
  expert_id: string;
  expert_user_id?: string; // User account ID for chat functionality
  expert_name: string;
  expert_avatar?: string;
  quote_amount: number;
  duration_days: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  engagement_model?: EngagementModel;
  sprint_count?: number;
  rate?: number;
}

export interface Contract {
  id: string;
  project_id: string;
  buyer_id: string;
  buyer_profile_id?: string;
  buyer_user_id?: string;
  expert_id: string;
  expert_profile_id?: string;
  expert_user_id?: string;
  engagement_model: EngagementModel;
  payment_terms: PaymentTerms;
  currency?: string;
  status: ContractStatus;
  start_date: string;
  end_date?: string;

  buyer_signed_at?: string | null;
  expert_signed_at?: string | null;
  buyer_signature_name?: string | null;
  expert_signature_name?: string | null;

  nda_signed_at?: string | null;
  nda_signature_name?: string | null;
  nda_ip_address?: string | null;
  nda_custom_content?: string;
  nda_status?: 'draft' | 'sent' | 'signed' | 'skipped';

  total_amount: number;
  escrow_balance: number;
  escrow_funded_total?: number;
  released_total: number;

  ip_ownership: IPOwnership;
  nda_details?: NdaDetails;
  total_hours_logged: number;
  engagement_type: EngagementType;

  created_at: string;
  updated_at: string;

  project_title?: string;
  expert_first_name?: string;
  expert_last_name?: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
}

export interface WorkEvidence {
  summary: string;
  links: { label: string; url: string }[];
  attachments?: Array<
    | string
    | {
      name: string;
      url: string;
      path?: string;
    }
  >;
}

export interface ChecklistItem {
  task: string;
  status: 'done' | 'not_done';
}

export interface WorkLog {
  id: string;
  contract_id: string;
  expert_id?: string;
  type: 'daily_log' | 'sprint_submission' | 'fixed_submission';
  checklist?: ChecklistItem[];
  problems_faced?: string;
  sprint_number?: number;
  evidence?: WorkEvidence;
  log_date?: string;
  description: string;
  value_tags?: {
    decision_made?: string;
    risk_avoided?: string;
    path_clarified?: string;
    knowledge_transferred?: string;
    problem_solved?: string;
  };
  status?: 'submitted' | 'approved' | 'rejected' | 'pending';
  buyer_comment?: string;
  created_at?: string;
}

export interface DayWorkSummary {
  id: string;
  contract_id: string;
  expert_id: string;
  work_date: string;
  total_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_comment?: string;
  approved_at?: string;
  description?: string;
  problems_faced?: string;
  checklist?: ChecklistItem[];
  evidence?: WorkEvidence;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: any[];
  created_at: string;
  sender_name?: string;
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
  contract_id: string;
  expert_id: string;
  buyer_id: string;
  amount: number;
  total_hours: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_type: 'periodic' | 'sprint' | 'final_fixed';
  week_start_date?: string;
  week_end_date?: string;
  created_at: string;
  updated_at: string;
  source_type?: string;
  source_id?: string;
  pdf_url?: string;
}

export interface Dispute {
  id: string;
  contract_id: string;
  raised_by: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed',
  created_at: string;
}


/* =========================
   SCORING & RANKING TYPES
========================= */

export interface UserScore {
  user_id: string;
  expertise_score: number;
  performance_score: number;
  reliability_score: number;
  quality_score: number;
  engagement_score: number;
  overall_score: number;
  last_calculated_at?: string;
}

export interface RankTier {
  user_id: string;
  tier_name: string;
  tier_level: number; // 1-10
  achieved_at?: string;
  previous_tier?: string | null;
  badge_icon?: string | null;
  tier_description?: string | null;
}

export interface UserTag {
  id: string;
  user_id: string;
  tag_name: string;
  tag_category: "expertise" | "achievement" | "community" | "special";
  tag_icon?: string | null;
  description?: string | null;
  score_contribution?: number;
  awarded_at?: string;
  expires_at?: string | null;
  display_priority?: number;
  is_verified_badge?: boolean;
}

export interface LeaderboardRow {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  overall_score: number;
  tier_name?: string;
  tier_level?: number;
}

export interface TimeEntry {
  id: string;
  contract_id: string;
  expert_profile_id: string;
  description: string;
  start_time: string;
  end_time?: string | null;
  duration_minutes: number;
  hourly_rate: number;
  evidence?: WorkEvidence;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewer_comment?: string | null;
  created_at: string;
  updated_at: string;
  expert_first_name?: string;
  expert_last_name?: string;
  project_title?: string;
}
