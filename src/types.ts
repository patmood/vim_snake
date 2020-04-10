declare global {
  interface Window {
    state: State
    setScore: (score: number) => void
    saveScore: (score: number) => void
  }
}

export interface State {
  user?: UserDoc
}

export interface UserDoc {
  displayName: string
  cheater: boolean
  photoURL: string
  uid: string
  username: string
  topScore?: {
    timestamp: number
    score: number
  }
}
