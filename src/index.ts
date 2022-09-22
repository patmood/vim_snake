import "./leaderboard"

import { Score, State } from "./types"
import { db, firebase, functions } from "./firebase"

import PocketBase from "pocketbase"
import { wasmLoader } from "./wasm-loader"

// Load the game
wasmLoader("main.wasm")

// State
let state: State = {}

// Pocketbase client
const client = new PocketBase(process.env.POCKETBASE_URL)

// Elements
const signinEl = document.getElementById("signin")
const scoreEl = document.getElementById("score")
const topScoreEl = document.getElementById("topScore")

// Expose functions to call from Go
window.setScore = function setScore(score: number) {
  scoreEl.innerText = String(score)
}

window.saveScore = function saveScore(meta: string, score: number) {
  const prevTopScore = state.score?.score || parseInt(topScoreEl.innerText)

  if (score > prevTopScore) {
    topScoreEl.innerText = String(score)
  }

  if (!client.authStore.token) {
    prompt("Please sign in to save score!")
    return
  }

  if (!prevTopScore || score > prevTopScore) {
    console.log("saving score...")
    const formData = new FormData()
    formData.append("meta", meta)
    formData.append("score", String(score))
    fetch("http://127.0.0.1:8090/score", {
      method: "post",
      body: formData,
      headers: {
        ContentType: "multipart/form-data",
        Authorization: `User ${client.authStore.token}`,
      },
    })
  }
}

// Current User
console.log("initial auth", client.authStore.model)
const removeListener = client.authStore.onChange((token, model) => {
  console.log("New store data:", token, model)
})
// firebase.auth().onAuthStateChanged((user) => {
//   if (user) {
//     // User is signed in.
//     signinEl.classList.add("hidden")
//     state = { ...state, user }

//     // Update User Top Score
//     db.collection("scores")
//       .doc(user.uid)
//       .onSnapshot((doc) => {
//         const score = doc.data() as Score
//         if (score) {
//           state = { ...state, score }
//           topScoreEl.innerText = String(score.score)
//         }
//       })
//   } else {
//     // show signin button
//     signinEl.classList.remove("hidden")
//   }
// })

async function init() {
  // Top score
  const userTopScore = await client.records.getList("scores", 1, 50, {
    // filter: 'created >= "2022-01-01 00:00:00"',
  })
  console.log({ userTopScore })

  // Sign in
  const authMethods = await client.users.listAuthMethods()
  authMethods.authProviders.forEach((provider) => {
    const authLink = `${provider.authUrl}${
      process.env.OAUTH_REDIRECT_URL || location.origin
    }/redirect.html`
    const link = document.createElement("a")
    link.href = authLink
    link.innerText = provider.name
    link.onclick = () => {
      localStorage.setItem("provider", JSON.stringify(provider))
    }
    signinEl?.append(link)
  })
}

// Run
init()
