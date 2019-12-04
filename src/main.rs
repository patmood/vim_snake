#[macro_use]
extern crate stdweb;

mod canvas;
mod direction;
mod snake;

use canvas::Canvas;
use direction::Direction;
use snake::Snake;

use stdweb::traits::*;
use stdweb::web::{event::KeyDownEvent, IEventTarget};

use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    stdweb::initialize();

    let canvas = Canvas::new("#wasm-snake", 20, 20);
    let snake = Rc::new(RefCell::new(Snake::new(20, 20)));

    snake.borrow().draw(&canvas);

    stdweb::web::document().add_event_listener({
        let snake = snake.clone();
        move |event: KeyDownEvent| match event.key().as_ref() {
            "ArrowUp" => snake.borrow_mut().change_direction(Direction::Up),
            "ArrowRight" => snake.borrow_mut().change_direction(Direction::Right),
            "ArrowDown" => snake.borrow_mut().change_direction(Direction::Down),
            "ArrowLeft" => snake.borrow_mut().change_direction(Direction::Left),
            _ => {}
        }
    });

    // Use request animation frame?
    fn game_loop(snake: Rc<RefCell<Snake>>, canvas: Rc<Canvas>, time: u32) {
        stdweb::web::set_timeout(
            move || {
                snake.borrow_mut().update();
                snake.borrow().draw(&canvas);
                game_loop(snake.clone(), canvas, time);
            },
            time,
        )
    }

    // Kick off the loop
    game_loop(snake, Rc::new(canvas), 100);

    stdweb::event_loop();
}
