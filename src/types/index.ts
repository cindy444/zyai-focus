export type AreaName =
  | 'System Design'
  | 'Parental family'
  | 'Social'
  | 'Professional (Linkedin)'
  | 'Financial'
  | 'Personal (Mental Health)'
  | 'Youtube'
  | 'Tech Playground'
  | 'Reading'

export const ALL_AREAS: AreaName[] = [
  'System Design',
  'Parental family',
  'Social',
  'Professional (Linkedin)',
  'Financial',
  'Personal (Mental Health)',
  'Youtube',
  'Tech Playground',
  'Reading',
]

export interface Session {
  id: string
  created_at: string
  start_time: string
  end_time: string
  duration_seconds: number
  overall_motivation: number
  overall_notes: string
}

export interface SessionLog {
  id: string
  session_id: string
  area_name: AreaName
  content: string
}

export interface DailyCheckIn {
  id: string
  date: string
  mood_summary: string | null
  blockers: string | null
}

export interface CompletionFormState {
  selectedAreas: AreaName[]
  areaLogs: Partial<Record<AreaName, string>>
  motivationLevel: number
  struggleNote: string
  overallNotes: string
}

export interface BackupPayload {
  exportedAt: string
  sessions: Session[]
  session_logs: SessionLog[]
  daily_check_ins: DailyCheckIn[]
}
