import { wasmLoader } from './wasm-loader'
import { firebase, db, functions } from './firebase'
import { State } from './types'

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
    // TODO: save in local storage
    return
  }

  // if (score > state.userScore.score) {
  processScore(score).then(console.log).catch(console.error)
  // }
}

// Current User
firebase.auth().onAuthStateChanged((user) => {
  console.log(`User state changed`)
  console.log(user && user.displayName)
  if (user) {
    // User is signed in.
    signinEl.classList.add('hidden')
    const { displayName, photoURL, uid } = user
    state = { ...state, user: { displayName, photoURL, uid } }
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
      if (result.additionalUserInfo.isNewUser) {
        return firebase
          .auth()
          .currentUser.updateProfile({ displayName: result.additionalUserInfo.username })
      }
    })
    .then(() => console.log('saved'))
})
