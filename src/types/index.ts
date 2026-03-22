export type AreaName = string

export interface AreaConfig {
  name: string
  emoji: string
}

export const DEFAULT_AREAS: AreaConfig[] = [
  { name: 'System Design', emoji: '⚙️' },
  { name: 'Parental family', emoji: '❤️' },
  { name: 'Social', emoji: '👥' },
  { name: 'Professional (Linkedin)', emoji: '💼' },
  { name: 'Financial', emoji: '💰' },
  { name: 'Personal (Mental Health)', emoji: '🧠' },
  { name: 'Youtube', emoji: '📹' },
  { name: 'Tech Playground', emoji: '💻' },
  { name: 'Reading', emoji: '📚' },
]

export const ALL_AREAS: AreaName[] = DEFAULT_AREAS.map((a) => a.name)

export interface Session {
  id: string
  created_at: string
  start_time: string
  end_time: string
  duration_seconds: number
  estimated_seconds: number | null
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
  intention: string
  mood: number
}

export interface AreaPreset {
  id: string
  name: string
  areas: string[]
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
  custom_areas?: AreaConfig[]
  presets?: AreaPreset[]
}
