package main

import (
	"syscall/js"
)

type Direction int
type gameState struct {
	snake []point
	dir   Direction
}
type point struct{ x, y int }

// Enum of directions
const (
	Up Direction = iota + 1
	Right
	Down
	Left
)

const cellSize int = 10
const canvasSize int = 50
const primaryColor string = "#00CC00"

var (
	gameWidth                                 = cellSize * canvasSize
	gameHeight                                = cellSize * canvasSize
	canvasCtx                                 js.Value
	window, doc, body, canvas, laserCtx, beep js.Value
	windowSize                                struct{ w, h float64 }
)

func main() {
	runGameForever := make(chan bool)

	var gs = gameState{snake: make([]point, 0), dir: Right}

	setup(&gs)

	var renderer js.Func

	renderer = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		resetCanvas()
		updateGame(&gs)
		render(&gs)
		window.Call("requestAnimationFrame", renderer)
		return nil
	})

	window.Call("requestAnimationFrame", renderer)

	<-runGameForever
}

func updateGame(gs *gameState) {
	// Append new head to snake based on direction
	head := gs.snake[len(gs.snake)-1]
	var newHead point

	switch gs.dir {
	case Up:
		go log("up")
		newHead = point{x: head.x, y: head.y + 1}
	case Right:
		go log("right")
		newHead = point{x: head.x + 1, y: head.y}
	case Down:
		go log("down")
		newHead = point{x: head.x, y: head.y - 1}
	case Left:
		go log("left")
		newHead = point{x: head.x - 1, y: head.y}
	}

	gs.snake = append(gs.snake, newHead)
}

func render(gs *gameState) {
	// Draw snake
	for i := 0; i < len(gs.snake); i++ {
		go log("snakeX:", gs.snake[i].x, "snakeY:", gs.snake[i].y)
		paintCell(gs.snake[i].x, gs.snake[i].y, "yellow")
	}
}

func paintCell(x int, y int, color string) {
	canvasCtx.Set("fillStyle", color)
	canvasCtx.Set("strokeStyle", color)
	canvasCtx.Call("fillRect", x*cellSize, y*cellSize, cellSize, cellSize)
	canvasCtx.Call("strokeRect", x*cellSize, y*cellSize, cellSize, cellSize)
}

func setup(gs *gameState) {
	window = js.Global()
	doc = window.Get("document")
	body = doc.Get("body")

	canvas = doc.Call("createElement", "canvas")
	canvas.Set("height", gameHeight)
	canvas.Set("width", gameWidth)
	canvas.Set("style", "border: 1px solid green")

	// paint the canvas
	canvasCtx = canvas.Call("getContext", "2d")
	resetCanvas()

	// Init snake
	gs.snake = make([]point, 0)
	gs.snake = append(gs.snake, point{0, 10})

	body.Call("appendChild", canvas)

	// http://www.iandevlin.com/blog/2012/09/html5/html5-media-and-data-uri/
	beep = window.Get("Audio").New("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjI1LjEwMQAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAAA3YAlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaW8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw////////////////////////////////////////////AAAAAExhdmYAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAN2UrY2LgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/jYMQAEvgiwl9DAAAAO1ALSi19XgYG7wIAAAJOD5R0HygIAmD5+sEHLB94gBAEP8vKAgGP/BwMf+D4Pgh/DAPg+D5//y4f///8QBhMQBgEAfB8HwfAgIAgAHAGCFAj1fYUCZyIbThYFExkefOCo8Y7JxiQ0mGVaHKwwGCtGCUkY9OCugoFQwDKqmHQiUCxRAKOh4MjJFAnTkq6QqFGavRpYUCmMxpZnGXJa0xiJcTGZb1gJjwOJDJgoUJG5QQuDAsypiumkp5TUjrOobR2liwoGBf/X1nChmipnKVtSmMNQDGitG1fT/JhR+gYdCvy36lTrxCVV8Paaz1otLndT2fZuOMp3VpatmVR3LePP/8bSQpmhQZECqWsFeJxoepX9dbfHS13/////aysppUblm//8t7p2Ez7xKD/42DE4E5z9pr/nNkRw6bhdiCAZVVSktxunhxhH//4xF+bn4//6//3jEvylMM2K9XmWSn3ah1L2MqVIjmNlJtpQux1n3ajA0ZnFSu5EpX////uGatn///////1r/pYabq0mKT//TRyTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MQxNIAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==")
}

func resetCanvas() {
	canvasCtx.Call("clearRect", 0, 0, gameWidth, gameHeight)
	canvasCtx.Set("fillStyle", "black")
	canvasCtx.Set("strokeStyle", primaryColor)
	canvasCtx.Call("fillRect", 0, 0, gameWidth, gameHeight)
	canvasCtx.Call("strokeRect", 0, 0, gameWidth, gameHeight)
}

// basically a rest+spread from javascript
// ...interface{} is more or less `any` from Typescript
func log(args ...interface{}) {
	window.Get("console").Call("log", args...)
}
