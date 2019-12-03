#[derive(Debug, PartialEq, Copy, Clone)]
pub enum Direction {
  Up,
  Right,
  Down,
  Left,
}

impl Direction {
  // Prevent the snake from going in the opposite direction
  pub fn opposite(self, other: Direction) -> bool {
    self == Direction::Up && other == Direction::Down
      || self == Direction::Right && other == Direction::Left
      || self == Direction::Down && other == Direction::Up
      || self == Direction::Left && other == Direction::Right
  }
}
