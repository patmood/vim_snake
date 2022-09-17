#!make
include .env
export
# @go build -o ./dist/main.wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
# If switching to tinygo, use tinygo/targets/wasm_exec.js to run the wasm file
# @tinygo build -o ./dist/main.wasm -target wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
# https://github.com/tinygo-org/tinygo/issues/1045
build:
	@echo "[go] building..."
	@go build -o ./dist/main.wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
	@echo "[go] done"
