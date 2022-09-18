# WASM Snake

Vim Snake 2.0 is written in Go and compiled to Web Assembly.

I originally built this site in 2013 using my extremely limited knowledge of javascript and ruby/sinatra. It was trivial to cheat and so the leaderboard was meaningless. This rewrite fixes those issues and taught me a bunch about new web technologies.

## Development

### Run the server

`go run cmd/main.go serve`

### Front end

Create a .env file with environment variables shown in .env_example

`yarn build` single build or `yarn start`for development

### WASM Code

`make` to build (also watched and built by `yarn start`)

### Firebase functions

Set environment vars:

`firebase functions:config:set score.secret="same secret as in .env"`

`cd functions` then `yarn deploy` to deploy

## TODO

- Add `ctrl + [` keybinding for insert mode
- Show "i" to eat food when running over food
