package main

// This calls a JS function from Go.
func main() {
	println("Hello from go") // expecting 5
}

// This function is exported to JavaScript, so can be called using
// exports.multiply() in JavaScript.
//go:export multiply
func multiply(x, y int) int {
	return x * y
}
