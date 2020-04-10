import { wasmLoader } from './wasm-loader'
import { firebase, db, functions } from './firebase'
import { State, UserDoc } from './types'

// Load the game
wasmLoader('main.wasm')

// State
let state: State = {}

// Elements
const signinEl = document.getElementById('signin')
const scoreEl = document.getElementById('score')
const topScoreEl = document.getElementById('topScore')
const twitterBtn = document.getElementById('twitter')

const processScore = functions.httpsCallable('processScore')

// Expose functions to call from Go
window.setScore = function setScore(score: number) {
  scoreEl.innerText = String(score)
}

window.saveScore = function saveScore(score: number) {
  if (!state.user) {
    // TODO: prompt the user to sign in with twitter
    return
  }

  // if (score > state.user.topScore.score) {
  processScore(score).then(console.log).catch(console.error)
  // }
}

// Current User
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    signinEl.classList.add('hidden')
    db.doc(`users/${user.uid}`).onSnapshot((doc) => {
      const userDoc = doc.data() as UserDoc
      state = { ...state, user: { ...userDoc } }
      topScoreEl.innerText = String(userDoc.topScore ? userDoc.topScore.score : 0)
    })
  } else {
    // show signin button
    signinEl.classList.remove('hidden')
  }
})

// Twitter login
const provider = new firebase.auth.TwitterAuthProvider()
twitterBtn.addEventListener('click', () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      console.log({ result })

      if (result.additionalUserInfo.isNewUser) {
        const user = result.user
        const userDoc: UserDoc = {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          username: result.additionalUserInfo.username,
        }
        return db.doc(`users/${user.uid}`).update(userDoc)
      }
    })
    .then(() => {
      console.log('Document successfully written!')
    })
    .catch((error) => {
      console.log({ error })
    })
})
