import { wasmLoader } from './wasm-loader'
import { firebase, db } from './firebase'
import { State, UserDoc } from './types'

// Load the game
wasmLoader('main.wasm')

// State
let state: State = {}

const scoreEl = document.getElementById('score')
// Expose functions to call from Go
window.setScore = function setScore(score: number) {
  scoreEl.innerText = score
}

window.saveScore = function saveScore(score: number) {
  if (!state.user) {
    // TODO: prompt the user to sign in with twitter
    return
  }
  console.log({ score })
  if (score > state.user.topScore.score) {
    db.collection('users')
      .doc(state.user.uid)
      .set({ topScore: { score, timestamp: Date.now() } })
  }
}

// Current User
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    db.collection('users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        const userDoc = doc.data() as UserDoc
        state = { ...state, user: { ...userDoc } }
        console.log({ state })
      })
      .catch(console.log)
  } else {
    // show signin button
  }
})

// Twitter login
const provider = new firebase.auth.TwitterAuthProvider()
const twitterBtn = document.getElementById('twitter')
twitterBtn.addEventListener('click', () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      const twitterOauthToken = result.credential.accessToken
      const twitterOauthTokenSecret = result.credential.secret
      const user = result.user
      return db.collection('users').doc(user.uid).set({
        twitterOauthToken,
        twitterOauthTokenSecret,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })
    })
    .then(() => {
      console.log('Document successfully written!')
    })
    .catch((error) => {
      console.log({ error })
    })
})
