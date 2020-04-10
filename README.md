# WASM Snake

Vim Snake written in Go and compiled to Web Assembly

## Development

Build on changes `fswatch -o ./main.go | xargs -n1 -I{} make`

## TODO

[] Different color head
[] Dont spawn food on snake
[] Show "i" to eat food when running over food

## Notes

Useful references:

- https://marianogappa.github.io/software/2020/04/01/webassembly-tinygo-cheesse/
- https://github.com/olso/go-wasm-cat-game-on-canvas-with-docker
