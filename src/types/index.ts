import { User, Lead, Company, Tag, EmailLog, Reminder } from '@prisma/client'

// Utökade typer med relations
export type UserWithCompany = User & {
  company: Company
}

export type LeadWithRelations = Lead & {
  assignedTo?: User | null
  createdBy: User
  tags: (LeadTag & { tag: Tag })[]
  emailLogs: EmailLog[]
  reminders: Reminder[]
  company: Company
}

export type LeadTag = {
  leadId: string
  tagId: string
  tag: Tag
}

export type EmailLogWithRelations = EmailLog & {
  lead?: Lead | null
  sentBy: User
  company: Company
}

export type ReminderWithRelations = Reminder & {
  lead: Lead
  user: User
}

// Dashboard statistik
export type DashboardStats = {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  closedWonLeads: number
  pendingReminders: number
  emailsSent: number
  emailsOpened: number
  conversionRate: number
}

// Filter och sök
export interface LeadFilters {
  status?: string[]
  tags?: string[]
  assignedTo?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  search?: string
}

// Form data
export interface CreateLeadData {
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  title?: string
  status?: string
  notes?: string
  source?: string
  assignedToId?: string
  tags?: string[]
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  id: string
}

export interface CreateReminderData {
  title: string
  description?: string
  dueDate: Date
  leadId: string
}

export interface CreateEmailData {
  to: string
  subject: string
  content: string
  leadId?: string
}

// API Response typer
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
