import { wasmLoader } from './wasm-loader'
import { firebase } from './firebase'

const WASM_URL = 'main.wasm'

wasmLoader(WASM_URL)

const scoreEl = document.getElementById('score')
// Expose functions to call from Go
window.setScore = function setScore(score: string) {
  scoreEl.innerText = score
}

window.saveScore = function saveScore() {
  console.log('TODO')
}

// Current User
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    console.log({ currentUser: user })
  }
})

// Twitter login
const provider = new firebase.auth.TwitterAuthProvider()
const twitterBtn = document.getElementById('twitter')
twitterBtn.addEventListener('click', () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      const token = result.credential.accessToken
      const secret = result.credential.secret
      const user = result.user
      console.log({ result })
    })
    .catch(function (error) {
      console.log({ error })
    })
})
