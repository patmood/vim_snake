import { wasmLoader } from './wasm-loader'

const WASM_URL = 'main.wasm'

wasmLoader(WASM_URL)

const scoreEl = document.getElementById('score')
// Expose functions to call from Go
window.setScore = function setScore(score: string) {
  scoreEl.innerText = score
}
