declare global {
  interface Window {
    setScore: (score: number) => void
    saveScore: (meta: string, score: number) => void
  }
}

export interface Score {
  cheater: boolean
  uid: string
  score: number
  displayName: string
  avatarUrl: string
  authProvider: string
  timestamp: string
  gameImage: string
}
