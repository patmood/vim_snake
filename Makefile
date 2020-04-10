#!make
include .env
export
# @tinygo build -o ./static/main.wasm -target wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
# https://github.com/tinygo-org/tinygo/issues/1045
build:
	@echo "[go] building..."
	@go build -o ./static/main.wasm -ldflags "-X main.ScoreSecret=$(SCORE_SECRET)"  ./src/go/main.go
	@echo "[go] done"
