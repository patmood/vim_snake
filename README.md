# WASM Snake

Vim Snake 2.0 is written in Go and compiled to Web Assembly.

I originally built this site in 2013 using my extremely limited knowledge of javascript and ruby/sinatra. It was trivial to cheat and so the leaderboard was meaningless. This rewrite fixes those issues and taught me a bunch about new web technologies.

## Development

### Run the server

`go run cmd/main.go serve`

### Front end

Create a .env file with environment variables shown in .env_example

`yarn build` single build or `yarn start`for development

NOTE: wasm_exec.js needs to be from the specific go version

### WASM Code

`make` to build (also watched and built by `yarn start`)

### Docker

Build `docker build . -t vimsnake:latest --build-arg ARCH=arm64`

Run `docker run -p 3000:8090 --rm -it vimsnake`

Inspect `docker run --rm -it -p 3000:8090 --entrypoint sh vimsnake:latest`

## TODO

- Get prod front end working
- Get twitter and github working in prod
- Script to import old scores
- Consolidate go modules
