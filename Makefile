say_hello:
	@echo "building..."
	@tinygo build -o ./static/main.wasm -target wasm ./main.go
	@echo "done"
