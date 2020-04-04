package main

import (
	"syscall/js"
)

var c chan bool

func init() {
	c = make(chan bool)
}

func printMessage(inputs []js.Value) {
	callback := inputs[len(inputs)-1:][0]
	message := inputs[0].String()

	callback.Invoke(js.Null(), "Did you say "+message)
}

func main() {
	js.Global().Set("printMessage", js.FuncOf(printMessage))
	<-c
	println("Done with main")
}
