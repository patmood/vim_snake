#!make
include .env
export
# @go build -o ./dist/main.wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
# If switching to tinygo, use tinygo/targets/wasm_exec.js to run the wasm file
# @tinygo build -o ./dist/main.wasm -target wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
# https://github.com/tinygo-org/tinygo/issues/1045
build:
	@echo "[go] building..."
	@GOOS=js GOARCH=wasm go build -o ./src/main.wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
	@cp ./src/main.wasm ./pb_public/main.wasm
	@echo "[go] done"
