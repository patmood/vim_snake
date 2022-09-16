export async function wasmLoader(wasmUrl) {
  if (!WebAssembly.instantiateStreaming) {
    // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
      const source = await (await resp).arrayBuffer()
      return await WebAssembly.instantiate(source, importObject)
    }
  }

  // Provided by wasm_exec.js
  const go = new Go()
  let mod, inst
  const result = await WebAssembly.instantiateStreaming(
    fetch(wasmUrl),
    go.importObject
  )
  mod = result.module
  inst = result.instance

  return go.run(inst)
}
