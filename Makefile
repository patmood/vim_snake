build:
	@echo "[go] building..."
	@tinygo build -o ./dist/main.wasm -target wasm ./src/go/main.go
	@echo "[go] done"
