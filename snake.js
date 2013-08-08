$(document).ready(function(){

  // Canvas setup
  var canvas = $("#canvas")[0]
  var ctx = canvas.getContext("2d")
  var w = $("#canvas").width()
  var h = $("#canvas").height()


  var cw = 10  //cell width
  var d  //direction
  var food
  var score = 0
  var snake_array

  function init(){
    d = "right"  //default direction
    score = 0
    create_snake()
    create_food()

    if (typeof game_loop != "undefined") clearInterval(game_loop)
    // call the paint function every 60ms
    game_loop = setInterval(paint, 60)

  }

  init()

  function create_snake(){
    var length = 5
    snake_array = []
    for(var i=length-1;i>=0; i--){
      snake_array.push({x: i, y: 0})
    }
  }

  function create_food(){
    food = {
      x: Math.round(Math.random()*(w-cw)/cw),
      y: Math.round(Math.random()*(h-cw)/cw)
    }
  }


  // paint the snake
  function paint(){

    $('#score').html(score)

    // paint the GB on every frame
    // paint the canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,w,h)
    ctx.strokeStyle = "black"
    ctx.strokeRect(0,0,w,h)

    // this is the head of snake
    var nx = snake_array[0].x
    var ny = snake_array[0].y

    // increment to get new head position and find direction
    if (d=="right") nx++
    else if (d=="left") nx--
    else if (d=="up") ny++
    else if (d=="down") ny--

    if (check_collision(nx,ny,snake_array)){
      init() //resart game
      return
    }

    // Logic to make snake eat food
    // if head position is same as food create new head instead of moving tail
    if(nx == food.x && ny == food.y){
      var tail = {x: nx, y: ny}
      score++
      create_food()
    } else {
      // move the tail cell in front of the head
      var tail = snake_array.pop()  //take last cell
      tail = {x: nx, y: ny}  //give cell new position
    }
    snake_array.unshift(tail) //add tail as first cell



    for(var i=0; i<snake_array.length; i++){
      var c = snake_array[i]
      // paint snake cells
      paint_cell(c.x,c.y,"#2ecc71")
    }

    paint_cell(food.x, food.y, "#f1c40f")
  }

  // paint cells
  function paint_cell(x,y,color){
    color = color || "#e74c3c"
    // paint food cells
    ctx.fillStyle = color
    ctx.fillRect(x*cw,y*cw,cw,cw)
    ctx.strokeStyle = "white"
    ctx.strokeRect(x*cw, y*cw,cw,cw)
  }

  function check_collision(x,y,array){
    // wall collision detection
    if (x <= -1 || x >= w/cw|| y <= -1 || y >= h/cw){
      return true
    } else {
      // check body collision
      for (var i = 0; i < array.length; i++){
        if(x == array[i].x && y == array[i].y){
          return true
        }
      }
      return false
    }
  }

  // keyboard controls
  $(document).keydown(function(e){
    var key = e.which
    if(key == "37" && d != "right") d = "left"
    else if (key == "38" && d != "up") d = "down"
    else if (key == "39" && d != "left") d = "right"
    else if (key == "40" && d != "down") d = "up"

  })

})
