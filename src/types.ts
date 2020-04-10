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
  photoURL: string
  twitterOauthToken: string
  twitterOauthTokenSecret: string
  uid: string
  topScore: {
    timestamp: number
    score: number
  }
}
