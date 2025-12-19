import { Contract } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface CreateContractInput {
  projectId: string
  expertId: string
  engagementType: 'hourly' | 'fixed'
  hourlyRate: number
  weeklyHourCap: number
  startDate: string
  endDate?: string
  ipOwnership: 'client' | 'shared' | 'expert'
  ndaSigned: boolean
  escrowAmount?: number
}

export interface LogHoursInput {
  date: string
  hours: number
  description: string
  valueTags: {
    decisionMade?: string
    riskAvoided?: string
    pathClarified?: string
    knowledgeTransferred?: string
    problemSolved?: string
  }
}

export interface HourLog {
  id: string
  contractId: string
  expertId: string
  date: Date
  hours: number
  description: string
  valueTags: {
    decisionMade?: string
    riskAvoided?: string
    pathClarified?: string
    knowledgeTransferred?: string
    problemSolved?: string
  }
  approved: boolean | null
  buyerComment?: string
  createdAt: Date
}

// Contract Management
export const contractService = {
  // Create a new contract (buyer invites expert)
  async createContract(input: CreateContractInput): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create contract')
    }

    return response.json()
  },

  // Get all contracts (filtered by user role)
  async getContracts(): Promise<Contract[]> {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contracts')
    }

    return response.json()
  },

  // Get a single contract by ID
  async getContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contract')
    }

    return response.json()
  },

  // Expert accepts contract invitation
  async acceptContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/accept`, {
      method: 'PATCH',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to accept contract')
    }

    return response.json()
  },

  // Expert declines contract invitation
  async declineContract(contractId: string, reason?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/decline`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to decline contract')
    }
  },

  // Pause contract (buyer or expert)
  async pauseContract(contractId: string, reason: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/pause`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to pause contract')
    }

    return response.json()
  },

  // Resume paused contract
  async resumeContract(contractId: string): Promise<Contract> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/resume`, {
      method: 'PATCH',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to resume contract')
    }

    return response.json()
  },
}

// Hour Logging
export const hourLogService = {
  // Expert logs hours
  async logHours(contractId: string, input: LogHoursInput): Promise<HourLog> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to log hours')
    }

    return response.json()
  },

  // Get all hour logs for a contract
  async getHourLogs(contractId: string): Promise<HourLog[]> {
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/hours`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch hour logs')
    }

    const logs = await response.json()
    
    // Convert date strings to Date objects
    return logs.map((log: any) => ({
      ...log,
      date: new Date(log.date),
      createdAt: new Date(log.createdAt),
    }))
  },

  // Buyer approves hour log
  async approveHourLog(
    contractId: string,
    hourLogId: string,
    comment?: string
  ): Promise<HourLog> {
    const response = await fetch(
      `${API_BASE_URL}/contracts/${contractId}/hours/${hourLogId}/approve`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to approve hour log')
    }

    return response.json()
  },

  // Buyer rejects hour log
  async rejectHourLog(
    contractId: string,
    hourLogId: string,
    reason: string
  ): Promise<HourLog> {
    const response = await fetch(
      `${API_BASE_URL}/contracts/${contractId}/hours/${hourLogId}/reject`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reject hour log')
    }

    return response.json()
  },

  // Get weekly hour summary
  async getWeeklySummary(contractId: string, weekStart: string): Promise<{
    totalHours: number
    approvedHours: number
    pendingHours: number
    rejectedHours: number
    weeklyLimit: number
    remainingHours: number
  }> {
    const response = await fetch(
      `${API_BASE_URL}/contracts/${contractId}/hours/weekly?week=${weekStart}`,
      { credentials: 'include' }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch weekly summary')
    }

    return response.json()
  },
}
