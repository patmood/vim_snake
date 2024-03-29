import "./leaderboard"

import PocketBase from "pocketbase"
import type { ScoresRecord } from "./pocketbase-types"
import { renderLeaderboard } from "./leaderboard"
import { wasmLoader } from "./wasm-loader"

// Load the game
wasmLoader("main.wasm")

// Pocketbase client
const client = new PocketBase()
window.client = client
window.loadMore = function () {
  const button = document.getElementById("loadMore")
  if (button) button.style.display = "none"
  getLeaderboard(1000)
}

// Elements
const signinEl = document.getElementById("signin")
const scoreEl = document.getElementById("score")
const topScoreEl = document.getElementById("topScore")
const leadersEl = document.getElementById("leaders")

// Expose functions to call from Go
window.setScore = function setScore(score: number) {
  scoreEl.innerText = String(score)
}

window.saveScore = function saveScore(meta: string, score: number) {
  const prevTopScore = parseInt(topScoreEl.innerText)

  if (score > prevTopScore) {
    topScoreEl.innerText = String(score)
  }

  if (!client.authStore.token) {
    // prompt("Please sign in to save score!")
    return
  }

  if (!prevTopScore || score > prevTopScore) {
    const formData = new FormData()
    formData.append("meta", meta)
    formData.append("score", String(score))
    fetch("/score", {
      method: "post",
      body: formData,
      headers: {
        ContentType: "multipart/form-data",
        Authorization: `User ${client.authStore.token}`,
      },
    }).then(() => {
      getLeaderboard(10)
    })
  }
}

window.logOut = function logOut() {
  client.authStore.clear()
  topScoreEl.innerText = 0
}

function handleUserChange() {
  if (client.authStore.token) {
    signinEl?.classList.add("hidden")
  } else {
    signinEl?.classList.remove("hidden")
  }
}

async function getTopScore() {
  // User top score
  const { items } = await client.records.getList("scores", 1, 1, {
    filter: `user = "${client.authStore.model?.id}"`,
  })
  if (topScoreEl) topScoreEl.innerText = items[0]?.score || 0
}

async function getLeaderboard(numResults = 10) {
  const { items: scores } = await client.records.getList(
    "scores",
    1,
    numResults,
    {
      sort: `-score`,
    }
  )
  if (leadersEl) leadersEl.innerHTML = renderLeaderboard({ scores })
}

async function init() {
  // Setup user state
  const removeListener = client.authStore.onChange(handleUserChange)
  handleUserChange()

  getTopScore()
  getLeaderboard()

  // Sign in buttons
  const authMethods = await client.users.listAuthMethods()
  authMethods.authProviders.forEach((provider) => {
    const authLink = `${provider.authUrl}${location.origin}/redirect.html`
    const link = document.createElement("a")
    link.classList.add("button")
    link.href = authLink
    link.innerText = `sign in with ${provider.name}`
    link.onclick = () => {
      localStorage.setItem("provider", JSON.stringify(provider))
    }
    signinEl?.append(link)
  })
}

// Run
init()
