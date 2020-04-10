build:
	@echo "[go] building..."
	@tinygo build -o ./static/main.wasm -target wasm ./src/go/main.go
	@echo "[go] done"
