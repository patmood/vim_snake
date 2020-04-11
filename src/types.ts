declare global {
  interface Window {
    state: State
    setScore: (score: number) => void
    saveScore: (score: number) => void
  }
}

export interface State {
  user?: User
  score?: Score
}

export interface User {
  displayName: string
  photoURL: string
  uid: string
}

export interface Score {
  cheater: boolean
  uid: string
  score: number
  name: string
  picture: string
}
