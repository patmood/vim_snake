use crate::canvas::Canvas;
use crate::direction::Direction;
use stdweb::unstable::TryInto;

#[derive(Debug, Copy, Clone, Eq, PartialEq)]
struct Block(u32, u32);

#[derive(Debug)]
pub struct Snake {
  head: Block,
  tail: Vec<Block>,
  food: Block,
  height: u32,
  width: u32,
  direction: Option<Direction>,
  next_direction: Option<Direction>,
  last_direction: Direction,
}

fn rand_int(max: u32) -> u32 {
  (js! {return Math.floor(Math.random() * @{max})})
    .try_into()
    .unwrap()
}

impl Snake {
  pub fn new(width: u32, height: u32) -> Snake {
    let head_x: u32 = rand_int(width);
    let head_y: u32 = rand_int(height);
    let head = Block(head_x, head_y);

    let food_x: u32 = rand_int(width);
    let food_y: u32 = rand_int(height);
    let food = Block(food_x, food_y);
    let tail = Vec::new();

    Snake {
      head,
      tail,
      food,
      height,
      width,
      direction: None,
      next_direction: None,
      last_direction: Direction::Right,
    }
  }

  pub fn change_direction(&mut self, direction: Direction) {
    if !self.last_direction.opposite(direction) && self.direction.is_none() {
      self.direction = Some(direction)
    } else if self.direction.iter().any(|d| !d.opposite(direction)) {
      self.next_direction = Some(direction)
    }
  }

  pub fn update(&mut self) {
    let direction = self.direction.unwrap_or(self.last_direction);
    self.last_direction = direction;

    let new_head = match direction {
      Direction::Up => Block(
        self.head.0 % self.width,
        self.head.1.checked_sub(1).unwrap_or(self.height - 1) % self.height,
      ),
      Direction::Right => Block((self.head.0 + 1) % self.width, (self.head.1) % self.height),
      Direction::Down => Block((self.head.0) % self.width, (self.head.1 + 1) % self.height),
      Direction::Left => Block(
        self.head.0.checked_sub(1).unwrap_or(self.width - 1) % self.width,
        (self.head.1) % self.height,
      ),
    };

    self.tail.insert(0, self.head);

    // Has the snake run into it's tail?
    if self.tail.contains(&new_head) {
      *self = Snake::new(self.width, self.height);
    }

    // Eat food
    self.head = new_head;
    if self.head == self.food {
      while self.food == self.head || self.tail.contains(&self.food) {
        // Create a new random food block and make sure it's not within the snake
        let food_x: u32 = rand_int(self.width);
        let food_y: u32 = rand_int(self.height);
        self.food = Block(food_x, food_y);
      }
    } else {
      // Pop the tail if we didnt eat food (most of the time)
      let _last_end = self.tail.pop();
    }

    self.direction = self.next_direction.take();
  }

  pub fn draw(&self, canvas: &Canvas) {
    canvas.clear_all();
    canvas.draw(self.head.0, self.head.1, "#00cc00");
    for &Block(x, y) in &self.tail {
      canvas.draw(x, y, "#00cc00");
    }
    canvas.draw(self.food.0, self.food.1, "#f1c40f");
  }
}
