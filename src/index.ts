import { wasmLoader } from './wasm-loader'
import { firebase, db, functions } from './firebase'
import { State, Score } from './types'
import './leaderboard'

// Load the game
wasmLoader('main.wasm')

// State
let state: State = {}

// Elements
const signinEl = document.getElementById('signin')
const scoreEl = document.getElementById('score')
const topScoreEl = document.getElementById('topScore')

const processScore = functions.httpsCallable('processScore')

// Expose functions to call from Go
window.setScore = function setScore(score: number) {
  scoreEl.innerText = String(score)
}

window.saveScore = function saveScore(gameImage: string, meta: string, score: number) {
  const prevTopScore = state.score?.score || parseInt(topScoreEl.innerText)
  if (score > prevTopScore) {
    topScoreEl.innerText = String(score)
  }

  if (!state.user) {
    // TODO: prompt the user to sign in with twitter
    console.log('No user. Sign in to save score')
    return
  }

  if (!prevTopScore || score > prevTopScore) {
    console.log('saving score...')
    processScore([gameImage, meta]).then(console.log).catch(console.error)
  }
}

// Current User
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    signinEl.classList.add('hidden')
    state = { ...state, user }

    // Update User Top Score
    db.collection('scores')
      .doc(user.uid)
      .onSnapshot((doc) => {
        const score = doc.data() as Score
        if (score) {
          state = { ...state, score }
          topScoreEl.innerText = String(score.score)
        }
      })
  } else {
    // show signin button
    signinEl.classList.remove('hidden')
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
      if (result.additionalUserInfo.isNewUser) {
        return firebase
          .auth()
          .currentUser.updateProfile({ displayName: result.additionalUserInfo.username })
      }
    })
})
