package main

import (
	"math/rand"
	"strconv"
	"syscall/js"
	"time"
)

type gameState struct {
	snake      []point
	dir        Direction
	pendingDir Direction
	insertMode bool
	food       point
	score      int
}
type point struct{ x, y int }

// Enum of directions
type Direction int

const (
	Up Direction = iota + 1
	Right
	Down
	Left
)

const cellSize int = 10
const canvasSize int = 50
const scoreStep int = 125
const gameSpeed int = 100
const primaryColor string = "#00CC00"
const headColor string = "#00a400"

// Filled by build flag
var ScoreSecret string

var (
	gameWidth                           = cellSize * canvasSize
	gameHeight                          = cellSize * canvasSize
	canvasCtx                           js.Value
	window, doc, canvas, laserCtx, beep js.Value
	windowSize                          struct{ w, h float64 }
	randomInstance                      *rand.Rand
)

func main() {
	runGameForever := make(chan bool)

	s1 := rand.NewSource(time.Now().UnixNano())
	randomInstance = rand.New(s1)

	var gs = gameState{
		snake:      make([]point, 0),
		dir:        Right,
		pendingDir: Right,
		insertMode: false,
		food:       point{x: randomInstance.Intn(canvasSize), y: randomInstance.Intn(canvasSize)},
		score:      0,
	}

	setup(&gs)

	var renderer js.Func

	renderer = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		updateGame(&gs)
		render(&gs)
		return nil
	})

	window.Call("setInterval", renderer, gameSpeed)

	<-runGameForever
}

func updateGame(gs *gameState) {
	// Append new head to snake based on direction
	head := gs.snake[len(gs.snake)-1]
	var newHead point

	gs.dir = gs.pendingDir
	switch gs.dir {
	case Up:
		if head.y-1 < 0 {
			newHead = point{x: head.x, y: canvasSize - 1}
		} else {
			newHead = point{x: head.x, y: head.y - 1}
		}
	case Right:
		if head.x+1 >= canvasSize {
			newHead = point{x: 0, y: head.y}
		} else {
			newHead = point{x: head.x + 1, y: head.y}
		}
	case Down:
		if head.y+1 >= canvasSize {
			newHead = point{x: head.x, y: 0}
		} else {
			newHead = point{x: head.x, y: head.y + 1}
		}
	case Left:
		if head.x-1 < 0 {
			newHead = point{x: canvasSize - 1, y: head.y}
		} else {
			newHead = point{x: head.x - 1, y: head.y}
		}
	}

	// Check colisions with tail
	for i := 0; i < len(gs.snake); i++ {
		if gs.snake[i].x == newHead.x && gs.snake[i].y == newHead.y {
			// Game over man, game over.
			saveScore(gs)
			resetGame(gs)
			return
		}
	}

	gs.snake = append(gs.snake, newHead)

	// Check for food
	if gs.insertMode && newHead.x == gs.food.x && newHead.y == gs.food.y {
		gs.score = gs.score + scoreStep
		spawnFood(gs)

		window.Call("setScore", gs.score)
	} else {
		// Remove tail (first element) if no food
		gs.snake = gs.snake[1:]
	}
}

func saveScore(gs *gameState) {
	gameImage := canvas.Call("toDataURL")
	encScore := xor("000000"+strconv.Itoa(gs.score), ScoreSecret)
	window.Call("saveScore", gameImage, encScore)
}

func spawnFood(gs *gameState) {
	var newFood point
	inSnake := true

	for inSnake {
		newFood = point{x: randomInstance.Intn(canvasSize), y: randomInstance.Intn(canvasSize)}
		inSnake = isPointInSnake(gs.snake, newFood)
	}

	gs.food = newFood

}

func isPointInSnake(snake []point, p point) bool {
	for _, snakeCell := range snake {
		if snakeCell.x == p.x && snakeCell.y == p.y {
			return true
		}
	}
	return false
}

func render(gs *gameState) {
	resetCanvas()

	// Draw food
	paintCell(gs.food.x, gs.food.y, "yellow")

	// Draw snake
	for i := 0; i < len(gs.snake); i++ {
		if i == len(gs.snake)-1 {
			paintCell(gs.snake[i].x, gs.snake[i].y, headColor)
		} else {
			paintCell(gs.snake[i].x, gs.snake[i].y, primaryColor)
		}
	}

	// Draw insert mode text
	if gs.insertMode {
		canvasCtx.Set("fillStyle", "white")
		canvasCtx.Call("fillText", "-- INSERT --", 10, canvasSize*cellSize-10)
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
	container := doc.Call("getElementById", "game")

	canvas = doc.Call("createElement", "canvas")
	canvas.Set("height", gameHeight)
	canvas.Set("width", gameWidth)
	canvas.Set("style", "border: 1px solid green")

	// paint the canvas
	canvasCtx = canvas.Call("getContext", "2d")
	resetCanvas()
	resetGame(gs)

	// Key event handlers
	keydownEventHandler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		key := args[0].Get("key").String()
		updateDirection(gs, key)
		return nil
	})
	window.Call("addEventListener", "keydown", keydownEventHandler)

	container.Call("appendChild", canvas)

	// http://www.iandevlin.com/blog/2012/09/html5/html5-media-and-data-uri/
	beep = window.Get("Audio").New("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjI1LjEwMQAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAAA3YAlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaW8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw////////////////////////////////////////////AAAAAExhdmYAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAN2UrY2LgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/jYMQAEvgiwl9DAAAAO1ALSi19XgYG7wIAAAJOD5R0HygIAmD5+sEHLB94gBAEP8vKAgGP/BwMf+D4Pgh/DAPg+D5//y4f///8QBhMQBgEAfB8HwfAgIAgAHAGCFAj1fYUCZyIbThYFExkefOCo8Y7JxiQ0mGVaHKwwGCtGCUkY9OCugoFQwDKqmHQiUCxRAKOh4MjJFAnTkq6QqFGavRpYUCmMxpZnGXJa0xiJcTGZb1gJjwOJDJgoUJG5QQuDAsypiumkp5TUjrOobR2liwoGBf/X1nChmipnKVtSmMNQDGitG1fT/JhR+gYdCvy36lTrxCVV8Paaz1otLndT2fZuOMp3VpatmVR3LePP/8bSQpmhQZECqWsFeJxoepX9dbfHS13/////aysppUblm//8t7p2Ez7xKD/42DE4E5z9pr/nNkRw6bhdiCAZVVSktxunhxhH//4xF+bn4//6//3jEvylMM2K9XmWSn3ah1L2MqVIjmNlJtpQux1n3ajA0ZnFSu5EpX////uGatn///////1r/pYabq0mKT//TRyTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MQxNIAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==")
}

func updateDirection(gs *gameState, key string) {
	switch key {
	case "i":
		gs.insertMode = true
	case "Escape":
		gs.insertMode = false
	case "k":
		if gs.dir != Down && !gs.insertMode {
			gs.pendingDir = Up
		}
	case "l":
		if gs.dir != Left && !gs.insertMode {
			gs.pendingDir = Right
		}
	case "j":
		if gs.dir != Up && !gs.insertMode {
			gs.pendingDir = Down
		}
	case "h":
		if gs.dir != Right && !gs.insertMode {
			gs.pendingDir = Left
		}
	}
}

func resetCanvas() {
	canvasCtx.Call("clearRect", 0, 0, gameWidth, gameHeight)
	canvasCtx.Set("fillStyle", "black")
	canvasCtx.Set("strokeStyle", primaryColor)
	canvasCtx.Call("fillRect", 0, 0, gameWidth, gameHeight)
	canvasCtx.Call("strokeRect", 0, 0, gameWidth, gameHeight)
	canvasCtx.Set("font", "14px monospace")
}

func resetGame(gs *gameState) {
	resetCanvas()
	startY := canvasSize / 2
	// Init snake
	gs.snake = make([]point, 0)
	gs.snake = append(gs.snake, point{0, startY})
	gs.snake = append(gs.snake, point{1, startY})
	gs.snake = append(gs.snake, point{2, startY})
	gs.snake = append(gs.snake, point{3, startY})

	gs.food = point{x: randomInstance.Intn(canvasSize), y: randomInstance.Intn(canvasSize)}
	gs.score = 0
	gs.dir = Right
	gs.pendingDir = Right
	gs.insertMode = false
	window.Call("setScore", gs.score)
}

// basically a rest+spread from javascript
// ...interface{} is more or less `any` from Typescript
func log(args ...interface{}) {
	window.Get("console").Call("log", args...)
}

// Simple encryption
func xor(input, key string) (output string) {
	for i := 0; i < len(input); i++ {
		output += string(input[i] ^ key[i%len(key)])
	}

	return output
}
