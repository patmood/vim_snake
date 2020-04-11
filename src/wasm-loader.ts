import { Go } from './wasm-exec-go'

export async function wasmLoader(wasmUrl) {
  const go = new Go() // Defined in wasm_exec.js
  var wasm

  if ('instantiateStreaming' in WebAssembly) {
    WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject).then(function (obj) {
      wasm = obj.instance
      go.run(wasm)
    })
  } else {
    fetch(wasmUrl)
      .then((resp) => resp.arrayBuffer())
      .then((bytes) =>
        WebAssembly.instantiate(bytes, go.importObject).then(function (obj) {
          wasm = obj.instance
          go.run(wasm)
        })
      )
  }
}
